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
        const data = await response.json()
        setTrips(data)
      } catch (error) {
        console.error("Error fetching trips:", error)
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
      // Optionally, you can set an error state here to show an error message to the user
    }
  }

  // Filter trips if VIN is provided
  const filteredTrips = vin ? trips.filter((trip) => trip.vehicle?.vin === vin) : trips

  return (
    <div className="h-[calc(100vh-4rem)]">
      <TripOverview trips={filteredTrips} selectedTrip={selectedTrip} onSelectTrip={handleSelectTrip} vin={vin} />
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

