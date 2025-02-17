"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { Trip, TripSummary } from "../types"
import TripOverview from "../components/TripOverview"

function TripsPageContent() {
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const searchParams = useSearchParams()
  const vin = searchParams.get("vin")

  useEffect(() => {
    // Fetch all trips
    const fetchAllTrips = async () => {
      try {
        const response = await fetch("/api/trips")
        if (!response.ok) {
          throw new Error("Failed to fetch trips")
        }
        const data = await response.json()
        setTrips(data || [])
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
      <TripOverview trips={trips} selectedTrip={selectedTrip} onSelectTrip={handleSelectTrip} vin={vin} />
    </div>
  )
}

export default function TripsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TripsPageContent />
    </Suspense>
  )
}

