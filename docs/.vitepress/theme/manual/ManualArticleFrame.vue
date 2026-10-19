<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'
import { buildManualCatalog, findManualArticle, normPath } from '../reading/catalog'
import ManualRuler from './ManualRuler.vue'
import { figureFor } from './figures'
import { manualFigureKey, manualNumKey } from './figureContext'
import { markHeadings } from './headingNo'
import SeriesNav from '../components/SeriesNav.vue'
import RelatedArticles from '../components/RelatedArticles.vue'
import Comments from '../components/Comments.vue'

interface Head {
  id: string
  level: number
  no: string
  title: string
}

const { theme, page, frontmatter } = useData()
const route = useRoute()
const panel = ref<'chapter' | 'outline' | null>(null)
const minutes = ref(0)
const heads = ref<Head[]>([])
const sideList = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const openChapter = ref('')
const motion = ref(false)
const swapping = ref(false)
let chapterMotion = 0

const parts = computed(() => buildManualCatalog(theme.value.sidebar))
const hit = computed(() => findManualArticle(parts.value, route.path))
const title = computed(() => page.value.title || hit.value?.article.title || '')
const figure = computed(() => figureFor(title.value))
provide(manualFigureKey, figure)
provide(manualNumKey, computed(() => hit.value?.article.num ?? ''))
const current = computed(() => normPath(route.path))
const siblings = computed(() => {
  const found = hit.value
  if (!found) return []
  return found.part.chapters.filter((chapter) => chapter.root === found.chapter.root)
})
const openedArticles = computed(() => siblings.value.find((chapter) => chapter.name === openChapter.value)?.articles ?? [])

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
    const prose = document.querySelector<HTMLElement>('.cas-doc') || document.querySelector<HTMLElement>('.m-prose')
    if (!prose) return
    const text = prose.innerText || ''
    const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const latin = (text.match(/[A-Za-z0-9]+/g) || []).length
    minutes.value = Math.max(1, Math.round((cjk + latin) / 400))
    heads.value = markHeadings(prose)
    const list = sideList.value
    const on = list?.querySelector<HTMLElement>('.a-chap-link.on')
    if (list && on) {
      const delta = on.getBoundingClientRect().top - list.getBoundingClientRect().top
      list.scrollTop += delta - list.clientHeight / 3
    }
    const chapter = list?.querySelector<HTMLElement>('.a-chap-name.on')
    const chapters = chapter?.parentElement
    if (chapters && chapter && chapter.offsetTop > chapters.clientHeight) {
      chapters.scrollTop = chapter.offsetTop
    }
  })
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function setChapter(name: string) {
  const node = panelEl.value
  const skip = !motion.value || reducedMotion()
  const from = node ? node.getBoundingClientRect().height : 0
  const token = ++chapterMotion
  if (!skip) swapping.value = true
  openChapter.value = name
  if (skip || !node) return
  nextTick(() => {
    if (token !== chapterMotion) return
    const to = node.scrollHeight
    if (Math.abs(from - to) < 1) {
      swapping.value = false
      node.style.height = ''
      return
    }
    node.style.height = `${from}px`
    node.getBoundingClientRect()
    node.style.height = `${to}px`
    const finish = () => {
      if (token !== chapterMotion) return
      node.style.height = ''
      swapping.value = false
    }
    const clear = (event: TransitionEvent) => {
      if (event.propertyName !== 'height') return
      node.removeEventListener('transitionend', clear)
      finish()
    }
    node.addEventListener('transitionend', clear)
    window.setTimeout(() => {
      node.removeEventListener('transitionend', clear)
      finish()
    }, 700)
  })
}

function toggleChapter(name: string) {
  setChapter(openChapter.value === name ? '' : name)
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

watch(hit, (found) => {
  if (!found) return
  if (!motion.value) {
    openChapter.value = found.chapter.name
    return
  }
  if (found.chapter.name !== openChapter.value) setChapter(found.chapter.name)
}, { immediate: true })

watch(() => route.path, () => {
  panel.value = null
  measure()
})
onMounted(() => {
  measure()
  requestAnimationFrame(() => { motion.value = true })
})
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
          <span v-if="hit">章节 <b>{{ hit.chapter.shortName }} {{ pad(hit.index) }}/{{ pad(hit.total) }}</b></span>
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
        v-for="head in heads"
        :key="head.id"
        type="button"
        class="a-drawer-row"
        :class="`l${head.level}`"
        @click="jump(head.id)"
      >
        <span class="mono">{{ head.no }}</span>
        <span>{{ head.title }}</span>
      </button>
    </div>

    <div class="row a-body">
      <div class="main">
        <div class="m-prose vp-doc">
          <Content />
        </div>
      </div>
      <aside v-if="hit" class="side a-side" :class="{ open: panel === 'chapter' }">
        <div class="a-side-in">
          <div class="a-side-label mono">
            <span>{{ siblings.length > 1 ? hit.chapter.rootLabel : '本章' }}</span>
            <span>{{ pad(hit.index) }} / {{ pad(hit.total) }}</span>
          </div>
          <ol ref="sideList" class="a-chap" :class="{ 'is-motion': motion, 'is-swap': swapping }">
            <li v-if="siblings.length > 1" class="a-chap-switch" role="presentation">
              <div class="a-chap-heads">
                <button
                  v-for="chapter in siblings"
                  :key="chapter.name"
                  type="button"
                  class="a-chap-name"
                  :class="{ on: chapter.name === hit.chapter.name, open: chapter.name === openChapter }"
                  :aria-expanded="chapter.name === openChapter"
                  @click="toggleChapter(chapter.name)"
                >
                  <span>{{ chapter.shortName }}</span>
                  <span class="mono">{{ chapter.name === hit.chapter.name ? `${pad(hit.index)}/${pad(hit.total)}` : pad(chapter.articles.length) }}</span>
                  <i class="a-chap-toggle" aria-hidden="true" />
                </button>
              </div>
              <div ref="panelEl" class="a-chap-panel">
                <a
                  v-for="(article, i) in openedArticles"
                  :key="article.link"
                  class="manual-art-link a-chap-link"
                  :style="{ '--i': i }"
                  :class="{ on: normPath(article.link) === current }"
                  :aria-current="normPath(article.link) === current ? 'page' : undefined"
                  :href="normPath(article.link) === current ? undefined : withBase(article.link)"
                  @click="normPath(article.link) === current && (panel = null)"
                  :data-path="normPath(article.link)"
                >
                  <span class="art-num" data-vt>{{ article.num }}</span>
                  <span class="art-title" data-vt>{{ article.title }}</span>
                </a>
              </div>
            </li>
            <template v-else>
              <li><p class="a-side-name">{{ hit.chapter.shortName }}</p></li>
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
            </template>
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
