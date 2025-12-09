"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

type Audience = "все" | "активные" | "неактивные" | "VIP"
type User = { id: number; name: string; username: string; role?: string; status?: "active"|"blocked"; lastActiveAt?: string }
type Broadcast = { id: number; title: string; text: string; audience: Audience; fileName?: string; fileSize?: number; sentAt: string; recipients: number }

const sampleUsers: User[] = [
  { id: 1, name: "Иван Петров", username: "ivanpetrov", role: "user", status: "active", lastActiveAt: new Date().toISOString() },
  { id: 2, name: "Анна Смирнова", username: "annasm", role: "moderator", status: "active", lastActiveAt: new Date(Date.now()-3600*1000*48).toISOString() },
  { id: 3, name: "Админ", username: "admin", role: "admin", status: "active", lastActiveAt: new Date(Date.now()-3600*1000*12).toISOString() },
  { id: 4, name: "Пользователь", username: "user2", role: "user", status: "blocked", lastActiveAt: new Date(Date.now()-3600*1000*720).toISOString() },
]

export default function AdminBroadcastsPage() {
  const [role, setRole] = React.useState<string>("user")
  const [title, setTitle] = React.useState("")
  const [text, setText] = React.useState("")
  const [audience, setAudience] = React.useState<Audience>("все")
  const [fileName, setFileName] = React.useState<string>("")
  const [fileSize, setFileSize] = React.useState<number | undefined>(undefined)
  const [users, setUsers] = React.useState<User[]>([])
  const [sent, setSent] = React.useState<Broadcast | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser")
      const u = raw ? JSON.parse(raw) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    try {
      const uraw = localStorage.getItem("users")
      const list: unknown = uraw ? JSON.parse(uraw) : []
      if (Array.isArray(list) && list.length) {
        const normalized: User[] = (list as Array<Record<string, unknown>>).map((x, i) => ({
          id: typeof x.id === "number" ? x.id : i+1,
          name: typeof x.name === "string" ? x.name : "Пользователь",
          username: typeof x.username === "string" ? x.username : "user",
          role: typeof x.role === "string" ? x.role : "user",
          status: x.status === "blocked" ? "blocked" : "active",
          lastActiveAt: typeof x.lastActiveAt === "string" ? x.lastActiveAt : new Date().toISOString(),
        }))
        setUsers(normalized)
      } else {
        setUsers(sampleUsers)
        try { localStorage.setItem("users", JSON.stringify(sampleUsers)) } catch {}
      }
    } catch {
      setUsers(sampleUsers)
      try { localStorage.setItem("users", JSON.stringify(sampleUsers)) } catch {}
    }
  }, [])

  const recipientsCount = React.useMemo(() => {
    const isActive = (u: User) => u.status === "active"
    if (audience === "все") return users.length
    if (audience === "активные") return users.filter(isActive).length
    if (audience === "неактивные") return users.filter(u => u.status === "blocked").length
    if (audience === "VIP") return users.filter(u => u.role === "admin" || u.role === "moderator").length
    return 0
  }, [audience, users])

  const recipients = React.useMemo(() => {
    if (audience === "все") return users
    if (audience === "активные") return users.filter(u => u.status === "active")
    if (audience === "неактивные") return users.filter(u => u.status === "blocked")
    if (audience === "VIP") return users.filter(u => u.role === "admin" || u.role === "moderator")
    return [] as User[]
  }, [audience, users])

  const onFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) { setFileName(""); setFileSize(undefined); return }
    setFileName(f.name)
    setFileSize(f.size)
  }, [])

  const send = React.useCallback(() => {
    const t = title.trim()
    const msg = text.trim()
    if (!t || !msg) return
    const entry: Broadcast = {
      id: Date.now(),
      title: t,
      text: msg,
      audience,
      fileName: fileName || undefined,
      fileSize,
      sentAt: new Date().toISOString(),
      recipients: recipientsCount,
    }
    try {
      const prev = JSON.parse(localStorage.getItem("broadcasts") || "[]")
      const next = [entry, ...prev]
      localStorage.setItem("broadcasts", JSON.stringify(next))
    } catch {}
    setSent(entry)
    setTitle("")
    setText("")
    setFileName("")
    setFileSize(undefined)
  }, [title, text, audience, fileName, fileSize, recipientsCount])

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
          <Button className="rounded-xl px-4 py-2" onClick={send} aria-label="Отправить рассылку">▶️ Отправить рассылку</Button>
        </div>
        <SectionHeader title="Рассылки" subtitle="Отправка сообщений аудитории" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок рассылки</label>
              <input
                type="text"
                placeholder="Например: Важное обновление"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Выбор аудитории</label>
              <select
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={audience}
                onChange={(e)=>setAudience(e.target.value as Audience)}
              >
                {(["все","активные","неактивные","VIP"] as const).map((opt)=> (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Текст сообщения</label>
              <textarea
                rows={5}
                placeholder="Напиши текст рассылки"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                value={text}
                onChange={(e)=>setText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Прикреплённый файл (опционально)</label>
              <input
                type="file"
                className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70"
                onChange={onFile}
              />
              <div className="mt-2 text-sm opacity-70">Получателей: {recipientsCount}</div>
              {fileName ? (<div className="mt-1 text-sm">Файл: {fileName} {fileSize ? `(${Math.round(fileSize/1024)} КБ)` : ""}</div>) : null}
            </div>
            <div className="sm:col-span-2">
              <div className="text-sm font-medium mb-1">Превью получателей</div>
              <div className="rounded-xl border border-black/10 dark:border-white/15 p-2">
                {recipients.length === 0 ? (
                  <div className="opacity-70">Нет получателей</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recipients.slice(0, 12).map((u) => (
                      <div key={u.id} className="rounded-lg border border-black/10 dark:border-white/15 px-2 py-1 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          <div className="text-xs opacity-70">@{u.username}</div>
                        </div>
                        <div className="text-xs opacity-70">{u.role === "admin" ? "admin" : u.role === "moderator" ? "moderator" : "user"} • {u.status === "blocked" ? "неактивен" : "активен"}</div>
                      </div>
                    ))}
                    {recipients.length > 12 ? (
                      <div className="text-sm opacity-70">и ещё {recipients.length - 12}</div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5">
          <div className="text-lg font-semibold mb-3">Последние рассылки</div>
          <BroadcastList />
          {sent ? (
            <div className="mt-3 rounded-xl border border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 p-3">
              <div className="font-medium">Отправлено</div>
              <div className="text-sm opacity-80">{new Date(sent.sentAt).toLocaleString('ru-RU')} • {sent.title} • получателей: {sent.recipients}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function BroadcastList() {
  const [items, setItems] = React.useState<Broadcast[]>([])
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("broadcasts")
      const list = raw ? JSON.parse(raw) : []
      setItems(Array.isArray(list) ? list : [])
    } catch { setItems([]) }
  }, [])
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.length === 0 ? (<div className="opacity-70">Нет данных</div>) : items.map((b) => (
        <div key={b.id} className="rounded-xl border border-black/10 dark:border-white/15 p-3">
          <div className="font-medium">{b.title}</div>
          <div className="text-sm opacity-80">{new Date(b.sentAt).toLocaleString('ru-RU')} • аудитория: {b.audience} • получателей: {b.recipients}</div>
        </div>
      ))}
    </div>
  )
}
