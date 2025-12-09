"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

type Affirmation = { id: number; text: string; active: boolean; createdAt: string }

const defaults: Affirmation[] = [
  { id: 1, text: "Сегодня твоя энергия особенно сильна ✨", active: true, createdAt: new Date().toISOString() },
  { id: 2, text: "Ты в потоке изменений и роста 🌊", active: true, createdAt: new Date().toISOString() },
  { id: 3, text: "Твоя ясность ведёт тебя вперёд 🌟", active: true, createdAt: new Date().toISOString() },
  { id: 4, text: "Дыши глубоко — сила внутри тебя 🌿", active: false, createdAt: new Date().toISOString() },
]

export default function AdminAffirmationsPage() {
  const [role, setRole] = React.useState<string>("user")
  const [affirmations, setAffirmations] = React.useState<Affirmation[]>([])
  const [query, setQuery] = React.useState<string>("")
  const [newText, setNewText] = React.useState<string>("")
  const [editId, setEditId] = React.useState<number | null>(null)
  const [editText, setEditText] = React.useState<string>("")

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser")
      const u = raw ? JSON.parse(raw) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    ;(async () => {
      try {
        const res = await fetch("/api/affirmations", { cache: "no-store" })
        const data = await res.json().catch(() => ({})) as { affirmations?: Affirmation[] }
        if (Array.isArray(data.affirmations)) {
          setAffirmations(data.affirmations)
          try { localStorage.setItem("affirmations", JSON.stringify(data.affirmations)) } catch {}
          return
        }
      } catch {}
    })()
    try {
      const araw = localStorage.getItem("affirmations")
      const list: unknown = araw ? JSON.parse(araw) : []
      if (Array.isArray(list) && list.every((x) => typeof x === "object" && x !== null)) {
        const normalized = (list as Array<Record<string, unknown>>).map((x) => ({
          id: typeof x.id === "number" ? x.id : Date.now(),
          text: typeof x.text === "string" ? x.text : "",
          active: typeof x.active === "boolean" ? x.active : true,
          createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
        }))
        setAffirmations(normalized)
      } else {
        setAffirmations(defaults)
        try { localStorage.setItem("affirmations", JSON.stringify(defaults)) } catch {}
      }
    } catch {
      setAffirmations(defaults)
      try { localStorage.setItem("affirmations", JSON.stringify(defaults)) } catch {}
    }
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return affirmations
    return affirmations.filter((a) => a.text.toLowerCase().includes(q))
  }, [affirmations, query])

  const add = React.useCallback(() => {
    const t = newText.trim()
    if (!t) return
    const entry: Affirmation = { id: Date.now(), text: t, active: true, createdAt: new Date().toISOString() }
    const next = [entry, ...affirmations]
    try { localStorage.setItem("affirmations", JSON.stringify(next)) } catch {}
    try { fetch("/api/affirmations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affirmations: next }) }) } catch {}
    setAffirmations(next)
    setNewText("")
  }, [newText, affirmations])

  const startEdit = React.useCallback((id: number, text: string) => { setEditId(id); setEditText(text) }, [])

  const saveEdit = React.useCallback(() => {
    if (editId == null) return
    const t = editText.trim()
    if (!t) return
    const next = affirmations.map((a) => (a.id === editId ? { ...a, text: t } : a))
    try { localStorage.setItem("affirmations", JSON.stringify(next)) } catch {}
    try { fetch("/api/affirmations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affirmations: next }) }) } catch {}
    setAffirmations(next)
    setEditId(null)
    setEditText("")
  }, [editId, editText, affirmations])

  const del = React.useCallback((id: number) => {
    const next = affirmations.filter((a) => a.id !== id)
    try { localStorage.setItem("affirmations", JSON.stringify(next)) } catch {}
    try { fetch("/api/affirmations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affirmations: next }) }) } catch {}
    setAffirmations(next)
  }, [affirmations])

  const toggleActive = React.useCallback((id: number) => {
    const next = affirmations.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    try { localStorage.setItem("affirmations", JSON.stringify(next)) } catch {}
    try { fetch("/api/affirmations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affirmations: next }) }) } catch {}
    setAffirmations(next)
  }, [affirmations])

  const canAccess = ["admin", "moderator", "owner"].includes((role || "user").toLowerCase())
  if (!canAccess) {
    return (
      <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 sm:mb-6"><BackButton /></div>
          <SectionHeader title="Доступ запрещён" subtitle="Недостаточно прав" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <BackButton />
          <Button className="rounded-xl px-4 py-2" onClick={add} aria-label="Добавить аффирмацию">➕ Добавить аффирмацию</Button>
        </div>
        <SectionHeader title="Аффирмации дня" subtitle="Список, поиск и управление" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Текст аффирмации</label>
              <input
                type="text"
                placeholder="Например: Сегодня твоя энергия сильна"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={newText}
                onChange={(e)=>setNewText(e.target.value)}
              />
            </div>
            <div>
              <Button className="rounded-xl px-4 py-2" onClick={add} aria-label="Добавить аффирмацию">➕ Добавить аффирмацию</Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5 mb-4 sm:mb-6">
          <label className="block text-sm font-medium mb-1">Поиск по тексту</label>
          <input
            type="text"
            placeholder="Начни вводить…"
            className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Текст</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Дата добавления</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-top border-black/10 dark:border-white/10">
                  <td className="px-4 py-3">
                    {editId === a.id ? (
                      <input
                        type="text"
                        className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                        value={editText}
                        onChange={(e)=>setEditText(e.target.value)}
                      />
                    ) : (
                      a.text
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className={`rounded-full px-3 py-1 text-sm ${a.active ? "bg-emerald-500 text-white" : "bg-gray-300 text-gray-800"}`}
                      onClick={()=>toggleActive(a.id)}
                      aria-label={a.active ? "Активная" : "Не активная"}
                    >
                      {a.active ? "активная" : "не активная"}
                    </button>
                  </td>
                  <td className="px-4 py-3">{a.createdAt ? new Date(a.createdAt).toLocaleString('ru-RU') : "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {editId === a.id ? (
                      <Button className="rounded-xl px-3 py-2" onClick={saveEdit} aria-label="Сохранить">💾 Сохранить</Button>
                    ) : (
                      <Button className="rounded-xl px-3 py-2" onClick={()=>startEdit(a.id, a.text)} aria-label="Редактировать">✏️ Редактировать</Button>
                    )}
                    <Button variant="destructive" className="rounded-xl px-3 py-2" onClick={()=>del(a.id)} aria-label="Удалить">🗑 Удалить</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={4}>Нет данных</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
