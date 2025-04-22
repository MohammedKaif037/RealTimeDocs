import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCityById, getMockAirQualityData, getMockWeatherData } from "@/lib/cities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Clock, Wind, Thermometer, Droplets, Gauge } from "lucide-react"
import { AirQualityCard }from "@/components/air-quality-card"
import { AirQualityChart } from "@/components/air-quality-chart"
import { AirQualityInsight } from "@/components/air-quality-insight"

export const generateMetadata = ({ params }: { params: { city: string } }): Metadata => {
  const city = getCityById(params.city)

  if (!city) {
    return {
      title: "City Not Found",
    }
  }

  return {
    title: `${city.name} Air Quality Dashboard`,
    description: `Monitor real-time air quality data for ${city.name}, ${city.country}`,
  }
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = getCityById(params.city)

  if (!city) {
    notFound()
  }

  // Get mock air quality data for the city
  const airQualityData = getMockAirQualityData(city.id, 7)
  const latestData = airQualityData[airQualityData.length - 1]

  // Get mock weather data
  const weatherData = getMockWeatherData(city.id)

  // Helper function to get AQI category and color
  const getAqiCategory = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", color: "bg-green-500", textColor: "text-green-500" }
    if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-500" }
    if (aqi <= 150)
      return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-500", textColor: "text-orange-500" }
    if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-500" }
    if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-500" }
    return { label: "Hazardous", color: "bg-rose-900", textColor: "text-rose-900" }
  }

  const aqiInfo = getAqiCategory(city.aqi || 0)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{city.name}</h1>
            <Badge variant={city.aqi && city.aqi <= 50 ? "default" : "outline"} className={aqiInfo.textColor}>
              {aqiInfo.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{city.country}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 opacity-70" />
            <span>
              {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 opacity-70" />
            <span>{(city.population / 1000000).toFixed(1)}M people</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 opacity-70" />
            <span>{city.timezone}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AirQualityCard
            cityName={city.name}
            aqi={latestData.aqi}
            pm25={latestData.pm25}
            pm10={latestData.pm10}
            o3={latestData.o3}
            no2={latestData.no2}
            so2={latestData.so2}
            co={latestData.co}
            updatedAt={latestData.timestamp}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Weather Conditions</CardTitle>
            <CardDescription>Current weather in {city.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded-full">
                  <Thermometer className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Temperature</p>
                  <p className="text-2xl font-bold">{weatherData?.temperature}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded-full">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Humidity</p>
                  <p className="text-2xl font-bold">{weatherData?.humidity}%</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded-full">
                  <Wind className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Wind</p>
                  <p className="text-lg font-bold">{weatherData?.windSpeed} km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-muted rounded-full">
                  <Gauge className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Pressure</p>
                  <p className="text-lg font-bold">{weatherData?.pressure} hPa</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-4">
              Last updated: {new Date(weatherData?.updatedAt || "").toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Air Quality Trends</TabsTrigger>
          <TabsTrigger value="insights">Health Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="trends" className="mt-6">
          <AirQualityChart data={airQualityData} cityName={city.name} />
        </TabsContent>
        <TabsContent value="insights" className="mt-6">
          <AirQualityInsight
            aqi={latestData.aqi}
            pm25={latestData.pm25}
            humidity={weatherData?.humidity || 50}
            temperature={weatherData?.temperature || 20}
            windSpeed={weatherData?.windSpeed || 5}
            cityName={city.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
