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
} from "./_kit"

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
                        background: active ? T.burgundy : T.white,
                        color: active ? T.white : T.body,
                        borderColor: active ? T.burgundy : T.stone,
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
        <div className="flex flex-col gap-3">
          {participants.map((p: ParticipantRow) => (
            <Card key={p._id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold"
                    style={{ background: T.ivory, color: T.burgundy }}
                  >
                    {initials(p.clientName)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="truncate text-[15px] font-medium"
                      style={{ color: T.ink }}
                    >
                      {p.clientName}
                    </p>
                    <p className="truncate text-[13px]" style={{ color: T.muted }}>
                      {p.role}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {p.latestMeasurementVersion ? (
                    <Badge>{`Measurements v${p.latestMeasurementVersion}`}</Badge>
                  ) : (
                    <Badge bg={T.amber} fg={T.white}>
                      No measurements
                    </Badge>
                  )}
                  <Badge>{`${p.garmentCount} garment${p.garmentCount === 1 ? "" : "s"}`}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
