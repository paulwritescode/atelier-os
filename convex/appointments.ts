import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Queries ───────────────────────────────────────────────────────────────

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listUpcoming = query({
  args: { staffId: v.id("staff") },
  handler: async (ctx, { staffId }) => {
    const now = Date.now();
    return await ctx.db
      .query("appointments")
      .withIndex("by_staff", (q) => q.eq("staffId", staffId))
      .filter((q) => q.gte(q.field("scheduledAt"), now))
      .order("asc")
      .take(20);
  },
});

/**
 * All appointments across every commission, enriched with project + client.
 * Powers the Calendar and Appointments pages.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const appointments = await ctx.db.query("appointments").collect();

    return Promise.all(
      appointments.map(async (appointment) => {
        const project = await ctx.db.get(appointment.projectId);
        const client = project ? await ctx.db.get(project.primaryClientId) : null;
        const staff = await ctx.db.get(appointment.staffId);

        return {
          ...appointment,
          projectTitle: project?.title ?? "Unknown commission",
          projectSlug: project?.slug ?? null,
          clientName: client?.name ?? null,
          staffName: staff?.name ?? null,
        };
      })
    );
  },
});

/** Get appointment with enriched data for ticket generation */
export const getForTicket = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, { id }) => {
    const appointment = await ctx.db.get(id);
    if (!appointment) return null;

    const project = await ctx.db.get(appointment.projectId);
    const client = project ? await ctx.db.get(project.primaryClientId) : null;
    const staff = await ctx.db.get(appointment.staffId);
    const confirmedByStaff = appointment.confirmedBy
      ? await ctx.db.get(appointment.confirmedBy)
      : null;

    return {
      ...appointment,
      projectTitle: project?.title ?? "Unknown commission",
      clientName: client?.name ?? null,
      clientPhone: client?.phone ?? null,
      clientEmail: client?.email ?? null,
      staffName: staff?.name ?? null,
      confirmedByName: confirmedByStaff?.name ?? null,
    };
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────

/** Generate a unique ticket reference: APT-YYYY-NNNN */
function generateTicketRef(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `APT-${year}-${rand}`;
}

/**
 * Schedule a new appointment.
 * Status starts at "Scheduled" when staff creates it,
 * or "Requested" when initiated by client.
 */
export const schedule = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("Consultation"),
      v.literal("Measurement"),
      v.literal("Fitting"),
      v.literal("Pickup"),
      v.literal("SiteVisit")
    ),
    staffId: v.id("staff"),
    participantIds: v.array(v.id("participants")),
    scheduledAt: v.number(),
    durationMinutes: v.number(),
    isHomeVisit: v.boolean(),
    notes: v.optional(v.string()),
    location: v.optional(v.string()),
    requestedBy: v.optional(v.string()), // "staff" | "client"
    scheduledBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ticketRef = generateTicketRef();
    const isClientRequest = args.requestedBy === "client";

    const appointmentId = await ctx.db.insert("appointments", {
      projectId: args.projectId,
      type: args.type,
      status: isClientRequest ? "Requested" : "Scheduled",
      staffId: args.staffId,
      participantIds: args.participantIds,
      scheduledAt: args.scheduledAt,
      durationMinutes: args.durationMinutes,
      isHomeVisit: args.isHomeVisit,
      notes: args.notes,
      ticketRef,
      location: args.location,
      requestedBy: args.requestedBy ?? "staff",
      requestedAt: now,
      createdAt: now,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: args.projectId,
      type: isClientRequest ? "Appointment Requested" : "Appointment Scheduled",
      summary: `${args.type} appointment ${isClientRequest ? "requested" : "scheduled"}. Ref: ${ticketRef}`,
      metadata: { appointmentId, type: args.type, scheduledAt: args.scheduledAt, ticketRef },
      createdBy: args.scheduledBy,
      createdAt: now,
    });

    return appointmentId;
  },
});

/**
 * Confirm an appointment — moves from Requested/Scheduled → Confirmed.
 */
export const confirm = mutation({
  args: {
    id: v.id("appointments"),
    confirmedBy: v.id("staff"),
  },
  handler: async (ctx, { id, confirmedBy }) => {
    const appointment = await ctx.db.get(id);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.status === "Confirmed") {
      throw new Error("Appointment is already confirmed");
    }
    if (appointment.status === "Completed" || appointment.status === "Cancelled") {
      throw new Error(`Cannot confirm a ${appointment.status.toLowerCase()} appointment`);
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      status: "Confirmed",
      confirmedBy,
      confirmedAt: now,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: appointment.projectId,
      type: "Appointment Confirmed",
      summary: `${appointment.type} appointment confirmed. Ref: ${appointment.ticketRef ?? "—"}`,
      metadata: { appointmentId: id, ticketRef: appointment.ticketRef },
      createdBy: confirmedBy,
      createdAt: now,
    });
  },
});

