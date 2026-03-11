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
              "text-[#8B8FA8] pointer-events-none h-4 w-4",
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
            "bg-[#212435] text-[#F4F4F5]",
            "border border-[#2A2D3A]",
            "text-sm leading-none",
            "px-3 py-2",
            "placeholder:text-[#4B4F6A]",
            // Transitions
            "transition-all duration-150 ease-in-out",
            // Hover
            "hover:border-[#3D4158]",
            // Focus
            "focus:outline-none focus:ring-2 focus:ring-[#00D084] focus:ring-offset-1 focus:ring-offset-[#0F1117]",
            "focus:border-[#00D084]",
            // Error state
            error && [
              "border-[#FF4D4F]",
              "focus:ring-[#FF4D4F]",
              "focus:border-[#FF4D4F]",
            ],
            // Disabled
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#1A1D27]",
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
              "text-[#8B8FA8] h-4 w-4",
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
          "bg-[#212435] text-[#F4F4F5]",
          "border border-[#2A2D3A]",
          "text-sm leading-relaxed",
          "px-3 py-2",
          "placeholder:text-[#4B4F6A]",
          "resize-y",
          "transition-all duration-150 ease-in-out",
          "hover:border-[#3D4158]",
          "focus:outline-none focus:ring-2 focus:ring-[#00D084] focus:ring-offset-1 focus:ring-offset-[#0F1117]",
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
