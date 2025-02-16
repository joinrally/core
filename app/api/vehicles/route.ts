import { NextResponse } from "next/server"
import type { Vehicle } from "../../dashboard/types"

const mockVehicles: Vehicle[] = [
  {
    id: "1",
    name: "My Tesla Model S",
    make: "Tesla",
    model: "Model S",
    year: 2022,
    vin: "5YJ3E1EA1LF123456",
    image: "/tesla-model-s.jpg",
  },
  {
    id: "2",
    name: "Family Model Y",
    make: "Tesla",
    model: "Model Y",
    year: 2023,
    vin: "5YJYGDEE1MF123456",
    image: "/tesla-model-y.jpg",
  },
  {
    id: "3",
    name: "Work Model 3",
    make: "Tesla",
    model: "Model 3",
    year: 2021,
    vin: "5YJ3E1EA1MF123456",
    image: "/tesla-model-3.jpg",
  },
  {
    id: "4",
    name: "Weekend Roadster",
    make: "Tesla",
    model: "Roadster",
    year: 2024,
    vin: "5YJRE1A3XA1000001",
    image: "/tesla-roadster.jpg",
  },
  {
    id: "5",
    name: "Cybertruck",
    make: "Tesla",
    model: "Cybertruck",
    year: 2023,
    vin: "7SAYGDEF9PA123456",
    image: "/tesla-cybertruck.jpg",
  },
  {
    id: "6",
    name: "Model X",
    make: "Tesla",
    model: "Model X",
    year: 2022,
    vin: "5YJXCAE1XLF123456",
    image: "/tesla-model-x.jpg",
  },
  {
    id: "7",
    name: "Rivian R1T",
    make: "Rivian",
    model: "R1T",
    year: 2023,
    vin: "7FTTW0123AB123456",
    image: "/rivian-r1t.jpg",
  },
  {
    id: "8",
    name: "Lucid Air",
    make: "Lucid",
    model: "Air",
    year: 2023,
    vin: "1LNLM1111NL123456",
    image: "/lucid-air.jpg",
  },
  {
    id: "9",
    name: "Ford F-150 Lightning",
    make: "Ford",
    model: "F-150 Lightning",
    year: 2023,
    vin: "1FTFW1E12NFA12345",
    image: "/ford-f150-lightning.jpg",
  },
  {
    id: "10",
    name: "Polestar 2",
    make: "Polestar",
    model: "2",
    year: 2023,
    vin: "LP1LFBEP1N1123456",
    image: "/polestar-2.jpg",
  },
]

export async function GET() {
  return NextResponse.json(mockVehicles)
}

