<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'

type WordMotion = 'rise' | 'wave' | 'shimmer' | 'shear' | 'pulse'
type LocalMove = 'hop' | 'slide' | 'twist'
type MotionKind = WordMotion | 'local'

const WORD_MOTIONS: { id: WordMotion; duration: number }[] = [
  { id: 'rise', duration: 1100 },
  { id: 'wave', duration: 1200 },
  { id: 'shimmer', duration: 1050 },
  { id: 'shear', duration: 1150 },
  { id: 'pulse', duration: 1000 },
]

const LOCAL_MOVES: LocalMove[] = ['hop', 'slide', 'twist']
const LOCAL_DURATION = 980
const POOL: { id: MotionKind; duration: number }[] = [
  ...WORD_MOTIONS,
  { id: 'local', duration: LOCAL_DURATION },
]

const { site } = useData()

const brand = computed(() => {
  const title = String(site.value.title || '').trim()
  return title || "Endlessyoung's Blog"
})

const glyphs = computed(() => [...brand.value])

const reduced = ref(false)
const revealing = ref(false)
const breathing = ref(false)
const motion = ref<MotionKind | null>(null)
const localMove = ref<LocalMove | null>(null)
const activeLocals = ref<Set<number>>(new Set())
const settled = ref(false)

const INTERVAL_MS = 12_000

let settleTimer: ReturnType<typeof setTimeout> | undefined
let breathTimer: ReturnType<typeof setTimeout> | undefined
let loopTimer: ReturnType<typeof setTimeout> | undefined
let remainingMs = INTERVAL_MS
let loopStartedAt = 0
let pageHidden = false
let hovered = false
let lastMotion: MotionKind | null = null

function clearLoopTimer(): void {
  if (loopTimer) {
    clearTimeout(loopTimer)
    loopTimer = undefined
  }
}

function clearBreathTimer(): void {
  if (breathTimer) {
    clearTimeout(breathTimer)
    breathTimer = undefined
  }
}

function shouldRunLoop(): boolean {
  return !reduced.value && !pageHidden && !hovered && settled.value && !revealing.value && !breathing.value
}

function scheduleLoop(delay = remainingMs): void {
  clearLoopTimer()
  if (!shouldRunLoop()) return
  remainingMs = delay
  loopStartedAt = Date.now()
  loopTimer = setTimeout(() => {
    playBreath()
  }, Math.max(0, delay))
}

function isLetterGlyph(ch: string): boolean {
  return /[A-Za-z0-9]/.test(ch)
}

function pickMotion(): (typeof POOL)[number] {
  const pool = lastMotion ? POOL.filter((m) => m.id !== lastMotion) : POOL
  return pool[Math.floor(Math.random() * pool.length)]!
}

function pickLocalIndices(): number[] {
  const candidates = glyphs.value
    .map((ch, i) => (isLetterGlyph(ch) ? i : -1))
    .filter((i) => i >= 0)

  if (candidates.length === 0) return []

  const count = Math.min(candidates.length, 2 + Math.floor(Math.random() * 3)) // 2–4
  const bag = [...candidates]
  const picked: number[] = []
  for (let n = 0; n < count; n++) {
    const at = Math.floor(Math.random() * bag.length)
    picked.push(bag.splice(at, 1)[0]!)
  }
  return picked.sort((a, b) => a - b)
}

function pickLocalMove(): LocalMove {
  return LOCAL_MOVES[Math.floor(Math.random() * LOCAL_MOVES.length)]!
}

function playBreath(): void {
  if (reduced.value || revealing.value || pageHidden || hovered) {
    scheduleLoop(INTERVAL_MS)
    return
  }

  const picked = pickMotion()
  lastMotion = picked.id
  motion.value = picked.id

  if (picked.id === 'local') {
    localMove.value = pickLocalMove()
    activeLocals.value = new Set(pickLocalIndices())
  } else {
    localMove.value = null
    activeLocals.value = new Set()
  }

  breathing.value = true
  clearBreathTimer()
  breathTimer = setTimeout(() => {
    breathing.value = false
    motion.value = null
    localMove.value = null
    activeLocals.value = new Set()
    remainingMs = INTERVAL_MS
    scheduleLoop(INTERVAL_MS)
  }, picked.duration)
}

