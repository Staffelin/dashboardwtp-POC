"use client"

import { useEffect, useRef, useState } from "react"

export default function useAlarmSound() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("alarm-sound-enabled") === "true"
    } catch (e) {
      return false
    }
  })

  const audioCtxRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<number | null>(null)
  const isPlayingRef = useRef(false)

  const ensureCtx = () => {
    if (!audioCtxRef.current) {
      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext
      if (Ctx) audioCtxRef.current = new Ctx()
    }
    return audioCtxRef.current
  }

  const playAlarm = () => {
    if (!enabled) return
    const ctx = ensureCtx()
    if (!ctx) return
    // Some browsers require resume on user gesture — try resume
    if (ctx.state === "suspended") ctx.resume().catch(() => {})

    if (isPlayingRef.current) return
    isPlayingRef.current = true

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => console.log('Audio resumed')).catch(e => console.error('Audio resume failed:', e))
    }

    // Play a short beep every 600ms
    intervalRef.current = window.setInterval(() => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = "sine"
      o.frequency.value = 1000
      g.gain.value = 0
      o.connect(g)
      g.connect(ctx.destination)
      const now = ctx.currentTime
      g.gain.setValueAtTime(0.001, now)
      g.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
      o.start(now)
      o.stop(now + 0.18)
    }, 600)
  }

  const stopAlarm = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isPlayingRef.current = false
  }

  const enable = () => {
    try {
      localStorage.setItem("alarm-sound-enabled", "true")
    } catch (e) {}
    setEnabled(true)
    // create/resume audio context on explicit user action
    const ctx = ensureCtx()
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {})
  }

  const disable = () => {
    try {
      localStorage.setItem("alarm-sound-enabled", "false")
    } catch (e) {}
    setEnabled(false)
    stopAlarm()
  }

  useEffect(() => {
    return () => {
      stopAlarm()
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
        audioCtxRef.current = null
      }
    }
  }, [])

  return { enabled, enable, disable, playAlarm, stopAlarm,ensureCtx }
}
