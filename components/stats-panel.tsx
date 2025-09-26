"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface SensorData {
  ph: number
  salinity: number
  temperature: number
  humidity: number
  conductivity: number
  timestamp: Date
}

interface StatsPanelProps {
  data: SensorData
}

export function StatsPanel({ data }: StatsPanelProps) {
  const getOptimalRange = (value: number, min: number, max: number) => {
    return ((value - min) / (max - min)) * 100
  }

  const getTrend = (current: number, optimal: number) => {
    const diff = Math.abs(current - optimal)
    if (diff < 0.1) return "stable"
    return current > optimal ? "up" : "down"
  }

  const stats = [
    {
      label: "pH",
      value: data.ph,
      optimal: 6.5,
      min: 5.5,
      max: 7.5,
      unit: "",
      progress: getOptimalRange(data.ph, 5.5, 7.5),
    },
    {
      label: "Temperatura",
      value: data.temperature,
      optimal: 24,
      min: 18,
      max: 28,
      unit: "°C",
      progress: getOptimalRange(data.temperature, 18, 28),
    },
    {
      label: "Umidade",
      value: data.humidity,
      optimal: 65,
      min: 50,
      max: 80,
      unit: "%",
      progress: getOptimalRange(data.humidity, 50, 80),
    },
    {
      label: "Condutividade",
      value: data.conductivity,
      optimal: 1.8,
      min: 1.0,
      max: 2.5,
      unit: "mS/cm",
      progress: getOptimalRange(data.conductivity, 1.0, 2.5),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Performance</CardTitle>
        <CardDescription>Comparação com valores ideais para hidroponia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat) => {
          const trend = getTrend(stat.value, stat.optimal)
          const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

          return (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stat.label}</span>
                  <TrendIcon
                    className={`h-4 w-4 ${
                      trend === "stable" ? "text-primary" : trend === "up" ? "text-chart-5" : "text-chart-2"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {stat.value.toFixed(1)}
                    {stat.unit}
                  </span>
                  <Badge
                    variant={
                      Math.abs(stat.value - stat.optimal) < (stat.max - stat.min) * 0.1 ? "default" : "secondary"
                    }
                  >
                    {Math.abs(stat.value - stat.optimal) < (stat.max - stat.min) * 0.1 ? "Ideal" : "Ajustar"}
                  </Badge>
                </div>
              </div>
              <Progress value={Math.max(0, Math.min(100, stat.progress))} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {stat.min}
                  {stat.unit}
                </span>
                <span>
                  Ideal: {stat.optimal}
                  {stat.unit}
                </span>
                <span>
                  {stat.max}
                  {stat.unit}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
