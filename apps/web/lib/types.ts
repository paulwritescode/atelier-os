// ── Anio Regalia OS — Domain Type System ──────────────────────────────────
// Ref: Business domain.md, Appendix.md §Identifiers §Currency §Date & Time
// ADR-025: No organizationId, tenantId, or workspaceId on any entity.
// ADR-009: Measurements are append-only — no updateMeasurement.
// ADR-010: Timeline is append-only — no update or delete.
// Appendix §Currency: All monetary amounts are integers (smallest unit, e.g. KES cents).
// Appendix §Date & Time: All timestamps are ISO-8601 UTC strings.

// ── ID alias types ─────────────────────────────────────────────────────────
export type StaffId = string
export type ClientId = string
export type ProjectId = string
export type ParticipantId = string
export type GarmentId = string
export type MeasurementId = string
export type AppointmentId = string
export type TimelineEventId = string
export type DocumentId = string

// ── Enums ──────────────────────────────────────────────────────────────────
export type StaffRole =
  | "Owner"
  | "Admin"
  | "Tailor"
  | "Designer"
  | "Production"
  | "Reception"
  | "Accountant"

export type ClientType =
  | "Individual"
  | "Family"
  | "Corporate"
  | "WeddingHost"
  | "EventOrganizer"

export type ProjectType =
  | "Wedding"
  | "Corporate"
  | "Individual"
  | "ClosetRevamp"
  | "GalaOutfit"
  | "Photoshoot"
  | "Alteration"

export type ProjectStatus = "Draft" | "Active" | "OnHold" | "Completed" | "Archived"

export type QuotationStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Rejected"
  | "Expired"

export type PaymentType = "Deposit" | "Installment" | "Balance" | "Refund"
export type PaymentStatus = "Pending" | "Partial" | "Paid" | "Refunded"

export type GarmentStatus =
  | "Pending"
  | "InProduction"
  | "ReadyForFitting"
  | "ReadyForDelivery"
  | "Delivered"

export type ProductionStage =
  | "DesignApproved"
  | "FabricReady"
  | "Pattern"
  | "Cutting"
  | "Stitching"
  | "Finishing"
  | "Pressing"
  | "QualityCheck"
  | "Ready"

export type AppointmentType =
  | "Consultation"
  | "Measurement"
  | "Fitting"
  | "Pickup"
  | "SiteVisit"

export type AppointmentStatus =
  | "Scheduled"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "NoShow"

export type DocumentType =
  | "Quotation"
  | "Invoice"
  | "Receipt"
  | "MeasurementSheet"
  | "DeliveryNote"

// ── Entity interfaces ──────────────────────────────────────────────────────
// NOTE: No organizationId on anything. ADR-025.
// NOTE: All timestamps are ISO-8601 UTC strings. Appendix §Date & Time.
// NOTE: All monetary amounts are integers (smallest currency unit). Appendix §Currency.

export interface Staff {
  id: StaffId
  role: StaffRole
  name: string
  email: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: ClientId
  type: ClientType
  name: string
  email: string
  phone?: string
  createdAt: string
  updatedAt: string
  createdBy: StaffId
}

export interface Project {
  id: ProjectId
  slug: string // human-readable URL slug (e.g. "james-diana-wedding")
  primaryClientId: ClientId
  type: ProjectType
  status: ProjectStatus
  title: string
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: StaffId
  archivedAt?: string
  deletedAt?: string // soft-delete only — ADR-017, Appendix §Projects
}

export type NewProjectInput = Pick<Project, "primaryClientId" | "type" | "title"> & {
  notes?: string
}
export type ProjectUpdate = Partial<Pick<Project, "title" | "notes" | "status">>

export interface Participant {
  id: ParticipantId
  projectId: ProjectId
  clientId: ClientId
  role: string
  createdAt: string
}

export interface Measurement {
  id: MeasurementId
  participantId: ParticipantId
  version: number // append-only — ADR-009. Always increment.
  chest: number
  waist: number
  hips: number
  height: number
  inseam: number
  shoulder: number
  sleeve: number
  neck: number
  weight?: number
  notes?: string
  takenBy: StaffId
  takenAt: string // ISO-8601 UTC
}

export interface Garment {
  id: GarmentId
  participantId: ParticipantId
  projectId: ProjectId
  type: string
  status: GarmentStatus
  measurementId: MeasurementId
  notes?: string
  createdAt: string
  createdBy: StaffId
}

export interface ProductionRecord {
  id: string
  garmentId: GarmentId
  stage: ProductionStage
  notes?: string
  updatedBy: StaffId
  updatedAt: string
}

export interface Consultation {
  id: string
  projectId: ProjectId
  conductedBy: StaffId
  requirements: string
  styleNotes?: string
  budget?: number // integer — Appendix §Currency
  timeline?: string
  references: string[]
  completedAt?: string
  createdAt: string
}

export interface Design {
  id: string
  consultationId: string
  projectId: ProjectId
  style: string
  fabric: string
  color: string
  accessories?: string
  references: string[]
  notes?: string
  approvedAt?: string
  createdAt: string
  createdBy: StaffId
}

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number // integer — Appendix §Currency
}

export interface Quotation {
  id: string
  designId: string
  projectId: ProjectId
  items: QuotationItem[]
  depositAmount: number // integer — Appendix §Currency
  validUntil: string
  status: QuotationStatus
  sentAt?: string
  acceptedAt?: string
  createdAt: string
  createdBy: StaffId
}

export interface Payment {
  id: string
  projectId: ProjectId
  quotationId?: string
  type: PaymentType
  status: PaymentStatus
  amount: number // integer, smallest currency unit — NEVER float. Appendix §Currency.
  recordedBy: StaffId
  paidAt: string
  createdAt: string
}

export interface Appointment {
  id: AppointmentId
  projectId: ProjectId
  type: AppointmentType
  status: AppointmentStatus
  staffId: StaffId
  participantIds: ParticipantId[]
  scheduledAt: string
  durationMinutes: number
  isHomeVisit: boolean
  notes?: string
  createdAt: string
}

export interface TimelineEvent {
  id: TimelineEventId
  projectId: ProjectId
  type: string // past-tense string per Appendix §Timeline Events
  summary: string
  metadata: Record<string, unknown>
  createdBy: StaffId
  createdAt: string
}

export interface StoryUpdate {
  id: string
  projectId: ProjectId
  text?: string
  mediaUrls: string[]
  publishedAt: string
  expiresAt: string // publishedAt + 24h
  movedToTimelineAt?: string
  createdBy: StaffId
}

export interface Document {
  id: DocumentId
  projectId: ProjectId
  type: DocumentType
  data: Record<string, unknown> // structured data only — never a PDF blob. ADR-007/ADR-008.
  version: number
  createdAt: string
  createdBy: StaffId
}

export interface Comment {
  id: string
  text: string
  author: string
  timestamp: string
}
