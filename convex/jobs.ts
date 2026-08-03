// Scheduled jobs — ADR-021: automation over manual administration
import { internalMutation } from "./_generated/server";

/**
 * Expire stories that have passed their 24h window.
 * Moves them to the timeline as "Story Published" events.
 * Runs hourly via crons.ts.
 */
export const expireStories = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("storyUpdates")
      .filter((q) =>
        q.and(
          q.lt(q.field("expiresAt"), now),
          q.eq(q.field("movedToTimelineAt"), undefined)
        )
      )
      .collect();

    for (const story of expired) {
      await ctx.db.patch(story._id, { movedToTimelineAt: now });

      await ctx.db.insert("timelineEvents", {
        projectId: story.projectId,
        type: "Story Published",
        summary: story.text || "Story update published.",
        metadata: { storyId: story._id, mediaUrls: story.mediaUrls },
        createdBy: story.createdBy,
        createdAt: now,
      });
    }
  },
});

/**
 * Send appointment reminders for appointments within the next 24 hours.
 * Creates in-app notifications for staff and participants.
 * Runs daily via crons.ts.
 */
export const sendAppointmentReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const cutoff = now + twentyFourHours;

    const upcoming = await ctx.db
      .query("appointments")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledAt"), now),
          q.lte(q.field("scheduledAt"), cutoff),
          q.eq(q.field("status"), "Scheduled")
        )
      )
      .collect();

    for (const appointment of upcoming) {
      // Notify the assigned staff member
      await ctx.db.insert("notifications", {
        recipientId: appointment.staffId,
        recipientType: "staff",
        type: "AppointmentReminder",
        message: `You have a ${appointment.type} appointment tomorrow.`,
        createdAt: now,
      });

      // Notify each participant's client
      for (const participantId of appointment.participantIds) {
        const participant = await ctx.db.get(participantId);
        if (participant) {
          await ctx.db.insert("notifications", {
            recipientId: participant.clientId,
            recipientType: "client",
            type: "AppointmentReminder",
            message: `Your ${appointment.type} appointment is tomorrow.`,
            createdAt: now,
          });
        }
      }
    }
  },
});

/**
 * Send payment reminders for active projects with no completed payment.
 * Creates notifications for staff.
 * Runs weekly via crons.ts.
 */
export const sendPaymentReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const activeProjects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();

    for (const project of activeProjects) {
      const payments = await ctx.db
        .query("payments")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .filter((q) => q.eq(q.field("status"), "Paid"))
        .collect();

      // If no completed payments, send a reminder to staff
      if (payments.length === 0) {
        await ctx.db.insert("notifications", {
          recipientId: project.createdBy,
          recipientType: "staff",
          type: "PaymentReminder",
          message: `Project "${project.title}" has no completed payments.`,
          createdAt: now,
        });
      }
    }
  },
});

/**
 * Cleanup expired media from R2.
 * Finds media past retention period and marks for deletion.
 * Stub until R2 integration (Phase 4) is complete.
 * Runs daily via crons.ts.
 */
export const cleanupExpiredMedia = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("media")
      .filter((q) =>
        q.and(
          q.neq(q.field("retainUntil"), undefined),
          q.lt(q.field("retainUntil"), now),
          q.neq(q.field("archived"), true)
        )
      )
      .collect();

    for (const media of expired) {
      // TODO: Call R2 DELETE via Hono endpoint when Phase 4 is complete
      // For now, just remove the metadata record
      await ctx.db.delete(media._id);
    }
  },
});
