"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft, User } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type { Id } from "@convex/_generated/dataModel"
import type { ClientType } from "@/lib/types"

const CLIENT_TYPES: ClientType[] = [
  "Individual",
  "Family",
  "Corporate",
  "WeddingHost",
  "EventOrganizer",
]

const TYPE_LABELS: Record<ClientType, string> = {
  Individual: "Individual",
  Family: "Family",
  Corporate: "Corporate",
  WeddingHost: "Wedding Host",
  EventOrganizer: "Event Organizer",
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  // ── Convex query — real-time ────────────────────────────────────────────
  const client = useQuery(api.clients.getById, { id: id as Id<"clients"> })
  const projects = useQuery(api.projects.list)
  const updateClient = useMutation(api.clients.update)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", type: "Individual" as ClientType })
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    if (!client) return
    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      type: client.type,
    })
    setEditing(true)
  }

  const handleSave = async () => {
    if (!client) return
    if (!form.name.trim()) {
      toast.error("Name is required.")
      return
    }
    setSaving(true)
    try {
      await updateClient({
        id: client._id,
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        type: form.type,
      })
      toast.success("Client updated.")
      setEditing(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the client.")
    } finally {
      setSaving(false)
    }
  }

  // Loading
  if (client === undefined) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full" style={{ background: "#F6F2EC" }}>
          <AppSidebar />
          <div className="flex flex-1 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#E7E2DB", borderTopColor: "#4B1E2A" }} />
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Not found
  if (!client) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 items-center justify-center bg-background">
            <p className="text-muted-foreground">Client not found.</p>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  const clientProjects = projects?.filter((p) => p.primaryClientId === id) ?? []

  const joinDate = new Date(client.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center gap-4">
                <SidebarTrigger />
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  <HugeiconsIcon icon={ArrowLeft} className="mr-2 size-4" />
                  Clients
                </Button>
                <span className="text-muted-foreground">/</span>
                <h1 className="font-heading text-lg font-medium text-foreground">{client.name}</h1>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary">
                    <HugeiconsIcon icon={User} className="size-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-medium text-foreground">{client.name}</h2>
                    <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {TYPE_LABELS[client.type as ClientType]}
                    </span>
                  </div>
                </div>
                {!editing && (
                  <Button variant="outline" size="sm" onClick={startEdit}>
                    Edit
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Name
                      </p>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={saving}
                        className="h-10 w-full rounded-md border border-border bg-input/50 px-3 text-sm text-foreground outline-none focus-visible:border-ring"
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Type
                      </p>
                      <select
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as ClientType })}
                        disabled={saving}
                        className="h-10 w-full rounded-md border border-border bg-input/50 px-3 text-sm text-foreground outline-none focus-visible:border-ring"
                      >
                        {CLIENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                      </p>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        disabled={saving}
                        placeholder="Optional"
                        className="h-10 w-full rounded-md border border-border bg-input/50 px-3 text-sm text-foreground outline-none focus-visible:border-ring"
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Phone
                      </p>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        disabled={saving}
                        placeholder="Optional"
                        className="h-10 w-full rounded-md border border-border bg-input/50 px-3 text-sm text-foreground outline-none focus-visible:border-ring"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</p>
                    <p className="text-foreground">{client.email ?? "—"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Phone</p>
                    <p className="text-foreground">{client.phone ?? "—"}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Client Since</p>
                    <p className="text-foreground">{joinDate}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Commissions for this client */}
            <div className="mt-6 rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
              <h3 className="font-heading mb-4 text-base font-medium text-foreground">Commissions</h3>
              {clientProjects.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {clientProjects.map((p) => (
                    <div
                      key={p._id}
                      className="cursor-pointer rounded-lg border border-border px-4 py-3 transition-all hover:border-primary/50 hover:shadow-sm"
                      onClick={() => router.push(`/projects/${p.slug}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{p.title}</p>
                          <p className="text-sm text-muted-foreground">{p.type}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${p.status === "Active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No commissions yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
