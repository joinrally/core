import { NextResponse, NextRequest } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

// GET /api/vehicles/[id]/rewards - Get rewards for a specific vehicle in a date range
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params // This is now the VIN
    const { searchParams } = new URL(request.url)
    const startTime = searchParams.get("startTime")
    const endTime = searchParams.get("endTime")
    
    if (!id) {
      return NextResponse.json({ error: "Vehicle VIN is required" }, { status: 400 })
    }
    
    const storage = getStorageProvider()
    
    // First check if the vehicle exists
    const vehicles = await storage.getVehicles()
    const vehicle = vehicles.find(v => v.vin === id)
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }
    
    // Get rewards for the vehicle
    const rewards = await storage.getRewardsForVehicle(id, startTime || undefined, endTime || undefined)
    
    // Get trips for the vehicle to provide more detailed information
    const trips = await storage.getTripsForVehicle(id)
    
    return NextResponse.json({
      vehicleVin: id,
      rewards,
      tripCount: trips.length,
      totalDistance: trips.reduce((sum, trip) => sum + trip.distance, 0),
      startTime: startTime || undefined,
      endTime: endTime || undefined
    })
  } catch (error) {
    console.error("Error fetching vehicle rewards:", error)
    return NextResponse.json(
      { error: "Failed to fetch vehicle rewards" },
      { status: 500 }
    )
  }
}
