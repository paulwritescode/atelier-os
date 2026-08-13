"use client"

/**
 * AppointmentTicketPDF — generates a professional appointment confirmation ticket.
 * Uses jsPDF to produce a downloadable PDF that can be sent to clients via email/WhatsApp.
 */
import { jsPDF } from "jspdf"

interface TicketData {
  ticketRef: string
  type: string
  status: string
  scheduledAt: number
  durationMinutes: number
  isHomeVisit: boolean
  location?: string
  notes?: string
  clientName: string
  clientPhone?: string
  clientEmail?: string
  projectTitle: string
  staffName?: string
  confirmedByName?: string
  confirmedAt?: number
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    Consultation: "Consultation",
    Measurement: "Measurement Session",
    Fitting: "Fitting Appointment",
    Pickup: "Pickup",
    SiteVisit: "Site Visit",
  }
  return labels[type] ?? type
}

export function generateAppointmentTicketPDF(data: TicketData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5", // Compact ticket size
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 12
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(20, 20, 19) // Near-black
  doc.rect(0, 0, pageWidth, 32, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("APPOINTMENT CONFIRMATION", margin, 12)

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(typeLabel(data.type), margin, 22)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`Ref: ${data.ticketRef}`, pageWidth - margin, 12, { align: "right" })
  doc.text(
    `Status: ${data.status}`,
    pageWidth - margin,
    22,
    { align: "right" }
  )

  y = 40

  // ── Client Info ─────────────────────────────────────────────────────────
  doc.setTextColor(20, 20, 19)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("CLIENT", margin, y)
  y += 5

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(data.clientName, margin, y)
  y += 5

  if (data.clientPhone) {
    doc.setFontSize(9)
    doc.text(data.clientPhone, margin, y)
    y += 4
  }
  if (data.clientEmail) {
    doc.setFontSize(9)
    doc.text(data.clientEmail, margin, y)
    y += 4
  }

  y += 4

  // ── Appointment Details ─────────────────────────────────────────────────
  doc.setFillColor(245, 245, 244) // Light gray bg
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, "F")

  y += 6
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 100, 100)
  doc.text("DATE", margin + 5, y)
  doc.text("TIME", margin + contentWidth / 2, y)
  y += 5

  doc.setTextColor(20, 20, 19)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(fmtDate(data.scheduledAt), margin + 5, y)
  doc.text(fmtTime(data.scheduledAt), margin + contentWidth / 2, y)
  y += 8

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 100, 100)
  doc.text("DURATION", margin + 5, y)
  doc.text("TYPE", margin + contentWidth / 2, y)
  y += 5

  doc.setTextColor(20, 20, 19)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`${data.durationMinutes} minutes`, margin + 5, y)
  doc.text(data.isHomeVisit ? "Home Visit" : "In-Studio", margin + contentWidth / 2, y)

  y += 12

  // ── Location ────────────────────────────────────────────────────────────
  if (data.location) {
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(100, 100, 100)
    doc.text("LOCATION", margin, y)
    y += 5
    doc.setTextColor(20, 20, 19)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const locationLines = doc.splitTextToSize(data.location, contentWidth)
    doc.text(locationLines, margin, y)
    y += locationLines.length * 5 + 4
  }

  // ── Commission ──────────────────────────────────────────────────────────
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 100, 100)
  doc.text("COMMISSION", margin, y)
  y += 5
  doc.setTextColor(20, 20, 19)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(data.projectTitle, margin, y)
  y += 6

  // ── Assigned Staff ──────────────────────────────────────────────────────
  if (data.staffName) {
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(100, 100, 100)
    doc.text("ASSIGNED TO", margin, y)
    y += 5
    doc.setTextColor(20, 20, 19)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(data.staffName, margin, y)
    y += 6
  }

  // ── Notes ───────────────────────────────────────────────────────────────
  if (data.notes) {
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(100, 100, 100)
    doc.text("NOTES", margin, y)
    y += 5
    doc.setTextColor(20, 20, 19)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    const noteLines = doc.splitTextToSize(data.notes, contentWidth)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 4 + 4
  }

  // ── Confirmation footer ─────────────────────────────────────────────────
  if (data.confirmedAt) {
    y += 4
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Confirmed by ${data.confirmedByName ?? "staff"} on ${fmtDate(data.confirmedAt)} at ${fmtTime(data.confirmedAt)}`,
      margin,
      y
    )
    y += 4
  }

  // ── Bottom branding ─────────────────────────────────────────────────────
  const bottomY = doc.internal.pageSize.getHeight() - 10
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.text("Generated by Anio Regalia Atelier OS", margin, bottomY)
  doc.text(
    new Date().toLocaleDateString("en-KE"),
    pageWidth - margin,
    bottomY,
    { align: "right" }
  )

  // ── Save ────────────────────────────────────────────────────────────────
  doc.save(`${data.ticketRef}-${data.type.toLowerCase()}-ticket.pdf`)
}
