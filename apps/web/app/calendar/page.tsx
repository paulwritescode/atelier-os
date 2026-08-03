"use client"

import { useMemo } from "react"
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
} from "@/components/PageShell"

type AppointmentRow = FunctionReturnType<typeof api.appointments.listAll>[number]

const TYPE_LABELS: Record<AppointmentRow["type"], string> = {
  Consultation: "Consultation",
  Measurement: "Measurement",
  Fitting: "Fitting",
  Pickup: "Pickup",
  SiteVisit: "Site Visit",
}

const DAY_WINDOW = 30

function dayKey(ms: number): string {
  return new Date(ms).toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" })
}

function dayHeading(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  })
}

function timeOf(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Nairobi",
  })
}

export default function CalendarPage() {
  const appointments = useQuery(api.appointments.listAll)

  const { days, todayKey } = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const from = start.getTime()
    const to = from + DAY_WINDOW * 24 * 60 * 60 * 1000

    const grouped = new Map<string, AppointmentRow[]>()

    for (const a of appointments ?? []) {
      if (a.scheduledAt < from || a.scheduledAt >= to) continue
      const key = dayKey(a.scheduledAt)
      const bucket = grouped.get(key)
      if (bucket) bucket.push(a)
      else grouped.set(key, [a])
    }

    const ordered = [...grouped.entries()]
      .map(([key, items]) => ({
        key,
        items: [...items].sort((x, y) => x.scheduledAt - y.scheduledAt),
      }))
      .sort((x, y) => x.items[0].scheduledAt - y.items[0].scheduledAt)

    return { days: ordered, todayKey: dayKey(from) }
  }, [appointments])

  return (
    <PageShell eyebrow="Schedule" title="Calendar">
      {appointments === undefined ? (
        <PageLoading />
      ) : days.length === 0 ? (
        <PageEmpty
          title="Nothing scheduled"
          body="Scheduled consultations, fittings and pickups appear here as they are booked against a commission."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {days.map((day) => {
            const isToday = day.key === todayKey
            const first = day.items[0]

            return (
              <section key={day.key}>
                <div
                  className="mb-3 flex items-baseline gap-3 border-b pb-2"
                  style={{ borderColor: PT.stone }}
                >
                  <h2
                    className="font-heading text-[16px] font-semibold"
                    style={{ color: PT.ink }}
                  >
                    {dayHeading(first.scheduledAt)}
                  </h2>
                  {isToday && (
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.08em]"
                      style={{ color: PT.burgundy }}
                    >
                      Today
                    </span>
                  )}
                  <span
                    className="ml-auto font-mono text-[12px]"
                    style={{ color: PT.muted }}
                  >
                    {day.items.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {day.items.map((a) => (
                    <PageCard key={a._id}>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span
                          className="font-mono text-[14px] font-medium"
                          style={{ color: PT.ink, fontVariantNumeric: "tabular-nums" }}
                        >
                          {timeOf(a.scheduledAt)}
                        </span>
                        <PageBadge>{TYPE_LABELS[a.type]}</PageBadge>
                        <span className="text-[14px]" style={{ color: PT.ink }}>
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
                          <span
                            className="truncate text-[13px]"
                            style={{ color: PT.muted }}
                          >
                            {a.projectTitle}
                          </span>
                        )}
                      </div>
                    </PageCard>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
