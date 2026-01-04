"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplet, Activity, Gauge, AlertTriangle, Circle, Loader2, CheckCircle2, XCircle, Beaker } from "lucide-react"
import { supabase } from "@/lib/supabase" // Import the client we made above

interface SystemData {
  sensors: {
    ph: number // Range 0-14
    turbidity: number // Range 0-1000 NTU
    tds: number // Range 0-1000 mg/L
    lastUpdated: number // Timestamp for staleness check
  }
  tanks: {
    kaporitLevel: number // 0-100%
    pacLevel: number // 0-100%
  }
  pumps: {
    kaporitStatus: "IDLE" | "DOSING" | "ERROR"
    pacStatus: "IDLE" | "DOSING" | "ERROR"
    flowRate: number
  }
  alarms: {
    active: boolean
    message: string
  }
}

const COMPLIANCE_LIMITS = {
  ph: { min: 6.5, max: 8.5, unit: "pH" },
  turbidity: { max: 3, unit: "NTU" },
  tds: { max: 300, unit: "mg/L" },
}

const TANK_WARNING_THRESHOLD = 10 // Below 10% shows refill warning
// UPDATED: Increased to 10 minutes because your ESP32 uploads every 5 minutes
const DATA_STALE_THRESHOLD = 10 * 60 * 1000 

function CriticalAlarmBanner({ message }: { message: string }) {
  return (
    <div className="sticky top-0 z-50 bg-red-600 text-white py-4 px-6 animate-pulse">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <AlertTriangle className="h-8 w-8 flex-shrink-0" />
        <div className="text-2xl font-bold uppercase tracking-wide">⚠️ CRITICAL ALARM: {message} ⚠️</div>
        <AlertTriangle className="h-8 w-8 flex-shrink-0" />
      </div>
    </div>
  )
}

