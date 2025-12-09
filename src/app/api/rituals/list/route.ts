import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const rituals = await prisma.ritual.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ rituals })
}

