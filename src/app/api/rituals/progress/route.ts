import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const initData: string | undefined = body.initData || req.headers.get("x-telegram-init-data") || undefined
  const { ritualId, completed } = body
  if (!initData) return NextResponse.json({ error: "initData required" }, { status: 400 })
  if (!ritualId) return NextResponse.json({ error: "ritualId required" }, { status: 400 })
  const botToken = process.env.TELEGRAM_BOT_TOKEN || ""
  const userObj = verifyTelegramInitData(initData, botToken)
  if (!userObj) return NextResponse.json({ error: "Invalid initData" }, { status: 401 })
  const telegramId = String(userObj.id)
  const user = await prisma.user.findUnique({ where: { telegramId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const rp = await prisma.ritualProgress.upsert({
    where: { userId_ritualId: { userId: user.id, ritualId } },
    update: { completed: !!completed, completedAt: completed ? new Date() : null },
    create: { userId: user.id, ritualId, completed: !!completed, completedAt: completed ? new Date() : null },
  }).catch(async () => {
    const existing = await prisma.ritualProgress.findFirst({ where: { userId: user.id, ritualId } })
    if (existing) {
      return prisma.ritualProgress.update({
        where: { id: existing.id },
        data: { completed: !!completed, completedAt: completed ? new Date() : null },
      })
    }
    return prisma.ritualProgress.create({ data: { userId: user.id, ritualId, completed: !!completed, completedAt: completed ? new Date() : null } })
  })

  return NextResponse.json({ progress: rp })
}

