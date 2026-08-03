import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByRecipient = query({
  args: { recipientId: v.string() },
  handler: async (ctx, { recipientId }) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", recipientId))
      .order("desc")
      .take(50);
  },
});

export const countUnread = query({
  args: { recipientId: v.string() },
  handler: async (ctx, { recipientId }) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", recipientId))
      .filter((q) => q.eq(q.field("readAt"), undefined))
      .collect();
    return notifications.length;
  },
});

export const create = mutation({
  args: {
    recipientId: v.string(),
    recipientType: v.union(v.literal("staff"), v.literal("client")),
    type: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      recipientId: args.recipientId,
      recipientType: args.recipientType,
      type: args.type,
      message: args.message,
      createdAt: Date.now(),
    });
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { readAt: Date.now() });
  },
});

export const markAllRead = mutation({
  args: { recipientId: v.string() },
  handler: async (ctx, { recipientId }) => {
    const now = Date.now();
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", recipientId))
      .filter((q) => q.eq(q.field("readAt"), undefined))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { readAt: now });
    }
  },
});
