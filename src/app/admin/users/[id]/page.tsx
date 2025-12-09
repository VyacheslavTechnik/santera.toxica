"use client"
import * as React from "react"
import { useParams } from "next/navigation"
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
  role: string
  status?: "active" | "blocked"
}

export default function AdminUserCardPage() {
  const params = useParams() as { id?: string }
  const id = parseInt(params?.id || "0", 10)
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  const [role, setRole] = React.useState<string>("user")
  const [editMode, setEditMode] = React.useState(false)
  const [roleSel, setRoleSel] = React.useState<string>("user")
  const [statusSel, setStatusSel] = React.useState<"active"|"blocked">("active")
  const [rituals, setRituals] = React.useState<any[]>([])
  const [journals, setJournals] = React.useState<any[]>([])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("users")
      const list: User[] = raw ? JSON.parse(raw) : []
      let found = list.find(u => u.id === id) || null
      if (!found) {
        found = {
          id,
          name: "Пользователь",
          username: "user",
          registeredAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          ritualsCompleted: 0,
          role: "user",
          status: "active",
        }
      }
      setUser(found)
      setRoleSel(found.role)
      setStatusSel(found.status || "active")
    } catch { setUser(null) }
    try {
      const cur = localStorage.getItem("currentUser")
      const u = cur ? JSON.parse(cur) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    try {
      const hUser = JSON.parse(localStorage.getItem(`history_${id}`) || "null")
      const hGlobal = JSON.parse(localStorage.getItem("history") || "[]")
      const cur = JSON.parse(localStorage.getItem("currentUser") || "null")
      const hist = hUser ?? (cur?.id === id ? hGlobal : [])
      setRituals(Array.isArray(hist) ? hist.filter((e: any)=>e.ritual).sort((a:any,b:any)=> new Date(b.doneAt).getTime()-new Date(a.doneAt).getTime()).slice(0,10) : [])
    } catch { setRituals([]) }
    try {
      const jUser = JSON.parse(localStorage.getItem(`journal_${id}`) || "null")
      const jGlobal = JSON.parse(localStorage.getItem("journal") || "[]")
      const cur = JSON.parse(localStorage.getItem("currentUser") || "null")
      const jr = jUser ?? (cur?.id === id ? jGlobal : [])
      setJournals(Array.isArray(jr) ? jr : [])
    } catch { setJournals([]) }
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
  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title="Карточка пользователя" subtitle="Детали профиля" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
          <div className="text-xl sm:text-2xl font-semibold mb-2">{user?.name || "Пользователь не найден"}</div>
          {user ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><span className="opacity-70">Username:</span> @{user.username}</div>
              <div><span className="opacity-70">Роль:</span> {user.role}</div>
              <div><span className="opacity-70">Статус:</span> {user.status || "active"}</div>
              <div><span className="opacity-70">Дата регистрации:</span> {new Date(user.registeredAt).toLocaleString('ru-RU')}</div>
              <div><span className="opacity-70">Последняя активность:</span> {new Date(user.lastActiveAt).toLocaleString('ru-RU')}</div>
              <div><span className="opacity-70">Выполнено ритуалов:</span> {user.ritualsCompleted}</div>
            </div>
          ) : null}
          <div className="mt-4 flex gap-3">
            {!editMode ? (
              <Button className="rounded-xl px-4 py-2" onClick={()=>router.push(`/admin/users/${id}/edit`)} aria-label="Редактировать">Редактировать</Button>
            ) : (
              <div className="flex items-center gap-3">
                <select className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" value={roleSel} onChange={(e)=>setRoleSel(e.target.value)} aria-label="Роль">
                  {['user','moderator','admin'].map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
                <select className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" value={statusSel} onChange={(e)=>setStatusSel(e.target.value as any)} aria-label="Статус">
                  <option value="active">active</option>
                  <option value="blocked">blocked</option>
                </select>
                <Button className="rounded-xl px-4 py-2" onClick={()=>{
                  try {
                    const raw = localStorage.getItem("users")
                    const list = raw ? JSON.parse(raw) : []
                    const next = list.map((u: User)=> u.id===id ? { ...u, role: roleSel, status: statusSel } : u)
                    localStorage.setItem("users", JSON.stringify(next))
                    const updated = next.find((u: User)=>u.id===id) || null
                    setUser(updated)
                    setEditMode(false)
                  } catch {}
                }} aria-label="Сохранить">Сохранить</Button>
              </div>
            )}
            <Button variant="destructive" className="rounded-xl px-4 py-2" onClick={()=>{
              try {
                const raw = localStorage.getItem("users")
                const list = raw ? JSON.parse(raw) : []
                const next = list.filter((u: User)=>u.id!==id)
                localStorage.setItem("users", JSON.stringify(next))
              } catch {}
              history.back()
            }} aria-label="Удалить пользователя">Удалить пользователя</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="text-lg font-semibold mb-3">Последние 10 ритуалов пользователя</div>
            <div className="grid grid-cols-1 gap-3">
              {rituals.length===0 ? (<div className="opacity-70">Нет данных</div>) : rituals.map((e:any)=>(
                <div key={e.id} className="rounded-xl border border-black/10 dark:border-white/20 p-3">
                  <div className="font-medium">{e.ritual?.name || 'Ритуал'}</div>
                  <div className="text-sm opacity-75">{new Date(e.doneAt).toLocaleString('ru-RU')} • энергия {e.energy}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="text-lg font-semibold mb-3">Дневники: эмоции, мысли, сны</div>
            <div className="grid grid-cols-1 gap-3">
              {(['feelings','thoughts','dreams'] as const).map(tab=>{
                const subset = journals.filter((j:any)=>j.tab===tab).sort((a:any,b:any)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,5)
                return (
                  <div key={tab} className="rounded-xl border border-black/10 dark:border-white/20 p-3">
                    <div className="font-semibold mb-2">{tab==='feelings'?'Ощущения':tab==='thoughts'?'Мысли':'Сны'}</div>
                    {subset.length===0 ? (<div className="opacity-70">Нет записей</div>) : subset.map((j:any)=>(
                      <div key={j.id} className="text-sm">
                        <span className="font-medium">{j.title}</span> • {new Date(j.createdAt).toLocaleString('ru-RU')}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
