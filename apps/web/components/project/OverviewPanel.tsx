"use client"

/**
 * Overview — the commission at a glance, plus where it sits in the lifecycle.
 * Lifecycle stages come from Business workflows.md §Standard Project Lifecycle.
 */
import React from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Doc } from "@convex/_generated/dataModel"
import type { ProjectStatus, ProjectType } from "@/lib/types"
import {
  type PanelProps,
  T,
  Card,
  SectionHeader,
  Field,
  Badge,
  fmtKES,
  fmtDate,
} from "./_kit"

const LIFECYCLE = [
  "Lead",
  "Consultation",
  "Design",
  "Quotation",
  "Deposit",
  "Measurements",
  "Production",
  "Fitting",
  "Final Payment",
  "Delivery",
  "Completed",
] as const

const TYPE_LABEL: Record<ProjectType, string> = {
  Wedding: "Wedding",
  Corporate: "Corporate",
  Individual: "Individual",
  ClosetRevamp: "Closet Revamp",
  GalaOutfit: "Gala Outfit",
  Photoshoot: "Photoshoot",
  Alteration: "Alteration",
}

interface PaymentSummary {
  quotedTotal: number
  received: number
  balance: number
  depositPaid: number
  depositRequired: number
  depositSatisfied: boolean
  hasQuotation: boolean
}

interface OverviewPanelProps extends PanelProps {
  project: Doc<"projects">
  clientName: string | null
  paymentSummary: PaymentSummary | undefined
  onStatusChange: (status: ProjectStatus) => void
}

export function OverviewPanel({
  projectId,
  project,
  clientName,
  paymentSummary,
}: OverviewPanelProps) {
  // Derive the true lifecycle position from actual records rather than guessing
  // from status alone.
  const consultation = useQuery(api.consultations.getByProject, { projectId })
  const design = useQuery(api.designs.getByProject, { projectId })
  const quotation = useQuery(api.quotations.getByProject, { projectId })
  const participants = useQuery(api.participants.listByProjectDetailed, { projectId })
  const garments = useQuery(api.production.listByProject, { projectId })

  const stageIndex = deriveStage({
    status: project.status,
    hasConsultation: !!consultation,
    consultationComplete: !!consultation?.completedAt,
    hasDesign: !!design,
    designApproved: !!design?.approvedAt,
    hasQuotation: !!quotation,
    quotationAccepted: quotation?.status === "Accepted",
    depositSatisfied: !!paymentSummary?.depositSatisfied,
    hasMeasurements: (participants ?? []).some((p) => p.latestMeasurementId !== null),
    inProduction: (garments ?? []).some((g) => g.currentStage !== null),
    allDelivered:
      (garments ?? []).length > 0 &&
      (garments ?? []).every((g) => g.status === "Delivered"),
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Facts */}
      <Card>
        <SectionHeader eyebrow="At a glance" title="Commission" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Field label="Client" value={clientName ?? "—"} />
          <Field label="Type" value={TYPE_LABEL[project.type as ProjectType]} />
          <Field label="Created" value={fmtDate(project.createdAt)} />
          <Field label="Last Updated" value={fmtDate(project.updatedAt)} />
        </div>

        {project.notes && (
          <div className="mt-6 border-t pt-5" style={{ borderColor: T.stone }}>
            <Field label="Notes" value={project.notes} />
          </div>
        )}
      </Card>

      {/* Money */}
      {paymentSummary?.hasQuotation && (
        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: T.gold }}
            >
              Financials
            </p>
            {paymentSummary.depositSatisfied ? (
              <Badge bg={T.green} fg={T.white}>
                Deposit settled
              </Badge>
            ) : (
              <Badge bg={T.amber} fg={T.white}>
                Deposit outstanding
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Field label="Quoted" value={fmtKES(paymentSummary.quotedTotal)} mono />
            <Field label="Received" value={fmtKES(paymentSummary.received)} mono />
            <Field label="Balance" value={fmtKES(paymentSummary.balance)} mono />
            <Field
              label="Deposit"
              value={`${fmtKES(paymentSummary.depositPaid)} of ${fmtKES(paymentSummary.depositRequired)}`}
              mono
            />
          </div>
        </Card>
      )}

      {/* Lifecycle */}
      <Card>
        <p
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: T.gold }}
        >
          Lifecycle
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LIFECYCLE.map((stage, i) => {
            const done = i < stageIndex
            const current = i === stageIndex
            return (
              <span
                key={stage}
                className="rounded-full px-3 py-1.5 text-[12px] font-medium"
                style={{
                  background: current ? T.burgundy : done ? T.gold : T.softIvory,
                  color: current || done ? T.white : T.muted,
                }}
              >
                {stage}
              </span>
            )
          })}
        </div>
        <p className="mt-4 text-[13px]" style={{ color: T.muted }}>
          Currently at <strong style={{ color: T.ink }}>{LIFECYCLE[stageIndex]}</strong>. Stage is
          derived from the records on this commission, not set by hand.
        </p>
      </Card>
    </div>
  )
}

/** Walk the lifecycle and return the furthest stage the records support. */
function deriveStage(s: {
  status: string
  hasConsultation: boolean
  consultationComplete: boolean
  hasDesign: boolean
  designApproved: boolean
  hasQuotation: boolean
  quotationAccepted: boolean
  depositSatisfied: boolean
  hasMeasurements: boolean
  inProduction: boolean
  allDelivered: boolean
}): number {
  if (s.status === "Completed" || s.status === "Archived") return 10
  if (s.allDelivered) return 9
  if (s.inProduction) return 6
  if (s.hasMeasurements) return 5
  if (s.depositSatisfied) return 4
  if (s.quotationAccepted || s.hasQuotation) return 3
  if (s.designApproved || s.hasDesign) return 2
  if (s.consultationComplete || s.hasConsultation) return 1
  return 0
}
