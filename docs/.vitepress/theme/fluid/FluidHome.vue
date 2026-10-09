<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { buildManualCatalog, catalogStats, normPath, type ManualPart } from '../reading/catalog'
import { useReturnLanding } from '../reading/landing'

const EN: Record<string, string> = {
  '01': 'Mobile',
  '02': 'Languages',
  '03': 'Intelligence',
  '04': 'Systems',
}
const INTRO_KEY = 'ey-intro-fluid'
const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)'
const EASE_SPRING = 'cubic-bezier(.34, 1.56, .64, 1)'

const { theme } = useData()
const parts = computed(() => buildManualCatalog(theme.value.sidebar))
const stats = computed(() => catalogStats(parts.value))
const { openId, landingPath, showArticles, isSpacer } = useReturnLanding(() => parts.value, 'ey-fluid-return', 'ey-fluid-returned')
const rootEl = ref<HTMLElement | null>(null)
const partsEl = ref<HTMLElement | null>(null)
const titleEl = ref<HTMLElement | null>(null)

const lead = computed(() => parts.value[0]?.chapters[0]?.articles[0] || null)

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function playIntro() {
  const title = titleEl.value
  if (!title) return
  try { sessionStorage.setItem(INTRO_KEY, '1') } catch { /* ignore */ }
  if (reduced()) return
  window.dispatchEvent(new CustomEvent('ey-fluid-bloom', { detail: 2600 }))
  const root = document.documentElement
  root.classList.remove('intro')
  void root.offsetWidth
  root.classList.add('intro')
  const letters = [...title.querySelectorAll<HTMLElement>('.ch')]
  const mid = (letters.length - 1) / 2
  letters.forEach((letter, index) => {
    const distance = Math.abs(index - mid)
    letter.animate([
      { fontWeight: 300, transform: 'translateY(.05em) scale(.96, .9)', letterSpacing: '.02em' },
      { fontWeight: 720, transform: 'translateY(-.025em) scale(1.02, 1.05)', offset: 0.62 },
      { fontWeight: 620, transform: 'none', letterSpacing: '0em' },
    ], { duration: 1500, delay: 140 + distance * 70, easing: EASE_OUT, fill: 'backwards' })
  })
  const disp = document.getElementById('fl-liquid-disp')
  title.style.filter = 'url(#fl-liquid)'
  const t0 = performance.now()
  const tick = (now: number) => {
    const x = Math.min(1, (now - t0) / 1900)
    disp?.setAttribute('scale', (34 * (1 - x) ** 2.2).toFixed(2))
    if (x < 1) requestAnimationFrame(tick)
    else title.style.filter = ''
  }
  requestAnimationFrame(tick)
  rootEl.value?.querySelectorAll<HTMLElement>('.fl-bubble').forEach((bubble, index) => {
    bubble.animate(
      [{ transform: 'scale(.55)', opacity: 0.35 }, { transform: 'none', opacity: 1 }],
      { duration: 1100, delay: 650 + index * 120, easing: EASE_SPRING, fill: 'backwards' },
    )
  })
  window.setTimeout(() => root.classList.remove('intro'), 2600)
}

let hoverRaf = 0
function onTitleMove(event: PointerEvent) {
  if (reduced() || !window.matchMedia('(hover: hover)').matches) return
  const title = titleEl.value
  if (!title) return
  cancelAnimationFrame(hoverRaf)
  hoverRaf = requestAnimationFrame(() => {
    title.querySelectorAll<HTMLElement>('.ch').forEach((letter) => {
      const rect = letter.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const force = Math.exp(-(dx * dx + dy * dy) / (2 * 150 * 150))
      letter.style.fontWeight = String(Math.round(620 + 80 * force - 120 * (1 - force) * 0.35))
      letter.style.translate = `0 ${(-0.03 * force).toFixed(3)}em`
    })
  })
}

function onTitleLeave() {
  cancelAnimationFrame(hoverRaf)
  titleEl.value?.querySelectorAll<HTMLElement>('.ch').forEach((letter) => {
    letter.style.fontWeight = ''
    letter.style.translate = ''
  })
}

function gooTo(row: HTMLElement) {
  const track = partsEl.value?.querySelector<HTMLElement>('.fl-goo')
  const host = partsEl.value
  if (!track || !host || reduced()) return
  host.querySelectorAll('.fl-row.hot').forEach((item) => item.classList.remove('hot'))
  row.classList.add('hot')
  const hostRect = host.getBoundingClientRect()
  const rect = row.getBoundingClientRect()
  const x = rect.left - hostRect.left
  const y = rect.top - hostRect.top
  const [lead, tail, drip] = [...track.children] as HTMLElement[]
  lead.style.cssText = `width:${rect.width}px;height:${rect.height}px;translate:${x}px ${y}px`
  tail.style.cssText = `width:${rect.width * 0.72}px;height:${rect.height * 0.8}px;translate:${x + rect.width * 0.14}px ${y + rect.height * 0.1}px`
  drip.style.cssText = `width:${rect.height * 0.9}px;height:${rect.height * 0.9}px;translate:${x + 6}px ${y + rect.height * 0.05}px`
  if (!track.classList.contains('on')) {
    track.classList.add('snap')
    void track.offsetWidth
    track.classList.remove('snap')
  }
  track.classList.add('on')
}