function DataStaleOverlay() {
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

function SensorStatusCard({
  title,
  value,
  unit,
  icon: Icon,
  isCompliant,
  description,
}: {
  title: string
  value: number
  unit: string
  icon: React.ElementType
  isCompliant: boolean
  description: string
}) {
  return (
    <Card className={`${!isCompliant ? "bg-red-50 border-red-500 border-2 dark:bg-red-950" : "bg-white dark:bg-card"}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${!isCompliant ? "text-red-600" : "text-blue-600"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {value.toFixed(2)} <span className="text-lg">{unit}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isCompliant ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-600 font-semibold">COMPLIANT</p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-xs text-red-600 font-semibold">DANGER - OUT OF RANGE</p>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function ChemicalTank({
  name,
  level,
  color,
}: {
  name: string
  level: number
  color: string
}) {
  const needsRefill = level < TANK_WARNING_THRESHOLD

  return (
    <Card className={needsRefill ? "border-red-500 border-2 bg-red-50 dark:bg-red-950" : ""}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Beaker className="h-4 w-4" />
          {name} Tank
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Tank visual representation */}
          <div className="relative h-32 w-24 mx-auto border-4 border-gray-700 rounded-b-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <div
              className={`absolute bottom-0 w-full transition-all duration-500 ${color}`}
              style={{ height: `${level}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white z-10">{level}%</span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="text-center">
            {needsRefill ? (
              <div className="flex items-center justify-center gap-1 text-red-600 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">REFILL NEEDED</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">NORMAL</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PumpStatus({
  name,
  status,
  flowRate,
}: {
  name: string
  status: "IDLE" | "DOSING" | "ERROR"
  flowRate: number
}) {
  return (
    <Card className={status === "ERROR" ? "border-red-500 border-2 bg-red-50 dark:bg-red-950" : ""}>
      <CardHeader>
        <CardTitle className="text-sm">{name} Pump</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3">
          {/* Pump icon with animation */}
          <div className="relative">
            {status === "DOSING" && <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />}
            {status === "IDLE" && <Circle className="h-12 w-12 text-gray-400" />}
            {status === "ERROR" && <XCircle className="h-12 w-12 text-red-600" />}
          </div>

          {/* Status text */}
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                status === "DOSING" ? "text-blue-600" : status === "ERROR" ? "text-red-600" : "text-gray-600"
              }`}
            >
              {status}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Flow: {flowRate.toFixed(1)} L/min</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function WTPDashboard() {
  const [loading, setLoading] = useState(true)

  const [systemData, setSystemData] = useState<SystemData>({
    sensors: {
      ph: 0,
      turbidity: 0,
      tds: 0,
      lastUpdated: 0,
    },
    // Note: Since we only have sensors in Supabase, we keep tanks/pumps as static/mock for now
    tanks: {
      kaporitLevel: 45,
      pacLevel: 8, 
    },
    pumps: {
      kaporitStatus: "IDLE",
      pacStatus: "IDLE",
      flowRate: 12.5,
    },
    alarms: {
      active: false,
      message: "",
    },
  })

  // FETCH FUNCTION
  const fetchLatestData = async () => {
    try {
      // Get the single most recent row
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error("Supabase Error Details:", JSON.stringify(error, null, 2))
        console.error("Error Message:", error.message) 
        console.error("Error Hint:", error.hint)
        return
      }

      if (data && data.length > 0) {
        const latest = data[0]
        
        // Convert timestamp string to number
        const lastUpdatedTime = new Date(latest.created_at).getTime()

        setSystemData(prev => ({
          ...prev,
          sensors: {
            ph: latest.ph,
            turbidity: latest.turbidity,
            tds: latest.tds,
            lastUpdated: lastUpdatedTime
          }
        }))
      }
      setLoading(false)
    } catch (err) {
      console.error("Fetch Error:", err)
    }
  }

  // EFFECT: Fetch on mount + Polling
  useEffect(() => {
    fetchLatestData() // Immediate fetch

    // Poll every 10 seconds to catch the 5-minute update
    const interval = setInterval(fetchLatestData, 10000)

    return () => clearInterval(interval)
  }, [])

  // Check if data is stale
  // Use a fallback for initial load (0) so it doesn't show "Stale" immediately
  const isDataStale = systemData.sensors.lastUpdated !== 0 && 
                      (Date.now() - systemData.sensors.lastUpdated > DATA_STALE_THRESHOLD)

  // Compliance checks
  const phCompliant =
    systemData.sensors.ph >= COMPLIANCE_LIMITS.ph.min && systemData.sensors.ph <= COMPLIANCE_LIMITS.ph.max
  const turbidityCompliant = systemData.sensors.turbidity <= COMPLIANCE_LIMITS.turbidity.max
  const tdsCompliant = systemData.sensors.tds <= COMPLIANCE_LIMITS.tds.max

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Critical Alarm Banner */}
      {systemData.alarms.active && <CriticalAlarmBanner message={systemData.alarms.message} />}

      {/* Data Staleness Overlay */}
      {isDataStale && <DataStaleOverlay />}

      {/* Main Dashboard Content */}
      <div className={`${isDataStale ? "opacity-30" : ""}`}>
        {/* Header */}
        <header className="bg-white dark:bg-card shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Water Treatment Plant Dashboard</h1>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <Activity className="h-5 w-5 text-green-600 animate-pulse" />
                  <span className="text-sm font-semibold text-green-600">SYSTEM ACTIVE</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last Update: {new Date(systemData.sensors.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Sensor Status Cards */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Water Quality Monitoring</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SensorStatusCard
                title="pH Level"
                value={systemData.sensors.ph}
                unit={COMPLIANCE_LIMITS.ph.unit}
                icon={Droplet}
                isCompliant={phCompliant}
                description={`Safe Range: ${COMPLIANCE_LIMITS.ph.min} - ${COMPLIANCE_LIMITS.ph.max}`}
              />
              <SensorStatusCard
                title="Turbidity"
                value={systemData.sensors.turbidity}
                unit={COMPLIANCE_LIMITS.turbidity.unit}
                icon={Gauge}
                isCompliant={turbidityCompliant}
                description={`Max Allowed: ${COMPLIANCE_LIMITS.turbidity.max} NTU`}
              />
              <SensorStatusCard
                title="Total Dissolved Solids"
                value={systemData.sensors.tds}
                unit={COMPLIANCE_LIMITS.tds.unit}
                icon={Activity}
                isCompliant={tdsCompliant}
                description={`Max Allowed: ${COMPLIANCE_LIMITS.tds.max} mg/L`}
              />
            </div>
          </section>

          {/* Hardware Status */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Hardware Status</h2>

            {/* Chemical Tanks */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-foreground">Chemical Tanks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChemicalTank name="Kaporit (Chlorine)" level={systemData.tanks.kaporitLevel} color="bg-yellow-400" />
                <ChemicalTank name="PAC (Coagulant)" level={systemData.tanks.pacLevel} color="bg-amber-600" />
              </div>
            </div>

            {/* Dosing Pumps */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-foreground">Dosing Pumps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PumpStatus
                  name="Kaporit"
                  status={systemData.pumps.kaporitStatus}
                  flowRate={systemData.pumps.flowRate}
                />
                <PumpStatus name="PAC" status={systemData.pumps.pacStatus} flowRate={systemData.pumps.flowRate * 0.8} />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}