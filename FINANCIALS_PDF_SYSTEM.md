# Financial PDF Generation System

## Overview

The `FinancialsPDFGenerator` component provides three professional PDF downloads for project financials:

1. **Quotation PDF** - Full quotation with itemized details
2. **Payment Transcript PDF** - Complete payment history
3. **Balance Transcript PDF** - Outstanding balance breakdown with payment installments

## Component Usage

```tsx
import { FinancialsPDFGenerator } from "@/components/FinancialsPDFGenerator"

<FinancialsPDFGenerator
  projectName="Wedding - James & Diana"
  projectType="Wedding"
  clientName="James Mwangi"
  quotationItems={[
    {
      description: "Groom morning suit (jacket, waistcoat, trousers)",
      qty: 1,
      unitPrice: 180000,
      lineTotal: 180000,
    },
    // ... more items
  ]}
  quotationTotal={350000}
  depositRequired={150000}
  validUntil="15 Mar 2026"
  payments={[
    {
      date: "12 Feb 2026",
      amount: 150000,
      type: "deposit",
      method: "Bank Transfer",
      reference: "TXN-001234",
    },
    {
      date: "10 Jul 2026",
      amount: 200000,
      type: "payment",
      method: "M-Pesa",
      reference: "REF-005678",
    },
  ]}
  balance={0}
  currency="KES"
/>
```

## PDF Features

### Quotation PDF
- Burgundy header with white text
- Project details (name, type, client)
- Itemized table with:
  - Description
  - Quantity
  - Unit Price
  - Line Total
- Quotation total (highlighted)
- Deposit required
- Valid until date
- Generated date footer

### Payment Transcript PDF
- Professional header styling
- Project identification
- Payment summary table with:
  - Date of payment
  - Payment type (Deposit/Payment)
  - Amount
  - Payment method
- Total paid calculation
- Generated date

### Balance Transcript PDF
- Comprehensive financial overview
- Prominent balance display (red for outstanding, green for settled)
- Financial breakdown showing:
  - Quotation total
  - Total paid
  - Outstanding balance
- Payment installments table with:
  - Date
  - Payment type
  - Amount
  - Payment method
- Multi-page support for long payment histories
- Generated date

## Styling

All PDFs feature:
- **Color Scheme**: Burgundy (#5C2E3A) headers with professional gray text
- **Font**: Helvetica with bold headers and normal body text
- **Layout**: Spacious margins (20px) and clear visual hierarchy
- **Tables**: Gray header backgrounds (#F9F9F9) for readability
- **Balance Highlighting**: Color-coded (red for outstanding, green for settled)

## File Naming

PDFs are automatically named following the pattern:
- `Quotation - {projectName}.pdf`
- `Payment Transcript - {projectName}.pdf`
- `Balance Transcript - {projectName}.pdf`

Example: `Balance Transcript - Wedding - James & Diana.pdf`

## Data Props

### Required Props
- `projectName` (string): Name of the project
- `projectType` (string): Type of commission (e.g., "Wedding")
- `clientName` (string): Name of the client

### Optional Props with Defaults
- `quotationItems` (QuotationItem[]): Array of items in quotation (default: `[]`)
- `quotationTotal` (number): Total quotation amount (default: `0`)
- `depositRequired` (number): Required deposit amount (default: `0`)
- `validUntil` (string): Quotation expiry date (default: `""`)
- `payments` (PaymentRecord[]): Array of payment records (default: `[]`)
- `balance` (number): Outstanding balance (default: `0`)
- `currency` (string): Currency code (default: `"KES"`)

## Payment Record Structure

```typescript
interface PaymentRecord {
  date: string           // Format: "DD MMM YYYY" (e.g., "12 Feb 2026")
  amount: number         // Amount in base currency units
  type: "deposit" | "payment"  // Type of payment
  method?: string        // Payment method (e.g., "Bank Transfer", "M-Pesa")
  reference?: string     // Transaction reference number
}
```

## Quotation Item Structure

```typescript
interface QuotationItem {
  description: string    // Item description
  qty: number           // Quantity
  unitPrice: number     // Price per unit
  lineTotal: number     // Total for line item (qty × unitPrice)
}
```

## Technical Details

- **Library**: jsPDF v4.2.1
- **Page Size**: A4 (default)
- **Text Color**: Burgundy (#5C2E3A) for headers, black (#1A1A1A) for body
- **Border & Fill Colors**: Light gray (#E5E5E5) for tables
- **Auto-page break**: For long payment histories in Balance Transcript
- **Client-side generation**: No server calls required

## Integration Example

```tsx
// In your Financials page component
import { FinancialsPDFGenerator } from "@/components/FinancialsPDFGenerator"

export const FinancialsPage = ({ project, quotation, payments, balance }) => {
  return (
    <div>
      <h1>Financials</h1>
      
      {/* PDF Download Buttons */}
      <FinancialsPDFGenerator
        projectName={project.title}
        projectType={project.type}
        clientName={project.clientName}
        quotationItems={quotation.items}
        quotationTotal={quotation.total}
        depositRequired={quotation.deposit}
        validUntil={quotation.validUntil}
        payments={payments}
        balance={balance}
        currency="KES"
      />
      
      {/* Rest of financials content */}
    </div>
  )
}
```

## Features

✅ Professional PDF generation on frontend  
✅ Three different document types  
✅ Burgundy branding throughout  
✅ Currency formatting with thousand separators  
✅ Auto-page breaks for long content  
✅ Automatic file naming with project details  
✅ Color-coded balance display  
✅ Payment method tracking  
✅ Clean, organized table layouts  
✅ Generated date footer on all PDFs  

## Notes

- All PDFs are generated completely on the frontend - no server uploads
- File names automatically include the project name for easy organization
- Currency is customizable via the `currency` prop
- Balance display color changes based on amount (red for outstanding, green for settled)
- All amounts are formatted with thousand separators for readability
- PDFs support multi-page documents automatically
