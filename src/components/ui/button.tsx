import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ─── Variants ──────────────────────────────────────────────────────────────── */
const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium text-sm whitespace-nowrap",
    "rounded-lg border",
    "transition-all duration-150 ease-in-out",
    "cursor-pointer select-none",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        /** Primary: solid green — main CTA */
        default: [
          "bg-[#00D084] text-[#0F1117] border-[#00D084]",
          "hover:bg-[#00A86B] hover:border-[#00A86B]",
          "focus-visible:ring-[#00D084]",
          "shadow-sm hover:shadow-[0_0_16px_rgba(0,208,132,0.35)]",
          "font-semibold",
        ],
        /** Destructive: solid red */
        destructive: [
          "bg-[#FF4D4F] text-white border-[#FF4D4F]",
          "hover:bg-[#D93638] hover:border-[#D93638]",
          "focus-visible:ring-[#FF4D4F]",
          "shadow-sm hover:shadow-[0_0_16px_rgba(255,77,79,0.35)]",
          "font-semibold",
        ],
        /** Outline: transparent with border */
        outline: [
          "bg-transparent text-[#F4F4F5] border-[#2A2D3A]",
          "hover:bg-[#1A1D27] hover:border-[#3D4158]",
          "focus-visible:ring-[#00D084]",
        ],
        /** Secondary: subtle surface */
        secondary: [
          "bg-[#1A1D27] text-[#F4F4F5] border-[#2A2D3A]",
          "hover:bg-[#212435] hover:border-[#3D4158]",
          "focus-visible:ring-[#00D084]",
        ],
        /** Ghost: no background or border */
        ghost: [
          "bg-transparent text-[#8B8FA8] border-transparent",
          "hover:bg-[#1A1D27] hover:text-[#F4F4F5]",
          "focus-visible:ring-[#00D084]",
        ],
        /** Link: styled as link */
        link: [
          "bg-transparent text-[#00D084] border-transparent",
          "hover:text-[#33D99A] hover:underline underline-offset-4",
          "focus-visible:ring-[#00D084]",
          "p-0 h-auto",
        ],
        /** Warning: amber */
        warning: [
          "bg-[#F59E0B] text-[#0F1117] border-[#F59E0B]",
          "hover:bg-[#D97706] hover:border-[#D97706]",
          "focus-visible:ring-[#F59E0B]",
          "font-semibold",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        default: "h-9 px-4 py-2",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base font-semibold",
        icon: "h-9 w-9 p-0 rounded-lg",
        "icon-sm": "h-7 w-7 p-0 rounded-md",
        "icon-lg": "h-11 w-11 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/* ─── Props ─────────────────────────────────────────────────────────────────── */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
              aria-hidden="true"
            />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
