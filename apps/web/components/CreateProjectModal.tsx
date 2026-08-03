"use client"

import React, { useState, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/components/AuthProvider"
import type { Id } from "@convex/_generated/dataModel"
import type { ProjectType, ClientType } from "@/lib/types"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called with a resolved client Id — never a raw name. */
  onSubmit: (data: {
    primaryClientId: Id<"clients">
    type: ProjectType
    title: string
    notes?: string
  }) => Promise<void>
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "Wedding", label: "Wedding" },
  { value: "Corporate", label: "Corporate" },
  { value: "Individual", label: "Individual" },
  { value: "ClosetRevamp", label: "Closet Revamp" },
  { value: "GalaOutfit", label: "Gala Outfit" },
  { value: "Photoshoot", label: "Photoshoot" },
  { value: "Alteration", label: "Alteration" },
]

const CLIENT_TYPES: { value: ClientType; label: string }[] = [
  { value: "Individual", label: "Individual" },
  { value: "Family", label: "Family" },
  { value: "Corporate", label: "Corporate" },
  { value: "WeddingHost", label: "Wedding Host" },
  { value: "EventOrganizer", label: "Event Organizer" },
]

// Sensible client type for a given commission type
const DEFAULT_CLIENT_TYPE: Record<ProjectType, ClientType> = {
  Wedding: "WeddingHost",
  Corporate: "Corporate",
  Individual: "Individual",
  ClosetRevamp: "Individual",
  GalaOutfit: "Individual",
  Photoshoot: "EventOrganizer",
  Alteration: "Individual",
}

