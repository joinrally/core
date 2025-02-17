import { NextResponse } from "next/server"
import { mockVehicles } from "@/lib/mockData"

export async function GET() {
  return NextResponse.json(mockVehicles)
}

