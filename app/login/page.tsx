import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    }>
      <LoginClient />
    </Suspense>
  )
}