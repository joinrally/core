import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Car, Zap } from "lucide-react"
import DashboardStats from "./_components/DashboardStats"
import RecentActivity from "./_components/RecentActivity"
import RewardsSummary from "./_components/RewardsSummary"
import FeaturedTrip from "./_components/FeaturedTrip"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-gugi text-rally-coral">Rally Dashboard</h1>
      <p className="text-lg text-muted-foreground">Welcome to your Rally dashboard</p>
      
      {/* Dashboard Stats Cards */}
      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity Panel */}
        <RecentActivity />

        {/* Featured Trip */}
        <FeaturedTrip />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Rewards Summary Component */}
        <RewardsSummary />
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-rally-coral">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/dashboard/vehicles">
              <Button className="w-full bg-rally-pink hover:bg-rally-coral text-white">
                <Car className="mr-2 h-4 w-4" /> View All Vehicles
              </Button>
            </Link>
            <Link href="/dashboard/rewards">
              <Button className="w-full bg-rally-pink hover:bg-rally-coral text-white">
                <Zap className="mr-2 h-4 w-4" /> View Rewards
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

