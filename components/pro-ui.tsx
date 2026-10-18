"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("text-gradient", className)}>{children}</span>
}

export function SectionHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: ReactNode; className?: string }) {
  return <div className={cn("mb-5 flex items-end justify-between gap-4", className)}><div><h2 className="text-xl font-black tracking-tight">{title}</h2>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>{action}</div>
}

export function StatCard({ label, value, hint, className }: { label: string; value: string | number; hint?: string; className?: string }) {
  return <div className={cn("card-pro p-5", className)}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-black tracking-tight">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return <div className="card-pro flex flex-col items-center justify-center px-6 py-14 text-center">{icon && <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">{icon}</div>}<h3 className="text-lg font-bold">{title}</h3>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>
}
