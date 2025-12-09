import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const initData: string | null = req.headers.get("x-telegram-init-data") || null
  if (!initData) return NextResponse.json({ error: "initData required" }, { status: 400 })
  const botToken = process.env.TELEGRAM_BOT_TOKEN || ""
  const userObj = verifyTelegramInitData(initData, botToken)
  if (!userObj) return NextResponse.json({ error: "Invalid initData" }, { status: 401 })

  const telegramId = String(userObj.id)
  let user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId,
        username: userObj.username || null,
        fullName: [userObj.first_name, userObj.last_name].filter(Boolean).join(" ") || null,
      },
    })
  }

  return NextResponse.json({ user })
}

