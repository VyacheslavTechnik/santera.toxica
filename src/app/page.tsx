"use client"
import * as React from "react"
import { BackgroundPaths } from "@/components/ui/background-paths"
import { TopicButton } from "@/components/ui/topic-button"
import { SectionHeader } from "@/components/ui/section-header"

function Calendar() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  const days = Array.from({ length: start.getDay() === 0 ? 6 : start.getDay() - 1 }).map(() => null)
  const monthDays = Array.from({ length: end.getDate() }, (_, i) => i + 1)
  const cells = [...days, ...monthDays]
  const monthName = today.toLocaleDateString("ru-RU", { month: "long" }).replace(/^./, (c) => c.toUpperCase())
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-lg sm:text-xl font-semibold">{monthName} {year}</div>
        <div className="text-sm opacity-70">Сегодня: {today.toLocaleDateString("ru-RU")}</div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((d) => (
          <div key={d} className="text-center text-xs sm:text-sm opacity-70">{d}</div>
        ))}
        {cells.map((d, idx) => (
          <div key={idx} className="h-10 sm:h-12 rounded-xl border border-black/10 dark:border-white/15 flex items-center justify-center">
            {d ? (
              <span className={`text-sm sm:text-base ${d === today.getDate() ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white px-2 py-1 rounded-lg" : ""}`}>{d}</span>
            ) : (
              <span className="opacity-0">0</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [affirmation, setAffirmation] = React.useState<string>("Сегодня твоя энергия особенно сильна ✨")
  const [role, setRole] = React.useState<string>("user")
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("affirmations")
      const list: unknown = raw ? JSON.parse(raw) : []
      if (Array.isArray(list)) {
        const active = (list as Array<Record<string, unknown>>)
          .filter((x) => x && typeof x === "object" && x.active === true && typeof x.text === "string")
          .sort((a, b) => {
            const ta = Date.parse(typeof a.createdAt === "string" ? a.createdAt : "") || 0
            const tb = Date.parse(typeof b.createdAt === "string" ? b.createdAt : "") || 0
            return tb - ta
          })
        if (active.length) setAffirmation(String(active[0].text))
      }
    } catch {}
    ;(async () => {
      try {
        const res = await fetch("/api/affirmations", { cache: "no-store" })
        const data = await res.json().catch(() => ({})) as { affirmations?: Array<{ text: string; active: boolean; createdAt?: string }> }
        if (Array.isArray(data.affirmations)) {
          const active = data.affirmations
            .filter((x) => x && x.active === true && typeof x.text === "string")
            .sort((a, b) => {
              const ta = Date.parse(typeof a.createdAt === "string" ? a.createdAt : "") || 0
              const tb = Date.parse(typeof b.createdAt === "string" ? b.createdAt : "") || 0
              return tb - ta
            })
          if (active.length) {
            setAffirmation(String(active[0].text))
            try { localStorage.setItem("affirmations", JSON.stringify(data.affirmations)) } catch {}
          }
        }
      } catch {}
    })()
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/affirmations", { cache: "no-store" })
        const data = await res.json().catch(() => ({})) as { affirmations?: Array<{ text: string; active: boolean; createdAt?: string }> }
        if (Array.isArray(data.affirmations)) {
          const active = data.affirmations
            .filter((x) => x && x.active === true && typeof x.text === "string")
            .sort((a, b) => {
              const ta = Date.parse(typeof a.createdAt === "string" ? a.createdAt : "") || 0
              const tb = Date.parse(typeof b.createdAt === "string" ? b.createdAt : "") || 0
              return tb - ta
            })
          if (active.length) {
            setAffirmation(String(active[0].text))
            try { localStorage.setItem("affirmations", JSON.stringify(data.affirmations)) } catch {}
          }
        }
      } catch {}
    }, 15000)
    return () => { clearInterval(id) }
    try {
      const cur = localStorage.getItem("currentUser") || "null"
      const u = JSON.parse(cur)
      setRole(u?.role || "user")
    } catch { setRole("user") }
  }, [])
  return (
    <BackgroundPaths title="Дневник ритуалов и практик">
      <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <SectionHeader title="Привет! Готов к практике сегодня? 🌿" className="mb-4 sm:mb-6" />
          <div className="mb-6 sm:mb-8">
            <Calendar />
          </div>
          <div className="mb-6 sm:mb-8">
            <div className="w-full text-center p-4 sm:p-5 rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur">
              <div className="text-lg sm:text-xl font-semibold">Аффирмация дня</div>
              <div className="mt-2 text-base sm:text-lg">{affirmation}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <TopicButton href="/stats" title="📊 Статистика" description="История и прогресс" />
            <TopicButton href="/materials" title="📚 Материалы" description="Видео, аудио и тексты" />
            <TopicButton href="/motivation" title="🌟 Мотивация / аффирмации" description="Поддержка и советы" />
            <TopicButton href="/journal" title="📔 Ведение записей" description="Ощущения, мысли и сны" />
            {(role === "admin" || role === "ADMIN" || role === "OWNER") && (
              <TopicButton href="/admin" title="🔐 Админ" description="Панель управления" />
            )}
          </div>
        </div>
      </div>
    </BackgroundPaths>
  )
}
