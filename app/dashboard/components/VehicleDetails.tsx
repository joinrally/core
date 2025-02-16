"use client"

import { useState, useEffect, useRef } from "react"
import type { Vehicle, VehicleMetrics, Score } from "../types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { getScoreColor } from "@/utils/scoreColor"

interface VehicleDetailsProps {
  vehicle: Vehicle
}

export default function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const [metrics, setMetrics] = useState<VehicleMetrics[]>([])
  const [score, setScore] = useState<Score | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/ws/vehicle/${vehicle.id}`
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        setConnectionStatus("connected")
        console.log("WebSocket connected")
      }

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "metrics") {
          setMetrics((prevMetrics) => [...prevMetrics.slice(-300), data.metrics])
        } else if (data.type === "score") {
          setScore(data.score)
        }
      }

      wsRef.current.onclose = () => {
        console.log("WebSocket connection closed")
        setConnectionStatus("error")
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
      }

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionStatus("error")
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [vehicle.id])

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-gugi text-2xl font-semibold text-rally-coral">{vehicle.name}</h2>
        {connectionStatus !== "connected" && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-700">
              {connectionStatus === "connecting" ? "Connecting..." : "Connection error - retrying..."}
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-gugi text-lg font-medium mb-4 text-rally-pink">Real-time Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} />
              <YAxis />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                contentStyle={{ background: "white", border: "1px solid #ddd" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="speed"
                stroke="#FF69B4"
                name="Speed (mph)"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="packVoltage"
                stroke="#FF7F50"
                name="Pack Voltage (V)"
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="packCurrent"
                stroke="#4B0082"
                name="Pack Current (A)"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="font-gugi text-lg font-medium mb-4 text-rally-pink">Score</h3>
          {score ? (
            <div className="grid grid-cols-2 gap-4">
              {["energyScore", "safetyScore", "usageScore", "total"].map((scoreType) => (
                <div
                  key={scoreType}
                  className={`p-4 rounded text-white ${getScoreColor(score[scoreType as keyof typeof score])}`}
                >
                  <p className="text-sm font-medium">{scoreType.charAt(0).toUpperCase() + scoreType.slice(1)}</p>
                  <p className="text-2xl font-bold">{score[scoreType as keyof typeof score].toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-500">Waiting for score data...</div>
          )}
        </div>
      </div>
    </div>
  )
}

