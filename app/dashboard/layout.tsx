"use client"

import "../globals.css"
import { Inter } from "next/font/google"
import { Sidebar } from "./components/Sidebar"
import { TopMenu } from "./components/TopMenu"
import { ThemeProvider } from "@/components/theme-provider"
import { useState, type ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex h-screen overflow-hidden">
            <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopMenu isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
              <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

