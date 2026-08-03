"use client"

import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import type { Id } from "@convex/_generated/dataModel"
import {
  type PanelProps,
  T,
  inputStyle,
  Card,
  SectionHeader,
  FieldLabel,
  Field,
  PrimaryButton,
  SecondaryButton,
  Badge,
  PanelLoading,
  EmptyState,
  Blocked,
  fmtDateTime,
} from "./_kit"

const inputClass =
  "h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"

// ── The 9 production stages, in order (Appendix §Production) ─────────────
type Stage =
  | "DesignApproved"
  | "FabricReady"
  | "Pattern"
  | "Cutting"
  | "Stitching"
  | "Finishing"
  | "Pressing"
  | "QualityCheck"
  | "Ready"

const STAGES: { value: Stage; label: string }[] = [
  { value: "DesignApproved", label: "Design Approved" },
  { value: "FabricReady", label: "Fabric Ready" },
  { value: "Pattern", label: "Pattern" },
  { value: "Cutting", label: "Cutting" },
  { value: "Stitching", label: "Stitching" },
  { value: "Finishing", label: "Finishing" },
  { value: "Pressing", label: "Pressing" },
  { value: "QualityCheck", label: "Quality Check" },
  { value: "Ready", label: "Ready" },
]

type GarmentStatus =
  | "Pending"
  | "InProduction"
  | "ReadyForFitting"
  | "ReadyForDelivery"
  | "Delivered"

const GARMENT_STATUSES: { value: GarmentStatus; label: string }[] = [
  { value: "Pending", label: "Pending" },
  { value: "InProduction", label: "In Production" },
  { value: "ReadyForFitting", label: "Ready for Fitting" },
  { value: "ReadyForDelivery", label: "Ready for Delivery" },
  { value: "Delivered", label: "Delivered" },
]

function stageLabel(stage: string | null): string {
  return STAGES.find((s) => s.value === stage)?.label ?? "Not started"
}

function statusColors(status: GarmentStatus): { bg: string; fg: string } {
  switch (status) {
    case "Pending":
      return { bg: T.softIvory, fg: T.body }
    case "InProduction":
      return { bg: T.burgundy, fg: T.white }
    case "ReadyForFitting":
      return { bg: T.gold, fg: T.white }
    case "ReadyForDelivery":
      return { bg: T.amber, fg: T.white }
    case "Delivered":
      return { bg: T.green, fg: T.white }
  }
}

