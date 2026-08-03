// convex/schema.ts — Anio Regalia OS Domain Schema
// Ref: Business domain.md, Appendix.md §Identifiers §Currency §Date & Time
// ADR-025: NO organizationId, tenantId, or workspaceId on ANY table.
// ADR-009: Measurements are append-only.
// ADR-010: Timeline is append-only.
// Appendix §Currency: All monetary amounts are integers (smallest unit).
// Appendix §Date & Time: All timestamps stored as numbers (epoch ms) or strings (ISO-8601).

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Staff ──────────────────────────────────────────────────────────────
  staff: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("Owner"),
      v.literal("Admin"),
      v.literal("Tailor"),
      v.literal("Designer"),
      v.literal("Production"),
      v.literal("Reception"),
      v.literal("Accountant")
    ),
    // PIN-based auth — system-generated, owner can rotate or set custom
    pin: v.string(),
    pinUpdatedAt: v.optional(v.number()),
    lastSignInAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_name", ["name"]),

  // ── Clients ────────────────────────────────────────────────────────────
  clients: defineTable({
    name: v.string(),
    // Optional — many atelier clients are reachable by phone only.
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    type: v.union(
      v.literal("Individual"),
      v.literal("Family"),
      v.literal("Corporate"),
      v.literal("WeddingHost"),
      v.literal("EventOrganizer")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("staff"),
  })
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" }),

  // ── Projects ───────────────────────────────────────────────────────────
  projects: defineTable({
    slug: v.string(),
    title: v.string(),
    primaryClientId: v.id("clients"),
    type: v.union(
      v.literal("Wedding"),
      v.literal("Corporate"),
      v.literal("Individual"),
      v.literal("ClosetRevamp"),
      v.literal("GalaOutfit"),
      v.literal("Photoshoot"),
      v.literal("Alteration")
    ),
    status: v.union(
      v.literal("Draft"),
      v.literal("Active"),
      v.literal("OnHold"),
      v.literal("Completed"),
      v.literal("Archived")
    ),
    notes: v.optional(v.string()),
    // Sharing — optional PIN protection for shared links
    sharePin: v.optional(v.string()),      // null = public, set = PIN-protected
    isPubliclyShared: v.optional(v.boolean()), // explicit public share toggle
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("staff"),
    archivedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_primaryClient", ["primaryClientId"])
    .searchIndex("search_title", { searchField: "title" }),

  // ── Participants ───────────────────────────────────────────────────────
  participants: defineTable({
    projectId: v.id("projects"),
    clientId: v.id("clients"),
    role: v.string(),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_client", ["clientId"]),

  // ── Measurements (append-only — ADR-009) ───────────────────────────────
  measurements: defineTable({
    participantId: v.id("participants"),
    version: v.number(),
    chest: v.number(),
    waist: v.number(),
    hips: v.number(),
    height: v.number(),
    inseam: v.number(),
    shoulder: v.number(),
    sleeve: v.number(),
    neck: v.number(),
    weight: v.optional(v.number()),
    notes: v.optional(v.string()),
    takenBy: v.id("staff"),
    takenAt: v.number(),
  }).index("by_participant", ["participantId"]),

  // ── Garments ───────────────────────────────────────────────────────────
  garments: defineTable({
    participantId: v.id("participants"),
    projectId: v.id("projects"),
    type: v.string(),
    status: v.union(
      v.literal("Pending"),
      v.literal("InProduction"),
      v.literal("ReadyForFitting"),
      v.literal("ReadyForDelivery"),
      v.literal("Delivered")
    ),
    measurementId: v.id("measurements"),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    createdBy: v.id("staff"),
  })
    .index("by_project", ["projectId"])
    .index("by_participant", ["participantId"]),

  // ── Production Records ─────────────────────────────────────────────────
  productionRecords: defineTable({
    garmentId: v.id("garments"),
    stage: v.union(
      v.literal("DesignApproved"),
      v.literal("FabricReady"),
      v.literal("Pattern"),
      v.literal("Cutting"),
      v.literal("Stitching"),
      v.literal("Finishing"),
      v.literal("Pressing"),
      v.literal("QualityCheck"),
      v.literal("Ready")
    ),
    notes: v.optional(v.string()),
    updatedBy: v.id("staff"),
    updatedAt: v.number(),
  }).index("by_garment", ["garmentId"]),

  // ── Consultations ──────────────────────────────────────────────────────
  consultations: defineTable({
    projectId: v.id("projects"),
    conductedBy: v.id("staff"),
    requirements: v.string(),
    styleNotes: v.optional(v.string()),
    budget: v.optional(v.number()),
    timeline: v.optional(v.string()),
    references: v.array(v.string()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // ── Designs ────────────────────────────────────────────────────────────
  designs: defineTable({
    consultationId: v.id("consultations"),
    projectId: v.id("projects"),
    style: v.string(),
    fabric: v.string(),
    color: v.string(),
    accessories: v.optional(v.string()),
    references: v.array(v.string()),
    notes: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    createdAt: v.number(),
    createdBy: v.id("staff"),
  }).index("by_project", ["projectId"]),

  // ── Quotations ─────────────────────────────────────────────────────────
  quotations: defineTable({
    designId: v.id("designs"),
    projectId: v.id("projects"),
    items: v.array(
      v.object({
        id: v.string(),
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(), // integer — smallest currency unit
      })
    ),
    depositAmount: v.number(), // integer
    validUntil: v.number(),
    status: v.union(
      v.literal("Draft"),
      v.literal("Sent"),
      v.literal("Accepted"),
      v.literal("Rejected"),
      v.literal("Expired")
    ),
    sentAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    createdAt: v.number(),
    createdBy: v.id("staff"),
  }).index("by_project", ["projectId"]),

  // ── Payments (immutable — Appendix §Payments) ──────────────────────────
  payments: defineTable({
    projectId: v.id("projects"),
    quotationId: v.optional(v.id("quotations")),
    type: v.union(
      v.literal("Deposit"),
      v.literal("Installment"),
      v.literal("Balance"),
      v.literal("Refund")
    ),
    status: v.union(
      v.literal("Pending"),
      v.literal("Partial"),
      v.literal("Paid"),
      v.literal("Refunded")
    ),
    amount: v.number(), // integer, smallest currency unit — NEVER float
    recordedBy: v.id("staff"),
    paidAt: v.number(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // ── Appointments ───────────────────────────────────────────────────────
  appointments: defineTable({
    projectId: v.id("projects"),
    type: v.union(
      v.literal("Consultation"),
      v.literal("Measurement"),
      v.literal("Fitting"),
      v.literal("Pickup"),
      v.literal("SiteVisit")
    ),
    status: v.union(
      v.literal("Scheduled"),
      v.literal("Confirmed"),
      v.literal("Completed"),
      v.literal("Cancelled"),
      v.literal("NoShow")
    ),
    staffId: v.id("staff"),
    participantIds: v.array(v.id("participants")),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    isHomeVisit: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_staff", ["staffId"])
    .index("by_date", ["scheduledAt"]),

  // ── Timeline Events (append-only — ADR-010) ────────────────────────────
  timelineEvents: defineTable({
    projectId: v.id("projects"),
    type: v.string(), // past-tense per Appendix §Timeline Events
    summary: v.string(),
    metadata: v.any(),
    createdBy: v.id("staff"),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // ── Story Updates ──────────────────────────────────────────────────────
  storyUpdates: defineTable({
    projectId: v.id("projects"),
    text: v.optional(v.string()),
    mediaUrls: v.array(v.string()),
    publishedAt: v.number(),
    expiresAt: v.number(), // publishedAt + 24h
    movedToTimelineAt: v.optional(v.number()),
    createdBy: v.id("staff"),
  }).index("by_project", ["projectId"]),

  // ── Documents ──────────────────────────────────────────────────────────
  documents: defineTable({
    projectId: v.id("projects"),
    type: v.union(
      v.literal("Quotation"),
      v.literal("Invoice"),
      v.literal("Receipt"),
      v.literal("MeasurementSheet"),
      v.literal("DeliveryNote")
    ),
    data: v.any(), // structured data only — never a PDF blob (ADR-007/008)
    version: v.number(),
    createdAt: v.number(),
    createdBy: v.id("staff"),
  }).index("by_project", ["projectId"]),

  // ── Notifications ──────────────────────────────────────────────────────
  notifications: defineTable({
    recipientId: v.string(), // staff._id or clients._id as string
    recipientType: v.union(v.literal("staff"), v.literal("client")),
    type: v.string(),
    message: v.string(),
    readAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_recipient", ["recipientId"]),

  // ── Media metadata (for R2 objects) ────────────────────────────────────
  media: defineTable({
    key: v.string(), // R2 object key
    projectId: v.id("projects"),
    type: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("voiceNote")
    ),
    mimeType: v.string(),
    size: v.number(),
    uploadedBy: v.id("staff"),
    uploadedAt: v.number(),
    archived: v.optional(v.boolean()),
    retainUntil: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_key", ["key"]),
});
