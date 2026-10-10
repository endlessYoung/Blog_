<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { normPath } from '../reading/catalog'
import { prefetchHrefs } from '../reading/prefetch'
import { readAccent, writeAccent } from './motion'

const props = defineProps<{ menuOpen: boolean }>()
const emit = defineEmits<{
  search: []
  toggleMenu: []
  closeMenu: []
}>()

const { theme } = useData()
const route = useRoute()

interface NavItem {
  text?: string
  link?: string
  items?: NavItem[]
}

const items = computed(() => (theme.value.nav || []) as NavItem[])
const drop = ref<number | null>(null)
const navEl = ref<HTMLElement | null>(null)
let timer = 0
let hoverAt = 0

function idx(n: number) {
  return String(n + 1).padStart(2, '0')
}

function on(link?: string) {
  if (!link) return false
  const path = normPath(route.path)
  const target = normPath(link)
  const root = target.split('/').filter(Boolean)[0]
  return root ? path.startsWith(`/${root}`) : path === target
}

function groupOn(item: NavItem) {
  return !!item.items?.some((child) => on(child.link))
}

function hoverOpen(i: number) {
  clearTimeout(timer)
  timer = window.setTimeout(() => {
    drop.value = i
    hoverAt = performance.now()
    const hrefs = items.value[i]?.items?.map((child) => withBase(child.link || '/')) || []
    prefetchHrefs(hrefs, hrefs.length)
  }, drop.value === null ? 80 : 0)
}

function hoverClose() {
  clearTimeout(timer)
  timer = window.setTimeout(() => { drop.value = null }, 160)
}

function toggleDrop(i: number) {
  clearTimeout(timer)
  if (drop.value === i && performance.now() - hoverAt < 600) return
  drop.value = drop.value === i ? null : i
  hoverAt = 0
}

function onPointer(event: PointerEvent) {
  if (drop.value !== null && navEl.value && !navEl.value.contains(event.target as Node)) drop.value = null
}

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  drop.value = null
  if (props.menuOpen) emit('closeMenu')
}

function toggleAccent() {
  writeAccent(readAccent() === 'blue' ? 'orange' : 'blue')
}

const toggleAppearance = inject<(() => void) | undefined>('toggle-appearance', undefined)

watch(() => route.path, () => { drop.value = null })
watch(() => props.menuOpen, (open) => {
  document.documentElement.classList.toggle('ey-locked', open)
})

let wide: MediaQueryList | undefined
function onWide(event: MediaQueryListEvent) {
  if (event.matches && props.menuOpen) emit('closeMenu')
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointer)
  window.addEventListener('keydown', onKey)
  wide = window.matchMedia('(min-width: 901px)')
  wide.addEventListener('change', onWide)
})
onUnmounted(() => {
  clearTimeout(timer)
  wide?.removeEventListener('change', onWide)
  document.removeEventListener('pointerdown', onPointer)
  window.removeEventListener('keydown', onKey)
  document.documentElement.classList.remove('ey-locked')
})
</script>

<template>
  <header class="ey-topbar" :class="{ open: menuOpen }">
    <div class="wrap ey-topbar-inner">
      <a class="ey-brand" :href="withBase('/')" @click="emit('closeMenu')">
        <span class="ey-brand-mark">EY</span>
        <span class="ey-brand-text">ENDLESSYOUNG<span class="ey-brand-sub">/ MANUAL</span></span>
      </a>

      <nav ref="navEl" class="ey-nav" aria-label="栏目">
        <template v-for="(item, i) in items" :key="item.text">
          <div
            v-if="item.items?.length"
            class="ey-nav-group"
            @mouseenter="hoverOpen(i)"
            @mouseleave="hoverClose"
          >
            <button
              type="button"
              class="ey-nav-link"
              :class="{ on: groupOn(item), open: drop === i }"
              :aria-expanded="drop === i"
              @click="toggleDrop(i)"
            >
              <span class="ey-nav-idx">{{ idx(i) }}</span>{{ item.text }}<span class="ey-caret" />
            </button>
            <Transition name="ey-drop" :duration="{ enter: 560, leave: 160 }">
              <div v-if="drop === i" class="ey-drop">
                <div class="ey-drop-label">
                  <span>{{ item.text }}</span><span>{{ item.items.length }} 栏</span>
                </div>
                <a
                  v-for="(child, j) in item.items"
                  :key="child.link"
                  class="ey-drop-row"
                  :class="{ on: on(child.link) }"
                  :style="{ '--i': j }"
                  :href="withBase(child.link || '/')"
                >
                  <span class="ey-drop-idx">{{ idx(i) }}.{{ j + 1 }}</span>
                  <span class="ey-drop-text">{{ child.text }}</span>
                  <span class="ey-drop-arrow">→</span>
                </a>
              </div>
            </Transition>
          </div>
          <a
            v-else
            class="ey-nav-link"
            :class="{ on: on(item.link) }"
            :href="withBase(item.link || '/')"
          ><span class="ey-nav-idx">{{ idx(i) }}</span>{{ item.text }}</a>
        </template>
      </nav>

      <div class="ey-tools">
        <button class="ey-search" type="button" title="搜索（/ 或 Ctrl K）" @click="emit('search')">
          <span class="ey-search-glyph" />
          <span>搜索</span><kbd>/</kbd>
        </button>
        <div class="ey-switch">
          <button type="button" aria-label="切换强调色" title="切换强调色" @click="toggleAccent">
            <span class="ey-accent-dot" />
          </button>
          <button type="button" aria-label="切换明暗" title="切换明暗" @click="toggleAppearance?.()">
            <span class="ey-theme-glyph" />
          </button>
        </div>
        <button
          class="ey-menu"
          :class="{ open: menuOpen }"
          type="button"
          :aria-label="menuOpen ? '关闭栏目' : '打开栏目'"
          :aria-expanded="menuOpen"
          @click="emit('toggleMenu')"
        ><i /><i /></button>
      </div>
    </div>
  </header>

  <Transition name="ey-sheet" :duration="{ enter: 860, leave: 220 }">
    <nav v-if="menuOpen" class="ey-nav-screen" aria-label="栏目">
      <div class="wrap ey-sheet-inner">
        <template v-for="(item, i) in items" :key="`m-${item.text}`">
          <section v-if="item.items?.length" class="ey-sheet-group" :style="{ '--i': i }">
            <div class="ey-sheet-label"><span>{{ idx(i) }}</span><span>{{ item.text }}</span></div>
            <a
              v-for="(child, j) in item.items"
              :key="child.link"
              class="ey-sheet-link sub"
              :class="{ on: on(child.link) }"
              :href="withBase(child.link || '/')"
              @click="emit('closeMenu')"
            ><span class="ey-sheet-idx">{{ idx(i) }}.{{ j + 1 }}</span><span>{{ child.text }}</span></a>
          </section>
          <a
            v-else
            class="ey-sheet-link"
            :class="{ on: on(item.link) }"
            :style="{ '--i': i }"
            :href="withBase(item.link || '/')"
            @click="emit('closeMenu')"
          ><span class="ey-sheet-idx">{{ idx(i) }}</span><span>{{ item.text }}</span></a>
        </template>
        <div class="ey-sheet-foot"><span>ENDLESSYOUNG / MANUAL</span><span>{{ items.length }} 栏目</span></div>
      </div>
    </nav>
  </Transition>
</template>
