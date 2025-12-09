"use client"
import * as React from "react"

function getInitData(): string | null {
  try {
    // @ts-ignore
    const tg = window?.Telegram?.WebApp
    return tg?.initData || null
  } catch { return null }
}

export default function WebAppHome() {
  const [me, setMe] = React.useState<any>(null)
  const [records, setRecords] = React.useState<any[]>([])
  const [rituals, setRituals] = React.useState<any[]>([])
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const initData = React.useMemo(()=> getInitData(), [])

  React.useEffect(() => {
    async function bootstrap() {
      const id = initData
      if (!id) return
      await fetch("/api/user/register", { method: "POST", headers: { "Content-Type": "application/json", "x-telegram-init-data": id }, body: JSON.stringify({}) })
      const meRes = await fetch("/api/user/me", { headers: { "x-telegram-init-data": id } })
      const meJson = await meRes.json()
      setMe(meJson.user)
      const rRes = await fetch("/api/records/list", { headers: { "x-telegram-init-data": id } })
      const rJson = await rRes.json()
      setRecords(rJson.records || [])
      const riRes = await fetch("/api/rituals/list")
      const riJson = await riRes.json()
      setRituals(riJson.rituals || [])
    }
    bootstrap()
  }, [initData])

  const createRecord = React.useCallback(async () => {
    const id = initData
    if (!id || !title.trim() || !content.trim()) return
    const res = await fetch("/api/records/create", { method: "POST", headers: { "Content-Type": "application/json", "x-telegram-init-data": id }, body: JSON.stringify({ title: title.trim(), content: content.trim() }) })
    const json = await res.json()
    if (json.record) {
      setRecords([json.record, ...records])
      setTitle("")
      setContent("")
    }
  }, [initData, title, content, records])

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-2xl font-semibold mb-3">Дневник ритуалов</div>
        <div className="opacity-80 mb-4">Авторизация: Telegram WebApp</div>
        <div className="rounded-2xl border border-black/10 dark:border-white/15 p-4 mb-4">
          <div className="font-medium mb-2">Профиль</div>
          {me ? (
            <div className="text-sm">
              <div>Имя: {me.fullName || "—"}</div>
              <div>Username: @{me.username || "—"}</div>
              <div>Роль: {me.role}</div>
              <div>Дата регистрации: {new Date(me.createdAt).toLocaleString("ru-RU")}</div>
            </div>
          ) : (
            <div className="opacity-70 text-sm">Нет данных (ожидание initData)</div>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/15 p-4 mb-4">
          <div className="font-medium mb-2">Создать запись</div>
          <input className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 mb-2" placeholder="Заголовок" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <textarea className="w-full rounded-xl border border-black/15 dark:border-white/20 px-3 py-2 mb-2" rows={4} placeholder="Содержание" value={content} onChange={(e)=>setContent(e.target.value)} />
          <button className="rounded-xl px-4 py-2 border border-black/15 dark:border-white/20" onClick={createRecord}>Создать</button>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/15 p-4 mb-4">
          <div className="font-medium mb-2">Мои записи</div>
          <div className="grid grid-cols-1 gap-2">
            {records.length === 0 ? (<div className="opacity-70 text-sm">Нет записей</div>) : records.map((r) => (
              <div key={r.id} className="rounded-xl border border-black/10 dark:border-white/15 p-3">
                <div className="font-medium">{r.title}</div>
                <div className="text-sm opacity-80">{new Date(r.createdAt).toLocaleString("ru-RU")}</div>
                <div className="text-sm mt-1">{r.content}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/15 p-4">
          <div className="font-medium mb-2">Ритуалы</div>
          <div className="grid grid-cols-1 gap-2">
            {rituals.length === 0 ? (<div className="opacity-70 text-sm">Нет ритуалов</div>) : rituals.map((ri) => (
              <div key={ri.id} className="rounded-xl border border-black/10 dark:border-white/15 p-3">
                <div className="font-medium">{ri.title} • уровень {ri.level}</div>
                <div className="text-sm opacity-80">{ri.category || "без категории"}</div>
                <div className="text-sm mt-1">{ri.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

