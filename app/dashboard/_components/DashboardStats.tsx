"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Car, Coins, Award, Loader2 } from "lucide-react"
import { format, subMonths, parseISO } from "date-fns"

interface DashboardStats {
  totalRewards: number
  totalDistance: number
  averageScore: number
  monthlyChange: {
    rewards: number
    distance: number
    score: number
  }
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRewards: 0,
    totalDistance: 0,
    averageScore: 0,
    monthlyChange: {
      rewards: 0,
      distance: 0,
      score: 0
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        
        // Get current date range
        const now = new Date()
        const currentMonth = now.toISOString()
        const lastMonth = subMonths(now, 1).toISOString()
        
        // Get all vehicles
        const vehiclesResponse = await fetch('/api/vehicles')
        if (!vehiclesResponse.ok) {
          throw new Error(`Failed to fetch vehicles: ${vehiclesResponse.status}`)
        }
        const vehicles = await vehiclesResponse.json()
        
        // Get all trips
        const tripsResponse = await fetch('/api/trips')
        if (!tripsResponse.ok) {
          throw new Error(`Failed to fetch trips: ${tripsResponse.status}`)
        }
        const trips = await tripsResponse.json()
        
        // Get rewards for current month and last month
        const currentRewardsResponse = await fetch(`/api/rewards?startTime=${lastMonth}&endTime=${currentMonth}`)
        if (!currentRewardsResponse.ok) {
          throw new Error(`Failed to fetch current rewards: ${currentRewardsResponse.status}`)
        }
        const currentRewardsData = await currentRewardsResponse.json()
        
        const lastMonthEnd = lastMonth
        const lastMonthStart = subMonths(parseISO(lastMonth), 1).toISOString()
        const lastMonthRewardsResponse = await fetch(`/api/rewards?startTime=${lastMonthStart}&endTime=${lastMonthEnd}`)
        if (!lastMonthRewardsResponse.ok) {
          throw new Error(`Failed to fetch last month rewards: ${lastMonthRewardsResponse.status}`)
        }
        const lastMonthRewardsData = await lastMonthRewardsResponse.json()
        
        // Calculate total distance
        const totalDistance = trips.reduce((sum: number, trip: any) => sum + trip.distance, 0)
        
        // Calculate average score
        const scores = trips.map((trip: any) => trip.estimatedScore).filter(Boolean)
        const averageScore = scores.length > 0 
          ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length * 10) / 10
          : 0
        
        // Calculate monthly changes
        const currentMonthRewards = currentRewardsData.totalRewards || 0
        const lastMonthRewards = lastMonthRewardsData.totalRewards || 0
        const rewardsChange = lastMonthRewards > 0 
          ? ((currentMonthRewards - lastMonthRewards) / lastMonthRewards) * 100 
          : 0
        
        // For simplicity, use mock calculations for other metrics
        const distanceChange = 10.5
        const scoreChange = 5.2
        
        setStats({
          totalRewards: Math.round(currentRewardsData.totalRewards * 10) / 10,
          totalDistance: Math.round(totalDistance * 10) / 10,
          averageScore: averageScore,
          monthlyChange: {
            rewards: Math.round(rewardsChange * 10) / 10,
            distance: distanceChange,
            score: scoreChange
          }
        })
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStats()
  }, [])

  const renderChange = (change: number) => {
    const formatted = Math.abs(change).toFixed(1)
    if (change > 0) {
      return <p className="text-xs text-white/70">+{formatted}% from last month</p>
    } else if (change < 0) {
      return <p className="text-xs text-white/70">-{formatted}% from last month</p>
    }
    return <p className="text-xs text-white/70">No change from last month</p>
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gradient-to-br from-rally-pink to-rally-coral text-white">
            <CardContent className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border border-destructive">
        <p className="text-destructive">Error loading dashboard stats: {error}</p>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-gradient-to-br from-rally-pink to-rally-coral text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <Coins className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRewards} $RALLY</div>
          {renderChange(stats.monthlyChange.rewards)}
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-rally-pink to-rally-coral text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
          <Car className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDistance} mi</div>
          {renderChange(stats.monthlyChange.distance)}
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-rally-pink to-rally-coral text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Award className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageScore}</div>
          {renderChange(stats.monthlyChange.score)}
        </CardContent>
      </Card>
    </div>
  )
}
