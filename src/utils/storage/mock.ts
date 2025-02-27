import { StorageProvider } from "./types"
import { Vehicle, Trip, TripSummary, Score, VehicleMetrics } from "@/src/utils/types"
import { addMinutes, subHours } from "date-fns"
import { SeededRandom } from "./seeded_random"

export class MockStorageProvider implements StorageProvider {
  private seededRandom: SeededRandom
  private mockVehicles: Vehicle[]
  private mockTrips: Trip[]
  private vehicleAverageScores: { [key: string]: Score }
  private initialized: Promise<void>

  constructor() {
    this.seededRandom = new SeededRandom(12345)
    this.mockVehicles = this.createMockVehicles()
    this.mockTrips = []
    this.vehicleAverageScores = this.generateVehicleAverageScores()
    this.initialized = this.initialize()
  }

  private async initialize() {
    try {
      this.mockTrips = await this.generateMockTrips()
      if (this.mockTrips.length > 0) {
        this.mockTrips[0].isActive = true
      }
      console.log(`Generated ${this.mockTrips.length} mock trips`)
    } catch (error) {
      console.error("Error generating mock trips:", error)
    }
  }

  // Implementation of interface methods
  async getVehicles(): Promise<Vehicle[]> {
    await this.initialized
    return this.mockVehicles
  }

  async getTripsForVehicle(vehicleId: string): Promise<TripSummary[]> {
    await this.initialized
    return this.mockTrips
      .filter((trip) => trip.vehicleId === vehicleId)
      .map((trip) => trip.summary)
  }

  async getTripById(tripId: string): Promise<Trip | undefined> {
    await this.initialized
    const trip = this.mockTrips.find((trip) => trip.id === tripId)
    if (trip && trip.metrics.length === 0) {
      const params = this.generateTripParameters()
      const metrics = await this.generateMockMetrics(params)
      trip.metrics = metrics
      trip.energyUsed = trip.summary.estimatedEnergyUsed
      trip.rewards = trip.summary.estimatedRewards
    }
    return trip
  }

  async getAggregatedMetricsForVehicle(vehicleId: string) {
    const vehicleTrips = await this.getTripsForVehicle(vehicleId)
    const totalTrips = vehicleTrips.length

    if (totalTrips === 0) {
      return null
    }

    const totalDistance = vehicleTrips.reduce((sum, trip) => sum + trip.distance, 0)
    const totalEnergyUsed = vehicleTrips.reduce((sum, trip) => sum + trip.estimatedEnergyUsed, 0)
    const totalRewards = vehicleTrips.reduce((sum, trip) => sum + trip.estimatedRewards, 0)
    const averageScore = vehicleTrips.reduce((sum, trip) => sum + trip.estimatedScore, 0) / totalTrips
    const averageSpeed = 0 // Placeholder
    const averageEnergyEfficiency = totalDistance > 0 ? (totalEnergyUsed / totalDistance) * 1000 : 0

    return {
      totalTrips,
      totalDistance,
      totalEnergyUsed,
      totalRewards,
      averageScore,
      averageSpeed,
      averageEnergyEfficiency,
      averageScores: this.vehicleAverageScores[vehicleId],
    }
  }

  getVehicleAverageScores(): { [key: string]: Score } {
    return this.vehicleAverageScores
  }

  // Move all the existing helper methods as private methods...
  private createMockVehicles(): Vehicle[] {
    return [
      {
        id: "1",
        name: "My Tesla Model S",
        make: "Tesla",
        model: "Model S",
        year: 2022,
        vin: "5YJ3E1EA1LF123456",
        image: "/tesla-model-s.jpg",
      },
      // ... rest of the mock vehicles
    ]
  }

  private generateVehicleAverageScores(): { [key: string]: Score } {
    const vehicleScores: { [key: string]: Score } = {}

    this.mockVehicles.forEach((vehicle) => {
      const baseScore = this.seededRandom.nextInt(60, 100)
      vehicleScores[vehicle.id] = {
        energyScore: Math.round(this.generateRandomScore(baseScore, 10)),
        safetyScore: Math.round(this.generateRandomScore(baseScore, 10)),
        total: 0,
        timestamp: new Date().toISOString(),
      }
      vehicleScores[vehicle.id].total = Math.round(
        (vehicleScores[vehicle.id].energyScore + vehicleScores[vehicle.id].safetyScore) / 2
      )
    })

    return vehicleScores
  }

