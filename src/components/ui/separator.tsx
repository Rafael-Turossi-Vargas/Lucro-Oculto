"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"

/* ─── Component ─────────────────────────────────────────────────────────────── */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    /** Gradient variant: fades on the edges */
    gradient?: boolean
    /** Label in the center of the separator */
    label?: string
  }
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      gradient = false,
      label,
      ...props
    },
    ref
  ) => {
    if (label) {
      return (
        <div
          className={cn(
            "flex items-center gap-3",
            orientation === "vertical" && "flex-col h-full",
            className
          )}
        >
          <SeparatorPrimitive.Root
            ref={ref}
            decorative={decorative}
            orientation={orientation}
            className={cn(
              "flex-1 bg-[#2A2D3A] shrink-0",
              orientation === "horizontal" ? "h-px" : "w-px"
            )}
            {...props}
          />
          <span className="text-xs text-[#4B4F6A] whitespace-nowrap px-1">
            {label}
          </span>
          <SeparatorPrimitive.Root
            decorative={decorative}
            orientation={orientation}
            className={cn(
              "flex-1 bg-[#2A2D3A] shrink-0",
              orientation === "horizontal" ? "h-px" : "w-px"
            )}
          />
        </div>
      )
    }

    if (gradient) {
      return (
        <div
          className={cn(
            orientation === "horizontal"
              ? "h-px w-full bg-gradient-to-r from-transparent via-[#2A2D3A] to-transparent"
              : "w-px h-full bg-gradient-to-b from-transparent via-[#2A2D3A] to-transparent",
            className
          )}
          role={decorative ? "none" : "separator"}
          aria-orientation={orientation}
        />
      )
    }

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-[#2A2D3A]",
          orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
          className
        )}
        {...props}
      />
    )
  }
)

Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
