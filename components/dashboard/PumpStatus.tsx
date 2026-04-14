"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertOctagon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Toggle from "../ui/toggle"

interface PumpStatusProps {
  name: string
  status: "ON" | "OFF" | "ERROR"
  onToggle?: (newStatus: "ON" | "OFF") => Promise<void> | void
}

export default function PumpStatus({ name, status, onToggle }: PumpStatusProps) {
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async (checked: boolean) => {
    if (!onToggle || isToggling) return
    try {
      setIsToggling(true)
      await onToggle(checked ? "ON" : "OFF")
    } catch (err) {
      console.error("Toggle error:", err)
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={`
        border-2 transition-all duration-300
        ${status === "ON" ? "border-emerald-400 bg-emerald-50/50" : 
          status === "ERROR" ? "border-red-400 bg-red-50/50" : 
          "border-slate-200 bg-white"}
      `}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-3 h-3 rounded-full shrink-0 ${
                status === "ON" ? "bg-emerald-500 animate-pulse" :
                status === "ERROR" ? "bg-red-500 animate-pulse" :
                "bg-slate-300"
              }`} />
              <p className="font-bold text-slate-800 ">{name}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isToggling && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
              <Toggle
                checked={status === "ON"}
                onChange={handleToggle}
                disabled={isToggling || status === "ERROR"}
                className="shrink-0"
              />
            </div>
          </div>

          <div className="mt-4 pl-6">
            <Badge
              variant={status === "ERROR" ? "destructive" : status === "ON" ? "default" : "secondary"}
              className="text-xs"
            >
              {status === "ERROR" && <AlertOctagon className="h-3 w-3 mr-1" />}
              {status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}