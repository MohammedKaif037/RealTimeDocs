"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AirQualityCardProps {
  cityName: string
  aqi: number
  pm25: number
  pm10: number
  o3: number
  no2: number
  so2: number
  co: number
  updatedAt: string
}

export function AirQualityCard({
  cityName,
  aqi,
  pm25,
  pm10,
  o3,
  no2,
  so2,
  co,
  updatedAt,
}: AirQualityCardProps) {
  // Determine AQI category and color
  const getAqiCategory = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", color: "bg-green-500", textColor: "text-green-500" }
    if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-500" }
    if (aqi <= 150)
      return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-500", textColor: "text-orange-500" }
    if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-500" }
    if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-500" }
    return { label: "Hazardous", color: "bg-rose-900", textColor: "text-rose-900" }
  }

  const aqiInfo = getAqiCategory(aqi)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Air Quality in {cityName}</CardTitle>
          <Badge variant={aqi <= 50 ? "default" : "outline"} className={aqiInfo.textColor}>
            {aqiInfo.label}
          </Badge>
        </div>
        <CardDescription>Current air quality measurements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Air Quality Index</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      The Air Quality Index (AQI) is a scale from 0 to 500. Higher values indicate worse air quality.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-bold">{aqi}</span>
          </div>
          <Progress value={(aqi / 500) * 100} className={aqiInfo.color} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">PM2.5</span>
              <span className="text-sm">{pm25} µg/m³</span>
            </div>
            <Progress value={(pm25 / 100) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">PM10</span>
              <span className="text-sm">{pm10} µg/m³</span>
            </div>
            <Progress value={(pm10 / 150) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Ozone (O₃)</span>
              <span className="text-sm">{o3} ppb</span>
            </div>
            <Progress value={(o3 / 100) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">NO₂</span>
              <span className="text-sm">{no2} ppb</span>
            </div>
            <Progress value={(no2 / 100) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">SO₂</span>
              <span className="text-sm">{so2} ppb</span>
            </div>
            <Progress value={(so2 / 100) * 100} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">CO</span>
              <span className="text-sm">{co} ppm</span>
            </div>
            <Progress value={(co / 10) * 100} className="h-2" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Last updated: {new Date(updatedAt).toLocaleString()}</p>
      </CardFooter>
    </Card>
  )
}
