import { NextResponse, NextRequest } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

// GET /api/vehicles/[id] - Get a specific vehicle by VIN
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params // This is now the VIN
    
    if (!id) {
      return NextResponse.json({ error: "Vehicle VIN is required" }, { status: 400 })
    }
    
    const storage = getStorageProvider()
    
    // Get the vehicle by VIN
    const vehicle = await storage.getVehicleByVin(id)
    
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }
    
    return NextResponse.json(vehicle)
  } catch (error) {
    console.error("Error fetching vehicle:", error)
    return NextResponse.json(
      { error: "Failed to fetch vehicle details" },
      { status: 500 }
    )
  }
}
