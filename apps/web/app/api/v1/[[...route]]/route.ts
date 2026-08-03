import { handle } from "hono/vercel";
import { app } from "@/lib/hono/app";

/**
 * Next.js API route handler — mounts the Hono app.
 * All /api/v1/* requests are handled by Hono.
 *
 * Routes:
 *   GET  /api/v1/health              — health check
 *   GET  /api/v1/projects/:slug/status — public project status
 *   POST /api/v1/media/upload        — generate R2 presigned URL
 *   GET  /api/v1/media/:key          — generate R2 download URL
 *   DELETE /api/v1/media/:key        — delete from R2
 *   POST /api/v1/webhooks/payments   — payment provider callback
 *   POST /api/v1/webhooks/email      — email delivery status
 *   POST /api/v1/webhooks/calendar   — calendar sync
 */
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
