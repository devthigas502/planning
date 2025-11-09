"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  emailVerified: boolean
  createdAt: string
}

export default function PerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login")
          return
        }
        throw new Error("Erro ao carregar perfil")
      }
      const data = await response.json()
      setProfile(data)
      setName(data.name || "")
      setImageUrl(data.image || "")
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      setError("Erro ao carregar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          image: imageUrl.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar perfil")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setSuccess("Perfil atualizado com sucesso! ✨")
      
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      setError("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string | null
      if (result) setImageUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar perfil</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-sm md:text-base text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Atualize sua foto e dados pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24">
                <AvatarImage src={imageUrl || profile.image || undefined} alt={name} />
                <AvatarFallback className="bg-primary text-xl md:text-2xl text-primary-foreground">
                  {getInitials(name || profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Cole a URL ou faça upload da sua foto abaixo</span>
                </div>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs w-full"
                />
              </div>
            </div>

            {/* Mensagens */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* URL da Foto */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Foto</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://exemplo.com/foto.jpg ou base64"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Cole o link de uma imagem online (opcional)
              </p>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado
              </p>
            </div>

            {/* Informações adicionais */}
            <div className="space-y-2">
              <Label>Membro desde</Label>
              <div className="rounded-lg bg-muted p-3 text-sm">
                {formatDate(new Date(profile.createdAt))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
