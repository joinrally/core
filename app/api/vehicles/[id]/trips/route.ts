import { NextResponse } from "next/server"
import type { Trip } from "@/app/dashboard/types"

function generateMockTrip(vehicleId: string, index: number): Trip {
  const startTime = new Date()
  startTime.setHours(startTime.getHours() - index * 2)
  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + 45)

  const metrics = Array.from({ length: 45 }, (_, i) => ({
    speed: 30 + Math.sin(i / 5) * 20 + Math.random() * 5,
    packVoltage: 380 + Math.random() * 20,
    packCurrent: Math.sin(i / 10) * 200 + Math.random() * 20,
    acceleration: Math.sin(i / 8) * 0.2,
    brakePedal: Math.max(0, Math.sin(i / 7) * 0.5 + Math.random() * 0.2),
    timestamp: new Date(startTime.getTime() + i * 60000).toISOString(),
  }))

  return {
    id: `trip-${vehicleId}-${index}`,
    vehicleId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    metrics,
    score: {
      energyScore: 75 + Math.random() * 20,
      safetyScore: 80 + Math.random() * 15,
      usageScore: 85 + Math.random() * 10,
      total: 80 + Math.random() * 15,
      timestamp: endTime.toISOString(),
    },
    distance: 25 + Math.random() * 10,
    energyUsed: 6 + Math.random() * 2,
    rewards: 0.5 + Math.random() * 0.5,
    isActive: index === 0,
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const trips = Array.from({ length: 10 }, (_, i) => generateMockTrip(params.id, i))
  return NextResponse.json(trips)
}

