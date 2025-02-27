"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import type { VehicleMetrics } from "@/src/utils/types"
import type { Map as LeafletMap } from "leaflet"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false })

interface TripMapProps {
  metrics: VehicleMetrics[]
}

export default function TripMap({ metrics }: TripMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<LeafletMap | null>(null)
  const [startAddress, setStartAddress] = useState<string>("")
  const [endAddress, setEndAddress] = useState<string>("")

  const positions = metrics.map((metric) => [metric.latitude, metric.longitude] as [number, number])
  const center = positions[Math.floor(positions.length / 2)] || [0, 0]

  useEffect(() => {
    if (mapLoaded && mapRef.current && positions.length > 1) {
      const map = mapRef.current
      const bounds = positions.reduce((bounds, position) => bounds.extend(position), map.getBounds())
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [mapLoaded, positions])

  useEffect(() => {
    if (positions.length > 1) {
      const startPos = positions[0]
      const endPos = positions[positions.length - 1]

      getAddress(startPos[0], startPos[1]).then(setStartAddress)
      getAddress(endPos[0], endPos[1]).then(setEndAddress)
    }
  }, [positions])

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

  return (
    <div>
      <div style={{ height: "400px", width: "100%" }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          whenReady={() => setMapLoaded(true)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Polyline positions={positions} color="blue" />
        </MapContainer>
      </div>
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

