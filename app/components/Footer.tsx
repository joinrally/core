import Link from "next/link"
import Image from "next/image"
import { DiscIcon as Discord, X } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white border-t py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-fZg95dfwyPZnoZhxfaYDaaT6yROPNi.png"
            alt="RALLY Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="font-gugi text-xl text-rally-coral">RALLY</span>
        </div>
        <div className="flex space-x-6">
          <Link href="/privacy" className="text-sm text-gray-600 hover:text-rally-coral">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-gray-600 hover:text-rally-coral">
            Terms of Service
          </Link>
        </div>
        <div className="flex space-x-6">
          <a
            href="https://discord.gg/v2wQBdhTtX"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Discord</span>
            <Discord className="h-6 w-6" />
          </a>
          <a
            href="https://x.com/rallyio_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">X (formerly Twitter)</span>
            <X className="h-6 w-6" />
          </a>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">&copy; 2025 RALLY. All rights reserved.</p>
      </div>
    </footer>
  )
}

