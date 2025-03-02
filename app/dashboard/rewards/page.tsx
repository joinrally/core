import RewardsChart from "../_components/RewardsChart"
import VehicleRewards from "../_components/VehicleRewards"

export default function RewardsPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-gugi text-rally-coral">Rally Rewards</h1>
      <p className="text-lg text-gray-700">Track and analyze your earned rewards across all vehicles</p>
      
      <div className="grid grid-cols-1 gap-8">
        <RewardsChart />
        <VehicleRewards />
      </div>
    </div>
  )
}

