"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useState, useEffect } from "react"

interface SensorData {
  ph: number
  salinity: number
  temperature: number
  humidity: number
  conductivity: number
  timestamp: Date
}

interface SensorChartProps {
  data: SensorData
}

export function SensorChart({ data }: SensorChartProps) {
  const [chartData, setChartData] = useState<
    Array<{
      time: string
      ph: number
      temperature: number
      humidity: number
      conductivity: number
    }>
  >([])

  useEffect(() => {
    setChartData((prev) => {
      const newData = [
        ...prev,
        {
          time: data.timestamp.toLocaleTimeString(),
          ph: data.ph,
          temperature: data.temperature,
          humidity: data.humidity,
          conductivity: data.conductivity,
        },
      ].slice(-20) // Manter apenas os últimos 20 pontos

      return newData
    })
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoramento em Tempo Real</CardTitle>
        <CardDescription>Dados dos sensores atualizados a cada 5 segundos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="ph" stroke="hsl(var(--chart-1))" strokeWidth={2} name="pH" dot={false} />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Temperatura (°C)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                name="Umidade (%)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="conductivity"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                name="Condutividade"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
