<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { markHeadings } from './headingNo'

interface Tick {
  id: string
  title: string
  level: number
  no: string
}

// A heading becomes current once its top crosses this line (px below the viewport top).
const LINE = 96
const route = useRoute()
const show = ref(false)
const left = ref(0)
const ticks = ref<Tick[]>([])
const current = ref(0)
const remain = ref(0)
const track = ref<HTMLElement | null>(null)
let heads: HTMLElement[] = []
let minutes = 1
let frame = 0
let observer: ResizeObserver | null = null
let observed: Element | null = null

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
  const prose = document.querySelector<HTMLElement>('.cas-doc') || document.querySelector<HTMLElement>('.m-prose')
  const marked = prose ? markHeadings(prose) : []
  heads = marked.map((item) => item.el)
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
  ticks.value = marked.map((item) => ({
    id: item.id,
    title: item.title,
    level: item.level,
    no: item.no,
  }))
  nextTick(() => {
    update()
    reveal(current.value)
  })
}

function reveal(index: number) {
  const box = track.value
  const el = box?.querySelectorAll<HTMLElement>('.mr-tick')[index]
  if (!box || !el) return
  const top = el.offsetTop
  const bottom = top + el.offsetHeight
  if (top < box.scrollTop) box.scrollTop = top
  else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight
}

function update() {
  const list = ticks.value
  if (!show.value || !list.length || list.length !== heads.length) return
  const max = maxScroll()
  const y = Math.min(window.scrollY, max)
  const acts = activations()
  let index = -1
  acts.forEach((a, i) => { if (y >= a - 1) index = i })
  const next = Math.max(0, index)
  if (next !== current.value) {
    current.value = next
    reveal(next)
  }
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
  <nav class="m-ruler" :class="{ show }" :style="{ left: `${left}px` }" aria-label="大纲">
    <div ref="track" class="mr-track">
      <button
        v-for="(tick, i) in ticks"
        :key="tick.id"
        type="button"
        class="mr-tick"
        :class="{ passed: i <= current, now: i === current, lv3: tick.level === 3, lv4: tick.level === 4, lv5: tick.level === 5 }"
        :title="tick.title"
        @click="jump(i)"
      >
        <span class="mr-n">{{ tick.no }}</span>
        <span class="mr-t">{{ tick.title }}</span>
      </button>
    </div>
    <div class="mr-foot mono"><b>{{ ticks[current]?.no }}</b>剩余 {{ remain }} 分钟</div>
  </nav>
</template>
