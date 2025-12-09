import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const initData: string | undefined = body.initData || req.headers.get("x-telegram-init-data") || undefined
  if (!initData) return NextResponse.json({ error: "initData required" }, { status: 400 })
  const botToken = process.env.TELEGRAM_BOT_TOKEN || ""
  const userObj = verifyTelegramInitData(initData, botToken)
  if (!userObj) return NextResponse.json({ error: "Invalid initData" }, { status: 401 })

  const telegramId = String(userObj.id)
  const username = userObj.username || null
  const fullName = [userObj.first_name, userObj.last_name].filter(Boolean).join(" ") || null

  const user = await prisma.user.upsert({
    where: { telegramId },
    update: { username, fullName },
    create: { telegramId, username, fullName },
  })

  return NextResponse.json({ user })
}

