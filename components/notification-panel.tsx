"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  message: string
  type: "warning" | "error" | "info"
  timestamp: Date
}

interface NotificationPanelProps {
  notifications: Notification[]
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return AlertTriangle
      case "warning":
        return AlertTriangle
      default:
        return Info
    }
  }

  const getVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive" as const
      case "warning":
        return "default" as const
      default:
        return "default" as const
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações em Tempo Real
            </CardTitle>
            <CardDescription>Sistema Pub/Sub Redis para alertas críticos</CardDescription>
          </div>
          <Badge variant="outline">{notifications.length} ativas</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação ativa</p>
            </div>
          ) : (
            notifications
              .slice(-5)
              .reverse()
              .map((notification) => {
                const Icon = getIcon(notification.type)
                return (
                  <Alert key={notification.id} variant={getVariant(notification.type)}>
                    <Icon className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <span>{notification.message}</span>
                        <div className="text-xs opacity-70 mt-1">{notification.timestamp.toLocaleTimeString()}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )
              })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
