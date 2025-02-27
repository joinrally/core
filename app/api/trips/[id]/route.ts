import { NextResponse, NextRequest } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

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
    const trip = await storage.getTripById(id)

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error("Error fetching trip:", error)
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    )
  }
}

