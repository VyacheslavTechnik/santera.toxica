import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/auth"

function isAdmin(role: string) {
  return role === "ADMIN" || role === "OWNER"
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const initData: string | undefined = body.initData || req.headers.get("x-telegram-init-data") || undefined
  const { userId, role } = body
  if (!initData) return NextResponse.json({ error: "initData required" }, { status: 400 })
  if (!userId || !role) return NextResponse.json({ error: "userId and role required" }, { status: 400 })
  const botToken = process.env.TELEGRAM_BOT_TOKEN || ""
  const userObj = verifyTelegramInitData(initData, botToken)
  if (!userObj) return NextResponse.json({ error: "Invalid initData" }, { status: 401 })

  const adminTelegramId = String(userObj.id)
  const admin = await prisma.user.findUnique({ where: { telegramId: adminTelegramId } })
  if (!admin || !isAdmin(admin.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updated = await prisma.user.update({ where: { id: userId }, data: { role } })
  await prisma.adminLog.create({ data: { adminId: admin.id, action: `set-role:${userId}:${role}` } })
  return NextResponse.json({ user: updated })
}

