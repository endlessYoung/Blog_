<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { buildManualCatalog, catalogStats, findManualArticle, normPath, type ManualArticle, type ManualPart } from '../reading/catalog'
import { useReturnLanding } from '../reading/landing'
import { pageMeta, recentPages, termGroups } from '../reading/corpus'
import ManualOdo from './ManualOdo.vue'
import ManualGallery from './ManualGallery.vue'
import { EASE_OUT, playMastheadIntro, reducedMotion, rollOdo, shouldPlayIntro } from './motion'

const { theme } = useData()
const parts = computed(() => buildManualCatalog(theme.value.sidebar))
const stats = computed(() => catalogStats(parts.value))
const { openId, landingPath, showArticles, isSpacer } = useReturnLanding(() => parts.value, 'ey-manual-return', 'ey-manual-returned')
const titleEl = ref<HTMLElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)
const flapKey = ref('intro')

const now = new Date()
const year = String(now.getFullYear())
const month = String(now.getMonth() + 1).padStart(2, '0')
const day = String(now.getDate()).padStart(2, '0')
const title = 'ENDLESSYOUNG'
const groups = termGroups()

const FIG_DEFS = [
  { title: 'Handler', kind: 'loop' as const, caption: 'Looper 不断从队列取出消息' },
  { title: 'CAS', kind: 'cas' as const, caption: '两个线程竞争同一个变量' },
  { title: '二分查找', kind: 'bin' as const, caption: '指针收敛到目标元素' },
]

const figs = computed(() => {
  const cards: { article: ManualArticle; kind: 'cas' | 'bin' | 'loop'; caption: string; fig: string }[] = []
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

type Flap =
  | { kind: 'intro' }
  | { kind: 'part'; part: ManualPart }
  | { kind: 'article'; num: string; title: string; summary: string; meta: string }

const flap = ref<Flap>({ kind: 'intro' })

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function togglePart(part: ManualPart) {
  landingPath.value = null
  openId.value = openId.value === part.id ? null : part.id
}

function showFlap(key: string, next: Flap) {
  if (flapKey.value === key) return
  flapKey.value = key
  flap.value = next
}

function onPartEnter(event: Event) {
  const count = (event.currentTarget as HTMLElement).querySelector<HTMLElement>('.part-count')
  if (count) rollOdo(count)
  const row = event.currentTarget as HTMLElement
  const part = parts.value.find((item) => item.id === row.dataset.part)
  if (!part) return
  showFlap(`part-${part.id}`, { kind: 'part', part })
}

function onCatalogOver(event: PointerEvent) {
  const node = event.target instanceof Element ? event.target : null
  const link = node?.closest('a.art-link') as HTMLAnchorElement | null
  if (link) {
    const hit = findManualArticle(parts.value, link.dataset.path || link.getAttribute('href') || '')
    if (!hit) return
    const meta = pageMeta(hit.article.link)
    showFlap(hit.article.num, {
      kind: 'article',
      num: hit.article.num,
      title: hit.article.title,
      summary: `${hit.part.name} · ${hit.chapter.name}`,
      meta: `第 ${hit.index} / ${hit.total} 篇${meta?.updated ? ` · ${meta.updated}` : ''}${figTitles.value.has(hit.article.title) ? ' · 含交互图' : ''}`,
    })
  }
}

function onCatalogKey(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const root = event.currentTarget as HTMLElement
  const items = [...root.querySelectorAll<HTMLElement>('.part-row, .part.open .art-link')]
  const index = items.indexOf(document.activeElement as HTMLElement)
  if (index < 0) return
  event.preventDefault()
  const next = items[Math.max(0, Math.min(items.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))]
  next?.focus()
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

onMounted(async () => {
  await nextTick()
  if (titleEl.value && shouldPlayIntro()) playIntro()
})
</script>

<template>
  <div ref="rootEl" class="manual-home">
    <section class="masthead wrap">
      <div class="mh-meta mono">
        <span>VOL.{{ year }} · 技术参考手册</span>
        <span>最后更新 <ManualOdo :value="year" />-<ManualOdo :value="month" />-<ManualOdo :value="day" /></span>
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
        <p class="block-desc">点击某一部分展开章节，悬停文章可在右侧预览。键盘上下键也能操作。</p>
      </header>
      <div class="contents-grid">
        <div class="parts" @pointerover="onCatalogOver" @keydown="onCatalogKey">
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
              @mouseenter="onPartEnter"
              @focus="onPartEnter"
            >
              <span class="part-num">{{ part.id }}</span>
              <span class="part-name">{{ part.name }}</span>
              <span class="leader" />
              <span class="part-count"><ManualOdo :value="String(part.count)" /></span>
              <span class="part-toggle" />
            </button>
            <div class="part-body" :inert="openId !== part.id">
              <div class="part-inner">
                <div class="chapters">
                  <div
                    v-for="(chapter, ci) in part.chapters"
                    :key="chapter.name"
                    class="chap"
                    :style="{ '--i': ci }"
                  >
                    <div class="chap-head mono">
                      <span>{{ chapter.name }}</span>
                      <span>{{ pad(chapter.articles.length) }}</span>
                    </div>
                    <ul v-if="showArticles(part.id)">
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
                  <p class="fc-sum">图集里的三篇对应站内已有文章，卡片里的小图会自己动。</p>
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
                <template v-else>
                  <div class="fc-num">{{ flap.num }}</div>
                  <div class="fc-title">{{ flap.title }}</div>
                  <p class="fc-sum">{{ flap.summary }}</p>
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
        <p class="block-desc">站内可交互讲解的缩略版。按住拖动浏览，点击进入文章。</p>
      </header>
    </section>
    <ManualGallery :cards="figs" />

    <section class="block wrap" id="changelog">
      <header class="block-head">
        <span class="mono block-num">§ C</span>
        <h2>更新日志</h2>
        <p class="block-desc">最近改过的文章，时间来自仓库提交。</p>
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
        <p class="block-desc">按文章标签查找。悬停条目可以预览对应文章。</p>
      </header>
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
