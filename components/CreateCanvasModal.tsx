"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { X } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { NewCanvasInput } from "@/lib/types"

interface CreateCanvasModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: NewCanvasInput) => void
}

export const CreateCanvasModal: React.FC<CreateCanvasModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    clientName: "",
    projectType: "",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ clientName: "", projectType: "", notes: "" })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Create New Canvas</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <HugeiconsIcon icon={X} className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="clientName" className="mb-2 block">
              Client Name
            </Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Enter client name"
              required
            />
          </div>

          <div>
            <Label htmlFor="projectType" className="mb-2 block">
              Project Type
            </Label>
            <Input
              id="projectType"
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
              placeholder="e.g., Wedding Dress, Business Suit, Casual Wear"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes" className="mb-2 block">
              Initial Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any initial notes or requirements..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Canvas
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
