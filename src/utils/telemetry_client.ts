import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk"

// Configuration
const MODULE_ADDRESS = process.env.APTOS_MODULE_ADDRESS
const SUBMIT_TELEMETRY_FUNCTION = `${MODULE_ADDRESS}::vehicle_telemetry::submit_telemetry`
const GET_TELEMETRY_FUNCTION = `${MODULE_ADDRESS}::vehicle_telemetry::get_telemetry`

class TeslaTelemetryClient {
  private aptos: Aptos
  private account: Account

  constructor(config: AptosConfig, privateKeyString: string) {
    this.aptos = new Aptos(config)
    const privateKey = new Ed25519PrivateKey(privateKeyString)
    this.account = Account.fromPrivateKey({ privateKey })
  }

  // Helper function to convert decimal degrees to fixed-point representation
  private convertToFixedPoint(degrees: number): { value: number, isNegative: boolean } {
    const SCALE_FACTOR = 10000000 // 10^7 as per contract
    const isNegative = degrees < 0
    const absoluteDegrees = Math.abs(degrees)
    const scaledValue = Math.round(absoluteDegrees * SCALE_FACTOR)
    return { value: scaledValue, isNegative }
  }

  async submitTelemetry(
    vin: string,
    latitude: number,
    longitude: number,
    batteryLevel: number,
    chargingStatus: number,
    estimatedRange: number
  ) {
    try {
      // Convert coordinates to contract format
      const latitudeFixed = this.convertToFixedPoint(latitude)
      const longitudeFixed = this.convertToFixedPoint(longitude)

      // Create message to sign
      const messageData = new TextEncoder().encode(
        `${vin}${latitudeFixed.value}${latitudeFixed.isNegative}${longitudeFixed.value}${longitudeFixed.isNegative}` +
        `${batteryLevel}${chargingStatus}${estimatedRange}`
      )

      // Sign the message
      const signature = await this.account.privateKey.sign(messageData)

      // Build transaction
      const transaction = await this.aptos.transaction.build.simple({
        sender: this.account.accountAddress,
        data: {
          function: SUBMIT_TELEMETRY_FUNCTION,
          functionArguments: [
            vin,
            latitudeFixed.value,
            latitudeFixed.isNegative,
            longitudeFixed.value,
            longitudeFixed.isNegative,
            batteryLevel,
            chargingStatus,
            estimatedRange,
            signature,
            messageData
          ]
        },
      })

      // Sign and submit transaction
      const txSignature = this.aptos.transaction.sign({ 
        signer: this.account, 
        transaction 
      })

      const committedTxn = await this.aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator: txSignature,
      })

      // Wait for transaction
      await this.aptos.waitForTransaction({ 
        transactionHash: committedTxn.hash 
      })

      // Verify the data was written
      const storedTelemetry = await this.getTelemetry(vin)

      return {
        success: true,
        transactionHash: committedTxn.hash,
        telemetry: storedTelemetry
      }

    } catch (error) {
      console.error("Error submitting telemetry:", error)
      throw error
    }
  }

  async getTelemetry(vin: string) {
    try {
      const viewPayload = {
        function: GET_TELEMETRY_FUNCTION,
        functionArguments: [vin]
      }

      return await this.aptos.view({ payload: viewPayload })
    } catch (error) {
      console.error("Error getting telemetry:", error)
      throw error
    }
  }

  async processProtobufTelemetry(protobufData: Buffer) {
    try {
      // Assuming the protobuf data contains these fields in a structured format
      const decodedData = JSON.parse(protobufData.toString())
      
      const vin = decodedData.vin || ''
      const batteryLevel = this.findValue(decodedData.metrics, 'battery_level')
      const chargingStatus = this.findValue(decodedData.metrics, 'charging_status')
      const estimatedRange = this.findValue(decodedData.metrics, 'estimated_range')
      const latitude = this.findLocationValue(decodedData.location, 'latitude')
      const longitude = this.findLocationValue(decodedData.location, 'longitude')

      // Submit the processed telemetry data
      return await this.submitTelemetry(
        vin,
        latitude,
        longitude,
        batteryLevel,
        chargingStatus,
        estimatedRange
      )
    } catch (error) {
      console.error("Error processing protobuf telemetry:", error)
      throw error
    }
  }

  private findValue(data: any[], field: string): number {
    if (!Array.isArray(data)) return 0
    const metric = data.find(item => item.name === field)
    return metric ? Number(metric.value) : 0
  }

  private findLocationValue(data: any[], field: string): number {
    if (!Array.isArray(data)) return 0
    const coordinate = data.find(item => item.type === field)
    return coordinate ? Number(coordinate.value) : 0
  }
}

// Export a factory function to create the client
export function createTelemetryClient(network = Network.CUSTOM) {
  const config = new AptosConfig({
    network,
    fullnode: process.env.APTOS_NODE_URL || 'https://aptos.testnet.porto.movementlabs.xyz/v1',
    faucet: process.env.APTOS_FAUCET_URL || 'https://fund.testnet.porto.movementlabs.xyz/',
  })

  return new TeslaTelemetryClient(
    config,
    process.env.APTOS_PRIVATE_KEY!
  )
}

export { TeslaTelemetryClient }
