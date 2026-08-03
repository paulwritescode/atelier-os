import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByGarment = query({
  args: { garmentId: v.id("garments") },
  handler: async (ctx, { garmentId }) => {
    return await ctx.db
      .query("productionRecords")
      .withIndex("by_garment", (q) => q.eq("garmentId", garmentId))
      .order("desc")
      .collect();
  },
});

export const updateStage = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const garment = await ctx.db.get(args.garmentId);
    if (!garment) throw new Error("Garment not found");

    // Create new production record (snapshot)
    await ctx.db.insert("productionRecords", {
      garmentId: args.garmentId,
      stage: args.stage,
      notes: args.notes,
      updatedBy: args.updatedBy,
      updatedAt: now,
    });

    // Update garment status if stage implies it
    if (args.stage === "Ready") {
      await ctx.db.patch(args.garmentId, { status: "ReadyForFitting" });
    } else if (garment.status === "Pending") {
      await ctx.db.patch(args.garmentId, { status: "InProduction" });
    }

    await ctx.db.insert("timelineEvents", {
      projectId: garment.projectId,
      type: "Production Stage Updated",
      summary: `Garment "${garment.type}" moved to ${args.stage}.`,
      metadata: { garmentId: args.garmentId, stage: args.stage },
      createdBy: args.updatedBy,
      createdAt: now,
    });
  },
});

/**
 * Garments for a project, each with its latest production stage.
 * Avoids an N+1 fetch from the client (one query instead of one per garment).
 */
export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const garments = await ctx.db
      .query("garments")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    return Promise.all(
      garments.map(async (garment) => {
        const latest = await ctx.db
          .query("productionRecords")
          .withIndex("by_garment", (q) => q.eq("garmentId", garment._id))
          .order("desc")
          .first();

        const participant = await ctx.db.get(garment.participantId);
        const client = participant ? await ctx.db.get(participant.clientId) : null;

        return {
          ...garment,
          currentStage: latest?.stage ?? null,
          stageUpdatedAt: latest?.updatedAt ?? null,
          participantRole: participant?.role ?? null,
          participantName: client?.name ?? null,
        };
      })
    );
  },
});

/**
 * Every garment across all active commissions, with its latest stage.
 * Powers the atelier-wide Production board.
 */
export const listAllActive = query({
  args: {},
  handler: async (ctx) => {
    const garments = await ctx.db.query("garments").collect();

    const rows = await Promise.all(
      garments.map(async (garment) => {
        const project = await ctx.db.get(garment.projectId);
        // Skip soft-deleted commissions.
        if (!project || project.deletedAt) return null;

        const latest = await ctx.db
          .query("productionRecords")
          .withIndex("by_garment", (q) => q.eq("garmentId", garment._id))
          .order("desc")
          .first();

        const participant = await ctx.db.get(garment.participantId);
        const client = participant ? await ctx.db.get(participant.clientId) : null;

        return {
          ...garment,
          currentStage: latest?.stage ?? null,
          stageUpdatedAt: latest?.updatedAt ?? null,
          participantRole: participant?.role ?? null,
          participantName: client?.name ?? null,
          projectTitle: project.title,
          projectSlug: project.slug,
          projectStatus: project.status,
        };
      })
    );

    return rows.filter((r): r is NonNullable<typeof r> => r !== null);
  },
});
