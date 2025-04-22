"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AirQualityData {
  timestamp: string
  aqi: number
  pm25: number
  pm10: number
  o3: number
  no2: number
  so2: number
  co: number
}

interface AirQualityChartProps {
  data: AirQualityData[]
  cityName: string
}

export function AirQualityChart({ data, cityName }: AirQualityChartProps) {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h")
  
  // Filter data based on selected time range
  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.timestamp)
    const now = new Date()
    if (timeRange === "24h") {
      return now.getTime() - entryDate.getTime() <= 24 * 60 * 60 * 1000
    } else if (timeRange === "7d") {
      return now.getTime() - entryDate.getTime() <= 7 * 24 * 60 * 60 * 1000
    } else {
      return now.getTime() - entryDate.getTime() <= 30 * 24 * 60 * 60 * 1000
    }
  })
  
  // Format timestamp for display
  const formattedData = filteredData.map((entry) => ({
    ...entry,
    timestamp: new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: timeRange !== "24h" ? "short" : undefined,
      day: timeRange !== "24h" ? "numeric" : undefined,
    }),
  }))
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Air Quality Trends for {cityName}</CardTitle>
        <CardDescription>Historical air quality measurements over time</CardDescription>
        <Tabs
          defaultValue="24h"
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as "24h" | "7d" | "30d")}
        >
          <TabsList>
            <TabsTrigger value="24h">Last 24 Hours</TabsTrigger>
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pm25" name="PM2.5" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="pm10" name="PM10" stroke="#82ca9d" />
              <Line type="monotone" dataKey="o3" name="Ozone" stroke="#ffc658" />
              <Line type="monotone" dataKey="no2" name="NO₂" stroke="#ff8042" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
