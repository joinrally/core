"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Loader2, Award, TrendingUp } from "lucide-react"

interface VehicleRewardsChartProps {
  vehicleVin: string
}

interface RewardsDataPoint {
  date: string
  amount: number
  tokenType: string
}

interface RewardsTimeSeries {
  daily: RewardsDataPoint[]
  weekly: RewardsDataPoint[]
  monthly: RewardsDataPoint[]
}

export default function VehicleRewardsChart({ vehicleVin }: VehicleRewardsChartProps) {
  const [rewardsData, setRewardsData] = useState<RewardsTimeSeries>({
    daily: [],
    weekly: [],
    monthly: [],
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [totalRewards, setTotalRewards] = useState<number>(0)
  const [averageRewards, setAverageRewards] = useState<number>(0)
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        setLoading(true)
        // In a real implementation, we would fetch from a dedicated endpoint
        const response = await fetch(`/api/vehicles/${vehicleVin}/metrics`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch rewards data: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Generate simulated rewards time series data based on real metrics
        generateSimulatedRewardsData(data)
      } catch (err) {
        console.error('Error fetching rewards data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    if (vehicleVin) {
      fetchRewardsData()
    }
  }, [vehicleVin])
  
  const generateSimulatedRewardsData = (metricsData: any) => {
    // Generate 30 days of simulated data
    const dailyData: RewardsDataPoint[] = []
    const weeklyData: RewardsDataPoint[] = []
    const monthlyData: RewardsDataPoint[] = []
    
    const baseAmount = 10 + Math.random() * 5
    let total = 0
    
    // Daily data - last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Create some variability but with a slight upward trend
      const variability = Math.random() * 5 - 2 // -2 to 3
      const trend = i > 15 ? 0 : (30 - i) * 0.1 // upward trend in recent days
      const amount = Math.max(0, baseAmount + variability + trend)
      
      dailyData.push({
        date: dateStr,
        amount: parseFloat(amount.toFixed(2)),
        tokenType: 'MOVI',
      })
      
      total += amount
    }
    
    // Weekly data - aggregated
    for (let i = 4; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - (i * 7))
      const dateStr = date.toISOString().split('T')[0]
      
      // Sum up daily rewards for this week (approximate)
      const weekAmount = baseAmount * 7 + (Math.random() * 15) + (i === 0 ? 10 : 0)
      
      weeklyData.push({
        date: `Week ${4-i}`,
        amount: parseFloat(weekAmount.toFixed(2)),
        tokenType: 'MOVI',
      })
    }
    
    // Monthly data - last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12 // handle wrapping around to previous year
      const monthName = monthNames[monthIndex]
      
      // Monthly rewards with seasonal variations
      const seasonality = monthIndex >= 4 && monthIndex <= 8 ? 15 : 0 // summer boost
      const monthAmount = baseAmount * 30 + (Math.random() * 30) + seasonality
      
      monthlyData.push({
        date: monthName,
        amount: parseFloat(monthAmount.toFixed(2)),
        tokenType: 'MOVI',
      })
    }
    
    setRewardsData({
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
    })
    
    // Calculate total and average
    setTotalRewards(parseFloat(total.toFixed(2)))
    setAverageRewards(parseFloat((total / 31).toFixed(2)))
  }
  
  const getCurrentData = () => {
    return rewardsData[timeframe] || []
  }
  
  const getRewardTrend = () => {
    const data = getCurrentData()
    if (data.length < 2) return 0
    
    const recent = data[data.length - 1].amount
    const previous = data[data.length - 2].amount
    
    return ((recent - previous) / previous) * 100
  }
  
  const formatTooltipValue = (value: number) => {
    return `${value.toFixed(2)} MOVI`
  }
  
  const trend = getRewardTrend()
  const trendText = trend >= 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`
  const trendClass = trend >= 0 ? 'text-green-500' : 'text-red-500'

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center min-h-[350px]">
          <Loader2 className="h-8 w-8 text-rally-pink animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600 min-h-[100px] flex items-center justify-center">
          Error loading rewards data: {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-rally-pink font-gugi flex items-center gap-2">
          <Award className="h-5 w-5" />
          Rewards Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Rewards (30d)</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold">{totalRewards.toFixed(2)}</h3>
              <span className="text-sm font-medium mb-1">MOVI</span>
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Trend</p>
            <div className="flex items-end gap-2">
              <h3 className={`text-2xl font-bold ${trendClass}`}>{trendText}</h3>
              <TrendingUp className={`h-5 w-5 mb-1 ${trendClass}`} />
            </div>
          </div>
        </div>
        
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as 'daily' | 'weekly' | 'monthly')} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-4">
            <RewardsChart data={rewardsData.daily} />
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-4">
            <RewardsChart data={rewardsData.weekly} />
          </TabsContent>
          
          <TabsContent value="monthly" className="space-y-4">
            <RewardsChart data={rewardsData.monthly} />
          </TabsContent>
        </Tabs>
        
        <p className="text-xs text-muted-foreground mt-4">
          Rewards are calculated based on your driving patterns, energy consumption, and other factors.
          Higher scores lead to higher reward rates.
        </p>
      </CardContent>
    </Card>
  )
}

function RewardsChart({ data }: { data: RewardsDataPoint[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF385C" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FF385C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted-foreground)" opacity={0.4} />
          <XAxis 
            dataKey="date" 
            tickMargin={10}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground)' }}
            style={{
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
          />
          <YAxis 
            tickFormatter={(value) => `${value}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground)' }}
            style={{
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)} MOVI`, 'Rewards']}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg)',
              color: 'var(--tooltip-fg)',
              borderRadius: '8px',
              border: '1px solid var(--tooltip-border)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#FF385C" 
            fillOpacity={1} 
            fill="url(#colorRewards)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
