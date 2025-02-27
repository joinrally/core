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
    // ... existing protobuf processing code ...
  }

  private findValue(data: any[], field: string): number {
    // ... existing helper method ...
  }

  private findLocationValue(data: any[], field: string): number {
    // ... existing helper method ...
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
