"use client"


import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { Plus, Search, User } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/components/AuthProvider"
import type { Id } from "@convex/_generated/dataModel"
import type { ClientType } from "@/lib/types"

const TYPE_LABELS: Record<ClientType, string> = {
  Individual: "Individual",
  Family: "Family",
  Corporate: "Corporate",
  WeddingHost: "Wedding Host",
  EventOrganizer: "Event Organizer",
}

const CLIENT_TYPES: { value: ClientType; label: string }[] = [
  { value: "Individual", label: "Individual" },
  { value: "Family", label: "Family" },
  { value: "Corporate", label: "Corporate" },
  { value: "WeddingHost", label: "Wedding Host" },
  { value: "EventOrganizer", label: "Event Organizer" },
]

export default function ClientsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [form, setForm] = useState({ name: "", type: "Individual" as ClientType, email: "", phone: "" })

  // ── Convex queries ──────────────────────────────────────────────────────
  const clients = useQuery(api.clients.list)
  const createClient = useMutation(api.clients.create)

  const filtered = useMemo(() => {
    if (!clients) return []
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [clients, searchQuery])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    await createClient({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      type: form.type,
      createdBy: user.id as Id<"staff">,
    })
    setForm({ name: "", type: "Individual", email: "", phone: "" })
    setIsAddOpen(false)
  }

  const isLoading = clients === undefined

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <SidebarTrigger />
                  <h1 className="font-heading text-xl font-semibold text-foreground">Clients</h1>
                  {clients && (
                    <span className="hidden rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground md:inline-block">
                      {clients.length}
                    </span>
                  )}
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                  <HugeiconsIcon icon={Plus} className="mr-2 size-4" />
                  Add Client
                </Button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Search */}
            <div className="relative mb-6 max-w-sm">
              <HugeiconsIcon icon={Search} className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search clients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>

            {/* Add Client Form */}
            {isAddOpen && (
              <div className="mb-6 rounded-xl border border-border bg-card p-6">
                <h2 className="font-heading mb-4 text-lg font-medium text-foreground">Add Client</h2>
                <form onSubmit={handleAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="c-name" className="mb-2 block">Name</Label>
                    <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name or company" required />
                  </div>
                  <div>
                    <Label htmlFor="c-type" className="mb-2 block">Type</Label>
                    <select id="c-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ClientType })} className="h-9 w-full rounded-md border border-border bg-input/50 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30">
                      {CLIENT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="c-email" className="mb-2 block">Email</Label>
                    <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@example.com" required />
                  </div>
                  <div>
                    <Label htmlFor="c-phone" className="mb-2 block">Phone</Label>
                    <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 700 000 000" />
                  </div>
                  <div className="flex gap-3 sm:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Client</Button>
                  </div>
                </form>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg border border-border" style={{ background: "#F3EFEA" }} />
                ))}
              </div>
            )}

            {/* Client list */}
            {!isLoading && filtered.length > 0 && (
              <div className="flex flex-col gap-2">
                {filtered.map((client) => (
                  <div
                    key={client._id}
                    className="cursor-pointer rounded-lg border border-border bg-card/70 px-4 py-3 transition-all hover:border-primary/50 hover:shadow-sm"
                    onClick={() => router.push(`/clients/${client._id}`)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                          <HugeiconsIcon icon={User} className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden rounded border border-border px-2 py-0.5 text-xs text-muted-foreground sm:inline">
                          {TYPE_LABELS[client.type as ClientType]}
                        </span>
                        <span className="text-sm text-muted-foreground">{client.phone ?? ""}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}
            {!isLoading && filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">No clients found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
