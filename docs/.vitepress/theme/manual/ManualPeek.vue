<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'
import { buildManualCatalog } from '../reading/catalog'
import { articleHit, pageMeta } from '../reading/corpus'

const { theme } = useData()
const parts = computed(() => buildManualCatalog(theme.value.sidebar))
const open = ref(false)
const x = ref(0)
const y = ref(0)
const num = ref('')
const title = ref('')
const detail = ref('')

function show(event: PointerEvent, path: string) {
  const hit = articleHit(parts.value, path)
  if (!hit) {
    open.value = false
    return
  }
  const meta = pageMeta(hit.article.link)
  num.value = hit.article.num
  title.value = hit.article.title
  detail.value = `${hit.part.name} · ${hit.chapter.name}${meta?.updated ? ` · ${meta.updated}` : ''}`
  const width = 300
  x.value = Math.min(event.clientX + 16, window.innerWidth - width - 12)
  y.value = Math.min(event.clientY + 16, window.innerHeight - 140)
  open.value = true
}

let current: Element | null = null

function close() {
  current = null
  open.value = false
}

function onOver(event: PointerEvent) {
  const node = event.target instanceof Element ? event.target : null
  const host = node?.closest('.manual-home, .vp-doc, .terms, .log')
  const link = node?.closest('a')
  if (!host || !link) {
    close()
    return
  }
  if (link === current) return
  const path = link.getAttribute('data-path') || link.getAttribute('href') || ''
  if (!path || path.startsWith('http') || path.startsWith('mailto:')) {
    close()
    return
  }
  current = link
  show(event, path)
}

function onOut(event: PointerEvent) {
  const next = event.relatedTarget instanceof Element ? event.relatedTarget : null
  if (next?.closest('a')) return
  close()
}

onMounted(() => {
  document.addEventListener('pointerover', onOver)
  document.addEventListener('pointerout', onOut)
})
onUnmounted(() => {
  document.removeEventListener('pointerover', onOver)
  document.removeEventListener('pointerout', onOut)
})
</script>

<template>
  <div v-if="open" class="ey-peek" :style="{ left: `${x}px`, top: `${y}px` }">
    <div class="mono">{{ num }}</div>
    <h5>{{ title }}</h5>
    <p>{{ detail }}</p>
  </div>
</template>
