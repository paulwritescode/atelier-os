"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { useAuth } from "@/components/AuthProvider"

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const verifyPin = useMutation(api.auth.verifyPin)

  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await verifyPin({ name: name.trim(), pin: pin.trim() })
      if (!result) {
        setError("Invalid name or PIN.")
      } else {
        signIn({ id: result.id, name: result.name, role: result.role })
        router.push("/")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Anio Regalia"
            width={64}
            height={64}
            className="mb-4"
          />
          <h1 className="font-heading text-[28px] font-semibold text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Enter your name and PIN to sign in
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xs border border-border bg-card p-8 shadow-sm"
        >
          {error && (
            <div className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-[13px] font-medium text-destructive">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-5">
            <label
              htmlFor="name"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your name"
              className="h-[44px] w-full rounded-[22px] border border-input bg-background px-4 text-[14px] text-foreground outline-none transition-colors focus:border-ring"
            />
          </div>

          {/* PIN */}
          <div className="mb-8">
            <label
              htmlFor="pin"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
            >
              PIN
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your PIN"
              className="h-[44px] w-full rounded-[22px] border border-input bg-background px-4 text-center font-mono text-[18px] tracking-[0.3em] text-foreground outline-none transition-colors focus:border-ring"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-[44px] w-full items-center justify-center rounded-full bg-primary text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}
