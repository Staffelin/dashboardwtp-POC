import { createClient } from '@supabase/supabase-js'

// Read Supabase connection info from environment variables.
// For client-side code in Next.js, variables must be prefixed with NEXT_PUBLIC_
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (process.env.NODE_ENV !== 'production' && (!supabaseUrl || !supabaseKey)) {
  console.warn('Supabase env vars missing. Create a .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)