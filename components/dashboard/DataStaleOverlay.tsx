import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { XCircle } from "lucide-react"

export default function DataStaleOverlay() {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 flex items-center justify-center">
      <Card className="bg-gray-800 border-red-500 border-2 max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-red-500">CONNECTION LOST</h2>
            <p className="text-gray-300">Sensor data is stale. Last update more than 10 minutes ago.</p>
            <p className="text-sm text-gray-400">Check ESP32 connection and network status.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
