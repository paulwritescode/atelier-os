"use client"

// NOTE: This panel is superseded by ClientDetailPanel in Phase 5 (P5.1).
// For now it is retained as a stub that accepts a Project prop so existing
// callers don't break while the domain rewrite progresses.

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { User } from "@hugeicons/core-free-icons"
import type { Project } from "@/lib/types"

interface ClientInfoPanelProps {
  project?: Project
}

export const ClientInfoPanel: React.FC<ClientInfoPanelProps> = ({ project }) => {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <HugeiconsIcon icon={User} className="size-5 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Client Information</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Linked project:{" "}
        <span className="font-medium text-foreground">{project?.title ?? "—"}</span>
      </p>

      <p className="text-xs text-muted-foreground">
        Full client detail view available in the Clients section.
        This panel will be replaced by{" "}
        <span className="font-mono">ClientDetailPanel</span> in Phase 5.
      </p>
    </div>
  )
}
