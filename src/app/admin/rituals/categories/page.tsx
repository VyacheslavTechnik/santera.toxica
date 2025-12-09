"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

type Ritual = { id: number; name: string; type: string }
type Category = { id: number; name: string; createdAt: string }

const defaultCats = ["медитация","дыхание","аффирмация","очищение","энергетика"]

export default function AdminRitualCategoriesPage() {
  const [role, setRole] = React.useState<string>("user")
  const [rituals, setRituals] = React.useState<Ritual[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [newName, setNewName] = React.useState("")
  const [editId, setEditId] = React.useState<number | null>(null)
  const [editName, setEditName] = React.useState("")

  React.useEffect(() => {
    try {
      const cur = localStorage.getItem("currentUser")
      const u = cur ? JSON.parse(cur) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    try {
      const rraw = localStorage.getItem("rituals")
      setRituals(rraw ? JSON.parse(rraw) : [])
    } catch { setRituals([]) }
    try {
      const craw = localStorage.getItem("categories")
      const list: Category[] = craw ? JSON.parse(craw) : []
      if (list.length) { setCategories(list) }
      else {
        const seeded = defaultCats.map((n, i) => ({ id: Date.now()+i, name: n, createdAt: new Date().toISOString() }))
        setCategories(seeded)
        try { localStorage.setItem("categories", JSON.stringify(seeded)) } catch {}
      }
    } catch {
      const seeded = defaultCats.map((n, i) => ({ id: Date.now()+i, name: n, createdAt: new Date().toISOString() }))
      setCategories(seeded)
      try { localStorage.setItem("categories", JSON.stringify(seeded)) } catch {}
    }
  }, [])

  const ritualsCount = React.useCallback((name: string) => rituals.filter(r => r.type === name).length, [rituals])

  const addCategory = React.useCallback(() => {
    const n = newName.trim()
    if (!n) return
    if (categories.some(c => c.name === n)) { setNewName(""); return }
    const next = [...categories, { id: Date.now(), name: n, createdAt: new Date().toISOString() }]
    try { localStorage.setItem("categories", JSON.stringify(next)) } catch {}
    setCategories(next)
    setNewName("")
  }, [newName, categories])

  const startEdit = React.useCallback((id: number, name: string) => { setEditId(id); setEditName(name) }, [])

  const saveEdit = React.useCallback(() => {
    if (editId == null) return
    const n = editName.trim()
    if (!n) return
    const next = categories.map(c => (c.id === editId ? { ...c, name: n } : c))
    try { localStorage.setItem("categories", JSON.stringify(next)) } catch {}
    setCategories(next)
    setEditId(null)
    setEditName("")
  }, [editId, editName, categories])

  const del = React.useCallback((id: number) => {
    const next = categories.filter(c => c.id !== id)
    try { localStorage.setItem("categories", JSON.stringify(next)) } catch {}
    setCategories(next)
  }, [categories])

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
        <div className="mb-4 sm:mb-6"><BackButton /></div>
        <SectionHeader title="Категории ритуалов" subtitle="Список и управление" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Название категории</label>
              <input
                type="text"
                placeholder="Например: дыхание"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={newName}
                onChange={(e)=>setNewName(e.target.value)}
              />
            </div>
            <div>
              <Button className="rounded-xl px-4 py-2" onClick={addCategory} aria-label="Добавить категорию">Добавить категорию</Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Категория</th>
                <th className="px-4 py-3">Количество ритуалов</th>
                <th className="px-4 py-3">Дата добавления</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3">
                    {editId === c.id ? (
                      <input
                        type="text"
                        className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                        value={editName}
                        onChange={(e)=>setEditName(e.target.value)}
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="px-4 py-3">{ritualsCount(c.name)}</td>
                  <td className="px-4 py-3">{c.createdAt ? new Date(c.createdAt).toLocaleString('ru-RU') : "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {editId === c.id ? (
                      <Button className="rounded-xl px-3 py-2" onClick={saveEdit} aria-label="Сохранить">💾 Сохранить</Button>
                    ) : (
                      <Button className="rounded-xl px-3 py-2" onClick={()=>startEdit(c.id, c.name)} aria-label="Редактировать">✏️ Редактировать</Button>
                    )}
                    <Button variant="destructive" className="rounded-xl px-3 py-2" onClick={()=>del(c.id)} aria-label="Удалить">🗑 Удалить</Button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 ? (
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
