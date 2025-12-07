"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { HoverButton } from "@/components/ui/hover-button"
import { type LucideIcon } from "lucide-react"

export function TopicButton({ href, title, description, Icon, className }: { href: string; title: string; description?: string; Icon?: LucideIcon; className?: string }) {
  const router = useRouter()
  return (
    <HoverButton
      onClick={() => router.push(href)}
      aria-label={title}
      className={cn(
        "w-full",
        "py-4 sm:py-5",
        "rounded-2xl",
        className,
      )}
    >
      <div className="w-full flex flex-col items-center text-center gap-1">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {Icon ? <Icon className="h-5 w-5 sm:h-6 sm:w-6" /> : null}
          <span className="text-base sm:text-lg font-medium">{title}</span>
        </div>
        {description ? (
          <span className="text-xs sm:text-sm opacity-80">
            {description}
          </span>
        ) : null}
      </div>
    </HoverButton>
  )
}
