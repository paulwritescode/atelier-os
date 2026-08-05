"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { FunctionReturnType } from "convex/server"
import {
  PageShell,
  PageCard,
  PageLoading,
  PageEmpty,
  PT,
  dateOf,
} from "@/components/PageShell"

type GarmentRow = FunctionReturnType<typeof api.production.listAllActive>[number]
type Stage = NonNullable<GarmentRow["currentStage"]>

const STAGES: { key: Stage; label: string }[] = [
  { key: "DesignApproved", label: "Design Approved" },
  { key: "FabricReady", label: "Fabric Ready" },
  { key: "Pattern", label: "Pattern" },
  { key: "Cutting", label: "Cutting" },
  { key: "Stitching", label: "Stitching" },
  { key: "Finishing", label: "Finishing" },
  { key: "Pressing", label: "Pressing" },
  { key: "QualityCheck", label: "Quality Check" },
  { key: "Ready", label: "Ready" },
]

const NOT_STARTED = "NotStarted"

export default function ProductionPage() {
  const garments = useQuery(api.production.listAllActive)

  const { columns, boardCount, deliveredCount } = useMemo(() => {
    const active = (garments ?? []).filter((g) => g.status !== "Delivered")
    const delivered = (garments ?? []).length - active.length

    const byStage = new Map<string, GarmentRow[]>()
    byStage.set(NOT_STARTED, [])
    for (const s of STAGES) byStage.set(s.key, [])

    for (const g of active) {
      const key = g.currentStage ?? NOT_STARTED
      byStage.get(key)?.push(g)
    }

    // Most recently touched first within each column.
    for (const items of byStage.values()) {
      items.sort((a, b) => (b.stageUpdatedAt ?? 0) - (a.stageUpdatedAt ?? 0))
    }

    const ordered = [
      { key: NOT_STARTED, label: "Not started", items: byStage.get(NOT_STARTED) ?? [] },
      ...STAGES.map((s) => ({
        key: s.key as string,
        label: s.label,
        items: byStage.get(s.key) ?? [],
      })),
    ]

    return { columns: ordered, boardCount: active.length, deliveredCount: delivered }
  }, [garments])

  return (
    <PageShell eyebrow="Atelier floor" title="Production" count={boardCount}>
      <p className="mb-1 text-[13px] leading-[20px]" style={{ color: PT.muted }}>
        Read-only board. Stages are advanced from within each commission, not from here.
      </p>
      {garments !== undefined && (
        <p className="mb-6 text-[13px] leading-[20px]" style={{ color: PT.muted }}>
          {boardCount} garment{boardCount === 1 ? "" : "s"} in production ·{" "}
          {deliveredCount} delivered
        </p>
      )}

      {garments === undefined ? (
        <PageLoading />
      ) : boardCount === 0 ? (
        <PageEmpty
          title="Nothing in production"
          body="Garments appear on this board once a commission reaches production. Stages are advanced from within each commission."
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.key} className="flex w-[280px] shrink-0 flex-col gap-3">
              <div
                className="flex items-center justify-between rounded-xs border px-4 py-2.5"
                style={{ background: PT.softIvory, borderColor: PT.stone }}
              >
                <span className="text-[13px] font-semibold" style={{ color: PT.ink }}>
                  {col.label}
                </span>
                <span
                  className="font-mono text-[12px]"
                  style={{ color: PT.muted, fontVariantNumeric: "tabular-nums" }}
                >
                  {col.items.length}
                </span>
              </div>

              {col.items.length === 0 ? (
                <div
                  className="rounded-xs border border-dashed px-4 py-6 text-center text-[12px]"
                  style={{ borderColor: PT.stone, color: PT.muted }}
                >
                  Empty
                </div>
              ) : (
                col.items.map((g) => (
                  <PageCard key={g._id} className="!p-4">
                    <p
                      className="mb-1 text-[14px] font-medium leading-[20px]"
                      style={{ color: PT.ink }}
                    >
                      {g.type}
                    </p>
                    <p className="mb-2 text-[12px]" style={{ color: PT.muted }}>
                      {g.participantName ?? "Unassigned"}
                      {g.participantRole ? ` · ${g.participantRole}` : ""}
                    </p>
                    <Link
                      href={`/projects/${g.projectSlug}`}
                      className="block truncate text-[13px] underline-offset-2 hover:underline"
                      style={{ color: PT.burgundy }}
                    >
                      {g.projectTitle}
                    </Link>
                    <p
                      className="mt-2 font-mono text-[11px]"
                      style={{ color: PT.muted, fontVariantNumeric: "tabular-nums" }}
                    >
                      {dateOf(g.stageUpdatedAt)}
                    </p>
                  </PageCard>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
