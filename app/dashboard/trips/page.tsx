"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { Trip } from "../types"
import TripOverview from "../components/TripOverview"

function TripsPageContent() {
  const [trips, setTrips] = useState<Trip[]>([])
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
        if (data.length > 0) {
          setSelectedTrip(data[0])
        }
      } catch (error) {
        console.error("Error fetching trips:", error)
      }
    }

    fetchAllTrips()
  }, [])

  // Filter trips if VIN is provided
  const filteredTrips = vin ? trips.filter((trip) => trip.vehicle?.vin === vin) : trips

  return (
    <div className="h-[calc(100vh-4rem)]">
      <TripOverview trips={filteredTrips} selectedTrip={selectedTrip} onSelectTrip={setSelectedTrip} vin={vin} />
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

