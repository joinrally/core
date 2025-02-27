import { NextResponse } from "next/server"
import { mockVehicles } from "@/src/utils/storage"

export async function GET() {
  return NextResponse.json(mockVehicles)
}

