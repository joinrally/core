import { Suspense } from "react"
import TripsPageContent from "./TripsPageContent"

export default function TripsPage() {
  return (
    <Suspense fallback={<div>Loading trips...</div>}>
      <TripsPageContent />
    </Suspense>
  )
}

