import { NextResponse } from "next/server"
import { getAggregatedMetricsForVehicle } from "@/src/utils/storage"
import { createTelemetryClient } from "@/src/utils/telemetry_client"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const vin = params.id
    const metrics = await request.json()
    
    const client = createTelemetryClient()
    const result = await client.submitTelemetry(
      vin,
      metrics.latitude,
      metrics.longitude,
      metrics.batteryLevel,
      metrics.chargingStatus,
      metrics.estimatedRange
    )

    return NextResponse.json(result)

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
    const client = createTelemetryClient()
    const telemetry = await client.getTelemetry(vin)

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
