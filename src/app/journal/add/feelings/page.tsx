"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

type Ritual = { id: number; name: string; type: string; duration?: number }

export default function AddFeelingsPage() {
  const router = useRouter()
  
  const [title, setTitle] = React.useState("")
  const [text, setText] = React.useState("")
  const [energy, setEnergy] = React.useState<number>(5)
  const [rituals, setRituals] = React.useState<Ritual[]>([])
  const [ritualId, setRitualId] = React.useState<string>("")
  const [editId, setEditId] = React.useState<number | null>(null)
  const [createdAt, setCreatedAt] = React.useState<string | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("rituals")
      setRituals(raw ? JSON.parse(raw) : [])
    } catch { setRituals([]) }
    const editParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("edit") : null
    if (editParam) {
      const id = parseInt(editParam, 10)
      try {
        const jraw = localStorage.getItem("journal")
        const list = jraw ? JSON.parse(jraw) : []
        const found = list.find((e: any) => e.id === id && e.tab === "feelings")
        if (found) {
          setEditId(id)
          setTitle(found.title || "")
          setText(found.text || "")
          setEnergy(typeof found.energy === "number" ? found.energy : 5)
          setRitualId(found.ritualId ? String(found.ritualId) : "")
          setCreatedAt(found.createdAt || null)
        }
      } catch {}
    }
  }, [])

  const save = React.useCallback(() => {
    const entry = {
      id: editId ?? Date.now(),
      tab: "feelings" as const,
      title: title.trim() || "Ощущения запись",
      text: text.trim(),
      createdAt: createdAt ?? new Date().toISOString(),
      energy,
      ritualId: ritualId ? parseInt(ritualId, 10) : null,
      emoji: "🌿✨",
    }
    try {
      const prev = JSON.parse(localStorage.getItem("journal") || "[]")
      const next = editId ? prev.map((e: any) => (e.id === editId ? entry : e)) : [entry, ...prev]
      localStorage.setItem("journal", JSON.stringify(next))
    } catch {}
    router.replace("/journal")
  }, [title, text, energy, ritualId, editId, createdAt, router])

  const goBack = React.useCallback(() => {
    router.replace("/journal")
  }, [router])

  return (
    <React.Suspense fallback={<div className="min-h-screen w-full px-4 py-6">Загрузка…</div>}>
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title="Добавить запись — Ощущения" subtitle="Тёплый дневник чувств 🌿✨" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/60 backdrop-blur p-5">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок записи</label>
              <input
                type="text"
                placeholder="Например: Утренние ощущения"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание ощущений</label>
              <textarea
                rows={5}
                placeholder="Опиши ощущения и состояние"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={text}
                onChange={(e)=>setText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Уровень энергии (1–10)</label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(v => (
                  <button
                    key={v}
                    onClick={()=>setEnergy(v)}
                    className={`h-10 sm:h-12 rounded-xl border border-black/10 dark:border-white/20 flex items-center justify-center text-base ${energy===v?"bg-gradient-to-r from-amber-500 to-pink-500 text-white":"bg-white"}`}
                    aria-label={`Энергия ${v}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Связь с ритуалом</label>
              <select
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={ritualId}
                onChange={(e)=>setRitualId(e.target.value)}
              >
                <option value="">Без связи</option>
                {rituals.map(r => (
                  <option key={r.id} value={String(r.id)}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
              <Button className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={save} aria-label="Сохранить">
                💾 Сохранить
              </Button>
              <Button variant="outline" className="rounded-2xl px-6 py-3 text-base font-semibold" onClick={goBack} aria-label="Назад">
                ⬅️ Назад
              </Button>
            </div>
            <div className="text-xs opacity-70">Дата и время будут добавлены автоматически</div>
          </div>
        </div>
      </div>
    </div>
    </React.Suspense>
  )
}
