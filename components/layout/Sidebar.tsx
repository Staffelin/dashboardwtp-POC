import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  Droplet,
  Gauge
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useSession } from '@/hooks/useSession'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  role?: string[]
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/history', label: 'Riwayat', icon: BarChart3 },
  { href: '/alarms', label: 'Alarm', icon: Bell },
  { href: '/sensors', label: 'Sensor', icon: Droplet },
  { href: '/pumps', label: 'Pompa', icon: Gauge },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useSession()

  return (
    <div className="hidden md:flex flex-col w-64 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-r h-screen p-4 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b mb-6">
        <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Droplet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">WTP Dashboard</h1>
          <p className="text-xs text-muted-foreground">{user?.role || 'Operator'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          if (item.role && !item.role.includes(user?.role || '')) return null
          
          const Icon = item.icon
          const active = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start h-12 gap-3"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Actions */}
      <div className="border-t pt-4 mt-auto">
        <Button variant="ghost" className="w-full justify-start h-12 gap-3" onClick={logout}>
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  )
}

