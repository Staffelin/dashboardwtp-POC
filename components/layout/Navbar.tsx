'use client'

import { useSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/button'
import { LogOut, Bell, User, Clock, BarChart, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface NavbarProps {
  hasWarning?: boolean
  alarmEnabled?: boolean
  onAlarmToggle?: () => void
}

export default function Navbar({ hasWarning, alarmEnabled, onAlarmToggle }: NavbarProps) {
  const { user, logout } = useSession()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Title */}
          <div className="flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-black bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
              WTP Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1">
              Real-time Water Treatment Plant Monitoring - Permenkes Compliant
            </p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* Critical Alert */}
            {hasWarning && (
              <div className="flex items-center gap-2 p-2 bg-red-100/50 rounded-xl border border-red-200 animate-pulse">
                <Bell className="h-5 w-5 text-red-600" />
                <span className="text-sm font-bold text-red-800">CRITICAL ALERT</span>
                <Button
                  size="sm"
                  variant={alarmEnabled ? "default" : "outline"}
                  onClick={onAlarmToggle}
                  className="ml-2 h-8"
                >
                  {alarmEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <span className="ml-1">{alarmEnabled ? 'ON' : 'OFF'}</span>
                </Button>
              </div>
            )}

            {/* Clock */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>

            {/* User info */}
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{user?.username}</span>
              <span className="text-xs text-muted-foreground">({user?.role})</span>
            </div>

            {/* Logout */}
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={logout}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}