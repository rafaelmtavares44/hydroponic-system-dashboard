"use client";

import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { SensorChart } from "@/components/sensor-chart";
import { StatsPanel } from "@/components/stats-panel";
import { NotificationPanel } from "@/components/notification-panel";
import { HistoryPanel } from "@/components/history-panel";
import {
  Droplets, Thermometer, Zap, Beaker, Activity, Send, RefreshCw, Ruler
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8080";

interface SensorData {
  ph: number;
  temperature: number;
  humidity: number;
  conductivity: number;
  distance: number;
  timestamp: Date;
}

interface LatestApiResponse {
  ph?: string;
  temperature?: string;
  humidity?: string;
  conductivity?: string;
  distance?: string;
  timestamp?: string;
}

interface TempRankingItem {
  id: string;
  temperature: number;
}

const parseNumber = (value?: string): number => {
  const n = Number.parseFloat(value ?? "");
  return Number.isNaN(n) ? 0 : n;
};

const fromLatestApi = (data: LatestApiResponse): SensorData => {
  const ts = data.timestamp ? Number.parseInt(data.timestamp) : Date.now();
  return {
    ph: parseNumber(data.ph),
    temperature: parseNumber(data.temperature),
    humidity: parseNumber(data.humidity),
    conductivity: parseNumber(data.conductivity),
    distance: parseNumber(data.distance),
    timestamp: new Date(Number.isNaN(ts) ? Date.now() : ts),
  };
};

export default function HydroponicDashboard() {
  const [sensorData, setSensorData] = useState<SensorData>({
    ph: 6.5,
    temperature: 24.5,
    humidity: 65,
    conductivity: 1.8,
    distance: 100,
    timestamp: new Date(),
  });

  const [formData, setFormData] = useState<Omit<SensorData, "timestamp">>({
    ph: 6.5,
    temperature: 24.5,
    humidity: 65,
    conductivity: 1.8,
    distance: 100,
  });

  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<
    Array<{ id: string; message: string; type: "warning" | "error" | "info"; timestamp: Date }>
  >([]);
  const [tempRanking, setTempRanking] = useState<TempRankingItem[]>([]);

  // Atualiza dados dos sensores periodicamente
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/latest`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: LatestApiResponse = await res.json();
        if (!isMounted) return;
        const mapped = fromLatestApi(json);
        setSensorData(mapped);
        setLastUpdate(new Date());
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Atualiza ranking
  useEffect(() => {
    let isMounted = true;
    const fetchRanking = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/ranking/temperature?limit=5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Array<{ id: string; temperature: number }> = await res.json();
        if (!isMounted) return;
        setTempRanking(json);
      } catch (error) {}
    };
    fetchRanking();
    const interval = setInterval(fetchRanking, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Alertas críticos locais
  useEffect(() => {
    const alerts = [];
    if (sensorData.ph < 5.5 || sensorData.ph > 7.5) {
      alerts.push({
        id: `ph-${Date.now()}`,
        message: `pH crítico: ${sensorData.ph.toFixed(1)}`,
        type: "error" as const,
        timestamp: new Date(),
      });
    }
    if (sensorData.temperature > 30) {
      alerts.push({
        id: `temp-${Date.now()}`,
        message: `Temperatura alta: ${sensorData.temperature.toFixed(1)}°C`,
        type: "warning" as const,
        timestamp: new Date(),
      });
    }
    if (alerts.length > 0) {
      setNotifications((prev) => [...prev.slice(-4), ...alerts]);
    }
  }, [sensorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSensorData({
        ...formData,
        timestamp: new Date(),
      });
      setNotifications((prev) => [
        ...prev.slice(-4),
        {
          id: `submit-${Date.now()}`,
          message: "Dados locais atualizados",
          type: "info",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setNotifications((prev) => [
        ...prev.slice(-4),
        {
          id: `error-${Date.now()}`,
          message: "Erro ao enviar dados",
          type: "error",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const getSensorStatus = (value: number, min: number, max: number) => {
    if (value < min || value > max) return "error";
    if (value < min + (max - min) * 0.1 || value > max - (max - min) * 0.1)
      return "warning";
    return "normal";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-balance">
                  HydroMonitor
                </h1>
              </div>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span suppressHydrationWarning>
                  Última atualização:{" "}
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : "--:--:--"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
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

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* pH */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">pH</CardTitle>
                  <Beaker className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sensorData.ph.toFixed(1)}
                  </div>
                  <Badge
                    variant={
                      getSensorStatus(sensorData.ph, 5.5, 7.5) === "normal"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {getSensorStatus(sensorData.ph, 5.5, 7.5) === "normal"
                      ? "Normal"
                      : "Crítico"}
                  </Badge>
                </CardContent>
              </Card>
              {/* Temperatura */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Temperatura
                  </CardTitle>
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sensorData.temperature.toFixed(1)}°C
                  </div>
                  <Badge
                    variant={
                      getSensorStatus(sensorData.temperature, 18, 28) === "normal"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {getSensorStatus(sensorData.temperature, 18, 28) === "normal"
                      ? "Normal"
                      : "Alerta"}
                  </Badge>
                </CardContent>
              </Card>
              {/* Umidade */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Umidade</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sensorData.humidity.toFixed(0)}%
                  </div>
                  <Badge variant="default">Normal</Badge>
                </CardContent>
              </Card>
              {/* Condutividade */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Condutividade
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sensorData.conductivity.toFixed(1)} mS/cm
                  </div>
                  <Badge variant="default">Normal</Badge>
                </CardContent>
              </Card>
              {/* Distância/Nível da água */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Distância (Nível da Água)
                  </CardTitle>
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sensorData.distance.toFixed(0)} mm
                  </div>
                  <Badge variant="default">
                    {(sensorData.distance > 0 && sensorData.distance < 50)
                      ? "Baixo"
                      : "Normal"}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* PAINÉIS EXTRAS: Gráficos, stats, notificações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SensorChart data={sensorData} />
              <StatsPanel data={sensorData} />
            </div>
            <NotificationPanel notifications={notifications} />
          </TabsContent>

          {/* ENTRADA DE DADOS */}
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
                          setFormData((prev) => ({
                            ...prev,
                            ph: Number.parseFloat(e.target.value) || 0,
                          }))
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
                          setFormData((prev) => ({
                            ...prev,
                            temperature: Number.parseFloat(e.target.value) || 0,
                          }))
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
                          setFormData((prev) => ({
                            ...prev,
                            humidity: Number.parseFloat(e.target.value) || 0,
                          }))
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
                          setFormData((prev) => ({
                            ...prev,
                            conductivity: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance">Distância (mm)</Label>
                      <Input
                        id="distance"
                        type="number"
                        step="1"
                        min="0"
                        value={formData.distance}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            distance: Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Dados (local)
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS / RANKING DE TEMPERATURAS */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Temperaturas</CardTitle>
                <CardDescription>
                  Baseado em Redis Sorted Sets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tempRanking.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sem dados de ranking ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {tempRanking.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{item.temperature.toFixed(1)}°C</span>
                        </div>
                        <span className="text-xs text-muted-foreground break-all">{item.id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* HISTÓRICO */}
          <TabsContent value="history" className="space-y-6">
            <HistoryPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
