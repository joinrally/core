import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, Coins, TrendingUp, Award, Zap } from "lucide-react"

export default function DashboardPage() {
  const recentActivity = [
    { id: 1, description: "Completed a trip", time: "2 hours ago" },
    { id: 2, description: "Earned 50 $RALLY", time: "Yesterday" },
    { id: 3, description: "Added a new vehicle", time: "3 days ago" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-rally-pink to-rally-coral text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <Coins className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">568 $RALLY</div>
            <p className="text-xs text-white/70">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rally-pink to-rally-coral text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
            <Car className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">702 mi</div>
            <p className="text-xs text-white/70">+10.5% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rally-pink to-rally-coral text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Award className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.7</div>
            <p className="text-xs text-white/70">+5.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-rally-coral">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-rally-pink" />
                  <div className="ml-2">
                    <p className="text-sm font-medium leading-none">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-rally-coral">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button className="w-full bg-rally-pink hover:bg-rally-coral text-white">
              <Car className="mr-2 h-4 w-4" /> Add New Vehicle
            </Button>
            <Button className="w-full bg-rally-pink hover:bg-rally-coral text-white">
              <Zap className="mr-2 h-4 w-4" /> Claim Rewards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

