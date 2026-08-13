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
import { StepIndicator, type LifecycleStep } from "./StepIndicator"

type EventRow = FunctionReturnType<typeof api.timeline.listByProject>[number]

export function TimelinePanel({ projectId }: PanelProps) {
  const events = useQuery(api.timeline.listByProject, { projectId })
  const project = useQuery(api.projects.getById, { id: projectId })

  if (events === undefined || project === undefined) return <PanelLoading />

  // Derive current lifecycle step from project status and events
  const deriveLifecycleStep = (): LifecycleStep => {
    if (!project) return "Lead"

    // Check for events that indicate progression
    const eventTypes = new Set(events.map(e => e.type))

    if (eventTypes.has("Delivery")) return "Delivery"
    if (eventTypes.has("Final Payment") || eventTypes.has("Payment")) return "Final Payment"
    if (eventTypes.has("Fitting")) return "Fitting"
    if (eventTypes.has("Production")) return "Production"
    if (eventTypes.has("Measurements")) return "Measurements"
    if (eventTypes.has("Deposit")) return "Deposit"
    if (eventTypes.has("Quotation")) return "Quotation"
    if (eventTypes.has("Design")) return "Design"
    if (eventTypes.has("Consultation")) return "Consultation"

    return "Lead"
  }

  const currentStep = deriveLifecycleStep()
  const completedStepsSet = new Set<LifecycleStep>()

  const stepEvents = new Map<LifecycleStep, boolean>([
    ["Lead", true],
    ["Consultation", events.some(e => e.type === "Consultation")],
    ["Design", events.some(e => e.type === "Design")],
    ["Quotation", events.some(e => e.type === "Quotation")],
    ["Deposit", events.some(e => e.type === "Deposit")],
    ["Measurements", events.some(e => e.type === "Measurements")],
    ["Production", events.some(e => e.type === "Production")],
    ["Fitting", events.some(e => e.type === "Fitting")],
    ["Final Payment", events.some(e => e.type === "Payment" || e.type === "Final Payment")],
    ["Delivery", events.some(e => e.type === "Delivery")],
  ])

  stepEvents.forEach((exists, step) => {
    if (exists && step !== currentStep) {
      completedStepsSet.add(step)
    }
  })

  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <SectionHeader
            eyebrow="Lifecycle"
            title="Project Stages"
          />
          <div className="mb-8">
            <StepIndicator currentStep={currentStep} completedSteps={Array.from(completedStepsSet)} />
          </div>
        </Card>

        <EmptyState
          icon={Time04Icon}
          eyebrow="History"
          title="No events yet"
          body="Every significant action on this commission is recorded here automatically — consultations, payments, measurements, production stages and deliveries."
        />
      </div>
    )
  }

  // Newest first reads better in an operational context.
  const ordered = [...events].reverse()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SectionHeader
          eyebrow="Lifecycle"
          title="Project Stages"
        />
        <div className="pb-6">
          <StepIndicator currentStep={currentStep} completedSteps={Array.from(completedStepsSet)} />
        </div>
      </Card>

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
                    style={{ background: index === 0 ? T.ink : T.amber }}
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
