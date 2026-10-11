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

interface SocialLink {
  icon: string | { svg: string }
  link: string
  ariaLabel?: string
  qrcode?: string
}
const socialLinks = computed(() => (theme.value.socialLinks || []) as SocialLink[])

const builtinIcons: Record<string, string> = {
  github: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  x: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
  discord: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>',
  youtube: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/></svg>',
  linkedin: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
}
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

function childOn(link?: string, siblings?: NavItem[]) {
  if (!link) return false
  const path = normPath(route.path)
  const target = normPath(link)
  if (path === target) return true

  const root = target.split('/').filter(Boolean)[0]
  if (!root) return false

  const sameRootSiblings = (siblings || []).filter((s) => {
    const sRoot = normPath(s.link).split('/').filter(Boolean)[0]
    return sRoot === root
  })

  if (sameRootSiblings.length <= 1) {
    return path.startsWith(`/${root}`)
  }

  const sidebar = (theme.value.sidebar || {}) as Record<string, any>
  const sectionKey = Object.keys(sidebar).find((k) => k.replace(/^\/|\/$/g, '') === root)
  const groups = sectionKey ? sidebar[sectionKey] : null
  if (Array.isArray(groups)) {
    for (const group of groups) {
      const links = (group.items || []).map((it: any) => normPath(it.link))
      if (links.includes(target) && links.includes(path)) {
        return true
      }
    }
  }
  return false
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
                  :class="{ on: childOn(child.link, item.items) }"
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
        <div v-if="socialLinks.length" class="ey-socials">
          <template v-for="sl in socialLinks" :key="sl.link + (sl.ariaLabel || '')">
            <!-- QR code popup -->
            <div v-if="sl.qrcode" class="ey-social-qr-wrap">
              <button
                type="button"
                class="ey-social-link ey-social-btn"
                :aria-label="sl.ariaLabel || '二维码'"
                :title="sl.ariaLabel || ''"
                v-html="typeof sl.icon === 'string' ? (builtinIcons[sl.icon] || sl.icon) : sl.icon.svg"
              />
              <div class="ey-qr-popup">
                <img :src="withBase(sl.qrcode)" :alt="sl.ariaLabel || '二维码'" />
                <span class="ey-qr-label">{{ sl.ariaLabel || '扫码关注' }}</span>
              </div>
            </div>
            <!-- Normal link -->
            <a
              v-else
              class="ey-social-link"
              :href="sl.link"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="sl.ariaLabel || (typeof sl.icon === 'string' ? sl.icon : '社交链接')"
              :title="sl.ariaLabel || (typeof sl.icon === 'string' ? sl.icon : '')"
              v-html="typeof sl.icon === 'string' ? (builtinIcons[sl.icon] || sl.icon) : sl.icon.svg"
            />
          </template>
        </div>
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
              :class="{ on: childOn(child.link, item.items) }"
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
