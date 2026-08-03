"use client"

/**
 * Standard shell for the operational pages (Calendar, Production, Payments,
 * Appointments, Documents). Keeps the sidebar, header and canvas consistent.
 */
import React from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export const PT = {
  ink: "#1B1A17",
  muted: "#8C857D",
  body: "#5C5852",
  gold: "#C8A46B",
  burgundy: "#4B1E2A",
  stone: "#E7E2DB",
  white: "#FFFFFF",
  ivory: "#F6F2EC",
  softIvory: "#F3EFEA",
  green: "#2E6B4E",
  amber: "#B8862B",
  danger: "#8C2F2F",
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
      <div className="flex min-h-screen w-full" style={{ background: PT.ivory }}>
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="sticky top-0 z-[200] flex h-[72px] shrink-0 items-center gap-4 border-b px-10"
            style={{ background: PT.ivory, borderColor: PT.stone }}
          >
            <SidebarTrigger style={{ color: PT.ink }} />
            <span
              className="font-heading text-[18px] font-semibold leading-none tracking-tight"
              style={{ color: PT.ink }}
            >
              {title}
            </span>
            {count !== undefined && (
              <span
                className="rounded-full px-2.5 py-0.5 font-mono text-[12px]"
                style={{ background: PT.softIvory, color: PT.muted }}
              >
                {count}
              </span>
            )}
            <div className="ml-auto flex items-center gap-3">{actions}</div>
          </header>

          <main className="flex-1 overflow-y-auto px-10 py-8">
            <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
              {eyebrow && (
                <p
                  className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: PT.gold }}
                >
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
      className={`rounded-3xl border p-6 ${className}`}
      style={{ background: PT.white, borderColor: PT.stone, boxShadow: PT.cardShadow }}
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
          className="h-20 animate-pulse rounded-3xl border"
          style={{ background: PT.softIvory, borderColor: PT.stone }}
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
      <h3 className="font-heading mb-2 text-[22px] font-semibold" style={{ color: PT.ink }}>
        {title}
      </h3>
      <p className="mb-6 max-w-[420px] text-[14px] leading-[22px]" style={{ color: PT.muted }}>
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
