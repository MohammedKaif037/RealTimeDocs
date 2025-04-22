export interface City {
  id: string
  name: string
  country: string
  latitude: number
  longitude: number
  population: number
  timezone: string
  aqi?: number
}

export const cities: City[] = [
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.006,
    population: 8804190,
    timezone: "America/New_York",
    aqi: 42,
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
    population: 8982000,
    timezone: "Europe/London",
    aqi: 35,
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    latitude: 48.8566,
    longitude: 2.3522,
    population: 2161000,
    timezone: "Europe/Paris",
    aqi: 48,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    latitude: 35.6762,
    longitude: 139.6503,
    population: 13960000,
    timezone: "Asia/Tokyo",
    aqi: 52,
  },
  {
    id: "beijing",
    name: "Beijing",
    country: "China",
    latitude: 39.9042,
    longitude: 116.4074,
    population: 21540000,
    timezone: "Asia/Shanghai",
    aqi: 110,
  },
  {
    id: "delhi",
    name: "Delhi",
    country: "India",
    latitude: 28.7041,
    longitude: 77.1025,
    population: 31399000,
    timezone: "Asia/Kolkata",
    aqi: 158,
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    latitude: -33.8688,
    longitude: 151.2093,
    population: 5312000,
    timezone: "Australia/Sydney",
    aqi: 28,
  },
  {
    id: "rio-de-janeiro",
    name: "Rio de Janeiro",
    country: "Brazil",
    latitude: -22.9068,
    longitude: -43.1729,
    population: 6748000,
    timezone: "America/Sao_Paulo",
    aqi: 45,
  },
  {
    id: "cairo",
    name: "Cairo",
    country: "Egypt",
    latitude: 30.0444,
    longitude: 31.2357,
    population: 20901000,
    timezone: "Africa/Cairo",
    aqi: 95,
  },
  {
    id: "lagos",
    name: "Lagos",
    country: "Nigeria",
    latitude: 6.5244,
    longitude: 3.3792,
    population: 14368000,
    timezone: "Africa/Lagos",
    aqi: 72,
  },
]

export function getCityById(id: string): City | undefined {
  return cities.find((city) => city.id === id)
}

export function getAllCities(): City[] {
  return cities
}

export function getCitiesByAirQuality(quality: "good" | "moderate" | "unhealthy" | "all" = "all"): City[] {
  if (quality === "all") return cities

  return cities.filter((city) => {
    const aqi = city.aqi || 0
    if (quality === "good") return aqi <= 50
    if (quality === "moderate") return aqi > 50 && aqi <= 100
    if (quality === "unhealthy") return aqi > 100
    return true
  })
}

export function getMockAirQualityData(cityId: string, days = 7) {
  const city = getCityById(cityId)
  if (!city) return []

  const baseAqi = city.aqi || 50
  const data = []

  // Generate data points for the specified number of days
  for (let i = 0; i < days; i++) {
    // For each day, generate 24 hourly data points
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(hour, 0, 0, 0)

      // Add some randomness to the data
      const randomFactor = Math.random() * 0.4 + 0.8 // Between 0.8 and 1.2
      const timeOfDayFactor = hour >= 7 && hour <= 19 ? 1.1 : 0.9 // Higher during the day

      const aqi = Math.round(baseAqi * randomFactor * timeOfDayFactor)
      const pm25 = Math.round(baseAqi * 0.4 * randomFactor)
      const pm10 = Math.round(baseAqi * 0.6 * randomFactor)
      const o3 = Math.round(baseAqi * 0.3 * randomFactor * (hour >= 10 && hour <= 16 ? 1.3 : 0.8)) // Higher during midday
      const no2 = Math.round(baseAqi * 0.2 * randomFactor * (hour >= 7 && hour <= 10 ? 1.4 : 0.9)) // Higher during morning rush hour
      const so2 = Math.round(baseAqi * 0.1 * randomFactor)
      const co = Math.round(baseAqi * 0.05 * randomFactor * 10) / 10

      data.push({
        timestamp: date.toISOString(),
        aqi,
        pm25,
        pm10,
        o3,
        no2,
        so2,
        co,
      })
    }
  }

  // Sort by timestamp in ascending order
  return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export function getMockWeatherData(cityId: string) {
  const city = getCityById(cityId)
  if (!city) return null

  // Generate mock weather data based on city location
  const isNorthernHemisphere = city.latitude > 0
  const currentMonth = new Date().getMonth() // 0-11

  // Adjust temperature based on hemisphere and month
  let baseTemperature = 22
  if (isNorthernHemisphere) {
    // Northern hemisphere: warmer in summer (months 5-8)
    if (currentMonth >= 5 && currentMonth <= 8) {
      baseTemperature += 8
    } else if (currentMonth >= 11 || currentMonth <= 2) {
      baseTemperature -= 10
    }
  } else {
    // Southern hemisphere: warmer in winter (months 11-2)
    if (currentMonth >= 11 || currentMonth <= 2) {
      baseTemperature += 8
    } else if (currentMonth >= 5 && currentMonth <= 8) {
      baseTemperature -= 10
    }
  }

  // Adjust for latitude (colder at higher latitudes)
  const latitudeAdjustment = (Math.abs(city.latitude) / 90) * 15
  baseTemperature -= latitudeAdjustment

  // Add some randomness
  const temperature = Math.round((baseTemperature + (Math.random() * 6 - 3)) * 10) / 10

  // Generate other weather data
  const humidity = Math.round(Math.random() * 30 + 50) // 50-80%
  const windSpeed = Math.round((Math.random() * 15 + 2) * 10) / 10 // 2-17 km/h
  const windDirection = Math.round(Math.random() * 360) // 0-360 degrees
  const pressure = Math.round(Math.random() * 30 + 1000) // 1000-1030 hPa
  const uvIndex = Math.round(Math.random() * 10 + 1) // 1-11
  const visibility = Math.round((Math.random() * 5 + 5) * 10) / 10 // 5-10 km

  return {
    temperature,
    humidity,
    windSpeed,
    windDirection,
    pressure,
    uvIndex,
    visibility,
    updatedAt: new Date().toISOString(),
  }
}
