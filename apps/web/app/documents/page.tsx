"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import type { FunctionReturnType } from "convex/server"
import {
  PageShell,
  PageCard,
  PageBadge,
  PageLoading,
  PageEmpty,
  PT,
  dateTimeOf,
} from "@/components/PageShell"

type DocumentRow = FunctionReturnType<typeof api.documents.listAll>[number]
type DocumentType = DocumentRow["type"]

const TYPE_LABELS: Record<DocumentType, string> = {
  Quotation: "Quotation",
  Invoice: "Invoice",
  Receipt: "Receipt",
  MeasurementSheet: "Measurement Sheet",
  DeliveryNote: "Delivery Note",
}

const FILTERS = [
  "All",
  "Quotation",
  "Invoice",
  "Receipt",
  "MeasurementSheet",
  "DeliveryNote",
] as const
type Filter = (typeof FILTERS)[number]

function filterLabel(f: Filter): string {
  return f === "All" ? "All" : TYPE_LABELS[f]
}

export default function DocumentsPage() {
  const documents = useQuery(api.documents.listAll)
  const [filter, setFilter] = useState<Filter>("All")

  const rows = useMemo(() => {
    if (!documents) return []
    if (filter === "All") return documents
    return documents.filter((d) => d.type === filter)
  }, [documents, filter])

  return (
    <PageShell eyebrow="Records" title="Documents" count={rows.length}>
      <p className="mb-6 max-w-[720px] text-[13px] leading-[20px]" style={{ color: PT.muted }}>
        Documents store structured data only. PDFs are generated on demand and never
        stored (ADR-007/008) — generation lives in each commission&apos;s Documents panel.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={active}
              className="rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors"
              style={{
                background: active ? PT.burgundy : PT.white,
                color: active ? PT.white : PT.body,
                borderColor: active ? PT.burgundy : PT.stone,
              }}
            >
              {filterLabel(f)}
            </button>
          )
        })}
      </div>

      {documents === undefined ? (
        <PageLoading />
      ) : rows.length === 0 ? (
        <PageEmpty
          title="No documents yet"
          body={
            filter === "All"
              ? "Quotations, invoices, receipts, measurement sheets and delivery notes appear here as they are created inside a commission."
              : `No ${filterLabel(filter).toLowerCase()} records yet.`
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((d) => (
            <Link key={d._id} href={`/projects/${d.projectSlug}`} className="block">
              <PageCard className="transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <PageBadge bg={PT.burgundy} fg={PT.white}>
                    {TYPE_LABELS[d.type]}
                  </PageBadge>

                  <span
                    className="font-mono text-[12px]"
                    style={{ color: PT.muted, fontVariantNumeric: "tabular-nums" }}
                  >
                    Version {d.version}
                  </span>

                  <div className="flex min-w-0 flex-col">
                    <span
                      className="truncate text-[14px] font-medium"
                      style={{ color: PT.ink }}
                    >
                      {d.clientName ?? "Unknown client"}
                    </span>
                    <span className="truncate text-[13px]" style={{ color: PT.burgundy }}>
                      {d.projectTitle}
                    </span>
                  </div>

                  <span
                    className="ml-auto font-mono text-[12px]"
                    style={{ color: PT.muted, fontVariantNumeric: "tabular-nums" }}
                  >
                    {dateTimeOf(d.createdAt)}
                  </span>
                </div>
              </PageCard>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
