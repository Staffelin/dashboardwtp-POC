import { api } from "./api"

export interface SensorReading {
  ph: number
  turbidity: number
  tds: number
  created_at: string
}

export interface SensorData {
  ph: number
  turbidity: number
  tds: number
  lastUpdated: number
}

function generateLatestSensorData(): SensorData {
  const baseTime = Date.now()
  // Slightly random but realistic/compliant values
  const ph = 7.3 + (Math.sin(baseTime / 3600000) * 0.2) + (Math.random() - 0.5) * 0.1 // 7.2-7.4
  const turbidity = 1.2 + Math.random() * 0.3 // 1.2-1.5 NTU (good)
  const tds = 420 + Math.sin(baseTime / 1800000) * 30 + (Math.random() - 0.5) * 10 // ~400-450

  return {
    ph: Number(ph.toFixed(1)),
    turbidity: Number(turbidity.toFixed(1)),
    tds: Math.round(tds),
    lastUpdated: baseTime
  }
}

export async function fetchLatestSensorReading(): Promise<SensorData | null> {
  // Dummy: no network, instant realistic data
  return generateLatestSensorData()
}

export type SensorHistoryPoint = {
  ph: number
  turbidity: number
  tds: number
  ts: string
}

// Generate realistic history: sine waves + noise over time range
function generateSensorHistory({ from, to, limit = 1000 }: { from: string, to: string, limit?: number }): SensorHistoryPoint[] {
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  const duration = end - start
  const step = Math.max(duration / limit, 60000) // min 1min intervals
  const points: SensorHistoryPoint[] = []

  for (let i = 0; i < limit && start + i * step <= end; i++) {
    const ts = new Date(start + i * step).toISOString()
    const t = (start + i * step - start) / duration // 0-1 normalized time
    const ph = 7.2 + Math.sin(t * Math.PI * 2 * 3) * 0.4 + (Math.random() - 0.5) * 0.2 // oscillating 6.8-7.8
    const turbidity = 1.5 + Math.sin(t * Math.PI * 4) * 0.8 + (Math.random() - 0.5) * 0.3 // 1.0-3.0
    const tds = 400 + Math.sin(t * Math.PI * 2) * 80 + (Math.random() - 0.5) * 20 // 320-520

    points.push({
      ph: Number(ph.toFixed(1)),
      turbidity: Number(turbidity.toFixed(1)),
      tds: Math.round(tds),
      ts
    })
  }
  return points
}

export async function fetchSensorHistory({
  from,
  to,
  limit = 1000,
}: {
  from: string // ISO
  to: string // ISO
  limit?: number
}): Promise<SensorHistoryPoint[]> {
  // Dummy: generate instant history data (no network)
  return generateSensorHistory({ from, to, limit })
}

