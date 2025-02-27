import { NextResponse } from "next/server"
import { getTripsForVehicle } from "@/src/utils/storage"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const trips = await prisma.trip.findMany({
      where: {
        vehicleId: params.id,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(trips);
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

