"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Loader2, Coins, TrendingUp, Award, Shield, Zap } from "lucide-react"
import type { Trip } from "@/src/utils/types"

interface RewardsBreakdown {
  energyEfficiency: number
  safetyScore: number
  distanceBonus: number
  completionBonus: number
  total: number
}

interface TripRewardsProps {
  tripId: string
}

export default function TripRewards({ tripId }: TripRewardsProps) {
  const [rewardsData, setRewardsData] = useState<RewardsBreakdown | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTripRewards() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/trips/${tripId}/rewards`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rewards: ${response.status}`)
        }
        
        const data = await response.json()

        // Create breakdown based on the trip reward factors
        const energyFactor = 0.4 // 40% of rewards from energy efficiency
        const safetyFactor = 0.3 // 30% of rewards from safety score
        const distanceFactor = 0.2 // 20% of rewards from distance
        const completionFactor = 0.1 // 10% flat bonus for trip completion
        
        const breakdown: RewardsBreakdown = {
          energyEfficiency: data.rewards * energyFactor,
          safetyScore: data.rewards * safetyFactor,
          distanceBonus: data.rewards * distanceFactor,
          completionBonus: data.rewards * completionFactor,
          total: data.rewards
        }
        
        setRewardsData(breakdown)
      } catch (err) {
        console.error('Error fetching trip rewards:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (tripId) {
      fetchTripRewards()
    }
  }, [tripId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading rewards data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !rewardsData) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600">
          Error loading rewards: {error || "No data available"}
        </CardContent>
      </Card>
    )
  }

  const factors = [
    {
      name: "Energy Efficiency",
      value: rewardsData.energyEfficiency,
      percentage: (rewardsData.energyEfficiency / rewardsData.total) * 100,
      icon: <Zap className="h-5 w-5 text-green-500" />,
      color: "bg-green-500",
      description: "Rewards earned from efficient energy usage"
    },
    {
      name: "Safety Score",
      value: rewardsData.safetyScore,
      percentage: (rewardsData.safetyScore / rewardsData.total) * 100,
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500",
      description: "Rewards earned from safe driving habits"
    },
    {
      name: "Distance Bonus",
      value: rewardsData.distanceBonus,
      percentage: (rewardsData.distanceBonus / rewardsData.total) * 100,
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-500",
      description: "Bonus rewards based on trip distance"
    },
    {
      name: "Completion Bonus",
      value: rewardsData.completionBonus,
      percentage: (rewardsData.completionBonus / rewardsData.total) * 100,
      icon: <Award className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-500",
      description: "Base bonus for completing the trip"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-rally-pink font-gugi flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Trip Rewards Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-rally-coral">
                {rewardsData.total.toFixed(2)} <span className="text-sm">$RALLY</span>
              </h3>
              <p className="text-sm text-gray-500">Total rewards earned for this trip</p>
            </div>
            <Badge variant="outline" className="bg-rally-pink/10 text-rally-pink border-rally-pink">
              ~${(rewardsData.total * 0.1).toFixed(2)} USD
            </Badge>
          </div>

          <div className="space-y-4">
            {factors.map((factor) => (
              <div key={factor.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {factor.icon}
                    <span className="font-medium">{factor.name}</span>
                  </div>
                  <span className="font-semibold">{factor.value.toFixed(2)} $RALLY</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={factor.percentage} className={`h-2 ${factor.color}`} />
                  <span className="text-xs text-gray-500">{Math.round(factor.percentage)}%</span>
                </div>
                <p className="text-xs text-gray-500">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
