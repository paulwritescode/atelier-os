"use client"

import React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar, Users } from "@hugeicons/core-free-icons"
import type { Doc } from "@convex/_generated/dataModel"
import type { ProjectStatus, ProjectType } from "@/lib/types"

interface ProjectCardProps {
  project: Doc<"projects">
  primaryClientName: string
  viewMode: "grid" | "list"
  onClick: () => void
}

// ── Status badge colours per spec §7 ─────────────────────────────────────
const STATUS_BG: Record<ProjectStatus, string> = {
  Active:    "hsl(345 60% 28%)",
  Draft:     "hsl(45 93% 58%)",
  Completed: "hsl(140 38% 30%)",
  OnHold:    "hsl(0 0% 46%)",
  Archived:  "hsl(0 0% 91%)",
}
const STATUS_TEXT: Record<ProjectStatus, string> = {
  Active:    "#FFFFFF",
  Draft:     "#FFFFFF",
  Completed: "#FFFFFF",
  OnHold:    "#FFFFFF",
  Archived:  "hsl(40 5% 10%)",
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
  const openedDate = new Date(project.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  // ── List view ───────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-4 rounded-xs bg-card p-4 text-left transition-colors"
      >
        {/* Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
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
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-gold">
            {TYPE_LABELS[project.type]}
          </p>
          <p className="font-heading truncate text-[16px] font-semibold text-foreground">
            {project.title}
          </p>
        </div>

        {/* Status badge */}
        <span
          className="shrink-0 rounded-full px-4 py-1 text-[12px] font-medium"
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

  // ── Grid view — spec §9 ─────────────────────────────────────────────────
  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-xs bg-card text-left transition-shadow"
      style={{ minHeight: "360px" }}
    >
      {/* ── Hero Image — 170px, full width, object-cover ─────────────── */}
      <div className="relative h-[170px] w-full overflow-hidden rounded-xs">
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

      {/* ── Content area ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col pt-3">
        {/* Project name */}
        <h3 className="font-heading mb-1 text-[28px] font-semibold leading-[36px] text-foreground">
          {project.title}
        </h3>

        {/* Description — max 2 lines */}
        {project.notes && (
          <p className="mb-auto line-clamp-2 text-[14px] leading-[22px] text-muted-foreground">
            {project.notes}
          </p>
        )}

        {/* ── Footer — delivery date + member count ────────────────── */}
        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Calendar} className="size-4" />
            <span>Opened {openedDate}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <HugeiconsIcon icon={Users} className="size-4 shrink-0" />
            <span className="truncate">{primaryClientName}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
