"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { FunctionReturnType } from "convex/server"
import {
  PageShell,
  PageCard,
  PageBadge,
  PageLoading,
  PageEmpty,
  PT,
  dateTimeOf,
} from "@/components/PageShell"

type AppointmentRow = FunctionReturnType<typeof api.appointments.listAll>[number]

const TYPE_LABELS: Record<AppointmentRow["type"], string> = {
  Consultation: "Consultation",
  Measurement: "Measurement",
  Fitting: "Fitting",
  Pickup: "Pickup",
  SiteVisit: "Site Visit",
}

const STATUS_LABELS: Record<AppointmentRow["status"], string> = {
  Requested: "Requested",
  Scheduled: "Scheduled",
  Confirmed: "Confirmed",
  Completed: "Completed",
  Cancelled: "Cancelled",
  NoShow: "No Show",
}

const STATUS_COLORS: Record<AppointmentRow["status"], string> = {
  Requested: "hsl(270 60% 70%)",
  Scheduled: PT.gold,
  Confirmed: PT.burgundy,
  Completed: PT.green,
  Cancelled: PT.danger,
  NoShow: PT.body,
}

const FILTERS = ["All", "Upcoming", "Today", "Past"] as const
type Filter = (typeof FILTERS)[number]

function nowMs(): number {
  return new Date().getTime()
}

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function endOfToday(): number {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export default function AppointmentsPage() {
  const appointments = useQuery(api.appointments.listAll)
  const [filter, setFilter] = useState<Filter>("All")

  const rows = useMemo(() => {
    if (!appointments) return []
    const now = nowMs()
    const dayStart = startOfToday()
    const dayEnd = endOfToday()

    const matched = appointments.filter((a) => {
      switch (filter) {
        case "Upcoming":
          return a.scheduledAt >= now
        case "Today":
          return a.scheduledAt >= dayStart && a.scheduledAt <= dayEnd
        case "Past":
          return a.scheduledAt < now
        default:
          return true
      }
    })

    // Upcoming ascending (soonest first), past descending (most recent first).
    return [...matched].sort((a, b) => {
      const aPast = a.scheduledAt < now
      const bPast = b.scheduledAt < now
      if (aPast !== bPast) return aPast ? 1 : -1
      return aPast ? b.scheduledAt - a.scheduledAt : a.scheduledAt - b.scheduledAt
    })
  }, [appointments, filter])

  return (
    <PageShell eyebrow="Scheduling" title="Appointments" count={rows.length}>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className="rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors"
              style={{
                background: active ? PT.burgundy : PT.white,
                color: active ? PT.white : PT.body,
                borderColor: active ? PT.burgundy : PT.stone,
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {appointments === undefined ? (
        <PageLoading />
      ) : rows.length === 0 ? (
        <PageEmpty
          title="No appointments"
          body={
            filter === "All"
              ? "Consultations, measurements, fittings and pickups scheduled against a commission appear here."
              : `No ${filter.toLowerCase()} appointments. Try a different filter.`
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((a) => (
            <PageCard key={a._id}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <PageBadge>{TYPE_LABELS[a.type]}</PageBadge>

                <span
                  className="font-mono text-[13px]"
                  style={{ color: PT.ink, fontVariantNumeric: "tabular-nums" }}
                >
                  {dateTimeOf(a.scheduledAt)}
                </span>

                <span className="text-[13px]" style={{ color: PT.muted }}>
                  {a.durationMinutes} min
                </span>

                {a.isHomeVisit && (
                  <PageBadge bg={PT.softIvory} fg={PT.burgundy}>
                    Home Visit
                  </PageBadge>
                )}

                <div className="flex min-w-0 flex-col">
                  <span
                    className="truncate text-[14px] font-medium"
                    style={{ color: PT.ink }}
                  >
                    {a.clientName ?? "Unknown client"}
                  </span>
                  {a.projectSlug ? (
                    <Link
                      href={`/projects/${a.projectSlug}`}
                      className="truncate text-[13px] underline-offset-2 hover:underline"
                      style={{ color: PT.burgundy }}
                    >
                      {a.projectTitle}
                    </Link>
                  ) : (
                    <span className="truncate text-[13px]" style={{ color: PT.muted }}>
                      {a.projectTitle}
                    </span>
                  )}
                </div>

                <span className="text-[13px]" style={{ color: PT.muted }}>
                  {a.staffName ?? "Unassigned"}
                </span>

                <div className="ml-auto">
                  <PageBadge bg={STATUS_COLORS[a.status]} fg={PT.white}>
                    {STATUS_LABELS[a.status]}
                  </PageBadge>
                </div>
              </div>
            </PageCard>
          ))}
        </div>
      )}
    </PageShell>
  )
}
