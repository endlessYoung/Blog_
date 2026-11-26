<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { buildManualCatalog, catalogStats, findManualArticle, normPath, type ManualArticle, type ManualCategory, type ManualChapter, type ManualPart } from '../reading/catalog'
import { useReturnLanding } from '../reading/landing'
import { pageMeta, recentPages, termGroups } from '../reading/corpus'
import { prefetchHrefs, prefetchKatex, prefetchPage } from '../reading/prefetch'
import ManualOdo from './ManualOdo.vue'
import ManualGallery from './ManualGallery.vue'
import ManualCategoryCover from './ManualCategoryCover.vue'
import { FIG_DEFS, type FigKind } from './figures'
import { EASE_OUT, playMastheadIntro, reducedMotion, rollOdo, shouldPlayIntro } from './motion'

const props = defineProps<{ previousPath?: string; unreadCount?: number }>()
const emit = defineEmits<{ openUpdates: [] }>()
const { theme } = useData()
const parts = computed(() => buildManualCatalog(theme.value.sidebar))
const stats = computed(() => catalogStats(parts.value))
const { openId, categoryRoot, returnedPath, landingPath, isSpacer } = useReturnLanding(
  () => parts.value, 'ey-manual-return', 'ey-manual-returned', () => props.previousPath,
)
const activePart = computed(() => parts.value.find((part) => part.id === openId.value))
const activeCategory = computed(() => {
  const categories = activePart.value?.categories
  return categories?.find((category) => category.root === categoryRoot.value) ?? categories?.[0]
})
const titleEl = ref<HTMLElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)

const now = new Date()
const year = String(now.getFullYear())
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = String(now.getDate()).padStart(2, '0')
const title = 'ENDLESSYOUNG'
const groups = termGroups()

const figs = computed(() => {
  const cards: { article: ManualArticle; kind: FigKind; caption: string; fig: string }[] = []
  for (const def of FIG_DEFS) {
    for (const part of parts.value) {
      for (const chapter of part.chapters) {
        const article = chapter.articles.find((item) => item.title === def.title)
        if (!article) continue
        cards.push({ article, kind: def.kind, caption: def.caption, fig: article.num })
      }
    }
  }
  return cards
})

const figTitles = computed(() => new Set(figs.value.map((card) => card.article.title)))

const logs = computed(() => recentPages(40).flatMap((page) => {
  const hit = findManualArticle(parts.value, page.url)
  if (!hit) return []
  return [{ ...hit, updated: page.updated }]
}).slice(0, 8))

interface ArticlePreview {
  kind: 'article'
  num: string
  title: string
  summary: string
  meta: string
}

type Flap =
  | { kind: 'intro' }
  | { kind: 'part'; part: ManualPart }
  | { kind: 'category'; category: ManualCategory }
  | ArticlePreview

const partPreview = ref<ManualPart | null>(null)
const hoverPreview = ref<ArticlePreview | null>(null)
const focusPreview = ref<ArticlePreview | null>(null)
const flap = computed<Flap>(() => {
  const article = hoverPreview.value ?? focusPreview.value
  if (article) return article
  if (activeCategory.value) return { kind: 'category', category: activeCategory.value }
  if (partPreview.value) return { kind: 'part', part: partPreview.value }
  return { kind: 'intro' }
})
const flapKey = computed(() => {
  switch (flap.value.kind) {
    case 'article': return flap.value.num
    case 'category': return flap.value.category.root
    case 'part': return flap.value.part.id
    default: return 'intro'
  }
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}

let partWarm = 0
let catalogIo: IntersectionObserver | null = null

function warmChapters(chapters: ManualChapter[], limit: number) {
  prefetchKatex()
  prefetchHrefs(chapters.flatMap((chapter) => chapter.articles.map((article) => withBase(article.link))), limit)
}

function observeOpenCatalog() {
  catalogIo?.disconnect()
  catalogIo = null
  const root = rootEl.value
  if (!openId.value || !root) return
  catalogIo = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const link = entry.target as HTMLAnchorElement
      catalogIo?.unobserve(link)
      prefetchPage(link.getAttribute('href'))
    }
  }, { rootMargin: '120px 0px' })
  root.querySelectorAll<HTMLAnchorElement>('.part.open a.art-link').forEach((link) => catalogIo?.observe(link))
}

function togglePart(part: ManualPart) {
  const opening = openId.value !== part.id
  openId.value = opening ? part.id : null
  selectCategory(opening ? part.categories[0] : undefined)
}

