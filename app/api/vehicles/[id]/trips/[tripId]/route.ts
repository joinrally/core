import { NextRequest, NextResponse } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string; tripId: string }> }
) {
  try {
    const { id: vehicleVin, tripId } = await props.params
    
    const storage = getStorageProvider()
    const trip = await storage.getTripById(tripId)

    if (!trip || trip.vehicleVin !== vehicleVin) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error('Error fetching trip details:', error)
    return NextResponse.json(
      { error: "An error occurred while fetching trip details" },
      { status: 500 }
    )
  }
} 