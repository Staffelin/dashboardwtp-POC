"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { BarChart, Download, Calendar } from "lucide-react"
import { useSensorHistory } from "@/hooks/useSensorHistory"
import type { SensorHistoryPoint } from "@/lib/sensors"
import SensorHistoryChart from "@/components/charts/SensorHistoryChart"

function isoNowMinus(ms: number) {
  return new Date(Date.now() - ms).toISOString()
}

export default function HistoryPage() {
  // Default range: last 24 hours
  const [from, setFrom] = useState(() => isoNowMinus(24 * 60 * 60 * 1000))
  const [to, setTo] = useState(() => new Date().toISOString())

  const { data, isLoading, isError, error, refetch } = useSensorHistory(from, to)

  const points = (data ?? []) as SensorHistoryPoint[]

  const csvRows = useMemo(() => {
    if (!points || points.length === 0) return [] as string[][]
    const header: string[] = ["ts", "ph", "turbidity", "tds"]
    const rows: string[][] = points.map((d) => [d.ts, String(d.ph), String(d.turbidity), String(d.tds)])
    return [header, ...rows]
  }, [points])

  function downloadCSV() {
    if (!csvRows || csvRows.length === 0) return
    const csv = csvRows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sensor-history-${new Date().toISOString()}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <header className="bg-white dark:bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart className="h-6 w-6 text-gray-700 dark:text-white" />
              <h1 className="text-2xl font-semibold text-foreground">Sensor History</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-blue-600 hover:underline">Back to dashboard
              </Link>
              <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm" onClick={() => downloadCSV()} aria-label="Download CSV">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">From</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1"
              value={new Date(from).toISOString().slice(0, 16)}
              onChange={(e) => setFrom(new Date(e.target.value).toISOString())}
            />
            <label className="text-sm text-muted-foreground">To</label>
            <input
              type="datetime-local"
              className="border rounded px-2 py-1"
              value={new Date(to).toISOString().slice(0, 16)}
              onChange={(e) => setTo(new Date(e.target.value).toISOString())}
            />
            <button className="ml-2 rounded-md bg-gray-200 px-3 py-1 text-sm" onClick={() => refetch()}>
              Refresh
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-md bg-white border px-3 py-1 text-sm" onClick={() => { setFrom(isoNowMinus(24 * 60 * 60 * 1000)); setTo(new Date().toISOString()) }}>
              24h
            </button>
            <button className="rounded-md bg-white border px-3 py-1 text-sm" onClick={() => { setFrom(isoNowMinus(7 * 24 * 60 * 60 * 1000)); setTo(new Date().toISOString()) }}>
              7d
            </button>
            <button className="rounded-md bg-white border px-3 py-1 text-sm" onClick={() => { setFrom(isoNowMinus(30 * 24 * 60 * 60 * 1000)); setTo(new Date().toISOString()) }}>
              30d
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-sm text-muted-foreground">Loading history...</div>
          </div>
        ) : isError ? (
          <div className="text-red-600">Error loading history: {error?.message}</div>
        ) : (points.length === 0) ? (
          <div className="text-muted-foreground">No data for selected range.</div>
        ) : (
          <div>
            <SensorHistoryChart data={points} />
            <div className="mt-4 text-xs text-muted-foreground">Showing {points.length} points between {new Date(from).toLocaleString()} and {new Date(to).toLocaleString()}</div>
          </div>
        )}
      </main>
    </div>
  )
}
