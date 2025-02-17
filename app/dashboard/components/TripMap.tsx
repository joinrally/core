"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import * as L from "leaflet"
import type { VehicleMetrics } from "../types"

interface TripMapProps {
  metrics: VehicleMetrics[]
}

function MapUpdater({ positions }: { positions: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (positions.length > 1) {
      const startPoint = positions[0]
      const endPoint = positions[positions.length - 1]
      const bounds = L.latLngBounds([startPoint, endPoint])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, positions])

  return null
}

async function getAddress(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    const data = await response.json()
    const address = data.address
    return `${address.house_number || ""} ${address.road || ""}, ${address.city || ""}, ${address.state || ""} ${address.postcode || ""}`
  } catch (error) {
    console.error("Error fetching address:", error)
    return "Address not found"
  }
}

export default function TripMap({ metrics }: TripMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [startAddress, setStartAddress] = useState<string>("")
  const [endAddress, setEndAddress] = useState<string>("")

  const positions = metrics.map((metric) => [metric.latitude, metric.longitude] as [number, number])
  const center = positions[Math.floor(positions.length / 2)] || [0, 0]

  useEffect(() => {
    if (positions.length > 1) {
      const startPos = positions[0]
      const endPos = positions[positions.length - 1]

      getAddress(startPos[0], startPos[1]).then(setStartAddress)
      getAddress(endPos[0], endPos[1]).then(setEndAddress)
    }
  }, [positions])

  return (
    <div>
      <MapContainer center={center} zoom={13} style={{ height: "400px", width: "100%" }} ref={mapRef}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline positions={positions} color="blue" />
        <MapUpdater positions={positions} />
      </MapContainer>
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p>
          <strong>Start:</strong> {startAddress}
        </p>
        <p>
          <strong>End:</strong> {endAddress}
        </p>
      </div>
    </div>
  )
}

