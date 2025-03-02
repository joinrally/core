"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Progress } from "@/src/components/ui/progress"
import { Tooltip } from "@/src/components/ui/tooltip"
import { Battery, Zap, Gauge, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react"
import type { Vehicle } from "@/src/utils/types"
import { cn } from "@/src/utils/cn"

interface VehicleHealthProps {
  vehicleVin: string
}

interface HealthMetric {
  name: string
  value: number
  status: 'good' | 'warning' | 'critical'
  icon: JSX.Element
  description: string
}

export default function VehicleHealth({ vehicleVin }: VehicleHealthProps) {
  const [healthData, setHealthData] = useState<HealthMetric[]>([])
  const [batteryHealth, setBatteryHealth] = useState<number>(0)
  const [nextServiceDate, setNextServiceDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVehicleHealth() {
      try {
        setIsLoading(true)
        
        // We'll use metrics data for now since we don't have a dedicated health endpoint
        const response = await fetch(`/api/vehicles/${vehicleVin}/metrics`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vehicle health: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Simulate health metrics from available data
        // In a real implementation, this would come from a dedicated health API
        
        // Battery health calculation (simplified)
        const randomBatteryHealth = 85 + Math.floor(Math.random() * 10)
        setBatteryHealth(randomBatteryHealth)
        
        // Generate simulated health metrics
        const healthMetrics: HealthMetric[] = [
          {
            name: 'Battery',
            value: randomBatteryHealth,
            status: randomBatteryHealth > 90 ? 'good' : (randomBatteryHealth > 75 ? 'warning' : 'critical'),
            icon: <Battery className="h-5 w-5" />,
            description: 'Battery state of health based on capacity and charging patterns'
          },
          {
            name: 'Charging System',
            value: 95 + Math.floor(Math.random() * 5),
            status: 'good',
            icon: <Zap className="h-5 w-5" />,
            description: 'Health of the charging system and components'
          },
          {
            name: 'Motor Efficiency',
            value: 90 + Math.floor(Math.random() * 8),
            status: 'good',
            icon: <Gauge className="h-5 w-5" />,
            description: 'Motor performance and efficiency metrics'
          },
          {
            name: 'Thermal System',
            value: 80 + Math.floor(Math.random() * 15),
            status: data.averageScores?.total > 80 ? 'good' : 'warning',
            icon: <Activity className="h-5 w-5" />,
            description: 'Cooling system health and thermal management'
          }
        ]
        
        setHealthData(healthMetrics)
        
        // Set a simulated next service date
        const today = new Date()
        today.setMonth(today.getMonth() + 3)
        setNextServiceDate(today.toISOString().split('T')[0])
        
      } catch (err) {
        console.error('Error fetching vehicle health:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (vehicleVin) {
      fetchVehicleHealth()
    }
  }, [vehicleVin])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-muted rounded col-span-2"></div>
                  <div className="h-4 bg-muted rounded col-span-1"></div>
                </div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600">
          Error loading vehicle health: {error}
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500'
      case 'warning':
        return 'text-amber-500'
      case 'critical':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500'
      case 'warning':
        return 'bg-amber-500'
      case 'critical':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-rally-pink font-gugi flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Vehicle Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Battery className="h-6 w-6 text-rally-coral" />
              <h3 className="font-medium text-lg">Battery Health</h3>
            </div>
            <span className={`font-bold text-lg ${batteryHealth > 90 ? 'text-green-500' : (batteryHealth > 75 ? 'text-amber-500' : 'text-red-500')}`}>
              {batteryHealth}%
            </span>
          </div>
          <Progress
            value={batteryHealth} 
            className={cn("h-2", batteryHealth > 90 ? 'bg-green-500' : (batteryHealth > 75 ? 'bg-amber-500' : 'bg-red-500'))}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {batteryHealth > 90 
              ? 'Excellent battery health. Continue optimal charging habits.' 
              : (batteryHealth > 75 
                ? 'Good battery health. Consider checking charging patterns.' 
                : 'Battery health needs attention. Schedule a service check.')}
          </p>
        </div>

        <div className="space-y-4">
          {healthData.map((metric) => (
            <div key={metric.name} className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${getStatusColor(metric.status)} bg-opacity-10`}>
                {metric.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{metric.name}</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(metric.status)}
                    <span className="text-sm font-medium">{metric.value}%</span>
                  </div>
                </div>
                <Progress 
                  value={metric.value} 
                  className={cn("h-1.5", getProgressColor(metric.status))}
                />
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>

        {nextServiceDate && (
          <div className="mt-6 p-4 bg-muted rounded-lg flex items-center gap-3">
            <Clock className="h-5 w-5 text-rally-coral" />
            <div>
              <h3 className="font-medium">Next Recommended Service</h3>
              <p className="text-sm text-muted-foreground">{new Date(nextServiceDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
