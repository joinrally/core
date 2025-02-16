"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { Vehicle, AggregatedMetrics as AggregatedMetricsType } from "../types"
import VehicleOverview from "../components/VehicleOverview"

function VehiclesPageContent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [aggregatedMetrics, setAggregatedMetrics] = useState<AggregatedMetricsType | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Fetch vehicles
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles")
        const data = await response.json()
        setVehicles(data)
        if (data.length > 0) {
          setSelectedVehicle(data[0])
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      }
    }

    fetchVehicles()
  }, [])

  useEffect(() => {
    if (!selectedVehicle) return

    // Fetch aggregated metrics for selected vehicle
    const fetchAggregatedMetrics = async () => {
      try {
        const response = await fetch(`/api/vehicles/${selectedVehicle.id}/metrics`)
        const data = await response.json()
        setAggregatedMetrics(data)
      } catch (error) {
        console.error("Error fetching aggregated metrics:", error)
      }
    }

    fetchAggregatedMetrics()
  }, [selectedVehicle])

  return (
    <div className="p-6">
      <VehicleOverview
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={setSelectedVehicle}
        aggregatedMetrics={aggregatedMetrics}
      />
    </div>
  )
}

export default function VehiclesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VehiclesPageContent />
    </Suspense>
  )
}

