"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

type Ritual = {
  id: number
  name: string
  type: string
  time?: { hour: number; minute: number }
  duration?: number
  description?: string
}

const defaults: Ritual[] = [
  { id: 1, name: "Утренняя медитация", type: "медитация", duration: 15, description: "Сядь удобно, сосредоточься на дыхании." },
  { id: 2, name: "Квадратное дыхание", type: "дыхание", duration: 10, description: "Вдох 4, задержка 4, выдох 4, задержка 4." },
  { id: 3, name: "Аффирмация силы", type: "аффирмация", duration: 5, description: "Повторяй аффирмации о силе и ясности." },
]

function pickRandom(list: Ritual[]) {
  return list[Math.floor(Math.random() * list.length)]
}

export default function RitualTodayPage() {
  const [ritual, setRitual] = React.useState<Ritual | null>(null)
  const [energy, setEnergy] = React.useState<number>(3)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    try {
      const fromLocal = JSON.parse(localStorage.getItem("rituals") || "[]") as Ritual[]
      const base = fromLocal.length ? fromLocal : defaults
      setRitual(pickRandom(base))
    } catch {
      setRitual(pickRandom(defaults))
    }
  }, [])

  const complete = React.useCallback(() => {
    if (!ritual) return
    const entry = {
      id: Date.now(),
      ritual,
      energy,
      doneAt: new Date().toISOString(),
    }
    try {
      const prev = JSON.parse(localStorage.getItem("history") || "[]")
      localStorage.setItem("history", JSON.stringify([entry, ...prev]))
    } catch {}
    setSaved(true)
  }, [ritual, energy])

  const refresh = React.useCallback(() => {
    try {
      const fromLocal = JSON.parse(localStorage.getItem("rituals") || "[]") as Ritual[]
      const base = fromLocal.length ? fromLocal : defaults
      setRitual(pickRandom(base))
      setSaved(false)
    } catch {
      setRitual(pickRandom(defaults))
      setSaved(false)
    }
  }, [])

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title="✨ Ритуал дня" subtitle="Выбери энергию и выполни практику" className="mb-4 sm:mb-6" />

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5 sm:p-6 mb-6">
          <div className="text-xl sm:text-2xl font-semibold mb-1">{ritual?.name || "Загрузка..."}</div>
          <div className="text-sm sm:text-base opacity-80 mb-3">
            Тип: {ritual?.type || "—"} {ritual?.duration ? `• ${ritual.duration} мин` : ""}
          </div>
          <div className="text-base sm:text-lg">
            {ritual?.description || "Описание будет доступно после выбора ритуала"}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-4 sm:p-5 mb-6">
          <div className="text-lg font-semibold mb-2">Энергия / Настроение</div>
          <div className="grid grid-cols-5 gap-2">
            {[1,2,3,4,5].map((v) => (
              <button
                key={v}
                onClick={() => setEnergy(v)}
                className={`h-10 sm:h-12 rounded-xl border border-black/10 dark:border-white/20 flex items-center justify-center text-base ${energy===v?"bg-gradient-to-r from-amber-500 to-pink-500 text-white":"bg-white/90 dark:bg-black/60"}`}
                aria-label={`Оценка энергии ${v}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={complete} aria-label="Выполнено">
            ✅ Выполнено
          </Button>
          <Button variant="outline" className="rounded-2xl px-6 py-3 text-base font-semibold" onClick={refresh} aria-label="Новый ритуал">
            🔄 Новый ритуал
          </Button>
        </div>

        {saved ? (
          <div className="mt-4 text-emerald-700 dark:text-emerald-400">Сохранено в историю ✨</div>
        ) : null}
      </div>
    </div>
  )
}
