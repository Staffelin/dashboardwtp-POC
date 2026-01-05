import React from "react"
import { Beaker, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const TANK_WARNING_THRESHOLD = 10

export default function ChemicalTank({ name, level, color }: { name: string; level: number; color: string }) {
  const needsRefill = level < TANK_WARNING_THRESHOLD

  return (
    <Card className={needsRefill ? "border-red-500 border-2 bg-red-50 dark:bg-red-950" : ""}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Beaker className="h-4 w-4" />
          {name} Tank
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="relative h-32 w-24 mx-auto border-4 border-gray-700 rounded-b-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <div className={`absolute bottom-0 w-full transition-all duration-500 ${color}`} style={{ height: `${level}%` }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white z-10">{level}%</span>
            </div>
          </div>

          <div className="text-center">
            {needsRefill ? (
              <div className="flex items-center justify-center gap-1 text-red-600 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">REFILL NEEDED</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 text-green-600 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">NORMAL</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
