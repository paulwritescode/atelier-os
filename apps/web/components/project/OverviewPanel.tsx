"use client"

/**
 * Overview — the commission at a glance.
 */
import React, { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import type { Id, Doc } from "@convex/_generated/dataModel"
import type { ProjectStatus, ProjectType } from "@/lib/types"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit02Icon } from "@hugeicons/core-free-icons"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import {
  type PanelProps,
  T,
  Card,
  SectionHeader,
  Field,
  Badge,
  fmtKES,
  fmtDate,
  inputStyle,
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
} from "./_kit"

const TYPE_LABEL: Record<ProjectType, string> = {
  Wedding: "Wedding",
  Corporate: "Corporate",
  Individual: "Individual",
  ClosetRevamp: "Closet Revamp",
  GalaOutfit: "Gala Outfit",
  Photoshoot: "Photoshoot",
  Alteration: "Alteration",
}

const PROJECT_TYPES: ProjectType[] = [
  "Wedding",
  "Corporate",
  "Individual",
  "ClosetRevamp",
  "GalaOutfit",
  "Photoshoot",
  "Alteration",
]

const STATUS_OPTIONS: ProjectStatus[] = [
  "Draft",
  "Active",
  "OnHold",
  "Completed",
  "Archived",
]

const STATUS_LABEL: Record<ProjectStatus, string> = {
  Draft: "Draft",
  Active: "Active",
  OnHold: "On Hold",
  Completed: "Completed",
  Archived: "Archived",
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
  project,
  projectId,
  staffId,
  isLocked,
  clientName,
  paymentSummary,
  onStatusChange,
}: OverviewPanelProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [notes, setNotes] = useState(project.notes ?? "")
  const [type, setType] = useState<ProjectType>(project.type as ProjectType)
  const [status, setStatus] = useState<ProjectStatus>(project.status as ProjectStatus)
  const [saving, setSaving] = useState(false)

  const updateProject = useMutation(api.projects.update)

  const openSheet = () => {
    // Sync form state with current project values
    setTitle(project.title)
    setNotes(project.notes ?? "")
    setType(project.type as ProjectType)
    setStatus(project.status as ProjectStatus)
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!staffId) return
    setSaving(true)
    try {
      await updateProject({
        id: projectId,
        title,
        notes,
        type,
        status,
        updatedBy: staffId,
      })
      // If status changed, notify parent
      if (status !== project.status) {
        onStatusChange(status)
      }
      toast.success("Project updated")
      setEditOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update project")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Commission — At a glance (no Card wrapper) */}
      <div className="relative">
        <SectionHeader
          eyebrow="At a glance"
          title="Commission"
          action={
            !isLocked ? (
              <button
                type="button"
                onClick={openSheet}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Edit project details"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
              </button>
            ) : undefined
          }
        />
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
      </div>

      {/* Financials */}
      {paymentSummary?.hasQuotation && (
        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="eyebrow text-ink">Financials</p>
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

      {/* Edit Sheet */}
      <Drawer open={editOpen} onOpenChange={setEditOpen} swipeDirection="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Project</DrawerTitle>
            <DrawerDescription>
              Update the commission details below.
            </DrawerDescription>
          </DrawerHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
            className="flex flex-1 flex-col gap-5 overflow-y-auto p-6"
          >
            {/* Title */}
            <div>
              <FieldLabel>Title</FieldLabel>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-[44px] w-full rounded-md border px-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                style={inputStyle}
                required
              />
            </div>

            {/* Type */}
            <div>
              <FieldLabel>Type</FieldLabel>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="h-[44px] w-full rounded-md border px-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                style={inputStyle}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <FieldLabel>Status</FieldLabel>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="h-[44px] w-full rounded-md border px-3 text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                style={inputStyle}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <FieldLabel>Notes</FieldLabel>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-md border px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                style={inputStyle}
              />
            </div>

            {/* Actions */}
            <div className="mt-auto flex items-center gap-3 pt-4">
              <PrimaryButton type="submit" disabled={saving || !title.trim()}>
                {saving ? "Saving…" : "Save"}
              </PrimaryButton>
              <SecondaryButton onClick={() => setEditOpen(false)}>
                Cancel
              </SecondaryButton>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
