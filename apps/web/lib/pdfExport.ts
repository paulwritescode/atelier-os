// ── Anio Regalia PDF Export ────────────────────────────────────────────────
// ADR-007 / ADR-008: PDFs are generated on demand. Never stored. Never persisted.
// These functions open a print window and return void.
// They MUST only be called from client components via event handlers (touch window).
// All amounts are integers (smallest currency unit). Divide by 100 for KES display.
// Ref: Product.md §Product Principles §PDFs are generated
// Ref: Business domain.md §Document §Rules
// Ref: Appendix.md §Documents §File Standards §Documents

import type {
  Quotation,
  Project,
  Client,
  Payment,
  Measurement,
  Participant,
} from "@/lib/types"

// ── Shared brand HTML template ─────────────────────────────────────────────
function buildPrintHtml(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 13px;
      color: #1a1008;
      background: #f7f3ec;
      padding: 48px;
    }

    /* Burgundy header bar */
    .brand-header {
      background: #4a1020;
      color: #f7f3ec;
      padding: 20px 32px;
      margin: -48px -48px 36px -48px;
      display: flex;
      align-items: baseline;
      gap: 16px;
    }
    .brand-header h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 22px;
      font-weight: 300;
      letter-spacing: 0.05em;
    }
    .brand-header .doc-type {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0.75;
    }

    /* Gold accent line */
    .accent-line {
      height: 1px;
      background: #b8953a;
      margin: 20px 0;
    }

    h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 16px;
      font-weight: 400;
      margin-bottom: 12px;
      color: #4a1020;
    }

    .section { margin-bottom: 28px; }

    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #7a6a50;
      padding: 6px 8px;
      border-bottom: 1px solid #d4c9b0;
    }
    td { padding: 8px 8px; border-bottom: 1px solid #ede8de; }
    tr:last-child td { border-bottom: none; }

    .total-row td { font-weight: 600; border-top: 2px solid #b8953a; }

    .meta-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .meta-label { color: #7a6a50; }

    .status-badge {
      display: inline-block;
      border: 1px solid #b8953a;
      color: #7a6a50;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 100px;
      letter-spacing: 0.06em;
    }

    /* Footer */
    .brand-footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #d4c9b0;
      font-size: 10px;
      color: #7a6a50;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="brand-header">
    <h1>Anio Regalia</h1>
    <span class="doc-type">${escapeHtml(title)}</span>
  </div>

  ${bodyContent}

  <div class="brand-footer">
    <span>Anio Regalia — Bespoke Commission Management</span>
    <span>Generated: ${new Date().toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}</span>
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Format integer amount as KES display string (integer / 100). */
function formatAmount(amount: number): string {
  return (amount / 100).toLocaleString("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  })
}

function openPrint(title: string, html: string): void {
  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.print()
}

// ── Public generators ───────────────────────────────────────────────────────

/**
 * Generate a Quotation PDF for the client.
 * Ref: Business domain.md §Quotation, Appendix §Documents §Generated
 */
export function generateQuotationPDF(
  q: Quotation,
  project: Project,
  client: Client
): void {
  const itemsRows = q.items
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.description)}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${formatAmount(item.unitPrice)}</td>
      <td style="text-align:right">${formatAmount(item.quantity * item.unitPrice)}</td>
    </tr>`
    )
    .join("")

  const total = q.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const body = `
    <div class="section">
      <div class="meta-row"><span class="meta-label">Client</span><span>${escapeHtml(client.name)}</span></div>
      <div class="meta-row"><span class="meta-label">Commission</span><span>${escapeHtml(project.title)}</span></div>
      <div class="meta-row"><span class="meta-label">Valid Until</span><span>${new Date(q.validUntil).toLocaleDateString("en-GB")}</span></div>
      <div class="meta-row"><span class="meta-label">Status</span><span class="status-badge">${q.status}</span></div>
    </div>
    <div class="accent-line"></div>
    <div class="section">
      <h2>Line Items</h2>
      <table>
        <thead>
          <tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr>
        </thead>
        <tbody>
          ${itemsRows}
          <tr class="total-row">
            <td colspan="3" style="text-align:right">Subtotal</td>
            <td style="text-align:right">${formatAmount(total)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align:right">Deposit Required</td>
            <td style="text-align:right">${formatAmount(q.depositAmount)}</td>
          </tr>
        </tbody>
      </table>
    </div>`

  openPrint("Quotation", buildPrintHtml("Quotation", body))
}

/**
 * Generate an Invoice PDF.
 * Ref: Appendix §Documents §Generated
 */
export function generateInvoicePDF(
  payment: Payment,
  project: Project,
  client: Client
): void {
  const body = `
    <div class="section">
      <div class="meta-row"><span class="meta-label">Client</span><span>${escapeHtml(client.name)}</span></div>
      <div class="meta-row"><span class="meta-label">Commission</span><span>${escapeHtml(project.title)}</span></div>
      <div class="meta-row"><span class="meta-label">Payment Type</span><span>${payment.type}</span></div>
      <div class="meta-row"><span class="meta-label">Date</span><span>${new Date(payment.paidAt).toLocaleDateString("en-GB")}</span></div>
    </div>
    <div class="accent-line"></div>
    <div class="section">
      <table>
        <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr><td>${payment.type}</td><td style="text-align:right">${formatAmount(payment.amount)}</td></tr>
          <tr class="total-row"><td>Total Due</td><td style="text-align:right">${formatAmount(payment.amount)}</td></tr>
        </tbody>
      </table>
    </div>`

  openPrint("Invoice", buildPrintHtml("Invoice", body))
}

/**
 * Generate a Receipt PDF.
 * Ref: Appendix §Documents §Generated
 */
export function generateReceiptPDF(
  payment: Payment,
  project: Project,
  client: Client
): void {
  const body = `
    <div class="section">
      <div class="meta-row"><span class="meta-label">Client</span><span>${escapeHtml(client.name)}</span></div>
      <div class="meta-row"><span class="meta-label">Commission</span><span>${escapeHtml(project.title)}</span></div>
      <div class="meta-row"><span class="meta-label">Payment Type</span><span>${payment.type}</span></div>
      <div class="meta-row"><span class="meta-label">Date Received</span><span>${new Date(payment.paidAt).toLocaleDateString("en-GB")}</span></div>
      <div class="meta-row"><span class="meta-label">Status</span><span class="status-badge">${payment.status}</span></div>
    </div>
    <div class="accent-line"></div>
    <div class="section">
      <table>
        <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr><td>Payment Received — ${payment.type}</td><td style="text-align:right">${formatAmount(payment.amount)}</td></tr>
          <tr class="total-row"><td>Total Received</td><td style="text-align:right">${formatAmount(payment.amount)}</td></tr>
        </tbody>
      </table>
    </div>`

  openPrint("Receipt", buildPrintHtml("Receipt", body))
}

/**
 * Generate a Measurement Sheet PDF.
 * Measurements are versioned and append-only (ADR-009).
 * Ref: Appendix §Documents §Generated
 */
export function generateMeasurementSheetPDF(
  measurements: Measurement[],
  participant: Participant
): void {
  const rows = measurements
    .sort((a, b) => b.version - a.version)
    .map(
      (m) => `
    <tr>
      <td style="text-align:center">v${m.version}</td>
      <td>${new Date(m.takenAt).toLocaleDateString("en-GB")}</td>
      <td style="text-align:center">${m.chest}</td>
      <td style="text-align:center">${m.waist}</td>
      <td style="text-align:center">${m.hips}</td>
      <td style="text-align:center">${m.height}</td>
      <td style="text-align:center">${m.shoulder}</td>
      <td style="text-align:center">${m.sleeve}</td>
      <td style="text-align:center">${m.neck}</td>
      <td style="text-align:center">${m.inseam}</td>
    </tr>`
    )
    .join("")

  const body = `
    <div class="section">
      <div class="meta-row"><span class="meta-label">Participant Role</span><span>${escapeHtml(participant.role)}</span></div>
      <div class="meta-row"><span class="meta-label">Total Versions</span><span>${measurements.length}</span></div>
    </div>
    <div class="accent-line"></div>
    <div class="section">
      <h2>Measurement History (cm)</h2>
      <table>
        <thead>
          <tr>
            <th>Version</th><th>Date</th><th>Chest</th><th>Waist</th><th>Hips</th>
            <th>Height</th><th>Shoulder</th><th>Sleeve</th><th>Neck</th><th>Inseam</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`

  openPrint("Measurement Sheet", buildPrintHtml("Measurement Sheet", body))
}

/**
 * Generate a Delivery Note PDF.
 * Ref: Appendix §Documents §Generated
 */
export function generateDeliveryNotePDF(project: Project, client: Client): void {
  const body = `
    <div class="section">
      <div class="meta-row"><span class="meta-label">Client</span><span>${escapeHtml(client.name)}</span></div>
      <div class="meta-row"><span class="meta-label">Commission</span><span>${escapeHtml(project.title)}</span></div>
      <div class="meta-row"><span class="meta-label">Type</span><span>${project.type}</span></div>
      <div class="meta-row"><span class="meta-label">Delivery Date</span><span>${new Date().toLocaleDateString("en-GB")}</span></div>
    </div>
    <div class="accent-line"></div>
    <div class="section">
      <h2>Items Delivered</h2>
      <p style="color:#7a6a50;font-size:12px">Garment details will be populated from the production records (Phase 9).</p>
    </div>
    <div class="section" style="margin-top:48px">
      <div style="display:flex;justify-content:space-between;gap:48px">
        <div>
          <p style="font-size:11px;color:#7a6a50;margin-bottom:32px">Received by (Client Signature)</p>
          <div style="border-bottom:1px solid #4a1020;width:200px"></div>
        </div>
        <div>
          <p style="font-size:11px;color:#7a6a50;margin-bottom:32px">Delivered by (Anio Regalia)</p>
          <div style="border-bottom:1px solid #4a1020;width:200px"></div>
        </div>
      </div>
    </div>`

  openPrint("Delivery Note", buildPrintHtml("Delivery Note", body))
}
