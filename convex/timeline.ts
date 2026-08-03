// Timeline is APPEND-ONLY — ADR-010.
// No update or delete mutations exist.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("timelineEvents")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.string(),
    summary: v.string(),
    metadata: v.any(),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("timelineEvents", {
      projectId: args.projectId,
      type: args.type,
      summary: args.summary,
      metadata: args.metadata,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

// NO update mutation. ADR-010.
// NO delete mutation. ADR-010.
