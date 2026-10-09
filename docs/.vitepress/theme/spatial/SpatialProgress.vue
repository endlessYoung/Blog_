<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { installSprings, LiveSpring, reducedMotion } from './spring'

interface Section {
  id: string
  title: string
}

const route = useRoute()
const active = ref(false)
const open = ref(false)
const title = ref('正文')
const left = ref('剩余 1 分钟')
const sections = ref<Section[]>([])
const current = ref(0)
const ring = ref<SVGCircleElement | null>(null)
let minutes = 1
let spring: LiveSpring | null = null
const RING = 94.2

function measure() {
  if (typeof document === 'undefined') return
  const doc = document.querySelector('.vp-doc')
  const heads = [...document.querySelectorAll<HTMLElement>('.vp-doc h2')]
  if (!doc || route.path === '/' || document.documentElement.classList.contains('manual')) {
    active.value = false
    return
  }
  const text = doc.textContent || ''
  const cjk = (text.match(/[一-鿿]/g) || []).length
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length
  minutes = Math.max(1, Math.round((cjk + latin) / 400))
  sections.value = heads.map((head, index) => ({
    id: head.id || `sp-sec-${index}`,
    title: head.textContent?.replace(/#$/, '').trim() || `第 ${index + 1} 节`,
  }))
  if (!sections.value.length) sections.value = [{ id: 'start', title: '正文' }]
  active.value = true
  update()
}

function update() {
  if (!active.value) return
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const progress = Math.min(1, Math.max(0, window.scrollY / max))
  spring?.to(progress)
  let index = 0
  document.querySelectorAll<HTMLElement>('.vp-doc h2').forEach((head, i) => {
    if (head.getBoundingClientRect().top < window.innerHeight * 0.42) index = i
  })
  current.value = index
  title.value = sections.value[index]?.title || '正文'
  left.value = progress > 0.97 ? '已读完' : `剩余 ${Math.max(1, Math.ceil(minutes * (1 - progress)))} 分钟`
}

function jump(section: Section) {
  const el = document.getElementById(section.id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 88
  window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' })
  open.value = false
}

watch(() => route.path, () => {
  open.value = false
  requestAnimationFrame(() => requestAnimationFrame(measure))
}, { immediate: true })

installSprings()
spring = new LiveSpring(0, 'gentle', (value) => {
  if (!ring.value) return
  ring.value.style.strokeDashoffset = String(RING * (1 - Math.min(1, Math.max(0, value))))
}, 0.001)

if (typeof window !== 'undefined') window.addEventListener('scroll', update, { passive: true })
onUnmounted(() => {
  window.removeEventListener('scroll', update)
  spring?.stop()
})
</script>

<template>
  <div v-show="active" class="sp-progress">
    <div v-show="open" class="sp-sheet">
      <button
        v-for="(section, index) in sections"
        :key="section.id"
        type="button"
        :class="{ cur: index === current }"
        @click="jump(section)"
      >
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        {{ section.title }}
      </button>
    </div>
    <button class="sp-pill" type="button" :aria-expanded="open" @click="open = !open">
      <svg class="sp-ring" viewBox="0 0 36 36" aria-hidden="true">
        <circle class="bg" cx="18" cy="18" r="15" />
        <circle ref="ring" class="fg" cx="18" cy="18" r="15" stroke-dasharray="94.2" stroke-dashoffset="94.2" />
      </svg>
      <span class="sp-sec">{{ title }}</span>
      <span class="sp-left">{{ left }}</span>
    </button>
  </div>
</template>
