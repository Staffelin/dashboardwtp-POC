"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Droplet, Activity, Gauge, Loader2, BarChart,Bell, Volume2, VolumeX } from 'lucide-react'
import { useSensors } from '@/hooks/useSensors'
import SensorStatusCard from '@/components/dashboard/SensorStatusCard'
import ComplianceSummary from '@/components/dashboard/ComplianceSummary'
import { useSession } from '@/hooks/useSession'
import useAlarmSound from '@/hooks/useAlarmSound'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ChemicalTank from '@/components/dashboard/ChemicalTank'
import DataStaleOverlay from '@/components/dashboard/DataStaleOverlay'
import PumpStatus from '@/components/dashboard/PumpStatus'


const COMPLIANCE_LIMITS = {
  ph: { min: 6.5, max: 8.5 },
  turbidity: { max: 3 },
  tds: { max: 300 },
}
const pumps = [
  { name: "Pompa Inlet", status: "ON" as const, flowRate: 12.5 },
  { name: "Pompa Dosing Kaporit", status: "ON" as const, flowRate: 4.2 },
  { name: "Pompa Backwash", status: "OFF" as const, flowRate: 0 },
]

const TANK_WARNING_THRESHOLD = 10
const DATA_STALE_THRESHOLD = 10 * 60 * 1000

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { data: sensorData, isLoading :sensorsLoading } = useSensors()
  const { playAlarm, stopAlarm, ensureCtx } = useAlarmSound()
  const router = useRouter()
  const { user, loading: sessionLoading } = useSession()
  const ph = sensorData?.ph ?? 7 
  const turbidity = sensorData?.turbidity ?? 0
  const tds = sensorData?.tds ?? 0
  const phCompliant = ph >= COMPLIANCE_LIMITS.ph.min && ph <= COMPLIANCE_LIMITS.ph.max
  const turbidityCompliant = turbidity <= COMPLIANCE_LIMITS.turbidity.max
  const tdsCompliant = tds <= COMPLIANCE_LIMITS.tds.max
  const kaporitOk = 45 >= TANK_WARNING_THRESHOLD
  const pacOk = 23 >= TANK_WARNING_THRESHOLD
  const hasWarning = !phCompliant || !turbidityCompliant || !tdsCompliant || !kaporitOk || !pacOk
  const { enabled, enable, disable } = useAlarmSound()
  const kaporitLevel = 45
  const pacLevel = 23
  const [lastUpdated] = useState(Date.now())
  const isStale = Date.now() - lastUpdated > DATA_STALE_THRESHOLD

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    if (!sensorsLoading && hasWarning && enabled) {
    playAlarm();
    } else {
      stopAlarm();
    }
  }, [hasWarning, sensorsLoading, playAlarm, stopAlarm]);

  useEffect(() => {
    const handleInteraction = () => {
      const ctx = ensureCtx()
      if (ctx?.state === 'suspended') ctx.resume()
    }
    document.addEventListener('click', handleInteraction, { once: true })
    return () => document.removeEventListener('click', handleInteraction)
  }, [])
  if (sessionLoading || sensorsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    )
  }

  return (
    <>
    {isStale && <DataStaleOverlay />}
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col">
              <h1 className="text-4xl lg:text-5xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
                WTP Dashboard
              </h1>
              <p className="text-sm font-medium text-slate-600 mt-1">
                Real-time Water Treatment Plant Monitoring - Permenkes Compliant
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 p-2 bg-red-100/50 rounded-xl border border-red-200 animate-pulse">
                <Bell className="h-5 w-5 text-red-600" />
                <span className="text-sm font-bold text-red-800">CRITICAL ALERT</span>
                <Button 
                  size="sm" 
                  variant={enabled ? "default" : "outline"}
                  onClick={enabled ? disable : enable}
                  className="ml-2 h-8"
                >
                  {enabled ? <Volume2 className="h-4 w-4"/> : <VolumeX className="h-4 w-4"/>}
                  <span className="ml-1">{enabled ? 'ON' : 'OFF'}</span>
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
              </div>
              <Link href="/history\" className="inline-flex items-center gap Ascending-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                <BarChart className="h-4 w-4" />
                View History
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <ComplianceSummary 
          sensors={{ phCompliant, turbidityCompliant, tdsCompliant }}
          tanks={{ kaporitOk, pacOk }}
        />
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-700 mb-8">Water Quality</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <SensorStatusCard
            title="pH Level"
            value={sensorData!.ph}
            unit="pH"
            icon={Droplet}
            isCompliant={phCompliant}
            description="Permenkes Range: 6.5 - 8.5"
          />
          <SensorStatusCard
            title="Turbidity" 
            value={sensorData!.turbidity}
            unit="NTU"
            icon={Gauge}
            isCompliant={turbidityCompliant}
            description="Max: ≤ 3 NTU"
          />
          <SensorStatusCard
            title="TDS"
            value={sensorData!.tds}
            unit="mg/L"
            icon={Activity}
            isCompliant={tdsCompliant}
            description="Max: ≤ 300 mg/L"
          />
          </div>
        </div>
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-700 mb-8">Chemical Storage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
            <ChemicalTank name="Kaporit" level={kaporitLevel} color="blue" />
            <ChemicalTank name="PAC" level={pacLevel} color="indigo" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 max-w-lg">
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-700 mb-8">Pump Status</h2>
            <div className=" grid gap-4 ">
              {pumps.map((pump) => (
                <PumpStatus key={pump.name} name={pump.name} status={pump.status} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}

