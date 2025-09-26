"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Filter } from "lucide-react"
import { useState } from "react"

export function HistoryPanel() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Dados simulados do Redis Streams
  const historyData = [
    {
      id: "stream-001",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      event: "sensor_reading",
      data: { ph: 6.5, temp: 24.5, humidity: 65 },
      status: "success",
    },
    {
      id: "stream-002",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      event: "alert_triggered",
      data: { type: "ph_critical", value: 5.2 },
      status: "warning",
    },
    {
      id: "stream-003",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      event: "manual_input",
      data: { ph: 6.8, temp: 25.0, humidity: 68 },
      status: "success",
    },
    {
      id: "stream-004",
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      event: "system_startup",
      data: { version: "1.0.0", sensors: 5 },
      status: "info",
    },
    {
      id: "stream-005",
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      event: "calibration",
      data: { sensor: "ph", old_value: 6.2, new_value: 6.5 },
      status: "success",
    },
  ]

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const filteredData = historyData.filter((item) => {
    const matchesSearch =
      item.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || item.status === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Eventos</CardTitle>
          <CardDescription>Dados armazenados via Redis Streams com busca semântica</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID do Stream</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Dados</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.id}</TableCell>
                    <TableCell>{item.timestamp.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{item.event}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{JSON.stringify(item.data)}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum evento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas do Redis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Streams Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Sensores conectados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
