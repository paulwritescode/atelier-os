"use client"

/**
 * Participants — wedding and corporate commissions carry many people,
 * each with their own measurements and garments.
 */
import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import { UserGroupIcon } from "@hugeicons/core-free-icons"
import type { FunctionReturnType } from "convex/server"
import type { Doc, Id } from "@convex/_generated/dataModel"
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
  Field,
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

const CLIENT_TYPES = [
  { value: "Individual", label: "Individual" },
  { value: "Family", label: "Family" },
  { value: "Corporate", label: "Corporate" },
  { value: "WeddingHost", label: "Wedding Host" },
  { value: "EventOrganizer", label: "Event Organizer" },
] as const

type ClientType = (typeof CLIENT_TYPES)[number]["value"]

type ParticipantRow =
  FunctionReturnType<typeof api.participants.listByProjectDetailed>[number]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function ParticipantList({ projectId, staffId, isLocked }: PanelProps) {
  const participants = useQuery(api.participants.listByProjectDetailed, { projectId })
  const clients = useQuery(api.clients.list)

  const addParticipant = useMutation(api.participants.add)
  const createClient = useMutation(api.clients.create)

  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<"existing" | "new">("existing")
  const [clientId, setClientId] = useState("")
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<ClientType>("Individual")
  const [role, setRole] = useState("")
  const [saving, setSaving] = useState(false)

  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantRow | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const disabled = isLocked || !staffId

  if (participants === undefined) return <PanelLoading />

  const resetForm = () => {
    setMode("existing")
    setClientId("")
    setNewName("")
    setNewType("Individual")
    setRole("")
    setShowForm(false)
  }

  const handleAdd = async () => {
    if (!staffId) return
    if (!role.trim()) {
      toast.error("Role is required")
      return
    }
    if (mode === "existing" && !clientId) {
      toast.error("Pick a client")
      return
    }
    if (mode === "new" && !newName.trim()) {
      toast.error("Client name is required")
      return
    }

    setSaving(true)
    try {
      let resolvedClientId = clientId as Id<"clients">

      if (mode === "new") {
        resolvedClientId = await createClient({
          name: newName.trim(),
          type: newType,
          createdBy: staffId,
        })
      }

      await addParticipant({
        projectId,
        clientId: resolvedClientId,
        role: role.trim(),
        addedBy: staffId,
      })
      toast.success("Participant added")
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add participant")
    } finally {
      setSaving(false)
    }
  }

  const handleRowClick = (participant: ParticipantRow) => {
    setSelectedParticipant(participant)
    setShowDetails(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="People"
        title={`${participants.length} participant${participants.length === 1 ? "" : "s"}`}
        action={
          !showForm ? (
            <PrimaryButton onClick={() => setShowForm(true)} disabled={disabled}>
              Add Participant
            </PrimaryButton>
          ) : undefined
        }
      />

      {showForm && (
        <Card>
          <div className="flex flex-col gap-5">
            {/* Existing vs new client */}
            <div>
              <FieldLabel>Client</FieldLabel>
              <div className="mb-3 flex gap-2">
                {(["existing", "new"] as const).map((m) => {
                  const active = mode === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      disabled={disabled}
                      className="rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-50"
                      style={{
                        background: active ? T.ink : T.white,
                        color: active ? T.white : T.body,
                        borderColor: active ? T.ink : T.stone,
                      }}
                    >
                      {m === "existing" ? "Existing client" : "New client"}
                    </button>
                  )
                })}
              </div>

              {mode === "existing" ? (
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={disabled || clients === undefined}
                  className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                  style={inputStyle}
                >
                  <option value="">
                    {clients === undefined ? "Loading clients…" : "Select a client"}
                  </option>
                  {(clients ?? []).map((c: Doc<"clients">) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={disabled}
                    placeholder="Client name"
                    className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                    style={inputStyle}
                  />
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ClientType)}
                    disabled={disabled}
                    className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                    style={inputStyle}
                  >
                    {CLIENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <FieldLabel>Role</FieldLabel>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={disabled}
                placeholder="e.g. Groom, Best Man, Groomsman, Employee"
                className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                style={inputStyle}
              />
            </div>

            <div className="flex justify-end gap-3">
              <SecondaryButton onClick={resetForm} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleAdd} disabled={disabled || saving}>
                {saving ? "Adding…" : "Add Participant"}
              </PrimaryButton>
            </div>
          </div>
        </Card>
      )}

      {participants.length === 0 ? (
        <EmptyState
          icon={UserGroupIcon}
          eyebrow="People"
          title="No participants yet"
          body="Wedding and corporate commissions carry several people. Each participant keeps their own measurements and garments, so add everyone who needs to be fitted."
          action={
            !showForm ? (
              <PrimaryButton onClick={() => setShowForm(true)} disabled={disabled}>
                Add Participant
              </PrimaryButton>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-0 border-b border-hairline">
                <TableHead className="w-[200px] border-0">Name</TableHead>
                <TableHead className="w-[150px] border-0">Role</TableHead>
                <TableHead className="w-[120px] border-0">Measurements</TableHead>
                <TableHead className="text-right border-0">Garments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p: ParticipantRow) => (
                <TableRow
                  key={p._id}
                  onClick={() => handleRowClick(p)}
                  className="cursor-pointer hover:bg-muted transition-colors border-0"
                >
                  <TableCell className="font-medium border-0 py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                        style={{ background: T.softIvory, color: T.ink }}
                      >
                        {initials(p.clientName)}
                      </div>
                      <span className="truncate">{p.clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="border-0 py-4 px-6">{p.role}</TableCell>
                  <TableCell className="border-0 py-4 px-6">
                    {p.latestMeasurementVersion ? (
                      <Badge>v{p.latestMeasurementVersion}</Badge>
                    ) : (
                      <Badge bg={T.amber} fg={T.white}>
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right border-0 py-4 px-6">
                    {p.garmentCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Details Drawer */}
      <Drawer open={showDetails} onOpenChange={setShowDetails} swipeDirection="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedParticipant?.clientName}</DrawerTitle>
            <DrawerDescription>Participant details</DrawerDescription>
          </DrawerHeader>

          {selectedParticipant && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold"
                    style={{ background: T.softIvory, color: T.ink }}
                  >
                    {initials(selectedParticipant.clientName)}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">
                      {selectedParticipant.clientName}
                    </p>
                    <p className="text-[13px] text-muted-foreground">
                      {selectedParticipant.role}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <Field label="Client Type" value={selectedParticipant.clientType || "—"} />

                <Field
                  label="Latest Measurement"
                  value={
                    selectedParticipant.latestMeasurementVersion
                      ? `Version ${selectedParticipant.latestMeasurementVersion}`
                      : "Not yet recorded"
                  }
                />

                <Field
                  label="Garments"
                  value={`${selectedParticipant.garmentCount} item${selectedParticipant.garmentCount !== 1 ? "s" : ""}`}
                />
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
