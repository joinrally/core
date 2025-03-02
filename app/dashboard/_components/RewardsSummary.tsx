"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Loader2, Coins, TrendingUp } from "lucide-react"
import { format, subDays, parseISO } from "date-fns"
import Link from "next/link"

interface RewardsSummaryData {
  currentPeriod: number
  previousPeriod: number
  change: number
  changePercent: number
}

export default function RewardsSummary() {
  const [data, setData] = useState<RewardsSummaryData>({
    currentPeriod: 0,
    previousPeriod: 0,
    change: 0,
    changePercent: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRewardsSummary() {
      try {
        setIsLoading(true)
        
        // Calculate the date ranges for current and previous periods
        const now = new Date()
        const currentPeriodEnd = now.toISOString()
        const currentPeriodStart = subDays(now, 30).toISOString()
        const previousPeriodEnd = subDays(now, 30).toISOString()
        const previousPeriodStart = subDays(now, 60).toISOString()
        
        // Fetch rewards for current and previous periods
        const [currentResponse, previousResponse] = await Promise.all([
          fetch(`/api/rewards?startTime=${currentPeriodStart}&endTime=${currentPeriodEnd}`),
          fetch(`/api/rewards?startTime=${previousPeriodStart}&endTime=${previousPeriodEnd}`)
        ])
        
        if (!currentResponse.ok) {
          throw new Error(`Failed to fetch current rewards: ${currentResponse.status}`)
        }
        
        if (!previousResponse.ok) {
          throw new Error(`Failed to fetch previous rewards: ${previousResponse.status}`)
        }
        
        const currentData = await currentResponse.json()
        const previousData = await previousResponse.json()
        
        const currentTotal = currentData.totalRewards || 0
        const previousTotal = previousData.totalRewards || 0
        const change = currentTotal - previousTotal
        const changePercent = previousTotal > 0 
          ? ((currentTotal - previousTotal) / previousTotal) * 100 
          : 0
        
        setData({
          currentPeriod: currentTotal,
          previousPeriod: previousTotal,
          change,
          changePercent: Math.round(changePercent * 10) / 10
        })
      } catch (err) {
        console.error('Error fetching rewards summary:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRewardsSummary()
  }, [])

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-rally-coral to-rally-pink p-4 text-white">
        <CardContent className="p-2 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading rewards data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200 p-4">
        <CardContent className="p-2 text-red-600">
          Error loading rewards: {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-r from-rally-coral to-rally-pink p-4 text-white">
      <CardContent className="p-2">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              <Coins className="inline-block mr-2 h-5 w-5" />
              Rewards Summary
            </h3>
            <p className="text-sm opacity-90 my-1">
              Last 30 days: {data.currentPeriod.toFixed(1)} $RALLY
            </p>
            <p className="text-sm opacity-90 flex items-center">
              {data.change >= 0 ? (
                <>
                  <TrendingUp className="inline-block mr-1 h-4 w-4" />
                  <span className="text-green-100">+{data.change.toFixed(1)} $RALLY ({data.changePercent > 0 ? `+${data.changePercent}` : 0}%)</span>
                </>
              ) : (
                <>
                  <TrendingUp className="inline-block mr-1 h-4 w-4 transform rotate-180" />
                  <span className="text-red-100">{data.change.toFixed(1)} $RALLY ({data.changePercent}%)</span>
                </>
              )}
            </p>
          </div>
          <Link href="/dashboard/rewards">
            <Button variant="secondary" className="text-rally-coral">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
