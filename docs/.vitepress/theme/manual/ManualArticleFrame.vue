<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { buildManualCatalog, findManualArticle, normPath } from '../reading/catalog'
import ManualRuler from './ManualRuler.vue'
import SeriesNav from '../components/SeriesNav.vue'
import RelatedArticles from '../components/RelatedArticles.vue'
import Comments from '../components/Comments.vue'

interface Head {
  id: string
  level: number
  title: string
}

const { theme, page, frontmatter } = useData()
const route = useRoute()
const panel = ref<'chapter' | 'outline' | null>(null)
const minutes = ref(0)
const heads = ref<Head[]>([])
const sideList = ref<HTMLElement | null>(null)

const parts = computed(() => buildManualCatalog(theme.value.sidebar))
const hit = computed(() => findManualArticle(parts.value, route.path))
const title = computed(() => page.value.title || hit.value?.article.title || '')
const current = computed(() => normPath(route.path))

function day(value: unknown) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(typeof value === 'number' ? value : String(value))
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

const created = computed(() => day(frontmatter.value.created))
const updated = computed(() => (page.value.lastUpdated ? day(page.value.lastUpdated) : ''))

function measure() {
  nextTick(() => {
    const prose = document.querySelector<HTMLElement>('.m-prose')
    if (!prose) return
    const text = prose.innerText || ''
    const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const latin = (text.match(/[A-Za-z0-9]+/g) || []).length
    minutes.value = Math.max(1, Math.round((cjk + latin) / 400))
    heads.value = [...prose.querySelectorAll<HTMLElement>('h2[id], h3[id]')].map((el) => ({
      id: el.id,
      level: Number(el.tagName.slice(1)),
      title: (el.textContent || '').replace(/[\u200b#]/g, '').trim(),
    }))
    const list = sideList.value
    const on = list?.querySelector<HTMLElement>('.on')
    if (list && on) list.scrollTop = on.offsetTop - list.clientHeight / 3
  })
}

function toggle(next: 'chapter' | 'outline') {
  panel.value = panel.value === next ? null : next
}

function jump(id: string) {
  panel.value = null
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 88
  window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

watch(() => route.path, () => {
  panel.value = null
  measure()
})
onMounted(measure)
</script>

<template>
  <div class="m-article wrap">
    <header class="a-head row">
      <div class="main">
        <a class="a-back mono" :href="withBase('/')">← 返回目录</a>
        <span v-if="hit" class="a-num manual-a-num" data-vt>{{ hit.article.num }}</span>
        <h1 class="a-title">{{ title }}</h1>
        <div class="a-meta mono">
          <span v-if="hit">部分 <b>{{ hit.part.id }} {{ hit.part.name }}</b></span>
          <span v-if="hit">章节 <b>{{ hit.chapter.name }} {{ pad(hit.index) }}/{{ pad(hit.total) }}</b></span>
          <span v-if="created">创建 <b>{{ created }}</b></span>
          <span v-if="updated">更新 <b>{{ updated }}</b></span>
          <span v-if="minutes">约 <b>{{ minutes }}</b> 分钟</span>
          <span>阅读 <b class="waline-pageview-count" :data-path="route.path">–</b></span>
        </div>
      </div>
    </header>

    <div class="a-tools">
      <button v-if="hit" type="button" class="a-tool-chap" :class="{ on: panel === 'chapter' }" @click="toggle('chapter')">本章</button>
      <button v-if="heads.length" type="button" :class="{ on: panel === 'outline' }" @click="toggle('outline')">大纲</button>
    </div>
    <div v-if="panel === 'outline'" class="a-drawer">
      <button
        v-for="(head, i) in heads"
        :key="head.id"
        type="button"
        class="a-drawer-row"
        :class="`l${head.level}`"
        @click="jump(head.id)"
      >
        <span class="mono">{{ head.level === 2 ? `§${heads.slice(0, i + 1).filter((h) => h.level === 2).length}` : '' }}</span>
        <span>{{ head.title }}</span>
      </button>
    </div>

    <div class="row a-body">
      <div class="main m-prose vp-doc">
        <Content />
      </div>
      <aside v-if="hit" class="side a-side" :class="{ open: panel === 'chapter' }">
        <div class="a-side-in">
          <div class="a-side-label mono">
            <span>本章</span>
            <span>{{ pad(hit.index) }} / {{ pad(hit.total) }}</span>
          </div>
          <p class="a-side-name">{{ hit.chapter.name }}</p>
          <ol ref="sideList" class="a-chap">
            <li v-for="article in hit.chapter.articles" :key="article.num">
              <a
                class="manual-art-link a-chap-link"
                :class="{ on: normPath(article.link) === current }"
                :aria-current="normPath(article.link) === current ? 'page' : undefined"
                :href="normPath(article.link) === current ? undefined : withBase(article.link)"
                @click="normPath(article.link) === current && (panel = null)"
                :data-path="normPath(article.link)"
              >
                <span class="art-num" data-vt>{{ article.num }}</span>
                <span class="art-title" data-vt>{{ article.title }}</span>
              </a>
            </li>
          </ol>
        </div>
      </aside>
    </div>

    <div class="row a-foot">
      <div class="main">
        <SeriesNav />
        <RelatedArticles />
        <section class="a-comments">
          <div class="a-label mono"><span>评论</span><span>WALINE</span></div>
          <Comments />
        </section>
      </div>
    </div>
  </div>
  <ManualRuler />
</template>
