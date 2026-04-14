"use client"

import React from "react"

export default function Toggle({
  checked,
  onChange,
  disabled = false,
  "aria-label": ariaLabel,
  className = "",
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  "aria-label"?: string
  className?: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${className}`}
    >
      <span
        className={`absolute left-0 top-0 h-8 w-14 rounded-full transition-colors ${checked ? 'bg-green-400' : 'bg-gray-300'} `}
      />
      <span
        className={`relative inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
