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
    try {
      // @ts-ignore
      const tg = window?.Telegram?.WebApp
      const user = tg?.initDataUnsafe?.user
      const envId = (process?.env?.NEXT_PUBLIC_ADMIN_USER_ID || "").trim()
      const envUsername = (process?.env?.NEXT_PUBLIC_ADMIN_USERNAME || "").replace(/^@/, "").toLowerCase()
      const grantSecret = (process?.env?.NEXT_PUBLIC_ADMIN_GRANT_SECRET || "").trim()
      const urlSecret = (new URLSearchParams(window.location.search).get('secret') || '').trim()
      const urlId = (new URLSearchParams(window.location.search).get('id') || '').trim()
      const urlUsername = (new URLSearchParams(window.location.search).get('username') || '').replace(/^@/, '').toLowerCase()
      const allowBySecret = grantSecret && urlSecret && grantSecret === urlSecret
      const matchesId = envId && String(user?.id) === String(envId)
      const matchesName = envUsername && String(user?.username || "").toLowerCase() === envUsername
      const allowByIdQuery = envId && urlId && String(urlId) === String(envId)
      const allowByNameQuery = envUsername && urlUsername && urlUsername === envUsername
      if (allowBySecret || allowByIdQuery || allowByNameQuery) {
        const cur = { id: envId || "0", username: envUsername || "", role: "admin" }
        try { localStorage.setItem("currentUser", JSON.stringify(cur)) } catch {}
        setRole("admin")
      } else if (user && (matchesId || matchesName)) {
        const cur = { id: String(user.id), username: user.username || "", role: "admin" }
        try { localStorage.setItem("currentUser", JSON.stringify(cur)) } catch {}
        setRole("admin")
      }
    } catch {}
  }, [])
  return role
}

export default function AdminPage() {
  const role = useRole()
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
        <div className="mb-4 sm:mb-6"><BackButton /></div>
        <SectionHeader title="Админ‑панель" subtitle="Управление приложением" className="mb-4 sm:mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <TopicButton href="/admin/users" title="👥 Пользователи" description="Список и карточки" />
          <TopicButton href="/stats" title="📊 Статистика" description="Активность и энергия" />
          <TopicButton href="/rituals/today" title="🧘 Ритуалы" description="Проверка практик" />
          <TopicButton href="/admin/rituals/categories" title="🏷️ Категории ритуалов" description="Список и управление" />
          <TopicButton href="/admin/affirmations" title="💬 Аффирмации дня" description="Список и управление" />
          <TopicButton href="/admin/materials" title="📚 Материалы" description="Загрузка и список" />
          <TopicButton href="/admin/broadcasts" title="📨 Рассылки" description="Отправка сообщений" />
          <TopicButton href="/admin/roles" title="🔐 Роли и права" description="Список и управление" />
          <TopicButton href="/admin/roles/assign" title="🧭 Назначение ролей" description="Выбор роли пользователю" />
        </div>
      </div>
    </div>
  )
}
