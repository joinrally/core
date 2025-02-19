"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import Reveal from "reveal.js"
import "reveal.js/dist/reveal.css"
import { Slide } from "./Slide"

export function Deck() {
  const deckRef = useRef<Reveal | null>(null)

  useEffect(() => {
    const deck = new Reveal({
      width: '100%',
      height: '100%',
      transition: 'fade',
      backgroundTransition: 'fade',
      hash: true,
    })

    deck.initialize()
    deckRef.current = deck

    return () => {
      deckRef.current = null
    }
  }, [])

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="reveal w-full h-full">
        <div className="slides">
          <Slide>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-fZg95dfwyPZnoZhxfaYDaaT6yROPNi.png"
              alt="RALLY Logo"
              width={90}
              height={90}
            />
            <h2 className="text-5xl">RALLY</h2>
            <p className="text-2xl">
              Building a safer world, one mile at a time
            </p>
          </Slide>

          <Slide>
            <h2 className="text-5xl">Problem</h2>
            <ul className="space-y-6">
              <li>1.3M lives lost annually to road accidents</li>
              <li>$518B economic cost to global economy</li>
              <li>Current approaches are punitive-only</li>
              <li>No immediate positive reinforcement for safe driving</li>
              <li>Drivers lack incentives for consistent good behavior</li>
            </ul>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Market Size</h2>
            <ul className="space-y-6">
              <li>228M licensed drivers in US alone</li>
              <li>$250B annual auto insurance market</li>
              <li>$30B fleet management market</li>
              <li>$92B global rental car market</li>
              <li>Growing adoption of usage-based insurance</li>
              <li>Rising insurance costs driving demand for solutions</li>
            </ul>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Solution</h2>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">How It Works</h2>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Business Model</h2>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Competitive Advantage</h2>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Go-to-Market Strategy</h2>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Founder</h2>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Roadmap</h2>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Funding</h2>
          </Slide>

          <Slide>
            <h2 className="text-5xlgg">Vision</h2>
            <ul className="space-y-6">
              <li>Safe and sustainable driving is immediately rewarded</li>
              <li>Roads are safer for everyone</li>
              <li>Insurance is more equitable</li>
              <li>Communities celebrate good drivers</li>
              <li>Technology enables better behavior</li>
            </ul>
          </Slide>
        </div>
      </div>
    </div>
  )
}

