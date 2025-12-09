import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/auth"

function isAdmin(role: string) {
  return role === "ADMIN" || role === "OWNER"
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const initData: string | undefined = body.initData || req.headers.get("x-telegram-init-data") || undefined
  const { title, description, category, level, mediaUrl } = body
  if (!initData) return NextResponse.json({ error: "initData required" }, { status: 400 })
  if (!title || !description) return NextResponse.json({ error: "title and description required" }, { status: 400 })
  const botToken = process.env.TELEGRAM_BOT_TOKEN || ""
  const userObj = verifyTelegramInitData(initData, botToken)
  if (!userObj) return NextResponse.json({ error: "Invalid initData" }, { status: 401 })
  const telegramId = String(userObj.id)
  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user || !isAdmin(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const ritual = await prisma.ritual.create({
    data: {
      title,
      description,
      category: category || null,
      level: typeof level === "number" ? level : 1,
      mediaUrl: mediaUrl || null,
    },
  })
  return NextResponse.json({ ritual })
}

