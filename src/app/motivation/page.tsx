"use client"
import * as React from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"

type HistoryEntry = {
  id: number
  ritual: { id: number; name: string; type: string; duration?: number }
  energy: number
  doneAt: string
}

const affirmations = [
  "Сегодня твоя энергия особенно сильна ✨",
  "Ты в потоке изменений и роста 🌊",
  "Твоя ясность ведёт тебя вперёд 🌟",
  "Дыши глубоко — сила внутри тебя 🌿",
  "Ты создаёшь гармонию и баланс ⚖️",
]

const secretTips = [
  "Секрет №1: после практики запиши три инсайта 💫",
  "Секрет №2: завершай день благодарностью и спокойным дыханием 🌙",
]

function dayIndex() {
  return Math.floor(Date.now() / 86_400_000) % affirmations.length
}

export default function MotivationPage() {
  const [affirmation, setAffirmation] = React.useState<string>("")
  const [historyCount, setHistoryCount] = React.useState<number>(0)
  const [energy, setEnergy] = React.useState<number>(3)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    setAffirmation(affirmations[dayIndex()])
    try {
      const data = JSON.parse(localStorage.getItem("history") || "[]") as HistoryEntry[]
      setHistoryCount(data.length)
    } catch { setHistoryCount(0) }
  }, [])

  const saveMood = React.useCallback(() => {
    const entry: HistoryEntry = {
      id: Date.now(),
      ritual: { id: 0, name: "Оценка настроения", type: "энергетика" },
      energy,
      doneAt: new Date().toISOString(),
    }
    try {
      const prev = JSON.parse(localStorage.getItem("history") || "[]")
      localStorage.setItem("history", JSON.stringify([entry, ...prev]))
      setHistoryCount((c) => c + 1)
    } catch {}
    setSaved(true)
    setTimeout(()=>setSaved(false), 2000)
  }, [energy])

  const unlocked1 = historyCount >= 3
  const unlocked2 = historyCount >= 5

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        <SectionHeader title="✨ Мотивация / аффирмации" subtitle="Поддерживай силу и настрой" className="mb-4 sm:mb-6" />

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/60 backdrop-blur p-5">
            <div className="text-lg sm:text-xl font-semibold mb-2">Аффирмация дня</div>
            <div className="text-base sm:text-lg">{affirmation}</div>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/60 backdrop-blur p-5">
            <div className="text-lg sm:text-xl font-semibold mb-2">Секретные советы</div>
            <div className="grid grid-cols-1 gap-3">
              <div className={`rounded-xl p-3 border ${unlocked1?"border-amber-400 bg-gradient-to-r from-amber-100 to-pink-100":"border-black/10 bg-white/80"}`}>
                {unlocked1 ? secretTips[0] : "Откроется после 3 выполненных ритуалов 🔐"}
              </div>
              <div className={`rounded-xl p-3 border ${unlocked2?"border-amber-400 bg-gradient-to-r from-amber-100 to-pink-100":"border-black/10 bg-white/80"}`}>
                {unlocked2 ? secretTips[1] : "Откроется после 5 выполненных ритуалов 🔐"}
              </div>
            </div>
            <div className="mt-2 text-sm opacity-70">Выполнено ритуалов: {historyCount}</div>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-black/60 backdrop-blur p-5">
            <div className="text-lg sm:text-xl font-semibold mb-3">Энергия / настроение</div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[1,2,3,4,5].map((v) => (
                <button
                  key={v}
                  onClick={() => setEnergy(v)}
                  className={`h-10 sm:h-12 rounded-xl border border-black/10 dark:border-white/20 flex items-center justify-center text-base ${energy===v?"bg-gradient-to-r from-amber-500 to-pink-500 text-white":"bg-white"}`}
                  aria-label={`Оценка энергии ${v}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={saveMood} aria-label="Сохранить оценку">
              💾 Сохранить оценку
            </Button>
            {saved ? (<div className="mt-2 text-emerald-700 dark:text-emerald-400">Сохранено ✨</div>) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
