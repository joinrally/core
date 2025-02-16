"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, Menu } from "lucide-react"

export function TopMenu({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: { isMobileMenuOpen: boolean; setIsMobileMenuOpen: (open: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user] = useState({ name: "Rahul", avatarUrl: "/placeholder-avatar.png" })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Home"
      case "/dashboard/vehicles":
        return "Vehicles"
      case "/dashboard/trips":
        return "Trips"
      case "/dashboard/rewards":
        return "Rewards"
      case "/dashboard/settings":
        return "Settings"
      default:
        return "Dashboard"
    }
  }

  const handleLogout = () => {
    // Implement logout logic here
    router.push("/")
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        )}
        <div className="flex items-center flex-1">
          {isMobile && (
            <Link href="/" className="mr-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-fZg95dfwyPZnoZhxfaYDaaT6yROPNi.png"
                alt="RALLY Logo"
                width={32}
                height={32}
              />
            </Link>
          )}
          <h1 className="font-gugi text-xl lg:text-2xl font-bold text-rally-coral">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.name.toLowerCase()}@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

