"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import type { Trip, TripSummary } from "@/src/utils/types"

const TripOverview = dynamic(() => import("../_components/TripOverview"), {
  ssr: false,
  loading: () => <div>Loading trips...</div>,
})

const TripDetails = dynamic(() => import("../_components/TripDetails"), {
  ssr: false,
  loading: () => <div>Loading trip details...</div>,
})

function TripsPageContent() {
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const searchParams = useSearchParams()
  const vin = searchParams?.get("vin")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSelectTrip = async (trip: TripSummary) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/trips/${trip.id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setSelectedTrip(data)
    } catch (error) {
      console.error('Error fetching trip details:', error)
      setError('Failed to fetch trip details. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-6">
      <TripOverview 
        trips={trips} 
        selectedTrip={selectedTrip} 
        onSelectTrip={handleSelectTrip} 
        vin={vin || undefined} 
      />
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

