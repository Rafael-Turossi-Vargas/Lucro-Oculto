import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ─── Card Variants ─────────────────────────────────────────────────────────── */
const cardVariants = cva(
  [
    "rounded-xl border",
    "transition-all duration-250 ease-in-out",
  ],
  {
    variants: {
      variant: {
        /** Default: standard surface card */
        default: [
          "bg-[#1A1D27] border-[#2A2D3A]",
          "hover:border-[#3D4158]",
          "shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
          "hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
        ],
        /** Highlight: green accent border */
        highlight: [
          "bg-[#1A1D27] border-[#00D084]",
          "shadow-[0_0_0_1px_rgba(0,208,132,0.1),0_4px_16px_rgba(0,0,0,0.5)]",
        ],
        /** Danger: red accent border */
        danger: [
          "bg-[#1A1D27] border-[#FF4D4F]",
          "shadow-[0_0_0_1px_rgba(255,77,79,0.1),0_4px_16px_rgba(0,0,0,0.5)]",
        ],
        /** Warning: amber accent border */
        warning: [
          "bg-[#1A1D27] border-[#F59E0B]",
          "shadow-[0_0_0_1px_rgba(245,158,11,0.1),0_4px_16px_rgba(0,0,0,0.5)]",
        ],
        /** Ghost: transparent, no border */
        ghost: [
          "bg-transparent border-transparent",
        ],
        /** Surface-2: slightly lighter background */
        elevated: [
          "bg-[#212435] border-[#2A2D3A]",
          "hover:border-[#3D4158]",
          "shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
        ],
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5 active:translate-y-0",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
)

/* ─── Card ──────────────────────────────────────────────────────────────────── */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

/* ─── Card Header ───────────────────────────────────────────────────────────── */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-5 pb-0", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/* ─── Card Title ────────────────────────────────────────────────────────────── */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-semibold leading-tight tracking-tight text-[#F4F4F5]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/* ─── Card Description ──────────────────────────────────────────────────────── */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#8B8FA8] leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/* ─── Card Content ──────────────────────────────────────────────────────────── */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props} />
))
CardContent.displayName = "CardContent"

/* ─── Card Footer ───────────────────────────────────────────────────────────── */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-5 pt-0 gap-3",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

/* ─── Card Divider ──────────────────────────────────────────────────────────── */
const CardDivider = React.forwardRef<
  HTMLHRElement,
  React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("border-0 border-t border-[#2A2D3A] mx-5", className)}
    {...props}
  />
))
CardDivider.displayName = "CardDivider"

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardDivider,
}
