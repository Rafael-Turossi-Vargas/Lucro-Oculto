"use client"

import * as React from "react"
import {
  AlertTriangle,
  TrendingDown,
  Lightbulb,
  Bell,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ArrowRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  formatCurrency,
  getImpactLabel,
  getUrgencyLabel,
  getDifficultyLabel,
} from "@/lib/utils"
import type { InsightType, Impact, Urgency, Difficulty } from "@/types/analysis"
import { Badge } from "./badge"
import { Button } from "./button"
import { Card, CardContent } from "./card"

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface InsightCardProps {
  id: string
  type: InsightType
  title: string
  description: string
  amount?: number
  impact?: Impact
  urgency?: Urgency
  difficulty?: Difficulty
  category?: string
  /** Action label for the primary action */
  actionLabel?: string
  /** Whether the card can be dismissed */
  dismissible?: boolean
  /** Whether the card can be marked as done */
  completable?: boolean
  /** Whether the card starts expanded */
  defaultExpanded?: boolean
  /** Extra detail content shown when expanded */
  detail?: React.ReactNode
  /** Callback when action is triggered */
  onAction?: (id: string) => void
  /** Callback when dismissed */
  onDismiss?: (id: string) => void
  /** Callback when marked as done */
  onComplete?: (id: string) => void
  className?: string
}

/* ─── Insight Type Config ───────────────────────────────────────────────────── */
const TYPE_CONFIG: Record<
  InsightType,
  {
    label: string
    icon: React.FC<{ className?: string }>
    badgeVariant: "danger" | "warning" | "info" | "success" | "secondary"
    borderColor: string
    iconBg: string
    iconColor: string
  }
> = {
  leak: {
    label: "Vazamento",
    icon: TrendingDown,
    badgeVariant: "danger",
    borderColor: "border-l-[#FF4D4F]",
    iconBg: "bg-[rgba(255,77,79,0.12)]",
    iconColor: "text-[#FF4D4F]",
  },
  opportunity: {
    label: "Oportunidade",
    icon: Lightbulb,
    badgeVariant: "success",
    borderColor: "border-l-[#00D084]",
    iconBg: "bg-[rgba(0,208,132,0.12)]",
    iconColor: "text-[#00D084]",
  },
  alert: {
    label: "Alerta",
    icon: AlertTriangle,
    badgeVariant: "warning",
    borderColor: "border-l-[#F59E0B]",
    iconBg: "bg-[rgba(245,158,11,0.12)]",
    iconColor: "text-[#F59E0B]",
  },
  action: {
    label: "Ação",
    icon: Zap,
    badgeVariant: "info",
    borderColor: "border-l-[#3B82F6]",
    iconBg: "bg-[rgba(59,130,246,0.12)]",
    iconColor: "text-[#3B82F6]",
  },
}

