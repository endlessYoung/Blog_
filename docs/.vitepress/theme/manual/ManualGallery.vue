<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import gsap from 'gsap'
import type { ManualArticle } from '../reading/catalog'

const props = defineProps<{
  cards: { article: ManualArticle; kind: 'cas' | 'bin' | 'gen' | 'loop'; caption: string; fig: string }[]
}>()

const gallery = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const reduced = ref(false)
const copies = computed(() => (reduced.value ? 1 : 2))

let tween: gsap.core.Tween | undefined
let cardObserver: IntersectionObserver | undefined
let viewObserver: IntersectionObserver | undefined
let resizeObserver: ResizeObserver | undefined
let motionQuery: MediaQueryList | undefined
let hovering = false
let inView = false
let lastSpan = 0

const PX_PER_SEC = 42
const EASE = 'expo.out'

function distance() {
  const set = track.value?.querySelector<HTMLElement>('.gallery-set')
  return set?.offsetWidth ?? 0
}

function settle(scale: number, duration: number) {
  if (!tween) return
  gsap.killTweensOf(tween)
  gsap.to(tween, { timeScale: scale, duration, ease: EASE, overwrite: true })
}

function sync() {
  if (!tween) return
  if (!inView) {
    settle(0, 0)
    return
  }
  if (hovering) settle(0, 0.24)
  else settle(1, 0.48)
}

function layout() {
  const el = track.value
  if (!el) return
  const span = distance()
  if (!span || reduced.value) {
    tween?.kill()
    tween = undefined
    lastSpan = 0
    gsap.set(el, { x: 0 })
    return
  }
  if (tween && span === lastSpan) return
  const progress = tween && lastSpan ? tween.progress() : 0
  tween?.kill()
  lastSpan = span
  tween = gsap.fromTo(el, { x: 0 }, {
    x: -span,
    duration: span / PX_PER_SEC,
    ease: 'none',
    repeat: -1,
  })
  tween.progress(progress)
  tween.timeScale(inView && !hovering ? 1 : 0)
}

function observeCards() {
  const root = gallery.value
  if (!root || !cardObserver) return
  cardObserver.disconnect()
  root.querySelectorAll<HTMLElement>('.fig-card').forEach((card) => cardObserver?.observe(card))
}

function onEnter(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  hovering = true
  sync()
}

function onLeave(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  hovering = false
  sync()
}

function onMotion() {
  reduced.value = motionQuery?.matches ?? false
}

onMounted(async () => {
  await nextTick()
  const root = gallery.value
  if (!root) return
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('running', entry.isIntersecting))
  }, { threshold: 0.4 })
  viewObserver = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting)
    sync()
  }, { threshold: 0.15 })
  viewObserver.observe(root)
  resizeObserver = new ResizeObserver(() => layout())
  resizeObserver.observe(root)
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', onMotion)
  root.addEventListener('pointerenter', onEnter)
  root.addEventListener('pointerleave', onLeave)
  layout()
  observeCards()
})

watch(() => props.cards, async () => {
  await nextTick()
  lastSpan = 0
  layout()
  observeCards()
})

watch(reduced, async () => {
  await nextTick()
  lastSpan = 0
  layout()
  observeCards()
})

onUnmounted(() => {
  tween?.kill()
  if (tween) gsap.killTweensOf(tween)
  cardObserver?.disconnect()
  viewObserver?.disconnect()
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener('change', onMotion)
  gallery.value?.removeEventListener('pointerenter', onEnter)
  gallery.value?.removeEventListener('pointerleave', onLeave)
})
</script>

<template>
  <div
    ref="gallery"
    class="gallery"
    :class="{ 'is-still': reduced }"
    id="figures"
  >
    <div ref="track" class="gallery-track">
      <div
        v-for="copy in copies"
        :key="copy"
        class="gallery-set"
        :aria-hidden="copy === 2 ? 'true' : undefined"
      >
        <a
          v-for="(card, i) in cards"
          :key="`${copy}-${card.article.num}`"
          class="fig-card manual-art-link"
          :href="withBase(card.article.link)"
          :data-path="card.article.link"
          :tabindex="copy === 2 ? -1 : undefined"
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
          <div v-else-if="card.kind === 'gen'" class="fig-stage m-gen">
            <div class="zone"><b>EDEN</b></div>
            <div class="zone"><b>S0</b></div>
            <div class="zone"><b>S1</b></div>
            <div class="zone"><b>OLD</b></div>
            <div class="objs"><i class="obj" /><i class="obj" /><i class="obj" /><i class="obj" /></div>
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
  </div>
</template>
