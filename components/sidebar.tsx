"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Wallet,
  StickyNote,
  ShoppingCart,
  CheckSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Financeiro", href: "/financeiro", icon: Wallet },
  { name: "Notas", href: "/notas", icon: StickyNote },
  { name: "Lista de Compras", href: "/compras", icon: ShoppingCart },
  { name: "Rotinas", href: "/rotinas", icon: CheckSquare },
]

interface UserData {
  name: string | null
  email: string
  image: string | null
}

interface SidebarProps {
  onToggle?: (isOpen: boolean) => void
}

export function Sidebar({ onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    loadUser()
    // Carregar estado da sidebar do localStorage
    const savedState = localStorage.getItem("sidebar-open")
    if (savedState !== null) {
      setIsOpen(JSON.parse(savedState))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
    router.refresh()
  }

  const toggleSidebar = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem("sidebar-open", JSON.stringify(newState))
    onToggle?.(newState)
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

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-gradient-to-b from-pink-50 to-white transition-all duration-300 ease-in-out",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header com toggle */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className={cn(
          "transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}>
          <h1 className="text-2xl font-bold text-primary">✨ Planner</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 shrink-0"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isOpen ? "justify-start" : "justify-center",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={!isOpen ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className={cn(
                "transition-opacity duration-200",
                isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4 space-y-2">
        {user && (
          <Link 
            href="/perfil"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isOpen ? "justify-start" : "justify-center",
              pathname === "/perfil"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
            title={!isOpen ? "Ver perfil" : undefined}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.image || undefined} alt={user.name || ""} />
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "flex flex-col overflow-hidden transition-opacity duration-200",
              isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}>
              <span className="truncate font-medium text-sm">
                {user.name || "Usuário"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Ver perfil
              </span>
            </div>
          </Link>
        )}
        
        <button 
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            isOpen ? "justify-start" : "justify-center"
          )}
          title={!isOpen ? "Sair" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={cn(
            "transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
          )}>
            Sair
          </span>
        </button>
      </div>
    </div>
  )
}
