import { onMounted, onUnmounted, ref } from 'vue'
import { findManualArticle, normPath, type ManualPart } from './catalog'

export const RETURN_PREPARE = 'ey-return-prepare'

export function useReturnLanding(
  parts: () => ManualPart[],
  storageKey: string,
  returnedEvent: string,
  previousPath?: () => string | undefined,
) {
  const openId = ref<string | null>(null)
  const categoryRoot = ref<string | null>(null)
  const returnedPath = ref<string | null>(null)
  const landingPath = ref<string | null>(null)

  function readPending() {
    try { return sessionStorage.getItem(storageKey) } catch { return null }
  }

  function apply(path: string | null, sparse: boolean) {
    if (!path) return false
    const hit = findManualArticle(parts(), path)
    if (!hit) return false
    openId.value = hit.part.id
    categoryRoot.value = hit.chapter.root
    returnedPath.value = normPath(hit.article.link)
    landingPath.value = sparse ? returnedPath.value : null
    return true
  }

  function prime() {
    if (typeof document === 'undefined') return
    const sparse = document.documentElement.classList.contains('vt-back')
    const from = previousPath?.()
    if (sparse || from) apply(readPending() || from || null, sparse)
  }

  prime()

  function onPrepare(event: Event) {
    apply((event as CustomEvent<string>).detail, true)
  }

  function onReturned() {
    landingPath.value = null
    try { sessionStorage.removeItem(storageKey) } catch { /* ignore */ }
  }

  onMounted(() => {
    if (document.documentElement.classList.contains('vt-back')) {
      window.addEventListener(RETURN_PREPARE, onPrepare)
      window.addEventListener(returnedEvent, onReturned, { once: true })
      return
    }
    if (apply(readPending() || previousPath?.() || null, false)) onReturned()
  })

  onUnmounted(() => {
    window.removeEventListener(RETURN_PREPARE, onPrepare)
    window.removeEventListener(returnedEvent, onReturned)
  })

  function showArticles(partId: string) {
    return openId.value === partId
  }

  function isSpacer(link: string) {
    return !!landingPath.value && normPath(link) !== landingPath.value
  }

  return { openId, categoryRoot, returnedPath, landingPath, showArticles, isSpacer }
}
