"use client"

import * as React from "react"
import { cn, getScoreHexColor, getScoreLabel } from "@/lib/utils"

interface ScoreMeterProps {
  score: number
  size?: "sm" | "default" | "lg" | "xl"
  showLabel?: boolean
  animated?: boolean
  className?: string
  label?: string
}

const SIZE_CONFIG = {
  sm: {
    svgSize: 100,
    radius: 38,
    strokeWidth: 6,
    fontSize: "text-2xl",
    labelSize: "text-[10px]",
    containerSize: "h-[100px] w-[100px]",
  },
  default: {
    svgSize: 140,
    radius: 54,
    strokeWidth: 8,
    fontSize: "text-3xl",
    labelSize: "text-xs",
    containerSize: "h-[140px] w-[140px]",
  },
  lg: {
    svgSize: 180,
    radius: 70,
    strokeWidth: 10,
    fontSize: "text-4xl",
    labelSize: "text-sm",
    containerSize: "h-[180px] w-[180px]",
  },
  xl: {
    svgSize: 220,
    radius: 86,
    strokeWidth: 12,
    fontSize: "text-5xl",
    labelSize: "text-base",
    containerSize: "h-[220px] w-[220px]",
  },
} as const

function ScoreMeter({
  score,
  size = "default",
  showLabel = true,
  animated = true,
  className,
  label,
}: ScoreMeterProps) {
  const config = SIZE_CONFIG[size]
  const { svgSize, radius, strokeWidth } = config
  const clampedScore = Math.min(100, Math.max(0, score))

  const center = svgSize / 2
  const circumference = 2 * Math.PI * radius
  const arcRatio = 0.75
  const arcLength = circumference * arcRatio
  const gapLength = circumference * (1 - arcRatio)

  const [displayScore, setDisplayScore] = React.useState(
    animated ? 0 : clampedScore
  )

  const animationRef = React.useRef<number | null>(null)
  const startTimeRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!animated) {
      setDisplayScore(clampedScore)
      return
    }

    const duration = 1200
    const from = 0
    const to = clampedScore

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)

      setDisplayScore(Math.round(from + (to - from) * eased))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      startTimeRef.current = null
    }
  }, [animated, clampedScore])

  const fillRatio = displayScore / 100
  const filledLength = arcLength * fillRatio

  const color = getScoreHexColor(displayScore)
  const scoreLabel = label ?? getScoreLabel(displayScore)
  const rotation = 135
  const trackColor = "var(--bg-subtle)"

  return (
    <div
      className={cn(
        "relative flex flex-col items-center",
        config.containerSize,
        className
      )}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score financeiro: ${clampedScore} de 100 — ${scoreLabel}`}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        fill="none"
        overflow="visible"
      >
        <defs>
          <filter
            id={`score-glow-${svgSize}`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient
            id={`score-gradient-${svgSize}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          fill="none"
          transform={`rotate(${rotation} ${center} ${center})`}
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={`url(#score-gradient-${svgSize})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${circumference - filledLength}`}
          fill="none"
          transform={`rotate(${rotation} ${center} ${center})`}
          filter={`url(#score-glow-${svgSize})`}
        />

        {displayScore > 2 && (
          <circle
            cx={
              center +
              radius *
                Math.cos(((rotation + (fillRatio * 270 - 90)) * Math.PI) / 180)
            }
            cy={
              center +
              radius *
                Math.sin(((rotation + (fillRatio * 270 - 90)) * Math.PI) / 180)
            }
            r={strokeWidth * 0.7}
            fill={color}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
        <span
          className={cn(
            "font-black tabular-nums leading-none tracking-tight",
            config.fontSize
          )}
          style={{ color }}
        >
          {displayScore}
        </span>

        {showLabel && (
          <span
            className={cn("font-medium mt-0.5", config.labelSize, "text-[var(--text-muted)]")}
          >
            {scoreLabel}
          </span>
        )}
      </div>
    </div>
  )
}

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  className?: string
}

function ScoreRing({
  score,
  size = 40,
  strokeWidth = 4,
  className,
}: ScoreRingProps) {
  const clampedScore = Math.min(100, Math.max(0, score))
  const color = getScoreHexColor(clampedScore)
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clampedScore / 100) * circumference

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-subtle)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      <span
        className="absolute text-[9px] font-bold tabular-nums"
        style={{ color }}
      >
        {clampedScore}
      </span>
    </div>
  )
}

export { ScoreMeter, ScoreRing }