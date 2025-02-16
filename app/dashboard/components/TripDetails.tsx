import type { Trip } from "../types"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatDistanceToNow } from "date-fns"
import { getScoreColor } from "@/utils/scoreColor"
import { Car, Battery, Route, Coins } from "lucide-react"

interface TripDetailsProps {
  trip: Trip
}

export default function TripDetails({ trip }: TripDetailsProps) {
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
        <h4 className="font-gugi text-xl text-rally-pink mb-4">Scores</h4>
        <div className="grid grid-cols-2 gap-4">
          {["energyScore", "safetyScore", "usageScore", "total"].map((scoreType) => (
            <div
              key={scoreType}
              className={`p-4 rounded text-white ${getScoreColor(trip.score[scoreType as keyof typeof trip.score])}`}
            >
              <p className="text-sm font-medium">{scoreType.charAt(0).toUpperCase() + scoreType.slice(1)}</p>
              <p className="text-2xl font-bold">{trip.score[scoreType as keyof typeof trip.score].toFixed(1)}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-rally-pink" />
            <p className="text-sm text-gray-500">Distance</p>
          </div>
          <p className="font-bold text-lg">{trip.distance.toFixed(1)} mi</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4 text-rally-pink" />
            <p className="text-sm text-gray-500">Energy Used</p>
          </div>
          <p className="font-bold text-lg">{trip.energyUsed.toFixed(1)} kWh</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-rally-pink" />
            <p className="text-sm text-gray-500">Rewards</p>
          </div>
          <p className="font-bold text-lg">{trip.rewards.toFixed(2)} $RALLY</p>
          <p className="text-xs text-gray-500">${(trip.rewards * 0.1).toFixed(2)} USD</p>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="font-gugi text-lg text-rally-pink mb-4">Speed & Power</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trip.metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              contentStyle={{ background: "white", border: "1px solid #ddd" }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="speed" stroke="#FF69B4" name="Speed (mph)" />
            <Line yAxisId="right" type="monotone" dataKey="packCurrent" stroke="#FF7F50" name="Current (A)" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h4 className="font-gugi text-lg text-rally-pink mb-4">Acceleration & Braking</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trip.metrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
            <YAxis />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              contentStyle={{ background: "white", border: "1px solid #ddd" }}
            />
            <Legend />
            <Line type="monotone" dataKey="acceleration" stroke="#FF69B4" name="Acceleration (g)" />
            <Line type="monotone" dataKey="brakePedal" stroke="#FF7F50" name="Brake Pedal" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

