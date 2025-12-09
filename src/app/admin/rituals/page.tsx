"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Ritual = {
  id: number
  name: string
  type: string
  time?: { hour: number; minute: number }
  duration?: number
  description?: string
  createdAt: string
}

type HistoryEntry = { id: number; ritual: Ritual; energy: number; doneAt: string }

export default function AdminRitualsListPage() {
  const router = useRouter()
  const [role, setRole] = React.useState<string>("user")
  const [rituals, setRituals] = React.useState<Ritual[]>([])
  const [history, setHistory] = React.useState<HistoryEntry[]>([])

  React.useEffect(() => {
    try {
      const cur = localStorage.getItem("currentUser")
      const u = cur ? JSON.parse(cur) : null
      setRole(u?.role || "user")
    } catch { setRole("user") }
    try {
      const raw = localStorage.getItem("rituals")
      setRituals(raw ? JSON.parse(raw) : [])
    } catch { setRituals([]) }
    try {
      const h = localStorage.getItem("history")
      setHistory(h ? JSON.parse(h) : [])
    } catch { setHistory([]) }
  }, [])

  const energyAvg = React.useCallback((id: number) => {
    const arr = history.filter((e) => e.ritual?.id === id && typeof e.energy === "number").map((e) => e.energy)
    if (!arr.length) return "—"
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length
    return avg.toFixed(1)
  }, [history])

  const del = React.useCallback((id: number) => {
    try {
      const next = rituals.filter((r) => r.id !== id)
      localStorage.setItem("rituals", JSON.stringify(next))
      setRituals(next)
    } catch {}
  }, [rituals])

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
          <Button className="rounded-xl px-4 py-2" onClick={()=>router.push("/rituals/add")} aria-label="Добавить ритуал">➕ Добавить ритуал</Button>
        </div>
        <SectionHeader title="Список ритуалов" subtitle="Управление практиками" className="mb-4 sm:mb-6" />

        <div className="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3">Название ритуала</th>
                <th className="px-4 py-3">Категория</th>
                <th className="px-4 py-3">Длительность</th>
                <th className="px-4 py-3">Уровень энергии</th>
                <th className="px-4 py-3">Дата добавления</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {rituals.map((r) => (
                <tr key={r.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">{r.type}</td>
                  <td className="px-4 py-3">{typeof r.duration === "number" ? `${r.duration} мин` : "—"}</td>
                  <td className="px-4 py-3">{energyAvg(r.id)}</td>
                  <td className="px-4 py-3">{r.createdAt ? new Date(r.createdAt).toLocaleString('ru-RU') : "—"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Button className="rounded-xl px-3 py-2" onClick={()=>router.push(`/rituals/add?edit=${r.id}`)} aria-label="Редактировать">✏️ Редактировать</Button>
                    <Button variant="destructive" className="rounded-xl px-3 py-2" onClick={()=>del(r.id)} aria-label="Удалить">🗑 Удалить</Button>
                  </td>
                </tr>
              ))}
              {rituals.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={6}>Нет данных</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
