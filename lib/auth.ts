import type { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { type NextRequest } from 'next/server'
import { serialize, parse } from 'cookie'
import type { SerializeOptions } from 'cookie'
import { SignJWT, jwtVerify } from 'jose'


const SECRET_KEY = new TextEncoder().encode('wtp-dashboard-super-secret-key-2024')
const TOKEN_NAME = 'wtp-auth-token'

export interface User {
  id: string
  username: string
  role: 'admin' | 'operator'
}

export async function createToken(user: User): Promise<string> {
  return await new SignJWT({ 
    username: user.username, 
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime('7d')
    .sign(SECRET_KEY)
}

export function getSessionToken(request: NextRequest): string | null | undefined {
  if (!request.cookies.has(TOKEN_NAME)) return null
  return request.cookies.get(TOKEN_NAME)?.value || null
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return {
      id: payload.sub!,
      username: payload.username as string,
      role: payload.role as 'admin' | 'operator'
    }
  } catch {
    return null
  }
}

export function logoutCookie() {
  return serialize(TOKEN_NAME, '', {
    httpOnly: true,
    expires: new Date(0)
  })
}

export async function login(credentials: { username: string, password: string }): Promise<User | null> {
  const demoUsers: Record<string, { user: User, password: string }> = {
    'admin': { 
      user: { id: '1', username: 'admin', role: 'admin' },
      password: 'admin' 
    },
    'operator': { 
      user: { id: '2', username: 'operator', role: 'operator' }, 
      password: 'operator'
    }
  }
  
  const demoUser = demoUsers[credentials.username]
  if (demoUser && demoUser.password === credentials.password) {
    return demoUser.user
  }
  
  return null
}

