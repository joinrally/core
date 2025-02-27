"use client"

import { useState, useEffect } from "react"
import type { Vehicle, VehicleMetrics, Score } from "../types"
import { getScoreColor } from "@/src/utils/scoreColor"

interface VehicleDetailsProps {
  vehicle: Vehicle
}

export default function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const [metrics, setMetrics] = useState<VehicleMetrics | null>(null)
  const [score, setScore] = useState<Score | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/vehicles/${vehicle.id}/metrics`)
        const data = await response.json()
        setMetrics(data.metrics)
        setScore(data.score)
      } catch (error) {
        console.error("Error fetching vehicle data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Fetch every 5 seconds

    return () => clearInterval(interval)
  }, [vehicle.id])

  if (!metrics || !score) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-gugi text-2xl font-semibold text-rally-coral">{vehicle.name}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-gugi text-lg font-medium mb-4 text-rally-pink">Real-time Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-500">Speed</p>
              <p className="text-xl font-bold">{metrics.speed.toFixed(1)} mph</p>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-500">Pack Voltage</p>
              <p className="text-xl font-bold">{metrics.packVoltage.toFixed(1)} V</p>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-500">Pack Current</p>
              <p className="text-xl font-bold">{metrics.packCurrent.toFixed(1)} A</p>
            </div>
            <div className="p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-500">Acceleration</p>
              <p className="text-xl font-bold">{metrics.acceleration.toFixed(2)} g</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-gugi text-lg font-medium mb-4 text-rally-pink">Score</h3>
          <div className="grid grid-cols-2 gap-4">
            {["energyScore", "safetyScore", "total"].map((scoreType) => (
              <div
                key={scoreType}
                className={`p-4 rounded text-white ${getScoreColor(score[scoreType as keyof typeof score])}`}
              >
                <p className="text-sm font-medium">{scoreType.charAt(0).toUpperCase() + scoreType.slice(1)}</p>
                <p className="text-2xl font-bold">{score[scoreType as keyof typeof score].toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

