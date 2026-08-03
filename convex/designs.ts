import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("designs")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();
  },
});

export const create = mutation({
  args: {
    consultationId: v.id("consultations"),
    projectId: v.id("projects"),
    style: v.string(),
    fabric: v.string(),
    color: v.string(),
    accessories: v.optional(v.string()),
    references: v.array(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("designs", {
      consultationId: args.consultationId,
      projectId: args.projectId,
      style: args.style,
      fabric: args.fabric,
      color: args.color,
      accessories: args.accessories,
      references: args.references,
      notes: args.notes,
      createdAt: now,
      createdBy: args.createdBy,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("designs"),
    style: v.optional(v.string()),
    fabric: v.optional(v.string()),
    color: v.optional(v.string()),
    accessories: v.optional(v.string()),
    references: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, filtered);
    return id;
  },
});

export const approve = mutation({
  args: { id: v.id("designs"), approvedBy: v.id("staff") },
  handler: async (ctx, { id, approvedBy }) => {
    const now = Date.now();
    const design = await ctx.db.get(id);
    if (!design) throw new Error("Design not found");

    await ctx.db.patch(id, { approvedAt: now });

    await ctx.db.insert("timelineEvents", {
      projectId: design.projectId,
      type: "Design Approved",
      summary: `Design "${design.style}" in ${design.fabric} approved.`,
      metadata: { designId: id },
      createdBy: approvedBy,
      createdAt: now,
    });
  },
});
