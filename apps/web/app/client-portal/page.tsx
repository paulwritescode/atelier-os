"use client"


import React, { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { MessageSquare, Calendar, Download, Mail } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/AuthProvider"
import type { Comment, ProjectStatus, ProjectType, AppointmentType } from "@/lib/types"

const LIFECYCLE_STAGES = [
  "Lead", "Consultation", "Design", "Quotation", "Deposit",
  "Measurements", "Production", "Fitting", "Final Payment", "Delivery", "Completed",
] as const

const STATUS_COPY: Record<ProjectStatus, string> = {
  Draft: "Your commission has been created and is being reviewed.",
  Active: "Your commission is actively in progress.",
  OnHold: "Your commission is currently on hold.",
  Completed: "Your commission has been completed.",
  Archived: "Your commission has been archived.",
}

const TYPE_LABELS: Record<ProjectType, string> = {
  Wedding: "Wedding", Corporate: "Corporate", Individual: "Individual",
  ClosetRevamp: "Closet Revamp", GalaOutfit: "Gala Outfit",
  Photoshoot: "Photoshoot", Alteration: "Alteration",
}

const APPOINTMENT_TYPES: { value: AppointmentType; label: string }[] = [
  { value: "Consultation", label: "Consultation" },
  { value: "Measurement", label: "Measurement" },
  { value: "Fitting", label: "Fitting" },
  { value: "Pickup", label: "Pickup" },
  { value: "SiteVisit", label: "Site Visit" },
]

/** Module-level so the clock read stays out of render (react-hooks/purity). */
function hoursSince(ms: number): number {
  return Math.floor((new Date().getTime() - ms) / (1000 * 60 * 60))
}

function getCurrentStage(status: ProjectStatus): number {
  const map: Record<ProjectStatus, number> = { Draft: 0, Active: 5, OnHold: 5, Completed: 10, Archived: 10 }
  return map[status] ?? 0
}

export default function ClientPortalPage() {
  const { user } = useAuth()

  // ── Convex queries ──────────────────────────────────────────────────────
  // For now, fetch all projects and filter to the client's first project
  // TODO: Replace with a dedicated client-facing query when auth is fully wired
  const projects = useQuery(api.projects.list)
  const project = projects?.[0] // placeholder — first project

  const timeline = useQuery(
    api.timeline.listByProject,
    project ? { projectId: project._id } : "skip"
  )
  const stories = useQuery(
    api.stories.listActive,
    project ? { projectId: project._id } : "skip"
  )

  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("Fitting")
  const [appointmentNotes, setAppointmentNotes] = useState("")
  const [appointmentSent, setAppointmentSent] = useState(false)

  // Loading state
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#F6F2EC" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "#E7E2DB", borderTopColor: "#4B1E2A" }} />
          <p className="text-[14px]" style={{ color: "#8C857D" }}>Loading your commission...</p>
        </div>
      </div>
    )
  }

  const currentStage = getCurrentStage(project.status)

  const addComment = (): void => {
    if (!newComment.trim()) return
    setComments([...comments, {
      id: Date.now().toString(),
      text: newComment,
      author: user?.name ?? "Client",
      timestamp: new Date().toISOString(),
    }])
    setNewComment("")
  }

  const handleAppointmentRequest = (): void => {
    setAppointmentSent(true)
    setAppointmentNotes("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header — no sidebar for client portal */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <span className="font-heading text-lg font-semibold text-foreground">Anio Regalia</span>
              <span className="ml-2 text-xs text-muted-foreground">Client Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${project.status === "Active" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {project.status}
              </span>
              <span className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {TYPE_LABELS[project.type as ProjectType]}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Commission Header */}
        <div className="mb-8">
          <h1 className="font-heading mb-1 text-3xl font-light text-foreground">{project.title}</h1>
          <p className="text-muted-foreground">{STATUS_COPY[project.status as ProjectStatus]}</p>
        </div>

        {/* Lifecycle Progress */}
        <Card className="mb-6">
          <CardHeader><CardTitle className="font-heading text-base font-medium">Commission Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {LIFECYCLE_STAGES.map((stage, index) => (
                <React.Fragment key={stage}>
                  <div className="flex shrink-0 flex-col items-center">
                    <div className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${index <= currentStage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {index + 1}
                    </div>
                    <span className={`mt-1 max-w-[60px] text-center text-[10px] leading-tight ${index === currentStage ? "font-medium text-foreground" : "text-muted-foreground"}`}>{stage}</span>
                  </div>
                  {index < LIFECYCLE_STAGES.length - 1 && (
                    <div className={`h-0.5 w-6 shrink-0 ${index < currentStage ? "bg-primary" : "bg-muted"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Story Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-base font-medium">Latest Updates</CardTitle>
                <CardDescription>Highlighted for 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {stories && stories.length > 0 ? stories.map((story) => {
                  const hoursAgo = hoursSince(story.publishedAt)
                  return (
                    <div key={story._id} className="rounded-lg border border-secondary/40 bg-secondary/10 p-4">
                      <p className="mb-2 text-sm text-foreground">{story.text}</p>
                      <p className="text-xs text-muted-foreground">{hoursAgo === 0 ? "Just now" : `${hoursAgo}h ago`}</p>
                    </div>
                  )
                }) : (
                  <p className="text-sm text-muted-foreground">No updates yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader><CardTitle className="font-heading text-base font-medium">Commission Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {timeline?.map((event) => (
                    <div key={event._id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="size-2 rounded-full bg-primary" />
                        <div className="mt-1 w-px flex-1 bg-border" />
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-foreground">{event.type}</p>
                        <p className="text-sm text-muted-foreground">{event.summary}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  )) ?? <p className="text-sm text-muted-foreground">No timeline events yet.</p>}
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center text-base font-medium">
                  <HugeiconsIcon icon={MessageSquare} className="mr-2 size-4" />Feedback
                </CardTitle>
                <CardDescription>Share your thoughts, questions, or adjustments.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex max-h-60 flex-col gap-3 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg bg-muted p-3">
                      <div className="mb-1 flex items-start justify-between">
                        <span className="text-sm font-medium text-foreground">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{new Date(comment.timestamp).toLocaleDateString("en-GB")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.text}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <Label htmlFor="new-comment" className="mb-2 block">Add a comment</Label>
                  <Textarea id="new-comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Share your feedback..." rows={3} className="mb-3 resize-none" />
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    <HugeiconsIcon icon={MessageSquare} className="mr-2 size-4" />Post Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader><CardTitle className="font-heading text-base font-medium">Quotation</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="font-medium text-foreground">Pending</span></div>
                <p className="text-xs text-muted-foreground">Quotation details will appear once prepared.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="font-heading text-base font-medium">Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!appointmentSent ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground">Request Appointment</p>
                    <select value={appointmentType} onChange={(e) => setAppointmentType(e.target.value as AppointmentType)} className="h-8 w-full rounded-md border border-border bg-input/50 px-2 text-sm text-foreground">
                      {APPOINTMENT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                    </select>
                    <Textarea value={appointmentNotes} onChange={(e) => setAppointmentNotes(e.target.value)} placeholder="Any notes..." rows={2} className="resize-none text-sm" />
                    <Button size="sm" onClick={handleAppointmentRequest}>
                      <HugeiconsIcon icon={Calendar} className="mr-2 size-4" />Request
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Appointment request sent.</p>
                )}
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-sm font-medium text-foreground">Documents</p>
                  <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                    <HugeiconsIcon icon={Download} className="mr-2 size-4" />Generate Quotation PDF
                  </Button>
                </div>
                <div className="border-t border-border pt-3">
                  <Button variant="outline" size="sm" className="w-full justify-start" render={<a href="mailto:hello@anioregalia.com" />}>
                    <HugeiconsIcon icon={Mail} className="mr-2 size-4" />Contact Anio Regalia
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
