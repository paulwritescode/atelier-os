import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const listActive = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const now = Date.now();
    const stories = await ctx.db
      .query("storyUpdates")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();

    return stories.filter((s) => s.expiresAt > now && !s.movedToTimelineAt);
  },
});

export const listAll = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("storyUpdates")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    text: v.optional(v.string()),
    mediaUrls: v.array(v.string()),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("storyUpdates", {
      projectId: args.projectId,
      text: args.text,
      mediaUrls: args.mediaUrls,
      publishedAt: now,
      expiresAt: now + TWENTY_FOUR_HOURS,
      createdBy: args.createdBy,
    });
  },
});

export const expire = mutation({
  args: { id: v.id("storyUpdates"), expiredBy: v.id("staff") },
  handler: async (ctx, { id, expiredBy }) => {
    const now = Date.now();
    const story = await ctx.db.get(id);
    if (!story) throw new Error("Story not found");

    await ctx.db.patch(id, { movedToTimelineAt: now });

    await ctx.db.insert("timelineEvents", {
      projectId: story.projectId,
      type: "Story Published",
      summary: story.text || "Story update published.",
      metadata: { storyId: id, mediaUrls: story.mediaUrls },
      createdBy: expiredBy,
      createdAt: now,
    });
  },
});
