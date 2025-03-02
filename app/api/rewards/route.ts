import { NextResponse } from "next/server"
import { getStorageProvider } from "@/src/utils/storage"

// GET /api/rewards - Get all rewards for all vehicles in a specific date range
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startTime = searchParams.get("startTime")
  const endTime = searchParams.get("endTime")
  const vehicleVin = searchParams.get("vehicleVin")

  const storage = getStorageProvider()
  
  try {
    // If vehicleVin is provided, get rewards for that specific vehicle
    if (vehicleVin) {
      const rewards = await storage.getRewardsForVehicle(vehicleVin, startTime || undefined, endTime || undefined)
      return NextResponse.json({ vehicleVin, rewards })
    }
    
    // Otherwise, get rewards for all vehicles
    const allRewards = await storage.getAllRewards(startTime || undefined, endTime || undefined)
    
    // Calculate total rewards
    const totalRewards = allRewards.reduce((sum, item) => sum + item.rewards, 0)
    
    return NextResponse.json({
      rewards: allRewards,
      totalRewards
    })
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    )
  }
}
