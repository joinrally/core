"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    title: "RALLY",
    subtitle: "Building a safer world, one mile at a time",
  },
  {
    title: "Problem",
    content: [
      "1.3M lives lost annually to road accidents",
      "$518B economic cost to global economy",
      "Current approaches are punitive-only",
      "No immediate positive reinforcement for safe driving",
      "Drivers lack incentives for consistent good behavior",
    ],
  },
  {
    title: "Market Size",
    content: [
      "228M licensed drivers in US alone",
      "$250B annual auto insurance market",
      "$30B fleet management market",
      "$92B global rental car market",
      "Growing adoption of usage-based insurance",
      "Rising insurance costs driving demand for solutions",
    ],
  },
  {
    title: "Solution",
    content: ["Real-time rewards", "Decentralized network", "Insurance integration"],
  },
  {
    title: "How It Works",
    content: [
      "Safety Monitoring Layer",
      "Speed • Braking • Distance • Lane Position • Signals • Weather • Road Conditions",
      "Intelligence Layer",
      "AI Scoring • Pattern Recognition • Risk Assessment",
      "Reward Layer",
      "$RALLY Tokens • Premium Reductions • Fleet Incentives",
    ],
  },
  {
    title: "Business Model",
    content: ["Image placeholder for business model"],
  },
  {
    title: "Competitive Advantage",
    content: [
      "First Mover",
      "Pioneer in on-chain driver rewards",
      "Network Effects",
      "More drivers = better data = stronger incentives",
      "Real-Time Rewards",
      "Immediate feedback and incentive distribution",
      "Partner Ecosystem",
      "Insurance, fleet, and charging partnerships",
    ],
  },
  {
    title: "Go-To-Market Strategy",
    content: [
      "Phase 1: Fleet Partnerships",
      "Launch with fleet owners to reach existing driver pools",
      "Phase 2: Rideshare Platform Integration",
      "Target platforms to integrate directly with vehicles via API",
      "Phase 3: Consumer Direct",
      "Roll out to individual vehicle owners and drivers through in-car app marketplaces",
    ],
  },
  {
    title: "Founder",
    content: ["Rahul Dhir", "Founder", "EV Fleet Operator & Software Engineer"],
  },
  {
    title: "Roadmap",
    content: [
      "Q1: Tesla Integration Launch",
      "Q2: Token Launch",
      "Q3: Insurance Integration",
      "Q4: Ecosystem Partnerships",
    ],
  },
  {
    title: "Funding",
    content: [
      "Raising $5M Seed Round",
      "Development (40%)",
      "Business Dev (25%)",
      "Marketing (15%)",
      "Operations (10%)",
    ],
  },
  {
    title: "Our Vision",
    content: [
      "Creating a new paradigm for road safety",
      "Safe driving is immediately rewarded",
      "Roads are safer for everyone",
      "Insurance is more equitable",
      "Communities celebrate good drivers",
      "Technology enables better behavior",
    ],
  },
]

export function Deck() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="p-8 min-h-[60vh] flex flex-col justify-center">
        <h2 className="text-3xl font-gugi text-rally-coral mb-4">{slides[currentSlide].title}</h2>
        {slides[currentSlide].subtitle && <p className="text-xl text-gray-600 mb-6">{slides[currentSlide].subtitle}</p>}
        {slides[currentSlide].content && (
          <ul className="list-disc list-inside space-y-2">
            {slides[currentSlide].content.map((item, index) => (
              <li key={index} className="text-lg text-gray-700">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex justify-between p-4 bg-gray-100">
        <Button onClick={prevSlide} variant="outline" className="flex items-center">
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span className="text-gray-600">
          {currentSlide + 1} / {slides.length}
        </span>
        <Button onClick={nextSlide} variant="outline" className="flex items-center">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

