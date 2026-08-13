"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { ProjectEditor } from "@/components/ProjectEditor";
import { AppSidebar } from "@/components/AppSidebar";
import { ProjectSidebar, type ProjectTabId } from "@/components/ProjectSidebar";
import { LifecycleRail } from "@/components/project/LifecycleRail";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/components/AuthProvider";
import type { Id } from "@convex/_generated/dataModel";
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

/** Walk the lifecycle and return the furthest stage the records support. */
function deriveStageIndex(s: {
  status: string;
  hasConsultation: boolean;
  consultationComplete: boolean;
  hasDesign: boolean;
  designApproved: boolean;
  hasQuotation: boolean;
  quotationAccepted: boolean;
  depositSatisfied: boolean;
  hasMeasurements: boolean;
  inProduction: boolean;
  allDelivered: boolean;
}): number {
  if (s.status === "Completed" || s.status === "Archived") return 10;
  if (s.allDelivered) return 9;
  if (s.inProduction) return 6;
  if (s.hasMeasurements) return 5;
  if (s.depositSatisfied) return 4;
  if (s.quotationAccepted || s.hasQuotation) return 3;
  if (s.designApproved || s.hasDesign) return 2;
  if (s.consultationComplete || s.hasConsultation) return 1;
  return 0;
}

// Per Next.js 16 docs: params is a Promise in App Router pages.
export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState<ProjectTabId>("commission");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Real-time — no polling.
  const project = useQuery(api.projects.getBySlug, { slug });

  // Lifecycle derivation queries (skipped until project loads)
  const projectId = project?._id;
  const consultation = useQuery(
    api.consultations.getByProject,
    projectId ? { projectId } : "skip"
  );
  const design = useQuery(
    api.designs.getByProject,
    projectId ? { projectId } : "skip"
  );
  const quotation = useQuery(
    api.quotations.getByProject,
    projectId ? { projectId } : "skip"
  );
  const paymentSummary = useQuery(
    api.payments.summaryByProject,
    projectId ? { projectId } : "skip"
  );
  const participants = useQuery(
    api.participants.listByProjectDetailed,
    projectId ? { projectId } : "skip"
  );
  const garments = useQuery(
    api.production.listByProject,
    projectId ? { projectId } : "skip"
  );

  const lifecycleStageIndex = project
    ? (() => {
        // Use persisted lifecycleStage if set, otherwise derive from records
        if (project.lifecycleStage) {
          const STAGES = [
            "Lead", "Consultation", "Design", "Quotation", "Deposit",
            "Measurements", "Production", "Fitting", "Final Payment",
            "Delivery", "Completed",
          ] as const;
          const idx = STAGES.indexOf(project.lifecycleStage as typeof STAGES[number]);
          return idx !== -1 ? idx : 0;
        }
        return deriveStageIndex({
          status: project.status,
          hasConsultation: !!consultation,
          consultationComplete: !!consultation?.completedAt,
          hasDesign: !!design,
          designApproved: !!design?.approvedAt,
          hasQuotation: !!quotation,
          quotationAccepted: quotation?.status === "Accepted",
          depositSatisfied: !!paymentSummary?.depositSatisfied,
          hasMeasurements: (participants ?? []).some(
            (p) => p.latestMeasurementId !== null
          ),
          inProduction: (garments ?? []).some((g) => g.currentStage !== null),
          allDelivered:
            (garments ?? []).length > 0 &&
            (garments ?? []).every((g) => g.status === "Delivered"),
        });
      })()
    : 0;

  const archiveProject = useMutation(api.projects.archive);
  const softDeleteProject = useMutation(api.projects.softDelete);
  const advanceLifecycle = useMutation(api.projects.advanceLifecycleStage);

  const staffId = user?.id as Id<"staff"> | undefined;

  const isLocked = project
    ? project.status === "Completed" || project.status === "Archived"
    : false;

  const handleAdvanceLifecycle = async (completedStep: string) => {
    if (!project || !staffId) return;
    try {
      await advanceLifecycle({
        id: project._id,
        completedStage: completedStep,
        updatedBy: staffId,
      });
      toast.success(`"${completedStep}" marked as complete.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not advance lifecycle.");
    }
  };

  const handleArchive = async () => {
    if (!project || !staffId) return;
    if (
      !window.confirm(
        `Archive "${project.title}"? It becomes read-only. You can reopen it by changing the status.`
      )
    )
      return;
    try {
      await archiveProject({ id: project._id, archivedBy: staffId });
      toast.success("Commission archived.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not archive.");
    }
  };

  const handleDelete = async () => {
    if (!project || !staffId) return;
    if (
      !window.confirm(
        `Remove "${project.title}" from the commission list?\n\nThis is a soft delete — the record and its full history are retained and can be restored by an administrator.`
      )
    )
      return;
    try {
      await softDeleteProject({ id: project._id, deletedBy: staffId });
      toast.success("Commission removed from the list.");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove.");
    }
  };

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
            {/* Project-specific secondary sidebar + lifecycle rail */}
            <div className="relative flex h-full">
              <ProjectSidebar
                projectTitle={project.title}
                projectType={TYPE_LABEL[project.type]}
                projectStatus={project.status}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                onArchive={handleArchive}
                onRemove={handleDelete}
              />

              {/* Lifecycle progress rail — right edge of sidebar, absolutely positioned */}
              <div className="absolute right-0 top-0 bottom-0 translate-x-full z-10 pointer-events-none">
                <div className="h-full border-l border-border/40 pointer-events-auto">
                  <LifecycleRail
                    currentStageIndex={lifecycleStageIndex}
                    collapsed={sidebarCollapsed}
                    onAdvance={handleAdvanceLifecycle}
                    isLocked={isLocked}
                  />
                </div>
              </div>
            </div>

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
