import { NextResponse } from "next/server"
import { mockVehicles } from "@/lib/storage"

export async function GET() {
  return NextResponse.json(mockVehicles)
}

