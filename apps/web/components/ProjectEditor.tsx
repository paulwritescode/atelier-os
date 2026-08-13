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
import type { ProjectTabId } from "@/components/ProjectSidebar"

import { ProjectHeader } from "@/components/ProjectHeader"
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

// ── Status / type presentation ────────────────────────────────────────────────
const STATUS_BG: Record<ProjectStatus, string> = {
  Active: "hsl(345 60% 28%)",
  Draft: "hsl(45 93% 58%)",
  Completed: "#2E6B4E",
  OnHold: "hsl(0 0% 46%)",
  Archived: "hsl(0 0% 91%)",
}
const STATUS_FG: Record<ProjectStatus, string> = {
  Active: "#FFFFFF",
  Draft: "hsl(0 0% 9%)",
  Completed: "#FFFFFF",
  OnHold: "#FFFFFF",
  Archived: "hsl(0 0% 9%)",
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
  activeTab: ProjectTabId
}

export function ProjectEditor({ project, activeTab }: ProjectEditorProps) {
  const router = useRouter()
  const { user } = useAuth()
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

  const panelProps = { projectId, staffId, isLocked, handleArchive, handleDelete }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ProjectHeader
        project={project}
        clientName={client?.name ?? null}
        balance={paymentSummary?.balance ?? 0}
        hasQuotation={paymentSummary?.hasQuotation ?? false}
        onStatusChange={handleStatusChange}
        onShare={() => setShareOpen(true)}
      />

      {/* ── Panel body ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-background px-8 py-8">
        <div className="mx-auto w-full max-w-5xl">
          {isLocked && (
            <div className="mb-6 rounded-xl bg-muted px-4 py-3 text-[13px] text-muted-foreground">
              This commission is {STATUS_LABEL[project.status].toLowerCase()} and is
              read-only. Reopen it by changing the status above.
            </div>
          )}

          {/* ── Tab: Commission (Overview + Consultation + Design) ──── */}
          {activeTab === "commission" && (
            <div className="space-y-6">
              <OverviewPanel
                project={project}
                clientName={client?.name ?? null}
                paymentSummary={paymentSummary}
                onStatusChange={handleStatusChange}
                {...panelProps}
              />

              {/* Consultation & Design */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-[16px] font-semibold text-foreground">
                    Consultation
                  </h3>
                  <ConsultationPanel {...panelProps} />
                </div>

                <div>
                  <h3 className="mb-4 text-[16px] font-semibold text-foreground">
                    Design
                  </h3>
                  <DesignPanel {...panelProps} />
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Financials (Quotation + Payments) ─────────────── */}
          {activeTab === "financials" && (
            <div className="space-y-6">
              <QuotationPanel {...panelProps} />
              <div className="h-px bg-border" />
              <PaymentList {...panelProps} />
            </div>
          )}

          {/* ── Remaining tabs ─────────────────────────────────────── */}
          {activeTab === "participants" && <ParticipantList {...panelProps} />}
          {activeTab === "measurements" && <MeasurementPanel {...panelProps} />}
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
