"use client"

import { use } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { ProjectEditor } from "@/components/ProjectEditor"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

// Per Next.js 16 docs: params is a Promise in App Router pages.
export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  // Real-time — no polling.
  const project = useQuery(api.projects.getBySlug, { slug })

  if (project === undefined) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full" style={{ background: "#F6F2EC" }}>
          <AppSidebar />
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "#E7E2DB", borderTopColor: "#4B1E2A" }}
              />
              <p className="text-[14px]" style={{ color: "#8C857D" }}>
                Loading commission...
              </p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (project === null) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full" style={{ background: "#F6F2EC" }}>
          <AppSidebar />
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2
                className="font-heading text-[28px] font-semibold"
                style={{ color: "#1B1A17" }}
              >
                Commission not found
              </h2>
              <p className="text-[14px]" style={{ color: "#8C857D" }}>
                No commission exists at this address.
              </p>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" style={{ background: "#F6F2EC" }}>
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <ProjectEditor project={project} />
        </div>
      </div>
    </SidebarProvider>
  )
}
