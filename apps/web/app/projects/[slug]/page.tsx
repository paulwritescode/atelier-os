"use client";
import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ProjectEditor } from "@/components/ProjectEditor";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectSidebar, type ProjectTabId } from "@/components/ProjectSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { ProjectType } from "@/lib/types";

const TYPE_LABEL: Record<ProjectType, string> = {
  Wedding: "Wedding",
  Corporate: "Corporate",
  Individual: "Individual",
  ClosetRevamp: "Closet Revamp",
  GalaOutfit: "Gala Outfit",
  Photoshoot: "Photoshoot",
  Alteration: "Alteration",
};

// Per Next.js 16 docs: params is a Promise in App Router pages.
export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState<ProjectTabId>("commission");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Real-time — no polling.
  const project = useQuery(api.projects.getBySlug, { slug });

  if (project === undefined) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col h-screen">
            <main className="flex-1 overflow-hidden m-2 ml-0 border border-border/70 rounded-2xl bg-card">
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading commission...
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (project === null) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col h-screen">
            <main className="flex-1 overflow-hidden m-2 ml-0 border border-border/70 rounded-2xl bg-card">
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Commission not found
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    No commission exists at this address.
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Main sidebar — auto-collapses on this page */}
        <AppSidebar />

        <div className="flex flex-1 flex-col h-screen">
          {/* Rounded content container with 2nd sidebar inside */}
          <main className="flex-1 overflow-hidden m-2 ml-0 border border-border/70 rounded-2xl bg-card flex">
            {/* Project-specific secondary sidebar */}
            <ProjectSidebar
              projectTitle={project.title}
              projectType={TYPE_LABEL[project.type]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main content area */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <ProjectEditor project={project} activeTab={activeTab} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
