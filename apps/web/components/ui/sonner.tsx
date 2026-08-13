"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, InformationCircleIcon, Alert02Icon, MultiplicationSignCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"

// Solid color block toasts — no transparency.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4" />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
        ),
        error: (
          <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4" />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "!shadow-lg !border-0 !rounded-lg",
          success: "!bg-block-mint !text-ink",
          error: "!bg-block-coral !text-ink",
          warning: "!bg-block-cream !text-ink",
          info: "!bg-block-lilac !text-ink",
          loading: "!bg-block-lime !text-ink",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
