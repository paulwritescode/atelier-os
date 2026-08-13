"use client"

import React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Users } from "@hugeicons/core-free-icons"
import type { Doc } from "@convex/_generated/dataModel"
import type { ProjectStatus, ProjectType } from "@/lib/types"

interface ProjectCardProps {
  project: Doc<"projects">
  primaryClientName: string
  viewMode: "grid" | "list"
  onClick: () => void
}

// ── Status badge colours — Figma semantic colors ─────────────────────────
const STATUS_BG: Record<ProjectStatus, string> = {
  Active:    "hsl(140 71% 40%)",  // Green for active
  Draft:     "hsl(45 93% 58%)",   // Yellow/gold for draft
  Completed: "hsl(220 30% 40%)",  // Blue for completed
  OnHold:    "hsl(30 60% 50%)",   // Orange for on hold
  Archived:  "hsl(0 0% 60%)",     // Gray for archived
}
const STATUS_TEXT: Record<ProjectStatus, string> = {
  Active:    "#FFFFFF",
  Draft:     "#FFFFFF",
  Completed: "#FFFFFF",
  OnHold:    "#FFFFFF",
  Archived:  "#FFFFFF",
}
const STATUS_LABELS: Record<ProjectStatus, string> = {
  Draft:     "Draft",
  Active:    "Active",
  OnHold:    "On Hold",
  Completed: "Completed",
  Archived:  "Archived",
}

// ── Category labels (eyebrow) ─────────────────────────────────────────────
const TYPE_LABELS: Record<ProjectType, string> = {
  Wedding:      "WEDDING",
  Corporate:    "CORPORATE",
  Individual:   "INDIVIDUAL",
  ClosetRevamp: "CLOSET REVAMP",
  GalaOutfit:   "GALA OUTFIT",
  Photoshoot:   "PHOTOSHOOT",
  Alteration:   "ALTERATION",
}

// ── Card hero images by project type ──────────────────────────────────────
const TYPE_IMAGES: Record<ProjectType, string> = {
  Wedding:      "/hero-scissors-linen.jpg",
  Corporate:    "/project-corporate-fabrics.jpg",
  Individual:   "/project-individual-suit.jpg",
  ClosetRevamp: "/atelier-cutting-table.jpg",
  GalaOutfit:   "/hero-scissors-linen.jpg",
  Photoshoot:   "/atelier-cutting-table.jpg",
  Alteration:   "/project-individual-suit.jpg",
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  primaryClientName,
  viewMode,
  onClick,
}) => {

  // ── List view ───────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-4 rounded-lg border border-hairline bg-canvas p-4 text-left transition-all hover:shadow-soft"
      >
        {/* Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
          <Image
            src={TYPE_IMAGES[project.type]}
            alt=""
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="eyebrow text-ink">
            {TYPE_LABELS[project.type]}
          </p>
          <p className="body-sm font-semibold text-foreground truncate">
            {project.title}
          </p>
        </div>

        {/* Status badge */}
        <span
          className="shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium"
          style={{
            background: STATUS_BG[project.status],
            color: STATUS_TEXT[project.status],
          }}
        >
          {STATUS_LABELS[project.status]}
        </span>
      </button>
    )
  }

  // ── Grid view — Figma design system ─────────────────────────────────────
  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-lg border border-hairline bg-canvas text-left transition-all hover:shadow-soft"
      style={{ minHeight: "360px" }}
    >
      {/* ── Hero Image — 170px, full width, object-cover ─────────────── */}
      <div className="relative h-[170px] w-full overflow-hidden rounded-lg">
        <Image
          src={TYPE_IMAGES[project.type]}
          alt={`${TYPE_LABELS[project.type]} project photography`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
        />

        {/* Overlay badges — commission type (left) + status (right) */}
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
            {TYPE_LABELS[project.type]}
          </span>
          <span
            className="rounded-full px-4 py-1.5 text-[12px] font-medium"
            style={{
              background: STATUS_BG[project.status],
              color: STATUS_TEXT[project.status],
            }}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>
      </div>

      {/* ── Content area — padding per Figma spec ─────────────────────────── */}
      <div className="flex flex-1 flex-col px-6 py-4">
        {/* Eyebrow — figmaMono uppercase, positive tracking */}
        <p className="eyebrow text-ink mb-2">
          {TYPE_LABELS[project.type]}
        </p>

        {/* Project name — headline weight */}
        <h3 className="headline text-foreground mb-3">
          {project.title}
        </h3>

        {/* Description — body copy, weight 330 */}
        {project.notes && (
          <p className="body-sm text-muted-foreground mb-auto line-clamp-2">
            {project.notes}
          </p>
        )}

        {/* ── Footer — client with hairline divider ────────────────────────── */}
        <div className="mt-4 flex items-center gap-3 border-t border-hairline pt-4 text-[12px] text-muted-foreground">
          <HugeiconsIcon icon={Users} className="size-4 shrink-0" />
          <span className="truncate font-[330]">{primaryClientName}</span>
        </div>
      </div>
    </button>
  )
}
