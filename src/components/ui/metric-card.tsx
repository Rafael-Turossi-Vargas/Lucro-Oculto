"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"
import { SimpleTooltip } from "./tooltip"

export type MetricVariant = "positive" | "negative" | "neutral" | "warning" | "info"

interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  variant?: MetricVariant
  invertTrend?: boolean
  tooltip?: React.ReactNode
  onClick?: () => void
  className?: string
  loading?: boolean
}

const VARIANT_CONFIG: Record<
  MetricVariant,
  { iconBg: string; iconColor: string }
> = {
  positive: {
    iconBg: "bg-[rgba(0,208,132,0.12)]",
    iconColor: "text-[#00D084]",
  },
  negative: {
    iconBg: "bg-[rgba(255,77,79,0.12)]",
    iconColor: "text-[#FF4D4F]",
  },
  neutral: {
    iconBg: "bg-[var(--bg-subtle)]",
    iconColor: "text-[var(--text-muted)]",
  },
  warning: {
    iconBg: "bg-[rgba(245,158,11,0.12)]",
    iconColor: "text-[#F59E0B]",
  },
  info: {
    iconBg: "bg-[rgba(59,130,246,0.12)]",
    iconColor: "text-[#3B82F6]",
  },
}

function TrendDisplay({
  trend,
  label,
  invert = false,
}: {
  trend: number
  label?: string
  invert?: boolean
}) {
  const isUp = trend > 0
  const isNeutral = trend === 0
  const isGood = invert ? trend < 0 : trend > 0

  const colorClass = isNeutral
    ? "text-[var(--text-muted)]"
    : isGood
      ? "text-[#00D084]"
      : "text-[#FF4D4F]"

  const Icon = isNeutral ? Minus : isUp ? TrendingUp : TrendingDown

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", colorClass)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span className="tabular-nums">
        {isUp ? "+" : ""}
        {trend.toFixed(1)}%
      </span>
      {label && <span className="text-[var(--text-faint)] font-normal">{label}</span>}
    </span>
  )
}

function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-[var(--bg-subtle)] skeleton-shimmer" />
        <div className="h-7 w-7 rounded-full bg-[var(--bg-subtle)] skeleton-shimmer" />
      </div>
      <div className="h-8 w-32 rounded bg-[var(--bg-subtle)] skeleton-shimmer" />
      <div className="h-3 w-20 rounded bg-[var(--bg-subtle)] skeleton-shimmer" />
    </div>
  )
}

function MetricCard({
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  variant = "neutral",
  invertTrend = false,
  tooltip,
  onClick,
  className,
  loading = false,
}: MetricCardProps) {
  if (loading) return <MetricCardSkeleton className={className} />

  const config = VARIANT_CONFIG[variant]

  const content = (
    <Card
      className={cn(
        onClick && "cursor-pointer hover:-translate-y-0.5 transition-transform duration-200",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") onClick()
            }
          : undefined
      }
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide leading-none mb-2">
              {label}
            </p>

            <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums leading-tight">
              {value}
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {trend !== undefined && (
                <TrendDisplay
                  trend={trend}
                  label={trendLabel}
                  invert={invertTrend}
                />
              )}
              {subtitle && (
                <span className="text-xs text-[var(--text-faint)]">{subtitle}</span>
              )}
            </div>
          </div>

          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0",
                config.iconBg,
                config.iconColor
              )}
              aria-hidden="true"
            >
              <span className="h-5 w-5 flex items-center justify-center">
                {icon}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (tooltip) {
    return (
      <SimpleTooltip content={tooltip} side="top">
        {content}
      </SimpleTooltip>
    )
  }

  return content
}

interface CompactMetricProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  iconColor?: string
  className?: string
}

function CompactMetric({
  label,
  value,
  icon,
  iconColor = "var(--text-muted)",
  className,
}: CompactMetricProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon && (
        <span
          className="flex-shrink-0 h-4 w-4"
          style={{ color: iconColor }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-[var(--text-faint)] uppercase tracking-wide leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-[var(--text-primary)] tabular-nums truncate">
          {value}
        </p>
      </div>
    </div>
  )
}

export { MetricCard, CompactMetric, MetricCardSkeleton, TrendDisplay }