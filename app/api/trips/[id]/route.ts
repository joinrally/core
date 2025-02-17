import { NextResponse } from "next/server"
import { getTripById } from "@/lib/mockData"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tripId = params.id
  const trip = await getTripById(tripId)

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  }

  return NextResponse.json(trip)
}

