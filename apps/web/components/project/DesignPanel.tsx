"use client"

/**
 * Design — gated behind a completed consultation.
 * Approving the design is what unlocks Quotation.
 */
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
  Blocked,
  fmtDate,
} from "./_kit"

interface DesignForm {
  style: string
  fabric: string
  color: string
  accessories: string
  references: string
  notes: string
}

const EMPTY_FORM: DesignForm = {
  style: "",
  fabric: "",
  color: "",
  accessories: "",
  references: "",
  notes: "",
}

export function DesignPanel({ projectId, staffId, isLocked }: PanelProps) {
  const design = useQuery(api.designs.getByProject, { projectId })
  const consultation = useQuery(api.consultations.getByProject, { projectId })

  const createDesign = useMutation(api.designs.create)
  const updateDesign = useMutation(api.designs.update)
  const approveDesign = useMutation(api.designs.approve)

  const [form, setForm] = useState<DesignForm>(EMPTY_FORM)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const disabled = isLocked || !staffId

  if (design === undefined || consultation === undefined) return <PanelLoading />

  // ── GATE: consultation must exist and be complete ───────────────────────
  if (!consultation || !consultation.completedAt) {
    return (
      <Blocked
        title="Consultation required"
        body="Every commission begins with a consultation. Complete the consultation step before recording a design."
      />
    )
  }

  const set = (key: keyof DesignForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const splitRefs = (value: string): string[] =>
    value
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean)

  const handleCreate = async () => {
    if (!staffId) return
    if (!form.style.trim() || !form.fabric.trim() || !form.color.trim()) {
      toast.error("Style, fabric and colour are required")
      return
    }
    setSaving(true)
    try {
      await createDesign({
        consultationId: consultation._id as Id<"consultations">,
        projectId,
        style: form.style.trim(),
        fabric: form.fabric.trim(),
        color: form.color.trim(),
        accessories: form.accessories.trim() || undefined,
        references: splitRefs(form.references),
        notes: form.notes.trim() || undefined,
        createdBy: staffId,
      })
      toast.success("Design recorded")
      setForm(EMPTY_FORM)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record design")
    } finally {
      setSaving(false)
    }
  }

  const startEdit = () => {
    if (!design) return
    setForm({
      style: design.style,
      fabric: design.fabric,
      color: design.color,
      accessories: design.accessories ?? "",
      references: design.references.join(", "),
      notes: design.notes ?? "",
    })
    setEditing(true)
  }

  const handleUpdate = async () => {
    if (!design) return
    setSaving(true)
    try {
      await updateDesign({
        id: design._id as Id<"designs">,
        style: form.style.trim(),
        fabric: form.fabric.trim(),
        color: form.color.trim(),
        accessories: form.accessories.trim() || undefined,
        references: splitRefs(form.references),
        notes: form.notes.trim() || undefined,
      })
      toast.success("Design updated")
      setEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update design")
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    if (!staffId || !design) return
    setSaving(true)
    try {
      await approveDesign({ id: design._id as Id<"designs">, approvedBy: staffId })
      toast.success("Design approved. Quotation step unlocked.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve design")
    } finally {
      setSaving(false)
    }
  }

  const textField = (
    label: string,
    key: keyof DesignForm,
    placeholder: string,
    required = false
  ) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => set(key)(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
        style={inputStyle}
      />
    </div>
  )

  const notesField = (
    <div className="sm:col-span-2">
      <FieldLabel>Notes</FieldLabel>
      <textarea
        value={form.notes}
        onChange={(e) => set("notes")(e.target.value)}
        rows={3}
        disabled={disabled}
        placeholder="Construction notes, fittings to watch…"
        className="w-full resize-none rounded-2xl border px-4 py-3 text-[15px] outline-none disabled:opacity-50"
        style={inputStyle}
      />
    </div>
  )

  // ── No design yet → creation form ───────────────────────────────────────
  if (!design) {
    return (
      <Card>
        <SectionHeader eyebrow="Step 2" title="Record the design" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {textField("Style", "style", "e.g. Three-piece tuxedo", true)}
          {textField("Fabric", "fabric", "e.g. Italian wool", true)}
          {textField("Colour", "color", "e.g. Midnight navy", true)}
          {textField("Accessories", "accessories", "e.g. Silk bow tie, pocket square")}
          <div className="sm:col-span-2">
            {textField("References", "references", "Comma-separated links or notes")}
          </div>
          {notesField}
        </div>
        <div className="mt-6 flex justify-end">
          <PrimaryButton onClick={handleCreate} disabled={disabled || saving}>
            {saving ? "Saving…" : "Save Design"}
          </PrimaryButton>
        </div>
      </Card>
    )
  }

  // ── Design exists ───────────────────────────────────────────────────────
  const isApproved = Boolean(design.approvedAt)

  return (
    <Card>
      <SectionHeader
        eyebrow="Step 2"
        title="Design"
        action={
          isApproved ? (
            <Badge bg={T.green} fg={T.white}>
              Approved
            </Badge>
          ) : editing ? undefined : (
            <SecondaryButton onClick={startEdit} disabled={disabled}>
              Edit
            </SecondaryButton>
          )
        }
      />

      {editing ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {textField("Style", "style", "e.g. Three-piece tuxedo", true)}
            {textField("Fabric", "fabric", "e.g. Italian wool", true)}
            {textField("Colour", "color", "e.g. Midnight navy", true)}
            {textField("Accessories", "accessories", "e.g. Silk bow tie, pocket square")}
            <div className="sm:col-span-2">
              {textField("References", "references", "Comma-separated links or notes")}
            </div>
            {notesField}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <SecondaryButton onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </SecondaryButton>
            <PrimaryButton onClick={handleUpdate} disabled={disabled || saving}>
              {saving ? "Saving…" : "Save Changes"}
            </PrimaryButton>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Style" value={design.style} />
          <Field label="Fabric" value={design.fabric} />
          <Field label="Colour" value={design.color} />
          <Field label="Accessories" value={design.accessories || "—"} />
          <div className="sm:col-span-2">
            <Field
              label="References"
              value={
                design.references.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {design.references.map((ref: string, i: number) => (
                      <li key={i} className="truncate text-[15px]">
                        {ref}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )
              }
            />
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes" value={design.notes || "—"} />
          </div>
          {isApproved && <Field label="Approved" value={fmtDate(design.approvedAt)} />}
        </div>
      )}

      {!isApproved && !editing && (
        <div className="mt-8 border-t pt-6" style={{ borderColor: T.stone }}>
          <p className="mb-4 text-[14px] leading-[22px]" style={{ color: T.muted }}>
            Approving the design is what unlocks the Quotation step.
          </p>
          <PrimaryButton onClick={handleApprove} disabled={disabled || saving}>
            {saving ? "Saving…" : "Approve Design"}
          </PrimaryButton>
        </div>
      )}
    </Card>
  )
}
