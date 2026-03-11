import * as React from "react"
import { cn } from "@/lib/utils"

/* ─── Skeleton ──────────────────────────────────────────────────────────────── */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Explicit width */
  width?: string | number
  /** Explicit height */
  height?: string | number
  /** Make it circular */
  circle?: boolean
}

function Skeleton({ className, width, height, circle, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "bg-[#1A1D27]",
        "rounded-lg",
        circle && "rounded-full",
        // Shimmer animation
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-[#212435] before:to-transparent",
        "before:animate-[shimmer_1.8s_ease-in-out_infinite]",
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

/* ─── Skeleton Text ─────────────────────────────────────────────────────────── */
function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = "60%",
}: {
  lines?: number
  className?: string
  lastLineWidth?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          style={{
            width: i === lines - 1 ? lastLineWidth : "100%",
          }}
          className="rounded-md"
        />
      ))}
    </div>
  )
}

/* ─── Skeleton Card ─────────────────────────────────────────────────────────── */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-5 space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton width={36} height={36} circle />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width="60%" className="rounded-md" />
          <Skeleton height={12} width="40%" className="rounded-md" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <Skeleton height={32} className="rounded-lg" />
    </div>
  )
}

/* ─── Skeleton Metric ───────────────────────────────────────────────────────── */
function SkeletonMetric({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-5 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton height={12} width={100} className="rounded-md" />
        <Skeleton width={28} height={28} circle />
      </div>
      <Skeleton height={32} width={140} className="rounded-md" />
      <Skeleton height={12} width={80} className="rounded-md" />
    </div>
  )
}

/* ─── Skeleton Table Row ────────────────────────────────────────────────────── */
function SkeletonTableRow({ cols = 4, className }: { cols?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          className="rounded-md flex-1"
          style={{ maxWidth: i === 0 ? "200px" : undefined }}
        />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonMetric, SkeletonTableRow }
