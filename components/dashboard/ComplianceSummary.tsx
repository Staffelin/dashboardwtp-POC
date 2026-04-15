import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"


interface ComplianceSummaryProps {
  sensors: {
    phCompliant: boolean
    turbidityCompliant: boolean
    tdsCompliant: boolean
  }
  tanks: {
    kaporitOk: boolean
    pacOk: boolean
  }
}

export default function ComplianceSummary({ 
  sensors, 
  tanks 
}: ComplianceSummaryProps) {
  const compliantCount = [
    sensors.phCompliant,
    sensors.turbidityCompliant, 
    sensors.tdsCompliant,
    tanks.kaporitOk,
    tanks.pacOk
  ].filter(Boolean).length

  const totalChecks = 5
  const isFullyCompliant = compliantCount === totalChecks

  return (
    <Card className={`${
      isFullyCompliant 
        ? "bg-linear-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800"
        : "bg-linear-to-r from-orange-50 to-red-50 border-orange-200 dark:from-orange-950 dark:to-red-950 dark:border-orange-800"
        
    } shadow-xl`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-lg">Permenkes No. 2/2023 Compliance</CardTitle>
          {isFullyCompliant ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {compliantCount}/{totalChecks}
            </div>
            <p className="text-sm text-muted-foreground">Parameters OK</p>
          </div>
          <Badge variant={isFullyCompliant ? "default" : "destructive"} className="text-lg px-4 py-2">
            {isFullyCompliant ? "FULLY COMPLIANT ✅" : "ACTION REQUIRED ⚠️"}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className={`p-2 rounded-md text-center ${
            sensors.phCompliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            pH {sensors.phCompliant ? "✓" : "✗"}
          </div>
          <div className={`p-2 rounded-md text-center ${
            sensors.turbidityCompliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            Turbidity {sensors.turbidityCompliant ? "✓" : "✗"}
          </div>
          <div className={`p-2 rounded-md text-center ${
            sensors.tdsCompliant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            TDS {sensors.tdsCompliant ? "✓" : "✗"}
          </div>
          <div className={`p-2 rounded-md text-center ${
            tanks.kaporitOk ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            Kaporit {tanks.kaporitOk ? "✓" : "✗"}
          </div>
          <div className={`p-2 rounded-md text-center ${
            tanks.pacOk ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            PAC {tanks.pacOk ? "✓" : "✗"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

