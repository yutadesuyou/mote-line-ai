// 1日の無料使用回数を管理するユーティリティ
// データはlocalStorageに保存（サーバー不要）

const STORAGE_KEY = 'mote_line_usage'
const FREE_LIMIT = 3

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function getUsageData() {
  if (typeof window === 'undefined') return { count: 0, date: getTodayKey() }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { count: 0, date: getTodayKey() }
    const data = JSON.parse(raw)
    // 日付が変わったらリセット
    if (data.date !== getTodayKey()) {
      return { count: 0, date: getTodayKey() }
    }
    return data
  } catch {
    return { count: 0, date: getTodayKey() }
  }
}

export function incrementUsage() {
  const data = getUsageData()
  const next = { count: data.count + 1, date: getTodayKey() }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next.count
}

export function getRemainingFree() {
  const data = getUsageData()
  return Math.max(0, FREE_LIMIT - data.count)
}

export function canUseFree() {
  return getUsageData().count < FREE_LIMIT
}

export const FREE_DAILY_LIMIT = FREE_LIMIT