/**
 * Complete an appointment.
 */
export const complete = mutation({
  args: {
    id: v.id("appointments"),
    completedBy: v.id("staff"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, completedBy, notes }) => {
    const appointment = await ctx.db.get(id);
    if (!appointment) throw new Error("Appointment not found");

    const now = Date.now();
    const updates: Record<string, unknown> = {
      status: "Completed",
      completedBy,
      completedAt: now,
    };
    if (notes !== undefined) updates.notes = notes;

    await ctx.db.patch(id, updates);

    await ctx.db.insert("timelineEvents", {
      projectId: appointment.projectId,
      type: `${appointment.type} Completed`,
      summary: `${appointment.type} appointment completed. Ref: ${appointment.ticketRef ?? "—"}`,
      metadata: { appointmentId: id, ticketRef: appointment.ticketRef },
      createdBy: completedBy,
      createdAt: now,
    });
  },
});

/**
 * Cancel an appointment with a reason.
 */
export const cancel = mutation({
  args: {
    id: v.id("appointments"),
    cancelledBy: v.id("staff"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, cancelledBy, reason }) => {
    const appointment = await ctx.db.get(id);
    if (!appointment) throw new Error("Appointment not found");

    if (appointment.status === "Completed") {
      throw new Error("Cannot cancel a completed appointment");
    }

    const now = Date.now();
    await ctx.db.patch(id, {
      status: "Cancelled",
      cancelledBy,
      cancelledAt: now,
      cancelReason: reason,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: appointment.projectId,
      type: "Appointment Cancelled",
      summary: `${appointment.type} appointment cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      metadata: { appointmentId: id, reason, ticketRef: appointment.ticketRef },
      createdBy: cancelledBy,
      createdAt: now,
    });
  },
});

/**
 * General status update — kept for backward compatibility.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.union(
      v.literal("Requested"),
      v.literal("Scheduled"),
      v.literal("Confirmed"),
      v.literal("Completed"),
      v.literal("Cancelled"),
      v.literal("NoShow")
    ),
    updatedBy: v.id("staff"),
  },
  handler: async (ctx, { id, status, updatedBy }) => {
    const appointment = await ctx.db.get(id);
    if (!appointment) throw new Error("Appointment not found");

    const now = Date.now();
    const updates: Record<string, unknown> = { status };

    // Track workflow transitions
    if (status === "Confirmed" && !appointment.confirmedAt) {
      updates.confirmedBy = updatedBy;
      updates.confirmedAt = now;
    }
    if (status === "Completed" && !appointment.completedAt) {
      updates.completedBy = updatedBy;
      updates.completedAt = now;
    }
    if (status === "Cancelled" && !appointment.cancelledAt) {
      updates.cancelledBy = updatedBy;
      updates.cancelledAt = now;
    }

    await ctx.db.patch(id, updates);

    await ctx.db.insert("timelineEvents", {
      projectId: appointment.projectId,
      type: `Appointment ${status}`,
      summary: `${appointment.type} appointment status changed to ${status}.`,
      metadata: { appointmentId: id, from: appointment.status, to: status },
      createdBy: updatedBy,
      createdAt: now,
    });
  },
});

/**
 * Update appointment details (reschedule, change location, notes).
 */
export const update = mutation({
  args: {
    id: v.id("appointments"),
    scheduledAt: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    isHomeVisit: v.optional(v.boolean()),
    updatedBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.id);
    if (!appointment) throw new Error("Appointment not found");

    const updates: Record<string, unknown> = {};
    if (args.scheduledAt !== undefined) updates.scheduledAt = args.scheduledAt;
    if (args.durationMinutes !== undefined) updates.durationMinutes = args.durationMinutes;
    if (args.location !== undefined) updates.location = args.location;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.isHomeVisit !== undefined) updates.isHomeVisit = args.isHomeVisit;

    await ctx.db.patch(args.id, updates);

    if (args.scheduledAt !== undefined && args.scheduledAt !== appointment.scheduledAt) {
      await ctx.db.insert("timelineEvents", {
        projectId: appointment.projectId,
        type: "Appointment Rescheduled",
        summary: `${appointment.type} appointment rescheduled. Ref: ${appointment.ticketRef ?? "—"}`,
        metadata: {
          appointmentId: args.id,
          from: appointment.scheduledAt,
          to: args.scheduledAt,
        },
        createdBy: args.updatedBy,
        createdAt: Date.now(),
      });
    }
  },
});
