"use client"

/**
 * Timeline — the permanent, chronological history of a commission.
 *
 * ADR-010: the timeline is APPEND-ONLY. No add, edit or delete controls.
 * Events are written by mutations, never by hand.
 *
 * Displayed as collapsible groups (like CloudFormation stack events):
 * - Events are grouped by category/parent type
 * - Each group is collapsible
 * - Individual events show timestamp, type, and summary
 */
import React, { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Time04Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import type { FunctionReturnType } from "convex/server"
import { type PanelProps, T, SectionHeader, PanelLoading, EmptyState, fmtDateTime } from "./_kit"
import { cn } from "@/lib/utils"

type EventRow = FunctionReturnType<typeof api.timeline.listByProject>[number]

/** Map event types to their parent category */
function getEventCategory(type: string): string {
  if (type.includes("Appointment")) return "Appointments"
  if (type.includes("Payment") || type.includes("Deposit")) return "Payments"
  if (type.includes("Consultation")) return "Consultation"
  if (type.includes("Design")) return "Design"
  if (type.includes("Quotation")) return "Quotation"
  if (type.includes("Production") || type.includes("Garment")) return "Production"
  if (type.includes("Measurement")) return "Measurements"
  if (type.includes("Fitting")) return "Fittings"
  if (type.includes("Delivery")) return "Delivery"
  if (type.includes("Lifecycle")) return "Lifecycle"
  if (type.includes("Status")) return "Status Changes"
  if (type.includes("Share")) return "Sharing"
  if (type.includes("Project")) return "Project"
  return "Other"
}

/** Status indicator color per category */
function getCategoryColor(category: string): string {
  switch (category) {
    case "Project": return "hsl(220 30% 40%)"
    case "Consultation": return "hsl(270 60% 60%)"
    case "Design": return "hsl(160 70% 40%)"
    case "Quotation": return "hsl(45 93% 45%)"
    case "Payments": return "hsl(140 71% 40%)"
    case "Measurements": return "hsl(200 60% 50%)"
    case "Production": return "hsl(30 80% 50%)"
    case "Fittings": return "hsl(330 60% 55%)"
    case "Delivery": return "hsl(140 71% 35%)"
    case "Appointments": return "hsl(270 50% 55%)"
    case "Lifecycle": return "hsl(45 80% 50%)"
    case "Status Changes": return T.muted
    default: return T.body
  }
}

interface EventGroup {
  category: string
  events: EventRow[]
  latestAt: number
}

function groupEvents(events: EventRow[]): EventGroup[] {
  const groups = new Map<string, EventRow[]>()

  for (const event of events) {
    const category = getEventCategory(event.type)
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category)!.push(event)
  }

  // Sort groups by latest event (most recent first)
  return Array.from(groups.entries())
    .map(([category, events]) => ({
      category,
      events: events.sort((a, b) => b.createdAt - a.createdAt),
      latestAt: Math.max(...events.map((e) => e.createdAt)),
    }))
    .sort((a, b) => b.latestAt - a.latestAt)
}

function CollapsibleGroup({ group }: { group: EventGroup }) {
  const [expanded, setExpanded] = useState(false)
  const color = getCategoryColor(group.category)
  const count = group.events.length

  return (
    <div className="border-b border-border/50 last:border-0">
      {/* Group header — clickable to expand/collapse */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        {/* Category indicator */}
        <div
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: color }}
        />

        {/* Category name + count */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-foreground">
              {group.category}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {count}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
            Latest: {fmtDateTime(group.latestAt)}
          </p>
        </div>

        {/* Expand/collapse chevron */}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Children events — collapsible */}
      {expanded && (
        <div className="border-t border-border/30 bg-muted/20">
          {group.events.map((event, idx) => (
            <div
              key={event._id}
              className={cn(
                "flex items-start gap-3 px-4 py-2.5",
                idx !== group.events.length - 1 && "border-b border-border/20"
              )}
            >
              {/* Connector dot */}
              <div className="mt-1.5 flex flex-col items-center">
                <div
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: color, opacity: 0.6 }}
                />
              </div>

              {/* Event content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[13px] font-medium text-foreground">
                    {event.type}
                  </p>
                  <p
                    className="shrink-0 font-mono text-[11px]"
                    style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmtDateTime(event.createdAt)}
                  </p>
                </div>
                <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground">
                  {event.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TimelinePanel({ projectId }: PanelProps) {
  const events = useQuery(api.timeline.listByProject, { projectId })

  if (events === undefined) return <PanelLoading />

  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <SectionHeader
          eyebrow="History"
          title="Timeline"
        />
        <EmptyState
          icon={Time04Icon}
          eyebrow="History"
          title="No events yet"
          body="Every significant action on this commission is recorded here automatically — consultations, payments, measurements, production stages and deliveries."
        />
      </div>
    )
  }

  const groups = groupEvents(events)
  const totalCount = events.length

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="History"
        title={`${totalCount} event${totalCount === 1 ? "" : "s"}`}
      />

      {/* Grouped, collapsible event list */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        {groups.map((group) => (
          <CollapsibleGroup key={group.category} group={group} />
        ))}
      </div>

      <p className="text-center text-[11px] text-muted-foreground">
        Events are recorded automatically and cannot be edited.
      </p>
    </div>
  )
}
