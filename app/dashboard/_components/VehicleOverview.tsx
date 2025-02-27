"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ScrollArea, ScrollBar } from "@/src/components/ui/scroll-area"
import { Card } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { ChevronLeft, ChevronRight, Trophy, Battery, Route, Coins, X, Car, Filter } from "lucide-react"
import type { Vehicle, AggregatedMetrics } from "@/src/utils/types"
import { getScoreColor } from "@/src/utils/scoreColor"

interface VehicleOverviewProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSelectVehicle: (vehicle: Vehicle) => void
}

export default function VehicleOverview({ vehicles, selectedVehicle, onSelectVehicle }: VehicleOverviewProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [aggregatedMetrics, setAggregatedMetrics] = useState<AggregatedMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters = {
    make: searchParams.get("make")?.split(",") || [],
    model: searchParams.get("model")?.split(",") || [],
    year: searchParams.get("year")?.split(",") || [],
    vin: searchParams.get("vin")?.split(",") || [],
  }

  useEffect(() => {
    if (selectedVehicle) {
      setIsLoading(true)
      setError(null)
      fetch(`/api/vehicles/${selectedVehicle.id}/metrics`)
        .then((res) => res.json())
        .then((data) => {
          setAggregatedMetrics(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Error fetching vehicle metrics:", err)
          setError("Failed to load vehicle metrics")
          setIsLoading(false)
        })
    }
  }, [selectedVehicle])

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      (filters.make.length === 0 || filters.make.includes(vehicle.make)) &&
      (filters.model.length === 0 || filters.model.includes(vehicle.model)) &&
      (filters.year.length === 0 || filters.year.includes(vehicle.year.toString())) &&
      (filters.vin.length === 0 || filters.vin.includes(vehicle.vin)),
  )

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  const uniqueMakes = Array.from(new Set(vehicles.map((v) => v.make)))
  const uniqueModels = Array.from(new Set(vehicles.map((v) => v.model)))
  const uniqueYears = Array.from(new Set(vehicles.map((v) => v.year.toString())))
  const uniqueVins = Array.from(new Set(vehicles.map((v) => v.vin)))

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentValues = params.get(filterType)?.split(",") || []

    if (currentValues.includes(value)) {
      params.set(filterType, currentValues.filter((v) => v !== value).join(","))
    } else {
      params.set(filterType, [...currentValues, value].join(","))
    }

    if (params.get(filterType) === "") {
      params.delete(filterType)
    }

    router.push(`/dashboard/vehicles?${params.toString()}`)
  }

  const removeFilter = (filterType: keyof typeof filters, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentValues = params.get(filterType)?.split(",") || []
    params.set(filterType, currentValues.filter((v) => v !== value).join(","))

    if (params.get(filterType) === "") {
      params.delete(filterType)
    }

    router.push(`/dashboard/vehicles?${params.toString()}`)
  }

  const handleViewTrips = () => {
    if (selectedVehicle) {
      router.push(`/dashboard/trips?vin=${selectedVehicle.vin}`)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 lg:p-6 dark:bg-gray-800">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
          <h2 className="text-xl lg:text-2xl font-gugi text-rally-coral dark:text-rally-pink mb-2 lg:mb-0">
            Your Vehicles
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 dark:text-gray-300"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {showFilters && (
          <>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="make" className="dark:text-gray-300">
                  Make
                </Label>
                <Select value={filters.make.join(",")} onValueChange={(value) => handleFilterChange("make", value)}>
                  <SelectTrigger id="make" className="dark:bg-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    {uniqueMakes.map((make) => (
                      <SelectItem key={make} value={make} className="dark:text-gray-300">
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="model" className="dark:text-gray-300">
                  Model
                </Label>
                <Select value={filters.model.join(",")} onValueChange={(value) => handleFilterChange("model", value)}>
                  <SelectTrigger id="model" className="dark:bg-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    {uniqueModels.map((model) => (
                      <SelectItem key={model} value={model} className="dark:text-gray-300">
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year" className="dark:text-gray-300">
                  Year
                </Label>
                <Select value={filters.year.join(",")} onValueChange={(value) => handleFilterChange("year", value)}>
                  <SelectTrigger id="year" className="dark:bg-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    {uniqueYears.map((year) => (
                      <SelectItem key={year} value={year} className="dark:text-gray-300">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vin" className="dark:text-gray-300">
                  VIN
                </Label>
                <Select value={filters.vin.join(",")} onValueChange={(value) => handleFilterChange("vin", value)}>
                  <SelectTrigger id="vin" className="dark:bg-gray-700 dark:text-gray-300">
                    <SelectValue placeholder="Select VIN" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    {uniqueVins.map((vin) => (
                      <SelectItem key={vin} value={vin} className="dark:text-gray-300">
                        {vin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(filters).map(([filterType, values]) =>
                values.map((value) => (
                  <Badge
                    key={`${filterType}-${value}`}
                    variant="secondary"
                    className="dark:bg-gray-700 dark:text-gray-300"
                  >
                    {filterType}: {value}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-secondary-foreground dark:text-gray-400"
                      onClick={() => removeFilter(filterType as keyof typeof filters, value)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )),
              )}
            </div>
          </>
        )}

        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 dark:bg-gray-700 dark:text-gray-300"
            onClick={() => handleScroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <ScrollArea className="w-full">
            <div ref={scrollContainerRef} className="flex space-x-4 p-4">
              {filteredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className={`flex-shrink-0 w-[200px] p-4 cursor-pointer transition-colors ${selectedVehicle?.id === vehicle.id
                    ? "bg-gradient-to-r from-rally-pink to-rally-coral text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  onClick={() => onSelectVehicle(vehicle)}
                >
                  <div className="relative w-full h-[120px] bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                    {vehicle.image ? (
                      <Image
                        src={vehicle.image || "/placeholder.svg"}
                        alt={vehicle.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const parent = target.parentElement
                          if (parent && !parent.querySelector("svg")) {
                            parent.innerHTML =
                              '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 dark:text-gray-600"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>'
                          }
                        }}
                      />
                    ) : (
                      <Car className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                    )}
                  </div>
                  <h3 className="font-medium mt-2">{vehicle.name}</h3>
                  <p className="text-sm opacity-75">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm opacity-75">Year: {vehicle.year}</p>
                  <p className="text-sm opacity-75">VIN: {vehicle.vin}</p>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 dark:bg-gray-700 dark:text-gray-300"
            onClick={() => handleScroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
      {selectedVehicle && (
        <Card className="p-4 lg:p-6 dark:bg-gray-800">
          <h2 className="text-xl lg:text-2xl font-gugi text-rally-coral dark:text-rally-pink mb-4">
            Vehicle Scores for {selectedVehicle.name}
          </h2>
          {isLoading ? (
            <div className="text-center">Loading vehicle metrics...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : aggregatedMetrics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-rally-pink" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                      <p className="text-xl font-bold dark:text-white">
                        {aggregatedMetrics.averageScores?.total.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Route className="h-5 w-5 text-rally-pink" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Distance</p>
                      <p className="text-xl font-bold dark:text-white">
                        {aggregatedMetrics.totalDistance.toFixed(0)} mi
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Battery className="h-5 w-5 text-rally-pink" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Energy Efficiency</p>
                      <p className="text-xl font-bold dark:text-white">
                        {aggregatedMetrics.averageEnergyEfficiency.toFixed(1)} Wh/mi
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-rally-pink" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Rewards</p>
                      <p className="text-xl font-bold dark:text-white">
                        {aggregatedMetrics.totalRewards.toFixed(2)} $RALLY
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${(aggregatedMetrics.totalRewards * 0.1).toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="p-6">
                <h4 className="font-gugi text-xl text-rally-pink mb-4">Vehicle Scores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded text-white ${getScoreColor(aggregatedMetrics.averageScores.energyScore)} bg-opacity-80`}
                  >
                    <p className="text-sm font-medium">Energy Efficiency</p>
                    <p className="text-xl font-bold">{Math.round(aggregatedMetrics.averageScores.energyScore)}</p>
                  </div>
                  <div
                    className={`p-4 rounded text-white ${getScoreColor(aggregatedMetrics.averageScores.safetyScore)} bg-opacity-80`}
                  >
                    <p className="text-sm font-medium">Safety</p>
                    <p className="text-xl font-bold">{Math.round(aggregatedMetrics.averageScores.safetyScore)}</p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center">No metrics available for this vehicle.</div>
          )}
          <div className="mt-6">
            <Button onClick={handleViewTrips} className="bg-rally-coral hover:bg-rally-pink text-white">
              View Recent Trips
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

