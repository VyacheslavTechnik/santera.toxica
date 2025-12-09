"use client"
import * as React from "react"
import { BackButton } from "@/components/ui/back-button"
import { SectionHeader } from "@/components/ui/section-header"
import { Button } from "@/components/ui/button"

type Settings = {
  remindersEnabled: boolean
  remindersHour: number
  remindersMinute: number
  theme: "light" | "dark" | "esoteric"
  ritualOfDayNotifications: boolean
}

function applyTheme(theme: Settings["theme"]) {
  const root = document.documentElement
  root.setAttribute("data-theme", theme)
}

export default function SettingsPage() {
  const [remindersEnabled, setRemindersEnabled] = React.useState(false)
  const [remindersHour, setRemindersHour] = React.useState<number>(8)
  const [remindersMinute, setRemindersMinute] = React.useState<number>(0)
  const [theme, setTheme] = React.useState<Settings["theme"]>("light")
  const [rodNotify, setRodNotify] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("settings")
      if (raw) {
        const s = JSON.parse(raw) as Settings
        setRemindersEnabled(!!s.remindersEnabled)
        setRemindersHour(s.remindersHour ?? 8)
        setRemindersMinute(s.remindersMinute ?? 0)
        setTheme((s.theme as any) || "light")
        setRodNotify(!!s.ritualOfDayNotifications)
        applyTheme((s.theme as any) || "light")
      }
    } catch {}
  }, [])

  React.useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const save = React.useCallback(async () => {
    const s: Settings = {
      remindersEnabled,
      remindersHour,
      remindersMinute,
      theme,
      ritualOfDayNotifications: rodNotify,
    }
    try {
      localStorage.setItem("settings", JSON.stringify(s))
    } catch {}
    if (rodNotify || remindersEnabled) {
      if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
        try { await Notification.requestPermission() } catch {}
      }
    }
    setSaved(true)
    setTimeout(()=>setSaved(false), 2000)
  }, [remindersEnabled, remindersHour, remindersMinute, theme, rodNotify])

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <BackButton />
        </div>
        <SectionHeader title="Настройки" subtitle="Персонализируй дневник" className="mb-4 sm:mb-6" />

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="text-lg font-semibold mb-3">Напоминания о ритуалах</div>
            <div className="flex items-center gap-3 mb-3">
              <input type="checkbox" checked={remindersEnabled} onChange={(e)=>setRemindersEnabled(e.target.checked)} aria-label="Включить напоминания" />
              <span>Включить</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min={0} max={23} className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" value={remindersHour} onChange={(e)=>setRemindersHour(parseInt(e.target.value||"0"))} placeholder="Часы" />
              <input type="number" min={0} max={59} className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" value={remindersMinute} onChange={(e)=>setRemindersMinute(parseInt(e.target.value||"0"))} placeholder="Минуты" />
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="text-lg font-semibold mb-3">Тема оформления</div>
            <select className="rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 bg-white/95 dark:bg-black/70" value={theme} onChange={(e)=>setTheme(e.target.value as any)} aria-label="Выбор темы">
              <option value="light">светлая</option>
              <option value="dark">тёмная</option>
              <option value="esoteric">эзотерическая</option>
            </select>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/50 backdrop-blur p-5">
            <div className="text-lg font-semibold mb-3">Уведомления "Ритуал дня"</div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={rodNotify} onChange={(e)=>setRodNotify(e.target.checked)} aria-label="Включить уведомления Ритуал дня" />
              <span>Включить</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="rounded-2xl px-6 py-3 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={save} aria-label="Сохранить">
              💾 Сохранить
            </Button>
          </div>

          {saved ? (<div className="text-emerald-700 dark:text-emerald-400">Настройки сохранены ✨</div>) : null}
        </div>
      </div>
    </div>
  )
}
