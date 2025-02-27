import { NextResponse } from "next/server"
import { getTripsForVehicle } from "@/src/utils/storage"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const vehicleId = params.id
  const trips = getTripsForVehicle(vehicleId)

  if (trips.length === 0) {
    return NextResponse.json({ error: "No trips found for this vehicle" }, { status: 404 })
  }

  return NextResponse.json(trips)
}

