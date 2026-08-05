"use client"


import React, { useState, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Plus,
  Search,
  Bell,
  User,
  Briefcase,
  Users,
  Clock,
  CreditCard,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { ProjectCard } from "@/components/ProjectCard"
import { CreateProjectModal } from "@/components/CreateProjectModal"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { generateProjectSlug } from "@/lib/utils"
import { useAuth } from "@/components/AuthProvider"
import type { Id } from "@convex/_generated/dataModel"
import type { ProjectStatus, ProjectType } from "@/lib/types"

const STATUS_FILTERS = [
  { value: "all",       label: "All"       },
  { value: "Draft",     label: "Draft"     },
  { value: "Active",    label: "Active"    },
  { value: "OnHold",    label: "On Hold"   },
  { value: "Completed", label: "Completed" },
  { value: "Archived",  label: "Archived"  },
]

const STAT_ICONS = [Briefcase, Users, Clock, CreditCard]

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // ── Convex queries (real-time, no polling) ──────────────────────────────
  const projects = useQuery(api.projects.list)
  const clients = useQuery(api.clients.list)
  const notificationCount = useQuery(api.notifications.countUnread, {
    recipientId: user?.id ?? "",
  })

  // ── Convex mutation ─────────────────────────────────────────────────────
  const createProject = useMutation(api.projects.create)

  // ── Derived data ────────────────────────────────────────────────────────
  const clientMap = useMemo(() => {
    if (!clients) return new Map<string, string>()
    return new Map(clients.map((c) => [c._id as string, c.name]))
  }, [clients])

  const filtered = useMemo(() => {
    if (!projects) return []
    return projects.filter((p) => {
      const clientName = clientMap.get(p.primaryClientId) ?? ""
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus =
        statusFilter === "all" || p.status === (statusFilter as ProjectStatus)
      return matchSearch && matchStatus
    })
  }, [projects, clientMap, searchQuery, statusFilter])

  // ── Stats (computed from real data) ─────────────────────────────────────
  const stats = useMemo(() => {
    if (!projects || !clients) {
      return [
        { label: "Active Commissions", value: "—", sub: "Loading..." },
        { label: "Clients", value: "—", sub: "Loading..." },
        { label: "Pending Fittings", value: "—", sub: "Loading..." },
        { label: "Outstanding", value: "—", sub: "Loading..." },
      ]
    }
    const active = projects.filter((p) => p.status === "Active").length
    const draft = projects.filter((p) => p.status === "Draft").length
    return [
      { label: "Active Commissions", value: String(active), sub: `${draft} in draft` },
      { label: "Clients", value: String(clients.length), sub: "Total registered" },
      { label: "Pending Fittings", value: "—", sub: "Coming soon" },
      { label: "Outstanding", value: "—", sub: "Coming soon" },
    ]
  }, [projects, clients])

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleCreate = async (input: {
    primaryClientId: Id<"clients">
    type: ProjectType
    title: string
    notes?: string
  }) => {
    // The modal blocks submit without a session, so this is a safety net.
    if (!user) throw new Error("You need to be signed in to create a commission.")

    const slug = generateProjectSlug(input.title)
    await createProject({
      slug,
      title: input.title,
      primaryClientId: input.primaryClientId,
      type: input.type,
      notes: input.notes,
      createdBy: user.id as Id<"staff">,
    })

    toast.success("Commission created", { description: input.title })
    router.push(`/projects/${slug}`)
  }

  const isLoading = projects === undefined

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex flex-1 flex-col h-screen">
          <div className="flex-1 overflow-hidden m-2 ml-0 border border-border/70 rounded-2xl bg-card flex flex-col">
          {/* ── Top navigation ─────────────────────────────────────────── */}
          <header
            className="sticky top-0 z-[200] flex h-[72px] shrink-0 items-center gap-6 border-b border-border px-10 bg-card rounded-t-2xl"
          >
            <div className="flex items-center gap-4 shrink-0">
              <SidebarTrigger className="text-foreground" />
              <span
                className="font-heading text-[18px] font-semibold leading-none tracking-tight text-foreground"
              >
                Anio Regalia
              </span>
            </div>

            <div className="flex-1 flex justify-center">
              <div
                className="flex h-[44px] w-full max-w-[420px] items-center gap-3 rounded-full border border-border bg-card px-4"
              >
                <HugeiconsIcon icon={Search} className="size-[18px] shrink-0 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects or clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] leading-none outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent">
                <HugeiconsIcon icon={Bell} className="size-5" />
                {(notificationCount ?? 0) > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                    {notificationCount}
                  </span>
                )}
              </button>

              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-80">
                <HugeiconsIcon icon={User} className="size-4 text-primary-foreground" />
              </button>

              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex h-[44px] items-center gap-[10px] rounded-xl bg-primary px-6 text-[14px] font-medium text-primary-foreground transition-opacity hover:bg-primary/90"
              >
                <HugeiconsIcon icon={Plus} className="size-[18px]" />
                New Project
              </button>
            </div>
          </header>

          {/* ── Workspace ──────────────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full" style={{ maxWidth: "1440px", padding: "40px" }}>

              {/* ── Hero section ────────────────────────────────────────── */}
              <section
                className="mb-16 grid grid-cols-2 overflow-hidden rounded-xs border border-border bg-card shadow-sm"
                style={{ minHeight: "380px" }}
              >
                <div className="flex flex-col justify-center px-12 py-12">
                  <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-gold">Atelier OS</p>
                  <h1 className="font-heading mb-4 text-foreground" style={{ fontSize: "48px", fontWeight: 600, lineHeight: "56px", letterSpacing: "-0.01em" }}>
                    Anio Regalia
                  </h1>
                  <p className="max-w-[480px] text-[16px] leading-[28px] text-muted-foreground">
                    Every bespoke commission, from first consultation to final delivery — managed with the precision your craft deserves.
                  </p>
                  <div className="mt-8 h-px w-12 bg-brand-gold" />
                </div>
                <div className="relative overflow-hidden" style={{ minHeight: "380px" }}>
                  <Image src="/hero-scissors-linen.jpg" alt="Brass tailor scissors on ivory linen" fill className="object-cover" priority sizes="(max-width: 1440px) 50vw, 720px" />
                </div>
              </section>

              {/* ── Statistics cards ────────────────────────────────────── */}
              <section className="mb-16 grid grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="glass-card flex flex-col justify-between rounded-xs p-6"
                    style={{ height: "200px" }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xs bg-glass-hover ring-1 ring-glass-border">
                      <HugeiconsIcon icon={STAT_ICONS[i]} className="size-6 text-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-3xl font-bold text-foreground font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {stat.value}
                      </span>
                      <span className="text-sm text-muted-foreground font-bold uppercase tracking-[0.08em]">{stat.label}</span>
                      <span className="text-sm text-muted-foreground">{stat.sub}</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* ── Commissions section ─────────────────────────────────── */}
              <section>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-gold">Commissions</p>
                    <h2 className="font-heading text-foreground" style={{ fontSize: "36px", fontWeight: 600, lineHeight: "44px" }}>Active Projects</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {STATUS_FILTERS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setStatusFilter(value)}
                        className={`h-10 rounded-full border px-[18px] text-[14px] font-medium transition-colors ${
                          statusFilter === value
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-card border-border text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading state */}
                {isLoading && (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-[360px] animate-pulse rounded-xs border border-border bg-accent" />
                    ))}
                  </div>
                )}

                {/* Project grid */}
                {!isLoading && filtered.length > 0 && (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        primaryClientName={clientMap.get(project.primaryClientId) ?? "—"}
                        viewMode="grid"
                        onClick={() => router.push(`/projects/${project.slug}`)}
                      />
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!isLoading && filtered.length === 0 && (
                  <div
                    className="relative flex flex-col items-start justify-end overflow-hidden rounded-xs border border-border bg-card shadow-sm p-12"
                    style={{ minHeight: "320px" }}
                  >
                    <Image src="/atelier-cutting-table.jpg" alt="Empty atelier" fill className="object-cover opacity-10" sizes="(max-width: 1440px) 100vw" />
                    <div className="relative z-10">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-gold">Ready to begin</p>
                      <h3 className="font-heading mb-3 text-foreground" style={{ fontSize: "28px", fontWeight: 600, lineHeight: "36px" }}>No projects found</h3>
                      <p className="mb-8 max-w-[360px] text-[15px] leading-[24px] text-muted-foreground">
                        {searchQuery || statusFilter !== "all" ? "Try adjusting your search or filters." : "Create your first commission to begin."}
                      </p>
                      {!searchQuery && statusFilter === "all" && (
                        <button onClick={() => setIsCreateOpen(true)} className="flex h-[44px] items-center gap-[10px] rounded-xl bg-primary px-6 text-[14px] font-medium text-primary-foreground transition-opacity hover:bg-primary/90">
                          <HugeiconsIcon icon={Plus} className="size-[18px]" />
                          New Commission
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </main>
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </SidebarProvider>
  )
}
