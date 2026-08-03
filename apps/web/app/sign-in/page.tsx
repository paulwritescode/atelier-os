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
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "#F6F2EC" }}
    >
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
          <h1
            className="font-heading text-[28px] font-semibold"
            style={{ color: "#1B1A17" }}
          >
            Welcome back
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: "#8C857D" }}>
            Enter your name and PIN to sign in
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border p-8"
          style={{
            background: "#FFFFFF",
            borderColor: "#E7E2DB",
            boxShadow: "0 2px 8px rgba(20,20,19,0.06)",
          }}
        >
          {error && (
            <div
              className="mb-6 rounded-xl px-4 py-3 text-[13px] font-medium"
              style={{ background: "#FDF2F2", color: "#8C2F2F" }}
            >
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-5">
            <label
              htmlFor="name"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "#5C5852" }}
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
              className="h-[44px] w-full rounded-[22px] border px-4 text-[14px] outline-none transition-colors focus:border-[#C8A46B]"
              style={{
                background: "#F6F2EC",
                borderColor: "#E0DAD0",
                color: "#1B1A17",
              }}
            />
          </div>

          {/* PIN */}
          <div className="mb-8">
            <label
              htmlFor="pin"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "#5C5852" }}
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
              className="h-[44px] w-full rounded-[22px] border px-4 text-center font-mono text-[18px] tracking-[0.3em] outline-none transition-colors focus:border-[#C8A46B]"
              style={{
                background: "#F6F2EC",
                borderColor: "#E0DAD0",
                color: "#1B1A17",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-[44px] w-full items-center justify-center rounded-full text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#4B1E2A" }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  )
}
