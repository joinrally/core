import { NextRequest, NextResponse } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params
    const searchParams = request.nextUrl.searchParams
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const storage = getStorageProvider()
    const trips = await storage.getTripsForVehicle(id)

    const paginatedTrips = trips.slice(offset, offset + limit)

    if (!paginatedTrips.length) {
      return NextResponse.json({ message: 'No trips found' }, { status: 404 })
    }

    return NextResponse.json({
      trips: paginatedTrips,
      pagination: {
        total: trips.length,
        offset,
        limit,
        hasMore: offset + limit < trips.length
      }
    })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { error: "An error occurred while fetching trips" },
      { status: 500 }
    )
  }
}
