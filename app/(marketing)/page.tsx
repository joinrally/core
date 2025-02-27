import Image from "next/image"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Wallet, Car, Bus, Train, ArrowRight, Shield, Globe } from "lucide-react"
import { PublicLayout } from "@/app/(marketing)/_components/PublicLayout"

export default function Page() {
  return (
    <PublicLayout>
      <div className="min-h-screen font-sans">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="font-gugi text-5xl md:text-6xl lg:text-7xl leading-tight">
                  Earn While You
                  <span className="bg-gradient-to-r from-rally-pink to-rally-coral bg-clip-text text-transparent">
                    {" "}
                    Drive
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-lg">
                  Turn your daily commute into rewards with RALLY. Share your driving data passively and earn
                  cryptocurrency while contributing to the future of transportation.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="font-gugi bg-gradient-to-r from-rally-pink to-rally-coral hover:opacity-90 text-white"
                    >
                      Start Earning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-86tWdSc76ALDowJmFWsLCMKaBz4tN0.png"
                  alt="RALLY Icon"
                  width={500}
                  height={500}
                  className="w-full max-w-md mx-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="font-gugi text-3xl md:text-4xl text-center mb-12">
              Why Choose <span className="text-rally-coral">RALLY</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Wallet className="h-8 w-8 text-rally-coral" />,
                  title: "Earn Rewards",
                  description: "Get paid in cryptocurrency just for driving your vehicle and sharing anonymous data.",
                },
                {
                  icon: <Shield className="h-8 w-8 text-rally-coral" />,
                  title: "Privacy First",
                  description: "Your data is anonymized and secured using blockchain technology.",
                },
                {
                  icon: <Globe className="h-8 w-8 text-rally-coral" />,
                  title: "Drive Change",
                  description:
                    "Contribute to improving road safety, traffic patterns, and the future of autonomous driving.",
                },
              ].map((feature, index) => (
                <Card key={index} className="border-2 hover:border-rally-coral transition-colors">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {feature.icon}
                      <h3 className="font-gugi text-xl">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="font-gugi text-3xl md:text-4xl text-center mb-12">Powering the Future of Transportation</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Car className="h-12 w-12" />,
                  title: "Driver Behavior",
                  description: "Enhance insurance models with real-world driving patterns",
                },
                {
                  icon: <Bus className="h-12 w-12" />,
                  title: "Traffic Patterns",
                  description: "Optimize routing algorithms with actual road usage data",
                },
                {
                  icon: <Train className="h-12 w-12" />,
                  title: "AI Training",
                  description: "Train autonomous vehicles with diverse driving scenarios",
                },
              ].map((insight, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-rally-pink to-rally-coral flex items-center justify-center text-white">
                    {insight.icon}
                  </div>
                  <h3 className="font-gugi text-xl">{insight.title}</h3>
                  <p className="text-gray-600">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-rally-pink to-rally-coral text-white">
          <div className="container mx-auto text-center">
            <h2 className="font-gugi text-3xl md:text-4xl mb-6">Ready to Earn While Driving?</h2>
            <p className="max-w-2xl mx-auto mb-8 text-white/90">
              Join thousands of drivers who are earning rewards while helping shape the future of transportation
              technology.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="font-gugi bg-white text-rally-coral hover:bg-white/90">
                Start Earning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}

