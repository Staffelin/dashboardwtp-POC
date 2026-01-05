import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle } from "lucide-react"

export default function SensorStatusCard({
  title,
  value,
  unit,
  icon: Icon,
  isCompliant,
  description,
}: {
  title: string
  value: number
  unit: string
  icon: React.ElementType
  isCompliant: boolean
  description: string
}) {
  return (
    <Card className={`${!isCompliant ? "bg-red-50 border-red-500 border-2 dark:bg-red-950" : "bg-white dark:bg-card"}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${!isCompliant ? "text-red-600" : "text-blue-600"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {value.toFixed(2)} <span className="text-lg">{unit}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {isCompliant ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-600 font-semibold">COMPLIANT</p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-xs text-red-600 font-semibold">DANGER - OUT OF RANGE</p>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
