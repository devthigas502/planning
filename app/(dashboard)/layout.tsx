import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>
}
