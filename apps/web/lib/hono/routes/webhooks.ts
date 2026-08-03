import { Hono } from "hono";

/**
 * Webhook receivers — external service callbacks.
 * Ref: ADR-004 (Hono for webhooks and integrations).
 *
 * Webhook endpoints verify signatures before processing.
 * They do NOT require BetterAuth session — they use provider-specific auth.
 */
export const webhookRoutes = new Hono();

// Payment provider webhook (placeholder — M-Pesa, Stripe, etc.)
webhookRoutes.post("/payments", async (c) => {
  const body = await c.req.text();

  // TODO: Verify webhook signature from payment provider
  // TODO: Parse payment confirmation
  // TODO: Call Convex mutation to record payment

  console.log("[Webhook] Payment notification received:", body.slice(0, 100));

  return c.json({ received: true });
});

// Email delivery status webhook (placeholder — Resend, SendGrid, etc.)
webhookRoutes.post("/email", async (c) => {
  const body = await c.req.json();

  // TODO: Verify webhook signature from email provider
  // TODO: Update notification delivery status

  console.log("[Webhook] Email status:", body);

  return c.json({ received: true });
});

// Calendar sync webhook (placeholder — Google Calendar, etc.)
webhookRoutes.post("/calendar", async (c) => {
  const body = await c.req.json();

  // TODO: Verify signature
  // TODO: Sync appointment changes

  console.log("[Webhook] Calendar sync:", body);

  return c.json({ received: true });
});
