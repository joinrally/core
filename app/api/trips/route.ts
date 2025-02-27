import { NextResponse } from "next/server"
import { mockTrips } from "@/src/utils/storage"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const vin = searchParams.get("vin")

  const tripSummaries = mockTrips.map((trip) => trip.summary)

  if (vin) {
    const filteredTrips = tripSummaries.filter((trip) => trip.vehicle.vin === vin)
    return NextResponse.json(filteredTrips)
  }

  return NextResponse.json(tripSummaries)
}

