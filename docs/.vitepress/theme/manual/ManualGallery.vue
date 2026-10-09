<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import type { ManualArticle } from '../reading/catalog'

defineProps<{
  cards: { article: ManualArticle; kind: 'cas' | 'bin' | 'loop'; caption: string; fig: string }[]
}>()

const gallery = ref<HTMLElement | null>(null)
let stop: (() => void) | undefined

onMounted(() => {
  const el = gallery.value
  if (!el) return
  const cards = [...el.querySelectorAll<HTMLElement>('.fig-card')]
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('running', entry.isIntersecting))
  }, { threshold: 0.5 })
  cards.forEach((card) => io.observe(card))

  let down = false
  let startX = 0
  let startL = 0
  let moved = 0
  let lastX = 0
  let lastT = 0
  let vel = 0
  let frame = 0
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    down = true
    moved = 0
    startX = lastX = event.clientX
    startL = el.scrollLeft
    lastT = performance.now()
    vel = 0
    cancelAnimationFrame(frame)
    el.classList.remove('suppress')
    event.preventDefault()
  }
  const onMove = (event: PointerEvent) => {
    if (!down) return
    const now = performance.now()
    el.scrollLeft = startL - (event.clientX - startX)
    moved = Math.max(moved, Math.abs(event.clientX - startX))
    vel = (event.clientX - lastX) / Math.max(1, now - lastT)
    lastX = event.clientX
    lastT = now
    el.classList.toggle('dragging', moved > 4)
  }
  const onUp = () => {
    if (!down) return
    down = false
    el.classList.remove('dragging')
    if (moved > 5) el.classList.add('suppress')
    let v = vel * 16
    const glide = () => {
      if (Math.abs(v) < 0.3) return
      el.scrollLeft -= v
      v *= 0.94
      frame = requestAnimationFrame(glide)
    }
    if (!reduced) glide()
  }

  el.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  stop = () => {
    io.disconnect()
    el.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    cancelAnimationFrame(frame)
  }
})

onUnmounted(() => stop?.())
</script>

<template>
  <div ref="gallery" class="gallery" id="figures">
    <div class="gallery-track">
      <a
        v-for="(card, i) in cards"
        :key="card.article.num"
        class="fig-card manual-art-link"
        :href="withBase(card.article.link)"
        :data-path="card.article.link"
        data-peek
      >
        <div v-if="card.kind === 'cas'" class="fig-stage m-cas">
          <div class="mem"><span>0</span><span>1</span><span>2</span></div>
          <div class="th t1">T1</div>
          <div class="th t2">T2</div>
        </div>
        <div v-else-if="card.kind === 'bin'" class="fig-stage m-bin">
          <div class="bars">
            <i v-for="n in 12" :key="n" :class="{ hit: n === 8 }" :style="{ height: `${18 + (n - 1) * 7}%` }" />
          </div>
          <span class="ptr lo" /><span class="ptr mid" /><span class="ptr hi" />
        </div>
        <div v-else class="fig-stage m-loop">
          <div class="q"><i /><i /><i /></div>
          <div class="ring" />
          <span class="lab" style="left:22px;top:70px">MESSAGEQUEUE</span>
          <span class="lab" style="left:50%;top:26px;transform:translateX(-50%)">LOOPER</span>
        </div>
        <div class="fig-cap">
          <span class="mono">FIG {{ String(i + 1).padStart(2, '0') }} · {{ card.fig }}</span>
          <h3>{{ card.caption }}</h3>
          <span class="art-num" data-vt hidden>{{ card.article.num }}</span>
          <span class="art-title" data-vt hidden>{{ card.article.title }}</span>
        </div>
      </a>
    </div>
  </div>
</template>
