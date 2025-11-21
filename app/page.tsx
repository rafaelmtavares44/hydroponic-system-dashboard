"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SensorChart } from "@/components/sensor-chart"
import { StatsPanel } from "@/components/stats-panel"
import { NotificationPanel } from "@/components/notification-panel"
import { HistoryPanel } from "@/components/history-panel"
import { Droplets, Thermometer, Zap, Beaker, Activity, Send, RefreshCw, Wifi } from "lucide-react"

interface SensorData {
  ph: number
  salinity: number
  temperature: number
  humidity: number
  conductivity: number
  timestamp: Date
}

export default function HydroponicDashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    ph: 6.5,
    salinity: 1.2,
    temperature: 24.5,
    humidity: 65,
    conductivity: 1.8,
    timestamp: new Date(),
  })

  const [formData, setFormData] = useState<Omit<SensorData, "timestamp">>({
    ph: 6.5,
    salinity: 1.2,
    temperature: 24.5,
    humidity: 65,
    conductivity: 1.8,
  })

  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: "warning" | "error" | "info"; timestamp: Date }>
  >([])

  // Simular dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData((prev) => ({
        ph: prev.ph + (Math.random() - 0.5) * 0.2,
        salinity: prev.salinity + (Math.random() - 0.5) * 0.1,
        temperature: prev.temperature + (Math.random() - 0.5) * 1,
        humidity: prev.humidity + (Math.random() - 0.5) * 5,
        conductivity: prev.conductivity + (Math.random() - 0.5) * 0.1,
        timestamp: new Date(),
      }))
      setLastUpdate(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Verificar alertas
  useEffect(() => {
    const checkAlerts = () => {
      const alerts = []

      if (sensorData.ph < 5.5 || sensorData.ph > 7.5) {
        alerts.push({
          id: `ph-${Date.now()}`,
          message: `pH crítico: ${sensorData.ph.toFixed(1)}`,
          type: "error" as const,
          timestamp: new Date(),
        })
      }

      if (sensorData.temperature > 30) {
        alerts.push({
          id: `temp-${Date.now()}`,
          message: `Temperatura alta: ${sensorData.temperature.toFixed(1)}°C`,
          type: "warning" as const,
          timestamp: new Date(),
        })
      }

      if (alerts.length > 0) {
        setNotifications((prev) => [...prev.slice(-4), ...alerts])
      }
    }

    checkAlerts()
  }, [sensorData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simular envio para Redis MCP
    try {
      console.log("[v0] Enviando dados para Redis MCP:", formData)

      // Atualizar dados locais
      setSensorData({
        ...formData,
        timestamp: new Date(),
      })

      setNotifications((prev) => [
        ...prev.slice(-4),
        {
          id: `submit-${Date.now()}`,
          message: "Dados enviados com sucesso",
          type: "info",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("[v0] Erro ao enviar dados:", error)
      setNotifications((prev) => [
        ...prev.slice(-4),
        {
          id: `error-${Date.now()}`,
          message: "Erro ao enviar dados",
          type: "error",
          timestamp: new Date(),
        },
      ])
    }
  }

  const getSensorStatus = (value: number, min: number, max: number) => {
    if (value < min || value > max) return "error"
    if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1) return "warning"
    return "normal"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-balance">HydroMonitor</h1>
              </div>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/live">
                <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10 bg-transparent">
                  <Wifi className="h-4 w-4" />
                  Modo Tempo Real (API)
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="data-entry">Entrada de Dados</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">pH</CardTitle>
                  <Beaker className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sensorData.ph.toFixed(1)}</div>
                  <Badge variant={getSensorStatus(sensorData.ph, 5.5, 7.5) === "normal" ? "default" : "destructive"}>
                    {getSensorStatus(sensorData.ph, 5.5, 7.5) === "normal" ? "Normal" : "Crítico"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Salinidade</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sensorData.salinity.toFixed(1)} ppt</div>
                  <Badge variant="default">Normal</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Temperatura</CardTitle>
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sensorData.temperature.toFixed(1)}°C</div>
                  <Badge
                    variant={getSensorStatus(sensorData.temperature, 18, 28) === "normal" ? "default" : "destructive"}
                  >
                    {getSensorStatus(sensorData.temperature, 18, 28) === "normal" ? "Normal" : "Alerta"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Umidade</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sensorData.humidity.toFixed(0)}%</div>
                  <Badge variant="default">Normal</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Condutividade</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sensorData.conductivity.toFixed(1)} mS/cm</div>
                  <Badge variant="default">Normal</Badge>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SensorChart data={sensorData} />
              <StatsPanel data={sensorData} />
            </div>

            {/* Notifications */}
            <NotificationPanel notifications={notifications} />
          </TabsContent>

          <TabsContent value="data-entry" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Entrada Manual de Dados</CardTitle>
                <CardDescription>
                  Insira os dados dos sensores manualmente ou visualize os valores atuais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ph">pH</Label>
                      <Input
                        id="ph"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        value={formData.ph}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, ph: Number.parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salinity">Salinidade (ppt)</Label>
                      <Input
                        id="salinity"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.salinity}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, salinity: Number.parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperatura (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={formData.temperature}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="humidity">Umidade (%)</Label>
                      <Input
                        id="humidity"
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={formData.humidity}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, humidity: Number.parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="conductivity">Condutividade (mS/cm)</Label>
                      <Input
                        id="conductivity"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.conductivity}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, conductivity: Number.parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full md:w-auto">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Dados para Redis MCP
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Temperaturas</CardTitle>
                  <CardDescription>Baseado em Redis Sorted Sets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { temp: 28.5, time: "14:30", rank: 1 },
                      { temp: 27.8, time: "13:45", rank: 2 },
                      { temp: 26.9, time: "15:20", rank: 3 },
                      { temp: 25.2, time: "12:10", rank: 4 },
                      { temp: 24.1, time: "11:30", rank: 5 },
                    ].map((item) => (
                      <div key={item.rank} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{item.rank}</Badge>
                          <span className="font-medium">{item.temp}°C</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Busca Semântica MemoryForge</CardTitle>
                  <CardDescription>Análises avançadas com IA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertDescription>
                        Sistema detectou padrão de crescimento otimizado nas últimas 24h
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <h4 className="font-medium">Recomendações IA:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Ajustar pH para 6.2-6.8 para melhor absorção</li>
                        <li>• Reduzir temperatura em 2°C durante período noturno</li>
                        <li>• Aumentar condutividade em 0.2 mS/cm</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoryPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
