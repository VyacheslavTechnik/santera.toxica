"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

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

const defaultCategories = ["обучение", "практика", "музыка", "медитации"]

export default function AdminMaterialsPage() {
  const [role, setRole] = React.useState<string>("user")
  const [materials, setMaterials] = React.useState<Material[]>([])
  const [categories, setCategories] = React.useState<MaterialCategory[]>([])
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<MaterialType>("текст")
  const [category, setCategory] = React.useState<string>("")
  const [url, setUrl] = React.useState<string>("")
  const [text, setText] = React.useState<string>("")
  const [editId, setEditId] = React.useState<number | null>(null)
  const [editTitle, setEditTitle] = React.useState<string>("")
  const [editCategory, setEditCategory] = React.useState<string>("")
  const [editType, setEditType] = React.useState<MaterialType>("текст")
  const [editUrl, setEditUrl] = React.useState<string>("")
  const [editText, setEditText] = React.useState<string>("")
  const [newCat, setNewCat] = React.useState<string>("")

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser")
      const u = raw ? JSON.parse(raw) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
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
    try {
      const mraw = localStorage.getItem("materials")
      const list: unknown = mraw ? JSON.parse(mraw) : []
      if (Array.isArray(list)) {
        const normalized = (list as Array<Record<string, unknown>>).map((x) => ({
          id: typeof x.id === "number" ? x.id : Date.now(),
          title: typeof x.title === "string" ? x.title : "",
          type: (typeof x.type === "string" && (x.type === "видео" || x.type === "аудио" || x.type === "текст")) ? (x.type as MaterialType) : "текст",
          category: typeof x.category === "string" ? x.category : "",
          url: typeof x.url === "string" ? x.url : undefined,
          text: typeof x.text === "string" ? x.text : undefined,
          createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
        }))
        setMaterials(normalized)
      }
    } catch { setMaterials([]) }
    try {
      const craw = localStorage.getItem("materialCategories")
      const list: unknown = craw ? JSON.parse(craw) : []
      if (Array.isArray(list) && list.length) {
        const normalized = (list as Array<Record<string, unknown>>).map((x, i) => ({
          id: typeof x.id === "number" ? x.id : Date.now() + i,
          name: typeof x.name === "string" ? x.name : "",
          createdAt: typeof x.createdAt === "string" ? x.createdAt : new Date().toISOString(),
        }))
        setCategories(normalized)
        if (!category && normalized.length) setCategory(normalized[0].name)
      } else {
        const seeded = defaultCategories.map((n, i) => ({ id: Date.now() + i, name: n, createdAt: new Date().toISOString() }))
        setCategories(seeded)
        try { localStorage.setItem("materialCategories", JSON.stringify(seeded)) } catch {}
        if (!category && seeded.length) setCategory(seeded[0].name)
      }
    } catch {
      const seeded = defaultCategories.map((n, i) => ({ id: Date.now() + i, name: n, createdAt: new Date().toISOString() }))
      setCategories(seeded)
      try { localStorage.setItem("materialCategories", JSON.stringify(seeded)) } catch {}
      if (!category && seeded.length) setCategory(seeded[0].name)
    }
  }, [category])

  const addMaterial = React.useCallback(() => {
    const t = title.trim()
    if (!t) return
    const entry: Material = {
      id: Date.now(),
      title: t,
      type,
      category: category || (categories[0]?.name || ""),
      url: type !== "текст" ? (url.trim() || undefined) : undefined,
      text: type === "текст" ? (text.trim() || undefined) : undefined,
      createdAt: new Date().toISOString(),
    }
    const next = [entry, ...materials]
    try { localStorage.setItem("materials", JSON.stringify(next)) } catch {}
    try { fetch("/api/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materials: next, categories }) }) } catch {}
    setMaterials(next)
    setTitle("")
    setUrl("")
    setText("")
  }, [title, type, category, url, text, materials, categories])

  const del = React.useCallback((id: number) => {
    const next = materials.filter((m) => m.id !== id)
    try { localStorage.setItem("materials", JSON.stringify(next)) } catch {}
    try { fetch("/api/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materials: next, categories }) }) } catch {}
    setMaterials(next)
  }, [materials])

  const startEdit = React.useCallback((m: Material) => {
    setEditId(m.id)
    setEditTitle(m.title)
    setEditCategory(m.category)
    setEditType(m.type)
    setEditUrl(m.url || "")
    setEditText(m.text || "")
  }, [])

  const saveEdit = React.useCallback(() => {
    if (editId == null) return
    const t = editTitle.trim()
    if (!t) return
    const next = materials.map((m) => (m.id === editId ? {
      ...m,
      title: t,
      category: editCategory,
      type: editType,
      url: editType !== "текст" ? (editUrl.trim() || undefined) : undefined,
      text: editType === "текст" ? (editText.trim() || undefined) : undefined,
    } : m))
    try { localStorage.setItem("materials", JSON.stringify(next)) } catch {}
    try { fetch("/api/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materials: next, categories }) }) } catch {}
    setMaterials(next)
    setEditId(null)
    setEditTitle("")
    setEditCategory("")
    setEditType("текст")
    setEditUrl("")
    setEditText("")
  }, [editId, editTitle, editCategory, editType, editUrl, editText, materials])

  const addCategory = React.useCallback(() => {
    const n = newCat.trim()
    if (!n) return
    if (categories.some((c) => c.name === n)) { setNewCat(""); return }
    const next = [...categories, { id: Date.now(), name: n, createdAt: new Date().toISOString() }]
    try { localStorage.setItem("materialCategories", JSON.stringify(next)) } catch {}
    try { fetch("/api/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materials, categories: next }) }) } catch {}
    setCategories(next)
    setNewCat("")
    if (!category) setCategory(n)
  }, [newCat, categories, category])

  const delCategory = React.useCallback((id: number) => {
    const next = categories.filter((c) => c.id !== id)
    try { localStorage.setItem("materialCategories", JSON.stringify(next)) } catch {}
    try { fetch("/api/materials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ materials, categories: next }) }) } catch {}
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
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <BackButton />
          <Button className="rounded-xl px-4 py-2" onClick={addMaterial} aria-label="Добавить материал">➕ Добавить материал</Button>
        </div>
        <SectionHeader title="Материалы" subtitle="Загрузка, категории и список" className="mb-4 sm:mb-6" />

        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input
                  type="text"
                  placeholder="Например: Видео по дыханию"
                  className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                  value={title}
                  onChange={(e)=>setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Тип материала</label>
                <select
                  className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                  value={type}
                  onChange={(e)=>setType(e.target.value as MaterialType)}
                >
                  {(["видео","аудио","текст"] as const).map((opt)=> (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Категория материалов</label>
                <select
                  className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                  value={category}
                  onChange={(e)=>setCategory(e.target.value)}
                >
                  {categories.map((c)=> (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              {type !== "текст" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Ссылка на материал</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                    value={url}
                    onChange={(e)=>setUrl(e.target.value)}
                  />
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Текстовый материал</label>
                  <textarea
                    rows={4}
                    placeholder="Вставь текст"
                    className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5">
            <div className="text-lg font-semibold mb-3">Категории материалов</div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-end mb-3">
              <div>
                <input
                  type="text"
                  placeholder="Новая категория"
                  className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                  value={newCat}
                  onChange={(e)=>setNewCat(e.target.value)}
                />
              </div>
              <div>
                <Button className="rounded-xl px-4 py-2" onClick={addCategory} aria-label="Добавить категорию">Добавить категорию</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((c)=> (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-black/10 dark:border-white/15 p-2">
                  <div className="font-medium">{c.name}</div>
                  <Button variant="destructive" className="rounded-xl px-3 py-2" onClick={()=>delCategory(c.id)} aria-label="Удалить категорию">🗑 Удалить</Button>
                </div>
              ))}
              {categories.length === 0 ? (<div className="opacity-70">Нет категорий</div>) : null}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Тип</th>
                <th className="px-4 py-3">Категория</th>
                <th className="px-4 py-3">Дата добавления</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3">
                    {editId === m.id ? (
                      <input
                        type="text"
                        className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                        value={editTitle}
                        onChange={(e)=>setEditTitle(e.target.value)}
                      />
                    ) : (
                      m.title
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === m.id ? (
                      <select
                        className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                        value={editType}
                        onChange={(e)=>setEditType(e.target.value as MaterialType)}
                      >
                        {(["видео","аудио","текст"] as const).map((opt)=> (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      m.type
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editId === m.id ? (
                      <select
                        className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                        value={editCategory}
                        onChange={(e)=>setEditCategory(e.target.value)}
                      >
                        {categories.map((c)=> (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    ) : (
                      m.category
                    )}
                  </td>
                  <td className="px-4 py-3">{m.createdAt ? new Date(m.createdAt).toLocaleString('ru-RU') : "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {editId === m.id ? (
                      <>
                        {editType !== "текст" ? (
                          <input
                            type="url"
                            placeholder="https://..."
                            className="w-48 rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                            value={editUrl}
                            onChange={(e)=>setEditUrl(e.target.value)}
                          />
                        ) : (
                          <textarea
                            rows={3}
                            placeholder="Текст"
                            className="w-64 rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                            value={editText}
                            onChange={(e)=>setEditText(e.target.value)}
                          />
                        )}
                        <Button className="rounded-xl px-3 py-2" onClick={saveEdit} aria-label="Сохранить">💾 Сохранить</Button>
                      </>
                    ) : (
                      <>
                        <Button className="rounded-xl px-3 py-2" onClick={()=>startEdit(m)} aria-label="Редактировать">✏️ Редактировать</Button>
                        <Button variant="destructive" className="rounded-xl px-3 py-2" onClick={()=>del(m.id)} aria-label="Удалить">🗑 Удалить</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {materials.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={5}>Нет данных</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
