import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("consultations")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    conductedBy: v.id("staff"),
    requirements: v.string(),
    styleNotes: v.optional(v.string()),
    budget: v.optional(v.number()),
    timeline: v.optional(v.string()),
    references: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("consultations", {
      projectId: args.projectId,
      conductedBy: args.conductedBy,
      requirements: args.requirements,
      styleNotes: args.styleNotes,
      budget: args.budget,
      timeline: args.timeline,
      references: args.references,
      createdAt: now,
    });
  },
});

export const complete = mutation({
  args: { id: v.id("consultations"), completedBy: v.id("staff") },
  handler: async (ctx, { id, completedBy }) => {
    const now = Date.now();
    const consultation = await ctx.db.get(id);
    if (!consultation) throw new Error("Consultation not found");

    await ctx.db.patch(id, { completedAt: now });

    await ctx.db.insert("timelineEvents", {
      projectId: consultation.projectId,
      type: "Consultation Completed",
      summary: "Initial consultation completed. Requirements gathered.",
      metadata: { consultationId: id },
      createdBy: completedBy,
      createdAt: now,
    });
  },
});
