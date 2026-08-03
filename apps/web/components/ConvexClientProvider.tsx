"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import { type ReactNode } from "react"

// Singleton — created once at module level, never re-created on re-renders.
// Uses placeholder URL if env var not set (allows build without Convex deployment).
const CONVEX_URL =
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud"

const convexClient = new ConvexReactClient(CONVEX_URL)

/**
 * Convex React provider — wraps the app for real-time queries/mutations.
 * Queries return undefined until connected to a real Convex deployment.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convexClient}>{children}</ConvexProvider>
}
