import type { Vehicle, Trip, TripSummary, Score, VehicleMetrics, RouteInfo } from '@/src/utils/types'

export interface TripFilter {
  vehicleVin?: string
  tags?: string[]
  startTimeFrom?: string
  startTimeTo?: string
  endTimeFrom?: string
  endTimeTo?: string
  minDistance?: number
  maxDistance?: number
  purpose?: string
  limit?: number
  offset?: number
}

export interface TripUpdate {
  tags?: string[]
  purpose?: string
  route?: RouteInfo
}

export interface StorageProvider {
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>
  getVehicleByVin(vin: string): Promise<Vehicle | undefined>
  
  // Trip operations
  getTripsForVehicle(vehicleVin: string, options?: { limit?: number; offset?: number }): Promise<TripSummary[]>
  getAllTrips(options?: { limit?: number; offset?: number }): Promise<TripSummary[]>
  filterTrips(filter: TripFilter): Promise<TripSummary[]>
  getTripById(tripId: string): Promise<Trip | undefined>
  startTrip(vehicleVin: string, tripDetails?: { tags?: string[]; purpose?: string }): Promise<Trip>
  endTrip(tripId: string): Promise<Trip | undefined>
  updateTrip(tripId: string, updates: TripUpdate): Promise<Trip | undefined>
  getActiveTrip(vehicleVin: string): Promise<Trip | undefined>
  getActiveTrips(): Promise<Trip[]>
  getTripsWithTags(tags: string[], options?: { limit?: number; offset?: number }): Promise<TripSummary[]>
  
  // Metrics operations
  getAggregatedMetricsForVehicle(vehicleVin: string): Promise<{
    totalTrips: number
    totalDistance: number
    totalEnergyUsed: number
    totalRewards: number
    averageScore: number
    averageSpeed: number
    averageEnergyEfficiency: number
    averageScores: Score
  } | null>
  addMetricsToVehicle(vehicleVin: string, metrics: VehicleMetrics): Promise<boolean>
  
  // Scoring operations
  generateScoreForTrip(tripId: string): Promise<Score>
  
  // Rewards operations
  getRewardsForTrip(tripId: string): Promise<number>
  getRewardsForVehicle(vehicleVin: string, startTime?: string, endTime?: string): Promise<number>
  getAllRewards(startTime?: string, endTime?: string): Promise<{ vehicleVin: string; rewards: number }[]>
  
  // Vehicle scores
  getVehicleAverageScores(): { [vin: string]: Score }
} 