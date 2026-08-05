"use client"

import React, { useMemo, useState } from "react"
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
  Blocked,
  fmtKES,
  parseKES,
  fmtDate,
} from "./_kit"

const inputClass =
  "h-[44px] w-full rounded-xl border px-4 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50"

/** Draft line item — unitPrice is held in MAJOR units while editing. */
interface DraftItem {
  id: string
  description: string
  quantity: string
  unitPrice: string
}

function newItem(): DraftItem {
  return { id: crypto.randomUUID(), description: "", quantity: "1", unitPrice: "" }
}

function qtyOf(item: DraftItem): number {
  const n = Math.floor(Number(item.quantity))
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Line total in minor units: integer qty × integer minor unit price. */
function lineTotalMinor(item: DraftItem): number {
  return qtyOf(item) * parseKES(item.unitPrice)
}

function statusColors(status: string): { bg: string; fg: string } {
  switch (status) {
    case "Draft":
      return { bg: T.gold, fg: T.white }
    case "Sent":
      return { bg: T.burgundy, fg: T.white }
    case "Accepted":
      return { bg: T.green, fg: T.white }
    case "Rejected":
      return { bg: T.danger, fg: T.white }
    case "Expired":
      return { bg: T.stone, fg: T.ink }
    default:
      return { bg: T.softIvory, fg: T.body }
  }
}

export function QuotationPanel({ projectId, staffId, isLocked }: PanelProps) {
  const quotation = useQuery(api.quotations.getByProject, { projectId })
  const design = useQuery(api.designs.getByProject, { projectId })

  const createQuotation = useMutation(api.quotations.create)
  const sendQuotation = useMutation(api.quotations.send)
  const acceptQuotation = useMutation(api.quotations.accept)
  const rejectQuotation = useMutation(api.quotations.reject)

  const [items, setItems] = useState<DraftItem[]>([newItem()])
  const [depositAmount, setDepositAmount] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [busy, setBusy] = useState(false)

  const disabled = isLocked || !staffId || busy

  const totalMinor = useMemo(
    () => items.reduce((sum, item) => sum + lineTotalMinor(item), 0),
    [items]
  )

  if (quotation === undefined || design === undefined) return <PanelLoading />

  // ── Gate: a quotation is only built from an approved design ─────────────
  if (!design || !design.approvedAt) {
    return (
      <Blocked
        title="Approved design required"
        body="A quotation is built from an approved design. Approve the design before preparing a quotation."
      />
    )
  }

  const updateItem = (id: string, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((it) => it.id !== id)))
  }

  const handleCreate = async () => {
    if (!staffId) return

    const clean = items
      .map((it) => ({
        id: it.id,
        description: it.description.trim(),
        quantity: qtyOf(it),
        unitPrice: parseKES(it.unitPrice), // minor units — never a float
      }))
      .filter((it) => it.description && it.quantity > 0 && it.unitPrice > 0)

    if (clean.length === 0) {
      toast.error("Add at least one line item with a description, quantity and price.")
      return
    }
    if (!validUntil) {
      toast.error("Set a valid-until date.")
      return
    }

    setBusy(true)
    try {
      await createQuotation({
        designId: design._id,
        projectId,
        items: clean,
        depositAmount: parseKES(depositAmount),
        validUntil: new Date(validUntil).getTime(),
        createdBy: staffId,
      })
      toast.success("Quotation drafted.")
      setItems([newItem()])
      setDepositAmount("")
      setValidUntil("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the quotation.")
    } finally {
      setBusy(false)
    }
  }

  const runTransition = async (
    label: string,
    fn: () => Promise<unknown>,
    fallback: string
  ) => {
    setBusy(true)
    try {
      await fn()
      toast.success(label)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : fallback)
    } finally {
      setBusy(false)
    }
  }

  // ── Builder ────────────────────────────────────────────────────────────
  if (!quotation) {
    return (
      <Card>
        <SectionHeader eyebrow="Step 4" title="Prepare quotation" />

        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-3 rounded-xs border p-4 sm:grid-cols-[1fr_88px_140px_auto]"
              style={{ borderColor: T.stone, background: T.softIvory }}
            >
              <div>
                <FieldLabel>Description</FieldLabel>
                <input
                  type="text"
                  className={inputClass}
                  style={inputStyle}
                  value={item.description}
                  disabled={disabled}
                  placeholder="e.g. Three-piece suit, tailoring"
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />
              </div>
              <div>
                <FieldLabel>Qty</FieldLabel>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className={inputClass}
                  style={inputStyle}
                  value={item.quantity}
                  disabled={disabled}
                  onChange={(e) => updateItem(item.id, { quantity: e.target.value })}
                />
              </div>
              <div>
                <FieldLabel>Unit Price (KES)</FieldLabel>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  style={inputStyle}
                  value={item.unitPrice}
                  disabled={disabled}
                  placeholder="0.00"
                  onChange={(e) => updateItem(item.id, { unitPrice: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={disabled || items.length === 1}
                  aria-label={`Remove line item ${index + 1}`}
                  className="h-[44px] rounded-full border px-4 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderColor: "#D9D2C7", color: T.danger, background: "transparent" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div>
            <SecondaryButton onClick={() => setItems((prev) => [...prev, newItem()])} disabled={disabled}>
              Add line item
            </SecondaryButton>
          </div>

          <div
            className="flex items-center justify-between rounded-xs border px-4 py-3"
            style={{ borderColor: T.stone, background: T.ivory }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: T.muted }}
            >
              Quotation total
            </span>
            <span
              className="font-mono text-[18px]"
              style={{ color: T.ink, fontVariantNumeric: "tabular-nums" }}
            >
              {fmtKES(totalMinor)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Deposit Required (KES)</FieldLabel>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                style={inputStyle}
                value={depositAmount}
                disabled={disabled}
                placeholder="0.00"
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Valid Until</FieldLabel>
              <input
                type="date"
                className={inputClass}
                style={inputStyle}
                value={validUntil}
                disabled={disabled}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <PrimaryButton onClick={handleCreate} disabled={disabled}>
              Create quotation
            </PrimaryButton>
          </div>
        </div>
      </Card>
    )
  }

  // ── Existing quotation ─────────────────────────────────────────────────
  const colors = statusColors(quotation.status)
  const quotedTotal = quotation.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )
  const quotationId = quotation._id as Id<"quotations">

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          eyebrow="Step 4"
          title="Quotation"
          action={<Badge bg={colors.bg} fg={colors.fg}>{quotation.status}</Badge>}
        />

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {["Description", "Qty", "Unit Price", "Line Total"].map((head, i) => (
                  <th
                    key={head}
                    className={`border-b pb-2 text-[11px] font-bold uppercase tracking-[0.08em] ${i === 0 ? "text-left" : "text-right"}`}
                    style={{ color: T.muted, borderColor: T.stone }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item) => (
                <tr key={item.id}>
                  <td className="border-b py-3 pr-4" style={{ color: T.ink, borderColor: T.stone }}>
                    {item.description}
                  </td>
                  <td
                    className="border-b py-3 text-right font-mono"
                    style={{ color: T.body, borderColor: T.stone, fontVariantNumeric: "tabular-nums" }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className="border-b py-3 text-right font-mono"
                    style={{ color: T.body, borderColor: T.stone, fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmtKES(item.unitPrice)}
                  </td>
                  <td
                    className="border-b py-3 text-right font-mono"
                    style={{ color: T.ink, borderColor: T.stone, fontVariantNumeric: "tabular-nums" }}
                  >
                    {fmtKES(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={3}
                  className="py-3 text-right text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: T.muted }}
                >
                  Total
                </td>
                <td
                  className="py-3 text-right font-mono text-[16px]"
                  style={{ color: T.ink, fontVariantNumeric: "tabular-nums" }}
                >
                  {fmtKES(quotedTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Deposit Required" value={fmtKES(quotation.depositAmount)} mono />
          <Field label="Valid Until" value={fmtDate(quotation.validUntil)} />
        </div>
      </Card>

      <Card>
        <p
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: T.gold }}
        >
          Workflow
        </p>

        {quotation.status === "Draft" && (
          <PrimaryButton
            disabled={disabled}
            onClick={() =>
              runTransition(
                "Quotation sent to client.",
                () => sendQuotation({ id: quotationId, sentBy: staffId! }),
                "Could not send the quotation."
              )
            }
          >
            Send to Client
          </PrimaryButton>
        )}

        {quotation.status === "Sent" && (
          <div className="flex flex-wrap gap-3">
            <PrimaryButton
              disabled={disabled}
              onClick={() =>
                runTransition(
                  "Quotation marked accepted.",
                  () => acceptQuotation({ id: quotationId, acceptedBy: staffId! }),
                  "Could not accept the quotation."
                )
              }
            >
              Mark Accepted
            </PrimaryButton>
            <SecondaryButton
              disabled={disabled}
              onClick={() =>
                runTransition(
                  "Quotation marked rejected.",
                  () => rejectQuotation({ id: quotationId, rejectedBy: staffId! }),
                  "Could not reject the quotation."
                )
              }
            >
              Mark Rejected
            </SecondaryButton>
          </div>
        )}

        {quotation.status === "Accepted" && (
          <p className="text-[14px] leading-[22px]" style={{ color: T.body }}>
            Quotation accepted. A deposit of {fmtKES(quotation.depositAmount)} is now required
            before production begins.
          </p>
        )}

        {(quotation.status === "Rejected" || quotation.status === "Expired") && (
          <p className="text-[14px] leading-[22px]" style={{ color: T.muted }}>
            This quotation is {quotation.status.toLowerCase()}. No further transitions are
            available.
          </p>
        )}
      </Card>
    </div>
  )
}
