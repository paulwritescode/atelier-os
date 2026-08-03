"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { useAuth } from "@/components/AuthProvider"

export default function SetupPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const setupOwner = useMutation(api.auth.setupOwner)

  const [name, setName] = useState("")
  const [generatedPin, setGeneratedPin] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await setupOwner({ name: name.trim() })
      setGeneratedPin(result.pin)
      // Auto sign-in the owner
      signIn({ id: result.staffId, name: result.name, role: "Owner" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed.")
    } finally {
      setLoading(false)
    }
  }

  // After PIN is generated, show it to the owner
  if (generatedPin) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "#F6F2EC" }}
      >
        <div className="w-full max-w-[440px]">
          <div className="mb-10 flex flex-col items-center">
            <Image src="/logo.png" alt="Anio Regalia" width={64} height={64} className="mb-4" />
            <h1 className="font-heading text-[28px] font-semibold" style={{ color: "#1B1A17" }}>
              You&apos;re all set
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: "#8C857D" }}>
              Save your PIN somewhere safe. You&apos;ll need it to sign in.
            </p>
          </div>

          <div
            className="rounded-3xl border p-8 text-center"
            style={{ background: "#FFFFFF", borderColor: "#E7E2DB", boxShadow: "0 2px 8px rgba(20,20,19,0.06)" }}
          >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "#C8A46B" }}>
              Your PIN
            </p>
            <p
              className="mb-6 font-mono text-[40px] font-semibold tracking-[0.2em]"
              style={{ color: "#4B1E2A" }}
            >
              {generatedPin}
            </p>
            <p className="mb-8 text-[13px]" style={{ color: "#8C857D" }}>
              This PIN is shown only once. You can change it later from Settings.
            </p>

            <button
              onClick={() => router.push("/")}
              className="flex h-[44px] w-full items-center justify-center rounded-full text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#4B1E2A" }}
            >
              Enter the Atelier
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Setup form
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "#F6F2EC" }}
    >
      <div className="w-full max-w-[400px]">
        <div className="mb-10 flex flex-col items-center">
          <Image src="/logo.png" alt="Anio Regalia" width={64} height={64} className="mb-4" />
          <h1 className="font-heading text-[28px] font-semibold" style={{ color: "#1B1A17" }}>
            Welcome to Anio Regalia
          </h1>
          <p className="mt-1 text-center text-[14px]" style={{ color: "#8C857D" }}>
            Let&apos;s set up your atelier. Enter your name to create the owner account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border p-8"
          style={{ background: "#FFFFFF", borderColor: "#E7E2DB", boxShadow: "0 2px 8px rgba(20,20,19,0.06)" }}
        >
          {error && (
            <div className="mb-6 rounded-xl px-4 py-3 text-[13px] font-medium" style={{ background: "#FDF2F2", color: "#8C2F2F" }}>
              {error}
            </div>
          )}

          <div className="mb-8">
            <label
              htmlFor="name"
              className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "#5C5852" }}
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="e.g. Paul Kinyatti"
              className="h-[44px] w-full rounded-[22px] border px-4 text-[14px] outline-none transition-colors focus:border-[#C8A46B]"
              style={{ background: "#F6F2EC", borderColor: "#E0DAD0", color: "#1B1A17" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-[44px] w-full items-center justify-center rounded-full text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#4B1E2A" }}
          >
            {loading ? "Setting up..." : "Create Owner Account"}
          </button>

          <p className="mt-4 text-center text-[12px]" style={{ color: "#8C857D" }}>
            A secure PIN will be generated for you automatically.
          </p>
        </form>
      </div>
    </div>
  )
}
