"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      <div className="flex items-center">
        <Image src="/logo.svg" alt="Logo" className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24" width={96} height={96} />
      </div>
    </div>
  )
}
