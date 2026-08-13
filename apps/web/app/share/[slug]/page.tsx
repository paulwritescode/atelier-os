"use client"

/**
 * Public commission view — shared with the client.
 *
 * Layout:
 * - Header
 * - Stories (Instagram-like) + Progress sidebar (right)
 * - Actions (book consultation)
 * - Financials
 * - Journey (tabs: History | Payment History) — collapsible
 */
import React, { use, useState, useRef, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { cn } from "@/lib/utils"
import type { ProjectStatus, ProjectType } from "@/lib/types"

const LIFECYCLE = [
  "Consultation",
  "Design",
  "Quotation",
  "Deposit",
  "Measurements",
  "Production",
  "Fitting",
  "Delivery",
  "Completed",
] as const

const TYPE_LABEL: Record<ProjectType, string> = {
  Wedding: "Wedding",
  Corporate: "Corporate",
  Individual: "Individual",
  ClosetRevamp: "Closet Revamp",
  GalaOutfit: "Gala Outfit",
  Photoshoot: "Photoshoot",
  Alteration: "Alteration",
}

const STATUS_COPY: Record<ProjectStatus, string> = {
  Draft: "Your commission is being prepared.",
  Active: "Your commission is in progress.",
  OnHold: "Your commission is currently on hold.",
  Completed: "Your commission is complete. Thank you!",
  Archived: "Your commission has been archived.",
}

function money(minor: number): string {
  return `KES ${(minor / 100).toLocaleString("en-KE")}`
}

function dateOf(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  })
}

function timeAgo(ms: number): string {
  const hours = Math.floor((Date.now() - ms) / (1000 * 60 * 60))
  if (hours === 0) return "Just now"
  if (hours < 24) return `${hours}h ago`
  return dateOf(ms)
}

