<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute, useRouter, withBase } from 'vitepress'
import { provideAnimatedAppearanceToggle } from '../appearanceTransition'
import { initImageViewer } from '../imageViewer'
import { initMermaid } from '../mermaid'
import { bindCatalogTransitions } from '../manual/motion'
import { applyWorld } from '../reading/world'
import ManualGrid from '../manual/ManualGrid.vue'
import ManualTopbar from '../manual/ManualTopbar.vue'
import ManualHome from '../manual/ManualHome.vue'
import ManualArticleFrame from '../manual/ManualArticleFrame.vue'
import ManualPalette from '../manual/ManualPalette.vue'
import ManualPeek from '../manual/ManualPeek.vue'
import ManualNotFound from '../manual/ManualNotFound.vue'
import ImageViewer from '../components/ImageViewer.vue'
// Kitten 404 scene, kept for later; re-enable together with the template line below.
// import SiteNotFound from '../components/SiteNotFound.vue'

const route = useRoute()
const router = useRouter()
const { frontmatter, page, isDark } = useData()
const palette = ref(false)
const paletteQuery = ref('')
const menuOpen = ref(false)
const scrollPositions: Record<string, number> = {}

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
  if (!link) {
    link = document.createElement('link')
    link.id = 'ey-katex'
    document.head.appendChild(link)
  } else {
    link.id = 'ey-katex'
  }
  if (apply) {
    link.rel = 'stylesheet'
    link.removeAttribute('as')
    link.href = href
    return
  }
  if (link.rel === 'stylesheet') return
  link.rel = 'preload'
  link.setAttribute('as', 'style')
  link.href = href
}

function onScroll() {
  scrollPositions[route.path] = window.scrollY
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
}

function openSearch(query = '') {
  paletteQuery.value = query
  palette.value = true
}

function onKey(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    palette.value = !palette.value
    return
  }
  if (event.key === '/' && !palette.value && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping(event.target)) {
    event.preventDefault()
    palette.value = true
  }
}

watch(
  () => !isHome.value && !missing.value,
  (need) => ensureKatex(need),
  { immediate: true },
)

onMounted(() => {
  applyWorld('manual')
  initImageViewer()
  stopTransitions = bindCatalogTransitions(router)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
  nextTick(() => initMermaid())
})

onUnmounted(() => {
  stopTransitions?.()
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
})

watch(() => route.path, () => {
  menuOpen.value = false
  palette.value = false
  nextTick(() => {
    const saved = scrollPositions[route.path]
    if (saved !== undefined) window.scrollTo(0, saved)
    initMermaid()
  })
})
</script>

<template>
  <div class="ey-shell">
    <ManualGrid />
    <ManualTopbar
      :menu-open="menuOpen"
      @search="openSearch()"
      @toggle-menu="menuOpen = !menuOpen"
      @close-menu="menuOpen = false"
    />
    <main class="ey-main">
      <!-- <SiteNotFound v-if="missing" /> -->
      <ManualNotFound v-if="missing" @search="openSearch" />
      <ManualHome v-else-if="isHome" />
      <ManualArticleFrame v-else />
    </main>
    <Transition name="ey-pal" :duration="{ enter: 420, leave: 180 }">
      <ManualPalette v-if="palette" :initial="paletteQuery" @close="palette = false; paletteQuery = ''" />
    </Transition>
    <ManualPeek />
    <ImageViewer />
  </div>
</template>
