import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { publicRoutes } from "./routes/public";
import { mediaRoutes } from "./routes/media";
import { webhookRoutes } from "./routes/webhooks";

/**
 * Hono API application — Anio Regalia OS
 *
 * Hono is for EXTERNAL/PUBLIC APIs only (ADR-004):
 *   - Public status endpoints
 *   - R2 media upload orchestration
 *   - Webhook receivers (payment providers, email)
 *   - Future third-party integrations
 *
 * Primary data access: Convex useQuery/useMutation (NOT Hono).
 * No organizational prefixes in URLs (ADR-025 — one atelier).
 */
const app = new Hono().basePath("/api/v1");

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Mount route groups
app.route("/", publicRoutes);
app.route("/media", mediaRoutes);
app.route("/webhooks", webhookRoutes);

export { app };
export type AppType = typeof app;
