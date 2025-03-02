"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { TrendingUp, Car, Coins, Tag, MapPin, Loader2 } from "lucide-react"
import { formatDistanceToNow, parseISO } from "date-fns"

interface Activity {
  id: string
  type: "trip" | "rewards" | "tag" | "route"
  description: string
  time: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActivity() {
      try {
        setIsLoading(true)
        
        // Fetch recent trips
        const tripsResponse = await fetch('/api/trips')
        if (!tripsResponse.ok) {
          throw new Error(`Failed to fetch trips: ${tripsResponse.status}`)
        }
        const trips = await tripsResponse.json()
        
        // Sort trips by start time, most recent first
        const sortedTrips = [...trips].sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
        
        // Take the 5 most recent trips
        const recentTrips = sortedTrips.slice(0, 5)
        
        // Convert trips to activities
        const tripActivities: Activity[] = recentTrips.map(trip => {
          // Determine activity type based on trip properties
          let type: "trip" | "rewards" | "tag" | "route" = "trip"
          let description = `Completed a trip with ${trip.vehicle.make} ${trip.vehicle.model}`
          
          if (trip.tags && trip.tags.length > 0) {
            type = "tag"
            description = `Tagged trip with: ${trip.tags.join(", ")}`
          } else if (trip.route) {
            type = "route"
            description = `Recorded a ${trip.distance} mile route`
          } else if (trip.estimatedRewards > 20) {
            type = "rewards"
            description = `Earned ${Math.round(trip.estimatedRewards)} $RALLY rewards`
          }
          
          return {
            id: trip.id,
            type,
            description,
            time: formatDistanceToNow(parseISO(trip.startTime), { addSuffix: true })
          }
        })
        
        setActivities(tripActivities)
      } catch (err) {
        console.error("Error fetching activities:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchActivity()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "trip":
        return <Car className="h-4 w-4 text-rally-pink" />
      case "rewards":
        return <Coins className="h-4 w-4 text-rally-pink" />
      case "tag":
        return <Tag className="h-4 w-4 text-rally-pink" />
      case "route":
        return <MapPin className="h-4 w-4 text-rally-pink" />
      default:
        return <TrendingUp className="h-4 w-4 text-rally-pink" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-rally-coral">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-rally-pink" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">
            Error loading activity: {error}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No recent activity found
          </div>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-center">
                {getActivityIcon(activity.type)}
                <div className="ml-2">
                  <p className="text-sm font-medium leading-none">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
