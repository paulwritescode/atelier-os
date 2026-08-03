/**
 * Convex auth helper — role-based access control.
 *
 * PIN verification lives in convex/auth.ts.
 * These helpers check roles inside mutations/queries. The staffId is passed
 * from the client (read from the localStorage session).
 *
 * ADR-020: Business logic lives on the backend. Never trust the client.
 */
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export type StaffRole =
  | "Owner"
  | "Admin"
  | "Tailor"
  | "Designer"
  | "Production"
  | "Reception"
  | "Accountant";

/** Fetch a staff member by ID. Throws if not found. */
export async function getStaff(
  ctx: QueryCtx | MutationCtx,
  staffId: Id<"staff">
): Promise<Doc<"staff">> {
  const staff = await ctx.db.get(staffId);
  if (!staff) throw new Error("Staff member not found.");
  return staff;
}

/** Require a staff member to hold one of the given roles. */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  staffId: Id<"staff">,
  allowedRoles: StaffRole[]
): Promise<Doc<"staff">> {
  const staff = await getStaff(ctx, staffId);
  if (!allowedRoles.includes(staff.role)) {
    throw new Error(
      `Unauthorized. Required: ${allowedRoles.join(" | ")}. Current: ${staff.role}.`
    );
  }
  return staff;
}

/** Require Owner role. */
export async function requireOwner(
  ctx: QueryCtx | MutationCtx,
  staffId: Id<"staff">
): Promise<Doc<"staff">> {
  return requireRole(ctx, staffId, ["Owner"]);
}

/** Require Owner or Admin. */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  staffId: Id<"staff">
): Promise<Doc<"staff">> {
  return requireRole(ctx, staffId, ["Owner", "Admin"]);
}
