"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistance, formatRelative, isWithinInterval } from "date-fns"
import { Car, Battery, Coins, X, Filter } from "lucide-react"
import { getScoreColor } from "@/utils/scoreColor"
import TripDetails from "./TripDetails"
import type { Trip } from "../types"

interface TripOverviewProps {
  trips: Trip[]
  selectedTrip: Trip | null
  onSelectTrip: (trip: Trip) => void
}

export default function TripOverview({ trips, selectedTrip, onSelectTrip }: TripOverviewProps) {
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = {
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    make: searchParams.get("make")?.split(",") || [],
    model: searchParams.get("model")?.split(",") || [],
    year: searchParams.get("year")?.split(",") || [],
    vin: searchParams.get("vin")?.split(",") || [],
  }

  useEffect(() => {
    if (trips.length > 0 && !selectedTrip) {
      onSelectTrip(trips[0])
    }
  }, [trips, selectedTrip, onSelectTrip])

  const filteredTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.startTime)
    const startDate = filters.startDate ? new Date(filters.startDate) : null
    const endDate = filters.endDate ? new Date(filters.endDate) : null

    return (
      (!startDate || !endDate || isWithinInterval(tripDate, { start: startDate, end: endDate })) &&
      (filters.make.length === 0 || (trip.vehicle && filters.make.includes(trip.vehicle.make))) &&
      (filters.model.length === 0 || (trip.vehicle && filters.model.includes(trip.vehicle.model))) &&
      (filters.year.length === 0 || (trip.vehicle && filters.year.includes(trip.vehicle.year.toString()))) &&
      (filters.vin.length === 0 || (trip.vehicle && filters.vin.includes(trip.vehicle.vin)))
    )
  })

  const uniqueMakes = Array.from(new Set(trips.filter((trip) => trip.vehicle).map((trip) => trip.vehicle.make)))
  const uniqueModels = Array.from(new Set(trips.filter((trip) => trip.vehicle).map((trip) => trip.vehicle.model)))
  const uniqueYears = Array.from(
    new Set(trips.filter((trip) => trip.vehicle).map((trip) => trip.vehicle.year.toString())),
  )
  const uniqueVins = Array.from(new Set(trips.filter((trip) => trip.vehicle).map((trip) => trip.vehicle.vin)))

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filterType === "startDate" || filterType === "endDate") {
      params.set(filterType, value)
    } else {
      const currentValues = params.get(filterType)?.split(",") || []
      if (currentValues.includes(value)) {
        params.set(filterType, currentValues.filter((v) => v !== value).join(","))
      } else {
        params.set(filterType, [...currentValues, value].join(","))
      }
    }

    if (params.get(filterType) === "") {
      params.delete(filterType)
    }

    router.push(`/dashboard/trips?${params.toString()}`)
  }

  const removeFilter = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filterType === "startDate" || filterType === "endDate") {
      params.delete(filterType)
    } else {
      const currentValues = params.get(filterType)?.split(",") || []
      params.set(filterType, currentValues.filter((v) => v !== value).join(","))
    }

    if (params.get(filterType) === "") {
      params.delete(filterType)
    }

    router.push(`/dashboard/trips?${params.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <Card className="p-6 lg:col-span-1 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-gugi text-rally-coral">Recent Trips</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
        {showFilters && (
          <div className="mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="make">Make</Label>
              <Select value={filters.make.join(",")} onValueChange={(value) => handleFilterChange("make", value)}>
                <SelectTrigger id="make">
                  <SelectValue placeholder="Select make" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Select value={filters.model.join(",")} onValueChange={(value) => handleFilterChange("model", value)}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={filters.year.join(",")} onValueChange={(value) => handleFilterChange("year", value)}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vin">VIN</Label>
              <Select value={filters.vin.join(",")} onValueChange={(value) => handleFilterChange("vin", value)}>
                <SelectTrigger id="vin">
                  <SelectValue placeholder="Select VIN" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueVins.map((vin) => (
                    <SelectItem key={vin} value={vin}>
                      {vin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([filterType, values]) =>
            Array.isArray(values)
              ? values.map((value) => (
                  <Badge key={`${filterType}-${value}`} variant="secondary">
                    {filterType}: {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-secondary-foreground"
                      onClick={() => removeFilter(filterType, value)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))
              : values && (
                  <Badge key={`${filterType}-${values}`} variant="secondary">
                    {filterType}: {values}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-secondary-foreground"
                      onClick={() => removeFilter(filterType, values)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ),
          )}
        </div>
        <ScrollArea className="flex-grow">
          <div className="space-y-4 pr-4">
            {filteredTrips.map((trip) => (
              <Card
                key={trip.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedTrip?.id === trip.id ? "border-2 border-rally-coral" : "hover:border-rally-pink"
                }`}
                onClick={() => onSelectTrip(trip)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{formatRelative(new Date(trip.startTime), new Date())}</p>
                    <p className="text-sm text-gray-500">
                      Duration: {formatDistance(new Date(trip.startTime), new Date(trip.endTime))}
                    </p>
                    {trip.isActive && (
                      <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded mt-1">
                        Active
                      </span>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Vehicle: {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-white px-2 py-1 rounded ${getScoreColor(trip.score.total)}`}>
                      {trip.score.total.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500">Score</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-rally-pink" />
                    <span>{trip.distance.toFixed(1)} mi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4 text-rally-pink" />
                    <span>{trip.energyUsed.toFixed(1)} kWh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-rally-pink" />
                    <span>{trip.rewards.toFixed(2)} $RALLY</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">${(trip.rewards * 0.1).toFixed(2)} USD</p>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </Card>
      <Card className="p-6 lg:col-span-2 h-full overflow-auto">
        <h2 className="text-2xl font-gugi text-rally-coral mb-4">Trip Details</h2>
        {selectedTrip ? (
          <TripDetails trip={selectedTrip} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Select a trip to view details</div>
        )}
      </Card>
    </div>
  )
}

