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
  fmtDateTime,
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
import { generateAppointmentTicketPDF } from "./AppointmentTicketPDF"

const inputClass =
  "h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"

type AppointmentType = "Consultation" | "Measurement" | "Fitting" | "Pickup" | "SiteVisit"
type AppointmentStatus = "Requested" | "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "NoShow"

const TYPES: { value: AppointmentType; label: string }[] = [
  { value: "Consultation", label: "Consultation" },
  { value: "Measurement", label: "Measurement" },
  { value: "Fitting", label: "Fitting" },
  { value: "Pickup", label: "Pickup" },
  { value: "SiteVisit", label: "Site Visit" },
]

const STATUSES: { value: AppointmentStatus; label: string }[] = [
  { value: "Requested", label: "Requested" },
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
    case "Requested":
      return { bg: "hsl(270 60% 70%)", fg: T.white }
    case "Scheduled":
      return { bg: "hsl(45 93% 58%)", fg: T.white }
    case "Confirmed":
      return { bg: T.green, fg: T.white }
    case "Completed":
      return { bg: "hsl(220 30% 40%)", fg: T.white }
    case "Cancelled":
      return { bg: T.danger, fg: T.white }
    case "NoShow":
      return { bg: T.body, fg: T.white }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppointmentRow = any

export function AppointmentList({ projectId, staffId, isLocked }: PanelProps) {
  const appointments = useQuery(api.appointments.listByProject, { projectId })
  const participants = useQuery(api.participants.listByProjectDetailed, { projectId })

  const schedule = useMutation(api.appointments.schedule)
  const updateStatus = useMutation(api.appointments.updateStatus)
  const confirmAppt = useMutation(api.appointments.confirm)
  const completeAppt = useMutation(api.appointments.complete)
  const cancelAppt = useMutation(api.appointments.cancel)

  const [isOpen, setIsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [type, setType] = useState<AppointmentType>("Fitting")
  const [scheduledAt, setScheduledAt] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("60")
  const [isHomeVisit, setIsHomeVisit] = useState(false)
  const [location, setLocation] = useState("")
  const [selected, setSelected] = useState<Id<"participants">[]>([])
  const [notes, setNotes] = useState("")

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<AppointmentRow | null>(null)

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
    setLocation("")
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
        staffId,
        participantIds: selected,
        scheduledAt: new Date(scheduledAt).getTime(),
        durationMinutes: duration,
        isHomeVisit,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        requestedBy: "staff",
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
      toast.success("Status updated.")
      if (selectedAppt && selectedAppt._id === id) {
        setSelectedAppt({ ...selectedAppt, status })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update.")
    } finally {
      setBusy(false)
    }
  }

  const handleConfirm = async (appt: AppointmentRow) => {
    if (!staffId) return
    setBusy(true)
    try {
      await confirmAppt({ id: appt._id, confirmedBy: staffId })
      toast.success("Appointment confirmed.")
      setSelectedAppt({ ...appt, status: "Confirmed", confirmedBy: staffId, confirmedAt: Date.now() })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not confirm.")
    } finally {
      setBusy(false)
    }
  }

  const handleComplete = async (appt: AppointmentRow) => {
    if (!staffId) return
    setBusy(true)
    try {
      await completeAppt({ id: appt._id, completedBy: staffId })
      toast.success("Appointment marked complete.")
      setSelectedAppt({ ...appt, status: "Completed", completedBy: staffId, completedAt: Date.now() })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete.")
    } finally {
      setBusy(false)
    }
  }

  const handleGenerateTicket = (appt: AppointmentRow) => {
    // Use the data we have to generate the PDF
    generateAppointmentTicketPDF({
      ticketRef: appt.ticketRef ?? `APT-${appt._id.slice(-6).toUpperCase()}`,
      type: appt.type,
      status: appt.status,
      scheduledAt: appt.scheduledAt,
      durationMinutes: appt.durationMinutes,
      isHomeVisit: appt.isHomeVisit,
      location: appt.location,
      notes: appt.notes,
      clientName: "Client", // Will be enriched when we have the full data
      projectTitle: "Commission",
      staffName: undefined,
      confirmedByName: undefined,
      confirmedAt: appt.confirmedAt,
    })
    toast.success("Ticket PDF downloaded.")
  }

  const openDetails = (appt: AppointmentRow) => {
    setSelectedAppt(appt)
    setDrawerOpen(true)
  }

  const sorted = [...appointments].sort((a, b) => b.scheduledAt - a.scheduledAt)

  return (
    <div className="flex flex-col gap-4">
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
        <Card>
          <div className="flex flex-col gap-4">
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
              <div>
                <FieldLabel>Location</FieldLabel>
                <input
                  type="text"
                  className={inputClass}
                  style={inputStyle}
                  value={location}
                  disabled={disabled}
                  placeholder="e.g. Atelier Studio, Westlands"
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center">
              <label
                className="inline-flex cursor-pointer items-center gap-2.5 text-[14px]"
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

            <div>
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
                          borderColor: checked ? T.ink : T.inputBorder,
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

            <div>
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

            <div className="flex flex-wrap gap-3">
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
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          eyebrow="No appointments"
          title="Nothing on the calendar"
          body="Schedule a consultation, measurement, fitting, pickup or site visit to keep the client moving through the atelier."
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 border-b border-hairline">
                <TableHead className="border-0">Ref</TableHead>
                <TableHead className="border-0">Type</TableHead>
                <TableHead className="border-0">Date</TableHead>
                <TableHead className="border-0">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((a: AppointmentRow) => {
                const colors = statusColors(a.status)

                return (
                  <TableRow
                    key={a._id}
                    onClick={() => openDetails(a)}
                    className="cursor-pointer hover:bg-muted transition-colors border-0"
                  >
                    <TableCell className="border-0 py-4 px-6 font-mono text-[12px] text-muted-foreground">
                      {a.ticketRef ?? "—"}
                    </TableCell>
                    <TableCell className="border-0 py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium">{typeLabel(a.type)}</span>
                        {a.isHomeVisit && (
                          <Badge bg={T.amber} fg={T.white}>
                            Home
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border-0 py-4 px-6 text-[14px]">
                      {fmtDateTime(a.scheduledAt)}
                    </TableCell>
                    <TableCell className="border-0 py-4 px-6">
                      <Badge bg={colors.bg} fg={colors.fg}>
                        {STATUSES.find((s) => s.value === a.status)?.label ?? a.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Appointment Details Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} swipeDirection="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {selectedAppt ? typeLabel(selectedAppt.type) : "Appointment"}
            </DrawerTitle>
            <DrawerDescription>
              {selectedAppt?.ticketRef ?? "Appointment details"}
            </DrawerDescription>
          </DrawerHeader>

          {selectedAppt && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-5">
                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge bg={T.softIvory} fg={T.ink}>
                    {typeLabel(selectedAppt.type)}
                  </Badge>
                  {selectedAppt.isHomeVisit && (
                    <Badge bg={T.amber} fg={T.white}>
                      Home Visit
                    </Badge>
                  )}
                  <Badge
                    bg={statusColors(selectedAppt.status).bg}
                    fg={statusColors(selectedAppt.status).fg}
                  >
                    {STATUSES.find((s) => s.value === selectedAppt.status)?.label ?? selectedAppt.status}
                  </Badge>
                </div>

                <div className="h-px bg-border" />

                {/* Core details */}
                <Field label="Ticket Reference" value={selectedAppt.ticketRef ?? "—"} />
                <Field label="Date & Time" value={fmtDateTime(selectedAppt.scheduledAt)} />
                <Field label="Duration" value={`${selectedAppt.durationMinutes} minutes`} />
                <Field
                  label="Participants"
                  value={`${selectedAppt.participantIds.length} participant${selectedAppt.participantIds.length === 1 ? "" : "s"}`}
                />
                {selectedAppt.location && (
                  <Field label="Location" value={selectedAppt.location} />
                )}
                {selectedAppt.notes && (
                  <Field label="Notes" value={selectedAppt.notes} />
                )}

                {/* Workflow tracking */}
                <div className="h-px bg-border" />

                <p className="text-[13px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                  Tracking
                </p>

                {selectedAppt.requestedBy && (
                  <Field
                    label="Requested By"
                    value={`${selectedAppt.requestedBy === "client" ? "Client" : "Staff"}${selectedAppt.requestedAt ? ` · ${fmtDateTime(selectedAppt.requestedAt)}` : ""}`}
                  />
                )}
                {selectedAppt.confirmedAt && (
                  <Field
                    label="Confirmed"
                    value={fmtDateTime(selectedAppt.confirmedAt)}
                  />
                )}
                {selectedAppt.completedAt && (
                  <Field
                    label="Completed"
                    value={fmtDateTime(selectedAppt.completedAt)}
                  />
                )}
                {selectedAppt.cancelledAt && (
                  <>
                    <Field
                      label="Cancelled"
                      value={fmtDateTime(selectedAppt.cancelledAt)}
                    />
                    {selectedAppt.cancelReason && (
                      <Field label="Cancel Reason" value={selectedAppt.cancelReason} />
                    )}
                  </>
                )}

                <div className="h-px bg-border" />

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  {/* Workflow actions based on current status */}
                  {(selectedAppt.status === "Requested" || selectedAppt.status === "Scheduled") && (
                    <PrimaryButton
                      onClick={() => handleConfirm(selectedAppt)}
                      disabled={disabled}
                    >
                      Confirm Appointment
                    </PrimaryButton>
                  )}

                  {selectedAppt.status === "Confirmed" && (
                    <PrimaryButton
                      onClick={() => handleComplete(selectedAppt)}
                      disabled={disabled}
                    >
                      Mark as Completed
                    </PrimaryButton>
                  )}

                  {/* Generate Ticket — always available */}
                  <SecondaryButton
                    onClick={() => handleGenerateTicket(selectedAppt)}
                  >
                    Generate Ticket PDF
                  </SecondaryButton>

                  {/* Status dropdown for manual override */}
                  {selectedAppt.status !== "Completed" && selectedAppt.status !== "Cancelled" && (
                    <div className="mt-2">
                      <FieldLabel>Change Status</FieldLabel>
                      <select
                        className={inputClass}
                        style={inputStyle}
                        value={selectedAppt.status}
                        disabled={disabled}
                        onChange={(e) => {
                          handleStatus(
                            selectedAppt._id as Id<"appointments">,
                            e.target.value as AppointmentStatus
                          )
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
