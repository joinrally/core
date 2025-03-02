import { StorageProvider, TripFilter, TripUpdate } from "./types"
import { Vehicle, Trip, TripSummary, Score, VehicleMetrics, RouteInfo } from "@/src/utils/types"
import { addMinutes, subHours, format, parseISO, isWithinInterval } from "date-fns"
import { SeededRandom } from "./seeded_random"

/**
 * Mock implementation of the StorageProvider interface.
 * This implementation will be replaced with a real storage provider in the future.
 * For now, it generates random data and stores it in memory.
 */
export class MockStorageProvider implements StorageProvider {
  private seededRandom: SeededRandom
  private mockVehicles: Vehicle[]
  private mockTrips: Trip[]
  private vehicleAverageScores: { [vin: string]: Score }
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



  async getVehicleByVin(vin: string): Promise<Vehicle | undefined> {
    await this.initialized
    return this.mockVehicles.find(vehicle => vehicle.vin === vin)
  }

  async getTripsForVehicle(vehicleVin: string, options?: { limit?: number; offset?: number }): Promise<TripSummary[]> {
    await this.initialized
    let trips = this.mockTrips
      .filter((trip) => trip.vehicleVin === vehicleVin)
      .map((trip) => trip.summary)

    // Apply pagination if options are provided
    if (options) {
      const { limit = 10, offset = 0 } = options
      trips = trips.slice(offset, offset + limit)
    }

    return trips
  }

  async getAllTrips(options?: { limit?: number; offset?: number }): Promise<TripSummary[]> {
    await this.initialized
    let trips = this.mockTrips.map(trip => trip.summary)

    // Apply pagination if options are provided
    if (options) {
      const { limit = 10, offset = 0 } = options
      trips = trips.slice(offset, offset + limit)
    }

    return trips
  }

