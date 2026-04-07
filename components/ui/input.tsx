import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/50 selection:bg-primary selection:text-primary-foreground dark:bg-black/20 border-white/10 flex h-11 w-full min-w-0 rounded-lg border bg-background/30 backdrop-blur-md px-4 py-2 text-[15px] font-medium shadow-inner transition-all duration-300 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 font-sans",
        "focus-visible:border-primary/50 focus-visible:ring-primary/20 focus-visible:ring-[4px] focus-visible:bg-background/60 hover:bg-background/40 hover:border-white/20",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
