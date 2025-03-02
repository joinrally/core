"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Loader2, Car, Route, Trophy, Clock } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { getScoreColor } from "@/src/utils/scoreColor"
import Link from "next/link"
import type { Trip } from "@/src/utils/types"

export default function FeaturedTrip() {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLatestTrip() {
      try {
        setIsLoading(true)
        
        // Fetch trips and get the most recent one
        const response = await fetch("/api/trips")
        
        if (!response.ok) {
          throw new Error(`Failed to fetch trips: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data || data.length === 0) {
          setTrip(null)
          return
        }
        
        // Find the most recent trip
        const mostRecentTrip = data.reduce((latest: any, current: any) =>
          new Date(current.startTime) > new Date(latest.startTime) ? current : latest,
          data[0]
        )
        
        // Fetch full details for this trip
        const tripResponse = await fetch(`/api/trips/${mostRecentTrip.id}`)
        
        if (!tripResponse.ok) {
          throw new Error(`Failed to fetch trip details: ${tripResponse.status}`)
        }
        
        const tripData = await tripResponse.json()
        setTrip(tripData)
      } catch (err) {
        console.error('Error fetching featured trip:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLatestTrip()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading latest trip...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !trip) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            {error || "No trips available. Take a drive to earn rewards!"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-rally-pink font-gugi flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Featured Trip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{format(new Date(trip.startTime), "MMMM d, yyyy")}</p>
              <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(trip.startTime))} ago</p>
              <p className="text-sm text-muted-foreground mt-1">
                {trip.vehicle?.make} {trip.vehicle?.model} {trip.vehicle?.year}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-white font-medium ${getScoreColor(trip.score.total)}`}>
              Score: {Math.round(trip.score.total)}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
              <Car className="h-5 w-5 text-rally-coral mb-1" />
              <p className="text-sm font-medium">{trip.distance.toFixed(1)} mi</p>
              <p className="text-xs text-muted-foreground">Distance</p>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-rally-coral mb-1" />
              <p className="text-sm font-medium">
                {formatDistanceToNow(
                  new Date(new Date(trip.startTime).getTime() + 
                  (new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime())),
                  { addSuffix: false }
                )}
              </p>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
              <Route className="h-5 w-5 text-rally-coral mb-1" />
              <p className="text-sm font-medium">{trip.rewards.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">$RALLY</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link href={`/dashboard/trips/${trip.id}`}>
              <Button variant="outline" className="text-rally-coral border-rally-coral hover:bg-rally-coral hover:text-white">
                View Trip Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
