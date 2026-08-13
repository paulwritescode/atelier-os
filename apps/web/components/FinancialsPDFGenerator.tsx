"use client"

import React from "react"
import { jsPDF } from "jspdf"
import { HugeiconsIcon } from "@hugeicons/react"
import { Download } from "@hugeicons/core-free-icons"

interface QuotationItem {
  description: string
  qty: number
  unitPrice: number
  lineTotal: number
}

interface PaymentRecord {
  date: string
  amount: number
  type: "deposit" | "payment"
  method?: string
  reference?: string
}

interface FinancialsPDFProps {
  projectName: string
  projectType: string
  clientName: string
  quotationItems?: QuotationItem[]
  quotationTotal?: number
  depositRequired?: number
  validUntil?: string
  payments?: PaymentRecord[]
  balance?: number
  currency?: string
}

const COLORS = {
  primary: "#5C2E3A", // Burgundy
  text: "#1a1a1a",
  lightText: "#666666",
  border: "#E5E5E5",
  headerBg: "#F9F9F9",
  accentGold: "#D4A574",
}

export const FinancialsPDFGenerator: React.FC<FinancialsPDFProps> = ({
  projectName,
  projectType,
  clientName,
  quotationItems = [],
  quotationTotal = 0,
  depositRequired = 0,
  validUntil = "",
  payments = [],
  balance = 0,
  currency = "KES",
}) => {
  const generateQuotationPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Header
    doc.setFillColor(92, 46, 58) // Burgundy
    doc.rect(0, 0, pageWidth, 30, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("Quotation", 20, 22)

    // Reset text color
    doc.setTextColor(26, 26, 26)
    yPosition = 45

    // Project Details
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Project Details", 20, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Project: ${projectName}`, 20, yPosition)
    yPosition += 6
    doc.text(`Type: ${projectType}`, 20, yPosition)
    yPosition += 6
    doc.text(`Client: ${clientName}`, 20, yPosition)
    yPosition += 12

    // Quotation Items Table
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Items", 20, yPosition)
    yPosition += 10

    // Table headers
    doc.setFillColor(249, 249, 249)
    doc.rect(20, yPosition - 3, pageWidth - 40, 7, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Description", 22, yPosition + 2)
    doc.text("Qty", 100, yPosition + 2)
    doc.text("Unit Price", 120, yPosition + 2)
    doc.text("Line Total", 155, yPosition + 2)

    yPosition += 10

    // Table rows
    doc.setFont("helvetica", "normal")
    quotationItems.forEach((item) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 20
      }

      doc.text(item.description, 22, yPosition)
      doc.text(String(item.qty), 100, yPosition)
      doc.text(`${currency} ${item.unitPrice.toLocaleString()}`, 120, yPosition)
      doc.text(`${currency} ${item.lineTotal.toLocaleString()}`, 155, yPosition)
      yPosition += 8
    })

    yPosition += 5

    // Total
    doc.setFillColor(229, 229, 229)
    doc.rect(20, yPosition, pageWidth - 40, 8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Total", 22, yPosition + 5)
    doc.text(`${currency} ${quotationTotal.toLocaleString()}`, 155, yPosition + 5)
    yPosition += 15

    // Deposit & Valid Until
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Deposit Required", 20, yPosition)
    yPosition += 6
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`${currency} ${depositRequired.toLocaleString()}`, 20, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Valid Until", 20, yPosition)
    yPosition += 6
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(validUntil, 20, yPosition)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(102, 102, 102)
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      20,
      pageHeight - 10
    )

    doc.save(`Quotation - ${projectName}.pdf`)
  }

  const generatePaymentTranscriptPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Header
    doc.setFillColor(92, 46, 58) // Burgundy
    doc.rect(0, 0, pageWidth, 30, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("Payment Transcript", 20, 22)

    // Reset text color
    doc.setTextColor(26, 26, 26)
    yPosition = 45

    // Project Details
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Project Details", 20, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Project: ${projectName}`, 20, yPosition)
    yPosition += 6
    doc.text(`Type: ${projectType}`, 20, yPosition)
    yPosition += 6
    doc.text(`Client: ${clientName}`, 20, yPosition)
    yPosition += 12

    // Payment Summary
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Payment Summary", 20, yPosition)
    yPosition += 10

    // Table headers
    doc.setFillColor(249, 249, 249)
    doc.rect(20, yPosition - 3, pageWidth - 40, 7, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Date", 22, yPosition + 2)
    doc.text("Type", 60, yPosition + 2)
    doc.text("Amount", 100, yPosition + 2)
    doc.text("Method", 140, yPosition + 2)

    yPosition += 10

    // Table rows
    doc.setFont("helvetica", "normal")
    payments.forEach((payment) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = 20
      }

      doc.text(payment.date, 22, yPosition)
      const typeLabel = payment.type === "deposit" ? "Deposit" : "Payment"
      doc.text(typeLabel, 60, yPosition)
      doc.text(`${currency} ${payment.amount.toLocaleString()}`, 100, yPosition)
      doc.text(payment.method || "—", 140, yPosition)
      yPosition += 8
    })

    // Total Paid
    yPosition += 5
    doc.setFillColor(229, 229, 229)
    doc.rect(20, yPosition, pageWidth - 40, 8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    doc.text("Total Paid", 22, yPosition + 5)
    doc.text(`${currency} ${totalPaid.toLocaleString()}`, 140, yPosition + 5)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(102, 102, 102)
    yPosition = pageHeight - 10
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      20,
      yPosition
    )

    doc.save(`Payment Transcript - ${projectName}.pdf`)
  }

  const generateBalanceTranscriptPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Header
    doc.setFillColor(92, 46, 58) // Burgundy
    doc.rect(0, 0, pageWidth, 30, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("Balance Transcript", 20, 22)

    // Reset text color
    doc.setTextColor(26, 26, 26)
    yPosition = 45

    // Project Details
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Project Details", 20, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Project: ${projectName}`, 20, yPosition)
    yPosition += 6
    doc.text(`Type: ${projectType}`, 20, yPosition)
    yPosition += 6
    doc.text(`Client: ${clientName}`, 20, yPosition)
    yPosition += 12

    // Balance Summary Box
    doc.setFillColor(249, 249, 249)
    doc.rect(20, yPosition - 3, pageWidth - 40, 25, "F")
    doc.setFillColor(92, 46, 58)
    doc.rect(20, yPosition - 3, pageWidth - 40, 8, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Current Balance", 22, yPosition + 3)

    doc.setTextColor(26, 26, 26)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    const balanceColor: [number, number, number] = balance > 0 ? [200, 16, 46] : [76, 175, 80]
    doc.setTextColor(...balanceColor)
    doc.text(`${currency} ${balance.toLocaleString()}`, 22, yPosition + 18)

    yPosition += 30

    // Financial Breakdown
    doc.setTextColor(26, 26, 26)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Financial Breakdown", 20, yPosition)
    yPosition += 10

    // Breakdown items
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)

    doc.text("Quotation Total:", 20, yPosition)
    doc.setFont("helvetica", "bold")
    doc.text(`${currency} ${quotationTotal.toLocaleString()}`, pageWidth - 50, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.text("Total Paid:", 20, yPosition)
    doc.setFont("helvetica", "bold")
    doc.text(`${currency} ${totalPaid.toLocaleString()}`, pageWidth - 50, yPosition)
    yPosition += 8

    doc.setFont("helvetica", "normal")
    doc.text("Outstanding Balance:", 20, yPosition)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...balanceColor)
    doc.text(`${currency} ${balance.toLocaleString()}`, pageWidth - 50, yPosition)
    doc.setTextColor(26, 26, 26)
    yPosition += 15

    // Payment History
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("Payment Installments", 20, yPosition)
    yPosition += 10

    if (payments.length === 0) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text("No payments recorded yet", 20, yPosition)
    } else {
      // Table headers
      doc.setFillColor(249, 249, 249)
      doc.rect(20, yPosition - 3, pageWidth - 40, 7, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(9)
      doc.text("Date", 22, yPosition + 2)
      doc.text("Type", 70, yPosition + 2)
      doc.text("Amount", 120, yPosition + 2)
      doc.text("Method", 155, yPosition + 2)

      yPosition += 10

      // Table rows
      doc.setFont("helvetica", "normal")
      payments.forEach((payment) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = 20
        }

        doc.text(payment.date, 22, yPosition)
        const typeLabel = payment.type === "deposit" ? "Deposit" : "Payment"
        doc.text(typeLabel, 70, yPosition)
        doc.text(`${currency} ${payment.amount.toLocaleString()}`, 120, yPosition)
        doc.text(payment.method || "—", 155, yPosition)
        yPosition += 7
      })
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(102, 102, 102)
    yPosition = pageHeight - 10
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      20,
      yPosition
    )

    doc.save(`Balance Transcript - ${projectName}.pdf`)
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={generateQuotationPDF}
        className="btn-primary flex items-center gap-2"
      >
        <HugeiconsIcon icon={Download} className="size-4" />
        Download Quotation
      </button>

      <button
        onClick={generatePaymentTranscriptPDF}
        className="btn-secondary flex items-center gap-2"
      >
        <HugeiconsIcon icon={Download} className="size-4" />
        Payment Transcript
      </button>

      <button
        onClick={generateBalanceTranscriptPDF}
        className="btn-secondary flex items-center gap-2"
      >
        <HugeiconsIcon icon={Download} className="size-4" />
        Balance Transcript
      </button>
    </div>
  )
}
