"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { verifyToken, type User } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface SessionContextType {
  user: User | null
  loading: boolean
  logout: () => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const session = Cookies.get('wtp-auth-token')
    console.log(">>> SESSION PROVIDER CHECK:", { 
    sessionFound: !!session,
    val: session 
  })
  
  if (session) {
    setUser({ 
      id: session === 'admin' ? '1' : '2', 
      username: session, 
      role: session === 'admin' ? 'admin' : 'operator' 
    })
  }
  setLoading(false)
}, [])

  const logout = () => {
    Cookies.remove('wtp-auth-token')
    router.push('/login')
    router.refresh()
  }

  return (
    <SessionContext.Provider value={{ user, loading, logout }}>
      {children}
    </SessionContext.Provider>
  )
}


export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}


