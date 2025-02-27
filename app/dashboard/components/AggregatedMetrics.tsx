import type { AggregatedMetrics as AggregatedMetricsType } from "../types"
import { Card } from "@/src/components/ui/card"
import { Trophy, Battery, Route, Coins } from "lucide-react"

interface AggregatedMetricsProps {
  metrics: AggregatedMetricsType
}

export default function AggregatedMetrics({ metrics }: AggregatedMetricsProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-gugi text-xl text-rally-coral">Vehicle Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-rally-pink" />
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="text-xl font-bold">{metrics.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Route className="h-5 w-5 text-rally-pink" />
            <div>
              <p className="text-sm text-gray-500">Total Distance</p>
              <p className="text-xl font-bold">{metrics.totalDistance.toFixed(0)} mi</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Battery className="h-5 w-5 text-rally-pink" />
            <div>
              <p className="text-sm text-gray-500">Energy Efficiency</p>
              <p className="text-xl font-bold">{metrics.averageEnergyEfficiency.toFixed(1)} Wh/mi</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Coins className="h-5 w-5 text-rally-pink" />
            <div>
              <p className="text-sm text-gray-500">Total Rewards</p>
              <p className="text-xl font-bold">{metrics.totalRewards.toFixed(2)} $RALLY</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

