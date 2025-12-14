"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function SectionHeader({ title, subtitle, className, light }: { title: string; subtitle?: string; className?: string; light?: boolean }) {
  return (
    <div className={cn("w-full text-center", className)}>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
        <span className={cn(
          "bg-clip-text text-transparent bg-gradient-to-r",
          light ? "from-white to-white/80" : "from-neutral-900 to-neutral-700/80 dark:from-white dark:to-white/80",
        )}>
          {title}
        </span>
      </h1>
      {subtitle ? (
        <p className={cn("mt-3 text-sm sm:text-base md:text-lg", light ? "text-white/80" : "text-neutral-600 dark:text-neutral-400") }>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
