"use client"

/**
 * Public commission view.
 *
 * Reached via a share link. Either fully public or gated by a PIN the owner
 * set. Shows progress, updates and headline figures — never internal notes,
 * staff names or the cost breakdown.
 */
import React, { use, useState } from "react"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { ProjectStatus, ProjectType } from "@/lib/types"

const S = {
  ink: "hsl(0 0% 9%)",
  muted: "hsl(0 0% 45%)",
  body: "hsl(0 0% 34%)",
  gold: "hsl(45 93% 58%)",
  burgundy: "hsl(345 60% 28%)",
  stone: "hsl(30 20% 88%)",
  white: "hsl(0 0% 100%)",
  ivory: "hsl(35 38% 95%)",
  softIvory: "hsl(33 30% 93%)",
  inputBorder: "hsl(35 25% 84%)",
  green: "hsl(153 40% 30%)",
  cardShadow: "0 2px 8px hsl(45 3% 8% / 0.06)",
}

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
  Completed: "Your commission is complete.",
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

function hoursSince(ms: number): number {
  return Math.floor((new Date().getTime() - ms) / (1000 * 60 * 60))
}

export default function SharedCommissionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const [pinInput, setPinInput] = useState("")
  const [submittedPin, setSubmittedPin] = useState<string | undefined>(undefined)

  const meta = useQuery(api.projects.getShareMeta, { slug })
  // Only fetch the body once we know whether a PIN is needed.
  const project = useQuery(
    api.projects.getSharedProject,
    meta?.available ? { slug, pin: submittedPin } : "skip"
  )

  // ── Loading ─────────────────────────────────────────────────────────────
  if (meta === undefined) {
    return (
      <Frame>
        <div className="flex flex-col items-center gap-4 py-20">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: S.stone, borderTopColor: S.burgundy }}
          />
        </div>
      </Frame>
    )
  }

  // ── Link is off or does not exist ───────────────────────────────────────
  if (!meta.available) {
    return (
      <Frame>
        <Card className="py-16 text-center">
          <h1
            className="font-heading mb-2 text-[26px] font-semibold"
            style={{ color: S.ink }}
          >
            This link is not available
          </h1>
          <p className="mx-auto max-w-[380px] text-[14px] leading-[22px]" style={{ color: S.muted }}>
            The commission may no longer be shared. Please contact Anio Regalia for an
            up-to-date link.
          </p>
        </Card>
      </Frame>
    )
  }

  // ── PIN gate ────────────────────────────────────────────────────────────
  const needsPin = meta.requiresPin && (submittedPin === undefined || project === null)

  if (needsPin) {
    const wrongPin = submittedPin !== undefined && project === null
    return (
      <Frame>
        <Card>
          <p
            className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: S.gold }}
          >
            Protected
          </p>
          <h1
            className="font-heading mb-2 text-[26px] font-semibold"
            style={{ color: S.ink }}
          >
            Enter your PIN
          </h1>
          <p className="mb-6 text-[14px] leading-[22px]" style={{ color: S.muted }}>
            Anio Regalia shared this commission with a PIN.
          </p>

          {wrongPin && (
            <div
              className="mb-5 rounded-xl px-4 py-3 text-[13px] font-medium"
              style={{ background: "hsl(0 86% 97%)", color: "hsl(0 50% 37%)" }}
            >
              That PIN did not match. Try again.
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              setSubmittedPin(pinInput.trim())
            }}
          >
            <input
              type="text"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Your PIN"
              className="mb-4 h-[44px] w-full rounded-full border px-4 text-center font-mono text-[16px] tracking-[0.25em] outline-none focus:border-[hsl(45_93%_58%)]"
              style={{ background: S.ivory, borderColor: S.inputBorder, color: S.ink }}
            />
            <button
              type="submit"
              className="h-[44px] w-full rounded-full text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: S.burgundy }}
            >
              View commission
            </button>
          </form>
        </Card>
      </Frame>
    )
  }

  if (project === undefined || project === null) {
    return (
      <Frame>
        <div className="flex flex-col items-center gap-4 py-20">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: S.stone, borderTopColor: S.burgundy }}
          />
        </div>
      </Frame>
    )
  }

  // ── The commission ──────────────────────────────────────────────────────
  const stageIndex = LIFECYCLE.findIndex((s) =>
    project.status === "Completed" || project.status === "Archived"
      ? s === "Completed"
      : s === "Production"
  )

  return (
    <Frame wide>
      {/* Heading */}
      <div className="mb-10">
        <p
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: S.gold }}
        >
          {TYPE_LABEL[project.type as ProjectType]}
          {project.clientName ? ` · ${project.clientName}` : ""}
        </p>
        <h1
          className="font-heading mb-3 text-[40px] font-semibold leading-tight"
          style={{ color: S.ink }}
        >
          {project.title}
        </h1>
        <p className="text-[16px]" style={{ color: S.body }}>
          {STATUS_COPY[project.status as ProjectStatus]}
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <p
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: S.gold }}
        >
          Progress
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LIFECYCLE.map((stage, i) => {
            const done = i < stageIndex
            const current = i === stageIndex
            return (
              <span
                key={stage}
                className="rounded-full px-3 py-1.5 text-[12px] font-medium"
                style={{
                  background: current ? S.burgundy : done ? S.gold : S.softIvory,
                  color: current || done ? S.white : S.muted,
                }}
              >
                {stage}
              </span>
            )
          })}
        </div>
        {project.garmentCount > 0 && (
          <p className="mt-4 text-[13px]" style={{ color: S.muted }}>
            {project.deliveredCount} of {project.garmentCount} garment
            {project.garmentCount === 1 ? "" : "s"} delivered
          </p>
        )}
      </Card>

      {/* Updates */}
      {project.stories.length > 0 && (
        <Card className="mb-6">
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: S.gold }}
          >
            Latest from the atelier
          </p>
          <div className="flex flex-col gap-4">
            {project.stories.map((s) => (
              <div
                key={s._id}
                className="rounded-xs border p-4"
                style={{ background: S.ivory, borderColor: S.stone }}
              >
                {s.text && (
                  <p className="text-[15px] leading-[24px]" style={{ color: S.ink }}>
                    {s.text}
                  </p>
                )}
                <p className="mt-2 text-[12px]" style={{ color: S.muted }}>
                  {hoursSince(s.publishedAt) === 0
                    ? "Just now"
                    : `${hoursSince(s.publishedAt)}h ago`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Figures — headline only */}
      {project.financials && (
        <Card className="mb-6">
          <p
            className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: S.gold }}
          >
            Summary
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Total", value: project.financials.quotedTotal },
              { label: "Paid", value: project.financials.received },
              { label: "Balance", value: project.financials.balance },
            ].map((f) => (
              <div key={f.label}>
                <p
                  className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: S.muted }}
                >
                  {f.label}
                </p>
                <p
                  className="font-mono text-[18px]"
                  style={{ color: S.ink, fontVariantNumeric: "tabular-nums" }}
                >
                  {money(f.value)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px]" style={{ color: S.muted }}>
            Contact Anio Regalia for a detailed quotation.
          </p>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <p
          className="mb-5 text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: S.gold }}
        >
          Journey
        </p>
        {project.timeline.length === 0 ? (
          <p className="text-[14px]" style={{ color: S.muted }}>
            Milestones will appear here as work progresses.
          </p>
        ) : (
          <div className="flex flex-col">
            {[...project.timeline].reverse().map((e, i, arr) => (
              <div key={e._id} className="flex gap-4">
                <div className="flex flex-col items-center pt-1.5">
                  <div
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: i === 0 ? S.burgundy : S.gold }}
                  />
                  {i < arr.length - 1 && (
                    <div className="mt-1 w-px flex-1" style={{ background: S.stone }} />
                  )}
                </div>
                <div className={i < arr.length - 1 ? "pb-6" : ""}>
                  <p className="text-[15px] font-medium" style={{ color: S.ink }}>
                    {e.type}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-[22px]" style={{ color: S.body }}>
                    {e.summary}
                  </p>
                  <p className="mt-1 text-[12px]" style={{ color: S.muted }}>
                    {dateOf(e.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="mt-10 text-center text-[12px]" style={{ color: S.muted }}>
        Anio Regalia — bespoke tailoring
      </p>
    </Frame>
  )
}

/* ── Layout helpers ─────────────────────────────────────────────────────── */

function Frame({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen px-6 py-12" style={{ background: S.ivory }}>
      <div
        className="mx-auto w-full"
        style={{ maxWidth: wide ? "760px" : "440px" }}
      >
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logo.png" alt="Anio Regalia" width={52} height={52} />
        </div>
        {children}
      </div>
    </div>
  )
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xs border p-8 ${className}`}
      style={{ background: S.white, borderColor: S.stone, boxShadow: S.cardShadow }}
    >
      {children}
    </div>
  )
}
