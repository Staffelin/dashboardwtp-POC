"use client"

import { Sidebar } from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <div className="min-h-screen bg-background">
          <div className="flex h-screen flex-col">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 p-8 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </div>
  )
}

