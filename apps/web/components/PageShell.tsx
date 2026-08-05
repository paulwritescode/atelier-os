"use client"

/**
 * Standard shell for the operational pages (Calendar, Production, Payments,
 * Appointments, Documents). Keeps the sidebar, header and canvas consistent.
 */
import React from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export const PT = {
  ink: "hsl(0 0% 9%)",
  muted: "hsl(0 0% 45%)",
  body: "hsl(0 0% 34%)",
  gold: "hsl(45 93% 58%)",
  burgundy: "hsl(345 60% 28%)",
  stone: "hsl(0 0% 90%)",
  white: "#FFFFFF",
  ivory: "hsl(0 0% 100%)",
  softIvory: "hsl(0 0% 96%)",
  green: "hsl(140 38% 30%)",
  amber: "hsl(38 62% 45%)",
  danger: "hsl(0 84% 60%)",
  cardShadow: "0 2px 8px rgba(20,20,19,.06)",
} as const

export function PageShell({
  eyebrow,
  title,
  count,
  actions,
  children,
}: {
  eyebrow?: string
  title: string
  count?: number
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col m-2 ml-0 border border-border/70 rounded-2xl bg-card overflow-hidden">
          <header className="sticky top-0 z-[200] flex h-[72px] shrink-0 items-center gap-4 border-b border-border bg-background px-10">
            <SidebarTrigger className="text-foreground" />
            <span className="font-heading text-[18px] font-semibold leading-none tracking-tight text-foreground">
              {title}
            </span>
            {count !== undefined && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[12px] text-muted-foreground">
                {count}
              </span>
            )}
            <div className="ml-auto flex items-center gap-3">{actions}</div>
          </header>

          <main className="flex-1 overflow-y-auto px-10 py-8">
            <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
              {eyebrow && (
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-gold">
                  {eyebrow}
                </p>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export function PageCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xs border border-border bg-card p-6 ${className}`}
      style={{ boxShadow: PT.cardShadow }}
    >
      {children}
    </div>
  )
}

export function PageBadge({
  children,
  bg = PT.softIvory,
  fg = PT.body,
}: {
  children: React.ReactNode
  bg?: string
  fg?: string
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-medium"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  )
}

export function PageLoading() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xs border border-border bg-muted"
        />
      ))}
    </div>
  )
}

export function PageEmpty({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <PageCard className="flex flex-col items-center py-16 text-center">
      <h3 className="font-heading mb-2 text-[22px] font-semibold text-foreground">
        {title}
      </h3>
      <p className="mb-6 max-w-[420px] text-[14px] leading-[22px] text-muted-foreground">
        {body}
      </p>
      {action}
    </PageCard>
  )
}

/** Format integer minor units as KES. */
export function money(minorUnits: number): string {
  return `KES ${(minorUnits / 100).toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function dateOf(ms: number | null | undefined): string {
  if (!ms) return "—"
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  })
}

export function dateTimeOf(ms: number | null | undefined): string {
  if (!ms) return "—"
  return new Date(ms).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  })
}