function gooHide() {
  partsEl.value?.querySelector('.fl-goo')?.classList.remove('on')
  partsEl.value?.querySelectorAll('.fl-row.hot').forEach((item) => item.classList.remove('hot'))
}

function onPartsOver(event: PointerEvent) {
  const row = (event.target as Element | null)?.closest?.('.fl-row') as HTMLElement | null
  if (row) gooTo(row)
}

function togglePart(part: ManualPart) {
  landingPath.value = null
  openId.value = openId.value === part.id ? null : part.id
}

onMounted(() => {
  let played = false
  try { played = sessionStorage.getItem(INTRO_KEY) === '1' } catch { played = false }
  if (!played) playIntro()
})

onUnmounted(() => {
  cancelAnimationFrame(hoverRaf)
  document.documentElement.classList.remove('intro')
})
</script>

<template>
  <div ref="rootEl" class="fl-home fl-wrap">
    <section class="fl-hero" @pointermove="onTitleMove" @pointerleave="onTitleLeave">
      <p class="fl-eyebrow"><i class="fl-dot" /> 手册 <b>Fluid</b></p>
      <h1 ref="titleEl" class="fl-title" aria-label="ENDLESS YOUNG">
        <span class="line" aria-hidden="true">
          <span v-for="(ch, i) in 'ENDLESS'" :key="`a${i}`" class="ch">{{ ch }}</span>
        </span>
        <span class="line line-2" aria-hidden="true">
          <span v-for="(ch, i) in 'YOUNG'" :key="`b${i}`" class="ch">{{ ch }}</span><i class="fl-drop" />
        </span>
      </h1>
      <div class="fl-foot">
        <p class="fl-lede">Android、Java 与 AI 的原理笔记。底色自己在流，读文章时它会安静下来。</p>
        <div class="fl-bubbles">
          <div class="fl-bubble b1"><dd>{{ stats.articles }}</dd><dt>篇文章</dt></div>
          <div class="fl-bubble b2"><dd>{{ pad(stats.parts) }}</dd><dt>个部分</dt></div>
          <div class="fl-bubble b3"><dd>{{ pad(stats.chapters) }}</dd><dt>个章节</dt></div>
        </div>
      </div>
      <a v-if="lead" class="fl-start fluid-art-link" :href="withBase(lead.link)">
        <span class="art-num" data-vt>{{ lead.num }}</span>
        <span class="art-title" data-vt>{{ lead.title }}</span>
      </a>
    </section>

    <section class="fl-block">
      <div class="fl-block-head">
        <span class="fl-mark">目</span>
        <h2>目录</h2>
        <p>液块会黏到悬停的那一行。</p>
      </div>
      <div ref="partsEl" class="fl-parts" @pointerover="onPartsOver" @pointerleave="gooHide">
        <div class="fl-goo" aria-hidden="true"><i class="g-lead" /><i class="g-tail" /><i class="g-drip" /></div>
        <article v-for="part in parts" :key="part.id" class="fl-part" :class="{ open: openId === part.id, landing: !!landingPath && openId === part.id }">
          <button class="fl-row" type="button" :aria-expanded="openId === part.id" @click="togglePart(part)">
            <span class="fl-num">{{ part.id }}</span>
            <span class="fl-name">{{ part.name }}</span>
            <span class="fl-en">{{ EN[part.id] }}</span>
            <span class="fl-count">{{ part.count }}<small>篇</small></span>
            <span class="fl-toggle" aria-hidden="true" />
          </button>
          <div class="fl-body" :inert="openId !== part.id">
            <div class="fl-inner">
              <div class="fl-chapters">
                <div v-for="(chapter, index) in part.chapters" :key="chapter.name" class="fl-chap" :style="{ '--i': index }">
                  <div class="fl-chap-head"><span>{{ chapter.name }}</span><span>{{ pad(chapter.articles.length) }}</span></div>
                  <ul v-if="showArticles(part.id)">
                    <li v-for="article in chapter.articles" :key="article.num">
                      <a
                        v-if="!isSpacer(article.link)"
                        class="fluid-art-link art-link"
                        :href="withBase(article.link)"
                        :data-path="normPath(article.link)"
                      >
                        <span class="art-num" data-vt>{{ article.num }}</span>
                        <span class="art-title" data-vt>{{ article.title }}</span>
                      </a>
                      <span v-else class="art-spacer" />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
