import crypto from "crypto"

export function verifyTelegramInitData(initData: string, botToken: string) {
  try {
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get("hash") || ""
    urlParams.delete("hash")
    const dataCheckString = Array.from(urlParams.entries())
      .map(([k, v]) => `${k}=${v}`)
      .sort()
      .join("\n")

    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest()
    const calcHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")
    if (calcHash !== hash) return null

    const userStr = urlParams.get("user")
    const user = userStr ? JSON.parse(userStr) : null
    return user
  } catch {
    return null
  }
}

export function requireInitData(req: Request) {
  const header = req.headers.get("x-telegram-init-data")
  return header || null
}

