"use client"

/**
 * Documents — structured business records.
 *
 * ADR-007 / ADR-008: only structured data is stored. PDFs are GENERATED on
 * demand and never persisted. There is deliberately no "save PDF" action —
 * generating opens the print dialog and returns.
 */
import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import { File01Icon } from "@hugeicons/core-free-icons"
import type { FunctionReturnType } from "convex/server"
import type { Doc } from "@convex/_generated/dataModel"
import {
  type PanelProps,
  T,
  inputStyle,
  Card,
  SectionHeader,
  FieldLabel,
  PrimaryButton,
  SecondaryButton,
  Badge,
  PanelLoading,
  EmptyState,
  fmtDateTime,
} from "./_kit"

type DocumentRow = FunctionReturnType<typeof api.documents.listByProject>[number]

type DocumentType =
  | "Quotation"
  | "Invoice"
  | "Receipt"
  | "MeasurementSheet"
  | "DeliveryNote"

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: "Quotation", label: "Quotation" },
  { value: "Invoice", label: "Invoice" },
  { value: "Receipt", label: "Receipt" },
  { value: "MeasurementSheet", label: "Measurement Sheet" },
  { value: "DeliveryNote", label: "Delivery Note" },
]

function docLabel(type: string): string {
  return DOC_TYPES.find((d) => d.value === type)?.label ?? type
}

interface DocumentPanelProps extends PanelProps {
  project: Doc<"projects">
  clientName: string | null
}

