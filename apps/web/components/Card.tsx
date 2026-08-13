"use client"

import React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className={`card-base ${className}`}>
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => {
  return (
    <div className={`border-b border-hairline pb-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => {
  return (
    <h3 className={`card-title text-ink ${className}`}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = "" }) => {
  return (
    <p className={`body-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = "" }) => {
  return (
    <div className={`border-t border-hairline pt-4 flex gap-3 ${className}`}>
      {children}
    </div>
  )
}
