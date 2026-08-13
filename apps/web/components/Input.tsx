"use client"

import React from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block body-lg text-ink mb-3 font-[330]">
          {label}
        </label>
      )}
      <input
        className={`input-text ${error ? "border-red-500 focus:ring-red-500/20" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-[12px] mt-2">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-muted-foreground text-[12px] mt-2">{helperText}</p>
      )}
    </div>
  )
}
