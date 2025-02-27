"use client"

import { useState, useEffect } from "react"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { subDays, format } from "date-fns"

interface RewardsData {
  date: string
  amount: number
}

export default function RewardsChart() {
  const [rewardsData, setRewardsData] = useState<RewardsData[]>([])
  const [currentPeriod, setCurrentPeriod] = useState(0)

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    const generateMockData = () => {
      const data: RewardsData[] = []
      for (let i = 6; i >= 0; i--) {
        data.push({
          date: format(subDays(new Date(), i + currentPeriod * 7), "MMM dd"),
          amount: Math.floor(Math.random() * 100) + 50,
        })
      }
      setRewardsData(data)
    }

    generateMockData()
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
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rewardsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
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
      <div className="mt-4 text-center">
        <p className="text-lg font-semibold">
          Total Rewards: {totalRewards.toFixed(2)} $RALLY (${totalUSD.toFixed(2)} USD)
        </p>
      </div>
    </Card>
  )
}

