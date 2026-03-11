import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ─── Badge Variants ────────────────────────────────────────────────────────── */
const badgeVariants = cva(
  [
    "inline-flex items-center gap-1",
    "rounded-md px-2 py-0.5",
    "text-xs font-medium",
    "border",
    "transition-colors duration-150",
    "whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        /** Default: neutral surface */
        default: [
          "bg-[#212435] text-[#F4F4F5] border-[#2A2D3A]",
        ],
        /** Success/primary: green */
        success: [
          "bg-[rgba(0,208,132,0.12)] text-[#00D084] border-[rgba(0,208,132,0.25)]",
        ],
        /** Danger: red */
        danger: [
          "bg-[rgba(255,77,79,0.12)] text-[#FF4D4F] border-[rgba(255,77,79,0.25)]",
        ],
        /** Warning: amber */
        warning: [
          "bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border-[rgba(245,158,11,0.25)]",
        ],
        /** Info: blue */
        info: [
          "bg-[rgba(59,130,246,0.12)] text-[#3B82F6] border-[rgba(59,130,246,0.25)]",
        ],
        /** Secondary: muted */
        secondary: [
          "bg-[#1A1D27] text-[#8B8FA8] border-[#2A2D3A]",
        ],
        /** Outline only */
        outline: [
          "bg-transparent text-[#F4F4F5] border-[#2A2D3A]",
        ],
        /** Purple/violet */
        purple: [
          "bg-[rgba(139,92,246,0.12)] text-[#8B5CF6] border-[rgba(139,92,246,0.25)]",
        ],
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5 rounded",
        default: "text-xs px-2 py-0.5",
        lg: "text-sm px-3 py-1 rounded-lg",
      },
      dot: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      dot: false,
    },
  }
)

/* ─── Props ─────────────────────────────────────────────────────────────────── */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/* ─── Component ─────────────────────────────────────────────────────────────── */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    const dotColorMap: Record<string, string> = {
      success: "bg-[#00D084]",
      danger: "bg-[#FF4D4F]",
      warning: "bg-[#F59E0B]",
      info: "bg-[#3B82F6]",
      default: "bg-[#F4F4F5]",
      secondary: "bg-[#8B8FA8]",
      outline: "bg-[#F4F4F5]",
      purple: "bg-[#8B5CF6]",
    }

    const dotColor = dotColorMap[variant ?? "default"] ?? "bg-[#F4F4F5]"

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn("rounded-full flex-shrink-0", dotColor, {
              "h-1.5 w-1.5": size === "sm",
              "h-2 w-2": size === "default" || !size,
              "h-2.5 w-2.5": size === "lg",
            })}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
