import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Expire stories every hour — moves 24h-old stories to timeline
crons.interval("expire stories", { hours: 1 }, internal.jobs.expireStories);

// Send appointment reminders daily at 8am UTC (11am Nairobi)
crons.daily(
  "appointment reminders",
  { hourUTC: 8, minuteUTC: 0 },
  internal.jobs.sendAppointmentReminders
);

// Send payment reminders weekly on Monday at 9am UTC (12pm Nairobi)
crons.weekly(
  "payment reminders",
  { dayOfWeek: "monday", hourUTC: 9, minuteUTC: 0 },
  internal.jobs.sendPaymentReminders
);

// Cleanup expired media daily at 3am UTC (6am Nairobi)
crons.daily(
  "cleanup expired media",
  { hourUTC: 3, minuteUTC: 0 },
  internal.jobs.cleanupExpiredMedia
);

export default crons;
