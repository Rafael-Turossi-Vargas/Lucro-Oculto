"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

/* ─── Provider ──────────────────────────────────────────────────────────────── */
const TooltipProvider = TooltipPrimitive.Provider

/* ─── Root ──────────────────────────────────────────────────────────────────── */
const Tooltip = TooltipPrimitive.Root

/* ─── Trigger ───────────────────────────────────────────────────────────────── */
const TooltipTrigger = TooltipPrimitive.Trigger

/* ─── Content ───────────────────────────────────────────────────────────────── */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Layout
        "z-50 max-w-xs",
        "px-3 py-1.5",
        "rounded-lg",
        // Styling
        "bg-[#212435] text-[#F4F4F5]",
        "border border-[#2A2D3A]",
        "text-xs leading-relaxed",
        "shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
        // Animations
        "animate-in fade-in-0 zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="fill-[#212435]" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

/* ─── Convenience Component ─────────────────────────────────────────────────── */
interface SimpleTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  delayDuration?: number
  className?: string
  contentClassName?: string
}

function SimpleTooltip({
  children,
  content,
  side = "top",
  delayDuration = 300,
  contentClassName,
}: SimpleTooltipProps) {
  if (!content) return <>{children}</>

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  SimpleTooltip,
}
