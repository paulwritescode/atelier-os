"use client"

/**
 * Atelier settings.
 *
 * The Team tab is the only place staff accounts are created and PINs managed.
 * Only the Owner may create staff or change another person's PIN — enforced in
 * convex/auth.ts, not here (ADR-020).
 */
import React, { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import { useAuth } from "@/components/AuthProvider"
import { PageShell, PageCard, PageBadge, PageLoading, PT, dateOf } from "@/components/PageShell"
import type { Id } from "@convex/_generated/dataModel"

const TABS = ["Team", "Atelier", "Notifications"] as const
type Tab = (typeof TABS)[number]

const STAFF_ROLES = [
  { value: "Admin", label: "Admin" },
  { value: "Tailor", label: "Tailor" },
  { value: "Designer", label: "Designer" },
  { value: "Production", label: "Production" },
  { value: "Reception", label: "Reception" },
  { value: "Accountant", label: "Accountant" },
] as const

type StaffRole = (typeof STAFF_ROLES)[number]["value"]

const inputCls =
  "h-[44px] w-full rounded-full border px-4 text-[14px] outline-none disabled:opacity-50"
const inputSty: React.CSSProperties = {
  background: PT.ivory,
  borderColor: PT.stone,
  color: PT.ink,
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em]"
      style={{ color: PT.body }}
    >
      {children}
    </label>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>("Team")

  return (
    <PageShell eyebrow="Configuration" title="Settings">
      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors"
              style={{
                background: active ? PT.burgundy : PT.white,
                color: active ? PT.white : PT.body,
                borderColor: active ? PT.burgundy : PT.stone,
              }}
            >
              {t}
            </button>
          )
        })}
      </div>

      {tab === "Team" && <TeamTab currentUserId={user?.id} currentRole={user?.role} />}
      {tab === "Atelier" && <AtelierTab />}
      {tab === "Notifications" && <NotificationsTab />}
    </PageShell>
  )
}

/* ── Team ─────────────────────────────────────────────────────────────────── */

