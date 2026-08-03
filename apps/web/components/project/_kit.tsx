"use client"

/**
 * Shared primitives for project workspace panels.
 * Keeps every panel visually consistent with newdesigntokens.md.
 */
import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Id } from "@convex/_generated/dataModel"

// ── Shared props every panel receives from ProjectEditor ──────────────────
export interface PanelProps {
  projectId: Id<"projects">
  staffId: Id<"staff"> | undefined
  isLocked: boolean
}

// ── Tokens ────────────────────────────────────────────────────────────────
export const T = {
  ink: "#1B1A17",
  muted: "#8C857D",
  body: "#5C5852",
  gold: "#C8A46B",
  burgundy: "#4B1E2A",
  stone: "#E7E2DB",
  white: "#FFFFFF",
  ivory: "#F6F2EC",
  softIvory: "#F3EFEA",
  inputBorder: "#E0DAD0",
  green: "#2E6B4E",
  amber: "#B8862B",
  danger: "#8C2F2F",
  cardShadow: "0 2px 8px rgba(20,20,19,.06)",
} as const

export const inputStyle: React.CSSProperties = {
  background: T.ivory,
  borderColor: T.inputBorder,
  color: T.ink,
}

// ── Card ──────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div
      className={`rounded-3xl border ${padded ? "p-6" : ""} ${className}`}
      style={{ background: T.white, borderColor: T.stone, boxShadow: T.cardShadow }}
    >
      {children}
    </div>
  )
}

// ── Eyebrow + heading ─────────────────────────────────────────────────────
export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p
            className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: T.gold }}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className="font-heading text-[28px] font-semibold leading-tight"
          style={{ color: T.ink }}
        >
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]"
      style={{ color: T.body }}
    >
      {children}
    </label>
  )
}

/** Read-only labelled value. */
export function Field({
  label,
  value,
  mono = false,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div>
      <p
        className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em]"
        style={{ color: T.muted }}
      >
        {label}
      </p>
      <p
        className={mono ? "font-mono text-[15px]" : "text-[15px]"}
        style={{
          color: T.ink,
          fontVariantNumeric: mono ? "tabular-nums" : undefined,
        }}
      >
        {value ?? "—"}
      </p>
    </div>
  )
}

// ── Buttons ───────────────────────────────────────────────────────────────
export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  full = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
  full?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[44px] items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${full ? "w-full" : ""}`}
      style={{ background: T.burgundy }}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full border px-5 text-[14px] font-medium transition-colors hover:bg-[#F3EFEA] disabled:cursor-not-allowed disabled:opacity-40"
      style={{ borderColor: "#D9D2C7", color: T.ink, background: "transparent" }}
    >
      {children}
    </button>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────
export function Badge({
  children,
  bg = T.softIvory,
  fg = T.body,
}: {
  children: React.ReactNode
  bg?: string
  fg?: string
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-medium"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  )
}

// ── States ────────────────────────────────────────────────────────────────
export function PanelLoading() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-3xl border"
          style={{ background: T.softIvory, borderColor: T.stone }}
        />
      ))}
    </div>
  )
}

export function EmptyState({
  eyebrow,
  title,
  body,
  icon,
  action,
}: {
  eyebrow?: string
  title: string
  body?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  action?: React.ReactNode
}) {
  return (
    <Card className="flex flex-col items-center py-16 text-center">
      {icon && (
        <div
          className="mb-5 flex size-14 items-center justify-center rounded-full"
          style={{ background: T.ivory }}
        >
          <HugeiconsIcon icon={icon} className="size-6" style={{ color: T.burgundy }} />
        </div>
      )}
      {eyebrow && (
        <p
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: T.gold }}
        >
          {eyebrow}
        </p>
      )}
      <h3
        className="font-heading mb-2 text-[22px] font-semibold"
        style={{ color: T.ink }}
      >
        {title}
      </h3>
      {body && (
        <p className="mb-6 max-w-[360px] text-[14px] leading-[22px]" style={{ color: T.muted }}>
          {body}
        </p>
      )}
      {action}
    </Card>
  )
}

/** Shown when a panel's prerequisite step hasn't happened yet. */
export function Blocked({ title, body }: { title: string; body: string }) {
  return (
    <Card className="py-12 text-center">
      <h3 className="font-heading mb-2 text-[20px] font-semibold" style={{ color: T.ink }}>
        {title}
      </h3>
      <p className="mx-auto max-w-[420px] text-[14px] leading-[22px]" style={{ color: T.muted }}>
        {body}
      </p>
    </Card>
  )
}

// ── Money helpers (Appendix §Currency — integers, smallest unit) ──────────
/** Format an integer minor-unit amount as KES. */
export function fmtKES(minorUnits: number): string {
  return `KES ${(minorUnits / 100).toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

/** Parse a major-unit user input string into integer minor units. */
export function parseKES(input: string): number {
  const n = Number(input)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 100)
}

// ── Date helper (Appendix §Date & Time — display in Nairobi) ──────────────
export function fmtDate(ms: number | null | undefined): string {
  if (!ms) return "—"
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  })
}

export function fmtDateTime(ms: number | null | undefined): string {
  if (!ms) return "—"
  return new Date(ms).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  })
}
