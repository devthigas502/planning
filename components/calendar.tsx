"use client"

import { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import ptBrLocale from "@fullcalendar/core/locales/pt-br"
import { EventClickArg } from "@fullcalendar/core"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Edit, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Task {
  id: string
  title: string
  description?: string | null
  date: string
  startTime?: string | null
  endTime?: string | null
  category?: string | null
  completed: boolean
}

interface Holiday {
  id: string
  title: string
  date: string
  type: string
  description?: string | null
}

export function Calendar() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDayViewDialogOpen, setIsDayViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksRes, holidaysRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/holidays"),
      ])

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData)
      }

      if (holidaysRes.ok) {
        const holidaysData = await holidaysRes.json()
        setHolidays(holidaysData)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }

  const handleDateClick = (arg: { dateStr: string }) => {
    // Corrigir o bug: usar a data local sem conversão UTC
    const clickedDate = arg.dateStr
    setSelectedDate(clickedDate)
    
    // Verificar se há eventos nesta data
    const dayTasks = tasks.filter(task => task.date.startsWith(clickedDate))
    const dayHolidays = holidays.filter(holiday => holiday.date.startsWith(clickedDate))
    
    if (dayTasks.length > 0 || dayHolidays.length > 0) {
      setIsDayViewDialogOpen(true)
    } else {
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        category: "",
      })
      setIsCreateDialogOpen(true)
    }
  }

  const handleEventClick = (info: EventClickArg) => {
    if (info.event.extendedProps.type === "task") {
      const task = tasks.find(t => t.id === info.event.id)
      if (task) {
        setSelectedDate(task.date.split("T")[0])
        setIsDayViewDialogOpen(true)
      }
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
        }),
      })

      if (response.ok) {
        await loadData()
        setIsCreateDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          category: "",
        })
      } else {
        alert("Erro ao criar tarefa")
      }
    } catch (error) {
      console.error("Erro ao criar tarefa:", error)
      alert("Erro ao criar tarefa")
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || "",
      startTime: task.startTime || "",
      endTime: task.endTime || "",
      category: task.category || "",
    })
    setIsDayViewDialogOpen(false)
    setIsEditDialogOpen(true)
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          date: selectedDate,
        }),
      })

      if (response.ok) {
        await loadData()
        setIsEditDialogOpen(false)
        setEditingTask(null)
        setFormData({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          category: "",
        })
      } else {
        alert("Erro ao atualizar tarefa")
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      alert("Erro ao atualizar tarefa")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadData()
      } else {
        alert("Erro ao excluir tarefa")
      }
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
      alert("Erro ao excluir tarefa")
    }
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
    }
  }

  const getDayEvents = () => {
    const dayTasks = tasks.filter(task => task.date.startsWith(selectedDate))
    const dayHolidays = holidays.filter(holiday => holiday.date.startsWith(selectedDate))
    return { dayTasks, dayHolidays }
  }

  const formatDateDisplay = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    } catch {
      return dateStr
    }
  }

  const events = [
    ...tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.date,
      backgroundColor: task.completed ? "#86efac" : "#fda4af",
      borderColor: task.completed ? "#22c55e" : "#f43f5e",
      extendedProps: {
        type: "task",
      },
    })),
    ...holidays.map((holiday) => ({
      id: holiday.id,
      title: `🎉 ${holiday.title}`,
      start: holiday.date,
      backgroundColor: "#fcd34d",
      borderColor: "#f59e0b",
      extendedProps: {
        type: "holiday",
      },
    })),
  ]

  const { dayTasks, dayHolidays } = getDayEvents()

  return (
    <>
      <div className="rounded-lg border bg-card p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          buttonText={{
            today: "Hoje",
          }}
        />
      </div>

      {/* Dialog: Visualização do Dia */}
      <Dialog open={isDayViewDialogOpen} onOpenChange={setIsDayViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Eventos de {selectedDate && formatDateDisplay(selectedDate)}
            </DialogTitle>
            <DialogDescription>
              {dayTasks.length} tarefa(s) e {dayHolidays.length} feriado(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Feriados */}
            {dayHolidays.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Feriados</h3>
                {dayHolidays.map((holiday) => (
                  <Card key={holiday.id} className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        🎉 {holiday.title}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({holiday.type})
                        </span>
                      </CardTitle>
                    </CardHeader>
                    {holiday.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{holiday.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Tarefas */}
            {dayTasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Tarefas</h3>
                {dayTasks.map((task) => (
                  <Card key={task.id} className={task.completed ? "border-green-200 bg-green-50" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleToggleComplete(task)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <CardTitle className={`text-base ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </CardTitle>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                            {(task.startTime || task.endTime) && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {task.startTime && <span>{task.startTime}</span>}
                                {task.startTime && task.endTime && <span>-</span>}
                                {task.endTime && <span>{task.endTime}</span>}
                              </div>
                            )}
                            {task.category && (
                              <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                {task.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {dayTasks.length === 0 && dayHolidays.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum evento neste dia
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDayViewDialogOpen(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                setIsDayViewDialogOpen(false)
                setFormData({
                  title: "",
                  description: "",
                  startTime: "",
                  endTime: "",
                  category: "",
                })
                setIsCreateDialogOpen(true)
              }}
            >
              + Nova Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Criar Tarefa */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
            <DialogDescription>
              {selectedDate && formatDateDisplay(selectedDate)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Hora Fim</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Ex: Trabalho, Pessoal, Estudo"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Tarefa</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Tarefa */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              {selectedDate && formatDateDisplay(selectedDate)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startTime">Hora Início</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-endTime">Hora Fim</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Ex: Trabalho, Pessoal, Estudo"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
