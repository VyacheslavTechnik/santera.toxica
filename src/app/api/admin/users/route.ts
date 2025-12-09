import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/auth"

function isAdmin(role: string) {
  return role === "ADMIN" || role === "OWNER"
}

export async function GET(req: NextRequest) {
  const initData: string | null = req.headers.get("x-telegram-init-data") || null
  if (!initData) return NextResponse.json({ error: "initData required" }, { status: 400 })
  const botToken = process.env.TELEGRAM_BOT_TOKEN || ""
  const u = verifyTelegramInitData(initData, botToken)
  if (!u) return NextResponse.json({ error: "Invalid initData" }, { status: 401 })
  const me = await prisma.user.findUnique({ where: { telegramId: String(u.id) } })
  if (!me || !isAdmin(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ users })
}

