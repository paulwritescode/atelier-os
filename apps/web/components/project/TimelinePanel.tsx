"use client"

/**
 * Timeline — the permanent, chronological history of a commission.
 *
 * ADR-010: the timeline is APPEND-ONLY. There is deliberately no add, edit or
 * delete control here. Entries are written by the mutations that change project
 * state, never by hand.
 */
import React from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { Time04Icon } from "@hugeicons/core-free-icons"
import type { FunctionReturnType } from "convex/server"
import { type PanelProps, T, Card, SectionHeader, PanelLoading, EmptyState, fmtDateTime } from "./_kit"

type EventRow = FunctionReturnType<typeof api.timeline.listByProject>[number]

export function TimelinePanel({ projectId }: PanelProps) {
  const events = useQuery(api.timeline.listByProject, { projectId })

  if (events === undefined) return <PanelLoading />

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Time04Icon}
        eyebrow="History"
        title="No events yet"
        body="Every significant action on this commission is recorded here automatically — consultations, payments, measurements, production stages and deliveries."
      />
    )
  }

  // Newest first reads better in an operational context.
  const ordered = [...events].reverse()

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="History"
        title={`${events.length} event${events.length === 1 ? "" : "s"}`}
      />

      <Card>
        <div className="flex flex-col">
          {ordered.map((event: EventRow, index: number) => {
            const isLast = index === ordered.length - 1
            return (
              <div key={event._id} className="flex gap-4">
                {/* Rail */}
                <div className="flex flex-col items-center pt-1.5">
                  <div
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: index === 0 ? T.burgundy : T.gold }}
                  />
                  {!isLast && (
                    <div className="mt-1 w-px flex-1" style={{ background: T.stone }} />
                  )}
                </div>

                {/* Entry */}
                <div className={isLast ? "pb-0" : "pb-7"}>
                  <p className="text-[15px] font-medium" style={{ color: T.ink }}>
                    {event.type}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-[22px]" style={{ color: T.body }}>
                    {event.summary}
                  </p>
                  <p
                    className="mt-1.5 font-mono text-[12px]"
                    style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmtDateTime(event.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <p className="text-center text-[12px]" style={{ color: T.muted }}>
        The timeline is permanent and cannot be edited.
      </p>
    </div>
  )
}
