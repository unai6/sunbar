import { isTauri } from '@tauri-apps/api/core'
import { BBOX_CACHE_TTL_MS, useVenuesStore, type BboxCacheEntry } from '~/stores/venues'

export default defineNuxtPlugin(() => {
  if (!isTauri()) return

  try {
    const raw = localStorage.getItem('sunbar_bbox_cache')
    if (!raw) return

    const parsed = JSON.parse(raw) as Record<string, BboxCacheEntry>
    const now = Date.now()
    const store = useVenuesStore()

    store.bboxCache = Object.fromEntries(
      Object.entries(parsed).filter(([, entry]) => now - entry.fetchedAt < BBOX_CACHE_TTL_MS)
    )
  } catch {}
})
