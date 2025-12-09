import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const initData: string | undefined = body.initData || req.headers.get("x-telegram-init-data") || undefined
  const { title, content, category } = body
  if (!initData) return NextResponse.json({ error: "initData required" }, { status: 400 })
  if (!title || !content) return NextResponse.json({ error: "title and content required" }, { status: 400 })
  const botToken = process.env.TELEGRAM_BOT_TOKEN || ""
  const userObj = verifyTelegramInitData(initData, botToken)
  if (!userObj) return NextResponse.json({ error: "Invalid initData" }, { status: 401 })
  const telegramId = String(userObj.id)
  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const record = await prisma.record.create({
    data: { userId: user.id, title, content, category: category || null },
  })
  return NextResponse.json({ record })
}

