 'use client'

import { useSession } from '@/hooks/useSession'
import { Button } from '@/components/ui/button'
import { LogOut, Bell, User } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useSession()

  return (
    <header className="bg-background/95 backdrop-blur border-b sticky top-0 z-50">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{user?.username}</span>
            <span className="text-xs text-muted-foreground">({user?.role})</span>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={logout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

