"use client"

import React from "react"

export type ColorBlockVariant = "lime" | "lilac" | "cream" | "mint" | "pink" | "coral" | "navy"

interface ColorBlockSectionProps {
  variant?: ColorBlockVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<ColorBlockVariant, string> = {
  lime: "bg-block-lime text-ink",
  lilac: "bg-block-lilac text-ink",
  cream: "bg-block-cream text-ink",
  mint: "bg-block-mint text-ink",
  pink: "bg-block-pink text-ink",
  coral: "bg-block-coral text-ink",
  navy: "bg-block-navy text-inverse-ink",
}

export const ColorBlockSection: React.FC<ColorBlockSectionProps> = ({
  variant = "lime",
  children,
  className = "",
}) => {
  return (
    <section
      className={`w-full rounded-lg p-12 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </section>
  )
}
