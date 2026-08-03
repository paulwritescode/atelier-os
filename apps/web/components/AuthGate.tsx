"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useAuth } from "@/components/AuthProvider"

/** Routes that never require a session. */
const PUBLIC_ROUTES = ["/setup", "/sign-in", "/client-portal", "/share"]

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

/**
 * Gates the staff-facing app.
 *
 * - No owner in the DB yet  → send to /setup
 * - Owner exists, no session → send to /sign-in
 *
 * This is a UX gate. Real enforcement lives in Convex mutations (ADR-020).
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const setup = useQuery(api.auth.isSetup)

  const pub = isPublic(pathname)
  const needsSetup = setup !== undefined && !setup.isSetup
  const needsSignIn = setup?.isSetup === true && !isLoading && !user

  useEffect(() => {
    if (pub) return
    if (needsSetup) {
      router.replace("/setup")
    } else if (needsSignIn) {
      router.replace("/sign-in")
    }
  }, [pub, needsSetup, needsSignIn, router])

  // Public routes render immediately.
  if (pub) return <>{children}</>

  // Waiting on the setup check or the stored session.
  if (setup === undefined || isLoading) {
    return <FullPageSpinner label="Loading the atelier..." />
  }

  // Redirect in flight — avoid flashing the app shell.
  if (needsSetup || needsSignIn) {
    return <FullPageSpinner label="Redirecting..." />
  }

  return <>{children}</>
}

function FullPageSpinner({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ background: "#F6F2EC" }}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: "#E7E2DB", borderTopColor: "#4B1E2A" }}
      />
      <p className="text-[14px]" style={{ color: "#8C857D" }}>
        {label}
      </p>
    </div>
  )
}