function selectCategory(category?: ManualCategory) {
  returnedPath.value = null
  landingPath.value = null
  hoverPreview.value = null
  focusPreview.value = null
  categoryRoot.value = category?.root ?? null
  if (category) warmChapters(category.chapters, 12)
}

function onPartEnter(event: Event, part: ManualPart) {
  const count = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.part-count')
  if (count) rollOdo(count)
  partPreview.value = part
  window.clearTimeout(partWarm)
  partWarm = window.setTimeout(() => warmChapters(part.categories[0].chapters, 4), 120)
}

function articleLink(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLAnchorElement>('.art-link') : null
}

function articlePreview(link: HTMLAnchorElement): ArticlePreview | null {
  prefetchPage(link.getAttribute('href'))
  const hit = findManualArticle(parts.value, link.dataset.path || link.getAttribute('href') || '')
  if (!hit) return null
  const meta = pageMeta(hit.article.link)
  return {
    kind: 'article',
    num: hit.article.num,
    title: hit.article.title,
    summary: meta?.description || `${hit.part.name} · ${hit.chapter.name}`,
    meta: `第 ${hit.index} / ${hit.total} 篇${meta?.updated ? ` · ${meta.updated}` : ''}${figTitles.value.has(hit.article.title) ? ' · 含交互图' : ''}`,
  }
}

function onCatalogOver(event: PointerEvent) {
  const link = articleLink(event.target)
  if (event.pointerType !== 'touch' && link && link !== articleLink(event.relatedTarget)) {
    hoverPreview.value = articlePreview(link)
  }
}

function onCatalogOut(event: PointerEvent) {
  const link = articleLink(event.target)
  if (link && link !== articleLink(event.relatedTarget)) hoverPreview.value = null
}

function onCatalogFocus(event: FocusEvent) {
  const link = articleLink(event.target)
  focusPreview.value = link?.matches(':focus-visible') ? articlePreview(link) : null
}

