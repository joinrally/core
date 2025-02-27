import { NextResponse } from "next/server"
import { getAggregatedMetricsForVehicle } from "@/src/utils/storage"
import { Account, Aptos, AptosConfig, Network, Ed25519PrivateKey } from "@aptos-labs/ts-sdk"

// Configuration
const MODULE_ADDRESS = process.env.APTOS_MODULE_ADDRESS
const SUBMIT_TELEMETRY_FUNCTION = `${MODULE_ADDRESS}::vehicle_telemetry::submit_telemetry`
const GET_TELEMETRY_FUNCTION = `${MODULE_ADDRESS}::vehicle_telemetry::get_telemetry`

const config = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: 'https://aptos.testnet.porto.movementlabs.xyz/v1',
  faucet: 'https://fund.testnet.porto.movementlabs.xyz/',
})

// Helper function to convert decimal degrees to fixed-point representation
function convertToFixedPoint(degrees: number): { value: number, isNegative: boolean } {
  const SCALE_FACTOR = 10000000 // 10^7 as per contract
  const isNegative = degrees < 0
  const absoluteDegrees = Math.abs(degrees)
  const scaledValue = Math.round(absoluteDegrees * SCALE_FACTOR)
  return { value: scaledValue, isNegative }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const vin = params.id
    const metrics = await request.json()
    
    // Initialize Aptos client
    const aptos = new Aptos(config)

    // Create account from private key
    const privateKey = new Ed25519PrivateKey(process.env.APTOS_PRIVATE_KEY!)
    const account = Account.fromPrivateKey({ privateKey })
    const accountAddress = account.accountAddress

    // Convert latitude and longitude to contract format
    const latitude = convertToFixedPoint(metrics.latitude)
    const longitude = convertToFixedPoint(metrics.longitude)

    // Create message to sign (concatenate all relevant data)
    const messageData = new TextEncoder().encode(
      `${vin}${latitude.value}${latitude.isNegative}${longitude.value}${longitude.isNegative}` +
      `${metrics.batteryLevel}${metrics.chargingStatus}${metrics.estimatedRange}`
    )

    // Sign the message
    const signature = await privateKey.sign(messageData)

    // Build transaction payload for submitting telemetry
    const transaction = await aptos.transaction.build.simple({
      sender: accountAddress,
      data: {
        function: SUBMIT_TELEMETRY_FUNCTION,
        functionArguments: [
          vin,
          latitude.value,
          latitude.isNegative, // is_south in contract
          longitude.value,
          longitude.isNegative, // is_west in contract
          metrics.batteryLevel,
          metrics.chargingStatus,
          metrics.estimatedRange,
          signature,
          messageData // Original message that was signed
        ]
      },
    })

    // Sign and submit transaction
    const txSignature = aptos.transaction.sign({ 
      signer: account, 
      transaction 
    })

    const committedTxn = await aptos.transaction.submit.simple({
      transaction,
      senderAuthenticator: txSignature,
    })

    // Wait for transaction to be processed
    const response = await aptos.waitForTransaction({ 
      transactionHash: committedTxn.hash 
    })

    // Verify the data was written by reading it back
    const viewPayload = {
      function: GET_TELEMETRY_FUNCTION,
      functionArguments: [vin]
    }

    const storedTelemetry = await aptos.view({ payload: viewPayload })

    return NextResponse.json({
      success: true,
      transactionHash: committedTxn.hash,
      telemetry: storedTelemetry
    })

  } catch (error) {
    console.error('Error writing telemetry to blockchain:', error)
    return NextResponse.json(
      { error: 'Failed to write telemetry to blockchain' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const vin = params.id

  try {
    const aptos = new Aptos(config)

    const viewPayload = {
      function: GET_TELEMETRY_FUNCTION,
      functionArguments: [vin]
    }

    const telemetry = await aptos.view({ payload: viewPayload })

    if (!telemetry) {
      return NextResponse.json(
        { error: "No telemetry found for this VIN" },
        { status: 404 }
      )
    }

    return NextResponse.json(telemetry)
  } catch (error) {
    console.error('Error reading telemetry from blockchain:', error)
    const aggregatedMetrics = await getAggregatedMetricsForVehicle(vin)

    if (!aggregatedMetrics) {
      return NextResponse.json({ error: "No metrics found for this vehicle" }, { status: 404 })
    }

    return NextResponse.json(aggregatedMetrics)
  }
}
