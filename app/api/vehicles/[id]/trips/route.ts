import { NextRequest, NextResponse } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params // Using VIN as identifier
    const searchParams = request.nextUrl.searchParams
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    if (!id) {
      return NextResponse.json({ error: 'Vehicle VIN is required' }, { status: 400 })
    }

    const storage = getStorageProvider()
    const trips = await storage.getTripsForVehicle(id)

    const paginatedTrips = trips.slice(offset, offset + limit)

    // Return empty array instead of 404 when no trips are found
    if (!paginatedTrips.length) {
      return NextResponse.json({ trips: [], pagination: { total: 0, offset, limit, hasMore: false } })
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
