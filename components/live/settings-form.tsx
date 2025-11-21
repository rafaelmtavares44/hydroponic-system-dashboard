"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Save, Clock, Activity, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [cycleMinutes, setCycleMinutes] = useState("60")
  const [targetEC, setTargetEC] = useState("2.0")

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("http://10.231.249.65:8080/api/config")
        if (response.ok) {
          const data = await response.json()
          if (data) {
            // Convert seconds to minutes for display if needed
            // Assuming API sends seconds for CICLE_MINUTES based on Python code
            if (data.CICLE_MINUTES) setCycleMinutes((data.CICLE_MINUTES / 60).toString())
            if (data.eletrocondutividade_desejada) setTargetEC(data.eletrocondutividade_desejada.toString())
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
        toast({
          title: "Aviso",
          description: "Não foi possível carregar as configurações atuais.",
          variant: "destructive",
        })
      } finally {
        setIsFetching(false)
      }
    }
    fetchConfig()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const configData = {
      CICLE_MINUTES: Number.parseFloat(cycleMinutes) * 60, // Convert minutes back to seconds
      eletrocondutividade_desejada: Number.parseFloat(targetEC),
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
        description: "Os parâmetros foram enviados para o sistema.",
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
        <CardDescription>Ajuste os parâmetros de automação</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ciclo de Circulação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Ciclo de Circulação</h3>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="cycle-time">Tempo do Ciclo (minutos)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  id="cycle-time"
                  type="number"
                  min="1"
                  value={cycleMinutes}
                  onChange={(e) => setCycleMinutes(e.target.value)}
                  className="max-w-[200px]"
                  placeholder="60"
                />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                A bomba alternará seu estado (ligado/desligado) a cada ciclo completado.
              </p>
            </div>
          </div>

          <Separator />

          {/* Eletrocondutividade */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-lg">Controle de Nutrientes</h3>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="target-ec">Eletrocondutividade Alvo</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  id="target-ec"
                  type="number"
                  step="0.1"
                  value={targetEC}
                  onChange={(e) => setTargetEC(e.target.value)}
                  className="max-w-[200px]"
                  placeholder="2.0"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Valor limite para acionar a reposição de nutrientes automaticamente.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={isLoading || isFetching}>
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
