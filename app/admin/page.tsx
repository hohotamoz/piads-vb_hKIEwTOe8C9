"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Eye,
  Settings,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    title: "Total Users",
    value: "12,458",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Active Ads",
    value: "2,847",
    change: "+8.2%",
    trend: "up",
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Total Revenue",
    value: "45,890 π",
    change: "+23.1%",
    trend: "up",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Page Views",
    value: "1.2M",
    change: "-3.4%",
    trend: "down",
    icon: Eye,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
]

const recentUsers = [
  {
    id: 1,
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    role: "advertiser",
    status: "active",
    joined: "2 hours ago",
  },
  {
    id: 2,
    name: "Sarah Ahmed",
    email: "sarah@example.com",
    role: "store",
    status: "active",
    joined: "5 hours ago",
  },
  {
    id: 3,
    name: "Mohamed Ali",
    email: "mohamed@example.com",
    role: "user",
    status: "pending",
    joined: "1 day ago",
  },
  {
    id: 4,
    name: "Fatima Khan",
    email: "fatima@example.com",
    role: "developer",
    status: "active",
    joined: "2 days ago",
  },
]

const recentAds = [
  { id: 1, title: "iPhone 15 Pro Max", user: "TechStore_Pi", category: "Electronics", status: "approved", views: 2840 },
  {
    id: 2,
    title: "Web Development Service",
    user: "DevExpert_Pi",
    category: "Services",
    status: "pending",
    views: 1620,
  },
  { id: 3, title: "Luxury Watch", user: "LuxuryTime_Pi", category: "Fashion", status: "approved", views: 980 },
  { id: 4, title: "Gaming Laptop", user: "GamerZone_Pi", category: "Electronics", status: "flagged", views: 560 },
]

const reports = [
  { id: 1, adTitle: "Suspicious Product", reporter: "user_123", reason: "Scam", status: "pending", time: "30 min ago" },
  {
    id: 2,
    adTitle: "Fake Service",
    reporter: "user_456",
    reason: "Misleading",
    status: "reviewing",
    time: "2 hours ago",
  },
  {
    id: 3,
    adTitle: "Inappropriate Content",
    reporter: "user_789",
    reason: "Inappropriate",
    status: "resolved",
    time: "1 day ago",
  },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-emerald-600" />
          </div>
          <p className="text-sm text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-500">
                  Welcome, <span className="text-emerald-600 font-medium">{user.name}</span>
                </p>
              </div>
            </div>
            <Link href="/">
              <Button size="sm" variant="outline" className="border-slate-200 bg-transparent hover:bg-slate-50 rounded-xl">
                <Settings className="w-4 h-4 mr-2" />
                <span className="text-xs">Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white border border-slate-200 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Users
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              Ads
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        {stat.trend === "up" ? (
                          <ArrowUp className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                      <p className={`text-xs font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col space-y-2 border-slate-200 bg-transparent">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm">Manage Users</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col space-y-2 border-slate-200 bg-transparent">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Review Ads</span>
                </Button>
                <Link href="/admin/pricing" className="contents">
                  <Button variant="outline" className="h-auto py-4 flex-col space-y-2 border-slate-200 bg-transparent">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    <span className="text-sm">Manage Pricing</span>
                  </Button>
                </Link>
                <Button variant="outline" className="h-auto py-4 flex-col space-y-2 border-slate-200 bg-transparent">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Analytics</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription className="text-xs">Latest platform activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-0">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">New user registered</p>
                      <p className="text-xs text-slate-500">{i * 2} hours ago</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Users</CardTitle>
                  <Button size="sm" variant="outline" className="text-xs border-slate-200 bg-transparent">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-emerald-700">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {user.role}
                          </Badge>
                          <span className="text-xs text-slate-400">{user.joined}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Suspend</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Ads</CardTitle>
                  <Button size="sm" variant="outline" className="text-xs border-slate-200 bg-transparent">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{ad.title}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-slate-500">by {ad.user}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <Badge variant="secondary" className="text-xs">
                          {ad.category}
                        </Badge>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{ad.views} views</span>
                      </div>
                      <div className="mt-2">
                        <Badge
                          variant={
                            ad.status === "approved" ? "default" : ad.status === "pending" ? "secondary" : "destructive"
                          }
                          className="text-xs"
                        >
                          {ad.status}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Ad</DropdownMenuItem>
                        <DropdownMenuItem>Approve</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">User Reports</CardTitle>
                  <Badge variant="destructive" className="text-xs">
                    {reports.filter((r) => r.status === "pending").length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="pb-3 border-b border-slate-100 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{report.adTitle}</p>
                        <p className="text-xs text-slate-500 mt-1">Reported by {report.reporter}</p>
                      </div>
                      <Badge
                        variant={
                          report.status === "resolved"
                            ? "default"
                            : report.status === "reviewing"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                          {report.reason}
                        </Badge>
                        <span className="text-xs text-slate-400">{report.time}</span>
                      </div>
                      {report.status !== "resolved" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs border-slate-200 bg-transparent">
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
