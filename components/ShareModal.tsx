"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { X, Copy, Mail } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Canvas } from "@/lib/types"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  canvas?: Canvas
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, canvas }) => {
  const [email, setEmail] = useState("")
  const [shareLink] = useState(`https://yourapp.com/canvas/${canvas?.id || "demo"}`)

  const handleEmailShare = () => {
    // Implementation for email sharing
    console.log("Sharing via email to:", email)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Share Canvas</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <HugeiconsIcon icon={X} className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="share-email" className="mb-2 block">
              Share via Email
            </Label>
            <div className="flex gap-2">
              <Input
                id="share-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
              <Button size="icon" onClick={handleEmailShare}>
                <HugeiconsIcon icon={Mail} className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="share-link" className="mb-2 block">
              Share Link
            </Label>
            <div className="flex gap-2">
              <Input id="share-link" value={shareLink} readOnly />
              <Button size="icon" onClick={copyLink}>
                <HugeiconsIcon icon={Copy} className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
