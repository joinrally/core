"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import type { Trip, TripSummary } from "../types"

const TripOverview = dynamic(() => import("../components/TripOverview"), {
  ssr: false,
  loading: () => <div>Loading trips...</div>,
})

export default function TripsPageContent() {
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const searchParams = useSearchParams()
  const vin = searchParams?.get("vin")

  useEffect(() => {
    const fetchAllTrips = async () => {
      try {
        const response = await fetch("/api/trips")
        if (!response.ok) {
          throw new Error("Failed to fetch trips")
        }
        const data = await response.json()
        setTrips(data || [])

        // Select the most recent trip
        if (data && data.length > 0) {
          const mostRecentTrip = data.reduce((latest: TripSummary, current: TripSummary) =>
            new Date(current.startTime) > new Date(latest.startTime) ? current : latest,
          )
          handleSelectTrip(mostRecentTrip)
        }
      } catch (error) {
        console.error("Error fetching trips:", error)
        setTrips([])
      }
    }

    fetchAllTrips()
  }, [])

  const handleSelectTrip = async (tripSummary: TripSummary) => {
    try {
      const response = await fetch(`/api/trips/${tripSummary.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch trip details")
      }
      const tripDetails = await response.json()
      setSelectedTrip(tripDetails)
    } catch (error) {
      console.error("Error fetching trip details:", error)
      setSelectedTrip(null)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <TripOverview trips={trips} selectedTrip={selectedTrip} onSelectTrip={handleSelectTrip} vin={vin || undefined} />
    </div>
  )
}

