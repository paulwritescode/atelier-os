/**
 * PIN-based authentication for Anio Regalia OS.
 *
 * How it works:
 *   - Owner is created on first run with a system-generated 6-digit PIN
 *   - Owner can create staff members, each gets a system-generated PIN
 *   - Sign-in: name + PIN → returns staff record
 *   - Owner can rotate their PIN (auto-generate new one)
 *   - Owner can set custom PIN (numbers, words, any characters)
 *   - Staff can update their own PIN after signing in
 *
 * No external auth library. PIN stored in Convex. Session in localStorage.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Helpers ───────────────────────────────────────────────────────────────

/** Generate a 6-character alphanumeric PIN */
function generatePin(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 for readability
  let pin = "";
  for (let i = 0; i < 6; i++) {
    pin += chars[Math.floor(Math.random() * chars.length)];
  }
  return pin;
}

// ── Queries ───────────────────────────────────────────────────────────────

/** Check if the system has been set up (owner exists) */
export const isSetup = query({
  args: {},
  handler: async (ctx) => {
    const owner = await ctx.db
      .query("staff")
      .filter((q) => q.eq(q.field("role"), "Owner"))
      .first();
    return { isSetup: !!owner, ownerName: owner?.name ?? null };
  },
});

/** List all staff members (for owner's staff management) */
export const listStaff = query({
  args: {},
  handler: async (ctx) => {
    const staff = await ctx.db.query("staff").order("desc").collect();
    // Never expose PINs in queries — return without pin field
    return staff.map(({ pin: _pin, ...rest }) => rest);
  },
});

// ── Mutations ─────────────────────────────────────────────────────────────

/** First-time setup — creates the Owner account with a generated PIN */
export const setupOwner = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    // Prevent duplicate setup
    const existing = await ctx.db
      .query("staff")
      .filter((q) => q.eq(q.field("role"), "Owner"))
      .first();
    if (existing) {
      throw new Error("Owner already exists. System is already set up.");
    }

    const pin = generatePin();
    const now = Date.now();

    const staffId = await ctx.db.insert("staff", {
      name,
      role: "Owner",
      pin,
      pinUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Return the generated PIN — shown ONCE to the owner
    return { staffId, pin, name };
  },
});

/** Verify PIN — returns staff record if valid, null if not */
export const verifyPin = mutation({
  args: {
    name: v.string(),
    pin: v.string(),
  },
  handler: async (ctx, { name, pin }) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (!staff) return null;
    if (staff.pin !== pin) return null;

    // Update last sign-in time
    await ctx.db.patch(staff._id, { lastSignInAt: Date.now() });

    // Return session data (no PIN in response)
    return {
      id: staff._id,
      name: staff.name,
      role: staff.role,
    };
  },
});

/** Rotate PIN — generate a new random PIN (owner or self) */
export const rotatePin = mutation({
  args: {
    staffId: v.id("staff"),
    requestedBy: v.id("staff"),
  },
  handler: async (ctx, { staffId, requestedBy }) => {
    const requester = await ctx.db.get(requestedBy);
    if (!requester) throw new Error("Requester not found");

    // Only owner can rotate other people's PINs, staff can rotate their own
    if (staffId !== requestedBy && requester.role !== "Owner") {
      throw new Error("Only the owner can rotate other staff PINs.");
    }

    const newPin = generatePin();
    const now = Date.now();
    await ctx.db.patch(staffId, { pin: newPin, pinUpdatedAt: now, updatedAt: now });

    return { pin: newPin };
  },
});

/** Update PIN — set a custom PIN (numbers, words, any characters) */
export const updatePin = mutation({
  args: {
    staffId: v.id("staff"),
    newPin: v.string(),
    requestedBy: v.id("staff"),
  },
  handler: async (ctx, { staffId, newPin, requestedBy }) => {
    const requester = await ctx.db.get(requestedBy);
    if (!requester) throw new Error("Requester not found");

    // Only owner can change other people's PINs, staff can change their own
    if (staffId !== requestedBy && requester.role !== "Owner") {
      throw new Error("Only the owner can change other staff PINs.");
    }

    if (newPin.length < 4) {
      throw new Error("PIN must be at least 4 characters.");
    }

    const now = Date.now();
    await ctx.db.patch(staffId, { pin: newPin, pinUpdatedAt: now, updatedAt: now });

    return { success: true };
  },
});

/** Create a new staff member (owner only) — returns generated PIN */
export const createStaff = mutation({
  args: {
    name: v.string(),
    role: v.union(
      v.literal("Admin"),
      v.literal("Tailor"),
      v.literal("Designer"),
      v.literal("Production"),
      v.literal("Reception"),
      v.literal("Accountant")
    ),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    createdBy: v.id("staff"),
  },
  handler: async (ctx, args) => {
    // Verify requester is owner
    const requester = await ctx.db.get(args.createdBy);
    if (!requester || requester.role !== "Owner") {
      throw new Error("Only the owner can create staff accounts.");
    }

    const pin = generatePin();
    const now = Date.now();

    const staffId = await ctx.db.insert("staff", {
      name: args.name,
      role: args.role,
      email: args.email,
      phone: args.phone,
      pin,
      pinUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Return the generated PIN — owner shares it with the staff member
    return { staffId, pin, name: args.name, role: args.role };
  },
});
