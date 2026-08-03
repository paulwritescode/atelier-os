import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("participants")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("participants") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const add = mutation({
  args: {
    projectId: v.id("projects"),
    clientId: v.id("clients"),
    role: v.string(),
    addedBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const participantId = await ctx.db.insert("participants", {
      projectId: args.projectId,
      clientId: args.clientId,
      role: args.role,
      createdAt: now,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: args.projectId,
      type: "Participant Added",
      summary: `Participant added with role "${args.role}".`,
      metadata: { clientId: args.clientId, role: args.role },
      createdBy: args.addedBy,
      createdAt: now,
    });

    return participantId;
  },
});

/**
 * Participants for a project, enriched with client name and counts.
 * One query instead of a fetch per participant from the client.
 */
export const listByProjectDetailed = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    return Promise.all(
      participants.map(async (participant) => {
        const client = await ctx.db.get(participant.clientId);

        const measurements = await ctx.db
          .query("measurements")
          .withIndex("by_participant", (q) =>
            q.eq("participantId", participant._id)
          )
          .order("desc")
          .collect();

        const garments = await ctx.db
          .query("garments")
          .withIndex("by_participant", (q) =>
            q.eq("participantId", participant._id)
          )
          .collect();

        return {
          ...participant,
          clientName: client?.name ?? "Unknown",
          clientType: client?.type ?? null,
          measurementCount: measurements.length,
          latestMeasurementVersion: measurements[0]?.version ?? null,
          latestMeasurementId: measurements[0]?._id ?? null,
          garmentCount: garments.length,
        };
      })
    );
  },
});
