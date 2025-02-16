import type { Vehicle } from "../types"

interface FleetOverviewProps {
  vehicles: Vehicle[]
}

export default function FleetOverview({ vehicles }: FleetOverviewProps) {
  const activeVehicles = vehicles.filter((v) => v.status === "active").length
  const totalVehicles = vehicles.length

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="font-gugi text-xl font-semibold mb-6 text-rally-coral">Fleet Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-rally-pink to-rally-coral p-4 rounded text-white">
          <p className="text-sm font-medium">Total Vehicles</p>
          <p className="text-2xl font-bold">{totalVehicles}</p>
        </div>
        <div className="bg-gradient-to-r from-rally-pink to-rally-coral p-4 rounded text-white">
          <p className="text-sm font-medium">Active Vehicles</p>
          <p className="text-2xl font-bold">{activeVehicles}</p>
        </div>
        <div className="bg-gradient-to-r from-rally-pink to-rally-coral p-4 rounded text-white">
          <p className="text-sm font-medium">Average Score</p>
          <p className="text-2xl font-bold">85.7</p>
        </div>
        <div className="bg-gradient-to-r from-rally-pink to-rally-coral p-4 rounded text-white">
          <p className="text-sm font-medium">Total Rewards</p>
          <p className="text-2xl font-bold">1,234 $RALLY</p>
        </div>
      </div>
    </div>
  )
}

