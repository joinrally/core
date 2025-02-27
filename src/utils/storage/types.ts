import type { Vehicle, Trip, TripSummary, Score } from "@/src/utils/types"

export interface StorageProvider {
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>
  
  // Trip operations
  getTripsForVehicle(vehicleId: string): Promise<TripSummary[]>
  getTripById(tripId: string): Promise<Trip | undefined>
  
  // Metrics operations
  getAggregatedMetricsForVehicle(vehicleId: string): Promise<{
    totalTrips: number
    totalDistance: number
    totalEnergyUsed: number
    totalRewards: number
    averageScore: number
    averageSpeed: number
    averageEnergyEfficiency: number
    averageScores: Score
  } | null>
  
  // Vehicle scores
  getVehicleAverageScores(): { [key: string]: Score }
} 