require('dotenv').config({ override: true })
const TelegramBot = require('node-telegram-bot-api')
const fs = require('fs')
const path = require('path')

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN')
  process.exit(1)
}

const bot = new TelegramBot(token, { polling: true })
const WEB_URL = process.env.APP_URL || 'https://santera-toxica.vercel.app/'
const IS_HTTPS = WEB_URL.startsWith('https://')
const ADMIN_USERNAME_RAW = process.env.ADMIN_USERNAME || '@alexeevich_tech'
const ADMIN_USERNAME = ADMIN_USERNAME_RAW.replace(/^@/, '').toLowerCase()
let ADMIN_USER_ID_MEM = (process.env.ADMIN_USER_ID || '').trim()
const ADMIN_GRANT_SECRET = (process.env.ADMIN_GRANT_SECRET || '').trim()
console.log('Bot started with APP_URL:', WEB_URL)

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  if (IS_HTTPS) {
    const keyboardRow = [{ text: 'Открыть WebApp', web_app: { url: WEB_URL } }]
    const opts = { reply_markup: { inline_keyboard: [keyboardRow] } }
    try {
      await bot.sendMessage(chatId, 'Добро пожаловать! Откройте веб-приложение:\nСвязь с админом: ' + ADMIN_USERNAME, opts)
    } catch {}
  } else {
    try {
      await bot.sendMessage(chatId, `Добро пожаловать! Ссылка: ${WEB_URL}\nСвязь с админом: ${ADMIN_USERNAME}`)
    } catch {}
  }
  if (IS_HTTPS) {
    try {
      await bot.setChatMenuButton({
        chatId,
        menuButton: { type: 'web_app', text: 'Открыть веб-приложение', web_app: { url: WEB_URL } },
      })
    } catch (e) {
      console.error('Failed to set chat menu button:', e?.message || e)
    }
  }
})

bot.on('message', async (msg) => {
  const text = msg.text || ''
  if (/^\s*\/start\s*$/i.test(text)) return
  const chatId = msg.chat.id
  if (IS_HTTPS) {
    const keyboardRow = [{ text: 'Открыть WebApp', web_app: { url: WEB_URL } }]
    const opts = { reply_markup: { inline_keyboard: [keyboardRow] } }
    try { await bot.sendMessage(chatId, 'Откройте веб-приложение:\nСвязь с админом: ' + ADMIN_USERNAME, opts) } catch {}
  } else {
    try { await bot.sendMessage(chatId, `Ссылка: ${WEB_URL}\nСвязь с админом: ${ADMIN_USERNAME}`) } catch {}
  }
})

function isAdmin(msg) {
  const username = (msg.from?.username || '').toLowerCase()
  const byName = ADMIN_USERNAME && username === ADMIN_USERNAME
  const byId = ADMIN_USER_ID_MEM && String(msg.from?.id) === String(ADMIN_USER_ID_MEM)
  return !!(byName || byId)
}

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id
  const base = WEB_URL.replace(/\/$/, '')
  const url = `${base}/admin`
  if (isAdmin(msg)) {
    if (IS_HTTPS) {
      const secret = process.env.ADMIN_GRANT_SECRET || ''
      const browserUrl = secret ? `${url}?secret=${encodeURIComponent(secret)}` : url
      const keyboardRow = [{ text: 'Открыть Админку', web_app: { url } }]
      const opts = { reply_markup: { inline_keyboard: [keyboardRow] } }
      try { await bot.sendMessage(chatId, `Админка:\nЕсли открываете в браузере: ${browserUrl}`, opts) } catch {}
    } else {
      try { await bot.sendMessage(chatId, `Админка: ${url}`) } catch {}
    }
  } else {
    try { await bot.sendMessage(chatId, 'Доступ запрещён') } catch {}
  }
})

bot.onText(/\/whoami/, async (msg) => {
  const chatId = msg.chat.id
  const username = msg.from?.username ? `@${msg.from.username}` : '(нет ника)'
  const userId = msg.from?.id
  const chatType = msg.chat?.type
  const adminByUser = ADMIN_USERNAME ? `ADMIN_USERNAME=${ADMIN_USERNAME_RAW}` : '(не задан)'
  const adminById = ADMIN_USER_ID_MEM ? `ADMIN_USER_ID=${ADMIN_USER_ID_MEM}` : '(не задан)'
  const text = `Вы: ${username}\nID: ${userId}\nchat.type: ${chatType}\n${adminByUser}\n${adminById}`
  try { await bot.sendMessage(chatId, text) } catch {}
})

bot.onText(/\/grant_admin(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id
  const provided = (match?.[1] || '').trim()
  if (!ADMIN_GRANT_SECRET) {
    try { await bot.sendMessage(chatId, 'Секрет не задан') } catch {}
    return
  }
  if (!provided || provided !== ADMIN_GRANT_SECRET) {
    try { await bot.sendMessage(chatId, 'Неверный секрет') } catch {}
    return
  }
  ADMIN_USER_ID_MEM = String(msg.from?.id)
  const envPath = path.join(__dirname, '.env')
  try {
    let content = ''
    try { content = fs.readFileSync(envPath, 'utf8') } catch {}
    if (content.includes('ADMIN_USER_ID=')) {
      content = content.replace(/ADMIN_USER_ID=.*?(\r?\n)/, `ADMIN_USER_ID=${ADMIN_USER_ID_MEM}$1`)
    } else {
      const nl = content.endsWith('\n') ? '' : '\n'
      content = content + nl + `ADMIN_USER_ID=${ADMIN_USER_ID_MEM}\n`
    }
    fs.writeFileSync(envPath, content, 'utf8')
    if (IS_HTTPS) {
      const base = WEB_URL.replace(/\/$/, '')
      const url = `${base}/admin`
      const secret = process.env.ADMIN_GRANT_SECRET || ''
      const browserUrl = secret ? `${url}?secret=${encodeURIComponent(secret)}` : url
      const keyboardRow = [{ text: 'Открыть Админку', web_app: { url } }]
      const opts = { reply_markup: { inline_keyboard: [keyboardRow] } }
      try { await bot.sendMessage(chatId, `Права выданы\nЕсли открываете в браузере: ${browserUrl}`, opts) } catch {}
    } else {
      try { await bot.sendMessage(chatId, 'Права выданы') } catch {}
    }
  } catch {
    try { await bot.sendMessage(chatId, 'Ошибка записи прав') } catch {}
  }
})

if (IS_HTTPS) {
  bot.setChatMenuButton({
    menuButton: { type: 'web_app', text: 'Открыть веб-приложение', web_app: { url: WEB_URL } },
  })
}
