import { NextRequest, NextResponse } from "next/server"

type MaterialType = "видео" | "аудио" | "текст"
type Material = { id: number; title: string; type: MaterialType; category: string; url?: string; text?: string; createdAt: string }
type MaterialCategory = { id: number; name: string; createdAt: string }

let materials: Material[] = []
let categories: MaterialCategory[] = [
  { id: 1, name: "обучение", createdAt: new Date().toISOString() },
  { id: 2, name: "практика", createdAt: new Date().toISOString() },
  { id: 3, name: "музыка", createdAt: new Date().toISOString() },
  { id: 4, name: "медитации", createdAt: new Date().toISOString() },
]

export async function GET() {
  return NextResponse.json({ materials, categories })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { materials?: unknown; categories?: unknown }
  const mats = body.materials
  const cats = body.categories
  if (Array.isArray(mats)) {
    materials = (mats as Array<Record<string, unknown>>).map((x, i) => ({
      id: typeof x.id === "number" ? x.id : Date.now() + i,
      title: typeof x.title === "string" ? x.title : "",
      type: (typeof x.type === "string" && (x.type === "видео" || x.type === "аудио" || x.type === "текст")) ? (x.type as MaterialType) : "текст",
      category: typeof x.category === "string" ? x.category : "",
      url: typeof x.url === "string" ? x.url : undefined,
      text: typeof x.text === "string" ? x.text : undefined,
      createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
    }))
  }
  if (Array.isArray(cats)) {
    categories = (cats as Array<Record<string, unknown>>).map((x, i) => ({
      id: typeof x.id === "number" ? x.id : Date.now() + i,
      name: typeof x.name === "string" ? x.name : "",
      createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
    }))
  }
  return NextResponse.json({ ok: true })
}

