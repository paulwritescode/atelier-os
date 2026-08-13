"use client"

/**
 * LifecycleRail — interactive vertical progress indicator for the project lifecycle.
 * Clicking the current step marks it as complete and advances to the next stage.
 * Changes persist to the database via Convex mutation.
 */
import React from "react"
import { cn } from "@/lib/utils"

export type LifecycleStep =
  | "Lead"
  | "Consultation"
  | "Design"
  | "Quotation"
  | "Deposit"
  | "Measurements"
  | "Production"
  | "Fitting"
  | "Final Payment"
  | "Delivery"
  | "Completed"

export const LIFECYCLE_STEPS: LifecycleStep[] = [
  "Lead",
  "Consultation",
  "Design",
  "Quotation",
  "Deposit",
  "Measurements",
  "Production",
  "Fitting",
  "Final Payment",
  "Delivery",
  "Completed",
]

interface LifecycleRailProps {
  /** Index of the current lifecycle stage (0-based) */
  currentStageIndex: number
  /** Whether the sidebar is collapsed — hides labels, shows tooltips */
  collapsed?: boolean
  /** Called when user clicks the current step to mark it done */
  onAdvance?: (completedStep: LifecycleStep) => void
  /** Whether the project is locked (Completed/Archived) */
  isLocked?: boolean
}

export function LifecycleRail({
  currentStageIndex,
  collapsed = false,
  onAdvance,
  isLocked = false,
}: LifecycleRailProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start py-4 h-full justify-center",
        collapsed ? "pl-4 pr-2" : "pl-5 pr-3"
      )}
    >
      {LIFECYCLE_STEPS.map((step, index) => {
        const isCompleted = index < currentStageIndex
        const isCurrent = index === currentStageIndex
        const isPending = index > currentStageIndex
        const isLast = index === LIFECYCLE_STEPS.length - 1
        const canClick = isCurrent && !isLocked && !!onAdvance

        return (
          <div key={step} className="flex flex-col items-start">
            {/* Step row: circle + label */}
            <button
              type="button"
              disabled={!canClick}
              onClick={() => {
                if (canClick) onAdvance(step)
              }}
              className={cn(
                "relative flex items-center gap-2.5 group",
                canClick && "cursor-pointer",
                !canClick && "cursor-default"
              )}
              title={
                canClick
                  ? `Mark "${step}" as done`
                  : isCompleted
                    ? `${step} — completed`
                    : isPending
                      ? `${step} — upcoming`
                      : undefined
              }
            >
              {/* Circle indicator */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all duration-300 shrink-0",
                  isCurrent ? "w-5 h-5" : "w-4 h-4",
                  // Completed
                  isCompleted && "bg-[hsl(140_71%_40%)]",
                  // Current — clickable appearance
                  isCurrent && !isLocked && "bg-[hsl(140_71%_40%)] ring-2 ring-[hsl(140_71%_40%)]/20 hover:ring-[hsl(140_71%_40%)]/40 hover:scale-110 transition-transform",
                  isCurrent && isLocked && "bg-[hsl(140_71%_40%)] ring-2 ring-[hsl(140_71%_40%)]/20",
                  // Pending
                  isPending && "bg-transparent border-[1.5px] border-[hsl(0_0%_78%)]"
                )}
              >
                {/* Checkmark for completed */}
                {isCompleted && (
                  <svg
                    className="w-2 h-2 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6.5L4.5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {/* Inner dot for current — becomes checkmark on hover when clickable */}
                {isCurrent && !isLocked && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-white group-hover:hidden" />
                    <svg
                      className="w-2.5 h-2.5 text-white hidden group-hover:block"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6.5L4.5 9L10 3"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
                {isCurrent && isLocked && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>

              {/* Label — left-aligned next to circle */}
              {!collapsed && (
                <span
                  className={cn(
                    "text-[12px] leading-none whitespace-nowrap select-none transition-colors",
                    isCompleted && "text-[hsl(140_71%_40%)] font-medium",
                    isCurrent && "text-foreground font-semibold",
                    isPending && "text-muted-foreground/50"
                  )}
                >
                  {step}
                </span>
              )}

              {/* Tooltip on hover when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden group-hover:block z-50">
                  <div className="bg-popover text-popover-foreground border border-border rounded-md px-2 py-1 text-[11px] font-medium shadow-md whitespace-nowrap">
                    {step}
                    {isCurrent && (isLocked ? " (current)" : " — click to complete")}
                    {isCompleted && " ✓"}
                  </div>
                </div>
              )}
            </button>

            {/* Connector line — left-aligned under the circle */}
            {!isLast && (
              <div
                className={cn(
                  "transition-all duration-300",
                  "w-px h-3",
                  isCurrent ? "ml-[9px]" : "ml-[7px]",
                  isCompleted && "bg-[hsl(140_71%_40%)]",
                  isCurrent && "bg-gradient-to-b from-[hsl(140_71%_40%)]/40 to-[hsl(0_0%_78%)]/30",
                  isPending && "bg-transparent"
                )}
                style={
                  isPending
                    ? {
                        backgroundImage:
                          "repeating-linear-gradient(to bottom, hsl(0 0% 78% / 0.4) 0px, hsl(0 0% 78% / 0.4) 2px, transparent 2px, transparent 4px)",
                      }
                    : undefined
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
