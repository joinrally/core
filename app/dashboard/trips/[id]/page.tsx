"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Separator } from "@/src/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { ChevronLeft, Loader2 } from "lucide-react"
import TripDetails from "../../_components/TripDetails"
import TripRewards from "../../_components/TripRewards"
import type { Trip } from "@/src/utils/types"

export default function TripDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params?.id as string
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTripDetails() {
      if (!tripId) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/trips/${tripId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch trip: ${response.status}`)
        }
        
        const data = await response.json()
        setTrip(data)
      } catch (err) {
        console.error('Error fetching trip details:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTripDetails()
  }, [tripId])

  const handleBackToTrips = () => {
    router.push('/dashboard/trips')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-rally-pink" />
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="p-6 text-red-600">
        <h2 className="text-xl font-bold mb-2">Error Loading Trip</h2>
        <p>{error || "Trip not found"}</p>
        <Button 
          variant="outline" 
          onClick={handleBackToTrips} 
          className="mt-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Trips
        </Button>
      </div>
    )
  }

  return (
    <div className="px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={handleBackToTrips} 
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-rally-coral font-gugi">
          Trip Details
        </h1>
      </div>

      <Separator className="mb-6" />

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Trip Details</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          {trip && <TripDetails trip={trip} />}
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-6">
          <TripRewards tripId={tripId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
