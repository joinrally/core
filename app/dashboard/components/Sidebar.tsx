"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/src/utils/cn"
import { Button } from "@/src/components/ui/button"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Home, Car, Route, Coins } from "lucide-react"

export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 flex items-center", isCollapsed && !isMobile ? "justify-center" : "justify-between")}>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-fZg95dfwyPZnoZhxfaYDaaT6yROPNi.png"
            alt="RALLY Logo"
            width={32}
            height={32}
          />
          {(!isCollapsed || isMobile) && <span className="font-gugi text-2xl text-rally-coral">RALLY</span>}
        </Link>
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-2">
          <Link href="/dashboard" passHref>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && !isMobile && "px-2",
                pathname === "/dashboard" && "bg-gray-200 dark:bg-gray-700",
              )}
            >
              <Home className={cn("h-4 w-4", isCollapsed && !isMobile ? "mx-auto" : "mr-2")} />
              {(!isCollapsed || isMobile) && "Home"}
            </Button>
          </Link>
          <Link href="/dashboard/vehicles" passHref>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && !isMobile && "px-2",
                pathname === "/dashboard/vehicles" && "bg-gray-200 dark:bg-gray-700",
              )}
            >
              <Car className={cn("h-4 w-4", isCollapsed && !isMobile ? "mx-auto" : "mr-2")} />
              {(!isCollapsed || isMobile) && "Vehicles"}
            </Button>
          </Link>
          <Link href="/dashboard/trips" passHref>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && !isMobile && "px-2",
                pathname === "/dashboard/trips" && "bg-gray-200 dark:bg-gray-700",
              )}
            >
              <Route className={cn("h-4 w-4", isCollapsed && !isMobile ? "mx-auto" : "mr-2")} />
              {(!isCollapsed || isMobile) && "Trips"}
            </Button>
          </Link>
          <Link href="/dashboard/rewards" passHref>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed && !isMobile && "px-2",
                pathname === "/dashboard/rewards" && "bg-gray-200 dark:bg-gray-700",
              )}
            >
              <Coins className={cn("h-4 w-4", isCollapsed && !isMobile ? "mx-auto" : "mr-2")} />
              {(!isCollapsed || isMobile) && "Rewards"}
            </Button>
          </Link>
        </nav>
      </ScrollArea>
    </div>
  )

  return (
    <div
      className={cn(
        "sidebar h-screen flex-col border-r transition-all duration-300 ease-in-out",
        isMobile
          ? "fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800"
          : "relative hidden lg:flex bg-gray-100/40 dark:bg-gray-800/40",
        isCollapsed && !isMobile ? "w-16" : "w-64",
        isMobile && !isMobileMenuOpen && "-translate-x-full",
      )}
    >
      <SidebarContent />
      {!isMobile && (
        <div className="relative h-16 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-1/2 -translate-y-1/2 transition-all duration-300",
              isCollapsed ? "right-0 translate-x-1/2" : "-right-5",
              "bg-gray-100 dark:bg-gray-800 shadow-md rounded-full z-10",
            )}
            onClick={toggleCollapse}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}

