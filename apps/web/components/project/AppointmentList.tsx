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
  fmtDateTime,
} from "./_kit"

const inputClass =
  "h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"

type AppointmentType = "Consultation" | "Measurement" | "Fitting" | "Pickup" | "SiteVisit"
type AppointmentStatus = "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "NoShow"

const TYPES: { value: AppointmentType; label: string }[] = [
  { value: "Consultation", label: "Consultation" },
  { value: "Measurement", label: "Measurement" },
  { value: "Fitting", label: "Fitting" },
  { value: "Pickup", label: "Pickup" },
  { value: "SiteVisit", label: "Site Visit" },
]

const STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: "Scheduled", label: "Scheduled" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "NoShow", label: "No Show" },
]

function typeLabel(type: string): string {
  return TYPES.find((t) => t.value === type)?.label ?? type
}

function statusColors(status: AppointmentStatus): { bg: string; fg: string } {
  switch (status) {
    case "Scheduled":
      return { bg: T.gold, fg: T.white }
    case "Confirmed":
      return { bg: T.burgundy, fg: T.white }
    case "Completed":
      return { bg: T.green, fg: T.white }
    case "Cancelled":
      return { bg: T.danger, fg: T.white }
    case "NoShow":
      return { bg: T.body, fg: T.white }
  }
}

