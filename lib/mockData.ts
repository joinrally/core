import type { Vehicle, Trip, VehicleMetrics, Score, TripSummary } from "@/app/dashboard/types"
import { addMinutes, subHours } from "date-fns"

// Seeded random number generator
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32
    return this.seed / 2 ** 32
  }

  nextRange(min: number, max: number): number {
    return min + (max - min) * this.next()
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1))
  }
}

const seededRandom = new SeededRandom(12345)

// Mock Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: "1",
    name: "My Tesla Model S",
    make: "Tesla",
    model: "Model S",
    year: 2022,
    vin: "5YJ3E1EA1LF123456",
    image: "/tesla-model-s.jpg",
  },
  {
    id: "2",
    name: "Family Model Y",
    make: "Tesla",
    model: "Model Y",
    year: 2023,
    vin: "5YJYGDEE1MF789012",
    image: "/tesla-model-y.jpg",
  },
  {
    id: "3",
    name: "Work Model 3",
    make: "Tesla",
    model: "Model 3",
    year: 2021,
    vin: "5YJ3E1EA1MF345678",
    image: "/tesla-model-3.jpg",
  },
  {
    id: "4",
    name: "Weekend Roadster",
    make: "Tesla",
    model: "Roadster",
    year: 2024,
    vin: "5YJRE1A3XA1901234",
    image: "/tesla-roadster.jpg",
  },
  {
    id: "5",
    name: "Cybertruck",
    make: "Tesla",
    model: "Cybertruck",
    year: 2023,
    vin: "7SAYGDEF9PA567890",
    image: "/tesla-cybertruck.jpg",
  },
]

interface TripParameters {
  startCoords: [number, number]
  endCoords: [number, number]
  desiredSafetyScore: number
  desiredEnergyScore: number
  desiredEfficiencyScore: number
}

interface RouteData {
  coordinates: [number, number][]
  distance: number
  duration: number
}

// Helper function to generate a single metric data point
function generateMetricDataPoint(
  time: number,
  params: TripParameters,
  routeData: RouteData,
  progress: number,
  prevMetric: VehicleMetrics | null,
  longitude: number,
  latitude: number,
): VehicleMetrics {
  const { desiredSafetyScore, desiredEnergyScore, desiredEfficiencyScore } = params
  const { coordinates, distance, duration } = routeData

  const [long, lat] = coordinates[Math.floor(progress * (coordinates.length - 1))]

  // Calculate speed based on route data and desired efficiency
  const avgSpeed = (distance / duration) * 3600 // Convert to mph
  const maxSpeed = Math.min(avgSpeed * 1.2, 90) // Cap at 90 mph
  const minSpeed = Math.max(avgSpeed * 0.8, 5) // Ensure minimum speed
  const targetSpeed = minSpeed + (maxSpeed - minSpeed) * (desiredEfficiencyScore / 100)

  let speed: number
  let acceleration: number

  if (prevMetric) {
    const timeDiff = (time - new Date(prevMetric.timestamp).getTime()) / 1000 // in seconds
    const distanceCovered = calculateHaversineDistance(prevMetric.latitude, prevMetric.longitude, latitude, longitude)
    speed = Math.min((distanceCovered / timeDiff) * 3600, 90) // Convert to mph and cap at 90 mph
    acceleration = (speed - prevMetric.speed) / timeDiff
  } else {
    speed = Math.min(targetSpeed, 90)
    acceleration = 0
  }

  // Adjust speed based on desired safety score
  const safetyFactor = desiredSafetyScore / 100
  speed = Math.min(speed * (0.8 + 0.4 * safetyFactor), 90)

  // Calculate braking based on acceleration and safety score
  const brakePedal = acceleration < 0 ? Math.min(-acceleration * (1 - safetyFactor), 1) : 0

  // Calculate pack voltage and current based on desired energy score and speed
  const baseVoltage = 400
  const baseCurrent = 100
  const energyFactor = desiredEnergyScore / 100
  const speedFactor = speed / 90 // Normalize speed to 0-1 range
  const packVoltage = baseVoltage + seededRandom.nextRange(-20, 20) * (1 - energyFactor)
  const packCurrent = baseCurrent + speedFactor * 200 * (1 - energyFactor)

  return {
    speed,
    packVoltage,
    packCurrent,
    acceleration,
    brakePedal,
    timestamp: new Date(time).toISOString(),
    longitude,
    latitude,
  }
}

// Helper function to generate mock metrics for a trip
async function generateMockMetrics(params: TripParameters): Promise<VehicleMetrics[]> {
  const routeData = await fetchRouteData(params.startCoords, params.endCoords)
  const metrics: VehicleMetrics[] = []
  let time = new Date().getTime()
  const totalDuration = routeData.duration * 60 // Convert minutes to seconds
  const intervalSeconds = 1
  const totalIntervals = Math.ceil(totalDuration / intervalSeconds)

  for (let i = 0; i < totalIntervals; i++) {
    const progress = i / (totalIntervals - 1)
    const currentCoordIndex = Math.floor(progress * (routeData.coordinates.length - 1))
    const [longitude, latitude] = routeData.coordinates[currentCoordIndex]

    const prevMetric = i > 0 ? metrics[i - 1] : null
    const metric = generateMetricDataPoint(time, params, routeData, progress, prevMetric, longitude, latitude)
    metrics.push(metric)
    time += intervalSeconds * 1000 // 1 second intervals
  }

  return metrics
}

