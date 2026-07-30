"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft,
  Save,
  Share,
  Upload,
  Type,
  Image as ImageIcon,
  User,
  Calendar,
  Palette,
  Download,
  MessageSquare,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ClientInfoPanel } from "@/components/ClientInfoPanel"
import { ShareModal } from "@/components/ShareModal"
import { exportToPDF } from "@/lib/pdfExport"
import type { Canvas, CanvasUpdate, Comment } from "@/lib/types"

interface CanvasEditorProps {
  canvas?: Canvas
  onBack: () => void
  onSave: (canvas: CanvasUpdate) => void
}

interface TextSection {
  id: string
  heading: string
  content: string
}

interface SavedSection {
  id: string
  heading: string
  content: string
  savedAt: string
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ canvas, onBack, onSave }) => {
  const [title, setTitle] = useState(canvas?.title || "")
  const [content, setContent] = useState(canvas?.content || "")
  const [activeTab, setActiveTab] = useState<"canvas" | "client">("canvas")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [textSections, setTextSections] = useState<TextSection[]>([])
  const [savedSections, setSavedSections] = useState<SavedSection[]>([])
  const [comments] = useState<Comment[]>([])

  const ownerName = "John Smith" // This would come from user context

  const handleSave = () => {
    onSave({
      title,
      content,
      lastModified: "Just now",
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map(
        () =>
          "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop"
      )
      setImages([...images, ...newImages])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const newImages = Array.from(files).map(
        () =>
          "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=200&fit=crop"
      )
      setImages([...images, ...newImages])
    }
  }

  const addTextSection = () => {
    const newSection: TextSection = {
      id: Date.now().toString(),
      heading: `Section ${textSections.length + 1}`,
      content: "",
    }
    setTextSections([...textSections, newSection])
  }

  const updateTextSection = (id: string, field: "heading" | "content", value: string) => {
    const updated = textSections.map((section) =>
      section.id === id ? { ...section, [field]: value } : section
    )
    setTextSections(updated)
  }

  const saveTextSection = (sectionId: string) => {
    const section = textSections.find((s) => s.id === sectionId)
    if (section && section.heading && section.content) {
      const savedSection: SavedSection = {
        ...section,
        savedAt: new Date().toLocaleString(),
      }
      setSavedSections([...savedSections, savedSection])

      // Remove from draft sections
      setTextSections(textSections.filter((s) => s.id !== sectionId))
    }
  }

  const handlePDFExport = () => {
    if (canvas) {
      exportToPDF({ ...canvas, title, content }, ownerName)
    }
  }

  const scheduleClientMeeting = () => {
    // Implementation for scheduling meetings
    alert("Meeting scheduling feature would be integrated with calendar apps")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <HugeiconsIcon icon={ArrowLeft} className="mr-2 size-4" />
                Back
              </Button>
              <div className="h-4 w-px bg-border" />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-auto border-none bg-transparent p-0 text-lg font-semibold"
                placeholder="Canvas title..."
              />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handlePDFExport}>
                <HugeiconsIcon icon={Download} className="mr-2 size-4" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
                <HugeiconsIcon icon={Share} className="mr-2 size-4" />
                Share
              </Button>
              <Button size="sm" onClick={handleSave}>
                <HugeiconsIcon icon={Save} className="mr-2 size-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Main Canvas Area */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="mb-6 flex gap-1">
              <Button
                variant={activeTab === "canvas" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("canvas")}
              >
                <HugeiconsIcon icon={Palette} className="mr-2 size-4" />
                Canvas
              </Button>
              <Button
                variant={activeTab === "client" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("client")}
              >
                <HugeiconsIcon icon={User} className="mr-2 size-4" />
                Client Details
              </Button>
            </div>

            {activeTab === "canvas" ? (
              <div className="rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
                {/* Toolbar */}
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={addTextSection}>
                      <HugeiconsIcon icon={Type} className="mr-2 size-4" />
                      Add Text
                    </Button>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" render={<span />}>
                        <HugeiconsIcon icon={Upload} className="mr-2 size-4" />
                        Upload Image
                      </Button>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last saved: {canvas?.lastModified || "Never"}
                  </div>
                </div>

                {/* Canvas Content */}
                <div className="flex flex-col gap-6">
                  <div>
                    <Label htmlFor="project-notes" className="mb-2 block">
                      Project Notes &amp; Requirements
                    </Label>
                    <Textarea
                      id="project-notes"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Add project details, measurements, material preferences, design requirements..."
                      rows={8}
                      className="w-full resize-none"
                    />
                  </div>

                  {/* Saved Sections */}
                  {savedSections.length > 0 && (
                    <div>
                      <h4 className="mb-4 text-sm font-medium text-foreground">
                        Saved Canvas Sections
                      </h4>
                      <div className="flex flex-col gap-4">
                        {savedSections.map((section) => (
                          <div
                            key={section.id}
                            className="rounded-lg border border-primary/30 bg-primary/10 p-4"
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <h4 className="font-medium text-foreground">
                                {section.heading}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                Saved: {section.savedAt}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {section.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic Text Sections */}
                  {textSections.map((section) => (
                    <div
                      key={section.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4"
                    >
                      <div>
                        <Label htmlFor={`heading-${section.id}`} className="mb-2 block">
                          Section Heading
                        </Label>
                        <Input
                          id={`heading-${section.id}`}
                          value={section.heading}
                          onChange={(e) =>
                            updateTextSection(section.id, "heading", e.target.value)
                          }
                          placeholder="Enter section heading..."
                          className="font-medium"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`content-${section.id}`} className="mb-2 block">
                          Content
                        </Label>
                        <Textarea
                          id={`content-${section.id}`}
                          value={section.content}
                          onChange={(e) =>
                            updateTextSection(section.id, "content", e.target.value)
                          }
                          placeholder="Add text content..."
                          rows={4}
                          className="w-full resize-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => saveTextSection(section.id)}
                          disabled={!section.heading || !section.content}
                        >
                          <HugeiconsIcon icon={Save} className="mr-2 size-4" />
                          Save to Canvas
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Image Gallery */}
                  {images.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-foreground">
                        Reference Images
                      </h4>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square overflow-hidden rounded-lg bg-muted"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image}
                              alt={`Reference ${index + 1}`}
                              className="size-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Areas */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div
                      className="cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <HugeiconsIcon
                        icon={ImageIcon}
                        className="mx-auto mb-2 size-8 text-muted-foreground"
                      />
                      <p className="text-sm text-muted-foreground">
                        Drop images here or click to upload
                      </p>
                    </div>
                    <div
                      className="cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary"
                      onClick={addTextSection}
                    >
                      <HugeiconsIcon
                        icon={Type}
                        className="mx-auto mb-2 size-8 text-muted-foreground"
                      />
                      <p className="text-sm text-muted-foreground">Add text section</p>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-foreground">
                      Client Comments
                    </h4>
                    <div className="flex flex-col gap-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg bg-muted p-3">
                          <div className="mb-1 flex items-start justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {comment.author}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.text}</p>
                        </div>
                      ))}
                      {comments.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">
                          No comments yet from client
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ClientInfoPanel canvas={canvas} />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80">
            <div className="flex flex-col gap-6 rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
              <div>
                <h3 className="mb-4 font-medium text-foreground">Canvas Information</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">
                      {canvas?.status || "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="text-foreground">{canvas?.createdAt || "Today"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Modified</span>
                    <span className="text-foreground">
                      {canvas?.lastModified || "Never"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Comments</span>
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {comments.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Saved Sections</span>
                    <span className="rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">
                      {savedSections.length}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-medium text-foreground">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    <HugeiconsIcon icon={Share} className="mr-2 size-4" />
                    Share with Client
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={scheduleClientMeeting}
                  >
                    <HugeiconsIcon icon={Calendar} className="mr-2 size-4" />
                    Schedule Meeting
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handlePDFExport}
                  >
                    <HugeiconsIcon icon={Download} className="mr-2 size-4" />
                    Export as PDF
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <HugeiconsIcon icon={MessageSquare} className="mr-2 size-4" />
                    View Comments ({comments.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        canvas={canvas}
      />
    </div>
  )
}
