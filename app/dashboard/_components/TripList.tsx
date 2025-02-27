import type { Trip } from "@/src/utils/types"
import { Card } from "@/src/components/ui/card"
import { formatDistance, formatRelative } from "date-fns"
import { Car, Battery, Coins } from "lucide-react"
import { getScoreColor } from "@/src/utils/scoreColor"

interface TripListProps {
  trips: Trip[]
  onSelectTrip: (trip: Trip) => void
  selectedTripId?: string
}

export default function TripList({ trips, onSelectTrip, selectedTripId }: TripListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-gugi text-xl text-rally-coral mb-4">Recent Trips</h3>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {trips.map((trip) => (
          <Card
            key={trip.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedTripId === trip.id ? "border-2 border-rally-coral" : "hover:border-rally-pink"
            }`}
            onClick={() => onSelectTrip(trip)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{formatRelative(new Date(trip.startTime), new Date())}</p>
                <p className="text-sm text-gray-500">
                  Duration: {formatDistance(new Date(trip.startTime), new Date(trip.endTime))}
                </p>
                {trip.isActive && (
                  <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded mt-1">Active</span>
                )}
              </div>
              <div className="text-right">
                <p className={`font-bold text-white px-2 py-1 rounded ${getScoreColor(trip.score.total)}`}>
                  {trip.score.total.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">Score</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-rally-pink" />
                <span>{trip.distance.toFixed(1)} mi</span>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-rally-pink" />
                <span>{trip.energyUsed.toFixed(1)} kWh</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-rally-pink" />
                <span>{trip.rewards.toFixed(2)} $RALLY</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

