import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, RefreshCw, WifiOff, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSensors } from "@/hooks/useSensors"

export default function DataStaleOverlay() {
  const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const { refetch: refetchSensors } = useSensors()

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceLastUpdate(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRetryCount(prev => prev + 1)
    try {
      await refetchSensors()
      // Reset timer on successful refetch (handled by parent)
    } catch (error) {
      console.error("Refresh failed:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-linear-to-br from-red-900/90 via-red-800/80 to-gray-900/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-linear-to-b from-gray-900/95 to-gray-800/95 border-4 border-red-500/50 shadow-2xl shadow-red-500/25 backdrop-blur-xl overflow-hidden relative">
          
          {/* Animated border glow */}
          <motion.div 
            className="absolute inset-0 bg-linear-to-r from-red-500 via-red-400 to-orange-500 opacity-75 blur-xl -m-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

          {/* Pulsing alert icon */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <div className="w-24 h-24 bg-linear-to-r from-red-500 to-red-600 rounded-full shadow-2xl shadow-red-500/50 border-4 border-white/20 flex items-center justify-center">
                <AlertTriangle className="h-16 w-16 text-white drop-shadow-2xl animate-pulse" />
              </div>
            </motion.div>
          </div>

          <CardHeader className="pt-20 pb-4 relative z-10 text-center">
            <CardTitle className="text-3xl lg:text-4xl font-black bg-linear-to-r from-red-400 via-red-300 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl mb-2">
              DATA STALE
            </CardTitle>
            <div className="flex items-center gap-2 justify-center mb-4">
              <WifiOff className="h-6 w-6 text-red-400 animate-pulse" />
              <p className="text-lg font-semibold text-gray-300">No sensor update for</p>
              <div className="text-2xl font-mono font-bold text-red-400 bg-gray-800/50 px-3 py-1 rounded-lg shadow-lg">
                {formatTime(timeSinceLastUpdate)}
              </div>
            </div>
            
            <Badge variant="destructive" className="text-lg px-6 py-2 font-bold shadow-lg">
              <XCircle className="h-5 w-5 mr-2" />
              Connection Lost
            </Badge>
          </CardHeader>

          <CardContent className="relative z-10 space-y-6 pb-8">
            {/* Countdown timer */}
            <div className="bg-linear-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="h-8 w-8 text-orange-400" />
                <h3 className="text-xl font-bold text-orange-300">Next Auto-Refresh</h3>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {([60, 30, 10, 0] as number[]).map((target, i) => (
                  <div key={i} className="bg-gray-700/50 p-3 rounded-xl">
                    <div className="text-2xl font-mono font-bold text-white">
                      {Math.max(0, Math.floor((60 - timeSinceLastUpdate % 60) / 10) * 10)}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">secs</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Troubleshooting tips */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-3 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                <div className="shrink-0 mt-0.5 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200 mb-1">Check ESP32 Status</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Power LED is green</li>
                    <li>• WiFi LED blinking</li>
                    <li>• Connected to dashboardwtp network</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
                <div className="shrink-0 mt-0.5 text-yellow-400">
                  <WifiOff className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200 mb-1">Network Issues</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Check router connection</li>
                    <li>• Verify APN settings</li>
                    <li>• Restart ESP32</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700/50">
              <Button 
                onClick={handleRefresh}
                variant="destructive"
                size="lg"
                className="flex-1 font-bold shadow-xl hover:shadow-red-500/25 group bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg h-14"
              >
                <RefreshCw className="h-5 w-5 mr-2 group-hover:animate-spin transition-all" />
                Force Refresh ({retryCount})
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 font-semibold border-2 border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500 h-14"
                onClick={() => window.open('http://192.168.4.1', '_blank')}
              >
                ESP32 Console
              </Button>
            </div>

            {/* Warning footer */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-700/30">
              Auto-recovery in 10m • Critical operations paused
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

