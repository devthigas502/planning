"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Transaction {
  id: string
  type: "receita" | "despesa"
  title: string
  amount: number
  date: string
  category: string
  account: string | null
  observations: string | null
  recurrence: string | null
}

interface Summary {
  receitas: number
  despesas: number
  saldo: number
  porCategoria: Array<{
    category: string
    receitas: number
    despesas: number
  }>
  totalTransacoes: number
}

const categorias = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Salário",
  "Investimentos",
  "Outros"
]

const COLORS = ['#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843', '#fda4af', '#fb7185', '#f43f5e']

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString())
  const [filterType, setFilterType] = useState<"todas" | "receita" | "despesa">("todas")

  // Form
  const [formData, setFormData] = useState({
    type: "despesa" as "receita" | "despesa",
    title: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category: "",
    account: "",
    observations: "",
    recurrence: "nao-recorrente"
  })

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        month: selectedMonth,
        year: selectedYear,
      })
      
      if (filterType !== "todas") {
        params.append("type", filterType)
      }

      const response = await fetch(`/api/transactions?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error)
    } finally {
      setLoading(false)
    }
  }, [filterType, selectedMonth, selectedYear])

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch(`/api/transactions/summary?month=${selectedMonth}&year=${selectedYear}`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error("Erro ao buscar resumo:", error)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchTransactions()
    fetchSummary()
  }, [fetchSummary, fetchTransactions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = isEditMode && editingId 
        ? `/api/transactions/${editingId}`
        : "/api/transactions"
      
      const method = isEditMode ? "PATCH" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          recurrence: formData.recurrence === "nao-recorrente" ? null : formData.recurrence,
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchTransactions()
        fetchSummary()
      }
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      title: transaction.title,
      amount: transaction.amount.toString(),
      date: format(new Date(transaction.date), "yyyy-MM-dd"),
      category: transaction.category,
      account: transaction.account || "",
      observations: transaction.observations || "",
      recurrence: transaction.recurrence || "nao-recorrente",
    })
    setEditingId(transaction.id)
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTransactions()
        fetchSummary()
      }
    } catch (error) {
      console.error("Erro ao excluir transação:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      type: "despesa",
      title: "",
      amount: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category: "",
      account: "",
      observations: "",
      recurrence: "nao-recorrente"
    })
    setIsEditMode(false)
    setEditingId(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Preparar dados para o gráfico de barras
  const chartData = summary?.porCategoria.map(cat => ({
    name: cat.category,
    Receitas: cat.receitas,
    Despesas: cat.despesas,
  })) || []

  // Preparar dados para o gráfico de pizza (apenas despesas por categoria)
  const pieData = summary?.porCategoria
    .filter(cat => cat.despesas > 0)
    .map(cat => ({
      name: cat.category,
      value: cat.despesas,
    })) || []

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Controle Financeiro</h1>
        <Button
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
          className="gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1">
              <Label>Mês</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Janeiro</SelectItem>
                  <SelectItem value="2">Fevereiro</SelectItem>
                  <SelectItem value="3">Março</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Maio</SelectItem>
                  <SelectItem value="6">Junho</SelectItem>
                  <SelectItem value="7">Julho</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Tipo</Label>
              <Select
                value={filterType}
                onValueChange={(value) =>
                  setFilterType(value as "todas" | "receita" | "despesa")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {formatCurrency(summary.receitas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {formatCurrency(summary.despesas)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl md:text-2xl font-bold ${summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.saldo)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      {summary && chartData.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Receitas vs Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Receitas" fill="#10b981" />
                  <Bar dataKey="Despesas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {pieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      style={{ fontSize: '11px' }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Lista de transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada para o período selecionado.
              </p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{transaction.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        transaction.type === "receita" 
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {transaction.type === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 break-words">
                      <span>{transaction.category}</span>
                      {transaction.account && <span> • {transaction.account}</span>}
                      <span className="block sm:inline"> • {format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    </div>
                    {transaction.observations && (
                      <p className="text-sm text-muted-foreground mt-1 break-words">{transaction.observations}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className={`text-lg md:text-xl font-bold ${
                      transaction.type === "receita" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "receita" ? "+" : "-"}{formatCurrency(transaction.amount)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de criar/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: value as "receita" | "despesa",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Ex: Salário, Mercado, etc."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <Label>Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Conta/Banco</Label>
              <Input
                value={formData.account}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, account: e.target.value }))
                }
                placeholder="Ex: Nubank, Itaú, etc."
              />
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={formData.observations}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    observations: e.target.value,
                  }))
                }
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            <div>
              <Label>Recorrência</Label>
              <Select
                value={formData.recurrence || "nao-recorrente"}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    recurrence: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Não recorrente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao-recorrente">Não recorrente</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {isEditMode ? "Salvar Alterações" : "Criar Transação"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
