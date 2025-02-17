"use client"

import type React from "react"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function UserSettings() {
  const [user, setUser] = useState({
    name: "Rahul",
    email: "rahul@example.com",
  })
  const { theme, setTheme } = useTheme()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser((prevUser) => ({ ...prevUser, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement save logic here
    console.log("Saving user settings:", user)
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={user.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={user.email} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex items-center space-x-2">
                <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
                  Light
                </Button>
                <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
                  Dark
                </Button>
                <Button variant={theme === "system" ? "default" : "outline"} onClick={() => setTheme("system")}>
                  System
                </Button>
              </div>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

