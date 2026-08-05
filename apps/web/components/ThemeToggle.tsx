"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun02Icon, Moon02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <button
        className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground"
        aria-label="Toggle theme"
      >
        <div className="size-5" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-xl",
        "text-muted-foreground transition-colors duration-150",
        "hover:bg-secondary hover:text-foreground",
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <HugeiconsIcon
        icon={isDark ? Sun02Icon : Moon02Icon}
        className="size-5"
      />
    </button>
  )
}
