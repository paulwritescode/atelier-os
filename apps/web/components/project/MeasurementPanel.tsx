"use client"

/**
 * Measurements.
 *
 * ADR-009: measurements are APPEND-ONLY. There is NO edit control and NO
 * delete control on any existing measurement row, and none may be added.
 * Recording always creates a new version; history is immutable.
 */
import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import type { FunctionReturnType } from "convex/server"
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
  Blocked,
  Field,
  fmtDate,
} from "./_kit"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

const REQUIRED_FIELDS = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "height", label: "Height" },
  { key: "inseam", label: "Inseam" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeve", label: "Sleeve" },
  { key: "neck", label: "Neck" },
] as const

type RequiredKey = (typeof REQUIRED_FIELDS)[number]["key"]
type FormState = Record<RequiredKey | "weight", string>

type ParticipantRow =
  FunctionReturnType<typeof api.participants.listByProjectDetailed>[number]
type MeasurementRow =
  FunctionReturnType<typeof api.measurements.listByParticipant>[number]

const EMPTY_FORM: FormState = {
  chest: "",
  waist: "",
  hips: "",
  height: "",
  inseam: "",
  shoulder: "",
  sleeve: "",
  neck: "",
  weight: "",
}

export function MeasurementPanel({ projectId, staffId, isLocked }: PanelProps) {
  const participants = useQuery(api.participants.listByProjectDetailed, { projectId })

  const [selectedId, setSelectedId] = useState<Id<"participants"> | null>(null)

  // Default to the first participant once the list arrives.
  const activeId: Id<"participants"> | null =
    selectedId ?? (participants && participants.length > 0 ? participants[0]._id : null)

  const measurements = useQuery(
    api.measurements.listByParticipant,
    activeId ? { participantId: activeId } : "skip"
  )

  const recordMeasurement = useMutation(api.measurements.record)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementRow | null>(null)
  const [showSheet, setShowSheet] = useState(false)

  const disabled = isLocked || !staffId

  if (participants === undefined) return <PanelLoading />

  if (participants.length === 0) {
    return (
      <Blocked
        title="Add a participant first"
        body="Measurements belong to a participant, not directly to the commission. Add at least one participant before recording measurements."
      />
    )
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setNotes("")
    setShowForm(false)
  }

  const handleRecord = async () => {
    if (!staffId || !activeId) return

    const missing = REQUIRED_FIELDS.filter((f) => !form[f.key].trim())
    if (missing.length > 0) {
      toast.error(`Missing: ${missing.map((f) => f.label).join(", ")}`)
      return
    }

    setSaving(true)
    try {
      await recordMeasurement({
        participantId: activeId,
        chest: Number(form.chest),
        waist: Number(form.waist),
        hips: Number(form.hips),
        height: Number(form.height),
        inseam: Number(form.inseam),
        shoulder: Number(form.shoulder),
        sleeve: Number(form.sleeve),
        neck: Number(form.neck),
        weight: form.weight.trim() ? Number(form.weight) : undefined,
        notes: notes.trim() || undefined,
        takenBy: staffId,
      })
      toast.success("Measurement recorded as a new version")
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record measurement")
    } finally {
      setSaving(false)
    }
  }

  const nextVersion = (measurements?.length ?? 0) + 1

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Fit"
        title="Measurements"
        action={
          !showForm ? (
            <PrimaryButton
              onClick={() => setShowForm(true)}
              disabled={disabled || !activeId}
            >
              Record New Measurement
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* Participant selector */}
      <div className="flex flex-wrap gap-2">
        {participants.map((p: ParticipantRow) => {
          const active = p._id === activeId
          return (
            <button
              key={p._id}
              type="button"
              onClick={() => {
                setSelectedId(p._id)
                resetForm()
              }}
              className="rounded-full border px-4 py-2 text-[13px] font-medium transition-colors"
              style={{
                background: active ? "hsl(0 0% 9%)" : T.white,
                color: active ? T.white : T.body,
                borderColor: active ? "hsl(0 0% 9%)" : T.stone,
              }}
            >
              {p.clientName}
              <span style={{ opacity: 0.7 }}>{` · ${p.role}`}</span>
            </button>
          )
        })}
      </div>

      {/* Record form — always creates a new version. ADR-009. */}
      {showForm && (
        <Card>
          <h3
            className="font-heading mb-5 text-[22px] font-semibold"
            style={{ color: T.ink }}
          >
            {`Version ${nextVersion}`}
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {REQUIRED_FIELDS.map((f) => (
              <div key={f.key}>
                <FieldLabel>{`${f.label} (cm)`}</FieldLabel>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  required
                  disabled={disabled}
                  placeholder="0"
                  className="h-[44px] w-full rounded-full border px-4 font-mono text-[15px] outline-none disabled:opacity-50"
                  style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
                />
              </div>
            ))}
            <div>
              <FieldLabel>Weight (kg)</FieldLabel>
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                disabled={disabled}
                placeholder="Optional"
                className="h-[44px] w-full rounded-full border px-4 font-mono text-[15px] outline-none disabled:opacity-50"
                style={{ ...inputStyle, fontVariantNumeric: "tabular-nums" }}
              />
            </div>
          </div>

          <div className="mt-5">
            <FieldLabel>Notes</FieldLabel>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={disabled}
              placeholder="Posture, allowances, anything the cutter should know…"
              className="w-full resize-none rounded-lg border px-4 py-3 text-[15px] outline-none disabled:opacity-50"
              style={inputStyle}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton onClick={resetForm} disabled={saving}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleRecord} disabled={disabled || saving}>
              {saving ? "Saving…" : `Save Version ${nextVersion}`}
            </PrimaryButton>
          </div>
        </Card>
      )}

      {/* History — newest first, immutable. No edit or delete. ADR-009. */}
      {measurements === undefined ? (
        <PanelLoading />
      ) : measurements.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-[14px]" style={{ color: T.muted }}>
            No measurements recorded for this participant yet.
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 border-b border-hairline">
                <TableHead className="w-[80px] border-0">Version</TableHead>
                <TableHead className="w-[100px] border-0">Date</TableHead>
                <TableHead className="w-[70px] text-right border-0">Chest</TableHead>
                <TableHead className="w-[70px] text-right border-0">Waist</TableHead>
                <TableHead className="w-[70px] text-right border-0">Hips</TableHead>
                <TableHead className="w-[70px] text-right border-0">Height</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measurements.map((m: MeasurementRow) => (
                <TableRow
                  key={m._id}
                  onClick={() => {
                    setSelectedMeasurement(m)
                    setShowSheet(true)
                  }}
                  className="cursor-pointer hover:bg-muted transition-colors border-0"
                >
                  <TableCell className="border-0 py-4 px-6">
                    <Badge bg="hsl(0 0% 9%)" fg={T.white}>
                      v{m.version}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm border-0 py-4 px-6">{fmtDate(m.takenAt)}</TableCell>
                  <TableCell className="font-mono text-right text-sm border-0 py-4 px-6">
                    {m.chest}
                  </TableCell>
                  <TableCell className="font-mono text-right text-sm border-0 py-4 px-6">
                    {m.waist}
                  </TableCell>
                  <TableCell className="font-mono text-right text-sm border-0 py-4 px-6">
                    {m.hips}
                  </TableCell>
                  <TableCell className="font-mono text-right text-sm border-0 py-4 px-6">
                    {m.height}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Measurement Details Drawer */}
      <Drawer open={showSheet} onOpenChange={setShowSheet} swipeDirection="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedMeasurement ? `Measurement v${selectedMeasurement.version}` : "Measurement"}
            </DrawerTitle>
            <DrawerDescription>
              {selectedMeasurement ? fmtDate(selectedMeasurement.takenAt) : ""}
            </DrawerDescription>
          </DrawerHeader>

          {selectedMeasurement && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {REQUIRED_FIELDS.map((f) => (
                    <Field
                      key={f.key}
                      label={`${f.label} (cm)`}
                      value={String(selectedMeasurement[f.key])}
                      mono
                    />
                  ))}
                  <Field
                    label="Weight (kg)"
                    value={selectedMeasurement.weight != null ? String(selectedMeasurement.weight) : "—"}
                    mono
                  />
                </div>

                {selectedMeasurement.notes && (
                  <>
                    <div className="h-px bg-border" />
                    <Field label="Notes" value={selectedMeasurement.notes} />
                  </>
                )}
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
