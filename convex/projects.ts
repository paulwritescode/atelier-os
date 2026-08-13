import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
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
    notes: v.optional(v.string()),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      slug: args.slug,
      title: args.title,
      primaryClientId: args.primaryClientId,
      type: args.type,
      status: "Draft",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });

    // Timeline event — ADR-010
    await ctx.db.insert("timelineEvents", {
      projectId,
      type: "Project Created",
      summary: `Project "${args.title}" created as ${args.type}.`,
      metadata: { type: args.type, status: "Draft" },
      createdBy: args.createdBy,
      createdAt: now,
    });

    return projectId;
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Wedding"),
        v.literal("Corporate"),
        v.literal("Individual"),
        v.literal("ClosetRevamp"),
        v.literal("GalaOutfit"),
        v.literal("Photoshoot"),
        v.literal("Alteration")
      )
    ),
    status: v.optional(
      v.union(
        v.literal("Draft"),
        v.literal("Active"),
        v.literal("OnHold"),
        v.literal("Completed"),
        v.literal("Archived")
      )
    ),
    updatedBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    const updates: Record<string, unknown> = { updatedAt: now };
    if (args.title !== undefined) updates.title = args.title;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.type !== undefined) updates.type = args.type;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.id, updates);

    // Timeline event for status changes
    if (args.status && args.status !== project.status) {
      await ctx.db.insert("timelineEvents", {
        projectId: args.id,
        type: "Status Changed",
        summary: `Project status changed from ${project.status} to ${args.status}.`,
        metadata: { from: project.status, to: args.status },
        createdBy: args.updatedBy,
        createdAt: now,
      });
    }

    return args.id;
  },
});

export const archive = mutation({
  args: { id: v.id("projects"), archivedBy: v.id("staff") },
  handler: async (ctx, { id, archivedBy }) => {
    const now = Date.now();
    await ctx.db.patch(id, {
      status: "Archived",
      archivedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: id,
      type: "Project Archived",
      summary: "Project has been archived.",
      metadata: {},
      createdBy: archivedBy,
      createdAt: now,
    });
  },
});

export const softDelete = mutation({
  args: { id: v.id("projects"), deletedBy: v.id("staff") },
  handler: async (ctx, { id, deletedBy }) => {
    const now = Date.now();
    await ctx.db.patch(id, { deletedAt: now, updatedAt: now });

    await ctx.db.insert("timelineEvents", {
      projectId: id,
      type: "Project Deleted",
      summary: "Project has been soft-deleted.",
      metadata: {},
      createdBy: deletedBy,
      createdAt: now,
    });
  },
});

// ── Sharing ───────────────────────────────────────────────────────────────

// ── Lifecycle Management ──────────────────────────────────────────────────

const LIFECYCLE_STAGES = [
  "Lead",
  "Consultation",
  "Design",
  "Quotation",
  "Deposit",
  "Measurements",
  "Production",
  "Fitting",
  "Final Payment",
  "Delivery",
  "Completed",
] as const;

/**
 * Mark the current lifecycle stage as complete and advance to the next one.
 * Persists the new stage on the project record and logs a timeline event.
 */
export const advanceLifecycleStage = mutation({
  args: {
    id: v.id("projects"),
    completedStage: v.string(), // The stage being marked as done
    updatedBy: v.id("staff"),
  },
  handler: async (ctx, { id, completedStage, updatedBy }) => {
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    const currentIndex = LIFECYCLE_STAGES.indexOf(
      completedStage as (typeof LIFECYCLE_STAGES)[number]
    );
    if (currentIndex === -1) throw new Error("Invalid lifecycle stage");

    const nextIndex = Math.min(currentIndex + 1, LIFECYCLE_STAGES.length - 1);
    const nextStage = LIFECYCLE_STAGES[nextIndex];
    const now = Date.now();

    await ctx.db.patch(id, {
      lifecycleStage: nextStage,
      updatedAt: now,
      // Auto-complete the project when we reach "Completed"
      ...(nextStage === "Completed" ? { status: "Completed" } : {}),
    });

    await ctx.db.insert("timelineEvents", {
      projectId: id,
      type: "Lifecycle Advanced",
      summary: `"${completedStage}" marked as complete. Now at "${nextStage}".`,
      metadata: { from: completedStage, to: nextStage },
      createdBy: updatedBy,
      createdAt: now,
    });

    return nextStage;
  },
});

/**
 * Set the lifecycle stage to a specific value (e.g. going back).
 */
