"use client"

import { type ReactNode, useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface DashboardShellProps {
  children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-open")
    if (savedState !== null) {
      setIsSidebarOpen(JSON.parse(savedState))
    }
  }, [])

  const handleSidebarToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen)
    localStorage.setItem("sidebar-open", JSON.stringify(isOpen))
  }

  return (
    <div className="flex h-screen">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar onToggle={handleSidebarToggle} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => handleSidebarToggle(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-pink-50 via-white to-pink-50 transition-all duration-300 ease-in-out">
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSidebarToggle(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-bold text-primary">✨ Planner</h1>
          <div className="w-10" />
        </div>
        {children}
      </main>
    </div>
  )
}
