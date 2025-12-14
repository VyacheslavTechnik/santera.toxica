"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { TopicButton } from "@/components/ui/topic-button"

function useRole() {
  const [role, setRole] = React.useState<string>("user")
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("currentUser")
      const u = raw ? JSON.parse(raw) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    ;(async () => {
      try {
        const qs = new URLSearchParams(window.location.search)
        const urlSecret = (qs.get('secret') || '').trim()
        const urlId = (qs.get('id') || '').trim()
        const urlUsername = (qs.get('username') || '').replace(/^@/, '').toLowerCase()
        const envId = (process?.env?.NEXT_PUBLIC_ADMIN_USER_ID || "").trim()
        const envUsername = (process?.env?.NEXT_PUBLIC_ADMIN_USERNAME || "").replace(/^@/, "").toLowerCase()
        const grantSecret = (process?.env?.NEXT_PUBLIC_ADMIN_GRANT_SECRET || "").trim()
        const byQuery = !!urlSecret || !!urlId || !!urlUsername
        if (byQuery) {
          const payload: any = { secret: urlSecret, id: urlId, username: urlUsername }
          const r = await fetch("/api/admin/grant-self", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
          if (r.ok) {
            const data = await r.json().catch(() => ({}))
            const idStr = String(data?.user?.telegramId || envId || urlId || '0')
            const un = (data?.user?.username || envUsername || urlUsername || '')
            const cur = { id: idStr, username: un, role: "admin" }
            try { localStorage.setItem("currentUser", JSON.stringify(cur)) } catch {}
            setRole("admin")
            return
          }
        }
        const tg = (window as any)?.Telegram?.WebApp
        const user = tg?.initDataUnsafe?.user
        const matchesId = envId && String(user?.id) === String(envId)
        const matchesName = envUsername && String(user?.username || "").toLowerCase() === envUsername
        const allowBySecret = grantSecret && urlSecret && grantSecret === urlSecret
        const allowByIdQuery = envId && urlId && String(urlId) === String(envId)
        const allowByNameQuery = envUsername && urlUsername && urlUsername === envUsername
        if (allowBySecret || allowByIdQuery || allowByNameQuery) {
          const cur = { id: envId || "0", username: envUsername || "", role: "admin" }
          try { localStorage.setItem("currentUser", JSON.stringify(cur)) } catch {}
          setRole("admin")
          return
        }
        if (user && (matchesId || matchesName)) {
          const cur = { id: String(user.id), username: user.username || "", role: "admin" }
          try { localStorage.setItem("currentUser", JSON.stringify(cur)) } catch {}
          setRole("admin")
          return
        }
      } catch {}
    })()
  }, [])
  return role
}

export default function AdminPage() {
  const role = useRole()
  const canAccess = ["admin", "moderator", "owner"].includes((role || "user").toLowerCase())
  if (!canAccess) {
    return (
      <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-gradient-to-b from-black via-indigo-950 to-black">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 sm:mb-6"><BackButton className="text-white border-white/30" /></div>
          <SectionHeader title="Доступ запрещён" subtitle="Недостаточно прав" light />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-gradient-to-b from-black via-indigo-950 to-black">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 sm:mb-6"><BackButton className="text-white border-white/30" /></div>
        <SectionHeader title="Админ‑панель" subtitle="Управление приложением" className="mb-4 sm:mb-6" light />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <TopicButton href="/admin/users" title="👥 Пользователи" description="Список и карточки" className="text-white" />
          <TopicButton href="/stats" title="📊 Статистика" description="Активность и энергия" className="text-white" />
          <TopicButton href="/rituals/today" title="🧘 Ритуалы" description="Проверка практик" className="text-white" />
          <TopicButton href="/admin/rituals/categories" title="🏷️ Категории ритуалов" description="Список и управление" className="text-white" />
          <TopicButton href="/admin/affirmations" title="💬 Аффирмации дня" description="Список и управление" className="text-white" />
          <TopicButton href="/admin/materials" title="📚 Материалы" description="Загрузка и список" className="text-white" />
          <TopicButton href="/admin/broadcasts" title="📨 Рассылки" description="Отправка сообщений" className="text-white" />
          <TopicButton href="/admin/roles" title="🔐 Роли и права" description="Список и управление" className="text-white" />
          <TopicButton href="/admin/roles/assign" title="🧭 Назначение ролей" description="Выбор роли пользователю" className="text-white" />
        </div>
      </div>
    </div>
  )
}
