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

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth()
  const clients = useQuery(api.clients.list)
  const createClient = useMutation(api.clients.create)

  const [mode, setMode] = useState<"existing" | "new">("new")
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [newClientName, setNewClientName] = useState("")

  const [projectType, setProjectType] = useState<ProjectType>("Individual")
  const [isOtherType, setIsOtherType] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [title, setTitle] = useState("")
  const [titleEdited, setTitleEdited] = useState(false)

  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  // No clients yet? Force the "new client" path.
  const hasClients = (clients?.length ?? 0) > 0
  const effectiveMode = hasClients ? mode : "new"

  const activeClientName = useMemo(() => {
    if (effectiveMode === "new") return newClientName.trim()
    return clients?.find((c) => c._id === selectedClientId)?.name ?? ""
  }, [effectiveMode, newClientName, clients, selectedClientId])

  // Title auto-fills as "{Type} - {Client}" per naming conventions
  const derivedTitle = useMemo(() => {
    if (isOtherType && customTitle.trim()) {
      return activeClientName ? `${customTitle.trim()} - ${activeClientName}` : customTitle.trim()
    }
    const label = PROJECT_TYPES.find((t) => t.value === projectType)?.label ?? projectType
    return activeClientName ? `${label} - ${activeClientName}` : ""
  }, [projectType, activeClientName, isOtherType, customTitle])

  const effectiveTitle = titleEdited ? title : derivedTitle

  const reset = () => {
    setMode("new")
    setSelectedClientId("")
    setNewClientName("")
    setProjectType("Individual")
    setIsOtherType(false)
    setCustomTitle("")
    setTitle("")
    setTitleEdited(false)
    setError("")
    setSaving(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleTypeChange = (value: string) => {
    if (value === "Other") {
      setIsOtherType(true)
      setProjectType("Individual") // Default DB value for custom/other
    } else {
      setIsOtherType(false)
      setProjectType(value as ProjectType)
    }
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
      let clientId: Id<"clients">

      if (effectiveMode === "new") {
        if (!newClientName.trim()) {
          setError("Client name is required.")
          setSaving(false)
          return
        }
        clientId = await createClient({
          name: newClientName.trim(),
          type: DEFAULT_CLIENT_TYPE[projectType],
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
        className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-xs border border-border bg-card p-8 shadow-[0_16px_40px_rgba(20,20,19,.10)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-gold">
              New Commission
            </p>
            <h2 className="font-heading text-[28px] font-semibold leading-tight text-foreground">
              Begin a project
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4 text-muted-foreground" />
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

          {/* Segmented Tabs — New / Existing */}
          {hasClients && (
            <div className="flex justify-center">
              <div className="inline-flex gap-2 rounded-full bg-muted p-1">
                {(["new", "existing"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`h-[44px] rounded-full px-6 text-[14px] font-medium transition-colors ${
                      effectiveMode === m
                        ? "bg-block-lilac text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "new" ? "New Client" : "Existing Client"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Client */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Client
            </label>

            {effectiveMode === "existing" ? (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="h-[44px] w-full rounded-xl border border-border bg-background px-4 text-[14px] text-foreground outline-none focus:border-ring"
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
                  <p className="text-[12px] text-muted-foreground">
                    No clients yet — this will create your first one.
                  </p>
                )}
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Client name or company"
                  className="h-[44px] w-full rounded-xl border border-border bg-background px-4 text-[14px] text-foreground outline-none focus:border-ring"
                  required
                />
              </div>
            )}
          </div>

          {/* Commission type */}
          <div>
            <label
              htmlFor="projectType"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              Commission Type
            </label>
            <select
              id="projectType"
              value={isOtherType ? "Other" : projectType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="h-[44px] w-full rounded-xl border border-border bg-background px-4 text-[14px] text-foreground outline-none focus:border-ring"
              required
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>

            {isOtherType && (
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Describe the commission type..."
                className="mt-3 h-[44px] w-full rounded-xl border border-border bg-background px-4 text-[14px] text-foreground outline-none focus:border-ring"
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="projectTitle"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
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
              className="h-[44px] w-full rounded-xl border border-border bg-background px-4 text-[14px] text-foreground outline-none focus:border-ring"
              required
            />
            <p className="mt-1.5 text-[12px] text-muted-foreground">
              Auto-filled from type and client — edit if needed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="h-[44px] flex-1 rounded-full border border-border bg-transparent text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-[44px] flex-1 rounded-full bg-primary text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Commission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
