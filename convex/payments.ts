// Payments are IMMUTABLE records — Appendix §Payments.
// NO update or delete mutation exists. Corrections are new Refund records.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const record = mutation({
  args: {
    projectId: v.id("projects"),
    quotationId: v.optional(v.id("quotations")),
    type: v.union(
      v.literal("Deposit"),
      v.literal("Installment"),
      v.literal("Balance"),
      v.literal("Refund")
    ),
    status: v.union(
      v.literal("Pending"),
      v.literal("Partial"),
      v.literal("Paid"),
      v.literal("Refunded")
    ),
    amount: v.number(), // integer, smallest currency unit
    recordedBy: v.id("staff"),
    paidAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const paymentId = await ctx.db.insert("payments", {
      projectId: args.projectId,
      quotationId: args.quotationId,
      type: args.type,
      status: args.status,
      amount: args.amount,
      recordedBy: args.recordedBy,
      paidAt: args.paidAt,
      createdAt: now,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: args.projectId,
      type: "Payment Received",
      summary: `${args.type} of KES ${(args.amount / 100).toLocaleString()} recorded.`,
      metadata: { paymentId, type: args.type, amount: args.amount },
      createdBy: args.recordedBy,
      createdAt: now,
    });

    return paymentId;
  },
});

// NO updatePayment mutation. Period.
// NO deletePayment mutation. Period.

/**
 * Payment summary for a project.
 * All amounts are integers in the smallest currency unit (Appendix §Currency).
 */
export const summaryByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const quotation = await ctx.db
      .query("quotations")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();

    const quotedTotal =
      quotation?.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      ) ?? 0;

    // Refunds reduce the received total.
    const received = payments.reduce(
      (sum, p) => (p.type === "Refund" ? sum - p.amount : sum + p.amount),
      0
    );

    const depositPaid = payments
      .filter((p) => p.type === "Deposit")
      .reduce((sum, p) => sum + p.amount, 0);

    const depositRequired = quotation?.depositAmount ?? 0;

    return {
      quotedTotal,
      received,
      balance: Math.max(quotedTotal - received, 0),
      depositPaid,
      depositRequired,
      // Only meaningful once a quotation sets a deposit — otherwise 0 >= 0
      // would read as "settled" before anything has been agreed.
      depositSatisfied: depositRequired > 0 && depositPaid >= depositRequired,
      paymentCount: payments.length,
      hasQuotation: !!quotation,
    };
  },
});

/**
 * Every payment across all commissions, with project + client context.
 * Powers the atelier-wide Payments ledger.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").collect();

    const rows = await Promise.all(
      payments.map(async (payment) => {
        const project = await ctx.db.get(payment.projectId);
        if (!project || project.deletedAt) return null;

        const client = await ctx.db.get(project.primaryClientId);

        return {
          ...payment,
          projectTitle: project.title,
          projectSlug: project.slug,
          clientName: client?.name ?? null,
        };
      })
    );

    return rows
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.paidAt - a.paidAt);
  },
});

/** Atelier-wide totals for the dashboard and payments page. */
export const totals = query({
  args: {},
  handler: async (ctx) => {
    const payments = await ctx.db.query("payments").collect();
    const quotations = await ctx.db.query("quotations").collect();

    const received = payments.reduce(
      (sum, p) => (p.type === "Refund" ? sum - p.amount : sum + p.amount),
      0
    );

    // Only commissions with an accepted quotation count as committed revenue.
    const quotedAccepted = quotations
      .filter((q) => q.status === "Accepted")
      .reduce(
        (sum, q) =>
          sum + q.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
        0
      );

    return {
      received,
      quotedAccepted,
      outstanding: Math.max(quotedAccepted - received, 0),
      paymentCount: payments.length,
    };
  },
});
