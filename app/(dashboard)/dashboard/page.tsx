"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserData {
  name: string | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error)
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {user?.name ? `Bem-vinda de volta, ${user.name.split(" ")[0]}! ✨` : "Bem-vinda de volta! ✨"}
        </p>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Calendar />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Tarefas de Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nenhuma tarefa para hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Receitas:</span>
                  <span className="font-semibold text-green-600">R$ 0,00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Despesas:</span>
                  <span className="font-semibold text-red-600">R$ 0,00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
