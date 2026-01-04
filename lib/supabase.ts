import { createClient } from '@supabase/supabase-js'

// Replace these with your actual keys from Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://uwktsngnovzetebafakb.supabase.co'
const supabaseKey = 'sb_publishable_z6JpNVLeWiAnsvNX71JavA_LccaDIIn'

export const supabase = createClient(supabaseUrl, supabaseKey)