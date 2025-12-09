"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type User = {
  id: number
  name: string
  username: string
  registeredAt: string
  lastActiveAt: string
  ritualsCompleted: number
  role: "user" | "admin" | "moderator"
}

const sample: User[] = [
  { id: 1, name: "Иван Петров", username: "ivanpetrov", registeredAt: new Date(Date.now()-86400000*20).toISOString(), lastActiveAt: new Date().toISOString(), ritualsCompleted: 14, role: "user" },
  { id: 2, name: "Анна Смирнова", username: "annasm", registeredAt: new Date(Date.now()-86400000*35).toISOString(), lastActiveAt: new Date(Date.now()-3600000*5).toISOString(), ritualsCompleted: 27, role: "moderator" },
  { id: 3, name: "Админ", username: "admin", registeredAt: new Date(Date.now()-86400000*120).toISOString(), lastActiveAt: new Date(Date.now()-3600000*12).toISOString(), ritualsCompleted: 99, role: "admin" },
]

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = React.useState<User[]>([])
  const [q, setQ] = React.useState("")
  const [role, setRole] = React.useState<string>("user")

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("users")
      const list = raw ? JSON.parse(raw) : sample
      setUsers(list)
    } catch { setUsers(sample) }
    try {
      const cur = localStorage.getItem("currentUser")
      const u = cur ? JSON.parse(cur) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
  }, [])

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return users
    return users.filter(u => u.name.toLowerCase().includes(s) || u.username.toLowerCase().includes(s))
  }, [users, q])

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
          <input
            type="text"
            placeholder="Поиск по имени или username"
            className="w-64 rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            aria-label="Поиск"
          />
        </div>
        <SectionHeader title="Список пользователей" subtitle="Админ-панель" className="mb-4 sm:mb-6" />

        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Дата регистрации</th>
                <th className="px-4 py-3">Последняя активность</th>
                <th className="px-4 py-3">Выполнено ритуалов</th>
                <th className="px-4 py-3">Роль</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">@{u.username}</td>
                  <td className="px-4 py-3">{new Date(u.registeredAt).toLocaleString('ru-RU')}</td>
                  <td className="px-4 py-3">{new Date(u.lastActiveAt).toLocaleString('ru-RU')}</td>
                  <td className="px-4 py-3">{u.ritualsCompleted}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    <Button className="rounded-xl px-4 py-2 text-sm" onClick={()=>router.push(`/admin/users/${u.id}`)} aria-label="Открыть">Открыть</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={7}>Нет данных</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
