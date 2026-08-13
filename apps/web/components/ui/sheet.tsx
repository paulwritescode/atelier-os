"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

// ── Sheet Context ─────────────────────────────────────────────────────────
interface SheetContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  onOpenChange: () => {},
})

// ── Sheet Root ────────────────────────────────────────────────────────────
interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      onOpenChange?.(value)
    },
    [onOpenChange]
  )

  return (
    <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

// ── Sheet Trigger ─────────────────────────────────────────────────────────
interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
}

function SheetTrigger({ children, ...props }: SheetTriggerProps) {
  const { onOpenChange } = React.useContext(SheetContext)
  return (
    <button
      type="button"
      onClick={() => onOpenChange(true)}
      data-slot="sheet-trigger"
      {...props}
    >
      {children}
    </button>
  )
}

// ── Sheet Close ───────────────────────────────────────────────────────────
function SheetClose({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = React.useContext(SheetContext)
  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      data-slot="sheet-close"
      {...props}
    >
      {children}
    </button>
  )
}

// ── Sheet Content ─────────────────────────────────────────────────────────
interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  children: React.ReactNode
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  const { open, onOpenChange } = React.useContext(SheetContext)
  const [mounted, setMounted] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setMounted(true)
      // Trigger animation on next frame
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true)
        })
      })
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
      const timer = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!mounted) return null

  const slideClasses = {
    right: visible ? "translate-x-0" : "translate-x-full",
    left: visible ? "translate-x-0" : "-translate-x-full",
    top: visible ? "translate-y-0" : "-translate-y-full",
    bottom: visible ? "translate-y-0" : "translate-y-full",
  }

  const positionClasses = {
    right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l",
    left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r",
    top: "inset-x-0 top-0 h-auto border-b",
    bottom: "inset-x-0 bottom-0 h-auto border-t",
  }

  return (
    <div className="fixed inset-0 z-50" data-slot="sheet-portal">
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
        data-slot="sheet-overlay"
      />

      {/* Panel */}
      <div
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-background shadow-xl transition-transform duration-200 ease-in-out",
          positionClasses[side],
          slideClasses[side],
          className
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            data-slot="sheet-close"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </div>
  )
}

// ── Sheet Header ──────────────────────────────────────────────────────────
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  )
}

// ── Sheet Footer ──────────────────────────────────────────────────────────
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-6", className)}
      {...props}
    />
  )
}

// ── Sheet Title ───────────────────────────────────────────────────────────
function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

// ── Sheet Description ─────────────────────────────────────────────────────
function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