// Helper function to calculate score based on metrics and desired scores
function calculateScore(metrics: VehicleMetrics[], params: TripParameters): Score {
  const { desiredSafetyScore, desiredEnergyScore, desiredEfficiencyScore } = params

  // Calculate actual scores based on metrics
  const avgSpeed = metrics.reduce((sum, m) => sum + m.speed, 0) / metrics.length
  const avgAcceleration = metrics.reduce((sum, m) => sum + Math.abs(m.acceleration), 0) / metrics.length
  const avgBraking = metrics.reduce((sum, m) => sum + m.brakePedal, 0) / metrics.length
  const avgPower = metrics.reduce((sum, m) => sum + Math.abs(m.packVoltage * m.packCurrent), 0) / metrics.length

  const safetyScore = Math.max(0, Math.min(100, desiredSafetyScore - avgAcceleration * 10 - avgBraking * 20))
  const energyScore = Math.max(0, Math.min(100, desiredEnergyScore - (avgPower - 15000) / 300))
  const efficiencyScore = Math.max(0, Math.min(100, desiredEfficiencyScore - Math.abs(avgSpeed - 65) * 2))

  const totalScore = (safetyScore + energyScore + efficiencyScore) / 3

  return {
    safetyScore,
    energyScore,
    usageScore: efficiencyScore,
    total: totalScore,
    timestamp: new Date().toISOString(),
  }
}

// Function to generate trip parameters with variance
function generateTripParameters(): TripParameters {
  // Dallas, TX area coordinates
  const dallasArea = {
    minLat: 32.65,
    maxLat: 32.9,
    minLon: -96.95,
    maxLon: -96.7,
  }

  const startLat = seededRandom.nextRange(dallasArea.minLat, dallasArea.maxLat)
  const startLon = seededRandom.nextRange(dallasArea.minLon, dallasArea.maxLon)
  const endLat = seededRandom.nextRange(dallasArea.minLat, dallasArea.maxLat)
  const endLon = seededRandom.nextRange(dallasArea.minLon, dallasArea.maxLon)

  // Calculate appropriate scores based on start and end coordinates
  const distance = calculateHaversineDistance(startLat, startLon, endLat, endLon)
  const baseScore = 70 + seededRandom.nextRange(0, 30) // Base score between 70 and 100

  // Adjust scores based on distance
  const safetyScore = Math.max(60, Math.min(100, baseScore - distance / 2))
  const energyScore = Math.max(60, Math.min(100, baseScore - distance / 3))
  const efficiencyScore = Math.max(60, Math.min(100, baseScore - distance / 4))

  return {
    startCoords: [startLon, startLat],
    endCoords: [endLon, endLat],
    desiredSafetyScore: safetyScore,
    desiredEnergyScore: energyScore,
    desiredEfficiencyScore: efficiencyScore,
  }
}

