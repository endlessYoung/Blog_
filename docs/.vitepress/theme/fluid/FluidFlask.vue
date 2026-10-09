<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

interface Section {
  id: string
  title: string
}

const route = useRoute()
const { frontmatter } = useData()
const active = ref(false)
const level = ref(0)
const title = ref('正文')
const left = ref('剩余 1 分钟')
const sections = ref<Section[]>([])
const current = ref(0)
let minutes = 1

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function measure() {
  const home = frontmatter.value.layout === 'home'
  const doc = document.querySelector('.vp-doc')
  const heads = [...document.querySelectorAll<HTMLElement>('.vp-doc h2')]
  if (!doc || home) {
    active.value = false
    return
  }
  const text = doc.textContent || ''
  const cjk = (text.match(/[一-鿿]/g) || []).length
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length
  minutes = Math.max(1, Math.round((cjk + latin) / 400))
  sections.value = heads.map((head, index) => ({
    id: head.id || `fl-sec-${index}`,
    title: head.textContent?.replace(/#$/, '').trim() || `第 ${index + 1} 节`,
  }))
  active.value = true
  update()
}

function update() {
  if (!active.value) return
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const progress = Math.min(1, Math.max(0, window.scrollY / max))
  level.value = progress
  let index = 0
  document.querySelectorAll<HTMLElement>('.vp-doc h2').forEach((head, i) => {
    if (head.getBoundingClientRect().top < window.innerHeight * 0.42) index = i
  })
  current.value = index
  title.value = sections.value[index]?.title || '正文'
  const remain = Math.max(0, Math.ceil(minutes * (1 - progress)))
  left.value = progress > 0.97 ? '已读完' : `剩余 ${Math.max(1, remain)} 分钟`
}

function jump(section: Section) {
  const el = document.getElementById(section.id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 88
  window.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' })
}

function top() {
  window.scrollTo({ top: 0, behavior: reduced() ? 'auto' : 'smooth' })
}

watch(() => route.path, () => {
  requestAnimationFrame(() => requestAnimationFrame(measure))
}, { immediate: true })

if (typeof window !== 'undefined') window.addEventListener('scroll', update, { passive: true })
onUnmounted(() => window.removeEventListener('scroll', update))
</script>

<template>
  <div v-show="active" class="fl-flask" :style="{ '--level': level }">
    <button class="fl-orb" type="button" aria-label="回到顶部" @click="top">
      <i class="liq" />
      <i class="liq l2" />
      <span>{{ Math.round(level * 100) }}%</span>
    </button>
    <div class="fl-flask-info">
      <b>{{ title }}</b>
      <span>{{ left }}</span>
      <div class="fl-dots">
        <button
          v-for="(section, index) in sections"
          :key="section.id"
          type="button"
          class="f-dot"
          :class="{ passed: index < current, now: index === current }"
          :aria-label="`跳到 ${section.title}`"
          @click="jump(section)"
        ><i /></button>
      </div>
    </div>
  </div>
</template>
