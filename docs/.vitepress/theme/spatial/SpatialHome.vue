<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { buildManualCatalog, catalogStats, findManualArticle, normPath, type ManualArticle, type ManualChapter, type ManualPart } from '../reading/catalog'
import { useReturnLanding } from '../reading/landing'
import { appear, installSprings, LiveSpring, reducedMotion, springTo } from './spring'

const EN: Record<string, string> = {
  '01': 'Mobile',
  '02': 'Languages',
  '03': 'Intelligence',
  '04': 'Systems',
}
const INTRO_KEY = 'ey-intro-spatial'

const { theme } = useData()
const parts = computed(() => buildManualCatalog(theme.value.sidebar))
const stats = computed(() => catalogStats(parts.value))
const { openId, landingPath, showArticles, isSpacer } = useReturnLanding(() => parts.value, 'ey-spatial-return', 'ey-spatial-returned')
const rootEl = ref<HTMLElement | null>(null)
const counts = ref({ articles: 0, parts: 0, chapters: 0 })

const lead = computed(() => {
  const first = parts.value[0]?.chapters[0]?.articles[0]
  return first || null
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function chips(part: ManualPart) {
  return part.chapters
}

const previewKey = ref('intro')
const previewPart = ref<ManualPart | null>(null)
const previewHit = ref<{ part: ManualPart; chapter: ManualChapter; article: ManualArticle; index: number; total: number } | null>(null)

function barWidth(part: ManualPart, count: number) {
  const max = Math.max(...part.chapters.map((chapter) => chapter.articles.length), 1)
  return `${(count / max) * 100}%`
}

function showPreview(key: string) {
  if (previewKey.value === key) return
  previewKey.value = key
}

function onCatalogOver(event: PointerEvent) {
  const node = event.target instanceof Element ? event.target : null
  const link = node?.closest('a.spatial-art-link') as HTMLAnchorElement | null
  if (link?.closest('.sp-parts')) {
    const hit = findManualArticle(parts.value, link.dataset.path || link.getAttribute('href') || '')
    if (!hit) return
    previewPart.value = null
    previewHit.value = hit
    showPreview(hit.article.num)
    return
  }
  const partEl = node?.closest('.sp-part') as HTMLElement | null
  if (!partEl || node?.closest('.sp-head') == null && node?.closest('.sp-part') == null) return
  if (!node?.closest('.sp-head')) return
  const part = parts.value.find((item) => item.id === partEl.dataset.part)
  if (!part) return
  previewHit.value = null
  previewPart.value = part
  showPreview(`part-${part.id}`)
}

function onCatalogKey(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const host = (event.currentTarget as HTMLElement)
  const items = [...host.querySelectorAll<HTMLElement>('.sp-head, .sp-part.open a.art-link')]
  const index = items.indexOf(document.activeElement as HTMLElement)
  if (index < 0) return
  event.preventDefault()
  const next = items[Math.max(0, Math.min(items.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]
  next.focus()
}

function scrollCatalog() {
  document.getElementById('sp-contents')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
}

function openSearch() {
  document.querySelector<HTMLButtonElement>('.VPNavBarSearchButton')?.click()
}

watch(previewKey, async () => {
  await nextTick()
  const card = rootEl.value?.querySelector<HTMLElement>('.sp-pv')
  if (card) appear(card, { from: 'translateY(18px) scale(.96)', preset: 'snappy', blur: 6, fade: 260 })
})

async function togglePart(part: ManualPart, head: HTMLElement) {
  if (landingPath.value) {
    landingPath.value = null
    await nextTick()
  }
  const article = head.parentElement
  const body = article?.querySelector<HTMLElement>('.sp-body')
  if (!article || !body) return
  const open = openId.value !== part.id
  const from = body.getBoundingClientRect().height
  if (!open) {
    body.style.height = `${from}px`
    openId.value = null
    if (reducedMotion()) {
      body.style.height = ''
      return
    }
    const anim = springTo(body, [{ height: `${from}px` }, { height: '0px' }], 'snappy', { fill: 'forwards' })
    anim.finished.then(() => {
      anim.cancel()
      body.style.height = ''
    }).catch(() => {
      body.style.height = ''
    })
    return
  }
  openId.value = part.id
  if (reducedMotion()) {
    body.style.height = ''
    return
  }
  const full = body.scrollHeight
  body.style.height = `${from}px`
  const anim = springTo(body, [{ height: `${from}px` }, { height: `${full}px` }], 'gentle', { fill: 'forwards' })
  anim.finished.then(() => {
    anim.cancel()
    body.style.height = 'auto'
  }).catch(() => {
    body.style.height = ''
  })
  article.querySelectorAll<HTMLElement>('.sp-chap').forEach((chapter, index) => {
    appear(chapter, { from: 'translateY(18px) scale(.97)', preset: 'bouncy', delay: 70 + index * 45, blur: 6, fade: 280 })
  })
}

let parallax: { x: LiveSpring; y: LiveSpring } | null = null
const countSprings: LiveSpring[] = []

function playIntro() {
  const root = rootEl.value
  if (!root) return
  try { sessionStorage.setItem(INTRO_KEY, '1') } catch { /* ignore */ }
  const targets = stats.value
  const articleSpring = new LiveSpring(0, 'gentle', (value) => { counts.value.articles = Math.round(value) }, 0.4)
  const partSpring = new LiveSpring(0, 'gentle', (value) => { counts.value.parts = Math.round(value) }, 0.4)
  const chapterSpring = new LiveSpring(0, 'gentle', (value) => { counts.value.chapters = Math.round(value) }, 0.4)
  countSprings.push(articleSpring, partSpring, chapterSpring)
  window.setTimeout(() => articleSpring.to(targets.articles), 520)
  window.setTimeout(() => partSpring.to(targets.parts), 610)
  window.setTimeout(() => chapterSpring.to(targets.chapters), 700)
  if (reducedMotion()) {
    counts.value = { ...targets }
    return
  }
  root.querySelectorAll<HTMLElement>('.sp-eyebrow').forEach((el) => {
    appear(el, { from: 'translateY(14px) scale(.92)', delay: 0 })
  })
  root.querySelectorAll<HTMLElement>('.sp-title .ch').forEach((ch, index) => {
    appear(ch, { from: 'translateY(30px) scale(.9)', delay: 30 + index * 18, blur: 12, fade: 300 })
  })
  root.querySelectorAll<HTMLElement>('.sp-tag, .sp-lede, .sp-actions').forEach((el, index) => {
    appear(el, { from: 'translateY(18px) scale(.95)', delay: 200 + index * 70 })
  })
  root.querySelectorAll<HTMLElement>('.sp-layer').forEach((el, index) => {
    appear(el, { from: 'translateY(46px) scale(.86)', delay: 320 + index * 130, blur: 18, fade: 520 })
  })
}

interface TiltPack {
  rx: LiveSpring
  ry: LiveSpring
  l: LiveSpring
}

const tilts = new WeakMap<HTMLElement, TiltPack>()
const tiltSprings: LiveSpring[] = []
let tiltEl: HTMLElement | null = null

function tiltOf(el: HTMLElement) {
  const existing = tilts.get(el)
  if (existing) return existing
  const pack = {} as TiltPack
  const apply = () => {
    const rx = pack.rx.x
    const ry = pack.ry.x
    const lift = pack.l.x
    el.style.transform = Math.abs(rx) + Math.abs(ry) + Math.abs(lift) < 0.001
      ? ''
      : `perspective(1100px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) translateY(${(-lift * 4).toFixed(2)}px)`
    el.style.setProperty('--lift', lift.toFixed(3))
  }
  pack.rx = new LiveSpring(0, 'snappy', apply, 0.005)
  pack.ry = new LiveSpring(0, 'snappy', apply, 0.005)
  pack.l = new LiveSpring(0, 'gentle', apply, 0.002)
  tilts.set(el, pack)
  tiltSprings.push(pack.rx, pack.ry, pack.l)
  return pack
}

function tiltLeave() {
  if (!tiltEl) return
  const pack = tiltOf(tiltEl)
  pack.rx.to(0)
  pack.ry.to(0)
  pack.l.to(0)
  tiltEl = null
}

function onMove(event: PointerEvent) {
  const node = event.target instanceof Element ? event.target : null
  const spec = node?.closest('[data-spec]') as HTMLElement | null
  if (spec) {
    const rect = spec.getBoundingClientRect()
    spec.style.setProperty('--px', `${event.clientX - rect.left}px`)
    spec.style.setProperty('--py', `${event.clientY - rect.top}px`)
    spec.classList.add('is-hot')
  }
  if (reducedMotion()) return
  const card = node?.closest('[data-tilt]') as HTMLElement | null
  if (card !== tiltEl) tiltLeave()
  if (card && window.matchMedia('(hover: hover)').matches) {
    tiltEl = card
    const rect = card.getBoundingClientRect()
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1
    const max = (Number(card.dataset.tilt) || 3) * (card.classList.contains('open') ? 0.15 : 1)
    const pack = tiltOf(card)
    pack.ry.to(nx * max)
    pack.rx.to(-ny * max)
    pack.l.to(1)
  }
  if (!parallax) return
  const hero = rootEl.value?.querySelector('.sp-hero')
  if (!hero || !node || !hero.contains(node)) return
  parallax.x.to((event.clientX / window.innerWidth - 0.5) * 2)
  parallax.y.to((event.clientY / window.innerHeight - 0.5) * 2)
}

function onLeave(event: PointerEvent) {
  const spec = (event.target as Element | null)?.closest?.('[data-spec]') as HTMLElement | null
  if (spec && !spec.contains(event.relatedTarget as Node)) spec.classList.remove('is-hot')
}

onMounted(() => {
  installSprings()
  counts.value = reducedMotion() ? { ...stats.value } : { articles: 0, parts: 0, chapters: 0 }
  const apply = () => {
    rootEl.value?.querySelectorAll<HTMLElement>('.sp-layer').forEach((layer) => {
      const depth = Number(layer.dataset.depth || 1)
      const force = (4 - depth) * 6
      const x = parallax?.x.x || 0
      const y = parallax?.y.y || 0
      layer.style.translate = `${(x * force).toFixed(1)}px ${(y * force).toFixed(1)}px`
    })
  }
  parallax = {
    x: new LiveSpring(0, 'gentle', apply, 0.001),
    y: new LiveSpring(0, 'gentle', apply, 0.001),
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerout', onLeave)
  window.addEventListener('pointerleave', tiltLeave)
  let played = false
  try { played = sessionStorage.getItem(INTRO_KEY) === '1' } catch { played = false }
  if (!played) playIntro()
  else counts.value = { ...stats.value }
})

onUnmounted(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerout', onLeave)
  window.removeEventListener('pointerleave', tiltLeave)
  parallax?.x.stop()
  parallax?.y.stop()
  countSprings.forEach((item) => item.stop())
  tiltSprings.forEach((item) => item.stop())
})
</script>

<template>
  <div ref="rootEl" class="sp-home sp-wrap">
    <section class="sp-hero">
      <div>
        <span class="sp-eyebrow" data-rise><i class="sp-live" />技术笔记</span>
        <h1 class="sp-title" aria-label="Endless Young">
          <span class="w w1" aria-hidden="true"><span v-for="(ch, i) in 'Endless'" :key="`a${i}`" class="ch">{{ ch }}</span></span>
          <span class="w w2" aria-hidden="true"><span v-for="(ch, i) in 'Young'" :key="`b${i}`" class="ch">{{ ch }}</span></span>
        </h1>
        <p class="sp-tag" data-rise>把底层原理，做成看得见、摸得着的东西。</p>
        <p class="sp-lede" data-rise>Android、Java 与 AI 的原理笔记。写给想弄懂「为什么」的工程师。</p>
        <div class="sp-actions" data-rise>
          <button class="sp-pill primary" type="button" @click="scrollCatalog">浏览目录</button>
          <button class="sp-pill" type="button" @click="openSearch">搜索全部文章<kbd>/</kbd></button>
        </div>
      </div>
      <div class="sp-stack">
        <div class="sp-layer glass l3" data-depth="3" data-rise data-spec data-tilt="2">
          <div class="sp-kicker">规模</div>
          <dl class="sp-stats">
            <div><dt>篇文章</dt><dd>{{ counts.articles }}</dd></div>
            <div><dt>个部分</dt><dd>{{ pad(counts.parts) }}</dd></div>
            <div><dt>个章节</dt><dd>{{ pad(counts.chapters) }}</dd></div>
          </dl>
        </div>
        <a v-if="lead" class="sp-layer glass l2 spatial-art-link" data-depth="2" data-rise data-spec data-tilt="2" :href="withBase(lead.link)">
          <div class="sp-kicker">最近更新</div>
          <span class="art-num" data-vt>{{ lead.num }}</span>
          <span class="art-title" data-vt>{{ lead.title }}</span>
          <span class="sp-date">{{ parts[0]?.chapters[0]?.name }}</span>
        </a>
        <a v-if="lead" class="sp-layer glass l1 spatial-art-link" data-depth="1" data-rise data-spec data-tilt="2" :href="withBase(lead.link)">
          <div class="sp-kicker">从这里开始</div>
          <span class="art-num">{{ lead.num }}</span>
          <span class="art-title">{{ lead.title }}</span>
        </a>
      </div>
    </section>

    <section id="sp-contents" class="sp-block">
      <header class="sp-block-head">
        <span class="sp-block-kicker">01</span>
        <h2>目录</h2>
        <p class="sp-desc">点开一个部分展开章节，悬停文章在右侧预览。也可以用键盘上下键浏览。</p>
      </header>
      <div class="sp-contents">
      <div class="sp-parts" @pointerover="onCatalogOver" @keydown="onCatalogKey">
        <article
          v-for="part in parts"
          :key="part.id"
          class="sp-part glass"
          :class="{ open: openId === part.id, landing: !!landingPath && openId === part.id }"
          :data-part="part.id"
          data-spec
          data-tilt="1.4"
        >
          <button class="sp-head" type="button" :aria-expanded="openId === part.id" @click="togglePart(part, $event.currentTarget as HTMLElement)">
            <span class="sp-num">{{ part.id }}</span>
            <span>
              <span class="sp-name">{{ part.name }}</span>
              <span class="sp-en">{{ EN[part.id] }}</span>
            </span>
            <span class="sp-chips" aria-hidden="true">
              <span v-for="chapter in chips(part)" :key="chapter.name">{{ chapter.name }}</span>
            </span>
            <span class="sp-count">{{ part.count }}<small>篇</small></span>
            <span class="sp-toggle" aria-hidden="true"><i /></span>
          </button>
          <div class="sp-body" :inert="openId !== part.id">
            <div class="sp-inner">
              <div class="sp-chapters">
                <div v-for="chapter in part.chapters" :key="chapter.name" class="sp-chap">
                  <div class="sp-chap-head"><span>{{ chapter.name }}</span><span>{{ pad(chapter.articles.length) }}</span></div>
                  <ul v-if="showArticles(part.id)">
                    <li v-for="article in chapter.articles" :key="article.num">
                      <a
                        v-if="!isSpacer(article.link)"
                        class="spatial-art-link art-link"
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
      <aside class="sp-preview glass" data-spec>
        <div class="sp-pv-stage">
          <div :key="previewKey" class="sp-pv">
            <template v-if="previewHit">
              <span class="sp-pv-kicker">{{ previewHit.article.num }}</span>
              <div class="sp-pv-title">{{ previewHit.article.title }}</div>
              <p class="sp-pv-sum">{{ previewHit.chapter.name }}</p>
              <div class="sp-pv-meta">
                <span>{{ previewHit.part.name }}</span>
                <span>第 {{ previewHit.index }} / {{ previewHit.total }} 篇</span>
              </div>
              <div class="sp-pv-open"><span>点击打开</span></div>
            </template>
            <template v-else-if="previewPart">
              <span class="sp-pv-kicker">第 {{ previewPart.id }} 部分 · {{ EN[previewPart.id] }}</span>
              <div class="sp-pv-title">{{ previewPart.name }}</div>
              <p class="sp-pv-sum">{{ previewPart.count }} 篇文章，分为 {{ previewPart.chapters.length }} 个章节。点击展开查看全部条目。</p>
              <ul class="sp-pv-bars">
                <li v-for="chapter in previewPart.chapters" :key="chapter.name">
                  <span>{{ chapter.name }}</span>
                  <i :style="{ width: barWidth(previewPart, chapter.articles.length) }" />
                  <b>{{ chapter.articles.length }}</b>
                </li>
              </ul>
            </template>
            <template v-else>
              <span class="sp-pv-kicker">从这里开始</span>
              <div class="sp-pv-title">{{ lead?.title }}</div>
              <p class="sp-pv-sum">悬停目录里的部分或文章，这里会换成对应的预览。</p>
            </template>
          </div>
        </div>
      </aside>
      </div>
    </section>
  </div>
</template>