export function DocumentPanel({
  projectId,
  staffId,
  isLocked,
  project,
  clientName,
}: DocumentPanelProps) {
  const documents = useQuery(api.documents.listByProject, { projectId })
  const quotation = useQuery(api.quotations.getByProject, { projectId })
  const createDocument = useMutation(api.documents.create)

  const [showForm, setShowForm] = useState(false)
  const [docType, setDocType] = useState<DocumentType>("Quotation")
  const [saving, setSaving] = useState(false)

  const disabled = isLocked || !staffId || saving

  if (documents === undefined) return <PanelLoading />

  const handleCreate = async () => {
    if (!staffId) return
    setSaving(true)
    try {
      // Structured data only — never a rendered file. ADR-007.
      const data: Record<string, unknown> = {
        projectTitle: project.title,
        projectType: project.type,
        clientName: clientName ?? "—",
        generatedFor: docLabel(docType),
      }
      if (docType === "Quotation" && quotation) {
        data.items = quotation.items
        data.depositAmount = quotation.depositAmount
        data.validUntil = quotation.validUntil
        data.status = quotation.status
      }

      await createDocument({ projectId, type: docType, data, createdBy: staffId })
      toast.success(`${docLabel(docType)} record created.`)
      setShowForm(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the document.")
    } finally {
      setSaving(false)
    }
  }

  /** Opens the browser print dialog. Nothing is persisted. ADR-008. */
  const handleGeneratePDF = (doc: DocumentRow) => {
    const win = window.open("", "_blank", "width=820,height=1000")
    if (!win) {
      toast.error("Allow pop-ups to generate the document.")
      return
    }

    const rows = Array.isArray((doc.data as Record<string, unknown>).items)
      ? ((doc.data as Record<string, unknown>).items as {
          description: string
          quantity: number
          unitPrice: number
        }[])
      : []

    const money = (minor: number) => `KES ${(minor / 100).toLocaleString()}`
    const total = rows.reduce((s, r) => s + r.unitPrice * r.quantity, 0)

    win.document.write(`<!doctype html>
<html><head><meta charset="utf-8" /><title>${docLabel(doc.type)} — ${project.title}</title>
<style>
  @page { margin: 24mm; }
  body { font-family: Georgia, "Times New Roman", serif; color: hsl(0 0% 9%); background: #FFFFFF; }
  .bar { background: hsl(345 60% 28%); color: #fff; padding: 22px 26px; }
  .bar h1 { margin: 0; font-size: 26px; font-weight: 600; letter-spacing: -0.01em; }
  .bar p { margin: 4px 0 0; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: hsl(45 93% 58%); }
  .rule { height: 2px; background: hsl(45 93% 58%); }
  .body { padding: 26px; }
  .meta { display: flex; gap: 40px; margin-bottom: 26px; font-size: 13px; }
  .meta div p:first-child { margin: 0 0 3px; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: hsl(0 0% 45%); }
  .meta div p:last-child { margin: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; border-bottom: 1px solid hsl(0 0% 90%); padding: 8px 0; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: hsl(0 0% 45%); }
  td { border-bottom: 1px solid hsl(0 0% 94%); padding: 10px 0; }
  .r { text-align: right; }
  .tot { font-weight: 700; font-size: 15px; }
  footer { margin-top: 34px; border-top: 1px solid hsl(0 0% 90%); padding-top: 12px; font-size: 11px; color: hsl(0 0% 45%); display: flex; justify-content: space-between; }
</style></head>
<body>
  <div class="bar">
    <p>Anio Regalia</p>
    <h1>${docLabel(doc.type)}</h1>
  </div>
  <div class="rule"></div>
  <div class="body">
    <div class="meta">
      <div><p>Client</p><p>${clientName ?? "—"}</p></div>
      <div><p>Commission</p><p>${project.title}</p></div>
      <div><p>Version</p><p>${doc.version}</p></div>
    </div>
    ${
      rows.length
        ? `<table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Unit</th><th class="r">Total</th></tr></thead><tbody>
        ${rows
          .map(
            (r) =>
              `<tr><td>${r.description}</td><td class="r">${r.quantity}</td><td class="r">${money(r.unitPrice)}</td><td class="r">${money(r.unitPrice * r.quantity)}</td></tr>`
          )
          .join("")}
        <tr><td colspan="3" class="r tot">Total</td><td class="r tot">${money(total)}</td></tr>
        </tbody></table>`
        : `<p style="font-size:13px;color:hsl(0 0% 34%)">This record holds no line items.</p>`
    }
    <footer><span>Anio Regalia</span><span>Generated ${new Date().toLocaleString("en-GB")}</span></footer>
  </div>
</body></html>`)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Records"
        title="Documents"
        action={
          !showForm ? (
            <PrimaryButton onClick={() => setShowForm(true)} disabled={disabled}>
              Create Record
            </PrimaryButton>
          ) : undefined
        }
      />

      {showForm && (
        <Card>
          <div className="flex flex-col gap-5">
            <div>
              <FieldLabel>Document Type</FieldLabel>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                disabled={disabled}
                className="h-[44px] w-full rounded-full border px-4 text-[15px] outline-none disabled:opacity-50"
                style={inputStyle}
              >
                {DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              {docType === "Quotation" && !quotation && (
                <p className="mt-1.5 text-[12px]" style={{ color: T.amber }}>
                  No quotation exists yet — the record will be created without line items.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <SecondaryButton onClick={() => setShowForm(false)} disabled={saving}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleCreate} disabled={disabled}>
                {saving ? "Creating…" : "Create"}
              </PrimaryButton>
            </div>
          </div>
        </Card>
      )}

      {documents.length === 0 ? (
        <EmptyState
          icon={File01Icon}
          eyebrow="Records"
          title="No documents yet"
          body="Quotations, invoices, receipts, measurement sheets and delivery notes are stored as structured records. PDFs are generated on demand and never saved."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {documents.map((doc: DocumentRow) => (
            <Card key={doc._id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge bg={T.ink} fg={T.white}>
                    {docLabel(doc.type)}
                  </Badge>
                  <div>
                    <p className="text-[14px] font-medium text-foreground">
                      {`Version ${doc.version}`}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {fmtDateTime(doc.createdAt)}
                    </p>
                  </div>
                </div>
                {/* Generate only — no download/save. ADR-008. */}
                <SecondaryButton onClick={() => handleGeneratePDF(doc)}>
                  Generate PDF
                </SecondaryButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-center text-[12px] text-muted-foreground">
        PDFs are generated from structured data on demand and are never stored.
      </p>
    </div>
  )
}
