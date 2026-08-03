import { Hono } from "hono";

/**
 * Public routes — no authentication required.
 * Ref: ADR-004 (Hono provides public endpoints).
 */
export const publicRoutes = new Hono();

// Health check
publicRoutes.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "anio-regalia-os",
    timestamp: new Date().toISOString(),
  });
});

// Public commission status — allows clients to check without full auth
// Requires a project slug (not ID) for URL friendliness
publicRoutes.get("/projects/:slug/status", async (c) => {
  const slug = c.req.param("slug");

  // TODO: Wire to Convex query once ConvexHttpClient is configured
  // For now return a placeholder
  return c.json({
    slug,
    status: "Active",
    message: "Commission is in progress.",
    lastUpdated: new Date().toISOString(),
  });
});