export default function SharedCommissionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const [pinInput, setPinInput] = useState("")
  const [submittedPin, setSubmittedPin] = useState<string | undefined>(undefined)
  const [showBooking, setShowBooking] = useState(false)

  const meta = useQuery(api.projects.getShareMeta, { slug })
  const project = useQuery(
    api.projects.getSharedProject,
    meta?.available ? { slug, pin: submittedPin } : "skip"
  )

  // ── Loading ─────────────────────────────────────────────────────────────
  if (meta === undefined) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </PageShell>
    )
  }

  // ── Link unavailable ────────────────────────────────────────────────────
  if (!meta.available) {
    return (
      <PageShell>
        <div className="bg-block-cream rounded-2xl p-10 text-center">
          <h1 className="font-heading mb-3 text-[26px] font-semibold text-foreground">
            This link is not available
          </h1>
          <p className="mx-auto max-w-[380px] text-[14px] leading-[22px] text-muted-foreground">
            The commission may no longer be shared. Please contact us for an up-to-date link.
          </p>
        </div>
      </PageShell>
    )
  }

  // ── PIN gate ────────────────────────────────────────────────────────────
  const needsPin = meta.requiresPin && (submittedPin === undefined || project === null)
  if (needsPin) {
    const wrongPin = submittedPin !== undefined && project === null
    return (
      <PageShell>
        <div className="bg-block-lilac rounded-2xl p-10 max-w-[440px] mx-auto">
          <p className="eyebrow mb-3 text-foreground/70">Protected</p>
          <h1 className="font-heading mb-3 text-[26px] font-semibold text-foreground">
            Enter your PIN
          </h1>
          <p className="mb-6 text-[14px] leading-[22px] text-muted-foreground">
            This commission is protected with a PIN.
          </p>
          {wrongPin && (
            <div className="mb-5 rounded-xl bg-block-coral px-4 py-3 text-[13px] font-medium text-foreground">
              That PIN did not match. Try again.
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); setSubmittedPin(pinInput.trim()) }}>
            <input
              type="text"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Your PIN"
              className="mb-4 h-[48px] w-full rounded-full border border-border bg-background px-5 text-center font-mono text-[16px] tracking-[0.25em] text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button type="submit" className="h-[48px] w-full rounded-full bg-primary text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              View commission
            </button>
          </form>
        </div>
      </PageShell>
    )
  }

  if (project === undefined || project === null) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      </PageShell>
    )
  }

  // ── Derive lifecycle stage ──────────────────────────────────────────────
  const stageIndex = (() => {
    if (project.status === "Completed" || project.status === "Archived") return LIFECYCLE.length - 1
    if (project.deliveredCount > 0 && project.deliveredCount >= project.garmentCount) return 7
    if (project.garmentCount > 0) return 5
    if (project.financials?.status === "Accepted") return 3
    if (project.financials) return 2
    return 1
  })()

  return (
    <PageShell>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="mb-6 sm:mb-8 bg-block-cream rounded-2xl p-6 sm:p-10">
        <p className="eyebrow mb-2 text-foreground/60">
          {TYPE_LABEL[project.type as ProjectType]}
          {project.clientName ? ` · ${project.clientName}` : ""}
        </p>
        <h1 className="font-heading mb-3 text-[28px] sm:text-[36px] font-semibold leading-tight text-foreground">
          {project.title}
        </h1>
        <p className="text-[15px] text-muted-foreground">
          {STATUS_COPY[project.status as ProjectStatus]}
        </p>
      </header>

      {/* ── Mobile progress (shown below header on small screens) ──── */}
      <section className="mb-6 md:hidden">
        <p className="eyebrow mb-3 text-muted-foreground">Progress</p>
        <div className="flex flex-wrap gap-1.5">
          {LIFECYCLE.map((stage, i) => {
            const done = i < stageIndex
            const current = i === stageIndex
            return (
              <span
                key={stage}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium",
                  current && "bg-[hsl(140_71%_40%)] text-white",
                  done && "bg-[hsl(140_71%_40%)]/20 text-[hsl(140_71%_40%)]",
                  !done && !current && "bg-muted text-muted-foreground/40"
                )}
              >
                {stage}
              </span>
            )
          })}
        </div>
        {project.garmentCount > 0 && (
          <p className="mt-2 text-[12px] text-muted-foreground">
            {project.deliveredCount}/{project.garmentCount} delivered
          </p>
        )}
      </section>

      {/* ── Main layout: content + progress sidebar ────────────────────── */}
      <div className="flex gap-8">
        {/* Left: main content */}
        <div className="flex-1 min-w-0">
          {/* Stories row (Instagram-like) */}
          <section className="mb-8">
            <p className="eyebrow mb-3 text-muted-foreground">Updates</p>
            {project.stories.length > 0 ? (
              <StoriesRow stories={project.stories} />
            ) : (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
                {/* Empty state placeholder circles */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="size-14 sm:size-16 rounded-full border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground/40">No updates</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Actions — book consultation */}
          <section className="mb-8 bg-block-mint rounded-2xl p-6">
            <p className="eyebrow mb-2 text-foreground/70">Actions</p>
            <h2 className="text-[16px] font-semibold text-foreground mb-3">
              Need to schedule something?
            </h2>
            {!showBooking ? (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowBooking(true)}
                  className="h-[40px] rounded-full bg-primary px-5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Book a Consultation
                </button>
                <button
                  onClick={() => setShowBooking(true)}
                  className="h-[40px] rounded-full border border-border bg-background px-5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Schedule a Fitting
                </button>
              </div>
            ) : (
              <BookingForm onClose={() => setShowBooking(false)} />
            )}
          </section>

          {/* Financials */}
          {project.financials && (
            <section className="mb-8">
              <p className="eyebrow mb-4 text-muted-foreground">Financials</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Total", value: project.financials.quotedTotal },
                  { label: "Paid", value: project.financials.received },
                  { label: "Balance", value: project.financials.balance },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl bg-muted/50 p-4">
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
                      {f.label}
                    </p>
                    <p className="font-mono text-[16px] font-semibold text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {money(f.value)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Journey — tabbed (History / Payment History), collapsible */}
          <JourneySection
            timeline={project.timeline}
            financials={project.financials}
          />
        </div>

        {/* Right: Progress sidebar */}
        <aside className="hidden md:block w-[160px] shrink-0">
          <div className="sticky top-8">
            <p className="eyebrow mb-4 text-muted-foreground">Progress</p>
            <div className="flex flex-col">
              {LIFECYCLE.map((stage, i) => {
                const done = i < stageIndex
                const current = i === stageIndex
                const pending = i > stageIndex
                const isLast = i === LIFECYCLE.length - 1

                return (
                  <div key={stage} className="flex items-start gap-2.5">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-full shrink-0",
                          current ? "size-4 bg-[hsl(140_71%_40%)] ring-2 ring-[hsl(140_71%_40%)]/20" :
                          done ? "size-3.5 bg-[hsl(140_71%_40%)]" :
                          "size-3.5 border-[1.5px] border-muted-foreground/30"
                        )}
                      >
                        {done && (
                          <svg className="size-1.5 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6.5L4.5 9L10 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {current && <div className="size-1.5 rounded-full bg-white" />}
                      </div>
                      {!isLast && (
                        <div className={cn("w-px h-4", done ? "bg-[hsl(140_71%_40%)]" : "bg-border/50")} />
                      )}
                    </div>
                    <p className={cn(
                      "text-[12px] leading-none pt-0.5",
                      done && "text-[hsl(140_71%_40%)] font-medium",
                      current && "text-foreground font-semibold",
                      pending && "text-muted-foreground/40"
                    )}>
                      {stage}
                    </p>
                  </div>
                )
              })}
            </div>

            {project.garmentCount > 0 && (
              <p className="mt-4 text-[11px] text-muted-foreground">
                {project.deliveredCount}/{project.garmentCount} delivered
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-border pt-8 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Anio" className="h-10 w-auto opacity-70" />
      </footer>
    </PageShell>
  )
}

/* ── Instagram-like Stories Row ─────────────────────────────────────────── */

interface Story {
  _id: string
  text?: string
  mediaUrls: string[]
  publishedAt: number
  expiresAt: number
}

function StoriesRow({ stories }: { stories: Story[] }) {
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [comment, setComment] = useState("")

  return (
    <>
      {/* Story circles */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2">
        {stories.map((story, i) => {
          const firstMedia = story.mediaUrls.length > 0 ? story.mediaUrls[0] : null
          const isVideo = firstMedia?.match(/\.(mp4|webm|mov)/i)

          return (
            <button
              key={story._id}
              onClick={() => setActiveStory(story)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="relative">
                <div className="size-14 sm:size-16 rounded-full bg-gradient-to-br from-[hsl(330_80%_60%)] via-[hsl(45_93%_58%)] to-[hsl(270_60%_60%)] p-[2.5px]">
                  <div className="size-full rounded-full bg-background p-[2px]">
                    <div className="size-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {firstMedia && isVideo ? (
                        <video
                          src={firstMedia}
                          className="size-full object-cover rounded-full"
                          muted
                          preload="metadata"
                        />
                      ) : firstMedia ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firstMedia}
                          alt=""
                          className="size-full object-cover rounded-full"
                        />
                      ) : story.text ? (
                        <span className="text-[11px] font-semibold text-foreground/70 px-1 text-center leading-tight line-clamp-2">
                          {story.text.slice(0, 20)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Play icon overlay for video stories */}
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-5 rounded-full bg-black/50 flex items-center justify-center">
                      <svg width="8" height="10" viewBox="0 0 8 10" fill="white">
                        <path d="M0 0L8 5L0 10V0Z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground max-w-[56px] sm:max-w-[64px] truncate text-center">
                {timeAgo(story.publishedAt)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Story viewer overlay */}
      {activeStory && (
        <StoryViewer
          story={activeStory}
          comment={comment}
          setComment={setComment}
          onClose={() => { setActiveStory(null); setComment("") }}
        />
      )}
    </>
  )
}

/* ── Story Viewer (fullscreen overlay like Instagram) ───────────────────── */

function StoryViewer({
  story,
  comment,
  setComment,
  onClose,
}: {
  story: Story
  comment: string
  setComment: (v: string) => void
  onClose: () => void
}) {
  const [commentSent, setCommentSent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const handleSendComment = () => {
    if (!comment.trim()) return
    setCommentSent(true)
    setComment("")
    setTimeout(() => setCommentSent(false), 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 sm:p-4" onClick={onClose}>
      <div
        className="relative w-full h-full sm:h-auto sm:max-w-[420px] sm:max-h-[85vh] flex flex-col sm:rounded-2xl overflow-hidden bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex size-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="absolute top-2 left-4 right-4 h-0.5 rounded-full bg-white/20 z-10">
          <div className="h-full w-full rounded-full bg-white animate-[progress_5s_linear]" />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center min-h-[300px] p-6">
          {story.mediaUrls.length > 0 ? (
            story.mediaUrls[0].includes("video") ? (
              <video
                src={story.mediaUrls[0]}
                className="max-h-full max-w-full rounded-lg"
                controls
                autoPlay
                muted
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.mediaUrls[0]}
                alt="Story"
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            )
          ) : (
            <div className="text-center px-8">
              <p className="text-white text-[18px] leading-[28px]">
                {story.text}
              </p>
            </div>
          )}
        </div>

        {/* Caption if there's media + text */}
        {story.mediaUrls.length > 0 && story.text && (
          <div className="px-5 pb-3">
            <p className="text-white/90 text-[14px] leading-[20px]">{story.text}</p>
          </div>
        )}

        {/* Comment input */}
        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
          {commentSent ? (
            <p className="text-[13px] text-white/70 flex-1">Comment sent ✓</p>
          ) : (
            <>
              <input
                ref={inputRef}
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendComment() }}
                placeholder="Send a comment..."
                className="h-[36px] flex-1 rounded-full border border-white/20 bg-white/10 px-4 text-[13px] text-white placeholder:text-white/40 outline-none"
              />
              <button
                onClick={handleSendComment}
                disabled={!comment.trim()}
                className="h-[36px] rounded-full bg-primary px-4 text-[12px] font-medium text-primary-foreground disabled:opacity-40"
              >
                Send
              </button>
            </>
          )}
        </div>

        {/* Timestamp */}
        <div className="px-5 pb-3">
          <p className="text-[11px] text-white/40">{timeAgo(story.publishedAt)}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Journey Section — tabbed + collapsible ─────────────────────────────── */

interface JourneyProps {
  timeline: { _id: string; type: string; summary: string; createdAt: number }[]
  financials: { quotedTotal: number; received: number; balance: number; status: string } | null
}

function JourneySection({ timeline, financials }: JourneyProps) {
  const [tab, setTab] = useState<"history" | "payments">("history")
  const [expanded, setExpanded] = useState(false)

  const reversedTimeline = [...timeline].reverse()
  const VISIBLE_COUNT = 3
  const visibleEvents = expanded ? reversedTimeline : reversedTimeline.slice(0, VISIBLE_COUNT)
  const hasMore = reversedTimeline.length > VISIBLE_COUNT

  // Separate payment events from history
  const paymentEvents = reversedTimeline.filter(
    (e) => e.type.includes("Payment") || e.type.includes("Deposit")
  )
  const historyEvents = reversedTimeline.filter(
    (e) => !e.type.includes("Payment") && !e.type.includes("Deposit")
  )

  const displayedHistory = expanded ? historyEvents : historyEvents.slice(0, VISIBLE_COUNT)
  const hasMoreHistory = historyEvents.length > VISIBLE_COUNT

  return (
    <section>
      <p className="eyebrow mb-4 text-muted-foreground">Journey</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 rounded-full bg-muted p-1 w-fit">
        {(["history", "payments"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "h-[32px] rounded-full px-4 text-[12px] font-medium transition-colors",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "history" ? "History" : "Payment History"}
          </button>
        ))}
      </div>

      {/* History tab */}
      {tab === "history" && (
        <>
          {historyEvents.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">
              Milestones will appear here as work progresses.
            </p>
          ) : (
            <div className="flex flex-col">
              {displayedHistory.map((e, i, arr) => (
                <div key={e._id} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1.5">
                    <div className={cn("size-2 shrink-0 rounded-full", i === 0 ? "bg-primary" : "bg-muted-foreground/30")} />
                    {i < arr.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className={i < arr.length - 1 ? "pb-4" : ""}>
                    <p className="text-[13px] font-medium text-foreground">{e.type}</p>
                    <p className="mt-0.5 text-[12px] leading-[18px] text-muted-foreground">{e.summary}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground/50">{dateOf(e.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {hasMoreHistory && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 text-[12px] font-medium text-primary hover:underline"
            >
              {expanded ? "Show less" : `Show ${historyEvents.length - VISIBLE_COUNT} more`}
            </button>
          )}
        </>
      )}

      {/* Payments tab */}
      {tab === "payments" && (
        <>
          {paymentEvents.length === 0 ? (
            <p className="text-[14px] text-muted-foreground">
              Payment records will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {paymentEvents.map((e) => (
                <div key={e._id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{e.type}</p>
                    <p className="text-[12px] text-muted-foreground">{e.summary}</p>
                  </div>
                  <p className="shrink-0 font-mono text-[11px] text-muted-foreground/60">{dateOf(e.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

/* ── Booking Form ──────────────────────────────────────────────────────── */

function BookingForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState("Consultation")
  const [preferredDate, setPreferredDate] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const CLIENT_TYPES = [
    { value: "Consultation", label: "Consultation" },
    { value: "Fitting", label: "Fitting" },
    { value: "Pickup", label: "Collection" },
  ]

  if (submitted) {
    return (
      <div className="rounded-xl bg-background border border-border p-4">
        <p className="text-[14px] font-medium text-foreground mb-1">Request sent ✓</p>
        <p className="text-[12px] text-muted-foreground">
          We&apos;ll confirm your appointment shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-background border border-border p-4">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="h-[40px] w-full rounded-full border border-border bg-background px-3 text-[13px] text-foreground outline-none">
              {CLIENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">Preferred Date</label>
            <input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className="h-[40px] w-full rounded-full border border-border bg-background px-3 text-[13px] text-foreground outline-none" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">Message (optional)</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Any preferences..." className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSubmitted(true)} className="h-[38px] flex-1 rounded-full bg-primary text-[13px] font-medium text-primary-foreground">Send Request</button>
          <button onClick={onClose} className="h-[38px] rounded-full border border-border px-4 text-[13px] font-medium text-foreground hover:bg-muted">Cancel</button>
        </div>
      </div>
    </div>
  )
}

/* ── Page Shell ────────────────────────────────────────────────────────── */

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-[900px]">
        {children}
      </div>
    </div>
  )
}
