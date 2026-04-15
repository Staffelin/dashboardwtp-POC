import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SensorStatusCardProps {
  title: string
  value: number
  unit: string
  icon: React.ElementType
  isCompliant: boolean
  description: string
  min?: number
  max?: number
}

export default function SensorStatusCard({
  title,
  value,
  unit,
  icon: Icon,
  isCompliant,
  description,
  min,
  max,
}: SensorStatusCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animated counter
    const start = displayValue
    const end = value
    const duration = 1000
    const stepTime = 20
    const steps = duration / stepTime
    let current = start

    const timer = setInterval(() => {
      current += (end - start) / steps
      setDisplayValue(Math.abs(current))
      if (Math.abs(current - end) < 0.01) {
        setDisplayValue(end)
        clearInterval(timer)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value])

  useEffect(() => {
    // Calculate progress percentage
    if (min !== undefined && max !== undefined) {
      const pct = ((value - min) / (max - min)) * 100
      setProgress(Math.min(Math.max(pct, 0), 100))
    } else {
      setProgress(0)
    }
  }, [value, min, max])

  const getGradient = () => {
    if (!isCompliant) return "bg-gradient-to-r from-red-400 to-red-600"
    if (progress < 30) return "bg-gradient-to-r from-emerald-400 to-green-500"
    if (progress < 70) return "bg-gradient-to-r from-yellow-400 to-amber-500"
    return "bg-gradient-to-r from-blue-400 to-indigo-500"
  }

  const getBorderColor = () => {
    if (!isCompliant) return "border-red-600 shadow-red-200 dark:border-red-800 dark:shadow-red-900/50"
    return "border-gray-400 shadow-gray-200 dark:border-emerald-800 dark:shadow-emerald-900/50"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Card className={`
        ${getBorderColor()}
        bg-linear-to-br ${
          !isCompliant 
            ? "from-red-50/80 to-red-100/80 dark:from-red-950/80 dark:to-red-900/80"
            : "from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm"
        } shadow-2xl group-hover:shadow-3xl border-2 overflow-hidden relative
      `}>
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer" />
        
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${getGradient()} shadow-lg`}>
                <Icon className="h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-slate-700">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
              </div>
            </div>
            {!isCompliant ? (
              <motion.div
                animate={{ rotate: [-10, 10, -10] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <AlertTriangle className="h-8 w-8 text-red-500 drop-shadow-lg" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircle2 className="h-8 w-8 text-emerald-500 drop-shadow-lg" />
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 relative z-10 pb-6">
          {/* Large animated value */}
          <motion.div
            key={displayValue}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-6"
          >
            <div className="text-5xl lg:text-6xl font-black bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent drop-shadow-2xl mb-2">
              {displayValue.toFixed(1)}
            </div>
            <div className="text-xl font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
              {unit}
            </div>
          </motion.div>

          {/* Progress Bar */}
          {min !== undefined && max !== undefined && (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>{min}</span>
                <span>{max} {unit}</span>
              </div>
              <Progress value={progress} className="h-3 [&>div]:rounded-full!">
                <div 
                  className={`h-full ${getGradient()} shadow-inner rounded-full`}
                  style={{ width: `${progress}%` }}
                />
              </Progress>
              <div className="text-right">
                <span className={`text-sm font-semibold ${
                  progress < 30 ? 'text-emerald-600' : 
                  progress < 70 ? 'text-amber-600' : 
                  'text-blue-600'
                }`}>
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2">
            <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transform -rotate-3 ${
              isCompliant 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-2 border-emerald-300 shadow-emerald-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-2 border-red-300 shadow-red-200 animate-pulse'
            }`}>
              {isCompliant ? 'COMPLIANT ✅' : 'CRITICAL ⚠️'}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

