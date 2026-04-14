import { api } from "./api"

export type PumpStatusType = "ON" | "OFF" | "ERROR"

// Dummy pump statuses (can be extended to state management later)
const pumpStates: Record<string, PumpStatusType> = {
  'Pompa 1': 'ON',
  'Pompa 2': 'OFF',
  'Pompa Backwash': 'ERROR'
}

export async function setPumpStatus(name: string, status: PumpStatusType): Promise<{ success: boolean }> {
  // Dummy: optimistic success, update local state (for demo)
  // In real app, could use Zustand/RTK for pump states
  console.log(`Setting ${name} to ${status} (demo mode)`)
  pumpStates[name] = status
  return { success: true }
}

