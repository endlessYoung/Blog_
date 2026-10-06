<template>
  <nav class="ey-outline" aria-label="本页内容大纲" v-if="headers.length > 0">
    <div class="ey-outline__title">
      <span class="ey-outline__icon" aria-hidden="true">§</span>
      本页大纲
    </div>
    <ul class="ey-outline__list" role="list">
      <li
        v-for="h in headers"
        :key="h.slug"
        class="ey-outline__item"
        :class="[`ey-outline__item--lvl-${h.level}`, { 'ey-outline__item--active': activeSlug === h.slug }]"
      >
        <a :href="`#${h.slug}`" class="ey-outline__link" @click="handleScrollTo(h.slug, $event)">
          {{ h.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface HeaderItem {
  level: number
  title: string
  slug: string
}

const headers = ref<HeaderItem[]>([])
const activeSlug = ref('')

function extractHeaders() {
  if (typeof document === 'undefined') return
  const elements = Array.from(document.querySelectorAll('.vp-doc h2, .vp-doc h3, .ey-prose h2, .ey-prose h3'))
  headers.value = elements.map((el) => {
    return {
      level: parseInt(el.tagName[1], 10),
      title: el.textContent?.trim() || '',
      slug: el.id,
    }
  }).filter((h) => h.title && h.slug)
}

function updateActiveHeader() {
  if (typeof document === 'undefined' || headers.value.length === 0) return
  const scrollPos = window.scrollY + 120

  for (let i = headers.value.length - 1; i >= 0; i--) {
    const el = document.getElementById(headers.value[i].slug)
    if (el && el.offsetTop <= scrollPos) {
      activeSlug.value = headers.value[i].slug
      return
    }
  }
  if (headers.value[0]) {
    activeSlug.value = headers.value[0].slug
  }
}

function handleScrollTo(slug: string, e: MouseEvent) {
  e.preventDefault()
  const el = document.getElementById(slug)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    history.replaceState(null, '', `#${slug}`)
    activeSlug.value = slug
  }
}

onMounted(() => {
  setTimeout(() => {
    extractHeaders()
    updateActiveHeader()
  }, 100)
  window.addEventListener('scroll', updateActiveHeader, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveHeader)
})
</script>

<style scoped>
.ey-outline {
  font-size: var(--ey-text-sm, 13px);
  padding-left: var(--ey-space-4, 16px);
  border-left: var(--ey-border-width, 1px) solid var(--ey-line);
}

.ey-outline__title {
  display: flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  letter-spacing: var(--ey-tracking-wide);
  color: var(--ey-fg-3);
  text-transform: uppercase;
  margin-bottom: var(--ey-space-3, 12px);
  font-weight: 600;
}

.ey-outline__icon {
  color: var(--ey-accent);
}

.ey-outline__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ey-space-2, 8px);
}

.ey-outline__item--lvl-3 {
  padding-left: var(--ey-space-3, 12px);
}

.ey-outline__link {
  color: var(--ey-fg-3);
  text-decoration: none;
  line-height: var(--ey-leading-tight);
  display: inline-block;
  transition: color var(--ey-dur-fast);
  word-break: break-word;
}

.ey-outline__link:hover {
  color: var(--ey-fg);
}

.ey-outline__item--active .ey-outline__link {
  color: var(--ey-accent);
  font-weight: 600;
}
</style>