function onCatalogKey(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const root = event.currentTarget as HTMLElement
  const items = [...root.querySelectorAll<HTMLElement>('.part-row, .part.open .category-trigger, .part.open .art-link')]
  const index = items.indexOf(document.activeElement as HTMLElement)
  if (index < 0) return
  event.preventDefault()
  const next = items[Math.max(0, Math.min(items.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]
  next?.focus()
  if (next instanceof HTMLAnchorElement) prefetchPage(next.getAttribute('href'))
}

function revealReturnedArticle() {
  if (!returnedPath.value || landingPath.value) return
  const links = rootEl.value?.querySelectorAll<HTMLAnchorElement>('.part.open .art-link')
  const link = links && [...links].find((item) => item.dataset.path === returnedPath.value)
  link?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function playIntro() {
  if (!titleEl.value || !rootEl.value) return
  const odos = [...rootEl.value.querySelectorAll<HTMLElement>('.masthead .odo')]
  playMastheadIntro(titleEl.value, odos)
}

function enterCard(el: Element, done: () => void) {
  if (reducedMotion()) { done(); return }
  const anim = (el as HTMLElement).animate(
    [{ transform: 'translateY(36%) rotateX(-72deg)', opacity: 0 }, { transform: 'none', opacity: 1 }],
    { duration: 420, delay: 70, easing: EASE_OUT, fill: 'backwards' },
  )
  anim.onfinish = () => done()
  anim.oncancel = () => done()
}

function leaveCard(el: Element, done: () => void) {
  if (reducedMotion()) { done(); return }
  const anim = (el as HTMLElement).animate(
    [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-36%) rotateX(72deg)', opacity: 0 }],
    { duration: 240, easing: 'cubic-bezier(.7, 0, .84, 0)', fill: 'forwards' },
  )
  anim.onfinish = () => done()
  anim.oncancel = () => done()
}

watch(activeCategory, observeOpenCatalog, { flush: 'post' })
watch(landingPath, revealReturnedArticle, { flush: 'post' })

onMounted(async () => {
  await nextTick()
  if (titleEl.value && shouldPlayIntro()) playIntro()
  observeOpenCatalog()
  requestAnimationFrame(revealReturnedArticle)
})

onUnmounted(() => {
  window.clearTimeout(partWarm)
  catalogIo?.disconnect()
})
</script>

<template>
  <div ref="rootEl" class="manual-home">
    <section class="masthead wrap">
      <div class="mh-meta mono">
        <span>VOL.{{ year }} · 技术参考手册</span>
        <button type="button" class="mh-updates-trigger mono" title="打开最近更新面板（Shift + U）" @click="emit('openUpdates')">最后更新 <ManualOdo :value="year" />-<ManualOdo :value="month" />-<ManualOdo :value="day" /> <span v-if="(unreadCount || 0) > 0" class="mh-updates-badge">+{{ unreadCount }}</span><span class="mh-updates-arrow" aria-hidden="true">↗</span></button>
      </div>
      <h1 ref="titleEl" class="mh-title" aria-label="ENDLESSYOUNG">
        <span v-for="(ch, i) in title" :key="i" class="ch" aria-hidden="true">{{ ch }}</span>
      </h1>
      <div class="mh-foot">
        <p class="mh-lede">Android、Java 与 AI 的原理笔记。<br>写给想弄懂「为什么」的工程师。</p>
        <dl class="mh-stats">
          <div><dt class="mono">ARTICLES</dt><dd><ManualOdo :value="String(stats.articles)" /></dd></div>
          <div><dt class="mono">PARTS</dt><dd><ManualOdo :value="pad(stats.parts)" /></dd></div>
          <div><dt class="mono">CHAPTERS</dt><dd><ManualOdo :value="pad(stats.chapters)" /></dd></div>
        </dl>
      </div>
    </section>

    <section class="block wrap" id="manual-contents">
      <header class="block-head">
        <span class="mono block-num">§ A</span>
        <h2>目录</h2>
      </header>
      <div class="contents-grid">
        <div
          class="parts"
          @pointerover="onCatalogOver"
          @pointerout="onCatalogOut"
          @focusin="onCatalogFocus"
          @focusout="focusPreview = null"
          @keydown="onCatalogKey"
        >
          <div
            v-for="part in parts"
            :key="part.id"
            class="part"
            :class="{ open: openId === part.id, landing: !!landingPath && openId === part.id }"
          >
            <button
              class="part-row"
              type="button"
              :data-part="part.id"
              :aria-expanded="openId === part.id"
              @click="togglePart(part)"
              @mouseenter="onPartEnter($event, part)"
              @focus="onPartEnter($event, part)"
            >
              <span class="part-num">{{ part.id }}</span>
              <span class="part-name">{{ part.name }}</span>
              <span class="leader" />
              <span class="part-count"><ManualOdo :value="String(part.count)" /></span>
              <span class="part-toggle" />
            </button>
            <div class="part-body" :inert="openId !== part.id">
              <div v-if="openId === part.id && activeCategory" class="part-inner">
                <div class="category-switcher" role="group" :aria-label="`${part.name}分类`">
                  <button
                    v-for="category in part.categories"
                    :key="category.root"
                    class="category-trigger"
                    type="button"
                    :aria-pressed="category.root === activeCategory.root"
                    @click="selectCategory(category)"
                  >{{ category.name }}</button>
                </div>
                <ManualCategoryCover class="category-inline" :category="activeCategory" />
                <div class="chapters">
                  <div
                    v-for="(chapter, ci) in activeCategory.chapters"
                    :key="chapter.name"
                    class="chap"
                    :style="{ '--i': ci }"
                  >
                    <div class="chap-head mono">
                      <span>{{ chapter.shortName }}</span>
                      <span>{{ pad(chapter.articles.length) }}</span>
                    </div>
                    <ul>
                      <li v-for="article in chapter.articles" :key="article.num">
                        <a
                          v-if="!isSpacer(article.link)"
                          class="manual-art-link art-link"
                          :class="{ 'has-fig': figTitles.has(article.title) }"
                          :href="withBase(article.link)"
                          :data-path="normPath(article.link)"
                          data-peek
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
          </div>
        </div>
        <aside class="flap" aria-live="polite">
          <div class="flap-label mono">PREVIEW</div>
          <div class="flap-stage">
            <Transition :css="false" @enter="enterCard" @leave="leaveCard">
              <div :key="flapKey" class="flap-card">
                <template v-if="flap.kind === 'intro'">
                  <div class="fc-num">START HERE</div>
                  <div class="fc-title">从带交互图的笔记开始</div>
                  <ul>
                    <li v-for="card in figs" :key="card.article.num">
                      <span>{{ card.article.num }}</span><span>{{ card.article.title }}</span>
                    </li>
                  </ul>
                </template>
                <template v-else-if="flap.kind === 'part'">
                  <div class="fc-num">PART {{ flap.part.id }}</div>
                  <div class="fc-title">{{ flap.part.name }}</div>
                  <p class="fc-sum">{{ flap.part.chapters.map((chapter) => chapter.name).join(' / ') }}</p>
                  <div class="fc-meta mono"><span>{{ flap.part.count }} 篇</span><span>{{ flap.part.chapters.length }} 章</span></div>
                </template>
                <ManualCategoryCover v-else-if="flap.kind === 'category'" :category="flap.category" />
                <template v-else>
                  <div class="fc-num">{{ flap.num }}</div>
                  <div class="fc-title">{{ flap.title }}</div>
                  <p class="fc-sum article-preview-summary">{{ flap.summary }}</p>
                  <div class="fc-meta mono"><span>{{ flap.meta }}</span></div>
                </template>
              </div>
            </Transition>
          </div>
        </aside>
      </div>
    </section>

    <section class="block wrap">
      <header class="block-head">
        <span class="mono block-num">§ B</span>
        <h2>图集</h2>
      </header>
    </section>
    <ManualGallery :cards="figs" />

    <section class="block wrap" id="changelog">
      <header class="block-head block-head-split">
        <div class="block-head-main">
          <span class="mono block-num">§ C</span>
          <h2>更新日志</h2>
        </div>
        <button type="button" class="log-panel-trigger mono" @click="emit('openUpdates')">打开完整更新面板 →</button>
      </header>
      <ol class="log">
        <li v-for="row in logs" :key="row.article.num">
          <a
            class="log-row manual-art-link"
            :href="withBase(row.article.link)"
            :data-path="normPath(row.article.link)"
            data-peek
          >
            <span class="log-date">{{ row.updated }}</span>
            <span class="art-num" data-vt>{{ row.article.num }}</span>
            <span class="art-title" data-vt>{{ row.article.title }}</span>
            <span class="log-part" :title="`${row.part.name} · ${row.chapter.name}`">{{ row.part.name }} · {{ row.chapter.name }}</span>
            <span class="log-arrow">→</span>
          </a>
        </li>
      </ol>
      <p v-if="!logs.length" class="block-desc">还没有读到提交记录。</p>
    </section>

    <section class="block wrap" id="index">
      <header class="block-head">
        <span class="mono block-num">§ D</span>
        <h2>索引</h2>
      </header>
      <p class="block-desc"><a class="u-link" :href="withBase('/archives.html')">全部文章目录</a> · <a class="u-link" :href="withBase('/tags/')">按标签浏览</a></p>
      <div class="terms">
        <div v-for="group in groups" :key="group.key" class="term-group">
          <h4>{{ group.key }}</h4>
          <a
            v-for="entry in group.entries"
            :key="entry.tag"
            class="u-link"
            :href="withBase(entry.url)"
            :data-path="normPath(entry.url)"
            data-peek
          >{{ entry.tag }}</a>
        </div>
      </div>
    </section>

    <footer class="ey-foot wrap mono">
      <span>© 2019–{{ year }} ENDLESS YOUNG</span>
      <span>技术参考手册</span>
    </footer>
  </div>
</template>

<style scoped>
.category-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 0 18px;
  margin: 0 0 12px 88px;
  border-bottom: 1px solid var(--man-line);
}

.category-trigger {
  min-height: 44px;
  padding: 0 6px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--man-fg-2);
  font: 500 14px/1.2 var(--man-display);
  cursor: pointer;
}

.category-trigger:hover,
.category-trigger[aria-pressed='true'] {
  color: var(--man-fg);
}

.category-trigger[aria-pressed='true'] {
  border-bottom-color: var(--accent);
  font-weight: 700;
}

.category-trigger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -3px;
}

.category-inline { display: none; }

.article-preview-summary {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.parts .art-link { scroll-margin-top: calc(var(--ey-top) + 16px); }

@media (max-width: 900px) {
  .category-switcher { margin-left: 0; }
  .category-inline {
    display: block;
    margin: 16px 0 12px;
  }
}

.mh-updates-trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  border-bottom: 1px dashed var(--man-line-2);
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  cursor: pointer;
  transition: color var(--man-tick), border-color var(--man-tick);
}
.mh-updates-trigger:hover {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
.mh-updates-arrow {
  font-size: 11px;
  opacity: 0.75;
}
.block-head-split {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}
.block-head-main {
  display: inline-flex;
  align-items: baseline;
  gap: 16px;
}
.log-panel-trigger {
  padding: 5px 10px;
  border: 1px solid var(--man-line-2);
  background: transparent;
  color: var(--man-fg-2);
  font-size: 12px;
  cursor: pointer;
  transition: border-color var(--man-tick), color var(--man-tick);
}
.log-panel-trigger:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.mh-updates-badge {
  margin-left: 4px;
  padding: 0 5px;
  background: var(--accent);
  color: var(--accent-ink);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
}
</style>
