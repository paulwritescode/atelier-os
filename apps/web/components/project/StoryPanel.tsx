"use client"

/**
 * Updates — the place where the tailor uploads videos, pictures with
 * descriptions for the project. Captures date/time of upload.
 * Shows client comments per update.
 */
import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Image01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
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
import { cn } from "@/lib/utils"

type StoryRow = FunctionReturnType<typeof api.stories.listAll>[number]

function nowMs(): number {
  return Date.now()
}

function hoursRemaining(expiresAt: number): number {
  return Math.max(0, Math.ceil((expiresAt - nowMs()) / (60 * 60 * 1000)))
}

function timeAgo(ms: number): string {
  const hours = Math.floor((Date.now() - ms) / (1000 * 60 * 60))
  if (hours === 0) return "Just now"
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return fmtDateTime(ms)
}

export function StoryPanel({ projectId, staffId, isLocked }: PanelProps) {
  const stories = useQuery(api.stories.listAll, { projectId })
  const commentCounts = useQuery(api.stories.commentCountsByProject, { projectId })
  const createStory = useMutation(api.stories.create)
  const expireStory = useMutation(api.stories.expire)

  const [showForm, setShowForm] = useState(false)
  const [text, setText] = useState("")
  const [mediaUrls, setMediaUrls] = useState("")
  const [saving, setSaving] = useState(false)

  const disabled = isLocked || !staffId || saving

  if (stories === undefined) return <PanelLoading />

  const now = nowMs()
  const active = stories.filter((s) => s.expiresAt > now && !s.movedToTimelineAt)
  const past = stories.filter((s) => s.expiresAt <= now || s.movedToTimelineAt)

  const reset = () => {
    setText("")
    setMediaUrls("")
    setShowForm(false)
  }

  const handlePublish = async () => {
    if (!staffId) return
    if (!text.trim() && !mediaUrls.trim()) {
      toast.error("Add a description or at least one media URL.")
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
      toast.success("Update published. Visible to client for 24 hours.")
      reset()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish the update.")
    } finally {
      setSaving(false)
    }
  }

  const handleExpire = async (id: Id<"storyUpdates">) => {
    if (!staffId) return
    setSaving(true)
    try {
      await expireStory({ id, expiredBy: staffId })
      toast.success("Update moved to the timeline.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not move the update.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Client updates"
        title="Project Updates"
        action={
          !showForm ? (
            <PrimaryButton onClick={() => setShowForm(true)} disabled={disabled}>
              Post Update
            </PrimaryButton>
          ) : undefined
        }
      />

      {/* ── Upload form ────────────────────────────────────────────────── */}
      {showForm && (
        <Card>
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                disabled={disabled}
                placeholder="e.g. Fabric has arrived — deep navy Italian wool. Cutting begins Monday."
                className="w-full resize-none rounded-lg border px-4 py-3 text-[15px] outline-none disabled:opacity-50"
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>Media (images / videos)</FieldLabel>
              <input
                type="text"
                value={mediaUrls}
                onChange={(e) => setMediaUrls(e.target.value)}
                disabled={disabled}
                placeholder="Comma-separated image or video URLs"
                className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                style={inputStyle}
              />
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                Paste direct URLs to images or videos. Clients will see these as stories.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <SecondaryButton onClick={reset} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handlePublish} disabled={disabled}>
                {saving ? "Publishing…" : "Publish Update"}
              </PrimaryButton>
            </div>
          </div>
        </Card>
      )}

      {/* ── Active updates (still highlighted for client) ──────────────── */}
      {active.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-[hsl(140_71%_40%)]">
            Live now ({active.length})
          </p>
          {active.map((s: StoryRow) => (
            <UpdateCard
              key={s._id}
              story={s}
              commentCount={commentCounts?.[s._id] ?? 0}
              projectId={projectId}
              staffId={staffId}
              isActive
              onExpire={() => handleExpire(s._id)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* ── Past updates ───────────────────────────────────────────────── */}
      {past.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="eyebrow text-muted-foreground">
            Past updates ({past.length})
          </p>
          {past.map((s: StoryRow) => (
            <UpdateCard
              key={s._id}
              story={s}
              commentCount={commentCounts?.[s._id] ?? 0}
              projectId={projectId}
              staffId={staffId}
              isActive={false}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────── */}
      {stories.length === 0 && !showForm && (
        <EmptyState
          icon={Image01Icon}
          eyebrow="Client updates"
          title="No updates published"
          body="Post progress updates with photos and videos. Clients see these as stories on their share link — they can view and comment."
          action={
            <PrimaryButton onClick={() => setShowForm(true)} disabled={disabled}>
              Post Update
            </PrimaryButton>
          }
        />
      )}
    </div>
  )
}

/* ── Update Card with collapsible comments ─────────────────────────────── */

function UpdateCard({
  story,
  commentCount,
  projectId,
  staffId,
  isActive,
  onExpire,
  disabled = false,
}: {
  story: StoryRow
  commentCount: number
  projectId: Id<"projects">
  staffId: Id<"staff"> | undefined
  isActive: boolean
  onExpire?: () => void
  disabled?: boolean
}) {
  const [showComments, setShowComments] = useState(false)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  const comments = useQuery(
    api.stories.listComments,
    showComments ? { storyId: story._id } : "skip"
  )
  const addStaffComment = useMutation(api.stories.addStaffComment)

  const handleReply = async () => {
    if (!staffId || !reply.trim()) return
    setSending(true)
    try {
      await addStaffComment({
        storyId: story._id,
        projectId,
        staffId,
        text: reply.trim(),
      })
      setReply("")
      toast.success("Reply sent.")
    } catch (err) {
      toast.error("Could not send reply.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      {/* Main content */}
      <div className="p-5">
        {/* Header with time and status */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-muted-foreground">
            {fmtDateTime(story.publishedAt)}
          </span>
          {isActive && (
            <Badge bg="hsl(140 71% 40%)" fg={T.white}>
              {`${hoursRemaining(story.expiresAt)}h left`}
            </Badge>
          )}
          {!isActive && (
            <Badge>Archived</Badge>
          )}
        </div>

        {/* Description */}
        {story.text && (
          <p className="text-[15px] leading-[24px] text-foreground mb-3">
            {story.text}
          </p>
        )}

        {/* Media preview */}
        {story.mediaUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {story.mediaUrls.map((url, i) => (
              <div
                key={i}
                className="relative size-20 rounded-lg bg-muted overflow-hidden border border-border/40"
              >
                {url.match(/\.(mp4|webm|mov)/i) ? (
                  <video src={url} className="size-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="size-full object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>
              {commentCount > 0 ? `${commentCount} comment${commentCount === 1 ? "" : "s"}` : "Comments"}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={cn("size-3 transition-transform", showComments && "rotate-180")}
            />
          </button>

          {isActive && onExpire && (
            <button
              onClick={onExpire}
              disabled={disabled}
              className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Move to timeline
            </button>
          )}
        </div>
      </div>

      {/* Collapsible comments section */}
      {showComments && (
        <div className="border-t border-border/40 bg-muted/20 px-5 py-4">
          {comments === undefined ? (
            <p className="text-[12px] text-muted-foreground">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No comments yet. Client comments will appear here.</p>
          ) : (
            <div className="flex flex-col gap-3 mb-4">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-2">
                  <div
                    className={cn(
                      "size-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-semibold",
                      c.authorType === "staff" ? "bg-primary text-primary-foreground" : "bg-block-lilac text-foreground"
                    )}
                  >
                    {c.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-medium text-foreground">{c.authorName}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-foreground/80">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Staff reply input */}
          {staffId && (
            <div className="flex gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleReply() }}
                placeholder="Reply to client..."
                disabled={sending}
                className="h-[34px] flex-1 rounded-full border border-border bg-background px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <button
                onClick={handleReply}
                disabled={sending || !reply.trim()}
                className="h-[34px] rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground disabled:opacity-40"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
