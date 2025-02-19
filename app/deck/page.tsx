import { Deck } from "./Deck"

export default function DeckPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-gugi text-rally-coral text-center mb-8">RALLY Deck</h1>
        <Deck />
      </div>
    </div>
  )
}