/* ─── Impact Badge Variant ──────────────────────────────────────────────────── */
function impactToBadgeVariant(
  impact: Impact
): "danger" | "warning" | "info" | "secondary" {
  if (impact === "high") return "danger"
  if (impact === "medium") return "warning"
  return "info"
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
function InsightCard({
  id,
  type,
  title,
  description,
  amount,
  impact,
  urgency,
  difficulty,
  category,
  actionLabel,
  dismissible = true,
  completable = false,
  defaultExpanded = false,
  detail,
  onAction,
  onDismiss,
  onComplete,
  className,
}: InsightCardProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const [dismissed, setDismissed] = React.useState(false)
  const [completed, setCompleted] = React.useState(false)

  const config = TYPE_CONFIG[type]
  const Icon = config.icon

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation()
    setDismissed(true)
    onDismiss?.(id)
  }

  function handleComplete(e: React.MouseEvent) {
    e.stopPropagation()
    setCompleted(true)
    onComplete?.(id)
  }

  function handleAction(e: React.MouseEvent) {
    e.stopPropagation()
    onAction?.(id)
  }

  if (dismissed || completed) return null

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-200",
        config.borderColor,
        "hover:border-l-4",
        className
      )}
    >
      <CardContent className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 mt-0.5",
              config.iconBg
            )}
            aria-hidden="true"
          >
            <Icon className={cn("h-4 w-4", config.iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <Badge variant={config.badgeVariant} size="sm">
                {config.label}
              </Badge>
              {impact && (
                <Badge variant={impactToBadgeVariant(impact)} size="sm">
                  {getImpactLabel(impact)}
                </Badge>
              )}
              {urgency && (
                <Badge
                  variant={
                    urgency === "immediate"
                      ? "danger"
                      : urgency === "soon"
                      ? "warning"
                      : "secondary"
                  }
                  size="sm"
                >
                  {getUrgencyLabel(urgency)}
                </Badge>
              )}
              {category && (
                <Badge variant="secondary" size="sm">
                  {category}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-[#F4F4F5] leading-snug mb-1">
              {title}
            </h4>

            {/* Description */}
            <p
              className={cn(
                "text-xs text-[#8B8FA8] leading-relaxed",
                !expanded && "truncate-2"
              )}
            >
              {description}
            </p>

            {/* Expanded detail */}
            {expanded && detail && (
              <div className="mt-3 pt-3 border-t border-[#2A2D3A]">
                {detail}
              </div>
            )}

            {/* Footer row */}
            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
              {/* Amount + difficulty */}
              <div className="flex items-center gap-3">
                {amount !== undefined && amount > 0 && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#4B4F6A] uppercase tracking-wide leading-none mb-0.5">
                      Impacto estimado
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        type === "leak" || type === "alert"
                          ? "text-[#FF4D4F]"
                          : "text-[#00D084]"
                      )}
                    >
                      {type === "leak" || type === "alert" ? "-" : "+"}
                      {formatCurrency(amount)}/mês
                    </span>
                  </div>
                )}
                {difficulty && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#4B4F6A] uppercase tracking-wide leading-none mb-0.5">
                      Dificuldade
                    </span>
                    <span className="text-xs text-[#8B8FA8]">
                      {getDifficultyLabel(difficulty)}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Expand/collapse toggle (only if there's detail or long description) */}
                {detail && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setExpanded(!expanded)}
                    aria-label={expanded ? "Recolher" : "Expandir"}
                    title={expanded ? "Recolher" : "Ver detalhes"}
                  >
                    {expanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}

                {/* Complete */}
                {completable && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleComplete}
                    aria-label="Marcar como resolvido"
                    title="Resolver"
                    className="hover:text-[#00D084] hover:bg-[rgba(0,208,132,0.08)]"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}

                {/* Dismiss */}
                {dismissible && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleDismiss}
                    aria-label="Ignorar"
                    title="Ignorar"
                    className="hover:text-[#FF4D4F] hover:bg-[rgba(255,77,79,0.08)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}

                {/* Primary action */}
                {actionLabel && onAction && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAction}
                    className="gap-1 text-xs h-7"
                  >
                    {actionLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Insight Card List ─────────────────────────────────────────────────────── */
interface InsightCardListProps {
  items: InsightCardProps[]
  emptyMessage?: string
  className?: string
  maxItems?: number
  showMore?: boolean
}

function InsightCardList({
  items,
  emptyMessage = "Nenhum insight encontrado.",
  className,
  maxItems,
  showMore = true,
}: InsightCardListProps) {
  const [showAll, setShowAll] = React.useState(false)

  const displayed =
    maxItems && !showAll ? items.slice(0, maxItems) : items

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Bell className="h-8 w-8 text-[#4B4F6A] mb-3" aria-hidden="true" />
        <p className="text-sm text-[#8B8FA8]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {displayed.map((item) => (
        <InsightCard key={item.id} {...item} />
      ))}
      {showMore && maxItems && items.length > maxItems && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={cn(
            "w-full py-2.5 text-xs font-medium text-[#8B8FA8]",
            "hover:text-[#F4F4F5] transition-colors duration-150",
            "border border-dashed border-[#2A2D3A] rounded-lg",
            "hover:border-[#3D4158]",
          )}
        >
          {showAll
            ? "Ver menos"
            : `Ver mais ${items.length - maxItems} ${items.length - maxItems === 1 ? "item" : "itens"}`}
        </button>
      )}
    </div>
  )
}

export { InsightCard, InsightCardList }
export type { InsightCardProps }
