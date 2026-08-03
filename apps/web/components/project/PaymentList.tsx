"use client"

// Payments are IMMUTABLE records (Appendix §Payments).
// There is deliberately NO edit and NO delete control on any payment row here —
// the backend exposes no update/delete mutation either. A correction is recorded
// as a NEW payment of type "Refund".

import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import type { Id } from "@convex/_generated/dataModel"
import {
  type PanelProps,
  T,
  inputStyle,
  Card,
  SectionHeader,
  FieldLabel,
  Field,
  PrimaryButton,
  SecondaryButton,
  Badge,
  PanelLoading,
  EmptyState,
  fmtKES,
  parseKES,
  fmtDate,
} from "./_kit"

const inputClass =
  "h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"

type PaymentType = "Deposit" | "Installment" | "Balance" | "Refund"
type PaymentStatus = "Pending" | "Partial" | "Paid" | "Refunded"

const TYPES: PaymentType[] = ["Deposit", "Installment", "Balance", "Refund"]
const STATUSES: PaymentStatus[] = ["Pending", "Partial", "Paid", "Refunded"]

function todayInput(): string {
  return new Date().toISOString().slice(0, 10)
}

function typeColors(type: PaymentType): { bg: string; fg: string } {
  switch (type) {
    case "Deposit":
      return { bg: T.burgundy, fg: T.white }
    case "Installment":
      return { bg: T.gold, fg: T.white }
    case "Balance":
      return { bg: T.green, fg: T.white }
    case "Refund":
      return { bg: T.danger, fg: T.white }
  }
}

export function PaymentList({ projectId, staffId, isLocked }: PanelProps) {
  const payments = useQuery(api.payments.listByProject, { projectId })
  const summary = useQuery(api.payments.summaryByProject, { projectId })
  const recordPayment = useMutation(api.payments.record)

  const [isOpen, setIsOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [type, setType] = useState<PaymentType>("Deposit")
  const [status, setStatus] = useState<PaymentStatus>("Paid")
  const [amount, setAmount] = useState("")
  const [paidAt, setPaidAt] = useState(todayInput())

  const disabled = isLocked || !staffId || busy

  if (payments === undefined || summary === undefined) return <PanelLoading />

  const resetForm = () => {
    setType("Deposit")
    setStatus("Paid")
    setAmount("")
    setPaidAt(todayInput())
  }

  const handleRecord = async () => {
    if (!staffId) return

    const minorUnits = parseKES(amount) // integer minor units — never a float
    if (minorUnits <= 0) {
      toast.error("Enter an amount greater than zero.")
      return
    }
    if (!paidAt) {
      toast.error("Set the date the payment was made.")
      return
    }

    setBusy(true)
    try {
      await recordPayment({
        projectId,
        type,
        status,
        amount: minorUnits,
        recordedBy: staffId,
        paidAt: new Date(paidAt).getTime(),
      })
      toast.success(`${type} of ${fmtKES(minorUnits)} recorded.`)
      resetForm()
      setIsOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record the payment.")
    } finally {
      setBusy(false)
    }
  }

  const sorted = [...payments].sort((a, b) => b.paidAt - a.paidAt)

  return (
    <div className="flex flex-col gap-4">
      {/* ── Summary strip ────────────────────────────────────────────── */}
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: T.gold }}
          >
            Ledger
          </p>
          {summary.depositSatisfied ? (
            <Badge bg={T.green} fg={T.white}>
              Deposit settled
            </Badge>
          ) : (
            <Badge bg={T.amber} fg={T.white}>
              Deposit outstanding
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Field label="Quoted Total" value={fmtKES(summary.quotedTotal)} mono />
          <Field label="Received" value={fmtKES(summary.received)} mono />
          <Field label="Balance" value={fmtKES(summary.balance)} mono />
          <Field
            label="Deposit"
            value={`${fmtKES(summary.depositPaid)} of ${fmtKES(summary.depositRequired)}`}
            mono
          />
        </div>
      </Card>

      {/* ── Record form ──────────────────────────────────────────────── */}
      <Card>
        <SectionHeader
          eyebrow="Step 5"
          title="Payments"
          action={
            !isOpen ? (
              <PrimaryButton onClick={() => setIsOpen(true)} disabled={disabled}>
                Record Payment
              </PrimaryButton>
            ) : undefined
          }
        />

        {isOpen && (
          <div
            className="mb-5 rounded-2xl border p-4"
            style={{ borderColor: T.stone, background: T.softIvory }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Type</FieldLabel>
                <select
                  className={inputClass}
                  style={inputStyle}
                  value={type}
                  disabled={disabled}
                  onChange={(e) => setType(e.target.value as PaymentType)}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Status</FieldLabel>
                <select
                  className={inputClass}
                  style={inputStyle}
                  value={status}
                  disabled={disabled}
                  onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Amount (KES)</FieldLabel>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  style={inputStyle}
                  value={amount}
                  disabled={disabled}
                  placeholder="0.00"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Paid On</FieldLabel>
                <input
                  type="date"
                  className={inputClass}
                  style={inputStyle}
                  value={paidAt}
                  disabled={disabled}
                  onChange={(e) => setPaidAt(e.target.value)}
                />
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-[20px]" style={{ color: T.muted }}>
              Payments cannot be edited or deleted once recorded. Corrections are entered as a
              Refund.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <PrimaryButton onClick={handleRecord} disabled={disabled}>
                Save payment
              </PrimaryButton>
              <SecondaryButton
                onClick={() => {
                  resetForm()
                  setIsOpen(false)
                }}
                disabled={busy}
              >
                Cancel
              </SecondaryButton>
            </div>
          </div>
        )}

        {/* ── Immutable list — no edit, no delete ────────────────────── */}
        {sorted.length === 0 ? (
          <EmptyState
            eyebrow="No payments"
            title="Nothing received yet"
            body="Production cannot begin before the deposit is received. Record the deposit once the client has paid."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((p) => {
              const colors = typeColors(p.type)
              const isRefund = p.type === "Refund"
              const id = p._id as Id<"payments">
              return (
                <div
                  key={id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3"
                  style={{ borderColor: T.stone, background: T.ivory }}
                >
                  <Badge bg={colors.bg} fg={colors.fg}>
                    {p.type}
                  </Badge>
                  <span
                    className="flex-1 font-mono text-[15px]"
                    style={{
                      color: isRefund ? T.danger : T.ink,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {isRefund ? `-${fmtKES(p.amount)}` : fmtKES(p.amount)}
                  </span>
                  <span className="text-[13px]" style={{ color: T.body }}>
                    {p.status}
                  </span>
                  <span className="text-[13px]" style={{ color: T.muted }}>
                    {fmtDate(p.paidAt)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
