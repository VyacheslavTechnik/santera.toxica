"use client"
import * as React from "react"
import { useParams, useRouter } from "next/navigation"
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
  role: "user" | "moderator" | "admin"
  status?: "active" | "blocked"
  adminNote?: string
}

export default function AdminUserEditPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = parseInt(params?.id || "0", 10)
  const [role, setRole] = React.useState<string>("user")
  const [user, setUser] = React.useState<User | null>(null)
  const [name, setName] = React.useState("")
  const [roleSel, setRoleSel] = React.useState<"user"|"moderator"|"admin">("user")
  const [statusSel, setStatusSel] = React.useState<"active"|"blocked">("active")
  const [adminNote, setAdminNote] = React.useState("")

  React.useEffect(() => {
    try {
      const cur = localStorage.getItem("currentUser")
      const u = cur ? JSON.parse(cur) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    try {
      const raw = localStorage.getItem("users")
      const list: User[] = raw ? JSON.parse(raw) : []
      const found = list.find(u => u.id === id) || null
      setUser(found)
      if (found) {
        setName(found.name || "")
        setRoleSel(found.role || "user")
        setStatusSel(found.status || "active")
        setAdminNote(found.adminNote || "")
      }
    } catch { setUser(null) }
  }, [id])

  const canAccess = ["admin", "moderator", "owner"].includes((role || "user").toLowerCase())
  if (!canAccess) {
    return (
      <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 sm:mb-6"><BackButton /></div>
          <SectionHeader title="Доступ запрещён" subtitle="Недостаточно прав" />
        </div>
      </div>
    )
  }

  const save = () => {
    try {
      const raw = localStorage.getItem("users")
      const list: User[] = raw ? JSON.parse(raw) : []
      const next = list.map((u) => u.id === id ? { ...u, name, role: roleSel, status: statusSel, adminNote } : u)
      localStorage.setItem("users", JSON.stringify(next))
    } catch {}
    router.replace(`/admin/users/${id}`)
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 sm:mb-6"><BackButton /></div>
        <SectionHeader title="Редактирование пользователя" subtitle={user ? `@${user.username}` : ""} className="mb-4 sm:mb-6" />

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="mb-3 font-semibold">Имя</div>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" aria-label="Имя" />
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="mb-3 font-semibold">Роль пользователя</div>
            <select value={roleSel} onChange={(e)=>setRoleSel(e.target.value as any)} className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" aria-label="Роль">
              <option value="user">user</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="mb-3 font-semibold">Статус</div>
            <select value={statusSel} onChange={(e)=>setStatusSel(e.target.value as any)} className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" aria-label="Статус">
              <option value="active">активный</option>
              <option value="blocked">заблокирован</option>
            </select>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="mb-3 font-semibold">Примечание администратора</div>
            <textarea value={adminNote} onChange={(e)=>setAdminNote(e.target.value)} rows={5} className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" aria-label="Примечание администратора" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="rounded-xl px-6 py-3" onClick={save} aria-label="Сохранить">💾 Сохранить</Button>
            <BackButton />
          </div>
        </div>
      </div>
    </div>
  )
}
