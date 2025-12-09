"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

type User = {
  id: number
  name: string
  username: string
  registeredAt: string
  lastActiveAt: string
  ritualsCompleted: number
  role: string
}

const sampleUsers: User[] = [
  { id: 1, name: "Иван Петров", username: "ivanpetrov", registeredAt: new Date(Date.now()-86400000*20).toISOString(), lastActiveAt: new Date().toISOString(), ritualsCompleted: 14, role: "user" },
  { id: 2, name: "Анна Смирнова", username: "annasm", registeredAt: new Date(Date.now()-86400000*35).toISOString(), lastActiveAt: new Date(Date.now()-3600000*5).toISOString(), ritualsCompleted: 27, role: "moderator" },
  { id: 3, name: "Админ", username: "admin", registeredAt: new Date(Date.now()-86400000*120).toISOString(), lastActiveAt: new Date(Date.now()-3600000*12).toISOString(), ritualsCompleted: 99, role: "admin" },
]

const roleOptions = [
  { code: "admin", label: "Администратор" },
  { code: "moderator", label: "Модератор" },
  { code: "editor", label: "Контент-редактор" },
  { code: "viewer", label: "Просмотр" },
] as const

function roleLabel(code: string) {
  const found = roleOptions.find(r => r.code === code)
  return found ? found.label : code
}

export default function AssignRolesPage() {
  const [role, setRole] = React.useState<string>("user")
  const [users, setUsers] = React.useState<User[]>([])
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const [roleSel, setRoleSel] = React.useState<string>("viewer")
  const selectedUser = React.useMemo(()=> users.find(u=>u.id===selectedId) || null, [users, selectedId])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser")
      const u = raw ? JSON.parse(raw) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    try {
      const uRaw = localStorage.getItem("users")
      const list = uRaw ? JSON.parse(uRaw) : sampleUsers
      setUsers(Array.isArray(list) ? list : sampleUsers)
    } catch { setUsers(sampleUsers) }
  }, [])

  React.useEffect(() => {
    if (selectedUser) {
      setRoleSel(selectedUser.role)
    }
  }, [selectedUser])

  const changeRole = React.useCallback(() => {
    if (selectedId == null) return
    const next = users.map(u => u.id === selectedId ? { ...u, role: roleSel } : u)
    setUsers(next)
    try { localStorage.setItem("users", JSON.stringify(next)) } catch {}
    try {
      const curRaw = localStorage.getItem("currentUser")
      const cur = curRaw ? JSON.parse(curRaw) : null
      if (cur && cur.id === selectedId) {
        localStorage.setItem("currentUser", JSON.stringify({ ...cur, role: roleSel }))
      }
    } catch {}
  }, [selectedId, roleSel, users])

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
          <div className="flex items-center gap-2">
            <select
              className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
              value={roleSel}
              onChange={(e)=>setRoleSel(e.target.value)}
              aria-label="Роль"
              disabled={selectedId==null}
            >
              {roleOptions.map(r => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
            <Button className="rounded-xl px-4 py-2" onClick={changeRole} aria-label="Изменить роль" disabled={selectedId==null}>Изменить роль</Button>
          </div>
        </div>
        <SectionHeader title="Назначение ролей" subtitle="Выбор и изменение роли пользователя" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-4 py-3">Имя</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Текущая роль</th>
                  <th className="px-4 py-3">Действие</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={`border-t border-black/10 dark:border-white/10 ${selectedId===u.id ? "bg-black/5 dark:bg-white/5" : ""}`}>
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">@{u.username}</td>
                    <td className="px-4 py-3">{roleLabel(u.role)}</td>
                    <td className="px-4 py-3">
                      <Button className="rounded-xl px-3 py-1" onClick={()=>setSelectedId(u.id)} aria-label="Выбрать">Выбрать</Button>
                    </td>
                  </tr>
                ))}
                {users.length===0 ? (
                  <tr>
                    <td className="px-4 py-3" colSpan={4}>Нет данных</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
