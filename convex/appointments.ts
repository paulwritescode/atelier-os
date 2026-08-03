import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    scheduledBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const appointmentId = await ctx.db.insert("appointments", {
      projectId: args.projectId,
      type: args.type,
      status: "Scheduled",
      staffId: args.staffId,
      participantIds: args.participantIds,
      scheduledAt: args.scheduledAt,
      durationMinutes: args.durationMinutes,
      isHomeVisit: args.isHomeVisit,
      notes: args.notes,
      createdAt: now,
    });

    await ctx.db.insert("timelineEvents", {
      projectId: args.projectId,
      type: "Appointment Scheduled",
      summary: `${args.type} appointment scheduled.`,
      metadata: { appointmentId, type: args.type, scheduledAt: args.scheduledAt },
      createdBy: args.scheduledBy,
      createdAt: now,
    });

    return appointmentId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.union(
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

    await ctx.db.patch(id, { status });

    if (status === "Completed") {
      await ctx.db.insert("timelineEvents", {
        projectId: appointment.projectId,
        type: `${appointment.type} Completed`,
        summary: `${appointment.type} appointment completed.`,
        metadata: { appointmentId: id },
        createdBy: updatedBy,
        createdAt: Date.now(),
      });
    }
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
