"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Circle, XCircle } from "lucide-react"
import Toggle from "@/components/ui/toggle"

export default function PumpStatus({
  name,
  status,
  flowRate,
  onToggle,
}: {
  name: string
  status: "ON" | "OFF" | "ERROR"
  flowRate: number
  onToggle?: (newStatus: "ON" | "OFF" | "ERROR") => Promise<void> | void
}) {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async (checked: boolean) => {
    if (!onToggle) return
    const newStatus: "ON" | "OFF" = checked ? "ON" : "OFF"
    try {
      setIsToggling(true)
      await onToggle(newStatus)
    } catch (err) {
      console.error("Toggle error:", err)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Card className={status === "ERROR" ? "border-red-500 border-2 bg-red-50 dark:bg-red-950" : ""}>
      <CardHeader>
        <CardTitle className="text-sm">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {status === "ON" && <Loader2 className="h-12 w-12 text-green-600 animate-spin" />}
            {status === "OFF" && <Circle className="h-12 w-12 text-gray-400" />}
            {status === "ERROR" && <XCircle className="h-12 w-12 text-red-600" />}
          </div>

          <div className="text-center">
            <div className={`text-lg font-bold ${status === "ON" ? "text-green-600" : status === "ERROR" ? "text-red-600" : "text-gray-600"}`}>
              {status}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Flow: {flowRate.toFixed(1)} L/min</div>

            {/* Toggle switch */}
            {onToggle && (
              <div className="mt-3">
                <Toggle
                  aria-label={`${name} pump on/off`}
                  checked={status === "ON"}
                  onChange={handleToggle}
                  disabled={isToggling}
                />
                {/* Overlay spinner when toggling */}
                {isToggling && <div className="mt-2 text-xs text-muted-foreground">Updating...</div>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
