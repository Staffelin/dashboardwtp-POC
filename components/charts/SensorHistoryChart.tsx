"use client"

import React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts"
import type { SensorHistoryPoint } from "@/lib/sensors"

export default function SensorHistoryChart({ data }: { data: SensorHistoryPoint[] }) {
  // Format timestamps for X axis
  const chartData = data.map(d => ({ ...d, time: new Date(d.ts).toLocaleString() }))

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ph" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="turbidity" stroke="#82ca9d" dot={false} />
          <Line type="monotone" dataKey="tds" stroke="#ff7300" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
