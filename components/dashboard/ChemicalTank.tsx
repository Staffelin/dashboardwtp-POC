import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Beaker, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const TANK_ZONES = {
  CRITICAL: 10,
  LOW: 30,
  NORMAL: 70
} as const

interface ChemicalTankProps {
  name: string
  level: number
  color: string
}

export default function ChemicalTank({ name, level, color }: ChemicalTankProps) {
  const [displayLevel, setDisplayLevel] = useState(0)

  // Animated level counter
  useEffect(() => {
    const start = displayLevel
    const end = level
    const duration = 1500
    const stepTime = 30
    const steps = duration / stepTime
    let current = start

    const timer = setInterval(() => {
      current += (end - start) / steps
      setDisplayLevel(Math.min(Math.max(Math.round(current), 0), 100))
      if (Math.abs(current - end) < 0.5) {
        setDisplayLevel(end)
        clearInterval(timer)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [level])

  const getStatus = () => {
    if (level < TANK_ZONES.CRITICAL) return { text: "CRITICAL", color: "bg-red-500", textColor: "text-red-500", icon: AlertTriangle }
    if (level < TANK_ZONES.LOW) return { text: "LOW", color: "bg-orange-500", textColor: "text-orange-500", icon: AlertTriangle }
    if (level < TANK_ZONES.NORMAL) return { text: "NORMAL", color: "bg-emerald-500", textColor: "text-emerald-500", icon: CheckCircle2 }
    return { text: "OPTIMAL", color: "bg-green-500", textColor: "text-green-500", icon: CheckCircle2 }
  }

  const status = getStatus()
  const StatusIcon = status.icon
  const isLow = level < TANK_ZONES.LOW
  const [filled, empty] = [level / 100, 1 - level / 100]

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group"
    >
      <Card className={`
        w-full max-w-sm mx-auto group-hover:shadow-2xl transition-all duration-500 overflow-hidden relative
        ${isLow ? 'border-red-500 border-4 shadow-red-500/25' : 'border-emerald-400 border-2 shadow-emerald-200/50'}
        bg-linear-to-br from-slate-50/80 via-white/50 to-slate-100/80 dark:from-slate-900/80 dark:via-slate-800/50 dark:to-slate-900/80 backdrop-blur-xl
      `}>
        
        {/* Tank Header */}
        {/* Tank Header */}
        <CardHeader className="pt-6 pb-2">
          <div className="flex items-center justify-center gap-3">
            <div className={`p-3 rounded-2xl ${status.color.replace('bg-', 'bg-')}/10 shadow-sm border border-slate-100`}>
              <Beaker className={`h-6 w-6 ${status.textColor}`} />
            </div>
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
          </div>
        </CardHeader>

        {/* Pie Chart Container */}
        {/* Donut Chart Container */}
        <div className="relative mx-6 mb-6 mt-4 flex justify-center items-center h-48">
          
          {/* Main SVG Chart */}
          <svg viewBox="0 0 100 100" className="w-48 h-48 absolute -rotate-90 drop-shadow-md">
            {/* Background Track (Empty ring) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="8"
              className="dark:stroke-slate-800"
            />
            
            {/* Progress Ring (Filled arc) */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={status.textColor} /* Mengubah bg-red-500 jadi text-red-500 agar terbaca oleh SVG */
              strokeDasharray={2 * Math.PI * 40} /* Keliling lingkaran = 2 * pi * r */
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 40) - (filled * (2 * Math.PI * 40)) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>

          {/* Center Content (Persentase & Ikon) */}
          <div className="absolute z-10 flex flex-col items-center justify-center w-32 h-32 bg-white/50 dark:bg-slate-900/50 rounded-full backdrop-blur-sm shadow-inner border border-slate-100/50">
            <span className="text-3xl font-black bg-linear-to-br from-slate-800 to-slate-500 bg-clip-text text-transparent drop-shadow-sm">
              {displayLevel}%
            </span>
            <div className={`mt-1 flex items-center gap-1 text-xs font-bold ${status.textColor}`}>
               <StatusIcon className="h-4 w-4" />
            </div>
          </div>
        </div>

        <CardContent className="pb-6">
          {/* Status Badge */}
          <div className="flex justify-center mb-4">
            <Badge 
              variant="default"
              className={`font-bold px-6 py-3 text-base shadow-xl ${status.color} text-white hover:scale-105 transition-all backdrop-blur-sm border-2`}
            >
              {status.text}
            </Badge>
          </div>

          {/* Zone indicators */}
          {level < TANK_ZONES.CRITICAL && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-2 bg-red-100/80 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-4 py-2 rounded-full text-sm font-semibold border-2 border-red-300/50 dark:border-red-700/50 mb-4 animate-pulse"
            >
              <AlertTriangle className="h-4 w-4" />
              REFILL IMMEDIATE
            </motion.div>
          )}

          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className={`p-2 rounded-lg font-mono ${level >= TANK_ZONES.NORMAL ? 'bg-green-100 text-green-800 border-2 border-green-200 shadow-md' : 'bg-slate-100 text-slate-500'}`}>
              {TANK_ZONES.NORMAL}+<br/><span className="text-[10px]">OPTIMAL</span>
            </div>
            <div className={`p-2 rounded-lg col-span-1 font-mono ${level >= TANK_ZONES.LOW ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200 shadow-md' : 'bg-slate-100 text-slate-500'}`}>
              {TANK_ZONES.LOW}-{TANK_ZONES.NORMAL}%<br/><span className="text-[10px]">NORMAL</span>
            </div>
            <div className={`p-2 rounded-lg font-mono ${level >= TANK_ZONES.CRITICAL ? 'bg-amber-100 text-amber-800 border-2 border-amber-200 shadow-md' : 'bg-red-100 text-red-800 border-2 border-red-200 shadow-md animate-pulse'}`}>
              {'<' + TANK_ZONES.CRITICAL + '%'}<br/><span className="text-[10px]">{level < TANK_ZONES.CRITICAL ? 'CRITICAL' : 'LOW'}</span>
            </div>
          </div>
          
          <CardDescription className="text-center mt-3 text-xs">
            Chemical Storage Level
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}

