"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

export default function AddDreamsPage() {
  const router = useRouter()
  
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [emotion, setEmotion] = React.useState<string>("спокойствие")
  const [symbols, setSymbols] = React.useState("")
  const [interpretation, setInterpretation] = React.useState("")
  const [editId, setEditId] = React.useState<number | null>(null)
  const [createdAt, setCreatedAt] = React.useState<string | null>(null)

  React.useEffect(() => {
    const editParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("edit") : null
    if (editParam) {
      const id = parseInt(editParam, 10)
      try {
        const jraw = localStorage.getItem("journal")
        const list = jraw ? JSON.parse(jraw) : []
        const found = list.find((e: any) => e.id === id && e.tab === "dreams")
        if (found) {
          setEditId(id)
          setTitle(found.title || "")
          setDescription(found.text || "")
          setEmotion(found.emotion || "спокойствие")
          setSymbols(found.symbols || "")
          setInterpretation(found.interpretation || "")
          setCreatedAt(found.createdAt || null)
        }
      } catch {}
    }
  }, [])

  const save = React.useCallback(() => {
    const entry = {
      id: editId ?? Date.now(),
      tab: "dreams" as const,
      title: title.trim() || "Сон запись",
      text: description.trim(),
      createdAt: createdAt ?? new Date().toISOString(),
      emotion,
      symbols: symbols.trim(),
      interpretation: interpretation.trim(),
      emoji: "🌙✨",
    }
    try {
      const prev = JSON.parse(localStorage.getItem("journal") || "[]")
      const next = editId ? prev.map((e: any) => (e.id === editId ? entry : e)) : [entry, ...prev]
      localStorage.setItem("journal", JSON.stringify(next))
    } catch {}
    router.replace("/journal")
  }, [title, description, emotion, symbols, interpretation, editId, createdAt, router])

  const goBack = React.useCallback(() => {
    router.replace("/journal")
  }, [router])

  return (
    <React.Suspense fallback={<div className="min-h-screen w-full px-4 py-6 text-white">Загрузка…</div>}>
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-[#0b1b3a]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <BackButton />
        </div>
        <SectionHeader title="Добавить запись — Сны" subtitle="Лунный дневник снов 🌙✨" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur p-5 text-white">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок сна</label>
              <input
                type="text"
                placeholder="Например: Сон про луну"
                className="w-full rounded-xl border border-white/20 px-3 py-2 bg-white/10 text-white placeholder-white/70"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание сна</label>
              <textarea
                rows={5}
                placeholder="Опиши сюжет и детали"
                className="w-full rounded-xl border border-white/20 px-3 py-2 bg-white/10 text-white placeholder-white/70"
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Эмоции от сна</label>
              <select
                className="w-full rounded-xl border border-white/20 px-3 py-2 bg-white/10 text-white"
                value={emotion}
                onChange={(e)=>setEmotion(e.target.value)}
              >
                {["спокойствие","страх","радость","тревога","пустота","вдохновение"].map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0b1b3a] text-white">{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Символы / яркие детали</label>
              <textarea
                rows={3}
                placeholder="Например: луна, море, звёзды"
                className="w-full rounded-xl border border-white/20 px-3 py-2 bg-white/10 text-white placeholder-white/70"
                value={symbols}
                onChange={(e)=>setSymbols(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Собственная трактовка</label>
              <textarea
                rows={4}
                placeholder="Твоя интерпретация и смысл"
                className="w-full rounded-xl border border-white/20 px-3 py-2 bg-white/10 text-white placeholder-white/70"
                value={interpretation}
                onChange={(e)=>setInterpretation(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
              <Button className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-indigo-500 to-blue-600 text-white" onClick={save} aria-label="Сохранить">
                💾 Сохранить
              </Button>
              <Button variant="outline" className="rounded-2xl px-6 py-3 text-base font-semibold" onClick={goBack} aria-label="Назад">
                ⬅️ Назад
              </Button>
            </div>
            <div className="text-xs opacity-70">Дата сна добавляется автоматически</div>
          </div>
        </div>
      </div>
    </div>
    </React.Suspense>
  )
}