function TeamTab({
  currentUserId,
  currentRole,
}: {
  currentUserId: string | undefined
  currentRole: string | undefined
}) {
  const staff = useQuery(api.auth.listStaff)
  const createStaff = useMutation(api.auth.createStaff)
  const rotatePin = useMutation(api.auth.rotatePin)
  const updatePin = useMutation(api.auth.updatePin)

  const isOwner = currentRole === "Owner"

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState<StaffRole>("Tailor")
  const [phone, setPhone] = useState("")
  const [busy, setBusy] = useState(false)

  // The generated PIN is shown exactly once, right after creation/rotation.
  const [revealed, setRevealed] = useState<{ name: string; pin: string } | null>(null)

  // Inline custom-PIN editor
  const [editingId, setEditingId] = useState<string | null>(null)
  const [customPin, setCustomPin] = useState("")

  if (staff === undefined) return <PageLoading />

  const handleCreate = async () => {
    if (!currentUserId) return
    if (!name.trim()) {
      toast.error("Name is required.")
      return
    }
    setBusy(true)
    try {
      const result = await createStaff({
        name: name.trim(),
        role,
        phone: phone.trim() || undefined,
        createdBy: currentUserId as Id<"staff">,
      })
      setRevealed({ name: result.name, pin: result.pin })
      setName("")
      setPhone("")
      setRole("Tailor")
      setShowForm(false)
      toast.success("Staff account created.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the account.")
    } finally {
      setBusy(false)
    }
  }

  const handleRotate = async (staffId: string, staffName: string) => {
    if (!currentUserId) return
    setBusy(true)
    try {
      const result = await rotatePin({
        staffId: staffId as Id<"staff">,
        requestedBy: currentUserId as Id<"staff">,
      })
      setRevealed({ name: staffName, pin: result.pin })
      toast.success("PIN rotated.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rotate the PIN.")
    } finally {
      setBusy(false)
    }
  }

  const handleCustomPin = async (staffId: string) => {
    if (!currentUserId) return
    if (customPin.trim().length < 4) {
      toast.error("PIN must be at least 4 characters.")
      return
    }
    setBusy(true)
    try {
      await updatePin({
        staffId: staffId as Id<"staff">,
        newPin: customPin.trim(),
        requestedBy: currentUserId as Id<"staff">,
      })
      toast.success("PIN updated.")
      setEditingId(null)
      setCustomPin("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the PIN.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* One-time PIN reveal */}
      {revealed && (
        <PageCard>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: PT.gold }}
              >
                PIN for {revealed.name}
              </p>
              <p
                className="font-mono text-[32px] font-semibold tracking-[0.2em]"
                style={{ color: PT.burgundy }}
              >
                {revealed.pin}
              </p>
              <p className="mt-1 text-[13px]" style={{ color: PT.muted }}>
                Shown once. Pass it on, then dismiss.
              </p>
            </div>
            <button
              onClick={() => setRevealed(null)}
              className="h-[44px] rounded-full px-6 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: PT.burgundy }}
            >
              Done
            </button>
          </div>
        </PageCard>
      )}

      {/* Add staff */}
      <PageCard>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p
              className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: PT.gold }}
            >
              The team
            </p>
            <h2
              className="font-heading text-[26px] font-semibold leading-tight"
              style={{ color: PT.ink }}
            >
              {staff.length} member{staff.length === 1 ? "" : "s"}
            </h2>
          </div>
          {isOwner && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="h-[44px] rounded-full px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: PT.burgundy }}
            >
              Add Staff
            </button>
          )}
        </div>

        {!isOwner && (
          <p className="text-[13px]" style={{ color: PT.muted }}>
            Only the owner can add staff or change another person&apos;s PIN.
          </p>
        )}

        {showForm && (
          <div
            className="rounded-xs border p-4"
            style={{ borderColor: PT.stone, background: PT.softIvory }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label>Name</Label>
                <input
                  className={inputCls}
                  style={inputSty}
                  value={name}
                  disabled={busy}
                  placeholder="Full name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  className={inputCls}
                  style={inputSty}
                  value={role}
                  disabled={busy}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                >
                  {STAFF_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <input
                  className={inputCls}
                  style={inputSty}
                  value={phone}
                  disabled={busy}
                  placeholder="+254…"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <p className="mt-3 text-[13px]" style={{ color: PT.muted }}>
              A PIN is generated automatically and shown once.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCreate}
                disabled={busy}
                className="h-[44px] rounded-full px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: PT.burgundy }}
              >
                Create account
              </button>
              <button
                onClick={() => setShowForm(false)}
                disabled={busy}
                className="h-[44px] rounded-full border px-5 text-[14px] font-medium transition-colors hover:bg-white"
                style={{ borderColor: PT.stone, color: PT.ink }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </PageCard>

      {/* Staff list */}
      {staff.map((member) => {
        const isSelf = member._id === currentUserId
        const canManage = isOwner || isSelf
        return (
          <PageCard key={member._id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold"
                  style={{ background: PT.ivory, color: PT.burgundy }}
                >
                  {member.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase() ?? "")
                    .join("")}
                </div>
                <div>
                  <p className="text-[15px] font-medium" style={{ color: PT.ink }}>
                    {member.name}
                    {isSelf && (
                      <span className="ml-2 text-[12px]" style={{ color: PT.muted }}>
                        you
                      </span>
                    )}
                  </p>
                  <p className="text-[13px]" style={{ color: PT.muted }}>
                    Last signed in {dateOf(member.lastSignInAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <PageBadge
                  bg={member.role === "Owner" ? PT.burgundy : PT.softIvory}
                  fg={member.role === "Owner" ? PT.white : PT.body}
                >
                  {member.role}
                </PageBadge>

                {canManage && (
                  <>
                    <button
                      onClick={() => handleRotate(member._id, member.name)}
                      disabled={busy}
                      className="h-9 rounded-full border px-4 text-[13px] font-medium transition-colors hover:bg-muted disabled:opacity-50"
                      style={{ borderColor: PT.stone, color: PT.ink }}
                    >
                      Rotate PIN
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(editingId === member._id ? null : member._id)
                        setCustomPin("")
                      }}
                      disabled={busy}
                      className="h-9 rounded-full border px-4 text-[13px] font-medium transition-colors hover:bg-muted disabled:opacity-50"
                      style={{ borderColor: PT.stone, color: PT.ink }}
                    >
                      Set PIN
                    </button>
                  </>
                )}
              </div>
            </div>

            {editingId === member._id && (
              <div
                className="mt-4 flex flex-wrap items-end gap-3 rounded-xs border p-4"
                style={{ borderColor: PT.stone, background: PT.softIvory }}
              >
                <div className="min-w-[220px] flex-1">
                  <Label>New PIN</Label>
                  <input
                    className={inputCls}
                    style={inputSty}
                    value={customPin}
                    disabled={busy}
                    placeholder="Numbers, words or symbols — min 4"
                    onChange={(e) => setCustomPin(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => handleCustomPin(member._id)}
                  disabled={busy}
                  className="h-[44px] rounded-full px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: PT.burgundy }}
                >
                  Save PIN
                </button>
              </div>
            )}
          </PageCard>
        )
      })}
    </div>
  )
}

/* ── Atelier ──────────────────────────────────────────────────────────────── */

function AtelierTab() {
  return (
    <PageCard>
      <p
        className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em]"
        style={{ color: PT.gold }}
      >
        Identity
      </p>
      <h2
        className="font-heading mb-6 text-[26px] font-semibold"
        style={{ color: PT.ink }}
      >
        Anio Regalia
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[
          { label: "Currency", value: "KES — Kenyan Shilling" },
          { label: "Timezone", value: "Africa/Nairobi" },
        ].map((f) => (
          <div key={f.label}>
            <p
              className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: PT.muted }}
            >
              {f.label}
            </p>
            <p className="text-[15px]" style={{ color: PT.ink }}>
              {f.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6" style={{ borderColor: PT.stone }}>
        <p className="text-[13px] leading-[20px]" style={{ color: PT.muted }}>
          Brand colours are part of the Anio Regalia design system and are not
          configurable. Amounts are stored as integers in the smallest currency unit and
          timestamps in UTC, displayed in Nairobi time.
        </p>
      </div>
    </PageCard>
  )
}

/* ── Notifications ────────────────────────────────────────────────────────── */

function NotificationsTab() {
  const items = [
    {
      title: "Appointment reminders",
      body: "Sent daily to staff and clients 24 hours before an appointment.",
      status: "Active",
    },
    {
      title: "Payment reminders",
      body: "Sent weekly for active commissions with no completed payment.",
      status: "Active",
    },
    {
      title: "Story expiry",
      body: "Runs hourly, moving 24-hour updates into the commission timeline.",
      status: "Active",
    },
    {
      title: "Media cleanup",
      body: "Runs daily once media storage is connected.",
      status: "Pending",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] leading-[20px]" style={{ color: PT.muted }}>
        These run automatically on the backend. Delivery is in-app for now; email and push
        arrive with the notification pipeline.
      </p>
      {items.map((i) => (
        <PageCard key={i.title}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[15px] font-medium" style={{ color: PT.ink }}>
                {i.title}
              </p>
              <p className="mt-1 text-[13px] leading-[20px]" style={{ color: PT.muted }}>
                {i.body}
              </p>
            </div>
            <PageBadge
              bg={i.status === "Active" ? PT.green : PT.softIvory}
              fg={i.status === "Active" ? PT.white : PT.body}
            >
              {i.status}
            </PageBadge>
          </div>
        </PageCard>
      ))}
    </div>
  )
}
