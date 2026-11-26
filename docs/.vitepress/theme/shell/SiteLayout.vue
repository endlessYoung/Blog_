<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute, useRouter, withBase } from 'vitepress'
import { prefetchKatex, prefetchPage } from '../reading/prefetch'
import { provideAnimatedAppearanceToggle } from '../appearanceTransition'
import { initImageViewer } from '../imageViewer'
import { initMermaid } from '../mermaid'
import { bindCatalogTransitions } from '../manual/motion'
import { applyWorld } from '../reading/world'
import { normPath } from '../reading/catalog'
import { hydrateReadUpdates, useRecentWeekUpdates } from '../reading/updates'
import ManualGrid from '../manual/ManualGrid.vue'
import ManualTopbar from '../manual/ManualTopbar.vue'
import ManualHome from '../manual/ManualHome.vue'
import ManualArticleFrame from '../manual/ManualArticleFrame.vue'
import ManualPalette from '../manual/ManualPalette.vue'
import ManualUpdatesPanel from '../manual/ManualUpdatesPanel.vue'
import ManualPeek from '../manual/ManualPeek.vue'
import ImageViewer from '../components/ImageViewer.vue'
// Kitten 404 scene, kept for later; re-enable together with the template line below.
// import SiteNotFound from '../components/SiteNotFound.vue'

const route = useRoute()
const router = useRouter()
const { frontmatter, page, isDark } = useData()
const palette = ref(false)
const paletteQuery = ref('')
const updatesOpen = ref(false)
const mounted = ref(false)
const menuOpen = ref(false)
const previousPath = ref<string>()
const scrollPositions: Record<string, number> = {}

const { unreadEntries, markRead } = useRecentWeekUpdates()
const unreadCount = computed(() => (mounted.value ? Math.min(99, unreadEntries.value.length) : 0))

function markCurrentRouteRead(path: string) {
  if (!mounted.value) return
  const norm = normPath(path)
  const hit = unreadEntries.value.find((entry) => normPath(entry.page.url) === norm)
  if (hit) markRead(hit.page.url, hit.date)
}

const isHome = computed(() => frontmatter.value.layout === 'home')
const missing = computed(() => !!page.value.isNotFound || frontmatter.value.pageClass === 'site-not-found')

provideAnimatedAppearanceToggle(
  isDark,
  () => !!page.value.isNotFound || frontmatter.value.pageClass === 'site-not-found',
)

let stopTransitions: (() => void) | undefined

function ensureKatex(apply: boolean) {
  if (typeof document === 'undefined') return
  const href = withBase('/katex.min.css')
  let link = document.getElementById('ey-katex') as HTMLLinkElement | null
    ?? document.querySelector<HTMLLinkElement>('link[href*="katex.min.css"]')
  if (!apply) return
  if (!link) {
    link = document.createElement('link')
    link.id = 'ey-katex'
    document.head.appendChild(link)
  } else {
    link.id = 'ey-katex'
  }
  link.rel = 'stylesheet'
  link.removeAttribute('as')
  link.href = href
}

function onScroll() {
  scrollPositions[route.path] = window.scrollY
}

function onPointerOver(event: PointerEvent) {
  const link = event.target instanceof Element ? event.target.closest('a') : null
  if (!link || link.target === '_blank') return
  prefetchPage(link.getAttribute('href'))
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

function openSearch(query = '') {
  updatesOpen.value = false
  paletteQuery.value = query
  palette.value = true
}

function openUpdates() {
  palette.value = false
  menuOpen.value = false
  updatesOpen.value = !updatesOpen.value
}

function onKey(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    updatesOpen.value = false
    palette.value = !palette.value
    return
  }
  if (event.key === '/' && !palette.value && !updatesOpen.value && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping(event.target)) {
    event.preventDefault()
    palette.value = true
    return
  }
  if (event.shiftKey && event.key.toLowerCase() === 'u' && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping(event.target)) {
    event.preventDefault()
    openUpdates()
  }
}

watch(
  () => !isHome.value && !missing.value,
  (need) => ensureKatex(need),
  { immediate: true },
)

onMounted(() => {
  applyWorld('manual')
  hydrateReadUpdates()
  mounted.value = true
  markCurrentRouteRead(route.path)
  initImageViewer()
  stopTransitions = bindCatalogTransitions(router)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerover', onPointerOver, { passive: true })
  nextTick(() => initMermaid())
  const idle = window.requestIdleCallback || ((cb: () => void) => window.setTimeout(cb, 1))
  idle(() => { if (isHome.value) prefetchKatex() })
})

onUnmounted(() => {
  stopTransitions?.()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerover', onPointerOver)
})

watch(() => route.path, (to, from) => {
  previousPath.value = from
  menuOpen.value = false
  palette.value = false
  updatesOpen.value = false
  markCurrentRouteRead(to)
  nextTick(() => {
    const saved = scrollPositions[route.path]
    window.scrollTo(0, saved !== undefined ? saved : 0)
    initMermaid()
  })
})
</script>

<template>
  <div class="ey-shell">
    <ManualGrid />
    <ManualTopbar
      :menu-open="menuOpen"
      :updates-open="updatesOpen"
      :unread-count="unreadCount"
      @search="openSearch()"
      @updates="openUpdates()"
      @toggle-menu="menuOpen = !menuOpen"
      @close-menu="menuOpen = false"
    />
    <main class="ey-main">
      <!-- <SiteNotFound v-if="missing" /> -->
      <ManualNotFound v-if="missing" @search="openSearch" />
      <ManualHome v-else-if="isHome" :previous-path="previousPath" :unread-count="unreadCount" @open-updates="openUpdates()" />
      <ManualArticleFrame v-else />
    </main>
    <Transition name="ey-pal" :duration="{ enter: 420, leave: 180 }">
      <ManualPalette v-if="palette" :initial="paletteQuery" @close="palette = false; paletteQuery = ''" />
    </Transition>
    <Transition name="ey-upd">
      <ManualUpdatesPanel v-if="updatesOpen" @close="updatesOpen = false" />
    </Transition>
    <ManualPeek />
    <ImageViewer />
  </div>
</template>

<style scoped>
.ey-upd-enter-active {
  transition: opacity 260ms var(--man-ease);
}
.ey-upd-leave-active {
  transition: opacity 200ms ease-in;
}
.ey-upd-enter-active :deep(.ey-upd-drawer) {
  transition: transform 380ms var(--man-ease);
}
.ey-upd-leave-active :deep(.ey-upd-drawer) {
  transition: transform 220ms cubic-bezier(.7, 0, .84, 0);
}
.ey-upd-enter-from,
.ey-upd-leave-to {
  opacity: 0;
}
.ey-upd-enter-from :deep(.ey-upd-drawer),
.ey-upd-leave-to :deep(.ey-upd-drawer) {
  transform: translateX(100%);
}
</style>