  async filterTrips(filter: TripFilter): Promise<TripSummary[]> {
    await this.initialized

    let filteredTrips = [...this.mockTrips]

    // Apply filters
    if (filter.vehicleVin) {
      filteredTrips = filteredTrips.filter(trip => trip.vehicleVin === filter.vehicleVin)
    }

    if (filter.tags && filter.tags.length > 0) {
      filteredTrips = filteredTrips.filter(trip => 
        trip.tags && filter.tags!.some(tag => trip.tags!.includes(tag))
      )
    }

    if (filter.purpose) {
      filteredTrips = filteredTrips.filter(trip => trip.purpose === filter.purpose)
    }

    if (filter.startTimeFrom) {
      filteredTrips = filteredTrips.filter(trip => trip.startTime >= filter.startTimeFrom!)
    }

    if (filter.startTimeTo) {
      filteredTrips = filteredTrips.filter(trip => trip.startTime <= filter.startTimeTo!)
    }

    if (filter.endTimeFrom) {
      filteredTrips = filteredTrips.filter(trip => trip.endTime && trip.endTime >= filter.endTimeFrom!)
    }

    if (filter.endTimeTo) {
      filteredTrips = filteredTrips.filter(trip => trip.endTime && trip.endTime <= filter.endTimeTo!)
    }

    if (filter.minDistance !== undefined) {
      filteredTrips = filteredTrips.filter(trip => trip.distance >= filter.minDistance!)
    }

    if (filter.maxDistance !== undefined) {
      filteredTrips = filteredTrips.filter(trip => trip.distance <= filter.maxDistance!)
    }

    // Apply pagination
    const limit = filter.limit || filteredTrips.length
    const offset = filter.offset || 0

    return filteredTrips
      .slice(offset, offset + limit)
      .map(trip => trip.summary)
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

  async startTrip(vehicleVin: string, tripDetails?: { tags?: string[]; purpose?: string }): Promise<Trip> {
    await this.initialized
    // Check if vehicle exists
    const vehicle = await this.getVehicleByVin(vehicleVin)
    if (!vehicle) {
      throw new Error(`Vehicle with VIN ${vehicleVin} not found`)
    }

    // Check if there's already an active trip for this vehicle
    const activeTrip = await this.getActiveTrip(vehicleVin)
    if (activeTrip) {
      throw new Error(`Vehicle with VIN ${vehicleVin} already has an active trip`)
    }

    // Create a new trip
    const tripId = `trip-${vehicleVin}-${Date.now()}`
    const startTime = new Date().toISOString()
    
    const newTrip: Trip = {
      id: tripId,
      vehicleVin,
      vehicle,
      startTime,
      endTime: '', // Will be set when the trip ends
      metrics: [],
      score: {
        energyScore: 0,
        safetyScore: 0,
        total: 0,
        timestamp: startTime
      },
      distance: 0,
      energyUsed: 0,
      rewards: 0,
      isActive: true,
      summary: {
        id: tripId,
        vehicleVin,
        vehicle,
        startTime,
        endTime: '', // Will be set when the trip ends
        distance: 0,
        estimatedEnergyUsed: 0,
        estimatedScore: 0,
        estimatedRewards: 0
      }
    }

    // Add optional details if provided
    if (tripDetails) {
      if (tripDetails.tags) {
        newTrip.tags = tripDetails.tags;
        newTrip.summary.tags = tripDetails.tags;
      }
      if (tripDetails.purpose) {
        newTrip.purpose = tripDetails.purpose;
        newTrip.summary.purpose = tripDetails.purpose;
      }
    }

    // Add the trip to our list
    this.mockTrips.unshift(newTrip) // Add to the beginning to keep "most recent first" order
    
    return newTrip
  }

  async updateTrip(tripId: string, updates: TripUpdate): Promise<Trip | undefined> {
    await this.initialized
    const trip = await this.getTripById(tripId)
    if (!trip) {
      return undefined
    }

    // Update tags if provided
    if (updates.tags !== undefined) {
      trip.tags = updates.tags
      trip.summary.tags = updates.tags
    }

    // Update purpose if provided
    if (updates.purpose !== undefined) {
      trip.purpose = updates.purpose
      trip.summary.purpose = updates.purpose
    }

    // Update route information if provided
    if (updates.route !== undefined) {
      trip.route = updates.route
      trip.summary.route = updates.route
    }

    return trip
  }

  async getTripsWithTags(tags: string[], options?: { limit?: number; offset?: number }): Promise<TripSummary[]> {
    await this.initialized

    // Filter trips that have at least one of the specified tags
    const filteredTrips = this.mockTrips.filter(trip => 
      trip.tags && tags.some(tag => trip.tags!.includes(tag))
    )

    // Apply pagination if options are provided
    if (options) {
      const { limit = 10, offset = 0 } = options
      return filteredTrips
        .slice(offset, offset + limit)
        .map(trip => trip.summary)
    }

    return filteredTrips.map(trip => trip.summary)
  }

  async endTrip(tripId: string): Promise<Trip | undefined> {
    await this.initialized
    const trip = await this.getTripById(tripId)
    if (!trip) {
      return undefined
    }

    if (!trip.isActive) {
      throw new Error(`Trip with ID ${tripId} is not active`)
    }

    // End the trip
    const endTime = new Date().toISOString()
    trip.endTime = endTime
    trip.isActive = false
    trip.summary.endTime = endTime

    // If metrics are present, use them to estimate trip stats
    if (trip.metrics.length > 0) {
      // Simple calculation of distance and energy used based on metrics
      // In a real implementation, this would be more sophisticated
      trip.distance = this.calculateDistance(trip.metrics)
      trip.energyUsed = this.calculateEnergyUsed(trip.metrics)
      trip.summary.distance = trip.distance
      trip.summary.estimatedEnergyUsed = trip.energyUsed
    } else {
      // Generate some random values if no metrics available
      trip.distance = this.seededRandom.nextRange(5, 50) // 5-50 miles
      trip.energyUsed = trip.distance * this.seededRandom.nextRange(250, 350) / 1000 // 250-350 Wh/mile
      trip.summary.distance = trip.distance
      trip.summary.estimatedEnergyUsed = trip.energyUsed
    }

    // Generate a score for the trip
    const score = await this.generateScoreForTrip(tripId)
    trip.score = score
    trip.summary.estimatedScore = score.total

    // Calculate rewards for the trip
    const rewards = await this.getRewardsForTrip(tripId)
    trip.rewards = rewards
    trip.summary.estimatedRewards = rewards

    return trip
  }

  async getActiveTrip(vehicleVin: string): Promise<Trip | undefined> {
    await this.initialized
    return this.mockTrips.find(trip => trip.vehicleVin === vehicleVin && trip.isActive)
  }

  async getActiveTrips(): Promise<Trip[]> {
    await this.initialized
    return this.mockTrips.filter(trip => trip.isActive)
  }

  async getAggregatedMetricsForVehicle(vehicleVin: string) {
    await this.initialized
    const vehicleTrips = await this.getTripsForVehicle(vehicleVin)
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
      averageScores: this.vehicleAverageScores[vehicleVin],
    }
  }

  async addMetricsToVehicle(vehicleVin: string, metrics: VehicleMetrics): Promise<boolean> {
    await this.initialized
    // Check if vehicle exists
    const vehicle = await this.getVehicleByVin(vehicleVin)
    if (!vehicle) {
      throw new Error(`Vehicle with VIN ${vehicleVin} not found`)
    }

    // Check if there's an active trip for this vehicle
    const activeTrip = await this.getActiveTrip(vehicleVin)
    if (!activeTrip) {
      // No active trip, return false to indicate metrics weren't associated with a trip
      return false
    }

    // Add metrics to the active trip
    activeTrip.metrics.push(metrics)
    return true
  }

  async generateScoreForTrip(tripId: string): Promise<Score> {
    await this.initialized
    const trip = await this.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    // Generate a random score for the trip
    // In a real implementation, this would use AI to analyze the metrics
    const baseScore = this.seededRandom.nextInt(60, 100)
    const energyScore = Math.round(this.generateRandomScore(baseScore, 10))
    const safetyScore = Math.round(this.generateRandomScore(baseScore, 10))
    const totalScore = Math.round((energyScore + safetyScore) / 2)

    const score: Score = {
      energyScore,
      safetyScore,
      total: totalScore,
      timestamp: trip.endTime || new Date().toISOString()
    }

    return score
  }

