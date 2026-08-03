import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    type: v.union(
      v.literal("Individual"),
      v.literal("Family"),
      v.literal("Corporate"),
      v.literal("WeddingHost"),
      v.literal("EventOrganizer")
    ),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("clients", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      type: args.type,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Individual"),
        v.literal("Family"),
        v.literal("Corporate"),
        v.literal("WeddingHost"),
        v.literal("EventOrganizer")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
    return id;
  },
});
