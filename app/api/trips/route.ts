import { NextResponse } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vin = searchParams.get("vin")

  const storage = getStorageProvider()
  
  if (vin) {
    const trips = await storage.getTripsForVehicle(vin)
    return NextResponse.json(trips)
  }

  // For now, get all trips by getting trips for all vehicles
  const vehicles = await storage.getVehicles()
  const allTrips = await Promise.all(
    vehicles.map(vehicle => storage.getTripsForVehicle(vehicle.vin))
  )
  
  return NextResponse.json(allTrips.flat())
}

