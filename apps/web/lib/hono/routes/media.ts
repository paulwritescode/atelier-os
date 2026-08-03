import { Hono } from "hono";
import { getUploadUrl, getDownloadUrl, deleteObject } from "@/lib/r2";

/**
 * Media routes — R2 upload/download/delete orchestration.
 * Ref: Technical architecture.md §Cloudflare R2
 * Ref: ADR-005 (R2 for media), Appendix §File Standards
 *
 * All endpoints require authentication.
 * File type validation per Appendix §File Standards:
 *   Images: JPG, PNG, WebP
 *   Videos: MP4 (max 30 seconds — enforced client-side)
 *   Voice Notes: WebM, MP3
 */
export const mediaRoutes = new Hono();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "audio/webm",
  "audio/mpeg",
];

// Generate presigned upload URL
mediaRoutes.post("/upload", async (c) => {
  // TODO: Validate BetterAuth session from cookie/header
  const body = await c.req.json<{
    filename: string;
    contentType: string;
    projectId: string;
  }>();

  if (!body.filename || !body.contentType || !body.projectId) {
    return c.json({ error: "Missing required fields: filename, contentType, projectId" }, 400);
  }

  if (!ALLOWED_MIME_TYPES.includes(body.contentType)) {
    return c.json(
      { error: `Unsupported file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}` },
      400
    );
  }

  // Generate a unique key: projectId/timestamp-filename
  const key = `${body.projectId}/${Date.now()}-${body.filename}`;

  try {
    const uploadUrl = await getUploadUrl(key, body.contentType);
    return c.json({ uploadUrl, key });
  } catch (error) {
    console.error("Failed to generate upload URL:", error);
    return c.json({ error: "Failed to generate upload URL" }, 500);
  }
});

// Generate presigned download URL (short TTL)
mediaRoutes.get("/:key{.+}", async (c) => {
  const key = c.req.param("key");

  try {
    const downloadUrl = await getDownloadUrl(key);
    return c.json({ downloadUrl });
  } catch (error) {
    console.error("Failed to generate download URL:", error);
    return c.json({ error: "Failed to generate download URL" }, 500);
  }
});

// Delete media object from R2
mediaRoutes.delete("/:key{.+}", async (c) => {
  // TODO: Validate staff role (Owner/Admin only for deletion)
  const key = c.req.param("key");

  try {
    await deleteObject(key);
    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return c.json({ error: "Failed to delete media" }, 500);
  }
});
