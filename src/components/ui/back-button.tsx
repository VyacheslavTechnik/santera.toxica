"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function BackButton({ className, label = "Назад" }: { className?: string; label?: string }) {
  const router = useRouter()
  const onClick = React.useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.replace("/")
    }
  }, [router])

  return (
    <Button variant="outline" size="sm" className={className} onClick={onClick} aria-label={label}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}
