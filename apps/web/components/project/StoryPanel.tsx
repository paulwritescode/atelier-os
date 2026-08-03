"use client"

/**
 * Story Updates — temporary highlights published to the client.
 *
 * ADR-011: a story is highlighted for 24 hours, then automatically becomes a
 * timeline event (handled by the expireStories cron). Publishing notifies the
 * client.
 */
import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import { Image01Icon } from "@hugeicons/core-free-icons"
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
  EmptyState,
  fmtDateTime,
} from "./_kit"

type StoryRow = FunctionReturnType<typeof api.stories.listAll>[number]

/** Module-level so clock reads stay out of render (react-hooks/purity). */
function nowMs(): number {
  return new Date().getTime()
}

function hoursRemaining(expiresAt: number): number {
  return Math.max(0, Math.ceil((expiresAt - nowMs()) / (60 * 60 * 1000)))
}

/** Split stories into still-highlighted and already-in-timeline. */
function partitionStories(rows: StoryRow[]): { active: StoryRow[]; past: StoryRow[] } {
  const now = nowMs()
  return {
    active: rows.filter((s) => s.expiresAt > now && !s.movedToTimelineAt),
    past: rows.filter((s) => s.expiresAt <= now || s.movedToTimelineAt),
  }
}

export function StoryPanel({ projectId, staffId, isLocked }: PanelProps) {
  const stories = useQuery(api.stories.listAll, { projectId })
  const createStory = useMutation(api.stories.create)
  const expireStory = useMutation(api.stories.expire)

  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState("")
  const [mediaUrls, setMediaUrls] = useState("")
  const [saving, setSaving] = useState(false)

  const disabled = isLocked || !staffId || saving

  if (stories === undefined) return <PanelLoading />

  const { active, past } = partitionStories(stories)

  const reset = () => {
    setText("")
    setMediaUrls("")
    setShowForm(false)
  }

  const handlePublish = async () => {
    if (!staffId) return
    if (!text.trim() && !mediaUrls.trim()) {
      toast.error("Add some text or at least one media URL.")
      return
    }
    setSaving(true)
    try {
      await createStory({
        projectId,
        text: text.trim() || undefined,
        mediaUrls: mediaUrls
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean),
        createdBy: staffId,
      })
      toast.success("Story published. Highlighted for 24 hours.")
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish the story.")
    } finally {
      setSaving(false)
    }
  }

  const handleExpire = async (id: Id<"storyUpdates">) => {
    if (!staffId) return
    setSaving(true)
    try {
      await expireStory({ id, expiredBy: staffId })
      toast.success("Story moved to the timeline.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not move the story.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Client updates"
        title="Story Updates"
        action={
          !showForm ? (
            <PrimaryButton onClick={() => setShowForm(true)} disabled={disabled}>
              Publish Update
            </PrimaryButton>
          ) : undefined
        }
      />

      {showForm && (
        <Card>
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel>Update</FieldLabel>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                disabled={disabled}
                placeholder="e.g. Fabric has arrived — deep navy Italian wool. Cutting begins Monday."
                className="w-full resize-none rounded-2xl border px-4 py-3 text-[15px] outline-none disabled:opacity-50"
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>Media URLs</FieldLabel>
              <input
                type="text"
                value={mediaUrls}
                onChange={(e) => setMediaUrls(e.target.value)}
                disabled={disabled}
                placeholder="Comma-separated image or video URLs"
                className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                style={inputStyle}
              />
              <p className="mt-1.5 text-[12px]" style={{ color: T.muted }}>
                Direct uploads to R2 land with the media pipeline. For now, paste URLs.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <SecondaryButton onClick={reset} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handlePublish} disabled={disabled}>
                {saving ? "Publishing…" : "Publish"}
              </PrimaryButton>
            </div>
          </div>
        </Card>
      )}

      {/* Active — still highlighted */}
      {active.length > 0 && (
        <div className="flex flex-col gap-3">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: T.gold }}
          >
            Highlighted now
          </p>
          {active.map((s: StoryRow) => (
            <Card key={s._id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <Badge bg={T.gold} fg={T.white}>
                  {`${hoursRemaining(s.expiresAt)}h remaining`}
                </Badge>
                <span className="text-[12px]" style={{ color: T.muted }}>
                  {fmtDateTime(s.publishedAt)}
                </span>
              </div>
              {s.text && (
                <p className="text-[15px] leading-[24px]" style={{ color: T.ink }}>
                  {s.text}
                </p>
              )}
              {s.mediaUrls.length > 0 && (
                <p className="mt-2 text-[13px]" style={{ color: T.muted }}>
                  {s.mediaUrls.length} attachment{s.mediaUrls.length === 1 ? "" : "s"}
                </p>
              )}
              <div className="mt-4">
                <SecondaryButton onClick={() => handleExpire(s._id)} disabled={disabled}>
                  Move to timeline now
                </SecondaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Past — already in the timeline */}
      {past.length > 0 && (
        <div className="flex flex-col gap-3">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: T.muted }}
          >
            Past updates
          </p>
          {past.map((s: StoryRow) => (
            <Card key={s._id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Badge>In timeline</Badge>
                <span className="text-[12px]" style={{ color: T.muted }}>
                  {fmtDateTime(s.publishedAt)}
                </span>
              </div>
              {s.text && (
                <p className="text-[14px] leading-[22px]" style={{ color: T.body }}>
                  {s.text}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {stories.length === 0 && !showForm && (
        <EmptyState
          icon={Image01Icon}
          eyebrow="Client updates"
          title="No updates published"
          body="Story updates keep the client close to the work. Each one is highlighted for 24 hours, then folds into the commission timeline."
          action={
            <PrimaryButton onClick={() => setShowForm(true)} disabled={disabled}>
              Publish Update
            </PrimaryButton>
          }
        />
      )}
    </div>
  )
}
