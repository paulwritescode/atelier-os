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
  Active:    "#4B1E2A",
  Draft:     "#C8A46B",
  Completed: "#2E6B4E",
  OnHold:    "#5C5852",
  Archived:  "#E7E2DB",
}
const STATUS_TEXT: Record<ProjectStatus, string> = {
  Active:    "#FFFFFF",
  Draft:     "#FFFFFF",
  Completed: "#FFFFFF",
  OnHold:    "#FFFFFF",
  Archived:  "#1B1A17",
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
        className="flex w-full items-center gap-4 rounded-3xl border p-4 text-left transition-shadow hover:shadow-[0_2px_8px_rgba(20,20,19,0.06)]"
        style={{
          background: "#FFFFFF",
          borderColor: "#E9E3DB",
        }}
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
          <p
            className="text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: "#C8A46B" }}
          >
            {TYPE_LABELS[project.type]}
          </p>
          <p
            className="font-heading truncate text-[16px] font-semibold"
            style={{ color: "#1B1A17" }}
          >
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
      className="group flex w-full flex-col overflow-hidden rounded-3xl border text-left transition-shadow hover:shadow-[0_8px_24px_rgba(20,20,19,0.08)]"
      style={{
        background: "#FFFFFF",
        borderColor: "#E9E3DB",
        boxShadow: "0 2px 8px rgba(20,20,19,0.06)",
        minHeight: "360px",
      }}
    >
      {/* ── Hero Image — 170px, full width, object-cover ─────────────── */}
      <div className="relative h-[170px] w-full overflow-hidden">
        <Image
          src={TYPE_IMAGES[project.type]}
          alt={`${TYPE_LABELS[project.type]} project photography`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
        />

        {/* Status badge — top-right, 16px inset */}
        <span
          className="absolute top-4 right-4 rounded-full px-4 py-1.5 text-[12px] font-medium"
          style={{
            background: STATUS_BG[project.status],
            color: STATUS_TEXT[project.status],
          }}
        >
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* ── Content area — 24px padding ──────────────────────────────── */}
      <div className="flex flex-1 flex-col p-6">
        {/* Category eyebrow — gold, uppercase, 11px, 700, +8% ls */}
        <p
          className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: "#C8A46B" }}
        >
          {TYPE_LABELS[project.type]}
        </p>

        {/* Project name — Playfair Display, 28px, 600 */}
        <h3
          className="font-heading mb-2"
          style={{
            fontSize: "28px",
            fontWeight: 600,
            lineHeight: "36px",
            color: "#1B1A17",
          }}
        >
          {project.title}
        </h3>

        {/* Description — Inter, 14px, 400, max 2 lines */}
        {project.notes && (
          <p
            className="mb-auto line-clamp-2 text-[14px] leading-[22px]"
            style={{ color: "#5C5852" }}
          >
            {project.notes}
          </p>
        )}

        {/* ── Footer — delivery date + member count ────────────────── */}
        <div
          className="mt-4 flex items-center gap-4 border-t pt-4 text-[12px]"
          style={{ borderColor: "#E7E2DB", color: "#8C857D" }}
        >
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
