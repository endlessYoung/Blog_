import { ref } from 'vue'

export type World = 'manual' | 'spatial' | 'fluid'

const KEY = 'ey-world'

export const world = ref<World>('manual')

export function readWorld(): World {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === 'spatial' || stored === 'fluid') return stored
    return 'manual'
  } catch {
    return 'manual'
  }
}

export function applyWorld(next: World) {
  world.value = next
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('manual', next === 'manual')
  root.classList.toggle('spatial', next === 'spatial')
  root.classList.toggle('fluid', next === 'fluid')
  root.classList.remove('reading', 'no-webgl', 'intro')
  root.dataset.eyWorld = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* ignore */
  }
}

export function initWorld() {
  applyWorld(typeof localStorage === 'undefined' ? 'manual' : readWorld())
}
