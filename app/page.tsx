"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Plus, Search, Filter, Grid, List, User, Palette, Bell } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CanvasCard } from "@/components/CanvasCard"
import { CreateCanvasModal } from "@/components/CreateCanvasModal"
import { CanvasEditor } from "@/components/CanvasEditor"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type { Canvas, NewCanvasInput } from "@/lib/types"

const Index = () => {
  const [canvases, setCanvases] = useState<Canvas[]>([
    {
      id: "1",
      title: "Sarah Johnson - Wedding Dress",
      clientName: "Sarah Johnson",
      status: "In Progress" as const,
      lastModified: "2 hours ago",
      createdAt: "2024-06-10",
      previewImage:
        "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      content:
        "Wedding dress consultation with detailed measurements and style preferences...",
    },
    {
      id: "2",
      title: "Michael Chen - Business Suit",
      clientName: "Michael Chen",
      status: "Draft" as const,
      lastModified: "1 day ago",
      createdAt: "2024-06-09",
      previewImage:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      content: "Custom business suit with specific fabric requirements...",
    },
    {
      id: "3",
      title: "Emma Rodriguez - Evening Gown",
      clientName: "Emma Rodriguez",
      status: "Completed" as const,
      lastModified: "3 days ago",
      createdAt: "2024-06-07",
      previewImage:
        "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
      content: "Elegant evening gown for charity gala event...",
    },
  ])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCanvas, setSelectedCanvas] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [notifications] = useState(3) // Mock notification count

  const filteredCanvases = canvases.filter((canvas) => {
    const matchesSearch =
      canvas.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      canvas.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || canvas.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const handleCreateCanvas = (canvasData: NewCanvasInput) => {
    const newCanvas: Canvas = {
      id: Date.now().toString(),
      title: `${canvasData.clientName} - ${canvasData.projectType}`,
      clientName: canvasData.clientName,
      status: "Draft" as const,
      lastModified: "Just now",
      createdAt: new Date().toISOString().split("T")[0],
      previewImage:
        "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
      content: canvasData.notes || "New canvas created...",
    }
    setCanvases([newCanvas, ...canvases])
    setIsCreateModalOpen(false)
  }

  if (selectedCanvas) {
    const canvas = canvases.find((c) => c.id === selectedCanvas)
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1">
            <CanvasEditor
              canvas={canvas}
              onBack={() => setSelectedCanvas(null)}
              onSave={(updatedCanvas) => {
                setCanvases(
                  canvases.map((c) =>
                    c.id === selectedCanvas ? { ...c, ...updatedCanvas } : c
                  )
                )
              }}
            />
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 bg-background">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                      <HugeiconsIcon
                        icon={Palette}
                        className="size-5 text-primary-foreground"
                      />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">Canvas Manager</h1>
                  </div>
                  <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
                    <span>•</span>
                    <span>{canvases.length} canvases</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Button variant="ghost" size="sm">
                      <HugeiconsIcon icon={Bell} className="size-4" />
                      {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                          {notifications}
                        </span>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <HugeiconsIcon icon={Grid} className="size-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <HugeiconsIcon icon={List} className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary">
                      <HugeiconsIcon
                        icon={User}
                        className="size-4 text-primary-foreground"
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">John Smith</span>
                  </div>

                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <HugeiconsIcon icon={Plus} className="mr-2 size-4" />
                    New Canvas
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Search and Filters */}
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <HugeiconsIcon
                  icon={Search}
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search canvases or clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Filter} className="size-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded-3xl border border-border bg-input/50 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Canvas Grid/List */}
            {filteredCanvases.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                    : "flex flex-col gap-4"
                }
              >
                {filteredCanvases.map((canvas) => (
                  <CanvasCard
                    key={canvas.id}
                    canvas={canvas}
                    viewMode={viewMode}
                    onClick={() => setSelectedCanvas(canvas.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-primary/15">
                  <HugeiconsIcon icon={Palette} className="size-12 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  No canvases found
                </h3>
                <p className="mb-6 text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first canvas to get started with client management"}
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <HugeiconsIcon icon={Plus} className="mr-2 size-4" />
                  Create First Canvas
                </Button>
              </div>
            )}
          </div>

          <CreateCanvasModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateCanvas}
          />
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Index
