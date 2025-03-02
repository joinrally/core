"use client"

import { useState, useEffect } from "react"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { subDays, format, addDays } from "date-fns"
import { Loader2 } from "lucide-react"

interface RewardsData {
  date: string
  amount: number
}

interface RewardsResponse {
  rewards: Array<{ vehicleVin: string; rewards: number }>
  totalRewards: number
}

export default function RewardsChart() {
  const [rewardsData, setRewardsData] = useState<RewardsData[]>([])
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
      
      // Fetch rewards data from API
      const response = await fetch(`/api/rewards?startTime=${startTime}&endTime=${endTime}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data: RewardsResponse = await response.json()
      
      // Process the data for the chart
      const dailyRewards: RewardsData[] = []
      
      // Create a data point for each day in the period
      for (let i = 6; i >= 0; i--) {
        const day = subDays(endDate, i)
        const dayFormatted = format(day, 'yyyy-MM-dd')
        
        // For now, evenly distribute the total rewards across the days
        // In a real implementation, you'd have daily data from the API
        dailyRewards.push({
          date: format(day, "MMM dd"),
          amount: Math.round(data.totalRewards / 7 * 10) / 10, // Simple distribution with one decimal place
        })
      }
      
      setRewardsData(dailyRewards)
    } catch (err) {
      console.error('Error fetching rewards:', err)
      setError(`Failed to load rewards data: ${err instanceof Error ? err.message : 'Unknown error'}`)
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

  const totalRewards = rewardsData.reduce((sum, data) => sum + data.amount, 0)
  const totalUSD = totalRewards * 0.1 // Assuming 1 $RALLY = $0.10 USD

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-gugi text-rally-coral mb-4">$RALLY Earned</h2>
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
          <span className="ml-2">Loading rewards data...</span>
        </div>
      ) : error ? (
        <div className="h-[300px] flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rewardsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--muted-foreground)" opacity={0.4} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--foreground)' }} 
                axisLine={{ stroke: 'var(--muted-foreground)' }} 
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fill: 'var(--foreground)' }} 
                axisLine={{ stroke: 'var(--muted-foreground)' }} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tick={{ fill: 'var(--foreground)' }} 
                axisLine={{ stroke: 'var(--muted-foreground)' }} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg)',
                  color: 'var(--tooltip-fg)',
                  borderRadius: '8px',
                  border: '1px solid var(--tooltip-border)',
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(2)} $RALLY ($${(value * 0.1).toFixed(2)} USD)`,
                  name,
                ]}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="amount"
                name="$RALLY"
                stroke="#FF69B4"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={(data) => data.amount * 0.1}
                name="USD"
                stroke="#FF7F50"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
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

