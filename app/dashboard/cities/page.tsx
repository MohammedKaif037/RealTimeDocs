import type { Metadata } from "next"
import Link from "next/link"
import { getAllCities } from "@/lib/cities"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Cities Dashboard",
  description: "Monitor air quality across major cities worldwide",
}

export default function CitiesPage() {
  const cities = getAllCities()

  // Helper function to get AQI category and color
  const getAqiInfo = (aqi = 0) => {
    if (aqi <= 50) return { label: "Good", color: "bg-green-500", textColor: "text-green-500" }
    if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-500" }
    if (aqi <= 150)
      return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-500", textColor: "text-orange-500" }
    if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-500" }
    if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-500" }
    return { label: "Hazardous", color: "bg-rose-900", textColor: "text-rose-900" }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cities Dashboard</h1>
          <p className="text-muted-foreground">Monitor air quality across major cities worldwide</p>
        </div>
        <div className="w-full md:w-auto">
          <Input placeholder="Search cities..." className="md:w-[300px]" />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Cities</TabsTrigger>
          <TabsTrigger value="good">Good Air Quality</TabsTrigger>
          <TabsTrigger value="moderate">Moderate</TabsTrigger>
          <TabsTrigger value="unhealthy">Unhealthy</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => {
              const aqiInfo = getAqiInfo(city.aqi)

              return (
                <Card key={city.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{city.name}</CardTitle>
                      <Badge variant={city.aqi && city.aqi <= 50 ? "default" : "outline"} className={aqiInfo.textColor}>
                        {aqiInfo.label}
                      </Badge>
                    </div>
                    <CardDescription>{city.country}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 opacity-70" />
                        <span>
                          {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 opacity-70" />
                        <span>{(city.population / 1000000).toFixed(1)}M</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium mb-1">Air Quality Index</div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${aqiInfo.color}`}
                            style={{ width: `${Math.min((city.aqi || 0) / 3, 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{city.aqi || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" className="w-full" size="sm">
                      <Link href={`/dashboard/cities/${city.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="good" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities
              .filter((city) => (city.aqi || 0) <= 50)
              .map((city) => {
                const aqiInfo = getAqiInfo(city.aqi)

                return (
                  <Card key={city.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{city.name}</CardTitle>
                        <Badge variant="default" className={aqiInfo.textColor}>
                          {aqiInfo.label}
                        </Badge>
                      </div>
                      <CardDescription>{city.country}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 opacity-70" />
                          <span>
                            {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 opacity-70" />
                          <span>{(city.population / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-medium mb-1">Air Quality Index</div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${aqiInfo.color}`}
                              style={{ width: `${Math.min((city.aqi || 0) / 3, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{city.aqi || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="ghost" className="w-full" size="sm">
                        <Link href={`/dashboard/cities/${city.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
        <TabsContent value="moderate" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities
              .filter((city) => (city.aqi || 0) > 50 && (city.aqi || 0) <= 100)
              .map((city) => {
                const aqiInfo = getAqiInfo(city.aqi)

                return (
                  <Card key={city.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{city.name}</CardTitle>
                        <Badge variant="outline" className={aqiInfo.textColor}>
                          {aqiInfo.label}
                        </Badge>
                      </div>
                      <CardDescription>{city.country}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 opacity-70" />
                          <span>
                            {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 opacity-70" />
                          <span>{(city.population / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-medium mb-1">Air Quality Index</div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${aqiInfo.color}`}
                              style={{ width: `${Math.min((city.aqi || 0) / 3, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{city.aqi || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="ghost" className="w-full" size="sm">
                        <Link href={`/dashboard/cities/${city.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
        <TabsContent value="unhealthy" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities
              .filter((city) => (city.aqi || 0) > 100)
              .map((city) => {
                const aqiInfo = getAqiInfo(city.aqi)

                return (
                  <Card key={city.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{city.name}</CardTitle>
                        <Badge variant="outline" className={aqiInfo.textColor}>
                          {aqiInfo.label}
                        </Badge>
                      </div>
                      <CardDescription>{city.country}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 opacity-70" />
                          <span>
                            {city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 opacity-70" />
                          <span>{(city.population / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-sm font-medium mb-1">Air Quality Index</div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${aqiInfo.color}`}
                              style={{ width: `${Math.min((city.aqi || 0) / 3, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{city.aqi || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="ghost" className="w-full" size="sm">
                        <Link href={`/dashboard/cities/${city.id}`}>
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
