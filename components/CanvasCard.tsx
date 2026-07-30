"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar, User, Clock, Share, MoreHorizontal } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import type { Canvas } from "@/lib/types"

interface CanvasCardProps {
  canvas: Canvas
  viewMode: "grid" | "list"
  onClick: () => void
}

const statusColors: Record<Canvas["status"], string> = {
  Draft: "bg-muted text-muted-foreground",
  "In Progress": "bg-primary/15 text-primary",
  Completed: "bg-primary text-primary-foreground",
}

export const CanvasCard: React.FC<CanvasCardProps> = ({ canvas, viewMode, onClick }) => {
  if (viewMode === "list") {
    return (
      <div
        className="cursor-pointer rounded-lg border border-border bg-card/70 p-4 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="size-16 overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={canvas.previewImage}
                alt={canvas.title}
                className="size-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-foreground">{canvas.title}</h3>
              <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <HugeiconsIcon icon={User} className="size-3" />
                  <span>{canvas.clientName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HugeiconsIcon icon={Clock} className="size-3" />
                  <span>{canvas.lastModified}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HugeiconsIcon icon={Calendar} className="size-3" />
                  <span>{canvas.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[canvas.status]}`}
            >
              {canvas.status}
            </span>
            <Button variant="ghost" size="sm">
              <HugeiconsIcon icon={Share} className="size-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <HugeiconsIcon icon={MoreHorizontal} className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card/70 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={canvas.previewImage}
          alt={canvas.title}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">{canvas.title}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <HugeiconsIcon icon={User} className="size-3" />
              <span>{canvas.clientName}</span>
            </div>
          </div>
          <span
            className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${statusColors[canvas.status]}`}
          >
            {canvas.status}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{canvas.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Clock} className="size-3" />
            <span>{canvas.lastModified}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon-sm">
              <HugeiconsIcon icon={Share} className="size-3" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <HugeiconsIcon icon={MoreHorizontal} className="size-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
