import { computed, ref } from 'vue'
import { normPath } from './catalog'
import { recentUpdates, type UpdateEntry } from './corpus'

const STORAGE_KEY = 'ey-updates-read-v1'
const WINDOW_DAYS = 7

/** normPath(url) -> read date (YYYY-MM-DD). If article is updated on a newer date, it reappears. */
const readMap = ref<Record<string, string>>({})
let hydrated = false

function daysAgo(dateStr: string): number {
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const target = Date.parse(`${dateStr}T00:00:00Z`)
  if (Number.isNaN(target)) return Number.POSITIVE_INFINITY
  return Math.floor((today - target) / 86_400_000)
}

function saveReadMap() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readMap.value))
  } catch {
    /* ignore storage errors */
  }
}

export function hydrateReadUpdates() {
  if (hydrated || typeof localStorage === 'undefined') return
  hydrated = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        readMap.value = parsed as Record<string, string>
      }
    }
  } catch {
    /* ignore malformed cache */
  }
}

export function isWithinWeek(dateStr: string): boolean {
  return daysAgo(dateStr) <= WINDOW_DAYS
}

export function isToday(dateStr: string): boolean {
  return daysAgo(dateStr) <= 0
}

export function useRecentWeekUpdates() {
  const weekAll = computed<UpdateEntry[]>(() =>
    recentUpdates(120).filter((entry) => isWithinWeek(entry.date)),
  )

  const unreadEntries = computed<UpdateEntry[]>(() => {
    const map = readMap.value
    return weekAll.value.filter((entry) => {
      const seenDate = map[normPath(entry.page.url)]
      return !seenDate || entry.date > seenDate
    })
  })

  const readCount = computed(() => Math.max(0, weekAll.value.length - unreadEntries.value.length))

  function markRead(url: string, date: string) {
    const key = normPath(url)
    if (readMap.value[key] === date) return
    readMap.value = { ...readMap.value, [key]: date }
    saveReadMap()
  }

  function markAllRead() {
    const next = { ...readMap.value }
    for (const entry of unreadEntries.value) {
      next[normPath(entry.page.url)] = entry.date
    }
    readMap.value = next
    saveReadMap()
  }

  function resetRead() {
    readMap.value = {}
    saveReadMap()
  }

  return {
    weekAll,
    unreadEntries,
    readCount,
    markRead,
    markAllRead,
    resetRead,
  }
}
