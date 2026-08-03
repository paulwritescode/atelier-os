import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("garments")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const listByParticipant = query({
  args: { participantId: v.id("participants") },
  handler: async (ctx, { participantId }) => {
    return await ctx.db
      .query("garments")
      .withIndex("by_participant", (q) =>
        q.eq("participantId", participantId)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    participantId: v.id("participants"),
    projectId: v.id("projects"),
    type: v.string(),
    measurementId: v.id("measurements"),
    notes: v.optional(v.string()),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const garmentId = await ctx.db.insert("garments", {
      participantId: args.participantId,
      projectId: args.projectId,
      type: args.type,
      status: "Pending",
      measurementId: args.measurementId,
      notes: args.notes,
      createdAt: now,
      createdBy: args.createdBy,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: args.projectId,
      type: "Garment Created",
      summary: `Garment "${args.type}" added to production queue.`,
      metadata: { garmentId, type: args.type },
      createdBy: args.createdBy,
      createdAt: now,
    });

    return garmentId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("garments"),
    status: v.union(
      v.literal("Pending"),
      v.literal("InProduction"),
      v.literal("ReadyForFitting"),
      v.literal("ReadyForDelivery"),
      v.literal("Delivered")
    ),
    updatedBy: v.id("staff"),
  },
  handler: async (ctx, { id, status, updatedBy }) => {
    const garment = await ctx.db.get(id);
    if (!garment) throw new Error("Garment not found");

    await ctx.db.patch(id, { status });

    await ctx.db.insert("timelineEvents", {
      projectId: garment.projectId,
      type: "Garment Status Updated",
      summary: `Garment "${garment.type}" status changed to ${status}.`,
      metadata: { garmentId: id, from: garment.status, to: status },
      createdBy: updatedBy,
      createdAt: Date.now(),
    });
  },
});
