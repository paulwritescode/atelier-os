"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Briefcase,
  CreditCard,
  Users,
  Scissors,
  Calendar,
  Clock,
  FileText,
  Archive02Icon,
  Cancel01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ProjectStatus } from "@/lib/types"

// ── Tab definitions for the project sidebar ───────────────────────────────────
export type ProjectTabId =
  | "commission"
  | "financials"
  | "participants"
  | "measurements"
  | "production"
  | "appointments"
  | "timeline"
  | "stories"
  | "documents"

interface SidebarNavItem {
  id: ProjectTabId
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
}

const NAV_ITEMS: SidebarNavItem[] = [
  { id: "commission", label: "Commission", icon: Briefcase },
  { id: "financials", label: "Financials", icon: CreditCard },
  { id: "participants", label: "Participants", icon: Users },
  { id: "measurements", label: "Measurements", icon: Scissors },
  { id: "production", label: "Production", icon: Scissors },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "stories", label: "Updates", icon: FileText },
  { id: "documents", label: "Documents", icon: FileText },
]

interface ProjectSidebarProps {
  projectTitle: string
  projectType: string
  projectStatus: ProjectStatus
  activeTab: ProjectTabId
  onTabChange: (tab: ProjectTabId) => void
  collapsed: boolean
  onToggleCollapse: () => void
  onArchive?: () => void
  onRemove?: () => void
}

export function ProjectSidebar({
  projectTitle,
  projectType,
  projectStatus,
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  onArchive,
  onRemove,
}: ProjectSidebarProps) {
  const router = useRouter()
  const projects = useQuery(api.projects.list)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleProjectSelect = (slug: string) => {
    setDropdownOpen(false)
    router.push(`/projects/${slug}`)
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r transition-all duration-300 h-full bg-card/50 relative rounded-l-2xl",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Project Selector ────────────────────────────────────────────── */}
      <div
        className={cn(
          "border-b border-border transition-all duration-300 relative",
          collapsed ? "p-2" : "p-3"
        )}
      >
        <button
          onClick={() => !collapsed && setDropdownOpen(!dropdownOpen)}
          className={cn(
            "flex w-full items-center transition-all duration-300 rounded-lg",
            collapsed ? "justify-center" : "gap-3 hover:bg-muted px-2 py-1.5",
            !collapsed && "cursor-pointer"
          )}
          title={collapsed ? projectTitle : undefined}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Briefcase} className="size-4 text-foreground" />
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <h2 className="truncate text-sm font-semibold text-foreground">
                  {projectTitle}
                </h2>
                <p className="truncate text-[11px] text-muted-foreground">
                  {projectType}
                </p>
              </div>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform",
                  dropdownOpen && "rotate-180"
                )}
              />
            </>
          )}
        </button>

        {/* Dropdown list of projects */}
        {dropdownOpen && !collapsed && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute left-2 right-2 top-full z-50 mt-1 max-h-[300px] overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
              {projects === undefined ? (
                <div className="px-3 py-4 text-center text-[13px] text-muted-foreground">
                  Loading…
                </div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-4 text-center text-[13px] text-muted-foreground">
                  No projects
                </div>
              ) : (
                projects.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleProjectSelect(p.slug)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-muted",
                      p.title === projectTitle && "bg-muted font-medium"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{p.title}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{p.type}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Back button ─────────────────────────────────────────────────── */}
      <div className="border-b border-border">
        <button
          onClick={() => router.push("/projects")}
          className={cn(
            "flex w-full items-center rounded-none py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed ? "justify-center px-2" : "gap-2 px-4"
          )}
          title={collapsed ? "Back to Commissions" : undefined}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 shrink-0" />
          {!collapsed && <span>Back to Commissions</span>}
        </button>
      </div>

      {/* ── Collapse Toggle ─────────────────────────────────────────────── */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full bg-card border border-glass-border text-muted-foreground hover:text-foreground"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={cn("transition-transform", collapsed && "rotate-180")}
        >
          <path
            d="M7.5 9L4.5 6L7.5 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto">
        <div
          className={cn(
            "space-y-1 transition-all duration-300",
            collapsed ? "p-1" : "p-2"
          )}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex w-full items-center rounded-lg text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title={collapsed ? item.label : undefined}
              >
                <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* ── Administrative Actions (Archive, Remove) ──────────────────────── */}
      <div className="border-t border-border">
        <div
          className={cn(
            "space-y-1 transition-all duration-300",
            collapsed ? "p-1" : "p-2"
          )}
        >
          {projectStatus !== "Archived" && onArchive && (
            <button
              onClick={onArchive}
              className={cn(
                "flex w-full items-center rounded-lg text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={collapsed ? "Archive" : undefined}
            >
              <HugeiconsIcon icon={Archive02Icon} className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">Archive</span>}
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className={cn(
                "flex w-full items-center rounded-lg text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                "text-destructive hover:bg-destructive/10"
              )}
              title={collapsed ? "Remove" : undefined}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">Remove</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
