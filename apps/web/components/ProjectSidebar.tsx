"use client"

import React from "react"
import { useRouter } from "next/navigation"
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
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

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
  { id: "stories", label: "Stories", icon: FileText },
  { id: "documents", label: "Documents", icon: FileText },
]

interface ProjectSidebarProps {
  projectTitle: string
  projectType: string
  activeTab: ProjectTabId
  onTabChange: (tab: ProjectTabId) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function ProjectSidebar({
  projectTitle,
  projectType,
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}: ProjectSidebarProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        "flex flex-col border-r transition-all duration-300 h-full bg-card/50 relative rounded-l-2xl",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Project Header ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "border-b border-border transition-all duration-300",
          collapsed ? "p-2" : "p-3"
        )}
      >
        <div
          className={cn(
            "flex items-center transition-all duration-300",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Briefcase} className="size-4 text-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-foreground">
                {projectTitle}
              </h2>
              <p className="truncate text-[11px] text-muted-foreground">
                {projectType}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Back button ─────────────────────────────────────────────────── */}
      <div className="border-b border-border">
        <button
          onClick={() => router.push("/")}
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
    </div>
  )
}
