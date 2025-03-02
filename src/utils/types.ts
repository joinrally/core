export interface Vehicle {
  // VIN is the primary identifier for vehicles
  vin: string
  name: string
  make: string
  model: string
  year: number
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
  latitude: number
  longitude: number
}

export interface Score {
  energyScore: number
  safetyScore: number
  total: number
  timestamp: string
}

export interface GeoPoint {
  latitude: number
  longitude: number
}

export interface RouteInfo {
  startLocation?: GeoPoint
  endLocation?: GeoPoint
  waypoints?: GeoPoint[]
  polyline?: string // Encoded polyline for the route
}

export interface Trip {
  id: string
  vehicleVin: string
  vehicle: Vehicle
  startTime: string
  endTime: string
  metrics: VehicleMetrics[]
  score: Score
  distance: number
  energyUsed: number
  rewards: number
  isActive: boolean
  summary: TripSummary
  tags?: string[] // Optional tags for categorizing trips
  route?: RouteInfo // Optional route information
  purpose?: string // Optional trip purpose
}

export interface TripSummary {
  id: string
  vehicleVin: string
  vehicle: Vehicle
  startTime: string
  endTime: string
  distance: number
  estimatedEnergyUsed: number
  estimatedScore: number
  estimatedRewards: number
  tags?: string[] // Optional tags for categorizing trips
  route?: RouteInfo // Optional route information
  purpose?: string // Optional trip purpose
}

export interface AggregatedMetrics {
  totalTrips?: number
  totalDistance?: number
  totalEnergyUsed?: number
  totalRewards?: number
  averageSpeed?: number
  averageEnergyEfficiency?: number
  averageScores?: {
    energyScore: number
    safetyScore: number
    total: number
  }
  vehicleVin?: string
}

