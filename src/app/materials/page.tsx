"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"

type MaterialType = "видео" | "аудио" | "текст"
type Material = {
  id: number
  title: string
  type: MaterialType
  category: string
  url?: string
  text?: string
  createdAt: string
}
type MaterialCategory = { id: number; name: string; createdAt: string }

export default function MaterialsPage() {
  const [materials, setMaterials] = React.useState<Material[]>([])
  const [categories, setCategories] = React.useState<MaterialCategory[]>([])
  const [category, setCategory] = React.useState<string>("")
  const [query, setQuery] = React.useState<string>("")

  React.useEffect(() => {
    try {
      const mraw = localStorage.getItem("materials")
      const list: unknown = mraw ? JSON.parse(mraw) : []
      if (Array.isArray(list)) {
        const normalized: Material[] = (list as Array<Record<string, unknown>>).map((x) => ({
          id: typeof x.id === "number" ? x.id : Date.now(),
          title: typeof x.title === "string" ? x.title : "",
          type: (typeof x.type === "string" && (x.type === "видео" || x.type === "аудио" || x.type === "текст")) ? (x.type as MaterialType) : "текст",
          category: typeof x.category === "string" ? x.category : "",
          url: typeof x.url === "string" ? x.url : undefined,
          text: typeof x.text === "string" ? x.text : undefined,
          createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
        }))
        setMaterials(normalized)
      } else {
        setMaterials([])
      }
    } catch { setMaterials([]) }
    try {
      const craw = localStorage.getItem("materialCategories")
      const list: unknown = craw ? JSON.parse(craw) : []
      if (Array.isArray(list)) {
        const normalized: MaterialCategory[] = (list as Array<Record<string, unknown>>).map((x, i) => ({
          id: typeof x.id === "number" ? x.id : Date.now() + i,
          name: typeof x.name === "string" ? x.name : "",
          createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
        }))
        setCategories(normalized)
        if (!category && normalized.length) setCategory(normalized[0].name)
      } else {
        setCategories([])
      }
    } catch { setCategories([]) }
    ;(async () => {
      try {
        const res = await fetch("/api/materials", { cache: "no-store" })
        const data = await res.json().catch(() => ({})) as { materials?: Material[]; categories?: MaterialCategory[] }
        if (Array.isArray(data.materials)) {
          setMaterials(data.materials)
          try { localStorage.setItem("materials", JSON.stringify(data.materials)) } catch {}
        }
        if (Array.isArray(data.categories)) {
          setCategories(data.categories)
          try { localStorage.setItem("materialCategories", JSON.stringify(data.categories)) } catch {}
          if (!category && data.categories.length) setCategory(data.categories[0].name)
        }
      } catch {}
    })()
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/materials", { cache: "no-store" })
        const data = await res.json().catch(() => ({})) as { materials?: Material[]; categories?: MaterialCategory[] }
        if (Array.isArray(data.materials)) {
          setMaterials(data.materials)
          try { localStorage.setItem("materials", JSON.stringify(data.materials)) } catch {}
        }
        if (Array.isArray(data.categories)) {
          setCategories(data.categories)
          try { localStorage.setItem("materialCategories", JSON.stringify(data.categories)) } catch {}
          if (!category && data.categories.length) setCategory(data.categories[0].name)
        }
      } catch {}
    }, 15000)
    return () => { clearInterval(id) }
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return materials.filter((m) => {
      const byCat = category ? m.category === category : true
      const byText = q ? (m.title.toLowerCase().includes(q) || (m.text ? m.text.toLowerCase().includes(q) : false)) : true
      return byCat && byText
    })
  }, [materials, category, query])

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <BackButton />
          <div className="flex items-center gap-2">
            <select
              className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
              value={category}
              onChange={(e)=>setCategory(e.target.value)}
              aria-label="Категория"
            >
              {categories.map((c)=> (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              {categories.length===0 ? (<option value="">Все</option>) : null}
            </select>
            <input
              type="text"
              className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
              placeholder="Поиск материалов"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              aria-label="Поиск"
            />
          </div>
        </div>
        <SectionHeader title="Материалы" subtitle="Видео, аудио и тексты" className="mb-4 sm:mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4">
              Нет материалов
            </div>
          ) : filtered.map((m) => (
            <div key={m.id} className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4">
              <div className="text-base sm:text-lg font-medium">{m.title}</div>
              <div className="text-xs opacity-70 mt-1">{m.category} • {m.type}</div>
              {m.type === "текст" && m.text ? (
                <div className="mt-2 text-sm opacity-80">{m.text.length > 160 ? `${m.text.slice(0,160)}…` : m.text}</div>
              ) : null}
              {m.type !== "текст" && m.url ? (
                <div className="mt-2">
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sm underline">Открыть {m.type}</a>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
