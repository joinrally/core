"use client"

import { useState, useEffect } from "react"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Loader2 } from "lucide-react"
import { subDays, format, addDays } from "date-fns"

interface VehicleReward {
  vehicleVin: string
  rewards: number
  vehicleName?: string
  vehicleMake?: string
  vehicleModel?: string
}

export default function VehicleRewards() {
  const [rewardsData, setRewardsData] = useState<VehicleReward[]>([])
  const [currentPeriod, setCurrentPeriod] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRewardsData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Calculate the date range for the current period
      const endDate = subDays(new Date(), currentPeriod * 7)
      const startDate = subDays(endDate, 6)
      
      // Format dates for API call
      const startTime = startDate.toISOString()
      const endTime = addDays(endDate, 1).toISOString() // Include the entire end day
      
      // Fetch rewards data and vehicles data
      const [rewardsResponse, vehiclesResponse] = await Promise.all([
        fetch(`/api/rewards?startTime=${startTime}&endTime=${endTime}`),
        fetch('/api/vehicles')
      ])
      
      if (!rewardsResponse.ok) {
        throw new Error(`Rewards API error: ${rewardsResponse.status}`)
      }
      
      if (!vehiclesResponse.ok) {
        throw new Error(`Vehicles API error: ${vehiclesResponse.status}`)
      }
      
      const rewardsData = await rewardsResponse.json()
      const vehicles = await vehiclesResponse.json()
      
      // Map vehicle details to rewards data
      const vehicleRewards = rewardsData.rewards.map((reward: VehicleReward) => {
        const vehicle = vehicles.find((v: any) => v.vin === reward.vehicleVin)
        if (vehicle) {
          return {
            ...reward,
            vehicleName: vehicle.name,
            vehicleMake: vehicle.make,
            vehicleModel: vehicle.model
          }
        }
        return reward
      })
      
      // Sort by highest rewards first
      vehicleRewards.sort((a: VehicleReward, b: VehicleReward) => b.rewards - a.rewards)
      
      setRewardsData(vehicleRewards)
    } catch (err) {
      console.error('Error fetching vehicle rewards:', err)
      setError(`Failed to load vehicle rewards data: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setRewardsData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRewardsData()
  }, [currentPeriod])

  const handlePeriodChange = (direction: "prev" | "next") => {
    setCurrentPeriod((prev) => (direction === "prev" ? prev + 1 : Math.max(0, prev - 1)))
  }

  const totalRewards = rewardsData.reduce((sum, data) => sum + data.rewards, 0)
  const totalUSD = totalRewards * 0.1 // Assuming 1 $RALLY = $0.10 USD

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-gugi text-rally-coral mb-4">Vehicle Rewards</h2>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => handlePeriodChange("prev")} variant="outline">
          Previous 7 days
        </Button>
        <span className="font-medium">
          {format(subDays(new Date(), 7 * currentPeriod + 6), "MMM dd")} -{" "}
          {format(subDays(new Date(), 7 * currentPeriod), "MMM dd")}
        </span>
        <Button onClick={() => handlePeriodChange("next")} variant="outline" disabled={currentPeriod === 0}>
          Next 7 days
        </Button>
      </div>
      
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rally-coral" />
          <span className="ml-2">Loading vehicle rewards data...</span>
        </div>
      ) : error ? (
        <div className="h-[300px] flex items-center justify-center text-destructive">
          {error}
        </div>
      ) : (
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead className="text-right">$RALLY Earned</TableHead>
                <TableHead className="text-right">USD Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewardsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No rewards data available</TableCell>
                </TableRow>
              ) : (
                rewardsData.map((reward) => (
                  <TableRow key={reward.vehicleVin}>
                    <TableCell>{reward.vehicleName || `Vehicle ${reward.vehicleVin}`}</TableCell>
                    <TableCell>{reward.vehicleMake} {reward.vehicleModel}</TableCell>
                    <TableCell className="text-right">{reward.rewards.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(reward.rewards * 0.1).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">
          Total Rewards: {totalRewards.toFixed(2)} $RALLY (${totalUSD.toFixed(2)} USD)
        </p>
      </div>
    </Card>
  )
}
