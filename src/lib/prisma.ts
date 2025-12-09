type User = { id: number; telegramId: string; username?: string | null; fullName?: string | null; role: string; createdAt: Date }
type RecordItem = { id: number; userId: number; title: string; content: string; category?: string | null; createdAt: Date }
type Ritual = { id: number; title: string; description: string; category?: string | null; level: number; mediaUrl?: string | null; createdAt: Date }
type RitualProgress = { id: number; userId: number; ritualId: number; completed: boolean; completedAt?: Date | null }
type AdminLog = { id: number; adminId: number; action: string; createdAt: Date }

type Db = {
  users: User[]
  records: RecordItem[]
  rituals: Ritual[]
  ritualProgress: RitualProgress[]
  adminLogs: AdminLog[]
  counters: { user: number; record: number; ritual: number; rp: number; log: number }
}

const g = globalThis as any
const db: Db = g.__db || {
  users: [],
  records: [],
  rituals: [],
  ritualProgress: [],
  adminLogs: [],
  counters: { user: 1, record: 1, ritual: 1, rp: 1, log: 1 },
}
if (!g.__db) g.__db = db

export const prisma = {
  user: {
    findUnique: async ({ where }: { where: { telegramId?: string; id?: number } }): Promise<User | null> => {
      if (typeof where.telegramId === "string") return db.users.find((u) => u.telegramId === where.telegramId) || null
      if (typeof where.id === "number") return db.users.find((u) => u.id === where.id) || null
      return null
    },
    findMany: async ({ orderBy }: { orderBy?: { createdAt?: "asc" | "desc" } } = {}): Promise<User[]> => {
      const arr = [...db.users]
      if (orderBy?.createdAt === "desc") arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (orderBy?.createdAt === "asc") arr.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      return arr
    },
    create: async ({ data }: { data: Partial<User> }): Promise<User> => {
      const u: User = {
        id: db.counters.user++,
        telegramId: String(data.telegramId || ""),
        username: data.username ?? null,
        fullName: data.fullName ?? null,
        role: String(data.role || "USER"),
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
      }
      db.users.push(u)
      return u
    },
    update: async ({ where, data }: { where: { id: number }; data: Partial<User> }): Promise<User> => {
      const i = db.users.findIndex((u) => u.id === where.id)
      if (i < 0) throw new Error("User not found")
      db.users[i] = { ...db.users[i], ...data }
      return db.users[i]
    },
    upsert: async ({ where, update, create }: { where: { telegramId: string }; update: Partial<User>; create: Partial<User> }): Promise<User> => {
      const existing = db.users.find((u) => u.telegramId === where.telegramId)
      if (existing) {
        Object.assign(existing, update)
        return existing
      }
      const u: User = {
        id: db.counters.user++,
        telegramId: where.telegramId,
        username: create.username ?? null,
        fullName: create.fullName ?? null,
        role: String(create.role || "USER"),
        createdAt: new Date(),
      }
      db.users.push(u)
      return u
    },
  },
  record: {
    findMany: async ({ where, orderBy }: { where?: { userId?: number }; orderBy?: { createdAt?: "asc" | "desc" } } = {}): Promise<RecordItem[]> => {
      let arr = [...db.records]
      if (typeof where?.userId === "number") arr = arr.filter((r) => r.userId === where.userId)
      if (orderBy?.createdAt === "desc") arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (orderBy?.createdAt === "asc") arr.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      return arr
    },
    create: async ({ data }: { data: Partial<RecordItem> }): Promise<RecordItem> => {
      const r: RecordItem = {
        id: db.counters.record++,
        userId: Number(data.userId || 0),
        title: String(data.title || ""),
        content: String(data.content || ""),
        category: data.category ?? null,
        createdAt: new Date(),
      }
      db.records.push(r)
      return r
    },
  },
  adminLog: {
    findMany: async ({ orderBy, take }: { orderBy?: { createdAt?: "asc" | "desc" }; take?: number } = {}): Promise<AdminLog[]> => {
      let arr = [...db.adminLogs]
      if (orderBy?.createdAt === "desc") arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (orderBy?.createdAt === "asc") arr.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      if (typeof take === "number") arr = arr.slice(0, take)
      return arr
    },
    create: async ({ data }: { data: Partial<AdminLog> }): Promise<AdminLog> => {
      const l: AdminLog = { id: db.counters.log++, adminId: Number(data.adminId || 0), action: String(data.action || ""), createdAt: new Date() }
      db.adminLogs.push(l)
      return l
    },
  },
  ritual: {
    findMany: async ({ orderBy }: { orderBy?: { createdAt?: "asc" | "desc" } } = {}): Promise<Ritual[]> => {
      const arr = [...db.rituals]
      if (orderBy?.createdAt === "desc") arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      if (orderBy?.createdAt === "asc") arr.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      return arr
    },
    create: async ({ data }: { data: Partial<Ritual> }): Promise<Ritual> => {
      const r: Ritual = {
        id: db.counters.ritual++,
        title: String(data.title || ""),
        description: String(data.description || ""),
        category: data.category ?? null,
        level: typeof data.level === "number" ? data.level : 1,
        mediaUrl: data.mediaUrl ?? null,
        createdAt: new Date(),
      }
      db.rituals.push(r)
      return r
    },
  },
  ritualProgress: {
    upsert: async ({ where, update, create }: { where: { userId_ritualId: { userId: number; ritualId: number } }; update: Partial<RitualProgress>; create: Partial<RitualProgress> }): Promise<RitualProgress> => {
      const { userId, ritualId } = where.userId_ritualId
      const existing = db.ritualProgress.find((x) => x.userId === userId && x.ritualId === ritualId)
      if (existing) {
        Object.assign(existing, update)
        return existing
      }
      const rp: RitualProgress = {
        id: db.counters.rp++,
        userId,
        ritualId,
        completed: !!create.completed,
        completedAt: create.completed ? new Date() : null,
      }
      db.ritualProgress.push(rp)
      return rp
    },
    findFirst: async ({ where }: { where: { userId?: number; ritualId?: number } }): Promise<RitualProgress | null> => {
      const { userId, ritualId } = where
      return db.ritualProgress.find((x) => (typeof userId === "number" ? x.userId === userId : true) && (typeof ritualId === "number" ? x.ritualId === ritualId : true)) || null
    },
    update: async ({ where, data }: { where: { id: number }; data: Partial<RitualProgress> }): Promise<RitualProgress> => {
      const i = db.ritualProgress.findIndex((x) => x.id === where.id)
      if (i < 0) throw new Error("RitualProgress not found")
      db.ritualProgress[i] = { ...db.ritualProgress[i], ...data }
      return db.ritualProgress[i]
    },
    create: async ({ data }: { data: Partial<RitualProgress> }): Promise<RitualProgress> => {
      const rp: RitualProgress = {
        id: db.counters.rp++,
        userId: Number(data.userId || 0),
        ritualId: Number(data.ritualId || 0),
        completed: !!data.completed,
        completedAt: data.completed ? new Date() : null,
      }
      db.ritualProgress.push(rp)
      return rp
    },
  },
}
