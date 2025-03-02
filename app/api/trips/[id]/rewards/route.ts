import { NextResponse, NextRequest } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

// GET /api/trips/[id]/rewards - Get rewards for a specific trip
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    
    if (!id) {
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 })
    }
    
    const storage = getStorageProvider()
    
    // First check if the trip exists
    const trip = await storage.getTripById(id)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }
    
    // Get rewards for the trip
    const rewards = await storage.getRewardsForTrip(id)
    
    return NextResponse.json({
      tripId: id,
      rewards,
      // Include some trip info for reference
      vehicleVin: trip.vehicleVin,
      startTime: trip.startTime,
      endTime: trip.endTime,
      distance: trip.distance,
      score: trip.score.total
    })
  } catch (error) {
    console.error("Error fetching trip rewards:", error)
    return NextResponse.json(
      { error: "Failed to fetch trip rewards" },
      { status: 500 }
    )
  }
}
