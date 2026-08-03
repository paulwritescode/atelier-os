// Documents store structured data only — ADR-007/008.
// NO mutation stores a PDF blob. PDFs are generated on demand.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("Quotation"),
      v.literal("Invoice"),
      v.literal("Receipt"),
      v.literal("MeasurementSheet"),
      v.literal("DeliveryNote")
    ),
    data: v.any(),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    // Determine version
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .first();

    const version = existing ? existing.version + 1 : 1;

    return await ctx.db.insert("documents", {
      projectId: args.projectId,
      type: args.type,
      data: args.data,
      version,
      createdAt: Date.now(),
      createdBy: args.createdBy,
    });
  },
});

/**
 * Every document across all commissions, with project + client context.
 * Powers the atelier-wide Documents page.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db.query("documents").collect();

    const rows = await Promise.all(
      documents.map(async (document) => {
        const project = await ctx.db.get(document.projectId);
        if (!project || project.deletedAt) return null;

        const client = await ctx.db.get(project.primaryClientId);

        return {
          ...document,
          projectTitle: project.title,
          projectSlug: project.slug,
          clientName: client?.name ?? null,
        };
      })
    );

    return rows
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});
