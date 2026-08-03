import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 client — media storage for Anio Regalia OS.
 *
 * Ref: Technical architecture.md §Cloudflare R2
 * Ref: ADR-005 (R2 for binary assets — images, videos, voice notes)
 * Ref: Technical architecture.md §Security "Signed URLs for media access"
 *
 * Environment variables required:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME
 */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "anio-regalia-media";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a presigned PUT URL for uploading to R2.
 * Client uploads directly to R2 using this URL.
 *
 * @param key - Object key (e.g. "projectId/timestamp-filename.jpg")
 * @param contentType - MIME type of the file
 * @returns Presigned URL valid for 15 minutes
 */
export async function getUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes
}

/**
 * Generate a presigned GET URL for downloading from R2.
 * Never expose the R2 key directly — always serve via signed URL.
 *
 * @param key - Object key
 * @returns Presigned URL valid for 15 minutes
 */
export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes
}

/**
 * Delete an object from R2.
 * Called by the cleanupExpiredMedia job and manual deletion.
 *
 * @param key - Object key
 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}
