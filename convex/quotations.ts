import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("quotations")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();
  },
});

export const create = mutation({
  args: {
    designId: v.id("designs"),
    projectId: v.id("projects"),
    items: v.array(
      v.object({
        id: v.string(),
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
      })
    ),
    depositAmount: v.number(),
    validUntil: v.number(),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("quotations", {
      designId: args.designId,
      projectId: args.projectId,
      items: args.items,
      depositAmount: args.depositAmount,
      validUntil: args.validUntil,
      status: "Draft",
      createdAt: now,
      createdBy: args.createdBy,
    });
  },
});

export const send = mutation({
  args: { id: v.id("quotations"), sentBy: v.id("staff") },
  handler: async (ctx, { id, sentBy }) => {
    const now = Date.now();
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");

    await ctx.db.patch(id, { status: "Sent", sentAt: now });

    await ctx.db.insert("timelineEvents", {
      projectId: quotation.projectId,
      type: "Quotation Sent",
      summary: "Quotation sent to client for review.",
      metadata: { quotationId: id },
      createdBy: sentBy,
      createdAt: now,
    });
  },
});

export const accept = mutation({
  args: { id: v.id("quotations"), acceptedBy: v.id("staff") },
  handler: async (ctx, { id, acceptedBy }) => {
    const now = Date.now();
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");

    await ctx.db.patch(id, { status: "Accepted", acceptedAt: now });

    await ctx.db.insert("timelineEvents", {
      projectId: quotation.projectId,
      type: "Quotation Accepted",
      summary: "Client accepted the quotation.",
      metadata: { quotationId: id },
      createdBy: acceptedBy,
      createdAt: now,
    });
  },
});

export const reject = mutation({
  args: { id: v.id("quotations"), rejectedBy: v.id("staff") },
  handler: async (ctx, { id, rejectedBy }) => {
    const now = Date.now();
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");

    await ctx.db.patch(id, { status: "Rejected" });

    await ctx.db.insert("timelineEvents", {
      projectId: quotation.projectId,
      type: "Quotation Rejected",
      summary: "Client rejected the quotation.",
      metadata: { quotationId: id },
      createdBy: rejectedBy,
      createdAt: now,
    });
  },
});
