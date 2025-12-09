"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

export default function AddThoughtsPage() {
  const router = useRouter()
  
  const [title, setTitle] = React.useState("")
  const [text, setText] = React.useState("")
  const [emotion, setEmotion] = React.useState<string>("спокойствие")
  const [tag, setTag] = React.useState<string>("мысль")
  const [editId, setEditId] = React.useState<number | null>(null)
  const [createdAt, setCreatedAt] = React.useState<string | null>(null)

  React.useEffect(() => {
    const editParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("edit") : null
    if (editParam) {
      const id = parseInt(editParam, 10)
      try {
        const jraw = localStorage.getItem("journal")
        const list = jraw ? JSON.parse(jraw) : []
        const found = list.find((e: any) => e.id === id && e.tab === "thoughts")
        if (found) {
          setEditId(id)
          setTitle(found.title || "")
          setText(found.text || "")
          setEmotion(found.emotion || "спокойствие")
          setTag(found.tag || "мысль")
          setCreatedAt(found.createdAt || null)
        }
      } catch {}
    }
  }, [])

  const save = React.useCallback(() => {
    const entry = {
      id: editId ?? Date.now(),
      tab: "thoughts" as const,
      title: title.trim() || "Мысли запись",
      text: text.trim(),
      createdAt: createdAt ?? new Date().toISOString(),
      emotion,
      tag,
      emoji: "💭✨",
    }
    try {
      const prev = JSON.parse(localStorage.getItem("journal") || "[]")
      const next = editId ? prev.map((e: any) => (e.id === editId ? entry : e)) : [entry, ...prev]
      localStorage.setItem("journal", JSON.stringify(next))
    } catch {}
    router.replace("/journal")
  }, [title, text, emotion, tag, editId, createdAt, router])

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
        <SectionHeader title="Добавить запись — Мысли" subtitle="Запиши инсайт и эмоцию 💭✨" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/60 backdrop-blur p-5">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок записи</label>
              <input
                type="text"
                placeholder="Например: Инсайт после практики"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Основная мысль / инсайт</label>
              <textarea
                rows={5}
                placeholder="Опиши мысль или инсайт"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={text}
                onChange={(e)=>setText(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Эмоция</label>
              <select
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={emotion}
                onChange={(e)=>setEmotion(e.target.value)}
              >
                {["спокойствие","тревога","радость","энергия","усталость","вдохновение"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Тег</label>
              <select
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={tag}
                onChange={(e)=>setTag(e.target.value)}
              >
                {["мысль","инсайт","практика","наблюдение"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
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
            <div className="text-xs opacity-70">Дата и время добавляются автоматически</div>
          </div>
        </div>
      </div>
    </div>
    </React.Suspense>
  )
}
