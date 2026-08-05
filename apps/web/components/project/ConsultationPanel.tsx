"use client"

/**
 * Consultation — the first step of every commission.
 * Completing the consultation is what unlocks the Design step.
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
  Badge,
  PanelLoading,
  fmtKES,
  parseKES,
  fmtDate,
} from "./_kit"

export function ConsultationPanel({ projectId, staffId, isLocked }: PanelProps) {
  const consultation = useQuery(api.consultations.getByProject, { projectId })

  const createConsultation = useMutation(api.consultations.create)
  const completeConsultation = useMutation(api.consultations.complete)

  const [requirements, setRequirements] = useState("")
  const [styleNotes, setStyleNotes] = useState("")
  const [budget, setBudget] = useState("")
  const [timeline, setTimeline] = useState("")
  const [references, setReferences] = useState("")
  const [saving, setSaving] = useState(false)

  const disabled = isLocked || !staffId

  if (consultation === undefined) return <PanelLoading />

  const handleCreate = async () => {
    if (!staffId) return
    if (!requirements.trim()) {
      toast.error("Requirements are required")
      return
    }
    setSaving(true)
    try {
      await createConsultation({
        projectId,
        conductedBy: staffId,
        requirements: requirements.trim(),
        styleNotes: styleNotes.trim() || undefined,
        budget: budget.trim() ? parseKES(budget) : undefined,
        timeline: timeline.trim() || undefined,
        references: references
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
      })
      toast.success("Consultation recorded")
      setRequirements("")
      setStyleNotes("")
      setBudget("")
      setTimeline("")
      setReferences("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record consultation")
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    if (!staffId || !consultation) return
    setSaving(true)
    try {
      await completeConsultation({
        id: consultation._id as Id<"consultations">,
        completedBy: staffId,
      })
      toast.success("Consultation marked complete. Design step unlocked.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete consultation")
    } finally {
      setSaving(false)
    }
  }

  // ── No consultation yet → creation form ─────────────────────────────────
  if (!consultation) {
    return (
      <Card>
        <SectionHeader
          eyebrow="Step 1"
          title="Record the consultation"
        />
        <p className="mb-6 text-[14px] leading-[22px]" style={{ color: T.muted }}>
          Every commission begins here. Capture what the client asked for, then mark the
          consultation complete to unlock the Design step.
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel>Requirements</FieldLabel>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              required
              disabled={disabled}
              placeholder="What does the client need?"
              className="w-full resize-none rounded-xs border px-4 py-3 text-[15px] outline-none disabled:opacity-50"
              style={inputStyle}
            />
          </div>

          <div>
            <FieldLabel>Style Notes</FieldLabel>
            <textarea
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
              rows={3}
              disabled={disabled}
              placeholder="Silhouette, inspirations, direction…"
              className="w-full resize-none rounded-xs border px-4 py-3 text-[15px] outline-none disabled:opacity-50"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Budget (KES)</FieldLabel>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                disabled={disabled}
                placeholder="250000"
                className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>Timeline</FieldLabel>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                disabled={disabled}
                placeholder="e.g. December 2026"
                className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <FieldLabel>References</FieldLabel>
            <input
              type="text"
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              disabled={disabled}
              placeholder="Comma-separated links or notes"
              className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
              style={inputStyle}
            />
          </div>

          <div className="flex justify-end">
            <PrimaryButton onClick={handleCreate} disabled={disabled || saving}>
              {saving ? "Saving…" : "Save Consultation"}
            </PrimaryButton>
          </div>
        </div>
      </Card>
    )
  }

  // ── Consultation exists → read-only summary ─────────────────────────────
  const isComplete = Boolean(consultation.completedAt)

  return (
    <Card>
      <SectionHeader
        eyebrow="Step 1"
        title="Consultation"
        action={
          isComplete ? (
            <Badge bg={T.green} fg={T.white}>
              Completed
            </Badge>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Requirements" value={consultation.requirements} />
        </div>
        <div className="sm:col-span-2">
          <Field label="Style Notes" value={consultation.styleNotes || "—"} />
        </div>
        <Field
          label="Budget"
          value={
            typeof consultation.budget === "number" ? fmtKES(consultation.budget) : "—"
          }
        />
        <Field label="Timeline" value={consultation.timeline || "—"} />
        <div className="sm:col-span-2">
          <Field
            label="References"
            value={
              consultation.references.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {consultation.references.map((ref: string, i: number) => (
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
        <Field label="Completed" value={fmtDate(consultation.completedAt)} />
      </div>

      {!isComplete && (
        <div className="mt-8 border-t pt-6" style={{ borderColor: T.stone }}>
          <p className="mb-4 text-[14px] leading-[22px]" style={{ color: T.muted }}>
            Completing the consultation is what unlocks the Design step.
          </p>
          <PrimaryButton onClick={handleComplete} disabled={disabled || saving}>
            {saving ? "Saving…" : "Mark Consultation Complete"}
          </PrimaryButton>
        </div>
      )}
    </Card>
  )
}
