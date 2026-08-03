"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Share01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { useAuth } from "@/components/AuthProvider"
import type { Doc, Id } from "@convex/_generated/dataModel"
import type { ProjectStatus, ProjectType } from "@/lib/types"

import { OverviewPanel } from "@/components/project/OverviewPanel"
import { ConsultationPanel } from "@/components/project/ConsultationPanel"
import { DesignPanel } from "@/components/project/DesignPanel"
import { ParticipantList } from "@/components/project/ParticipantList"
import { MeasurementPanel } from "@/components/project/MeasurementPanel"
import { QuotationPanel } from "@/components/project/QuotationPanel"
import { PaymentList } from "@/components/project/PaymentList"
import { ProductionPanel } from "@/components/project/ProductionPanel"
import { AppointmentList } from "@/components/project/AppointmentList"
import { TimelinePanel } from "@/components/project/TimelinePanel"
import { StoryPanel } from "@/components/project/StoryPanel"
import { DocumentPanel } from "@/components/project/DocumentPanel"
import { ShareModal } from "@/components/ShareModal"

type TabId =
  | "overview"
  | "consultation"
  | "design"
  | "participants"
  | "measurements"
  | "quotation"
  | "payments"
  | "production"
  | "appointments"
  | "timeline"
  | "stories"
  | "documents"

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "consultation", label: "Consultation" },
  { id: "design", label: "Design" },
  { id: "participants", label: "Participants" },
  { id: "measurements", label: "Measurements" },
  { id: "quotation", label: "Quotation" },
  { id: "payments", label: "Payments" },
  { id: "production", label: "Production" },
  { id: "appointments", label: "Appointments" },
  { id: "timeline", label: "Timeline" },
  { id: "stories", label: "Stories" },
  { id: "documents", label: "Documents" },
]

const STATUS_BG: Record<ProjectStatus, string> = {
  Active: "#4B1E2A",
  Draft: "#C8A46B",
  Completed: "#2E6B4E",
  OnHold: "#5C5852",
  Archived: "#E7E2DB",
}
const STATUS_FG: Record<ProjectStatus, string> = {
  Active: "#FFFFFF",
  Draft: "#FFFFFF",
  Completed: "#FFFFFF",
  OnHold: "#FFFFFF",
  Archived: "#1B1A17",
}
const STATUS_LABEL: Record<ProjectStatus, string> = {
  Draft: "Draft",
  Active: "Active",
  OnHold: "On Hold",
  Completed: "Completed",
  Archived: "Archived",
}
const TYPE_LABEL: Record<ProjectType, string> = {
  Wedding: "Wedding",
  Corporate: "Corporate",
  Individual: "Individual",
  ClosetRevamp: "Closet Revamp",
  GalaOutfit: "Gala Outfit",
  Photoshoot: "Photoshoot",
  Alteration: "Alteration",
}

interface ProjectEditorProps {
  project: Doc<"projects">
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>("overview")
  const [shareOpen, setShareOpen] = useState(false)

  const projectId = project._id
  const staffId = user?.id as Id<"staff"> | undefined

  // Shared queries used by the header and several panels
  const client = useQuery(api.clients.getById, { id: project.primaryClientId })
  const paymentSummary = useQuery(api.payments.summaryByProject, { projectId })

  const updateProject = useMutation(api.projects.update)
  const archiveProject = useMutation(api.projects.archive)
  const softDeleteProject = useMutation(api.projects.softDelete)