const inputStyle: React.CSSProperties = {
  background: "#F6F2EC",
  borderColor: "#E0DAD0",
  color: "#1B1A17",
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth()
  const clients = useQuery(api.clients.list)
  const createClient = useMutation(api.clients.create)

  const [mode, setMode] = useState<"existing" | "new">("existing")
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [newClientName, setNewClientName] = useState("")
  const [newClientType, setNewClientType] = useState<ClientType>("Individual")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")

  const [projectType, setProjectType] = useState<ProjectType>("Individual")
  const [title, setTitle] = useState("")
  const [titleEdited, setTitleEdited] = useState(false)
  const [notes, setNotes] = useState("")

  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  // No clients yet? Force the "new client" path.
  const hasClients = (clients?.length ?? 0) > 0
  const effectiveMode = hasClients ? mode : "new"

  const activeClientName = useMemo(() => {
    if (effectiveMode === "new") return newClientName.trim()
    return clients?.find((c) => c._id === selectedClientId)?.name ?? ""
  }, [effectiveMode, newClientName, clients, selectedClientId])

  // Title auto-fills as "{Type} - {Client}" per Appendix §Naming Conventions
  const derivedTitle = useMemo(() => {
    const label = PROJECT_TYPES.find((t) => t.value === projectType)?.label ?? projectType
    return activeClientName ? `${label} - ${activeClientName}` : ""
  }, [projectType, activeClientName])

  const effectiveTitle = titleEdited ? title : derivedTitle

  const reset = () => {
    setMode("existing")
    setSelectedClientId("")
    setNewClientName("")
    setNewClientType("Individual")
    setNewClientEmail("")
    setNewClientPhone("")
    setProjectType("Individual")
    setTitle("")
    setTitleEdited(false)
    setNotes("")
    setError("")
    setSaving(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleTypeChange = (value: ProjectType) => {
    setProjectType(value)
    setNewClientType(DEFAULT_CLIENT_TYPE[value])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("You need to be signed in to create a commission.")
      return
    }

    setSaving(true)
    try {
      // Resolve the client to a real Convex Id
      let clientId: Id<"clients">

      if (effectiveMode === "new") {
        if (!newClientName.trim()) {
          setError("Client name is required.")
          setSaving(false)
          return
        }
        clientId = await createClient({
          name: newClientName.trim(),
          email: newClientEmail.trim() || undefined,
          phone: newClientPhone.trim() || undefined,
          type: newClientType,
          createdBy: user.id as Id<"staff">,
        })
      } else {
        if (!selectedClientId) {
          setError("Select a client.")
          setSaving(false)
          return
        }
        clientId = selectedClientId as Id<"clients">
      }

      await onSubmit({
        primaryClientId: clientId,
        type: projectType,
        title: effectiveTitle || `${projectType} - ${activeClientName}`,
        notes: notes.trim() || undefined,
      })

      reset()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the commission.")
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      style={{ background: "rgba(20,20,19,0.45)" }}
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-3xl border p-8"
        style={{
          background: "#FFFFFF",
          borderColor: "#E7E2DB",
          boxShadow: "0 16px 40px rgba(20,20,19,.10)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p
              className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: "#C8A46B" }}
            >
              New Commission
            </p>
            <h2
              className="font-heading text-[28px] font-semibold leading-tight"
              style={{ color: "#1B1A17" }}
            >
              Begin a project
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-[#F3EFEA]"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" style={{ color: "#8C857D" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-[13px] font-medium"
              style={{ background: "#FDF2F2", color: "#8C2F2F" }}
            >
              {error}
            </div>
          )}

          {/* Client — existing vs new */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                className="text-[12px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: "#5C5852" }}
              >
                Client
              </label>
              {hasClients && (
                <div className="flex gap-1">
                  {(["existing", "new"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className="rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
                      style={
                        effectiveMode === m
                          ? { background: "#4B1E2A", color: "#FFFFFF" }
                          : { background: "#F3EFEA", color: "#8C857D" }
                      }
                    >
                      {m === "existing" ? "Existing" : "New"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {effectiveMode === "existing" ? (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none focus:border-[#C8A46B]"
                style={inputStyle}
                required
              >
                <option value="">Select a client...</option>
                {clients?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-col gap-3">
                {!hasClients && (
                  <p className="text-[12px]" style={{ color: "#8C857D" }}>
                    No clients yet — this will create your first one.
                  </p>
                )}
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client name or company"
                  className="h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none focus:border-[#C8A46B]"
                  style={inputStyle}
                  required
                />
                <select
                  value={newClientType}
                  onChange={(e) => setNewClientType(e.target.value as ClientType)}
                  className="h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none focus:border-[#C8A46B]"
                  style={inputStyle}
                >
                  {CLIENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none focus:border-[#C8A46B]"
                    style={inputStyle}
                  />
                  <input
                    type="tel"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none focus:border-[#C8A46B]"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Commission type */}
          <div>
            <label
              htmlFor="projectType"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "#5C5852" }}
            >
              Commission Type
            </label>
            <select
              id="projectType"
              value={projectType}
              onChange={(e) => handleTypeChange(e.target.value as ProjectType)}
              className="h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none focus:border-[#C8A46B]"
              style={inputStyle}
              required
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="projectTitle"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "#5C5852" }}
            >
              Title
            </label>
            <input
              id="projectTitle"
              type="text"
              value={effectiveTitle}
              onChange={(e) => {
                setTitleEdited(true)
                setTitle(e.target.value)
              }}
              placeholder="e.g. Wedding - James & Diana"
              className="h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none focus:border-[#C8A46B]"
              style={inputStyle}
              required
            />
            <p className="mt-1.5 text-[12px]" style={{ color: "#8C857D" }}>
              Auto-filled from type and client — edit if needed.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "#5C5852" }}
            >
              Initial Notes <span style={{ color: "#8C857D" }}>(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Requirements, context, anything worth recording..."
              rows={3}
              className="w-full resize-none rounded-xl border px-4 py-3 text-[14px] outline-none focus:border-[#C8A46B]"
              style={inputStyle}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="h-[44px] flex-1 rounded-full border text-[14px] font-medium transition-colors hover:bg-[#F3EFEA]"
              style={{ borderColor: "#D9D2C7", color: "#1B1A17", background: "transparent" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-[44px] flex-1 rounded-full text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "#4B1E2A" }}
            >
              {saving ? "Creating..." : "Create Commission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
