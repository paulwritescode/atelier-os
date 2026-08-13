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
  PrimaryButton,
  SecondaryButton,
  Badge,
  PanelLoading,
  EmptyState,
  Blocked,
} from "./_kit"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const inputClass =
  "h-[44px] w-full rounded-lg border px-4 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"

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
      return { bg: T.ink, fg: T.white }
    case "ReadyForFitting":
      return { bg: T.amber, fg: T.white }
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

  const disabled = isLocked || !staffId || busy

  if (garments === undefined || participants === undefined) return <PanelLoading />

  if (participants.length === 0) {
    return (
      <Blocked
        title="Add a participant first"
        body="Garments belong to a participant. Add participants and record their measurements before starting production."
      />
    )
  }

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
      await updateStage({
        garmentId,
        stage,
        updatedBy: staffId,
      })
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
    <div className="flex flex-col gap-6">
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
            className="rounded-lg border p-4"
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
                className="w-full resize-none rounded-lg border px-4 py-3 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Garment</TableHead>
                <TableHead className="w-[150px]">Participant</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px]">Current Stage</TableHead>
                <TableHead className="w-[140px]">Move to Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {garments.map((g) => {
                const garmentId = g._id as Id<"garments">
                const colors = statusColors(g.status)

                return (
                  <TableRow key={garmentId}>
                    <TableCell className="font-medium">{g.type}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{g.participantName ?? "Unknown"}</div>
                      {g.participantRole && (
                        <div className="text-xs" style={{ color: T.muted }}>
                          {g.participantRole}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <select
                        className="h-8 rounded-md border text-xs outline-none"
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
                    </TableCell>
                    <TableCell className="text-sm">{stageLabel(g.currentStage)}</TableCell>
                    <TableCell>
                      <select
                        className="h-8 rounded-md border text-xs outline-none"
                        style={inputStyle}
                        value={g.currentStage ?? ""}
                        disabled={disabled}
                        onChange={(e) => handleStage(garmentId, e.target.value as Stage)}
                      >
                        <option value="" disabled>
                          Change…
                        </option>
                        {STAGES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
