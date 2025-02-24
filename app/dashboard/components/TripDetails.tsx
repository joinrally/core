"use client"

import { useMemo } from "react"
import type { Trip } from "../types"
import { Card } from "@/components/ui/card"
import { LineChart, Line, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatDistanceToNow, formatDistance } from "date-fns"
import { getScoreColor } from "@/utils/scoreColor"
import { Car, Battery, Route, Coins, Clock } from "lucide-react"

// Commented out TripMap import
// const TripMap = dynamic(() => import("./TripMap"), {
//   ssr: false,
//   loading: () => <div className="h-[400px] flex items-center justify-center bg-gray-100">Loading map...</div>,
// })

interface TripDetailsProps {
  trip: Trip
}

export default function TripDetails({ trip }: TripDetailsProps) {
  const tripDuration = useMemo(() => {
    const start = new Date(trip.startTime)
    const end = new Date(trip.endTime)
    return formatDistance(start, end)
  }, [trip.startTime, trip.endTime])

  const aggregateData = useMemo(() => {
    const interval = Math.max(1, Math.floor(trip.metrics.length / 100)) // Aim for about 100 data points
    return trip.metrics.filter((_, index) => index % interval === 0)
  }, [trip.metrics])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-500">{formatDistanceToNow(new Date(trip.startTime))} ago</p>
        {trip.vehicle ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Car className="h-4 w-4" />
            <span>
              {trip.vehicle.make} {trip.vehicle.model} ({trip.vehicle.year}) - VIN: {trip.vehicle.vin}
            </span>
          </div>
        ) : (
          <p className="text-gray-500">Vehicle information not available</p>
        )}
      </div>

      <Card className="p-6">
        <h4 className="font-gugi text-xl text-rally-pink mb-4">Trip Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-rally-pink" />
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-bold">{tripDuration}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-rally-pink" />
            <div>
              <p className="text-sm text-gray-500">Distance</p>
              <p className="font-bold">{trip.distance.toFixed(1)} mi</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="h-5 w-5 text-rally-pink" />
            <div>
              <p className="text-sm text-gray-500">Energy Used</p>
              <p className="font-bold">{trip.energyUsed.toFixed(1)} kWh</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-rally-pink" />
            <div>
              <p className="text-sm text-gray-500">Rewards</p>
              <p className="font-bold">{trip.rewards.toFixed(2)} $RALLY</p>
              <p className="text-xs text-gray-500">${(trip.rewards * 0.1).toFixed(2)} USD</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="font-gugi text-xl text-rally-pink mb-4">Trip Scores</h4>
        <div className="space-y-6">
          <div className={`p-6 rounded-lg text-white ${getScoreColor(trip.score.total)} shadow-lg`}>
            <p className="text-lg font-medium mb-2">Overall Trip Score</p>
            <p className="text-5xl font-bold">{Math.round(trip.score.total)}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded text-white ${getScoreColor(trip.score.energyScore)} bg-opacity-80`}>
              <p className="text-sm font-medium">Energy Efficiency</p>
              <p className="text-xl font-bold">{Math.round(trip.score.energyScore)}</p>
            </div>
            <div className={`p-4 rounded text-white ${getScoreColor(trip.score.safetyScore)} bg-opacity-80`}>
              <p className="text-sm font-medium">Driving Safety</p>
              <p className="text-xl font-bold">{Math.round(trip.score.safetyScore)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Commented out TripMap
      <Card className="p-6">
        <h4 className="font-gugi text-lg text-rally-coral mb-4">Trip Route</h4>
        <TripMap metrics={trip.metrics} />
      </Card>
      */}

      <Card className="p-6">
        <h4 className="font-gugi text-lg text-rally-pink mb-4">Speed & Power</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aggregateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip contentStyle={{ background: "white", border: "1px solid #ddd" }} />
            <Legend />
            <Line type="monotone" dataKey="speed" stroke="#FF69B4" name="Speed (mph)" dot={false} />
            <Line type="monotone" dataKey="packCurrent" stroke="#FF7F50" name="Current (A)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h4 className="font-gugi text-lg text-rally-pink mb-4">Acceleration & Braking</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={aggregateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip contentStyle={{ background: "white", border: "1px solid #ddd" }} />
            <Legend />
            <Line type="monotone" dataKey="acceleration" stroke="#4CAF50" name="Acceleration (g)" dot={false} />
            <Line type="monotone" dataKey="brakePedal" stroke="#FFA500" name="Brake Pedal" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