export function AppointmentList({ projectId, staffId, isLocked }: PanelProps) {
  const appointments = useQuery(api.appointments.listByProject, { projectId })
  const participants = useQuery(api.participants.listByProjectDetailed, { projectId })

  const schedule = useMutation(api.appointments.schedule)
  const updateStatus = useMutation(api.appointments.updateStatus)

  const [isOpen, setIsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [type, setType] = useState<AppointmentType>("Fitting")
  const [scheduledAt, setScheduledAt] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("60")
  const [isHomeVisit, setIsHomeVisit] = useState(false)
  const [selected, setSelected] = useState<Id<"participants">[]>([])
  const [notes, setNotes] = useState("")

  const disabled = isLocked || !staffId || busy

  if (appointments === undefined || participants === undefined) return <PanelLoading />

  const toggleParticipant = (id: Id<"participants">) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const resetForm = () => {
    setType("Fitting")
    setScheduledAt("")
    setDurationMinutes("60")
    setIsHomeVisit(false)
    setSelected([])
    setNotes("")
  }

  const handleSchedule = async () => {
    if (!staffId) return

    if (!scheduledAt) {
      toast.error("Pick a date and time.")
      return
    }
    const duration = Math.floor(Number(durationMinutes))
    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error("Duration must be greater than zero.")
      return
    }

    setBusy(true)
    try {
      await schedule({
        projectId,
        type,
        // The current user is both the assigned staff and the scheduler.
        staffId,
        participantIds: selected,
        scheduledAt: new Date(scheduledAt).getTime(),
        durationMinutes: duration,
        isHomeVisit,
        notes: notes.trim() || undefined,
        scheduledBy: staffId,
      })
      toast.success(`${typeLabel(type)} scheduled.`)
      resetForm()
      setIsOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not schedule the appointment.")
    } finally {
      setBusy(false)
    }
  }

  const handleStatus = async (id: Id<"appointments">, status: AppointmentStatus) => {
    if (!staffId) return
    setBusy(true)
    try {
      await updateStatus({ id, status, updatedBy: staffId })
      toast.success("Appointment status updated.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the appointment.")
    } finally {
      setBusy(false)
    }
  }

  const sorted = [...appointments].sort((a, b) => b.scheduledAt - a.scheduledAt)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          eyebrow="Scheduling"
          title="Appointments"
          action={
            !isOpen ? (
              <PrimaryButton onClick={() => setIsOpen(true)} disabled={disabled}>
                Schedule Appointment
              </PrimaryButton>
            ) : undefined
          }
        />

        {isOpen && (
          <div
            className="rounded-xs border p-4"
            style={{ borderColor: T.stone, background: T.softIvory }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Type</FieldLabel>
                <select
                  className={inputClass}
                  style={inputStyle}
                  value={type}
                  disabled={disabled}
                  onChange={(e) => setType(e.target.value as AppointmentType)}
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Date &amp; Time</FieldLabel>
                <input
                  type="datetime-local"
                  className={inputClass}
                  style={inputStyle}
                  value={scheduledAt}
                  disabled={disabled}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Duration (minutes)</FieldLabel>
                <input
                  type="number"
                  min={1}
                  step={5}
                  className={inputClass}
                  style={inputStyle}
                  value={durationMinutes}
                  disabled={disabled}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <label
                  className="inline-flex h-[44px] cursor-pointer items-center gap-2.5 text-[14px]"
                  style={{ color: T.ink }}
                >
                  <input
                    type="checkbox"
                    className="size-4 rounded"
                    checked={isHomeVisit}
                    disabled={disabled}
                    onChange={(e) => setIsHomeVisit(e.target.checked)}
                  />
                  Home visit
                </label>
              </div>
            </div>

            <div className="mt-4">
              <FieldLabel>Participants</FieldLabel>
              {participants.length === 0 ? (
                <p className="text-[13px]" style={{ color: T.muted }}>
                  No participants on this project yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {participants.map((p) => {
                    const id = p._id as Id<"participants">
                    const checked = selected.includes(id)
                    return (
                      <label
                        key={id}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-[13px]"
                        style={{
                          borderColor: checked ? T.burgundy : T.inputBorder,
                          background: checked ? T.white : T.ivory,
                          color: T.ink,
                        }}
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleParticipant(id)}
                        />
                        {p.clientName} · {p.role}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mt-4">
              <FieldLabel>Notes (optional)</FieldLabel>
              <textarea
                rows={3}
                className="w-full resize-none rounded-xl border px-4 py-3 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"
                style={inputStyle}
                value={notes}
                disabled={disabled}
                placeholder="Location, access details, what to bring…"
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryButton onClick={handleSchedule} disabled={disabled}>
                Schedule
              </PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  resetForm()
                  setIsOpen(false)
                }}
                disabled={busy}
              >
                Cancel
              </SecondaryButton>
            </div>
          </div>
        )}
      </Card>

      {sorted.length === 0 ? (
        <EmptyState
          eyebrow="No appointments"
          title="Nothing on the calendar"
          body="Schedule a consultation, measurement, fitting, pickup or site visit to keep the client moving through the atelier."
        />
      ) : (
        sorted.map((a) => {
          const id = a._id as Id<"appointments">
          const colors = statusColors(a.status)
          const count = a.participantIds.length

          return (
            <Card key={id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge bg={T.softIvory} fg={T.burgundy}>
                      {typeLabel(a.type)}
                    </Badge>
                    {a.isHomeVisit && (
                      <Badge bg={T.gold} fg={T.white}>
                        Home Visit
                      </Badge>
                    )}
                    <Badge bg={colors.bg} fg={colors.fg}>
                      {STATUSES.find((s) => s.value === a.status)?.label ?? a.status}
                    </Badge>
                  </div>
                  <p className="text-[15px]" style={{ color: T.ink }}>
                    {fmtDateTime(a.scheduledAt)}
                  </p>
                  <p className="text-[13px]" style={{ color: T.muted }}>
                    {a.durationMinutes} min · {count} participant{count === 1 ? "" : "s"}
                  </p>
                  {a.notes && (
                    <p className="max-w-[520px] text-[13px] leading-[20px]" style={{ color: T.body }}>
                      {a.notes}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-[220px]">
                  <FieldLabel>Status</FieldLabel>
                  <select
                    className={inputClass}
                    style={inputStyle}
                    value={a.status}
                    disabled={disabled}
                    onChange={(e) => handleStatus(id, e.target.value as AppointmentStatus)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}
