"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Tab = "feelings" | "thoughts" | "dreams"
type Entry = { id: number; tab: Tab; title: string; text: string; createdAt: string }

const tabMeta: Record<Tab, { label: string; emoji: string }> = {
  feelings: { label: "Ощущения", emoji: "🌸" },
  thoughts: { label: "Мысли", emoji: "💭" },
  dreams: { label: "Сны", emoji: "🌙" },
}

export default function JournalPage() {
  const router = useRouter()
  const [active, setActive] = React.useState<Tab>("feelings")
  const [entries, setEntries] = React.useState<Entry[]>([])
  const [showForm, setShowForm] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [text, setText] = React.useState("")

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("journal")
      setEntries(raw ? JSON.parse(raw) : [])
    } catch { setEntries([]) }
  }, [])

  const list = React.useMemo(() => {
    return entries.filter(e => e.tab === active).sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [entries, active])

  const add = React.useCallback(() => {
    const payload: Entry = {
      id: Date.now(),
      tab: active,
      title: title.trim() || `${tabMeta[active].label} запись`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }
    try {
      const next = [payload, ...entries]
      localStorage.setItem("journal", JSON.stringify(next))
      setEntries(next)
    } catch {}
    setTitle("")
    setText("")
    setShowForm(false)
  }, [active, title, text, entries])

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeader title="Дневник ощущений, мыслей и снов" className="mb-4 sm:mb-6" />

        <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2">
          {(Object.keys(tabMeta) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`rounded-xl px-3 py-2 text-sm sm:text-base border ${active===t?"border-amber-400 bg-gradient-to-r from-amber-100 to-pink-100 text-black":"border-black/10 bg-white/80 text-black"}`}
              aria-label={tabMeta[t].label}
            >
              {tabMeta[t].emoji} {tabMeta[t].label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <Button
            className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            onClick={() => {
              if (active === "feelings") router.push("/journal/add/feelings")
              else if (active === "thoughts") router.push("/journal/add/thoughts")
              else if (active === "dreams") router.push("/journal/add/dreams")
              else setShowForm((v) => !v)
            }}
            aria-label="Добавить запись"
          >
            ➕ Добавить запись
          </Button>
        </div>

        {showForm ? (
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/60 backdrop-blur p-4 sm:p-5 mb-6">
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Заголовок"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
              <textarea
                rows={4}
                placeholder="Краткий текст"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={text}
                onChange={(e)=>setText(e.target.value)}
              />
              <div className="flex gap-3">
                <Button className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-amber-500 to-pink-500 text-white" onClick={add} aria-label="Сохранить запись">💾 Сохранить</Button>
                <Button variant="outline" className="rounded-2xl px-6 py-3 text-base font-semibold" onClick={()=>setShowForm(false)} aria-label="Отмена">Отмена</Button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {list.length === 0 ? (
            <div className="opacity-70">Записей пока нет</div>
          ) : (
            list.map((e) => (
              <button key={e.id} onClick={()=>router.push(`/journal/view/${e.id}`)} className="text-left rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/60 backdrop-blur p-4 shadow-sm">
                <div className="font-semibold text-base sm:text-lg mb-1">{e.title}</div>
                <div className="text-xs sm:text-sm opacity-70 mb-2">{new Date(e.createdAt).toLocaleString('ru-RU')}</div>
                <div className="text-sm sm:text-base">{e.text}</div>
              </button>
            ))
          )}
        </div>

        <div className="mt-6">
          <BackButton />
        </div>
      </div>
    </div>
  )
}
