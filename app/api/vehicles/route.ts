import { NextResponse } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

export async function GET() {
  const storage = getStorageProvider()
  const vehicles = await storage.getVehicles()
  return NextResponse.json(vehicles)
}