  async getRewardsForTrip(tripId: string): Promise<number> {
    await this.initialized
    const trip = await this.getTripById(tripId)
    if (!trip) {
      throw new Error(`Trip with ID ${tripId} not found`)
    }

    // Calculate rewards based on distance and score
    // In a real implementation, this would use more sophisticated logic
    return Math.round(trip.distance * (trip.score.total / 100))
  }

  async getRewardsForVehicle(vehicleVin: string, startTime?: string, endTime?: string): Promise<number> {
    await this.initialized
    // Get all trips for this vehicle
    const allTrips = await this.getTripsForVehicle(vehicleVin)

    // Filter trips by timeframe if provided
    let filteredTrips = allTrips
    if (startTime && endTime) {
      const start = parseISO(startTime)
      const end = parseISO(endTime)
      filteredTrips = allTrips.filter(trip => {
        const tripStart = parseISO(trip.startTime)
        return isWithinInterval(tripStart, { start, end })
      })
    }

    // Sum up rewards for all trips
    return filteredTrips.reduce((sum, trip) => sum + trip.estimatedRewards, 0)
  }

  async getAllRewards(startTime?: string, endTime?: string): Promise<{ vehicleVin: string; rewards: number }[]> {
    await this.initialized
    // Get all vehicles
    const vehicles = await this.getVehicles()

    // Calculate rewards for each vehicle
    const rewards = await Promise.all(
      vehicles.map(async vehicle => ({
        vehicleVin: vehicle.vin,
        rewards: await this.getRewardsForVehicle(vehicle.vin, startTime, endTime)
      }))
    )

    // Return only vehicles with non-zero rewards
    return rewards.filter(reward => reward.rewards > 0)
  }

  getVehicleAverageScores(): { [vin: string]: Score } {
    return this.vehicleAverageScores
  }

  // Move all the existing helper methods as private methods...
  private createMockVehicles(): Vehicle[] {
    return [
      {
        name: "My Tesla Model S",
        make: "Tesla",
        model: "Model S",
        year: 2022,
        vin: "5YJ3E1EA1LF123456",
        image: "/tesla-model-s.jpg",
      },
      {
        name: "Rivian R1T Adventure",
        make: "Rivian",
        model: "R1T",
        year: 2023,
        vin: "7FTTW0000NLP12345",
        image: "/rivian-r1t.jpg",
      },
      {
        name: "Lucid Air Dream",
        make: "Lucid",
        model: "Air",
        year: 2023,
        vin: "1LUD22AC6P8000123",
        image: "/lucid-air.jpg",
      }
    ]
  }

  private generateVehicleAverageScores(): { [vin: string]: Score } {
    const vehicleScores: { [vin: string]: Score } = {}

    this.mockVehicles.forEach((vehicle) => {
      const baseScore = this.seededRandom.nextInt(60, 100)
      vehicleScores[vehicle.vin] = {
        energyScore: Math.round(this.generateRandomScore(baseScore, 10)),
        safetyScore: Math.round(this.generateRandomScore(baseScore, 10)),
        total: 0,
        timestamp: new Date().toISOString(),
      }
      vehicleScores[vehicle.vin].total = Math.round(
        (vehicleScores[vehicle.vin].energyScore + vehicleScores[vehicle.vin].safetyScore) / 2
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
          id: `trip-${vehicle.vin}-${i}`,
          vehicleVin: vehicle.vin,
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
            id: `trip-${vehicle.vin}-${i}`,
            vehicleVin: vehicle.vin,
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

  // Calculate distance between two coordinates using Haversine formula
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate total distance for a trip based on metrics
  private calculateDistance(metrics: VehicleMetrics[]): number {
    if (metrics.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < metrics.length; i++) {
      const prevMetric = metrics[i - 1];
      const currentMetric = metrics[i];
      totalDistance += this.calculateHaversineDistance(
        prevMetric.latitude, prevMetric.longitude,
        currentMetric.latitude, currentMetric.longitude
      );
    }

    return Math.round(totalDistance * 10) / 10; // Round to 1 decimal place
  }

  // Calculate energy used based on metrics
  private calculateEnergyUsed(metrics: VehicleMetrics[]): number {
    if (metrics.length === 0) return 0;

    // Simple calculation based on average power and time
    let totalEnergy = 0;
    for (const metric of metrics) {
      // Power = Voltage * Current (in watts)
      const powerWatts = metric.packVoltage * metric.packCurrent;
      // Assuming each metric represents 1 minute of data
      // Energy = Power * Time (in watt-hours)
      const energyWh = powerWatts * (1 / 60); // 1/60 hour (1 minute)
      totalEnergy += energyWh;
    }

    // Convert Wh to kWh
    return Math.round(totalEnergy / 1000 * 10) / 10; // Round to 1 decimal place
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