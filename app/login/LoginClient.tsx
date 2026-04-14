"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, LogIn } from "lucide-react"
import { login, type User } from '@/lib/auth'
import Cookies from 'js-cookie'
const useToast = () => ({ toast: (options: any) => console.log('Toast:', options) })

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(credentials)
      
      if (!user) {
        setError('Invalid credentials')
        toast({
          title: "Login Failed",
          description: "Username atau password salah",
          variant: "destructive",
        })
        return
      }

      Cookies.set('wtp-auth-token', user.username, { expires: 1 }) 

      toast({
        title: "Login Berhasil!",
        description: `Selamat datang, ${user.username}!`,
      })

      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-center">WTP Dashboard</CardTitle>
            <CardDescription className="text-center">
              Masukkan username dan password untuk login
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center p-4 gap-2 bg-destructive/10 border border-destructive/30 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin atau operator"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            <div className="mt-6 text-xs text-center text-muted-foreground">
              Demo Login:<br />
              <strong>admin</strong> / admin <br />
              <strong>operator</strong> / operator
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