export function ProductionPanel({ projectId, staffId, isLocked }: PanelProps) {
  const garments = useQuery(api.production.listByProject, { projectId })
  const participants = useQuery(api.participants.listByProjectDetailed, { projectId })

  const createGarment = useMutation(api.garments.create)
  const updateStage = useMutation(api.production.updateStage)
  const updateStatus = useMutation(api.garments.updateStatus)

  const [isOpen, setIsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [participantId, setParticipantId] = useState("")
  const [garmentType, setGarmentType] = useState("")
  const [notes, setNotes] = useState("")
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({})

  const disabled = isLocked || !staffId || busy

  if (garments === undefined || participants === undefined) return <PanelLoading />

  // ── Gate: garments belong to a participant ─────────────────────────────
  if (participants.length === 0) {
    return (
      <Blocked
        title="Add a participant first"
        body="Garments belong to a participant. Add participants and record their measurements before starting production."
      />
    )
  }

  // A garment must reference a measurement snapshot.
  const measurable = participants.filter((p) => p.latestMeasurementId !== null)
  const unmeasured = participants.filter((p) => p.latestMeasurementId === null)

  const handleCreate = async () => {
    if (!staffId) return

    const participant = measurable.find((p) => p._id === participantId)
    if (!participant || !participant.latestMeasurementId) {
      toast.error("Select a participant with recorded measurements.")
      return
    }
    if (!garmentType.trim()) {
      toast.error("Describe the garment type.")
      return
    }

    setBusy(true)
    try {
      await createGarment({
        participantId: participant._id,
        projectId,
        type: garmentType.trim(),
        measurementId: participant.latestMeasurementId,
        notes: notes.trim() || undefined,
        createdBy: staffId,
      })
      toast.success("Garment added to the production queue.")
      setParticipantId("")
      setGarmentType("")
      setNotes("")
      setIsOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add the garment.")
    } finally {
      setBusy(false)
    }
  }

  const handleStage = async (garmentId: Id<"garments">, stage: Stage) => {
    if (!staffId) return
    setBusy(true)
    try {
      const note = stageNotes[garmentId]?.trim()
      await updateStage({
        garmentId,
        stage,
        notes: note || undefined,
        updatedBy: staffId,
      })
      setStageNotes((prev) => ({ ...prev, [garmentId]: "" }))
      toast.success(`Stage set to ${stageLabel(stage)}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the stage.")
    } finally {
      setBusy(false)
    }
  }

  const handleStatus = async (garmentId: Id<"garments">, status: GarmentStatus) => {
    if (!staffId) return
    setBusy(true)
    try {
      await updateStatus({ id: garmentId, status, updatedBy: staffId })
      toast.success("Garment status updated.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the status.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          eyebrow="Step 6"
          title="Production"
          action={
            !isOpen ? (
              <PrimaryButton
                onClick={() => setIsOpen(true)}
                disabled={disabled || measurable.length === 0}
              >
                Add Garment
              </PrimaryButton>
            ) : undefined
          }
        />

        {unmeasured.length > 0 && (
          <p className="mb-4 text-[13px] leading-[20px]" style={{ color: T.amber }}>
            Measurements must be recorded first for:{" "}
            {unmeasured.map((p) => p.clientName).join(", ")}. A garment references a measurement
            snapshot, so these participants cannot receive garments yet.
          </p>
        )}

        {isOpen && (
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: T.stone, background: T.softIvory }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Participant</FieldLabel>
                <select
                  className={inputClass}
                  style={inputStyle}
                  value={participantId}
                  disabled={disabled}
                  onChange={(e) => setParticipantId(e.target.value)}
                >
                  <option value="">Select a participant…</option>
                  {measurable.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.clientName} — {p.role} (v{p.latestMeasurementVersion})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Garment Type</FieldLabel>
                <input
                  type="text"
                  className={inputClass}
                  style={inputStyle}
                  value={garmentType}
                  disabled={disabled}
                  placeholder="e.g. Three-piece suit, Shirt, Dress"
                  onChange={(e) => setGarmentType(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <FieldLabel>Notes (optional)</FieldLabel>
              <textarea
                rows={3}
                className="w-full resize-none rounded-xl border px-4 py-3 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"
                style={inputStyle}
                value={notes}
                disabled={disabled}
                placeholder="Fabric handling, special requests…"
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryButton onClick={handleCreate} disabled={disabled}>
                Add garment
              </PrimaryButton>
              <SecondaryButton onClick={() => setIsOpen(false)} disabled={busy}>
                Cancel
              </SecondaryButton>
            </div>
          </div>
        )}
      </Card>

      {garments.length === 0 ? (
        <EmptyState
          eyebrow="No garments"
          title="Production queue is empty"
          body="Add a garment for each participant to track it through the nine production stages."
        />
      ) : (
        garments.map((g) => {
          const garmentId = g._id as Id<"garments">
          const currentIndex = STAGES.findIndex((s) => s.value === g.currentStage)
          const colors = statusColors(g.status)

          return (
            <Card key={garmentId}>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3
                    className="font-heading text-[20px] font-semibold leading-tight"
                    style={{ color: T.ink }}
                  >
                    {g.type}
                  </h3>
                  <p className="mt-1 text-[13px]" style={{ color: T.muted }}>
                    {g.participantName ?? "Unknown"}
                    {g.participantRole ? ` · ${g.participantRole}` : ""}
                  </p>
                </div>
                <Badge bg={colors.bg} fg={colors.fg}>
                  {GARMENT_STATUSES.find((s) => s.value === g.status)?.label ?? g.status}
                </Badge>
              </div>

              {/* ── Stage progress strip ─────────────────────────────── */}
              <div className="mb-5 flex flex-wrap gap-1.5">
                {STAGES.map((s, i) => {
                  const done = currentIndex >= 0 && i <= currentIndex
                  return (
                    <span
                      key={s.value}
                      className="rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{
                        background: done ? T.burgundy : T.softIvory,
                        color: done ? T.white : T.muted,
                      }}
                    >
                      {s.label}
                    </span>
                  )
                })}
              </div>

              <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Current Stage" value={stageLabel(g.currentStage)} />
                <Field label="Stage Updated" value={fmtDateTime(g.stageUpdatedAt)} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Move to Stage</FieldLabel>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={g.currentStage ?? ""}
                    disabled={disabled}
                    onChange={(e) => handleStage(garmentId, e.target.value as Stage)}
                  >
                    <option value="" disabled>
                      Select a stage…
                    </option>
                    {STAGES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Garment Status</FieldLabel>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={g.status}
                    disabled={disabled}
                    onChange={(e) => handleStatus(garmentId, e.target.value as GarmentStatus)}
                  >
                    {GARMENT_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <FieldLabel>Stage Note (optional, applied on next stage change)</FieldLabel>
                <input
                  type="text"
                  className={inputClass}
                  style={inputStyle}
                  value={stageNotes[garmentId] ?? ""}
                  disabled={disabled}
                  placeholder="e.g. Second fitting adjustment required"
                  onChange={(e) =>
                    setStageNotes((prev) => ({ ...prev, [garmentId]: e.target.value }))
                  }
                />
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}
