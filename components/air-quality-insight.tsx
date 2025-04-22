"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ThumbsUp, Users, Wind, Activity, Droplets } from "lucide-react"

interface AirQualityInsightProps {
  aqi: number
  pm25: number
  humidity: number
  temperature: number
  windSpeed: number
  cityName: string
}

export default function AirQualityInsight({
  aqi,
  pm25,
  humidity,
  temperature,
  windSpeed,
  cityName,
}: AirQualityInsightProps) {
  // Generate health recommendations based on AQI
  const getHealthRecommendation = (aqi: number) => {
    if (aqi <= 50) {
      return {
        title: "Good Air Quality",
        description: "Air quality is considered satisfactory, and air pollution poses little or no risk.",
        icon: <ThumbsUp className="h-5 w-5" />,
        variant: "default",
        activities: ["Enjoy outdoor activities", "Open windows for fresh air", "Perfect for exercising outside"],
      }
    } else if (aqi <= 100) {
      return {
        title: "Moderate Air Quality",
        description:
          "Air quality is acceptable; however, there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.",
        icon: <Users className="h-5 w-5" />,
        variant: "warning",
        activities: [
          "Sensitive groups should reduce prolonged outdoor exertion",
          "Consider indoor activities if you experience symptoms",
          "Keep windows closed during peak traffic hours",
        ],
      }
    } else if (aqi <= 150) {
      return {
        title: "Unhealthy for Sensitive Groups",
        description:
          "Members of sensitive groups may experience health effects. The general public is not likely to be affected.",
        icon: <AlertCircle className="h-5 w-5" />,
        variant: "destructive",
        activities: [
          "Sensitive groups should avoid outdoor exertion",
          "Consider using air purifiers indoors",
          "Keep windows closed",
          "Wear a mask if you must go outside",
        ],
      }
    } else {
      return {
        title: "Unhealthy Air Quality",
        description:
          "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
        icon: <AlertCircle className="h-5 w-5" />,
        variant: "destructive",
        activities: [
          "Avoid outdoor activities",
          "Keep windows closed",
          "Use air purifiers",
          "Wear N95 masks if you must go outside",
          "Consider relocating temporarily if possible",
        ],
      }
    }
  }

  const recommendation = getHealthRecommendation(aqi)

  // Generate weather impact insights
  const getWeatherImpact = () => {
    const insights = []

    if (windSpeed < 5) {
      insights.push({
        title: "Low Wind Speed",
        description: "Low wind speeds can cause pollutants to accumulate, worsening air quality.",
        icon: <Wind className="h-5 w-5" />,
      })
    } else if (windSpeed > 15) {
      insights.push({
        title: "High Wind Speed",
        description: "Strong winds are helping to disperse pollutants, improving air quality.",
        icon: <Wind className="h-5 w-5" />,
      })
    }

    if (humidity > 80) {
      insights.push({
        title: "High Humidity",
        description: "High humidity can trap pollutants closer to the ground, potentially worsening air quality.",
        icon: <Droplets className="h-5 w-5" />,
      })
    } else if (humidity < 30) {
      insights.push({
        title: "Low Humidity",
        description: "Low humidity may increase dust and particulate matter in the air.",
        icon: <Droplets className="h-5 w-5" />,
      })
    }

    if (temperature > 30) {
      insights.push({
        title: "High Temperature",
        description: "High temperatures can accelerate the formation of ground-level ozone, worsening air quality.",
        icon: <Activity className="h-5 w-5" />,
      })
    }

    return insights
  }

  const weatherInsights = getWeatherImpact()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Air Quality Insights for {cityName}</CardTitle>
        <CardDescription>Health recommendations and environmental factors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant={recommendation.variant === "destructive" ? "destructive" : "default"}>
          {recommendation.icon}
          <AlertTitle>{recommendation.title}</AlertTitle>
          <AlertDescription>{recommendation.description}</AlertDescription>
        </Alert>

        <div>
          <h3 className="text-lg font-medium mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {recommendation.activities.map((activity, index) => (
              <li key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full h-6 w-6 p-0 flex items-center justify-center">
                  {index + 1}
                </Badge>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>

        {weatherInsights.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Weather Impact</h3>
            <div className="space-y-3">
              {weatherInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-full">{insight.icon}</div>
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-1">Did you know?</h3>
          <p className="text-sm text-muted-foreground">
            PM2.5 particles are so small they can penetrate deep into your lungs and even enter your bloodstream.
            {pm25 > 35
              ? " Current levels in your area are above WHO recommended limits."
              : " Current levels in your area are within safe limits."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
