import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('wtp-auth-token')?.value
  const { pathname } = request.nextUrl

  // 1. Biarkan folder sistem dan login lewat tanpa dicek sama sekali
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/login') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next()
  }

  // 2. Kalo gak ada token, paksa ke login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}