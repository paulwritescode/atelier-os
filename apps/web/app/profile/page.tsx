"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { User, ArrowLeft } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Staff, StaffRole } from "@/lib/types"

// ── Mock staff member (replaced by auth context in Phase 10) ──────────────
const MOCK_STAFF: Staff = {
  id: "staff-1",
  role: "Owner",
  name: "",
  email: "",
  phone: "",
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
}

const ROLE_LABELS: Record<StaffRole, string> = {
  Owner: "Owner",
  Admin: "Admin",
  Tailor: "Tailor",
  Designer: "Designer",
  Production: "Production",
  Reception: "Reception",
  Accountant: "Accountant",
}

const Profile = () => {
  const router = useRouter()
  const [staff, setStaff] = useState<Staff>(MOCK_STAFF)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = (): void => {
    // TODO: wire to Convex updateStaff mutation in Phase 9
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <HugeiconsIcon icon={ArrowLeft} className="mr-2 size-4" />
                Back
              </Button>
              <h1 className="font-heading text-xl font-semibold text-foreground">Profile</h1>
            </div>
            <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card/70 p-8 backdrop-blur-sm">
          {/* Avatar + role */}
          <div className="mb-8 flex items-center gap-6">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary">
              <HugeiconsIcon icon={User} className="size-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-medium text-foreground">
                {staff.name || "Your Name"}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {ROLE_LABELS[staff.role]}
                </span>
                <span className="text-xs text-muted-foreground">
                  Role is managed by the owner.
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Full Name
              </Label>
              <Input
                id="name"
                value={staff.name}
                onChange={(e) => setStaff({ ...staff, name: e.target.value })}
                disabled={!isEditing}
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={staff.email}
                onChange={(e) => setStaff({ ...staff, email: e.target.value })}
                disabled={!isEditing}
                placeholder="you@anioregalia.com"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">
                Phone
              </Label>
              <Input
                id="phone"
                value={staff.phone ?? ""}
                onChange={(e) => setStaff({ ...staff, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+254 700 000 000"
              />
            </div>

            <div>
              <Label className="mb-2 block">Role</Label>
              <Input
                value={ROLE_LABELS[staff.role]}
                disabled
                className="bg-muted"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Role is assigned by the owner and cannot be self-edited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
