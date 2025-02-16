import Image from "next/image"
import Link from "next/link"
import { SignInModal } from "@/components/sign-in-modal"

export function Header() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-fZg95dfwyPZnoZhxfaYDaaT6yROPNi.png"
            alt="RALLY Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="font-gugi text-2xl text-rally-coral">RALLY</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium hover:text-rally-coral">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium hover:text-rally-coral">
            How it Works
          </Link>
          <SignInModal />
        </div>
      </div>
    </nav>
  )
}

