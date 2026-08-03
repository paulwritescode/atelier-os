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
  money,
  dateOf,
} from "@/components/PageShell"

type PaymentRow = FunctionReturnType<typeof api.payments.listAll>[number]
type PaymentType = PaymentRow["type"]

const TYPE_COLORS: Record<PaymentType, string> = {
  Deposit: PT.burgundy,
  Installment: PT.gold,
  Balance: PT.green,
  Refund: PT.danger,
}

const FILTERS = ["All", "Deposit", "Installment", "Balance", "Refund"] as const
type Filter = (typeof FILTERS)[number]

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-[11px] font-bold uppercase tracking-[0.08em]"
        style={{ color: PT.muted }}
      >
        {label}
      </span>
      <span
        className="font-mono leading-none"
        style={{ color: PT.ink, fontSize: 28, fontVariantNumeric: "tabular-nums" }}
      >
        {money(value)}
      </span>
    </div>
  )
}

export default function PaymentsPage() {
  const payments = useQuery(api.payments.listAll)
  const totals = useQuery(api.payments.totals)
  const [filter, setFilter] = useState<Filter>("All")

  const rows = useMemo(() => {
    if (!payments) return []
    if (filter === "All") return payments
    return payments.filter((p) => p.type === filter)
  }, [payments, filter])

  return (
    <PageShell eyebrow="Ledger" title="Payments" count={rows.length}>
      <PageCard className="mb-4">
        <div className="grid gap-6 sm:grid-cols-3">
          <Figure label="Received" value={totals?.received ?? 0} />
          <Figure label="Committed" value={totals?.quotedAccepted ?? 0} />
          <Figure label="Outstanding" value={totals?.outstanding ?? 0} />
        </div>
      </PageCard>

      <p className="mb-6 text-[13px] leading-[20px]" style={{ color: PT.muted }}>
        Payments are immutable. Nothing here can be edited or deleted — a correction is
        recorded as a new Refund entry against the commission.
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
              {f}
            </button>
          )
        })}
      </div>

      {payments === undefined ? (
        <PageLoading />
      ) : rows.length === 0 ? (
        <PageEmpty
          title="No payments recorded"
          body={
            filter === "All"
              ? "Deposits, installments, balances and refunds recorded against a commission appear here."
              : `No ${filter.toLowerCase()} entries in the ledger yet.`
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((p) => {
            const isRefund = p.type === "Refund"
            return (
              <PageCard key={p._id}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <PageBadge bg={TYPE_COLORS[p.type]} fg={PT.white}>
                    {p.type}
                  </PageBadge>

                  <span
                    className="font-mono text-[16px]"
                    style={{
                      color: isRefund ? PT.danger : PT.ink,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {isRefund ? "-" : ""}
                    {money(p.amount)}
                  </span>

                  <span className="text-[13px]" style={{ color: PT.muted }}>
                    {p.status}
                  </span>

                  <div className="flex min-w-0 flex-col">
                    <span
                      className="truncate text-[14px] font-medium"
                      style={{ color: PT.ink }}
                    >
                      {p.clientName ?? "Unknown client"}
                    </span>
                    <Link
                      href={`/projects/${p.projectSlug}`}
                      className="truncate text-[13px] underline-offset-2 hover:underline"
                      style={{ color: PT.burgundy }}
                    >
                      {p.projectTitle}
                    </Link>
                  </div>

                  <span
                    className="ml-auto font-mono text-[12px]"
                    style={{ color: PT.muted, fontVariantNumeric: "tabular-nums" }}
                  >
                    {dateOf(p.paidAt)}
                  </span>
                </div>
              </PageCard>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
