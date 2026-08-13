"use client"

import React from "react"

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

interface StepIndicatorProps {
  currentStep: LifecycleStep
  completedSteps?: LifecycleStep[]
}

const STEPS: LifecycleStep[] = [
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

export function StepIndicator({ currentStep, completedSteps = [] }: StepIndicatorProps) {
  const currentIndex = STEPS.indexOf(currentStep)
  const completedIndices = completedSteps.map(s => STEPS.indexOf(s)).filter(i => i !== -1)

  return (
    <div className="w-full">
      {/* Desktop horizontal layout */}
      <div className="hidden sm:flex items-center gap-1">
        {STEPS.map((step, index) => {
          const isCompleted = completedIndices.includes(index)
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex

          return (
            <React.Fragment key={step}>
              {/* Step circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted || isCurrent
                      ? "bg-brand-burgundy text-white"
                      : "bg-muted text-muted-foreground border border-hairline"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="text-[10px] font-medium text-center mt-1 max-w-[60px] truncate">
                  {step}
                </div>
              </div>

              {/* Connector line (not after last step) */}
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 transition-colors ${
                    isCompleted
                      ? "bg-brand-burgundy"
                      : "bg-hairline"
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Mobile vertical layout */}
      <div className="sm:hidden flex flex-col gap-3">
        {STEPS.map((step, index) => {
          const isCompleted = completedIndices.includes(index)
          const isCurrent = index === currentIndex

          return (
            <div key={step} className="flex items-start gap-3">
              {/* Step circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  isCompleted || isCurrent
                    ? "bg-brand-burgundy text-white"
                    : "bg-muted text-muted-foreground border border-hairline"
                }`}
              >
                {index + 1}
              </div>

              {/* Step label and connecting line */}
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{step}</div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-px h-8 mt-2 transition-colors ${
                      isCompleted
                        ? "bg-brand-burgundy"
                        : "bg-hairline"
                    }`}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
