"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Share01Icon, ChevronDown } from "@hugeicons/core-free-icons"
import type { Doc } from "@convex/_generated/dataModel"
import type { ProjectStatus, ProjectType } from "@/lib/types"

const STATUS_BG: Record<ProjectStatus, string> = {
  Active: "hsl(345 60% 28%)",
  Draft: "hsl(45 93% 58%)",
  Completed: "#2E6B4E",
  OnHold: "hsl(0 0% 46%)",
  Archived: "hsl(0 0% 91%)",
}
const STATUS_FG: Record<ProjectStatus, string> = {
  Active: "#FFFFFF",
  Draft: "hsl(0 0% 9%)",
  Completed: "#FFFFFF",
  OnHold: "#FFFFFF",
  Archived: "hsl(0 0% 9%)",
}
const STATUS_LABEL: Record<ProjectStatus, string> = {
  Draft: "Draft",
  Active: "Active",
  OnHold: "On Hold",
  Completed: "Completed",
  Archived: "Archived",
}
const TYPE_LABEL: Record<ProjectType, string> = {
  Wedding: "Wedding",
  Corporate: "Corporate",
  Individual: "Individual",
  ClosetRevamp: "Closet Revamp",
  GalaOutfit: "Gala Outfit",
  Photoshoot: "Photoshoot",
  Alteration: "Alteration",
}

interface ProjectHeaderProps {
  project: Doc<"projects">
  clientName?: string | null
  balance?: number
  hasQuotation?: boolean
  onStatusChange: (status: ProjectStatus) => void
  onShare: () => void
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  clientName,
  balance = 0,
  hasQuotation = false,
  onStatusChange,
  onShare,
}) => {
  return (
    <header className="shrink-0 border-b border-hairline bg-canvas px-8 py-5">
      <div className="flex items-center justify-between gap-6">
        {/* Left: Project title and breadcrumb */}
        <div className="min-w-0 flex-1">
          <p className="mb-2 eyebrow text-muted-foreground">
            {TYPE_LABEL[project.type]}
            {clientName ? ` · ${clientName}` : ""}
          </p>

          <h1 className="truncate text-[32px] font-semibold leading-tight text-foreground">
            {project.title}
          </h1>
        </div>

        {/* Right: Balance, Share, Status dropdown */}
        <div className="flex shrink-0 items-center gap-4">
          {/* Balance Display */}
          {hasQuotation && (
            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Balance
              </p>
              <p className="font-mono text-[20px] font-semibold tabular-nums text-foreground">
                KES {(balance / 100).toLocaleString()}
              </p>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={onShare}
            className="btn-secondary flex items-center gap-2"
          >
            <HugeiconsIcon icon={Share01Icon} className="size-4" />
            Share
          </button>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={project.status}
              onChange={(e) => onStatusChange(e.target.value as ProjectStatus)}
              className="appearance-none rounded-pill border border-hairline bg-canvas px-4 py-2.5 pr-8 text-[14px] font-medium text-foreground outline-none transition-colors hover:bg-surface-soft focus:ring-2 focus:ring-primary/20"
            >
              {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <HugeiconsIcon
              icon={ChevronDown}
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          {/* Status Badge */}
          <span
            className="shrink-0 rounded-full px-3 py-1 text-[12px] font-medium"
            style={{
              background: STATUS_BG[project.status],
              color: STATUS_FG[project.status],
            }}
          >
            {STATUS_LABEL[project.status]}
          </span>
        </div>
      </div>
    </header>
  )
}
