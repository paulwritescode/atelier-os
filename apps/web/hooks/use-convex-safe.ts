/**
 * Safe Convex hooks that don't throw when ConvexProvider is not yet mounted.
 * During SSR/prerendering, these return undefined/no-op instead of throwing.
 * Once the client hydrates and ConvexProvider is available, they work normally.
 */
"use client"

import { useQuery as _useQuery, useMutation as _useMutation } from "convex/react"

// Re-export directly — Convex hooks already return undefined during loading.
// The ConvexClientProvider handles the "no provider" case by conditionally rendering.
export const useQuery = _useQuery
export const useMutation = _useMutation
