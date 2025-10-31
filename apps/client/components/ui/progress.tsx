"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-1 w-full overflow-hidden", className)}
    style={{
      borderRadius: 'var(--radius-full)',
      backgroundColor: 'var(--border-subtle)'
    }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundColor: 'var(--color-primary-500)',
        borderRadius: 'var(--radius-full)',
        transition: 'transform 0.25s var(--transition-base)'
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
