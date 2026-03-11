"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const AVATAR_COLORS = [
  "bg-[#00D084] text-[#0F1117]",
  "bg-[#3B82F6] text-white",
  "bg-[#8B5CF6] text-white",
  "bg-[#F59E0B] text-[#0F1117]",
  "bg-[#EC4899] text-white",
  "bg-[#06B6D4] text-[#0F1117]",
  "bg-[#10B981] text-white",
  "bg-[#EF4444] text-white",
]

function getAvatarColor(name: string): string {
  const idx = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[idx % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

/* ─── Avatar Root ───────────────────────────────────────────────────────────── */
const AvatarRoot = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
AvatarRoot.displayName = AvatarPrimitive.Root.displayName

/* ─── Avatar Image ──────────────────────────────────────────────────────────── */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/* ─── Avatar Fallback ───────────────────────────────────────────────────────── */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full",
      "bg-[#212435] text-[#8B8FA8]",
      "text-xs font-semibold tracking-wide",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

/* ─── Convenience Avatar Component ─────────────────────────────────────────── */
export type AvatarSize = "xs" | "sm" | "default" | "lg" | "xl"

interface AvatarProps {
  name?: string
  src?: string
  alt?: string
  size?: AvatarSize
  className?: string
  colorized?: boolean
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-xs",
  default: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-14 w-14 text-lg",
}

function Avatar({
  name = "",
  src,
  alt,
  size = "default",
  className,
  colorized = true,
}: AvatarProps) {
  const initials = getInitials(name || "?")
  const colorClass = colorized && name ? getAvatarColor(name) : "bg-[#212435] text-[#8B8FA8]"

  return (
    <AvatarRoot className={cn(sizeClasses[size], className)}>
      {src && (
        <AvatarImage src={src} alt={alt ?? name} />
      )}
      <AvatarFallback
        className={cn(colorClass, sizeClasses[size], "font-semibold")}
      >
        {initials}
      </AvatarFallback>
    </AvatarRoot>
  )
}

export { Avatar, AvatarRoot, AvatarImage, AvatarFallback }
