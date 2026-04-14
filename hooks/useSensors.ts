"use client"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { fetchLatestSensorReading, type SensorData } from "@/lib/sensors"

export function useSensors() {
  return useQuery<SensorData | null>({
    queryKey: ["sensors", "latest"],
    queryFn: fetchLatestSensorReading,

    refetchInterval: false,
    staleTime: 30000,

    placeholderData: keepPreviousData,

    refetchOnWindowFocus: false,
  })

}
