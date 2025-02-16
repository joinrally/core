import Image from "next/image"
import type { Vehicle } from "../types"

interface VehicleListProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSelectVehicle: (vehicle: Vehicle) => void
}

export default function VehicleList({ vehicles, selectedVehicle, onSelectVehicle }: VehicleListProps) {
  return (
    <div>
      <h3 className="font-gugi text-xl font-semibold mb-4 text-rally-coral">Your Vehicles</h3>
      <ul className="space-y-4">
        {vehicles.map((vehicle) => (
          <li
            key={vehicle.id}
            className={`p-4 cursor-pointer rounded transition-colors flex items-center ${
              selectedVehicle?.id === vehicle.id
                ? "bg-gradient-to-r from-rally-pink to-rally-coral text-white"
                : "hover:bg-gray-100"
            }`}
            onClick={() => onSelectVehicle(vehicle)}
          >
            <Image
              src={vehicle.image || "/placeholder-vehicle.png"}
              alt={vehicle.name}
              width={64}
              height={64}
              className="rounded-full mr-4"
            />
            <div>
              <span className="font-medium">{vehicle.name}</span>
              <span className="ml-2 text-sm opacity-75">{vehicle.model}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

