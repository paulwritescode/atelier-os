// ADR-009: Measurements are APPEND-ONLY.
// NO update mutation exists. Every recording creates a new version.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByParticipant = query({
  args: { participantId: v.id("participants") },
  handler: async (ctx, { participantId }) => {
    return await ctx.db
      .query("measurements")
      .withIndex("by_participant", (q) =>
        q.eq("participantId", participantId)
      )
      .order("desc")
      .collect();
  },
});

export const record = mutation({
  args: {
    participantId: v.id("participants"),
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Determine next version number
    const existing = await ctx.db
      .query("measurements")
      .withIndex("by_participant", (q) =>
        q.eq("participantId", args.participantId)
      )
      .order("desc")
      .first();

    const version = existing ? existing.version + 1 : 1;

    const measurementId = await ctx.db.insert("measurements", {
      participantId: args.participantId,
      version,
      chest: args.chest,
      waist: args.waist,
      hips: args.hips,
      height: args.height,
      inseam: args.inseam,
      shoulder: args.shoulder,
      sleeve: args.sleeve,
      neck: args.neck,
      weight: args.weight,
      notes: args.notes,
      takenBy: args.takenBy,
      takenAt: now,
    });

    // Get participant to find projectId for timeline
    const participant = await ctx.db.get(args.participantId);
    if (participant) {
      await ctx.db.insert("timelineEvents", {
        projectId: participant.projectId,
        type: "Measurements Taken",
        summary: `Measurement v${version} recorded.`,
        metadata: { participantId: args.participantId, version },
        createdBy: args.takenBy,
        createdAt: now,
      });
    }

    return measurementId;
  },
});

// NO updateMeasurement exists. ADR-009.
// NO deleteMeasurement exists.
