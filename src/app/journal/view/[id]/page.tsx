"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

type Entry = any

function typeLabel(tab?: string) {
  if (tab === "feelings") return "Ощущения"
  if (tab === "thoughts") return "Мысли"
  if (tab === "dreams") return "Сны"
  return "Запись"
}

export default function ViewEntryPage() {
  const router = useRouter()
  const params = useParams() as { id?: string }
  const idStr = params?.id || ""
  const idNum = parseInt(idStr, 10)
  const [entry, setEntry] = React.useState<Entry | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("journal")
      const list: Entry[] = raw ? JSON.parse(raw) : []
      const found = list.find((e) => e.id === idNum) || null
      setEntry(found)
    } catch { setEntry(null) }
  }, [idNum])

  const remove = React.useCallback(() => {
    try {
      const raw = localStorage.getItem("journal")
      const list: Entry[] = raw ? JSON.parse(raw) : []
      const next = list.filter((e) => e.id !== idNum)
      localStorage.setItem("journal", JSON.stringify(next))
    } catch {}
    router.replace("/journal")
  }, [idNum, router])

  const edit = React.useCallback(() => {
    const base = entry?.tab === "feelings" ? "/journal/add/feelings" : entry?.tab === "thoughts" ? "/journal/add/thoughts" : "/journal/add/dreams"
    router.push(`${base}?edit=${idNum}`)
  }, [entry, idNum, router])

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title="Просмотр записи" subtitle="Детали и действия" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
          <div className="text-xl sm:text-2xl font-semibold mb-1">{entry?.title || "Запись не найдена"}</div>
          <div className="text-sm opacity-75 mb-2">{entry?.createdAt ? new Date(entry.createdAt).toLocaleString("ru-RU") : "—"}</div>
          <div className="text-sm opacity-80 mb-3">Тип: {typeLabel(entry?.tab)}</div>
          <div className="text-base sm:text-lg whitespace-pre-wrap">{entry?.text || ""}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {typeof entry?.energy === "number" ? (
            <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4">
              <div className="font-semibold mb-1">Энергия</div>
              <div className="text-base">{entry.energy}</div>
            </div>
          ) : null}
          {entry?.emotion ? (
            <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4">
              <div className="font-semibold mb-1">Эмоция</div>
              <div className="text-base">{entry.emotion}</div>
            </div>
          ) : null}
          {entry?.tag ? (
            <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4">
              <div className="font-semibold mb-1">Тег</div>
              <div className="text-base">{entry.tag}</div>
            </div>
          ) : null}
          {entry?.symbols ? (
            <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4">
              <div className="font-semibold mb-1">Символы / детали</div>
              <div className="text-base whitespace-pre-wrap">{entry.symbols}</div>
            </div>
          ) : null}
          {entry?.interpretation ? (
            <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4">
              <div className="font-semibold mb-1">Трактовка</div>
              <div className="text-base whitespace-pre-wrap">{entry.interpretation}</div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
          <Button className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-amber-500 to-pink-500 text-white" onClick={edit} aria-label="Редактировать">✏️ Редактировать</Button>
          <Button variant="destructive" className="rounded-2xl px-6 py-3 text-base font-semibold" onClick={remove} aria-label="Удалить">🗑 Удалить</Button>
        </div>
      </div>
    </div>
  )
}
