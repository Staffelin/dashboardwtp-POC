"use client"

import { useState, useEffect } from "react"
import { Droplet, Activity, Gauge, AlertTriangle, Circle, Loader2, CheckCircle2, XCircle, Beaker } from "lucide-react"
import { useSensors } from "@/hooks/useSensors"
import SensorStatusCard from "@/components/dashboard/SensorStatusCard"
import ChemicalTank from "@/components/dashboard/ChemicalTank"
import PumpStatus from "@/components/dashboard/PumpStatus"
import DataStaleOverlay from "@/components/dashboard/DataStaleOverlay"
import Toggle from "@/components/ui/toggle"
import useAlarmSound from "@/hooks/useAlarmSound"

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
    status: "ON" | "OFF" | "ERROR"
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



export default function WTPDashboard() {
  // Keep tanks/pumps/alarms local for now (can be fetched later)
  const [systemData, setSystemData] = useState<SystemData>({
    sensors: {
      ph: 0,
      turbidity: 0,
      tds: 0,
      lastUpdated: 0,
    },
    tanks: {
      kaporitLevel: 4,
      pacLevel: 10,
    },
    pumps: {
      status: "OFF",
      flowRate: 12.5,
    },
    alarms: {
      active: false,
      message: "",
    },
  })

  // Use React Query hook to fetch sensor data
  const { data: sensorData, isLoading: sensorsLoading, isError, error } = useSensors()

  // When sensorData arrives, merge into local state for existing consumers
  useEffect(() => {
    if (sensorData) {
      setSystemData(prev => ({
        ...prev,
        sensors: {
          ph: sensorData.ph,
          turbidity: sensorData.turbidity,
          tds: sensorData.tds,
          lastUpdated: sensorData.lastUpdated,
        },
      }))
    }
  }, [sensorData])

  // Check if data is stale
  // Use a fallback for initial load (0) so it doesn't show "Stale" immediately
  const isDataStale = systemData.sensors.lastUpdated !== 0 && 
                      (Date.now() - systemData.sensors.lastUpdated > DATA_STALE_THRESHOLD)

  // Compliance checks
  const phCompliant =
    systemData.sensors.ph >= COMPLIANCE_LIMITS.ph.min && systemData.sensors.ph <= COMPLIANCE_LIMITS.ph.max
  const turbidityCompliant = systemData.sensors.turbidity <= COMPLIANCE_LIMITS.turbidity.max
  const tdsCompliant = systemData.sensors.tds <= COMPLIANCE_LIMITS.tds.max

  // Alarm / warning detection (include tank levels)
  const tankWarning = systemData.tanks.kaporitLevel < TANK_WARNING_THRESHOLD || systemData.tanks.pacLevel < TANK_WARNING_THRESHOLD
  const hasWarning = !phCompliant || !turbidityCompliant || !tdsCompliant || tankWarning

  // Sound hook
  const { enabled: alarmEnabled, enable: enableAlarm, disable: disableAlarm, playAlarm, stopAlarm } = useAlarmSound()

  // Play/stop alarm sound when warning appears or clears
  useEffect(() => {
    if (hasWarning && alarmEnabled) playAlarm()
    else stopAlarm()
  }, [hasWarning, alarmEnabled])

  if (sensorsLoading && systemData.sensors.lastUpdated === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Critical Alarm Banner */}

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
                <div className="flex items-center gap-4 justify-end">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600 animate-pulse" />
                    <span className="text-sm font-semibold text-green-600">SYSTEM ACTIVE</span>
                  </div>

                  {/* Alarm sound toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Alarm</span>
                    <Toggle
                      aria-label="Enable alarm sounds"
                      checked={alarmEnabled}
                      onChange={(checked) => (checked ? enableAlarm() : disableAlarm())}
                    />
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <PumpStatus
                  name="Dosing Pump"
                  status={systemData.pumps.status}
                  flowRate={systemData.pumps.flowRate}
                  onToggle={async (newStatus) => {
                    const prev = systemData.pumps.status
                    // Optimistic update
                    setSystemData(prevState => ({
                      ...prevState,
                      pumps: { ...prevState.pumps, status: newStatus },
                    }))
                    try {
                      const { setPumpStatus } = await import('@/lib/pumps')
                      await setPumpStatus('main', newStatus)
                    } catch (err) {
                      console.error('Failed to update pump status:', err)
                      // Revert on error
                      setSystemData(prevState => ({
                        ...prevState,
                        pumps: { ...prevState.pumps, status: prev },
                      }))
                    }
                  }}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}