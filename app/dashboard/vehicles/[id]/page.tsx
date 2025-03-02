"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Separator } from "@/src/components/ui/separator"
import { ChevronLeft, Car, Zap, Clock, Calendar, Route, AlertTriangle, Loader2, Wrench } from "lucide-react"
import Link from "next/link"
import VehicleDetails from "../../_components/VehicleDetails"
import VehicleHealth from "../../_components/VehicleHealth"
import VehicleRewardsChart from "../../_components/VehicleRewardsChart"
import type { Vehicle, Trip, TripSummary, AggregatedMetrics } from "@/src/utils/types"
import { getScoreColor } from "@/src/utils/scoreColor"
import { format, formatDistanceToNow } from "date-fns"

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const vehicleVin = params?.id as string // The URL parameter is still 'id' but contains the VIN
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [recentTrips, setRecentTrips] = useState<TripSummary[]>([])
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVehicleData() {
      if (!vehicleVin) return

      try {
        setIsLoading(true)
        
        // Fetch vehicle details
        const vehicleResponse = await fetch(`/api/vehicles/${vehicleVin}`)
        if (!vehicleResponse.ok) {
          throw new Error(`Failed to fetch vehicle: ${vehicleResponse.status}`)
        }
        const vehicleData = await vehicleResponse.json()
        setVehicle(vehicleData)
        
        // Fetch recent trips for this vehicle
        const tripsResponse = await fetch(`/api/vehicles/${vehicleVin}/trips`)
        if (!tripsResponse.ok) {
          throw new Error(`Failed to fetch trips: ${tripsResponse.status}`)
        }
        const tripsData = await tripsResponse.json()
        // Handle API response format which includes a trips array
        setRecentTrips(tripsData.trips || [])
        
        // Fetch vehicle metrics
        const metricsResponse = await fetch(`/api/vehicles/${vehicleVin}/metrics`)
        if (!metricsResponse.ok) {
          throw new Error(`Failed to fetch metrics: ${metricsResponse.status}`)
        }
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      } catch (err) {
        console.error('Error fetching vehicle details:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchVehicleData()
  }, [vehicleVin])

  const handleBackToVehicles = () => {
    router.push('/dashboard/vehicles')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-rally-pink" />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="p-6 text-red-600">
        <h2 className="text-xl font-bold mb-2">Error Loading Vehicle</h2>
        <p>{error || "Vehicle not found"}</p>
        <Button 
          variant="outline" 
          onClick={handleBackToVehicles} 
          className="mt-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Vehicles
        </Button>
      </div>
    )
  }

  return (
    <div className="px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          onClick={handleBackToVehicles} 
          className="mr-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-rally-coral font-gugi">
          {vehicle.name}
        </h1>
      </div>

      <Separator className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-1">
          <CardContent className="p-6">
            <div className="relative w-full h-[200px] bg-muted rounded-md flex items-center justify-center overflow-hidden mb-4">
              {vehicle.image ? (
                <Image
                  src={vehicle.image}
                  alt={vehicle.name}
                  fill
                  className="object-cover rounded-md"
                />
              ) : (
                <Car className="h-24 w-24 text-gray-400" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Make</span>
                <span className="font-medium">{vehicle.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium">{vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year</span>
                <span className="font-medium">{vehicle.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VIN</span>
                <span className="font-medium">{vehicle.vin}</span>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className={`p-4 rounded-md text-white ${getScoreColor(vehicle.score?.total || 0)}`}>
              <h3 className="font-medium mb-1">Vehicle Score</h3>
              <p className="text-3xl font-bold">{Math.round(vehicle.score?.total || 0)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-xl text-rally-pink font-gugi">Vehicle Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg flex flex-col items-center">
                <Route className="h-6 w-6 text-rally-coral mb-2" />
                <span className="text-xs text-muted-foreground">Total Distance</span>
                <span className="text-lg font-bold">{metrics?.totalDistance?.toFixed(0) || '0'} mi</span>
              </div>
              
              <div className="p-4 bg-muted rounded-lg flex flex-col items-center">
                <Clock className="h-6 w-6 text-rally-coral mb-2" />
                <span className="text-xs text-muted-foreground">Total Trips</span>
                <span className="text-lg font-bold">{metrics?.totalTrips || '0'}</span>
              </div>
              
              <div className="p-4 bg-muted rounded-lg flex flex-col items-center">
                <Zap className="h-6 w-6 text-rally-coral mb-2" />
                <span className="text-xs text-muted-foreground">Energy Efficiency</span>
                <span className="text-lg font-bold">{metrics?.averageEnergyEfficiency?.toFixed(1) || '0.0'} Wh/mi</span>
              </div>
              
              <div className="p-4 bg-muted rounded-lg flex flex-col items-center">
                <Calendar className="h-6 w-6 text-rally-coral mb-2" />
                <span className="text-xs text-muted-foreground">Last Trip</span>
                <span className="text-lg font-bold">
                  {recentTrips.length > 0 
                    ? formatDistanceToNow(new Date(recentTrips[0].endTime), { addSuffix: true }) 
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Real-Time Data</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="trips">Recent Trips</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <VehicleDetails vehicle={vehicle} />
        </TabsContent>
        
        <TabsContent value="health" className="space-y-6">
          <VehicleHealth vehicleVin={vehicleVin} />
        </TabsContent>
        
        <TabsContent value="trips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-rally-pink font-gugi">Recent Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTrips.length > 0 ? (
                <div className="space-y-4">
                  {recentTrips.slice(0, 5).map(trip => (
                    <Card key={trip.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{format(new Date(trip.startTime), "MMM d, yyyy")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(trip.startTime), "h:mm a")} - {format(new Date(trip.endTime), "h:mm a")}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-white font-medium ${getScoreColor(trip.estimatedScore)}`}>
                          Score: {Math.round(trip.estimatedScore)}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Distance:</span> {trip.distance.toFixed(1)} mi
                        </div>
                        <div>
                          <span className="text-muted-foreground">Energy:</span> {trip.estimatedEnergyUsed.toFixed(1)} kWh
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rewards:</span> {trip.estimatedRewards.toFixed(2)} $RALLY
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Link href={`/dashboard/trips/${trip.id}`} className="text-rally-coral hover:text-rally-pink text-sm font-medium">
                          View Trip Details →
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No trips recorded for this vehicle yet.
                </div>
              )}
              
              {recentTrips.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Link href={`/dashboard/trips?vin=${vehicle.vin}`}>
                    <Button variant="outline">View All Trips</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-rally-pink font-gugi">Rewards History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-8">
                <Zap className="h-12 w-12 text-rally-coral mb-4" />
                <h3 className="text-3xl font-bold text-rally-coral">
                  {metrics?.totalRewards?.toFixed(2) || '0.00'} $RALLY
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Total rewards earned with this vehicle</p>
                
                <Link href={`/dashboard/rewards?vin=${vehicle.vin}`}>
                  <Button className="bg-rally-coral hover:bg-rally-pink text-white">
                    View Detailed Rewards
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-rally-pink font-gugi flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center py-8 text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">Maintenance Tracking Coming Soon</h3>
                <p className="text-muted-foreground max-w-md">
                  Track service history, receive maintenance reminders, and optimize your vehicle's performance and longevity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
