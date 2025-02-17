"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PublicLayout } from "@/app/components/PublicLayout"

export default function SignUp() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const name = formData.get("name")

    try {
      // Here you would typically send this data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-fZg95dfwyPZnoZhxfaYDaaT6yROPNi.png"
            alt="RALLY Logo"
            width={64}
            height={64}
            className="mx-auto h-16 w-16"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Join the Waitlist</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We're not currently accepting new users, but we'll reach out when spots open up!
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {success ? (
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">Thanks for joining our waitlist!</h3>
                <p className="mt-2 text-sm text-gray-600">
                  We'll reach out to you as soon as we're ready to welcome new users.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  className="mt-4 w-full font-gugi bg-gradient-to-r from-rally-pink to-rally-coral hover:opacity-90 text-white"
                >
                  Back to Home
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" type="text" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" required className="mt-1" />
                </div>
                <Button
                  type="submit"
                  className="w-full font-gugi bg-gradient-to-r from-rally-pink to-rally-coral hover:opacity-90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Join Waitlist"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

