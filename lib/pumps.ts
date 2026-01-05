import { supabase } from "./supabase"

export type PumpStatusType = "ON" | "OFF" | "ERROR"

export async function setPumpStatus(name: string, status: PumpStatusType) {
  try {
    // Try upsert: if there is a pumps table with unique name constraint, this will update or insert.
    const { data, error } = await supabase
      .from("pumps")
      .upsert({ name, status }, { onConflict: "name" })

    if (error) throw error

    return data
  } catch (err) {
    // If table doesn't exist or other error, warn but don't crash the app.
    console.warn("setPumpStatus failed (db may not have a 'pumps' table):", err)
    throw err
  }
} 
