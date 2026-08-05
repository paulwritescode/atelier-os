"use client"

/**
 * Share a commission with the client.
 * A link is either public, or protected by a PIN the owner sets.
 */
import React, { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Copy01Icon } from "@hugeicons/core-free-icons"
import type { Doc, Id } from "@convex/_generated/dataModel"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  project: Doc<"projects">
  staffId: Id<"staff"> | undefined
}

export function ShareModal({ isOpen, onClose, project, staffId }: ShareModalProps) {
  const setShareSettings = useMutation(api.projects.setShareSettings)

  const [enabled, setEnabled] = useState(!!project.isPubliclyShared)
  const [usePin, setUsePin] = useState(!!project.sharePin)
  const [pin, setPin] = useState(project.sharePin ?? "")
  const [saving, setSaving] = useState(false)

  // Reset the form to the record's current values each time the modal opens,
  // using a render-time key comparison rather than an effect.
  const snapshot = `${isOpen}|${project.isPubliclyShared}|${project.sharePin ?? ""}`
  const [lastSnapshot, setLastSnapshot] = useState(snapshot)
  if (snapshot !== lastSnapshot) {
    setLastSnapshot(snapshot)
    setEnabled(!!project.isPubliclyShared)
    setUsePin(!!project.sharePin)
    setPin(project.sharePin ?? "")
  }

  if (!isOpen) return null

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${project.slug}`
      : `/share/${project.slug}`

  const handleSave = async () => {
    if (!staffId) {
      toast.error("You need to be signed in.")
      return
    }
    if (enabled && usePin && pin.trim().length < 4) {
      toast.error("PIN must be at least 4 characters.")
      return
    }

    setSaving(true)
    try {
      await setShareSettings({
        id: project._id,
        isPubliclyShared: enabled,
        sharePin: enabled && usePin ? pin.trim() : undefined,
        updatedBy: staffId,
      })
      toast.success(
        enabled
          ? usePin
            ? "Share link enabled with PIN protection."
            : "Share link enabled publicly."
          : "Share link disabled."
      )
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update sharing.")
    } finally {
      setSaving(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Link copied.")
    } catch {
      toast.error("Could not copy the link.")
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      style={{ background: "rgba(20,20,19,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] rounded-xs border border-border bg-card p-8 shadow-[0_16px_40px_rgba(20,20,19,.10)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-gold">
              Client access
            </p>
            <h2 className="font-heading text-[26px] font-semibold leading-tight text-foreground">
              Share commission
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Enable */}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mt-0.5 size-4"
            />
            <span>
              <span className="block text-[14px] font-medium text-foreground">
                Enable share link
              </span>
              <span className="block text-[13px] text-muted-foreground">
                Lets the client follow progress without signing in.
              </span>
            </span>
          </label>

          {enabled && (
            <>
              {/* PIN toggle */}
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={usePin}
                  onChange={(e) => setUsePin(e.target.checked)}
                  className="mt-0.5 size-4"
                />
                <span>
                  <span className="block text-[14px] font-medium text-foreground">
                    Protect with a PIN
                  </span>
                  <span className="block text-[13px] text-muted-foreground">
                    Leave off to make the link fully public.
                  </span>
                </span>
              </label>

              {usePin && (
                <div>
                  <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Share PIN
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="At least 4 characters"
                    className="h-[44px] w-full rounded-full border border-border bg-background px-4 font-mono text-[15px] tracking-[0.15em] text-foreground outline-none focus:border-ring"
                  />
                  <p className="mt-1.5 text-[12px] text-muted-foreground">
                    Numbers, words or symbols — whatever is easiest to pass on.
                  </p>
                </div>
              )}

              {/* Link */}
              <div>
                <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Link
                </label>
                <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2.5">
                  <span className="flex-1 truncate text-[13px] text-muted-foreground">
                    {shareUrl}
                  </span>
                  <button
                    onClick={copyLink}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-card"
                    aria-label="Copy link"
                  >
                    <HugeiconsIcon icon={Copy01Icon} className="size-4 text-primary" />
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="h-[44px] flex-1 rounded-full border border-border bg-transparent text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-[44px] flex-1 rounded-full bg-primary text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
