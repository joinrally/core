import { NextResponse } from "next/server"
import { getAggregatedMetricsForVehicle } from "@/lib/mockData"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const vehicleId = params.id
  const aggregatedMetrics = await getAggregatedMetricsForVehicle(vehicleId)

  if (!aggregatedMetrics) {
    return NextResponse.json({ error: "No metrics found for this vehicle" }, { status: 404 })
  }

  return NextResponse.json(aggregatedMetrics)
}

