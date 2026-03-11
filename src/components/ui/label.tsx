"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

/* ─── Component ─────────────────────────────────────────────────────────────── */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean
    optional?: boolean
  }
>(({ className, required, optional, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium text-[#F4F4F5] leading-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      "select-none",
      className
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-1 text-[#FF4D4F] text-xs" aria-hidden="true">
        *
      </span>
    )}
    {optional && (
      <span className="ml-1 text-[#4B4F6A] text-xs font-normal">
        (opcional)
      </span>
    )}
  </LabelPrimitive.Root>
))

Label.displayName = LabelPrimitive.Root.displayName

export { Label }
