"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { SectionHeader } from "@/components/ui/section-header"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default function AddRitualPage() {
  const router = useRouter()
  
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState("медитация")
  const [categories, setCategories] = React.useState<string[]>(["медитация","дыхание","аффирмация","очищение","энергетика"])
  const [duration, setDuration] = React.useState<string>("")
  const [description, setDescription] = React.useState("")
  const [energyType, setEnergyType] = React.useState<string>("баланс")
  const [difficulty, setDifficulty] = React.useState<string>("3")
  const [editId, setEditId] = React.useState<number | null>(null)
  const [createdAt, setCreatedAt] = React.useState<string | null>(null)

  React.useEffect(() => {
    try {
      const craw = localStorage.getItem("categories")
      const list = craw ? JSON.parse(craw) : []
      if (Array.isArray(list) && list.length) {
        const names = list.map((c: any) => c?.name).filter((v: any) => typeof v === "string" && v.trim())
        if (names.length) setCategories(names)
      }
    } catch {}
    const editParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("edit") : null
    if (editParam) {
      const id = parseInt(editParam, 10)
      try {
        const raw = localStorage.getItem("rituals")
      const list = raw ? JSON.parse(raw) : []
      const found = list.find((r: any) => r.id === id)
      if (found) {
        setEditId(id)
        setName(found.name || "")
        setType(found.type || "медитация")
        setDuration(found.duration != null ? String(found.duration) : "")
        setDescription(found.description || "")
        setEnergyType(found.energyType || "баланс")
        setDifficulty(found.difficulty != null ? String(found.difficulty) : "3")
        setCreatedAt(found.createdAt || null)
      }
      } catch {}
    }
  }, [])

  const save = React.useCallback(() => {
    const dur = parseInt(duration || "0", 10)
    const payload = {
      id: editId ?? Date.now(),
      name: name.trim(),
      type,
      duration: dur,
      description: description.trim(),
      energyType,
      difficulty: parseInt(difficulty || "3", 10),
      createdAt: createdAt ?? new Date().toISOString(),
    }
    try {
      if (typeof window !== "undefined") {
        const prev = JSON.parse(localStorage.getItem("rituals") || "[]")
        const next = editId ? prev.map((r: any) => (r.id === editId ? payload : r)) : [...prev, payload]
        localStorage.setItem("rituals", JSON.stringify(next))
      }
    } catch {}
    router.replace(editId ? "/admin/rituals" : "/")
  }, [duration, name, type, description, energyType, difficulty, editId, createdAt, router])

  const goHome = React.useCallback(() => {
    router.replace(editId ? "/admin/rituals" : "/")
  }, [router, editId])

  return (
    <React.Suspense fallback={<div className="min-h-screen w-full px-4 py-6">Загрузка…</div>}>
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeader title="Добавление ритуала" subtitle="Заполни детали и сохрани" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Название ритуала</label>
              <input
                type="text"
                placeholder="Например: Утренняя медитация"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Категория</label>
              <select
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {categories.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Тип энергии</label>
              <select
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={energyType}
                onChange={(e)=>setEnergyType(e.target.value)}
              >
                {["очистка","наполнение","баланс","заземление"].map((opt)=>(
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Длительность (минуты)</label>
              <input
                type="number"
                min={1}
                placeholder="Например: 20"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Уровень сложности (1–5)</label>
              <select
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={difficulty}
                onChange={(e)=>setDifficulty(e.target.value)}
              >
                {["1","2","3","4","5"].map((opt)=>(
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Краткое описание</label>
              <textarea
                rows={4}
                placeholder="Добавь детали практики"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
              <Button className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={save} aria-label="Сохранить">
                💾 Сохранить
              </Button>
              <Button variant="outline" className="rounded-2xl px-6 py-3 text-base font-semibold" onClick={goHome} aria-label="Назад">
                ⬅️ Назад
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </React.Suspense>
  )
}
