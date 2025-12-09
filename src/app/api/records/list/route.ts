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
  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const records = await prisma.record.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
  return NextResponse.json({ records })
}

