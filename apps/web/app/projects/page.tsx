import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function ProjectsPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center gap-4">
                <SidebarTrigger />
                <h1 className="font-heading text-xl font-semibold text-foreground">
                  Projects
                </h1>
              </div>
            </div>
          </header>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-muted-foreground">Coming soon — full project list.</p>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