export const setLifecycleStage = mutation({
  args: {
    id: v.id("projects"),
    stage: v.union(
      v.literal("Lead"),
      v.literal("Consultation"),
      v.literal("Design"),
      v.literal("Quotation"),
      v.literal("Deposit"),
      v.literal("Measurements"),
      v.literal("Production"),
      v.literal("Fitting"),
      v.literal("Final Payment"),
      v.literal("Delivery"),
      v.literal("Completed")
    ),
    updatedBy: v.id("staff"),
  },
  handler: async (ctx, { id, stage, updatedBy }) => {
    const project = await ctx.db.get(id);
    if (!project) throw new Error("Project not found");

    const now = Date.now();
    await ctx.db.patch(id, { lifecycleStage: stage, updatedAt: now });

    await ctx.db.insert("timelineEvents", {
      projectId: id,
      type: "Lifecycle Set",
      summary: `Lifecycle stage manually set to "${stage}".`,
      metadata: { stage },
      createdBy: updatedBy,
      createdAt: now,
    });

    return stage;
  },
});

export const setShareSettings = mutation({
  args: {
    id: v.id("projects"),
    isPubliclyShared: v.boolean(),
    sharePin: v.optional(v.string()), // null = no PIN, string = PIN-protected
    updatedBy: v.id("staff"),
  },
  handler: async (ctx, { id, isPubliclyShared, sharePin, updatedBy }) => {
    await ctx.db.patch(id, {
      isPubliclyShared,
      sharePin: sharePin || undefined,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("timelineEvents", {
      projectId: id,
      type: "Share Settings Updated",
      summary: isPubliclyShared
        ? `Project shared ${sharePin ? "with PIN protection" : "publicly"}.`
        : "Project share link disabled.",
      metadata: { isPubliclyShared, hasPinProtection: !!sharePin },
      createdBy: updatedBy,
      createdAt: Date.now(),
    });
  },
});

/** Verify share PIN for a project (used on shared links) */
export const verifySharePin = mutation({
  args: {
    slug: v.string(),
    pin: v.string(),
  },
  handler: async (ctx, { slug, pin }) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!project) return { valid: false };
    if (!project.sharePin) return { valid: true }; // no PIN required
    return { valid: project.sharePin === pin };
  },
});

// ── Public (shared link) access ────────────────────────────────────────────
// These power /share/[slug]. They must never leak internal data: no staff
// names, no cost breakdown, no notes.

/**
 * Minimal metadata for a share link — safe to call without a PIN.
 * Reveals only whether the link is live and whether a PIN is needed.
 */
export const getShareMeta = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!project || project.deletedAt || !project.isPubliclyShared) {
      return { available: false, requiresPin: false };
    }

    return { available: true, requiresPin: !!project.sharePin };
  },
});

/**
 * The client-facing view of a commission, gated by the share PIN.
 * Returns null when the link is off or the PIN does not match.
 */
export const getSharedProject = query({
  args: { slug: v.string(), pin: v.optional(v.string()) },
  handler: async (ctx, { slug, pin }) => {
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!project || project.deletedAt || !project.isPubliclyShared) return null;
    if (project.sharePin && project.sharePin !== pin) return null;

    const client = await ctx.db.get(project.primaryClientId);

    // Timeline, minus internal metadata and internal-only events. The client
    // has no interest in operational bookkeeping like share-link changes.
    const INTERNAL_EVENT_TYPES = new Set([
      "Share Settings Updated",
      "Project Deleted",
      "Status Changed",
    ]);

    const timeline = (
      await ctx.db
        .query("timelineEvents")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .order("asc")
        .collect()
    ).filter((e) => !INTERNAL_EVENT_TYPES.has(e.type));

    // Only stories still inside their 24h window.
    const now = Date.now();
    const stories = (
      await ctx.db
        .query("storyUpdates")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .order("desc")
        .collect()
    ).filter((s) => s.expiresAt > now && !s.movedToTimelineAt);

    // Headline figures only — never the line items.
    const quotation = await ctx.db
      .query("quotations")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .first();

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    const quotedTotal =
      quotation?.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) ?? 0;
    const received = payments.reduce(
      (s, p) => (p.type === "Refund" ? s - p.amount : s + p.amount),
      0
    );

    const garments = await ctx.db
      .query("garments")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    return {
      title: project.title,
      type: project.type,
      status: project.status,
      createdAt: project.createdAt,
      clientName: client?.name ?? null,
      timeline: timeline.map((e) => ({
        _id: e._id,
        type: e.type,
        summary: e.summary,
        createdAt: e.createdAt,
      })),
      stories: stories.map((s) => ({
        _id: s._id,
        text: s.text,
        mediaUrls: s.mediaUrls,
        publishedAt: s.publishedAt,
        expiresAt: s.expiresAt,
      })),
      financials: quotation
        ? {
            quotedTotal,
            received,
            balance: Math.max(quotedTotal - received, 0),
            status: quotation.status,
          }
        : null,
      garmentCount: garments.length,
      deliveredCount: garments.filter((g) => g.status === "Delivered").length,
    };
  },
});
