"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search, Plus, Briefcase } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/ProjectCard";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { ProjectStatus } from "@/lib/types";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "Draft", label: "Draft" },
  { value: "Active", label: "Active" },
  { value: "OnHold", label: "On Hold" },
  { value: "Completed", label: "Completed" },
  { value: "Archived", label: "Archived" },
];

// ── Inline SVG icons for view toggle (cleaner than importing heavy icon packs) ──
function GridIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="1.5" y1="3" x2="14.5" y2="3" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" />
      <line x1="1.5" y1="13" x2="14.5" y2="13" />
    </svg>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ── Convex queries ──────────────────────────────────────────────────────
  const projects = useQuery(api.projects.list);
  const clients = useQuery(api.clients.list);

  // ── Derived ─────────────────────────────────────────────────────────────
  const clientMap = useMemo(() => {
    if (!clients) return new Map<string, string>();
    return new Map(clients.map((c) => [c._id as string, c.name]));
  }, [clients]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const clientName = clientMap.get(p.primaryClientId) ?? "";
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "all" || p.status === (statusFilter as ProjectStatus);
      return matchSearch && matchStatus;
    });
  }, [projects, clientMap, searchQuery, statusFilter]);

  const isLoading = projects === undefined;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <div className="flex flex-1 flex-col min-w-0 m-2 ml-0 border border-border/70 rounded-2xl bg-card overflow-hidden">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <header className="sticky top-0 z-[200] flex h-[72px] shrink-0 items-center gap-4 border-b border-border bg-card px-10">
            <SidebarTrigger className="text-foreground" />
            <div className="flex items-center gap-3">
              <HugeiconsIcon
                icon={Briefcase}
                className="size-5 text-brand-gold"
              />
              <span className="font-heading text-[18px] font-semibold leading-none tracking-tight text-foreground">
                Projects
              </span>
              {!isLoading && (
                <span className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-[12px] text-muted-foreground">
                  {filtered.length}
                </span>
              )}
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="flex h-[40px] items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <HugeiconsIcon icon={Plus} className="size-[16px]" />
                New Project
              </button>
            </div>
          </header>

          {/* ── Toolbar: search, filters, view toggle ──────────────────── */}
          <div className="flex flex-wrap items-center gap-4 border-b border-border px-10 py-4">
            {/* Search */}
            <div className="flex h-[40px] w-full max-w-[320px] items-center gap-3 rounded-full border border-border bg-card px-4">
              <HugeiconsIcon
                icon={Search}
                className="size-[16px] shrink-0 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[14px] leading-none text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Status filters */}
            <div className="flex items-center gap-1.5">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    "h-[36px] rounded-full border px-4 text-[13px] font-medium transition-colors",
                    statusFilter === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="ml-auto flex items-center gap-1 rounded-full border border-border p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex h-[30px] w-[30px] items-center justify-center rounded-full transition-colors",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground",
                )}
                aria-label="Grid view"
              >
                <GridIcon className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex h-[30px] w-[30px] items-center justify-center rounded-full transition-colors",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground",
                )}
                aria-label="List view"
              >
                <ListIcon className="size-4" />
              </button>
            </div>
          </div>

          {/* ── Content ────────────────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto px-10 py-8">
            <div className="mx-auto w-full" style={{ maxWidth: "1440px" }}>
              {/* Loading state */}
              {isLoading && (
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                      : "flex flex-col gap-3",
                  )}
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "animate-pulse rounded-xs border border-border bg-muted",
                        viewMode === "grid" ? "h-[360px]" : "h-[72px]",
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Grid view */}
              {!isLoading && filtered.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      primaryClientName={
                        clientMap.get(project.primaryClientId) ?? "—"
                      }
                      viewMode="grid"
                      onClick={() => router.push(`/projects/${project.slug}`)}
                    />
                  ))}
                </div>
              )}

              {/* List view */}
              {!isLoading && filtered.length > 0 && viewMode === "list" && (
                <div className="flex flex-col gap-3">
                  {/* Table header */}
                  <div
                    className="grid h-[44px] items-center rounded-xs bg-muted px-5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
                    style={{
                      gridTemplateColumns: "60px 1fr 140px 140px 120px",
                    }}
                  >
                    <span />
                    <span>Project</span>
                    <span>Client</span>
                    <span>Created</span>
                    <span>Status</span>
                  </div>

                  {/* Table rows */}
                  {filtered.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      primaryClientName={
                        clientMap.get(project.primaryClientId) ?? "—"
                      }
                      viewMode="list"
                      onClick={() => router.push(`/projects/${project.slug}`)}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xs border border-border bg-card p-16 text-center shadow-[0_2px_8px_rgba(20,20,19,.06)]">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <HugeiconsIcon
                      icon={Briefcase}
                      className="size-7 text-brand-gold"
                    />
                  </div>
                  <h3 className="font-heading mb-2 text-[22px] font-semibold text-foreground">
                    No projects found
                  </h3>
                  <p className="mb-8 max-w-[360px] text-[15px] leading-[24px] text-muted-foreground">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "Create your first commission to get started."}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <button
                      onClick={() => router.push("/")}
                      className="flex h-[44px] items-center gap-[10px] rounded-full bg-primary px-6 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <HugeiconsIcon icon={Plus} className="size-[18px]" />
                      New Project
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
