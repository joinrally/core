import { NextRequest, NextResponse } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"
import { createTelemetryClient } from "@/src/utils/telemetry_client"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params // The id parameter is now the VIN

    if (!id) {
      return NextResponse.json({ error: 'Vehicle VIN is required' }, { status: 400 })
    }

    // Try to get telemetry from blockchain, but don't let initialization errors block the request
    let telemetry = null
    try {
      const client = createTelemetryClient()
      telemetry = await client.getTelemetry(id)
    } catch (error) {
      // Log the error but continue with storage provider
      console.warn('Telemetry client unavailable:', error)
    }

    if (telemetry) {
      return NextResponse.json(telemetry)
    }

    // Get metrics from storage provider
    const storage = getStorageProvider()
    const aggregatedMetrics = await storage.getAggregatedMetricsForVehicle(id)

    if (!aggregatedMetrics) {
      return NextResponse.json(
        { error: "No metrics found for this vehicle" },
        { status: 404 }
      )
    }

    return NextResponse.json(aggregatedMetrics)
  } catch (error) {
    console.error('Error fetching vehicle metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle metrics' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const metrics = await request.json()
    
    try {
      const client = createTelemetryClient()
      const result = await client.submitTelemetry(
        id,
        metrics.latitude,
        metrics.longitude,
        metrics.batteryLevel,
        metrics.chargingStatus,
        metrics.estimatedRange
      )
      return NextResponse.json(result)
    } catch (error) {
      console.warn('Failed to submit telemetry to blockchain:', error)
      // Return success anyway since this is optional
      return NextResponse.json({ status: 'ok', source: 'mock' })
    }
  } catch (error) {
    console.error('Error processing metrics:', error)
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    )
  }
}
