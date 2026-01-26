"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Code, Book, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function DevelopersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Developer Portal</h1>
              <p className="text-sm text-slate-500">Build on PiAds</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-20">
        {/* Hero Section */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">PiAds API</h2>
                <p className="text-sm text-white/80">Integrate with Pi Network ecosystem</p>
              </div>
            </div>
            <p className="text-white/90 mb-4">
              Build apps, stores, and services that connect seamlessly with PiAds. Access powerful APIs to list
              products, manage ads, and accept Pi payments.
            </p>
            <Link href="/api">
              <Button className="bg-white text-emerald-600 hover:bg-white/90">Get Started</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/api">
            <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Code className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">API Keys</h3>
                <p className="text-xs text-slate-500">Manage access</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Book className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">Documentation</h3>
              <p className="text-xs text-slate-500">API reference</p>
            </CardContent>
          </Card>
        </div>

        {/* API Features */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">API Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Zap, title: "Real-time Updates", desc: "Webhooks for instant notifications" },
              { icon: Shield, title: "Secure Authentication", desc: "OAuth 2.0 and API keys" },
              { icon: Code, title: "RESTful API", desc: "Clean, well-documented endpoints" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Start Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4">
              <code className="text-xs text-emerald-400 font-mono">
                <div>{"// Initialize PiAds SDK"}</div>
                <div className="text-slate-400">{"const"}</div> piads = <div className="text-slate-400">{"new"}</div>{" "}
                PiAdsAPI({"{"}
                <div className="ml-4">apiKey: YOUR_API_KEY</div>
                {"}"});
                <div className="mt-3 text-slate-400">{"// Create an ad"}</div>
                <div className="text-slate-400">{"const"}</div> ad = <div className="text-slate-400">{"await"}</div>{" "}
                piads.ads.create({"{"}
                <div className="ml-4">title: "iPhone 15",</div>
                <div className="ml-4">price: 1200,</div>
                <div className="ml-4">currency: "π"</div>
                {"}"});
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
