"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ─── Track Variants ────────────────────────────────────────────────────────── */
const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-[#212435]",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-1.5",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

/* ─── Indicator color helper ────────────────────────────────────────────────── */
function getIndicatorColor(variant?: string | null, value?: number): string {
  if (variant === "success") return "bg-[#00D084]"
  if (variant === "danger")  return "bg-[#FF4D4F]"
  if (variant === "warning") return "bg-[#F59E0B]"
  if (variant === "info")    return "bg-[#3B82F6]"
  if (variant === "auto" && value !== undefined) {
    if (value <= 40) return "bg-[#FF4D4F]"
    if (value <= 70) return "bg-[#F59E0B]"
    return "bg-[#00D084]"
  }
  return "bg-[#00D084]"
}

/* ─── Props ─────────────────────────────────────────────────────────────────── */
export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressTrackVariants> {
  /** Color variant — use "auto" to derive color from value */
  variant?: "success" | "danger" | "warning" | "info" | "auto"
  /** Whether to show glow effect */
  glow?: boolean
  /** Whether to animate the indicator */
  animate?: boolean
  /** Show percentage label */
  showLabel?: boolean
  /** Label position */
  labelPosition?: "right" | "top"
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      size,
      variant,
      glow = false,
      animate = true,
      showLabel = false,
      labelPosition = "right",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, ((value ?? 0) / (max ?? 100)) * 100))
    const indicatorColor = getIndicatorColor(variant, percentage)

    const glowColor: Record<string, string> = {
      "bg-[#00D084]": "shadow-[0_0_8px_rgba(0,208,132,0.5)]",
      "bg-[#FF4D4F]": "shadow-[0_0_8px_rgba(255,77,79,0.5)]",
      "bg-[#F59E0B]": "shadow-[0_0_8px_rgba(245,158,11,0.5)]",
      "bg-[#3B82F6]": "shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    }

    const track = (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressTrackVariants({ size }), className)}
        value={value}
        max={max}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 rounded-full",
            indicatorColor,
            animate && "transition-all duration-700 ease-out",
            glow && glowColor[indicatorColor]
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    )

    if (!showLabel) return track

    if (labelPosition === "top") {
      return (
        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#8B8FA8]">
              {props["aria-label"] ?? "Progresso"}
            </span>
            <span className="text-xs font-medium text-[#F4F4F5] tabular-nums">
              {Math.round(percentage)}%
            </span>
          </div>
          {track}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 w-full">
        {track}
        <span className="text-xs font-medium text-[#F4F4F5] tabular-nums w-8 text-right flex-shrink-0">
          {Math.round(percentage)}%
        </span>
      </div>
    )
  }
)

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
