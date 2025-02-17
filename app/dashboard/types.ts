export interface Vehicle {
  id: string
  name: string
  make: string
  model: string
  year: number
  vin: string
  image: string
  score?: Score
}

export interface VehicleMetrics {
  speed: number
  packVoltage: number
  packCurrent: number
  acceleration: number
  brakePedal: number
  timestamp: string
}

export interface Score {
  energyScore: number
  safetyScore: number
  usageScore: number
  total: number
  timestamp: string
}

export interface Trip {
  id: string
  vehicleId: string
  vehicle: Vehicle
  startTime: string
  endTime: string
  metrics: VehicleMetrics[]
  score: Score
  distance: number
  energyUsed: number
  rewards: number
  isActive: boolean
}

export interface TripSummary {
  id: string
  vehicleId: string
  vehicle: Vehicle
  startTime: string
  endTime: string
  distance: number
  estimatedEnergyUsed: number
  estimatedScore: number
  estimatedRewards: number
}

export interface AggregatedMetrics {
  totalTrips?: number
  totalDistance?: number
  totalEnergyUsed?: number
  totalRewards?: number
  averageScore?: number
  averageSpeed?: number
  averageEnergyEfficiency?: number
}