  private generateRandomScore(baseScore: number, range: number): number {
    return Math.max(0, Math.min(100, baseScore + (this.seededRandom.next() - 0.5) * range * 2))
  }

  private async generateMockTrips(): Promise<Trip[]> {
    const trips: Trip[] = []
    const now = new Date()

    for (const vehicle of this.mockVehicles) {
      // Generate 5-10 trips per vehicle
      const numTrips = this.seededRandom.nextInt(5, 10)
      
      for (let i = 0; i < numTrips; i++) {
        const startTime = subHours(now, this.seededRandom.nextInt(1, 720)) // Up to 30 days ago
        const duration = this.seededRandom.nextInt(15, 120) // 15-120 minutes
        const endTime = addMinutes(startTime, duration)
        
        const distance = this.seededRandom.nextRange(5, 100) // 5-100 miles
        const energyUsed = distance * this.seededRandom.nextRange(250, 350) / 1000 // 250-350 Wh/mile
        const baseScore = this.seededRandom.nextInt(60, 100)
        
        const score: Score = {
          energyScore: Math.round(this.generateRandomScore(baseScore, 10)),
          safetyScore: Math.round(this.generateRandomScore(baseScore, 10)),
          total: 0,
          timestamp: endTime.toISOString()
        }
        score.total = Math.round((score.energyScore + score.safetyScore) / 2)

        const rewards = Math.round(distance * score.total / 100) // Rewards based on distance and score

        const trip: Trip = {
          id: `trip-${vehicle.id}-${i}`,
          vehicleId: vehicle.id,
          vehicle: vehicle,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          metrics: [], // Metrics will be generated on demand
          score: score,
          distance: distance,
          energyUsed: energyUsed,
          rewards: rewards,
          isActive: false,
          summary: {
            id: `trip-${vehicle.id}-${i}`,
            vehicleId: vehicle.id,
            vehicle: vehicle,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            distance: distance,
            estimatedEnergyUsed: energyUsed,
            estimatedScore: score.total,
            estimatedRewards: rewards
          }
        }

        trips.push(trip)
      }
    }

    // Sort trips by start time, most recent first
    return trips.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
  }

  private generateTripParameters() {
    return {
      baseSpeed: this.seededRandom.nextRange(30, 70),
      speedVariation: this.seededRandom.nextRange(5, 15),
      basePower: this.seededRandom.nextRange(15, 25),
      powerVariation: this.seededRandom.nextRange(5, 10),
      baseAcceleration: 0,
      accelerationVariation: this.seededRandom.nextRange(0.1, 0.3),
      brakingFrequency: this.seededRandom.nextRange(0.05, 0.15)
    }
  }

  private async generateMockMetrics(params: any): Promise<VehicleMetrics[]> {
    const metrics: VehicleMetrics[] = []
    const numPoints = 60 // One point per minute
    let currentSpeed = params.baseSpeed
    let currentPower = params.basePower
    let currentAcceleration = params.baseAcceleration
    let latitude = 37.7749 // San Francisco starting point
    let longitude = -122.4194

    for (let i = 0; i < numPoints; i++) {
      // Update parameters with random variations
      currentSpeed += (this.seededRandom.next() - 0.5) * params.speedVariation
      currentPower += (this.seededRandom.next() - 0.5) * params.powerVariation
      currentAcceleration = (this.seededRandom.next() - 0.5) * params.accelerationVariation

      // Simulate random braking events
      const isBraking = this.seededRandom.next() < params.brakingFrequency
      
      // Update position (very simplified)
      const speedInDegrees = currentSpeed * 0.00001 // Rough conversion
      latitude += speedInDegrees * Math.cos(i * 0.1) // Create a curved path
      longitude += speedInDegrees * Math.sin(i * 0.1)

      metrics.push({
        speed: Math.max(0, currentSpeed),
        packVoltage: 400 + (this.seededRandom.next() - 0.5) * 10,
        packCurrent: currentPower * 2.5,
        acceleration: currentAcceleration,
        brakePedal: isBraking ? this.seededRandom.nextRange(0.3, 1.0) : 0,
        timestamp: new Date().toISOString(),
        latitude,
        longitude
      })
    }

    return metrics
  }
} 