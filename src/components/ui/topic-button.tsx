"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { HoverButton } from "@/components/ui/hover-button"
import { Code2, Bot, Brain, Settings, Mail, MessageSquare } from "lucide-react"

function renderIcon(name?: string) {
  const cls = "h-5 w-5 sm:h-6 sm:w-6"
  switch (name) {
    case "code":
      return <Code2 className={cls} />
    case "bot":
      return <Bot className={cls} />
    case "brain":
      return <Brain className={cls} />
    case "settings":
      return <Settings className={cls} />
    case "mail":
      return <Mail className={cls} />
    case "message":
      return <MessageSquare className={cls} />
    default:
      return null
  }
}

export function TopicButton({ href, title, description, icon, className }: { href: string; title: string; description?: string; icon?: string; className?: string }) {
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
          {renderIcon(icon)}
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
