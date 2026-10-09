<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import ManualOdo from './ManualOdo.vue'
import { reducedMotion, rollOdo } from './motion'
import { buildManualCatalog, findManualArticle, normPath, type ManualArticle } from '../reading/catalog'
import { recentPages } from '../reading/corpus'

const emit = defineEmits<{ search: [query: string] }>()

interface Row {
  num: string
  title: string
  link: string
  trail: string
}

const route = useRoute()
const { theme } = useData()
const root = ref<HTMLElement | null>(null)
const code = ref<HTMLElement | null>(null)

const parts = computed(() => buildManualCatalog(theme.value.sidebar))

const lostPath = computed(() => {
  const path = normPath(route.path)
  return path === '/' || path === '/404' ? '' : path
})

const keyword = computed(() => {
  const last = lostPath.value.split('/').filter(Boolean).pop() || ''
  return last.replace(/[-_]+/g, ' ').trim()
})

function grams(text: string) {
  const clean = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  if (clean.length < 2) return new Set(clean ? [clean] : [])
  const out = new Set<string>()
  for (let i = 0; i < clean.length - 1; i++) out.add(clean.slice(i, i + 2))
  return out
}

function dice(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0
  let hit = 0
  a.forEach((g) => { if (b.has(g)) hit++ })
  return (2 * hit) / (a.size + b.size)
}

function rowOf(article: ManualArticle, part: string, chapter: string): Row {
  return { num: article.num, title: article.title, link: article.link, trail: `${part} / ${chapter}` }
}

const suggestions = computed<Row[]>(() => {
  const target = grams(keyword.value)
  if (!target.size) return []
  const dir = lostPath.value.split('/').filter(Boolean)[0]?.toLowerCase()
  const scored: { row: Row; score: number }[] = []
  for (const part of parts.value) {
    for (const chapter of part.chapters) {
      for (const article of chapter.articles) {
        const tail = normPath(article.link).split('/').pop() || ''
        let score = Math.max(dice(target, grams(article.title)), dice(target, grams(tail)))
        if (score && dir && normPath(article.link).split('/')[1]?.toLowerCase() === dir) score += 0.15
        if (score >= 0.3) scored.push({ row: rowOf(article, part.name, chapter.name), score })
      }
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, 5).map((s) => s.row)
})

const recent = computed<Row[]>(() => recentPages(12)
  .map((page) => {
    const hit = findManualArticle(parts.value, page.url)
    return hit ? rowOf(hit.article, hit.part.name, hit.chapter.name) : null
  })
  .filter((row): row is Row => !!row)
  .slice(0, 5))

const rows = computed(() => (suggestions.value.length ? suggestions.value : recent.value))

const index = computed(() => parts.value.map((part) => ({
  id: part.id,
  name: part.name,
  count: part.count,
  link: part.chapters[0]?.articles[0]?.link || '/',
})))

onMounted(async () => {
  await nextTick()
  if (reducedMotion() || !root.value) return
  root.value.classList.add('nf-play')
  if (code.value) rollOdo(code.value, 120)
})
</script>

<template>
  <section ref="root" class="nf-page wrap" aria-labelledby="nf-title">
    <div class="nf-meta mono">
      <span>ERRATA · 勘误</span>
      <span>STATUS 404</span>
    </div>

    <div class="nf-hero">
      <p ref="code" class="nf-code" aria-hidden="true">
        <ManualOdo value="4" /><span class="nf-zero"><ManualOdo value="0" /></span><ManualOdo value="4" />
      </p>
      <div class="nf-copy">
        <h1 id="nf-title" class="nf-title">这一页不在手册里</h1>
        <p class="nf-lede">
          链接可能已经过期、地址拼写有误，或者文章换了位置。{{ suggestions.length ? '下面是按地址猜测的几篇，' : '可以从最近更新或目录继续，' }}也可以直接搜索。
        </p>
        <p v-if="lostPath" class="nf-path mono">
          <span class="nf-path-k">请求</span>
          <code class="nf-path-v"><s>{{ lostPath }}</s></code>
        </p>
        <div class="nf-actions">
          <a class="nf-btn nf-btn-main" :href="withBase('/')">
            <span>回到目录</span><span class="nf-btn-k mono">HOME</span>
          </a>
          <button type="button" class="nf-btn" @click="emit('search', keyword)">
            <span>{{ keyword ? `搜索「${keyword}」` : '搜索全部文章' }}</span><kbd class="mono">/</kbd>
          </button>
        </div>
      </div>
    </div>

    <div class="nf-cols">
      <nav class="nf-block" aria-labelledby="nf-guess">
        <div id="nf-guess" class="nf-label mono">
          <span>{{ suggestions.length ? '可能在找' : '最近更新' }}</span>
          <span>{{ String(rows.length).padStart(2, '0') }}</span>
        </div>
        <ol class="nf-list">
          <li v-for="(row, i) in rows" :key="row.link" :style="{ '--i': i }">
            <a class="manual-art-link nf-row" :href="withBase(row.link)" :data-path="normPath(row.link)">
              <span class="art-num" data-vt>{{ row.num }}</span>
              <span class="nf-row-main">
                <span class="art-title" data-vt>{{ row.title }}</span>
                <span class="nf-row-trail">{{ row.trail }}</span>
              </span>
              <span class="nf-row-go" aria-hidden="true">&rarr;</span>
            </a>
          </li>
        </ol>
      </nav>

      <nav class="nf-block" aria-labelledby="nf-index">
        <div id="nf-index" class="nf-label mono">
          <span>从目录继续</span>
          <span>{{ String(index.length).padStart(2, '0') }} PARTS</span>
        </div>
        <ol class="nf-list">
          <li v-for="(part, i) in index" :key="part.id" :style="{ '--i': i + rows.length }">
            <a class="nf-row nf-part" :href="withBase(part.link)">
              <span class="art-num">{{ part.id }}</span>
              <span class="nf-row-main"><span class="art-title">{{ part.name }}</span></span>
              <span class="nf-row-count mono">{{ part.count }} 篇</span>
            </a>
          </li>
        </ol>
      </nav>
    </div>
  </section>
</template>