function startEntrance(): void {
  revealing.value = true
  const ms = 680 + glyphs.value.length * 22
  settleTimer = setTimeout(() => {
    revealing.value = false
    settled.value = true
    remainingMs = INTERVAL_MS
    scheduleLoop(INTERVAL_MS)
  }, ms)
}

function onVisibility(): void {
  pageHidden = document.visibilityState === 'hidden'
  if (pageHidden) {
    if (loopTimer && loopStartedAt) {
      remainingMs = Math.max(0, remainingMs - (Date.now() - loopStartedAt))
    }
    clearLoopTimer()
    return
  }
  if (shouldRunLoop()) scheduleLoop(remainingMs || INTERVAL_MS)
}

function onEnter(): void {
  hovered = true
  if (loopTimer && loopStartedAt) {
    remainingMs = Math.max(0, remainingMs - (Date.now() - loopStartedAt))
  }
  clearLoopTimer()
}

function onLeave(): void {
  hovered = false
  if (shouldRunLoop()) scheduleLoop(remainingMs || INTERVAL_MS)
}

onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  pageHidden = document.visibilityState === 'hidden'
  document.addEventListener('visibilitychange', onVisibility)

  if (reduced.value) {
    settled.value = true
    return
  }

  nextTick(() => {
    requestAnimationFrame(() => startEntrance())
  })
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  if (settleTimer) clearTimeout(settleTimer)
  clearBreathTimer()
  clearLoopTimer()
})
</script>

<template>
  <span
    class="nav-brand"
    :class="{
      'is-revealing': revealing,
      'is-breathing': breathing,
      [`is-${motion}`]: !!motion,
      [`is-local-${localMove}`]: motion === 'local' && !!localMove,
      'is-settled': settled && !revealing && !breathing,
      'is-reduced': reduced,
    }"
    :aria-label="brand"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
  >
    <!-- 占位：锁死落定态宽度，避免字距/位移把右侧搜索挤跳 -->
    <span class="nav-brand__sizer" aria-hidden="true">{{ brand }}</span>
    <span class="nav-brand__track" aria-hidden="true">
      <span
        v-for="(ch, i) in glyphs"
        :key="`${ch}-${i}`"
        class="nav-brand__g"
        :class="{
          'nav-brand__g--space': ch === ' ',
          'is-local-active': activeLocals.has(i),
        }"
        :style="{ '--i': i }"
      >{{ ch === ' ' ? '\u00A0' : ch }}</span>
    </span>
  </span>
</template>

<style scoped>
.nav-brand {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  max-width: min(52vw, 280px);
  overflow: visible;
  font-family: var(--cyber-font-display, 'Space Grotesk Variable', ui-sans-serif, system-ui, sans-serif);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
  white-space: nowrap;
  color: inherit;
  -webkit-text-fill-color: inherit;
}

/* 文档流占位：始终是落定态度量，不受动画影响 */
.nav-brand__sizer {
  visibility: hidden;
  pointer-events: none;
  white-space: nowrap;
  letter-spacing: -0.02em;
}

.nav-brand__track {
  position: absolute;
  left: 0;
  top: 50%;
  display: inline-block;
  letter-spacing: -0.02em;
  transform: translateY(-50%);
  white-space: nowrap;
  pointer-events: none;
}

.nav-brand__g {
  display: inline-block;
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
}

.nav-brand__g--space {
  width: 0.28em;
}

/* 首次：完整入场（字距只动绝对层，不改占位宽） */
.nav-brand.is-revealing .nav-brand__track {
  animation:
    navBrandMask 0.95s cubic-bezier(0.77, 0, 0.175, 1) both,
    navBrandTracking 0.95s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.nav-brand.is-revealing .nav-brand__g {
  animation: navBrandGlyph 0.78s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(40ms + var(--i, 0) * 22ms);
}

/* —— 整词随机组 —— */
.nav-brand.is-rise .nav-brand__track {
  animation: navRiseTrack 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.nav-brand.is-rise .nav-brand__g {
  animation: navRiseGlyph 0.88s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 18ms);
}

.nav-brand.is-wave .nav-brand__g {
  animation: navWaveGlyph 1.05s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 28ms);
}

