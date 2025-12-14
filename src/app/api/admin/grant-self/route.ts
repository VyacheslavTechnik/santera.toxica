import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTelegramInitData } from "@/lib/auth"

function ok(data: any, status = 200) { return NextResponse.json(data, { status }) }
function err(message: string, status = 400) { return NextResponse.json({ error: message }, { status }) }

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any))
  const initData: string | undefined = body.initData || req.headers.get("x-telegram-init-data") || undefined
  const secretFromBody: string | undefined = body.secret || undefined
  const url = new URL(req.url)
  const qs = Object.fromEntries(url.searchParams.entries()) as Record<string, string>

  const serverSecret = (process.env.ADMIN_GRANT_SECRET || "").trim()
  const publicSecret = (process.env.NEXT_PUBLIC_ADMIN_GRANT_SECRET || "").trim()
  const secretProvided = (secretFromBody || qs.secret || "").trim()
  const envId = (process.env.NEXT_PUBLIC_ADMIN_USER_ID || "").trim()
  const envUsername = (process.env.NEXT_PUBLIC_ADMIN_USERNAME || "").replace(/^@/, "").toLowerCase()
  const qId = (qs.id || body.id || "").trim()
  const qUsername = (qs.username || body.username || "").replace(/^@/, "").toLowerCase()

  const secretsConfigured = !!serverSecret || !!publicSecret
  const secretValid = !!secretProvided && (secretsConfigured ? (secretProvided === serverSecret || secretProvided === publicSecret) : true)
  let tgUser: { id: number; username?: string } | null = null
  if (initData) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || ""
    const u = verifyTelegramInitData(initData, botToken)
    if (!u) return err("Invalid initData", 401)
    tgUser = { id: u.id, username: u.username || undefined }
  }

  const matchesEnvByQuery = !!envId && !!qId && String(qId) === String(envId)
    || (!!envUsername && !!qUsername && qUsername === envUsername)
  const matchesEnvByInit = tgUser && ((!!envId && String(tgUser.id) === String(envId)) || (!!envUsername && String(tgUser.username || "").toLowerCase() === envUsername))

  if (!secretValid) return err("Invalid secret", 401)
  if (!(matchesEnvByQuery || matchesEnvByInit)) return err("Forbidden", 403)

  const telegramId = tgUser ? String(tgUser.id) : String(qId || envId)
  const username = tgUser?.username || (qUsername || envUsername) || null

  const user = await prisma.user.upsert({
    where: { telegramId },
    update: { username, role: "ADMIN" },
    create: { telegramId, username, role: "ADMIN" },
  })

  return ok({ user })
}
