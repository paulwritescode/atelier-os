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

// ── Comments ──────────────────────────────────────────────────────────────

/** List comments for a specific story update */
export const listComments = query({
  args: { storyId: v.id("storyUpdates") },
  handler: async (ctx, { storyId }) => {
    return await ctx.db
      .query("storyComments")
      .withIndex("by_story", (q) => q.eq("storyId", storyId))
      .order("asc")
      .collect();
  },
});

/** Count comments per story for a project (for showing badges) */
export const commentCountsByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const comments = await ctx.db
      .query("storyComments")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const counts: Record<string, number> = {};
    for (const c of comments) {
      counts[c.storyId] = (counts[c.storyId] || 0) + 1;
    }
    return counts;
  },
});

/** Add a comment from a client (on the share page) */
export const addClientComment = mutation({
  args: {
    storyId: v.id("storyUpdates"),
    projectId: v.id("projects"),
    authorName: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("storyComments", {
      storyId: args.storyId,
      projectId: args.projectId,
      authorName: args.authorName,
      authorType: "client",
      text: args.text,
      createdAt: Date.now(),
    });
  },
});

/** Add a comment from staff (reply from the project panel) */
export const addStaffComment = mutation({
  args: {
    storyId: v.id("storyUpdates"),
    projectId: v.id("projects"),
    staffId: v.id("staff"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.staffId);
    return await ctx.db.insert("storyComments", {
      storyId: args.storyId,
      projectId: args.projectId,
      authorName: staff?.name ?? "Staff",
      authorType: "staff",
      text: args.text,
      createdAt: Date.now(),
    });
  },
});
