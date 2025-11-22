"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SensorChart } from "@/components/sensor-chart"
import { StatsPanel } from "@/components/stats-panel"
import { NotificationPanel } from "@/components/notification-panel"
import { HistoryPanel } from "@/components/history-panel"
import { SettingsForm } from "@/components/live/settings-form"
import { Droplets, Thermometer, Zap, Beaker, Activity, RefreshCw, Wifi, WifiOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SensorData {
  ph: number
  salinity: number
  temperature: number
  humidity: number
  conductivity: number
  timestamp: Date
}

const API_BASE_URL = "https://catchweight-kenton-distrustfully.ngrok-free.dev"

export default function LiveDashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    ph: 0,
    salinity: 0,
    temperature: 0,
    humidity: 0,
    conductivity: 0,
    timestamp: new Date(),
  })

  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: "warning" | "error" | "info"; timestamp: Date }>
  >([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      console.log(`[Dashboard] Tentando conectar em: ${API_BASE_URL}/api/dados`)
      const response = await fetch(`${API_BASE_URL}/api/dados`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (!response.ok) {
        console.error(`[Dashboard] Erro HTTP: ${response.status} ${response.statusText}`)
        throw new Error(`Falha na conexão: ${response.status}`)
      }

      const data = await response.json()
      console.log("[Dashboard] Dados recebidos:", data)

      if (Array.isArray(data) && data.length > 0) {
        const latest = data[0]

        setSensorData({
          ph: latest.ph || 0,
          salinity: latest.eletrocondutividade || 0, // Using EC as salinity proxy for now
          temperature: latest.temperatura || 0,
          humidity: latest.umidade || 0,
          conductivity: latest.eletrocondutividade || 0,
          timestamp: new Date(), // Using current time for live update
        })
        setLastUpdate(new Date())
        setIsConnected(true)
      } else {
        console.warn("[Dashboard] Formato de dados inesperado ou vazio", data)
      }
    } catch (error) {
      console.error("[Dashboard] Erro fatal ao buscar dados:", error)
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [fetchData])

  useEffect(() => {
    if (!isConnected) return

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
  }, [sensorData, isConnected])

  const getSensorStatus = (value: number, min: number, max: number) => {
    if (value < min || value > max) return "error"
    if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1) return "warning"
    return "normal"
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-balance">HydroMonitor Live</h1>
                  <p className="text-xs text-muted-foreground">Conectado a API Local (Porta 8080)</p>
                </div>
              </div>
              <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isConnected ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para Simulação
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>
                  Última atualização: {isMounted && lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        {!isConnected && (
          <Alert variant="destructive" className="mb-6">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              Não foi possível conectar à API em {API_BASE_URL}/api/dados. Verifique se o servidor Flask está rodando e
              se o CORS está habilitado.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SensorChart data={sensorData} />
              <StatsPanel data={sensorData} />
            </div>

            <NotificationPanel notifications={notifications} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsForm />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Temperaturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { temp: 28.5, time: "14:30", rank: 1 },
                      { temp: 27.8, time: "13:45", rank: 2 },
                      { temp: 26.9, time: "15:20", rank: 3 },
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
