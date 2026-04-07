import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 overflow-hidden shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary backdrop-blur-md shadow-[0_0_10px_0_var(--color-primary)]/10 [a&]:hover:bg-primary/20",
        secondary:
          "border-secondary/30 bg-secondary/10 text-secondary-foreground backdrop-blur-md [a&]:hover:bg-secondary/20",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive backdrop-blur-md shadow-[0_0_10px_0_var(--color-destructive)]/10 [a&]:hover:bg-destructive/20",
        outline:
          "border-border/50 text-foreground bg-background/20 backdrop-blur-md [a&]:hover:bg-accent/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