.nav-brand.is-shimmer .nav-brand__g {
  animation: navShimmerGlyph 0.9s cubic-bezier(0.33, 1, 0.68, 1) both;
  animation-delay: calc(var(--i, 0) * 24ms);
}

.nav-brand.is-shear .nav-brand__track {
  animation: navShearTrack 1.15s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.nav-brand.is-shear .nav-brand__g {
  animation: navShearGlyph 0.95s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 16ms);
}

.nav-brand.is-pulse .nav-brand__g {
  animation: navPulseGlyph 0.85s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  animation-delay: calc(var(--i, 0) * 20ms);
}

/* —— 局部字母组：仅 .is-local-active 跳动/平移 —— */
.nav-brand.is-local-hop .nav-brand__g.is-local-active {
  animation: navLocalHop 0.9s cubic-bezier(0.22, 1.4, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 12ms);
}

.nav-brand.is-local-slide .nav-brand__g.is-local-active {
  animation: navLocalSlide 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 14ms);
}

.nav-brand.is-local-twist .nav-brand__g.is-local-active {
  animation: navLocalTwist 0.95s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 12ms);
}

.nav-brand.is-settled .nav-brand__g,
.nav-brand.is-reduced .nav-brand__g {
  opacity: 1;
  transform: none;
  filter: none;
}

@keyframes navBrandMask {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes navBrandGlyph {
  from {
    opacity: 0;
    transform: translate3d(0, 0.38em, 0) skewX(-4deg);
  }
  58% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) skewX(0deg);
  }
}

@keyframes navBrandTracking {
  from {
    letter-spacing: 0.05em;
  }
  to {
    letter-spacing: -0.02em;
  }
}

@keyframes navRiseTrack {
  0% {
    letter-spacing: -0.02em;
  }
  38% {
    letter-spacing: 0.08em;
  }
  100% {
    letter-spacing: -0.02em;
  }
}

@keyframes navRiseGlyph {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) skewX(0deg);
  }
  36% {
    opacity: 0.72;
    transform: translate3d(0, -0.28em, 0) skewX(-3deg);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) skewX(0deg);
  }
}

@keyframes navWaveGlyph {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  35% {
    transform: translate3d(0, -0.32em, 0);
  }
  55% {
    transform: translate3d(0, 0.1em, 0);
  }
}

@keyframes navShimmerGlyph {
  0%,
  100% {
    opacity: 1;
    filter: brightness(1);
    transform: translate3d(0, 0, 0);
  }
  40% {
    opacity: 0.55;
    filter: brightness(1.45);
    transform: translate3d(0, -0.1em, 0);
  }
}

@keyframes navShearTrack {
  0%,
  100% {
    letter-spacing: -0.02em;
  }
  40% {
    letter-spacing: 0.06em;
  }
}

@keyframes navShearGlyph {
  0% {
    transform: translate3d(0, 0, 0) skewX(0deg);
  }
  38% {
    opacity: 0.8;
    transform: translate3d(0.06em, -0.18em, 0) skewX(-8deg);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) skewX(0deg);
  }
}

@keyframes navPulseGlyph {
  0%,
  100% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.16);
  }
}

@keyframes navLocalHop {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  32% {
    transform: translate3d(0, -0.42em, 0);
  }
  55% {
    transform: translate3d(0, 0.08em, 0);
  }
}

@keyframes navLocalSlide {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40% {
    transform: translate3d(0.22em, 0, 0);
  }
}

@keyframes navLocalTwist {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  38% {
    transform: translate3d(0, -0.3em, 0) rotate(-12deg);
  }
}

@media (max-width: 639px) {
  .nav-brand {
    max-width: min(46vw, 200px);
    font-size: 13.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-brand,
  .nav-brand__track,
  .nav-brand__g {
    animation: none !important;
  }

  .nav-brand {
    letter-spacing: -0.02em;
  }

  .nav-brand__g {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }

  .nav-brand__track {
    clip-path: none !important;
  }
}
</style>
