import "./_globals.css"
import type { Metadata } from "next"
import { Inter, Gugi } from "next/font/google"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })
const gugi = Gugi({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gugi",
})

export const metadata: Metadata = {
  title: "RALLY",
  description: "Earn crypto while driving",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${gugi.variable}`}>{children}</body>
    </html>
  )
}

