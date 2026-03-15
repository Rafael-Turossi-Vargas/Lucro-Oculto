import * as React from "react"
import { cn } from "@/lib/utils"

/* ─── Props ─────────────────────────────────────────────────────────────────── */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode
  /** Icon or element to display on the right side */
  rightIcon?: React.ReactNode
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      leftIcon,
      rightIcon,
      error,
      errorMessage,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        {/* Left icon */}
        {leftIcon && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center",
              "text-[var(--text-muted)] pointer-events-none h-4 w-4",
              disabled && "opacity-50"
            )}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            // Base
            "flex h-9 w-full rounded-lg",
            "bg-[var(--bg-subtle)] text-[var(--text-primary)]",
            "border border-[var(--border)]",
            "text-sm leading-none",
            "px-3 py-2",
            "placeholder:text-[var(--text-faint)]",
            // Transitions
            "transition-all duration-150 ease-in-out",
            // Hover
            "hover:border-[var(--border-hover,var(--border))]",
            // Focus
            "focus:outline-none focus:ring-2 focus:ring-[#00D084] focus:ring-offset-1 focus:ring-offset-[var(--bg-page)]",
            "focus:border-[#00D084]",
            // Error state
            error && [
              "border-[#FF4D4F]",
              "focus:ring-[#FF4D4F]",
              "focus:border-[#FF4D4F]",
            ],
            // Disabled
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-card)]",
            // Icon padding adjustments
            leftIcon && "pl-9",
            rightIcon && "pr-9",
            className
          )}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center",
              "text-[var(--text-muted)] h-4 w-4",
              disabled && "opacity-50"
            )}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}

        {/* Error message */}
        {error && errorMessage && (
          <p className="mt-1 text-xs text-[#FF4D4F]" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

/* ─── Textarea ──────────────────────────────────────────────────────────────── */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  errorMessage?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, errorMessage, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg",
          "bg-[var(--bg-subtle)] text-[var(--text-primary)]",
          "border border-[var(--border)]",
          "text-sm leading-relaxed",
          "px-3 py-2",
          "placeholder:text-[var(--text-faint)]",
          "resize-y",
          "transition-all duration-150 ease-in-out",
          "hover:border-[var(--border-hover,var(--border))]",
          "focus:outline-none focus:ring-2 focus:ring-[#00D084] focus:ring-offset-1 focus:ring-offset-[var(--bg-page)]",
          "focus:border-[#00D084]",
          error && "border-[#FF4D4F] focus:ring-[#FF4D4F] focus:border-[#FF4D4F]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:resize-none",
          className
        )}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-xs text-[#FF4D4F]" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
)

Textarea.displayName = "Textarea"

export { Input, Textarea }
