<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

interface Tick {
  id: string
  title: string
  pct: number
  y: number
}

const SPACING = 22
// A heading becomes current once its top crosses this line (px below the viewport top).
const LINE = 96
const route = useRoute()
const show = ref(false)
const dense = ref(false)
const left = ref(0)
const ticks = ref<Tick[]>([])
const cursor = ref(0)
const current = ref(0)
const remain = ref(0)
const track = ref<HTMLElement | null>(null)
let heads: HTMLElement[] = []
let minutes = 1
let frame = 0
let observer: ResizeObserver | null = null
let observed: Element | null = null

const clamp = (v: number) => Math.min(1, Math.max(0, v))

function maxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
}

// Scroll offsets at which each heading becomes current. Headings too close to
// the end to ever reach LINE are spread over the remaining scroll range.
function activations() {
  const max = maxScroll()
  const raw = heads.map((el) => el.getBoundingClientRect().top + window.scrollY - LINE)
  let reach = -1
  raw.forEach((v, i) => { if (v <= max) reach = i })
  const base = reach >= 0 ? Math.max(0, raw[reach]) : 0
  const rest = raw.length - 1 - reach
  return raw.map((v, i) => (i <= reach
    ? Math.max(0, v)
    : base + (max - base) * ((i - reach) / (rest + (reach >= 0 ? 0 : 1)))))
}

function measure() {
  const body = document.querySelector<HTMLElement>('.m-article .a-body')
  const prose = document.querySelector<HTMLElement>('.m-prose')
  heads = prose ? [...prose.querySelectorAll<HTMLElement>('h2')] : []
  if (!body || !prose || window.innerWidth < 1100 || !heads.length) {
    show.value = false
    return
  }
  if (observer && observed !== prose) {
    observer.disconnect()
    observer.observe(prose)
    observed = prose
  }
  left.value = body.getBoundingClientRect().left
  const text = prose.innerText || ''
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length
  minutes = Math.max(1, Math.round((cjk + latin) / 400))
  show.value = true
  nextTick(() => {
    const height = track.value?.clientHeight || 600
    const max = maxScroll()
    const acts = activations()
    const list = heads.map((el, i) => {
      const pct = clamp(acts[i] / max)
      return {
        id: el.id || `sec-${i}`,
        title: (el.textContent || '').replace(/[\u200b#]/g, '').trim(),
        pct,
        y: pct * height,
      }
    })
    dense.value = list.length * SPACING > height
    if (!dense.value) {
      for (let i = 1; i < list.length; i++) list[i].y = Math.max(list[i].y, list[i - 1].y + SPACING)
      for (let i = list.length - 1; i >= 0; i--) {
        list[i].y = Math.min(list[i].y, height - (list.length - 1 - i) * SPACING)
      }
    }
    ticks.value = list
    update()
  })
}

// The cursor is interpolated between neighbouring ticks, so it sits exactly on
// a tick at the moment that section becomes current.
function update() {
  const list = ticks.value
  if (!show.value || !list.length || list.length !== heads.length) return
  const height = track.value?.clientHeight || 0
  const max = maxScroll()
  const y = Math.min(window.scrollY, max)
  const acts = activations()
  let index = -1
  acts.forEach((a, i) => { if (y >= a - 1) index = i })
  let pos: number
  if (index < 0) {
    pos = list[0].y * clamp(acts[0] > 0 ? y / acts[0] : 1)
  } else if (index < list.length - 1) {
    const from = acts[index]
    const to = acts[index + 1]
    pos = list[index].y + (list[index + 1].y - list[index].y) * clamp(to > from ? (y - from) / (to - from) : 1)
  } else {
    const from = acts[index]
    pos = list[index].y + (height - list[index].y) * clamp(max > from ? (y - from) / (max - from) : 1)
  }
  cursor.value = pos
  current.value = Math.max(0, index)
  remain.value = Math.max(0, Math.ceil(minutes * (1 - y / max)))
}

function onScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(update)
}

function schedule() {
  show.value = false
  nextTick(() => requestAnimationFrame(() => requestAnimationFrame(measure)))
}

function jump(index: number) {
  const top = activations()[index]
  if (top === undefined) return
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

let remeasure = 0
function onResize() {
  cancelAnimationFrame(remeasure)
  remeasure = requestAnimationFrame(measure)
}

watch(() => route.path, schedule)
onMounted(() => {
  observer = new ResizeObserver(onResize)
  schedule()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  observer?.disconnect()
  cancelAnimationFrame(frame)
  cancelAnimationFrame(remeasure)
})
</script>

<template>
  <nav class="m-ruler" :class="{ show, dense }" :style="{ left: `${left}px` }" aria-label="大纲">
    <div ref="track" class="mr-track">
      <button
        v-for="(tick, i) in ticks"
        :key="tick.id"
        type="button"
        class="mr-tick"
        :class="{ passed: i <= current, now: i === current }"
        :style="{ transform: `translateY(${tick.y}px) translateY(-50%)` }"
        :title="tick.title"
        @click="jump(i)"
      >
        <span class="mr-n">§{{ i + 1 }}</span>
        <span class="mr-t">{{ tick.title }}</span>
      </button>
      <div class="mr-cursor" :style="{ transform: `translateY(${cursor}px)` }" />
    </div>
    <div class="mr-foot mono"><b>§{{ current + 1 }}</b>剩余 {{ remain }} 分钟</div>
  </nav>
</template>
