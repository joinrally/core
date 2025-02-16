import { NextResponse } from "next/server"
import type { Trip, Vehicle } from "@/app/dashboard/types"

const mockVehicles: Vehicle[] = [
  {
    id: "1",
    name: "My Tesla Model S",
    make: "Tesla",
    model: "Model S",
    year: 2022,
    vin: "5YJ3E1EA1LF123456",
    image: "/tesla-model-s.jpg",
  },
  {
    id: "2",
    name: "Family Model Y",
    make: "Tesla",
    model: "Model Y",
    year: 2023,
    vin: "5YJYGDEE1MF123456",
    image: "/tesla-model-y.jpg",
  },
  {
    id: "3",
    name: "Work Model 3",
    make: "Tesla",
    model: "Model 3",
    year: 2021,
    vin: "5YJ3E1EA1MF123456",
    image: "/tesla-model-3.jpg",
  },
]

function generateMockTrip(index: number): Trip {
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

  const vehicle = mockVehicles[Math.floor(Math.random() * mockVehicles.length)]

  return {
    id: `trip-${index}`,
    vehicleId: vehicle.id,
    vehicle: vehicle,
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

export async function GET() {
  const trips = Array.from({ length: 20 }, (_, i) => generateMockTrip(i))
  return NextResponse.json(trips)
}