// Helper function to fetch route data from OSRM
async function fetchRouteData(startCoords: [number, number], endCoords: [number, number]): Promise<RouteData> {
  const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`
  const response = await fetch(url)
  const data = await response.json()

  if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
    throw new Error("Failed to fetch route data")
  }

  const route = data.routes[0]
  return {
    coordinates: route.geometry.coordinates,
    distance: route.distance / 1609.34, // Convert meters to miles
    duration: route.duration / 60, // Convert seconds to minutes
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Update the Trip interface to include a summary
interface TripWithSummary extends Trip {
  summary: TripSummary
}

// Helper function to generate a random score within a range
function generateRandomScore(baseScore: number, range: number): number {
  return Math.max(0, Math.min(100, baseScore + (seededRandom.next() - 0.5) * range * 2))
}

// Generate mock trips
const generateMockTrips = async () => {
  const allTrips: TripWithSummary[] = []

  for (const vehicle of mockVehicles) {
    let lastTripEnd = new Date()

    // Generate vehicle scores
    const vehicleBaseScore = seededRandom.nextInt(60, 100)
    const vehicleEnergyScore = generateRandomScore(vehicleBaseScore, 10)
    const vehicleSafetyScore = generateRandomScore(vehicleBaseScore, 10)
    const vehicleUsageScore = generateRandomScore(vehicleBaseScore, 10)
    const vehicleTotalScore = (vehicleEnergyScore + vehicleSafetyScore + vehicleUsageScore) / 3

    for (let i = 0; i < 10; i++) {
      const params = generateTripParameters()
      try {
        const startTime = new Date(subHours(lastTripEnd, seededRandom.nextInt(1, 48)))
        const endTime = new Date(addMinutes(startTime, seededRandom.nextInt(15, 120)))
        const distance = calculateHaversineDistance(
          params.startCoords[1],
          params.startCoords[0],
          params.endCoords[1],
          params.endCoords[0],
        )

        const tripBaseScore = seededRandom.nextInt(60, 100)
        const energyScore = generateRandomScore(tripBaseScore, 10)
        const safetyScore = generateRandomScore(tripBaseScore, 10)
        const usageScore = generateRandomScore(tripBaseScore, 10)
        const totalScore = (energyScore + safetyScore + usageScore) / 3

        const tripSummary: TripSummary = {
          id: `trip-${vehicle.id}-${i}`,
          vehicleId: vehicle.id,
          vehicle: {
            ...vehicle,
            score: {
              energyScore: vehicleEnergyScore,
              safetyScore: vehicleSafetyScore,
              usageScore: vehicleUsageScore,
              total: vehicleTotalScore,
              timestamp: new Date().toISOString(),
            },
          },
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          distance,
          estimatedEnergyUsed: distance * seededRandom.nextRange(0.3, 0.5), // Estimated kWh/mile
          estimatedScore: totalScore,
          estimatedRewards: seededRandom.nextRange(0.5, 2.0),
        }

        allTrips.push({
          ...tripSummary,
          summary: tripSummary,
          metrics: [],
          score: {
            safetyScore,
            energyScore,
            usageScore,
            total: totalScore,
            timestamp: new Date().toISOString(),
          },
          energyUsed: 0,
          rewards: 0,
          isActive: false,
        })

        lastTripEnd = endTime
      } catch (error) {
        console.error(`Error generating trip for vehicle ${vehicle.id}:`, error)
      }
    }
  }

  return allTrips.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
}

function generateVehicleAverageScores(): { [key: string]: Score } {
  const vehicleScores: { [key: string]: Score } = {}

  mockVehicles.forEach((vehicle) => {
    const baseScore = seededRandom.nextInt(60, 100)
    vehicleScores[vehicle.id] = {
      energyScore: Math.round(generateRandomScore(baseScore, 10)),
      safetyScore: Math.round(generateRandomScore(baseScore, 10)),
      usageScore: Math.round(generateRandomScore(baseScore, 10)),
      total: 0,
      timestamp: new Date().toISOString(),
    }
    vehicleScores[vehicle.id].total = Math.round(
      (vehicleScores[vehicle.id].energyScore +
        vehicleScores[vehicle.id].safetyScore +
        vehicleScores[vehicle.id].usageScore) /
        3,
    )
  })

  return vehicleScores
}

export const vehicleAverageScores = generateVehicleAverageScores()

// Update the mockTrips export to use the async function
export let mockTrips: TripWithSummary[] = []

// Initialize mockTrips
;(async () => {
  try {
    mockTrips = await generateMockTrips()
    if (mockTrips.length > 0) {
      mockTrips[0].isActive = true
    }
    console.log(`Generated ${mockTrips.length} mock trips`)
  } catch (error) {
    console.error("Error generating mock trips:", error)
  }
})()

// Helper function to get trips for a specific vehicle
export async function getTripsForVehicle(vehicleId: string): Promise<TripSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 0)) // Ensure mockTrips is initialized
  return mockTrips.filter((trip) => trip.vehicleId === vehicleId).map((trip) => trip.summary)
}

// Helper function to get a specific trip by ID
export async function getTripById(tripId: string): Promise<Trip | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 0)) // Ensure mockTrips is initialized
  const trip = mockTrips.find((trip) => trip.id === tripId)
  if (trip && trip.metrics.length === 0) {
    // Generate detailed trip data only when requested
    const params = generateTripParameters()
    const metrics = await generateMockMetrics(params)
    trip.metrics = metrics
    trip.energyUsed = trip.summary.estimatedEnergyUsed
    trip.rewards = trip.summary.estimatedRewards
  }
  return trip
}

// Helper function to get aggregated metrics for a vehicle
export async function getAggregatedMetricsForVehicle(vehicleId: string) {
  const vehicleTrips = await getTripsForVehicle(vehicleId)
  const totalTrips = vehicleTrips.length

  if (totalTrips === 0) {
    return null
  }

  const totalDistance = vehicleTrips.reduce((sum, trip) => sum + trip.distance, 0)
  const totalEnergyUsed = vehicleTrips.reduce((sum, trip) => sum + trip.estimatedEnergyUsed, 0)
  const totalRewards = vehicleTrips.reduce((sum, trip) => sum + trip.estimatedRewards, 0)
  const averageScore = vehicleTrips.reduce((sum, trip) => sum + trip.estimatedScore, 0) / totalTrips
  const averageSpeed = 0 // Placeholder, needs recalculation based on new data structure
  const averageEnergyEfficiency = totalDistance > 0 ? (totalEnergyUsed / totalDistance) * 1000 : 0 // Wh/mi

  return {
    totalTrips,
    totalDistance,
    totalEnergyUsed,
    totalRewards,
    averageScore,
    averageSpeed,
    averageEnergyEfficiency,
    averageScores: vehicleAverageScores[vehicleId],
  }
}

