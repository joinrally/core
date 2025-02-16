import { NextResponse } from "next/server"
import type { AggregatedMetrics } from "@/app/dashboard/types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const metrics: AggregatedMetrics = {
    totalTrips: 42,
    totalDistance: 1250,
    totalEnergyUsed: 300,
    totalRewards: 25.5,
    averageScore: 85.5,
    averageSpeed: 45.2,
    averageEnergyEfficiency: 240,
  }

  return NextResponse.json(metrics)
}

