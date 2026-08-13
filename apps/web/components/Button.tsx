"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"

type ButtonVariant = "primary" | "secondary" | "tertiary" | "magenta-promo"
type ButtonSize = "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
  icon?: any
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  "primary": "btn-primary",
  "secondary": "btn-secondary",
  "tertiary": "btn-tertiary",
  "magenta-promo": "btn-magenta-promo",
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  icon,
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={`${variantClasses[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {icon && !isLoading && (
        <HugeiconsIcon icon={icon} className="mr-2 size-5" />
      )}
      {isLoading ? "Loading..." : children}
    </button>
  )
}

export const IconButton: React.FC<Omit<ButtonProps, "children"> & { icon: any; ariaLabel: string }> = ({
  icon,
  ariaLabel,
  variant = "primary",
  className = "",
  ...props
}) => {
  const iconButtonClass = variant === "primary" ? "btn-icon-circular" : "btn-icon-circular-inverse"

  return (
    <button
      className={`${iconButtonClass} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      <HugeiconsIcon icon={icon} className="size-5" />
    </button>
  )
}
