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
  { name: "Pompa Dosing PAC", status: "ON" as const, flowRate: 12.5 },
  { name: "Pompa Dosing Kaporit", status: "ON" as const, flowRate: 4.2 },
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

