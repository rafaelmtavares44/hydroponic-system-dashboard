"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Save, Power, Timer, Droplets, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Estado da Bomba
  const [pumpMode, setPumpMode] = useState<"on" | "off" | "timer">("off")
  const [timerMinutes, setTimerMinutes] = useState("15")

  // Estado da Salinidade
  const [targetSalinity, setTargetSalinity] = useState("1.5")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const configData = {
      pump: {
        mode: pumpMode,
        timer_minutes: pumpMode === "timer" ? Number.parseInt(timerMinutes) : null,
      },
      salinity: {
        target: Number.parseFloat(targetSalinity),
      },
    }

    try {
      const response = await fetch("http://10.231.249.65:8080/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configData),
      })

      if (!response.ok) throw new Error("Falha ao salvar configurações")

      toast({
        title: "Configurações salvas",
        description: "As alterações foram enviadas para o sistema.",
      })
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível conectar à API.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>Controle de atuadores e parâmetros alvo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Controle da Bomba */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Power className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Bomba de Circulação</h3>
            </div>

            <RadioGroup
              value={pumpMode}
              onValueChange={(value) => setPumpMode(value as "on" | "off" | "timer")}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="on" id="pump-on" className="peer sr-only" />
                <Label
                  htmlFor="pump-on"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Power className="mb-3 h-6 w-6 text-green-500" />
                  Sempre Ligada
                </Label>
              </div>

              <div>
                <RadioGroupItem value="off" id="pump-off" className="peer sr-only" />
                <Label
                  htmlFor="pump-off"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Power className="mb-3 h-6 w-6 text-red-500" />
                  Sempre Desligada
                </Label>
              </div>

              <div>
                <RadioGroupItem value="timer" id="pump-timer" className="peer sr-only" />
                <Label
                  htmlFor="pump-timer"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Timer className="mb-3 h-6 w-6 text-blue-500" />
                  Temporizador
                </Label>
              </div>
            </RadioGroup>

            {pumpMode === "timer" && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="timer-value">Tempo de Ativação (minutos)</Label>
                <Input
                  id="timer-value"
                  type="number"
                  min="1"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(e.target.value)}
                  className="mt-2 max-w-[200px]"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  A bomba ficará ligada por este período em ciclos pré-definidos.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Controle de Salinidade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Parâmetros Alvo</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salinity-target">Salinidade Desejada (ppt)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="salinity-target"
                    type="number"
                    step="0.1"
                    min="0"
                    value={targetSalinity}
                    onChange={(e) => setTargetSalinity(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground w-12">ppt</span>
                </div>
                <p className="text-sm text-muted-foreground">O sistema alertará se a salinidade desviar deste valor.</p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
