<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import ManualArticleFigure from './ManualArticleFigure.vue'
import ManualGuidedFigure from './ManualGuidedFigure.vue'
import { CAS_FRAMES, beatsFor } from './guided'
import { manualFigureKey, manualNumKey } from './figureContext'
import type { FigKind } from './figures'

const figure = inject(manualFigureKey, computed(() => undefined))
const num = inject(manualNumKey, computed(() => ''))
const root = ref<HTMLElement | null>(null)
const active = ref(0)
let frame = 0
let detach = () => {}
let steps: HTMLElement[] = []
let pinStart = false
let pinDone = false
let pinTimer = 0

const kind = computed(() => figure.value?.kind)
const figureStep = computed(() => {
  if (kind.value === 'cas') return CAS_FRAMES[active.value] ?? CAS_FRAMES[CAS_FRAMES.length - 1] ?? 0
  return active.value
})

function expectedCount(value: FigKind) {
  return value === 'cas' ? CAS_FRAMES.length : beatsFor(value).length
}

function show(index: number) {
  steps.forEach((node, i) => node.classList.toggle('active', i === index))
  if (index === active.value) return
  active.value = index
}

function readingIndex() {
  const line = window.innerHeight * 0.46
  let index = 0
  steps.forEach((node, i) => {
    if (node.getBoundingClientRect().top <= line) index = i
  })
  return index
}

function releasePin() {
  if (pinDone) return
  pinDone = true
  pinStart = false
  window.clearTimeout(pinTimer)
  window.removeEventListener('scrollend', releasePin)
  show(readingIndex())
}

function jumpToStart() {
  const host = root.value
  const first = steps[0]
  if (!host || !first) return
  const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ey-top')) || 0
  const line = window.innerHeight * 0.46
  const hostTop = host.getBoundingClientRect().top + window.scrollY
  let target = hostTop - bar - 12
  const second = steps[1]
  if (second) {
    const secondTop = second.getBoundingClientRect().top + window.scrollY
    const limit = secondTop - line - 1
    if (target > limit) target = limit
  }
  target = Math.max(0, target)
  pinDone = false
  pinStart = true
  show(0)
  window.clearTimeout(pinTimer)
  window.removeEventListener('scrollend', releasePin)
  window.addEventListener('scrollend', releasePin)
  pinTimer = window.setTimeout(releasePin, 700)
  window.scrollTo({ top: target, behavior: 'auto' })
  if (Math.abs(window.scrollY - target) < 1) releasePin()
}

function onReset(event: MouseEvent) {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-c]')
  if (button?.dataset.c !== 'reset') return
  jumpToStart()
}

onMounted(() => {
  const host = root.value
  if (!host) return
  steps = [...host.querySelectorAll<HTMLElement>(':scope .cas-steps > .cas-step')]
  const current = kind.value
  if (import.meta.env.DEV && current && steps.length !== expectedCount(current)) {
    console.warn(`[scrolly] ${current}: markdown has ${steps.length} steps, figure has ${expectedCount(current)}`)
  }
  const sync = () => {
    if (pinStart) {
      show(0)
      return
    }
    show(readingIndex())
  }
  const onScroll = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(sync)
  }
  sync()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('scrollend', sync)
  detach = () => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('scrollend', sync)
  }
})

onUnmounted(() => {
  detach()
  cancelAnimationFrame(frame)
  window.clearTimeout(pinTimer)
  window.removeEventListener('scrollend', releasePin)
})
</script>

<template>
  <div ref="root" class="cas-scrolly" @click="onReset">
    <div class="cas-steps">
      <slot />
    </div>
    <ManualArticleFigure
      v-if="kind === 'cas'"
      kind="cas"
      :num="num"
      :step="figureStep"
      :caption="figure?.caption || ''"
    />
    <ManualGuidedFigure
      v-else-if="kind && kind !== 'cas'"
      :key="kind"
      :kind="kind"
      :num="num"
      :step="figureStep"
    />
  </div>
</template>
