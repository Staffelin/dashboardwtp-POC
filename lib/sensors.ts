import { supabase } from "./supabase"

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

export async function fetchLatestSensorReading(): Promise<SensorData | null> {
  const { data, error } = await supabase
    .from("sensor_readings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  if (error) {
    throw error
  }

  if (!data || data.length === 0) return null

  const latest = data[0] as any
  return {
    ph: latest.ph,
    turbidity: latest.turbidity,
    tds: latest.tds,
    lastUpdated: new Date(latest.created_at).getTime(),
  }
}