  // Completed/Archived projects are read-only except for admin actions
  const isLocked = project.status === "Completed" || project.status === "Archived"

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!staffId) return
    try {
      await updateProject({ id: projectId, status, updatedBy: staffId })
      toast.success(`Status changed to ${STATUS_LABEL[status]}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status")
    }
  }

  const handleArchive = async () => {
    if (!staffId) return
    if (
      !window.confirm(
        `Archive "${project.title}"? It becomes read-only. You can reopen it by changing the status.`
      )
    )
      return
    try {
      await archiveProject({ id: projectId, archivedBy: staffId })
      toast.success("Commission archived.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not archive.")
    }
  }

  const handleDelete = async () => {
    if (!staffId) return
    if (
      !window.confirm(
        `Remove "${project.title}" from the commission list?\n\nThis is a soft delete — the record and its full history are retained and can be restored by an administrator.`
      )
    )
      return
    try {
      await softDeleteProject({ id: projectId, deletedBy: staffId })
      toast.success("Commission removed from the list.")
      router.push("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove.")
    }
  }

  const panelProps = { projectId, staffId, isLocked }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#F6F2EC" }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-[200] shrink-0 border-b px-10 pt-5"
        style={{ background: "#F6F2EC", borderColor: "#E7E2DB" }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
          {/* Back + actions */}
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <button
                onClick={() => router.push("/")}
                className="mb-2 flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
                style={{ color: "#8C857D" }}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                Commissions
              </button>

              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: "#C8A46B" }}
              >
                {TYPE_LABEL[project.type]}
                {client ? ` · ${client.name}` : ""}
              </p>

              <div className="flex items-center gap-3">
                <h1
                  className="font-heading truncate text-[36px] font-semibold leading-tight"
                  style={{ color: "#1B1A17" }}
                >
                  {project.title}
                </h1>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-[12px] font-medium"
                  style={{
                    background: STATUS_BG[project.status],
                    color: STATUS_FG[project.status],
                  }}
                >
                  {STATUS_LABEL[project.status]}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 pt-1">
              {/* Balance at a glance */}
              {paymentSummary?.hasQuotation && (
                <div className="text-right">
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: "#8C857D" }}
                  >
                    Balance
                  </p>
                  <p
                    className="font-mono text-[18px] font-semibold"
                    style={{ color: "#1B1A17", fontVariantNumeric: "tabular-nums" }}
                  >
                    KES {(paymentSummary.balance / 100).toLocaleString()}
                  </p>
                </div>
              )}

              <button
                onClick={() => setShareOpen(true)}
                className="flex h-[44px] items-center gap-2 rounded-full border px-5 text-[14px] font-medium transition-colors hover:bg-[#F3EFEA]"
                style={{ borderColor: "#D9D2C7", color: "#1B1A17" }}
              >
                <HugeiconsIcon icon={Share01Icon} className="size-4" />
                Share
              </button>

              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                className="h-[44px] rounded-full border px-4 text-[14px] font-medium outline-none"
                style={{ background: "#FFFFFF", borderColor: "#E7E2DB", color: "#1B1A17" }}
              >
                {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Tab strip — scrollable on narrow viewports ─────────────── */}
          <div className="flex items-end justify-between gap-4">
            <nav
              className="-mb-px flex gap-1 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {TABS.map((tab) => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="shrink-0 whitespace-nowrap px-4 pb-3 pt-2 text-[14px] font-medium transition-colors"
                    style={{
                      color: active ? "#4B1E2A" : "#8C857D",
                      borderBottom: active ? "2px solid #4B1E2A" : "2px solid transparent",
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            {/* Administrative actions — available even when locked */}
            <div className="mb-2 flex shrink-0 gap-2">
              {project.status !== "Archived" && (
                <button
                  onClick={handleArchive}
                  className="h-8 rounded-full border px-3 text-[12px] font-medium transition-colors hover:bg-[#F3EFEA]"
                  style={{ borderColor: "#D9D2C7", color: "#5C5852" }}
                >
                  Archive
                </button>
              )}
              <button
                onClick={handleDelete}
                className="h-8 rounded-full border px-3 text-[12px] font-medium transition-colors hover:bg-[#FDF2F2]"
                style={{ borderColor: "#D9D2C7", color: "#8C2F2F" }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Panel body ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
          {isLocked && (
            <div
              className="mb-6 rounded-xl px-4 py-3 text-[13px]"
              style={{ background: "#F3EFEA", color: "#5C5852" }}
            >
              This commission is {STATUS_LABEL[project.status].toLowerCase()} and is
              read-only. Reopen it by changing the status above.
            </div>
          )}

          {activeTab === "overview" && (
            <OverviewPanel
              project={project}
              clientName={client?.name ?? null}
              paymentSummary={paymentSummary}
              onStatusChange={handleStatusChange}
              {...panelProps}
            />
          )}
          {activeTab === "consultation" && <ConsultationPanel {...panelProps} />}
          {activeTab === "design" && <DesignPanel {...panelProps} />}
          {activeTab === "participants" && <ParticipantList {...panelProps} />}
          {activeTab === "measurements" && <MeasurementPanel {...panelProps} />}
          {activeTab === "quotation" && <QuotationPanel {...panelProps} />}
          {activeTab === "payments" && <PaymentList {...panelProps} />}
          {activeTab === "production" && <ProductionPanel {...panelProps} />}
          {activeTab === "appointments" && <AppointmentList {...panelProps} />}
          {activeTab === "timeline" && <TimelinePanel {...panelProps} />}
          {activeTab === "stories" && <StoryPanel {...panelProps} />}
          {activeTab === "documents" && (
            <DocumentPanel project={project} clientName={client?.name ?? null} {...panelProps} />
          )}
        </div>
      </main>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        project={project}
        staffId={staffId}
      />
    </div>
  )
}
