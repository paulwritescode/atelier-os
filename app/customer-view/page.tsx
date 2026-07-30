"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { MessageSquare, User, Calendar, Download, Eye } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const CustomerView = () => {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<
    Array<{ id: string; text: string; author: string; timestamp: string }>
  >([
    {
      id: "1",
      text: "I love the design concept! Could we make the sleeves a bit longer?",
      author: "Sarah Johnson",
      timestamp: "2024-06-14T10:30:00Z",
    },
    {
      id: "2",
      text: "The color palette looks perfect. When can we schedule a fitting?",
      author: "Sarah Johnson",
      timestamp: "2024-06-14T11:15:00Z",
    },
  ])

  // Mock canvas data
  const canvas = {
    title: "Sarah Johnson - Wedding Dress",
    clientName: "Sarah Johnson",
    status: "In Progress",
    content:
      "Custom wedding dress with detailed measurements and style preferences. Looking for an elegant A-line silhouette with lace details.",
    pricing: {
      baseCost: 800,
      materialCost: 200,
      laborCost: 400,
      totalCost: 1400,
    },
  }

  const savedSections = [
    {
      id: "1",
      heading: "Design Specifications",
      content:
        "A-line silhouette with sweetheart neckline, chapel train, French lace overlay with pearl beading.",
      savedAt: "2024-06-14 09:30 AM",
    },
    {
      id: "2",
      heading: "Fabric Details",
      content:
        "Ivory silk mikado base with Alençon lace overlay. Covered buttons along the back.",
      savedAt: "2024-06-14 10:15 AM",
    },
  ]

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: canvas.clientName,
        timestamp: new Date().toISOString(),
      }
      setComments([...comments, comment])
      setNewComment("")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <HugeiconsIcon icon={Eye} className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{canvas.title}</h1>
                <p className="text-sm text-muted-foreground">Client View</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary">
                {canvas.status}
              </span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={User} className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{canvas.clientName}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Project Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
                <CardDescription>Details about your custom project</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{canvas.content}</p>
              </CardContent>
            </Card>

            {/* Saved Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Finalized specifications and requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {savedSections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-lg border border-primary/30 bg-primary/10 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-medium text-foreground">{section.heading}</h4>
                      <span className="text-xs text-muted-foreground">
                        Added: {section.savedAt}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{section.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HugeiconsIcon icon={MessageSquare} className="mr-2 size-5" />
                  Comments &amp; Feedback
                </CardTitle>
                <CardDescription>Share your thoughts and feedback</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Existing Comments */}
                <div className="flex max-h-60 flex-col gap-3 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg bg-muted p-3">
                      <div className="mb-1 flex items-start justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {comment.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleDateString()} at{" "}
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add New Comment */}
                <div className="border-t border-border pt-4">
                  <Label htmlFor="new-comment" className="mb-2 block">
                    Add a comment
                  </Label>
                  <Textarea
                    id="new-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your feedback, questions, or suggestions..."
                    rows={3}
                    className="mb-3 w-full resize-none"
                  />
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    <HugeiconsIcon icon={MessageSquare} className="mr-2 size-4" />
                    Post Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">
                    {canvas.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Comments</span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {comments.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Project Sections</span>
                  <span className="rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">
                    {savedSections.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Project Pricing</CardTitle>
                <CardDescription>Cost breakdown for your project</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Cost</span>
                  <span className="font-medium text-foreground">
                    ${canvas.pricing.baseCost}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Materials</span>
                  <span className="font-medium text-foreground">
                    ${canvas.pricing.materialCost}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Labor</span>
                  <span className="font-medium text-foreground">
                    ${canvas.pricing.laborCost}
                  </span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-foreground">Total Cost</span>
                    <span className="text-foreground">${canvas.pricing.totalCost}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <HugeiconsIcon icon={Calendar} className="mr-2 size-4" />
                  Request Meeting
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <HugeiconsIcon icon={Download} className="mr-2 size-4" />
                  Download Details
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <HugeiconsIcon icon={MessageSquare} className="mr-2 size-4" />
                  Contact Designer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerView
