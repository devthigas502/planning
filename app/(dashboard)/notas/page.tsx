"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TipTapEditor } from "@/components/tiptap-editor"
import { Loader2, Plus, Edit, Trash2, FolderOpen, StickyNote } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Note {
  id: string
  title: string
  content: string
  folder: string | null
  createdAt: string
  updatedAt: string
}

export default function NotasPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string>("all")

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [folder, setFolder] = useState<string>("")

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error("Erro ao carregar notas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (note?: Note) => {
    if (note) {
      setEditingNote(note)
      setTitle(note.title)
      setContent(note.content)
      setFolder(note.folder || "")
    } else {
      setEditingNote(null)
      setTitle("")
      setContent("")
      setFolder("")
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingNote(null)
    setTitle("")
    setContent("")
    setFolder("")
  }

  const handleSave = async () => {
    if (!title.trim()) return

    setIsSaving(true)
    try {
      const url = editingNote ? `/api/notes/${editingNote.id}` : "/api/notes"
      const method = editingNote ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          folder: folder.trim() || null,
        }),
      })

      if (response.ok) {
        await loadNotes()
        handleCloseDialog()
      }
    } catch (error) {
      console.error("Erro ao salvar nota:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadNotes()
      }
    } catch (error) {
      console.error("Erro ao excluir nota:", error)
    }
  }

  const folders = Array.from(new Set(notes.map(n => n.folder).filter(Boolean)))
  const filteredNotes = selectedFolder === "all"
    ? notes
    : notes.filter(n => n.folder === selectedFolder)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notas</h1>
          <p className="text-sm md:text-base text-muted-foreground">Suas anotações e ideias</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota
        </Button>
      </div>

      {/* Filtro por pasta */}
      {folders.length > 0 && (
        <div className="mb-4">
          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todas as pastas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as pastas</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f} value={f!}>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    {f}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Lista de notas */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Nenhuma nota cadastrada ainda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-lg line-clamp-1">{note.title}</CardTitle>
                    {note.folder && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <FolderOpen className="h-3 w-3" />
                        {note.folder}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm line-clamp-3 text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: note.content || "Sem conteúdo" }}
                />
                <CardDescription className="mt-2 text-xs">
                  Atualizada em {formatDate(new Date(note.updatedAt))}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para criar/editar nota */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Editar Nota" : "Nova Nota"}
            </DialogTitle>
            <DialogDescription>
              {editingNote ? "Edite sua nota abaixo" : "Crie uma nova nota com formatação rica"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Título da nota"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">Pasta (opcional)</Label>
              <Input
                id="folder"
                placeholder="Ex: Trabalho, Pessoal, Estudos"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder="Comece a escrever sua nota..."
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()} className="w-full sm:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
