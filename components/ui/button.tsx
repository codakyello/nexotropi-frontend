import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98] outline-1 outline-transparent",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground hover:bg-primary hover:shadow-[0_4px_14px_0_var(--color-primary)]/40 hover:-translate-y-[1px] backdrop-blur-md border border-primary/20",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive hover:shadow-[0_4px_14px_0_var(--color-destructive)]/40 backdrop-blur-md focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 border border-destructive/30 hover:-translate-y-[1px]",
        outline:
          "border border-border/50 bg-background/30 backdrop-blur-xl shadow-xs hover:bg-accent/50 hover:text-accent-foreground dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 hover:-translate-y-[1px]",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary backdrop-blur-md border border-secondary/20 hover:-translate-y-[1px]",
        ghost:
          "hover:bg-accent/40 hover:text-accent-foreground dark:hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base tracking-wide",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
