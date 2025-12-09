"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

type RoleItem = { id: number; name: string; description: string }

const defaultRoles: RoleItem[] = [
  {
    id: 1,
    name: "Администратор",
    description:
      "Полный доступ: управление пользователями, ролями, материалами, аффирмациями, рассылками, ритуалами и настройками",
  },
  {
    id: 2,
    name: "Модератор",
    description:
      "Управление пользователями (статус), просмотр и модерация материалов/аффирмаций/ритуалов, отправка рассылок",
  },
  {
    id: 3,
    name: "Контент-редактор",
    description:
      "Создание и редактирование материалов и аффирмаций, просмотр пользователей и ритуалов, без рассылок",
  },
  {
    id: 4,
    name: "Просмотр",
    description:
      "Только просмотр доступных разделов без права изменений",
  },
]

export default function AdminRolesPage() {
  const [role, setRole] = React.useState<string>("user")
  const [items, setItems] = React.useState<RoleItem[]>([])
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [newDesc, setNewDesc] = React.useState("")
  const [editName, setEditName] = React.useState("")
  const [editDesc, setEditDesc] = React.useState("")

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser")
      const u = raw ? JSON.parse(raw) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    try {
      const rraw = localStorage.getItem("roles")
      const list: unknown = rraw ? JSON.parse(rraw) : []
      if (Array.isArray(list) && list.length) {
        setItems((list as Array<any>).map((x, i) => ({
          id: typeof x.id === "number" ? x.id : i + 1,
          name: typeof x.name === "string" ? x.name : "Роль",
          description: typeof x.description === "string" ? x.description : "",
        })))
      } else {
        setItems(defaultRoles)
        try { localStorage.setItem("roles", JSON.stringify(defaultRoles)) } catch {}
      }
    } catch {
      setItems(defaultRoles)
      try { localStorage.setItem("roles", JSON.stringify(defaultRoles)) } catch {}
    }
  }, [])

  const onSelect = React.useCallback((id: number) => {
    setSelectedId(id)
  }, [])

  const openCreate = React.useCallback(() => {
    setCreateOpen(true)
    setNewName("")
    setNewDesc("")
  }, [])

  const openEdit = React.useCallback(() => {
    if (selectedId == null) return
    const found = items.find((r) => r.id === selectedId)
    if (!found) return
    setEditOpen(true)
    setEditName(found.name)
    setEditDesc(found.description)
  }, [items, selectedId])

  const createRole = React.useCallback(() => {
    const name = newName.trim()
    const description = newDesc.trim()
    if (!name || !description) return
    const entry: RoleItem = { id: Date.now(), name, description }
    const next = [entry, ...items]
    setItems(next)
    try { localStorage.setItem("roles", JSON.stringify(next)) } catch {}
    setCreateOpen(false)
    setNewName("")
    setNewDesc("")
  }, [newName, newDesc, items])

  const saveEdit = React.useCallback(() => {
    if (selectedId == null) return
    const name = editName.trim()
    const description = editDesc.trim()
    if (!name || !description) return
    const next = items.map((r) => (r.id === selectedId ? { ...r, name, description } : r))
    setItems(next)
    try { localStorage.setItem("roles", JSON.stringify(next)) } catch {}
    setEditOpen(false)
  }, [selectedId, editName, editDesc, items])

  const deleteRole = React.useCallback(() => {
    if (selectedId == null) return
    const next = items.filter((r) => r.id !== selectedId)
    setItems(next)
    try { localStorage.setItem("roles", JSON.stringify(next)) } catch {}
    setSelectedId(null)
  }, [selectedId, items])

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
          <div className="flex gap-2">
            <Button className="rounded-xl px-4 py-2" onClick={openCreate} aria-label="Создать роль">Создать роль</Button>
            <Button className="rounded-xl px-4 py-2" onClick={openEdit} aria-label="Редактировать роль" disabled={selectedId==null}>Редактировать роль</Button>
            <Button className="rounded-xl px-4 py-2" onClick={deleteRole} aria-label="Удалить роль" disabled={selectedId==null}>Удалить роль</Button>
          </div>
        </div>
        <SectionHeader title="Роли и права" subtitle="Управление доступом" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3">Роль</th>
                  <th className="px-4 py-3">Описание прав</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className={`border-t border-black/10 dark:border-white/10 cursor-pointer ${selectedId===r.id ? "bg-black/5 dark:bg-white/5" : ""}`} onClick={()=>onSelect(r.id)}>
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">{r.description}</td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-3" colSpan={2}>Нет данных</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {createOpen ? (
          <div className="mt-4 rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5">
            <div className="text-lg font-semibold mb-3">Создать роль</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название роли</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                  value={newName}
                  onChange={(e)=>setNewName(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Описание прав</label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                  value={newDesc}
                  onChange={(e)=>setNewDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button className="rounded-xl px-4 py-2" onClick={createRole}>Сохранить</Button>
              <Button className="rounded-xl px-4 py-2" onClick={()=>setCreateOpen(false)}>Отмена</Button>
            </div>
          </div>
        ) : null}

        {editOpen ? (
          <div className="mt-4 rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5">
            <div className="text-lg font-semibold mb-3">Редактировать роль</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название роли</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                  value={editName}
                  onChange={(e)=>setEditName(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Описание прав</label>
                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                  value={editDesc}
                  onChange={(e)=>setEditDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button className="rounded-xl px-4 py-2" onClick={saveEdit}>Сохранить</Button>
              <Button className="rounded-xl px-4 py-2" onClick={()=>setEditOpen(false)}>Отмена</Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
