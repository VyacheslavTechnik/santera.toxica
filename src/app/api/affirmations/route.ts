import { NextRequest, NextResponse } from "next/server"

type Affirmation = { id: number; text: string; active: boolean; createdAt: string }

let store: Affirmation[] = [
  { id: 1, text: "Сегодня твоя энергия особенно сильна ✨", active: true, createdAt: new Date().toISOString() },
  { id: 2, text: "Ты в потоке изменений и роста 🌊", active: true, createdAt: new Date().toISOString() },
  { id: 3, text: "Твоя ясность ведёт тебя вперёд 🌟", active: true, createdAt: new Date().toISOString() },
  { id: 4, text: "Дыши глубоко — сила внутри тебя 🌿", active: false, createdAt: new Date().toISOString() },
]

export async function GET() {
  return NextResponse.json({ affirmations: store })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { affirmations?: unknown }
  const arr = body?.affirmations
  if (!Array.isArray(arr)) return NextResponse.json({ error: "affirmations array required" }, { status: 400 })
  const next: Affirmation[] = arr.map((x: any, i: number) => ({
    id: typeof x?.id === "number" ? x.id : Date.now() + i,
    text: typeof x?.text === "string" ? x.text : "",
    active: typeof x?.active === "boolean" ? x.active : true,
    createdAt: typeof x?.createdAt === "string" ? x.createdAt : new Date().toISOString(),
  }))
  store = next
  return NextResponse.json({ ok: true })
}

