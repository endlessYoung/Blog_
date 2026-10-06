<template>
  <div class="eng-home">
    <!-- ================= 刊头 (Masthead) ================= -->
    <section class="masthead wrap">
      <div class="mh-meta mono">
        <span>VOL.2026 · 技术参考手册</span>
        <span>最后更新 <span class="odo">{{ lastUpdateDisplay }}</span></span>
      </div>
      <h1 class="mh-title" id="mhTitle" aria-label="ENDLESSYOUNG">
        <span v-for="(ch, idx) in titleChars" :key="idx" class="ch" :class="{ 'ch-accent': idx === titleChars.length - 1 }">{{ ch }}</span>
      </h1>
      <div class="mh-foot">
        <p class="mh-lede">
          Android、Java 与 AI 的原理笔记。<br />
          写给想弄懂“为什么”的工程师。
        </p>
        <dl class="mh-stats">
          <div>
            <dt class="mono">ARTICLES</dt>
            <dd><span class="odo">{{ totalArticles }}</span></dd>
          </div>
          <div>
            <dt class="mono">PARTS</dt>
            <dd><span class="odo">{{ String(totalParts).padStart(2, '0') }}</span></dd>
          </div>
          <div>
            <dt class="mono">CHAPTERS</dt>
            <dd><span class="odo">{{ String(totalChapters).padStart(2, '0') }}</span></dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- ================= § A 目录 (Contents) ================= -->
    <section id="contents" class="block wrap">
      <header class="block-head">
        <span class="mono block-num">§ A</span>
        <h2>目录</h2>
        <p class="block-desc">点击某一部分展开章节，悬停文章可在右侧预览。支持直接点击阅读。</p>
      </header>

      <div class="contents-grid">
        <!-- 左侧 8 栏：部分与章节手风琴 -->
        <div class="parts" id="parts">
          <div
            v-for="(part, pIdx) in partsList"
            :key="part.id"
            class="part"
            :class="{ open: openParts.has(part.id) }"
          >
            <button
              class="part-row"
              :aria-expanded="openParts.has(part.id)"
              @click="togglePart(part.id)"
              @mouseenter="hoverPart(part)"
            >
              <span class="part-num">{{ part.id }}</span>
              <span class="part-name">{{ part.name }}</span>
              <span class="leader"></span>
              <span class="part-count odo">{{ part.count }}</span>
              <span class="part-toggle"></span>
            </button>

            <div class="part-body" :style="{ gridTemplateRows: openParts.has(part.id) ? '1fr' : '0fr' }">
              <div class="part-inner">
                <div class="chapters">
                  <div
                    v-for="(chap, cIdx) in part.chapters"
                    :key="chap.name"
                    class="chap"
                    :style="{ '--i': cIdx }"
                  >
                    <div class="chap-head mono">
                      <span>{{ chap.name }}</span>
                      <span>{{ String(chap.articles.length).padStart(2, '0') }}</span>
                    </div>
                    <ul>
                      <li v-for="art in chap.articles" :key="art.url">
                        <a
                          :href="art.url"
                          class="art-link"
                          :class="{ 'has-fig': art.hasDiagram }"
                          @mouseenter="hoverArticle(art)"
                        >
                          <span class="art-num">{{ art.code }}</span>
                          <span class="art-title">{{ art.title }}</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 4 栏：FLAP PREVIEW 翻牌预览 -->
        <aside class="flap" aria-live="polite">
          <div class="flap-label mono">PREVIEW</div>
          <div class="flap-stage" ref="flapStageRef">
            <transition name="flap-flip" mode="out-in">
              <div :key="previewCard.key" class="flap-card">
                <div class="fc-num">{{ previewCard.num }}</div>
                <div class="fc-title">{{ previewCard.title }}</div>
                <p class="fc-sum">{{ previewCard.summary }}</p>
                <div class="fc-meta mono">
                  <span>{{ previewCard.meta1 }}</span>
                  <span>{{ previewCard.meta2 }}</span>
                  <span v-if="previewCard.hasFig" style="color: var(--accent);">含交互图</span>
                </div>
                <ul v-if="previewCard.items && previewCard.items.length > 0">
                  <li v-for="(item, iIdx) in previewCard.items" :key="iIdx">
                    <span>{{ item.label }}</span>
                    <span>{{ item.text }}</span>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </aside>
      </div>
    </section>

    <!-- ================= § B 图集 (Figures) ================= -->
    <section id="figures" class="block wrap">
      <header class="block-head">
        <span class="mono block-num">§ B</span>
        <h2>图集</h2>
        <p class="block-desc">站内可交互讲解的缩略版。悬停激活演示，点击进入对应原理文章。</p>
      </header>
    </section>

    <div class="gallery" id="gallery">
      <div class="gallery-track">
        <!-- 卡片 1: CAS 内存竞争 -->
        <a href="/Java/CAS" class="fig-card" :class="{ running: activeCard === 1 }" @mouseenter="activeCard = 1" @mouseleave="activeCard = 0">
          <div class="fig-stage m-cas">
            <div class="mem">
              <span>0</span>
              <span>1</span>
              <span>2</span>
            </div>
            <div class="th t1">T1</div>
            <div class="th t2">T2</div>
          </div>
          <div class="fig-cap">
            <div class="mono">FIG.01 // ATOMIC</div>
            <h3>比较并交换 (CAS)</h3>
          </div>
        </a>

        <!-- 卡片 2: JVM 分代回收 -->
        <a href="/Java/GC算法" class="fig-card" :class="{ running: activeCard === 2 }" @mouseenter="activeCard = 2" @mouseleave="activeCard = 0">
          <div class="fig-stage m-gen">
            <div class="zone"><b>EDEN</b></div>
            <div class="zone"><b>S0</b></div>
            <div class="zone"><b>S1</b></div>
            <div class="zone"><b>OLD</b></div>
            <div class="objs">
              <i class="obj"></i>
              <i class="obj"></i>
              <i class="obj"></i>
              <i class="obj"></i>
            </div>
          </div>
          <div class="fig-cap">
            <div class="mono">FIG.02 // JVM GC</div>
            <h3>分代垃圾回收</h3>
          </div>
        </a>

        <!-- 卡片 3: 二分查找 -->
        <a href="/数据结构和算法/二分查找" class="fig-card" :class="{ running: activeCard === 3 }" @mouseenter="activeCard = 3" @mouseleave="activeCard = 0">
          <div class="fig-stage m-bin">
            <div class="bars">
              <i style="height: 20px;"></i>
              <i style="height: 35px;"></i>
              <i style="height: 50px;"></i>
              <i style="height: 65px;" class="hit"></i>
              <i style="height: 80px;"></i>
              <i style="height: 95px;"></i>
              <i style="height: 110px;"></i>
            </div>
            <div class="ptr lo"></div>
            <div class="ptr mid"></div>
            <div class="ptr hi"></div>
          </div>
          <div class="fig-cap">
            <div class="mono">FIG.03 // ALGORITHM</div>
            <h3>二分区间收敛</h3>
          </div>
        </a>

        <!-- 卡片 4: Handler 消息循环 -->
        <a href="/Android/Handler" class="fig-card" :class="{ running: activeCard === 4 }" @mouseenter="activeCard = 4" @mouseleave="activeCard = 0">
          <div class="fig-stage m-loop">
            <div class="ring"></div>
            <div class="q">
              <i></i><i></i><i></i>
            </div>
            <span class="lab" style="left: 22px; top: 22px;">QUEUE</span>
            <span class="lab" style="right: 22px; bottom: 22px;">LOOPER</span>
          </div>
          <div class="fig-cap">
            <div class="mono">FIG.04 // ANDROID</div>
            <h3>Handler 消息循环</h3>
          </div>
        </a>
      </div>
    </div>

    <!-- ================= § C 更新日志 (Changelog) ================= -->
    <section id="changelog" class="block wrap">
      <header class="block-head">
        <span class="mono block-num">§ C</span>
        <h2>更新日志</h2>
        <p class="block-desc">近期文章收录与原理更新记录。</p>
      </header>
      <ol class="log">
        <li v-for="log in recentLogs" :key="log.url">
          <a :href="log.url" class="log-row">
            <span class="log-date mono">{{ log.date }}</span>
            <span class="log-tag mono">{{ log.section }}</span>
            <span class="log-title">{{ log.title }}</span>
            <span class="log-arrow">→</span>
          </a>
        </li>
      </ol>
    </section>

    <!-- ================= § D 索引 (Index) ================= -->
    <section id="index" class="block wrap">
      <header class="block-head">
        <span class="mono block-num">§ D</span>
        <h2>索引</h2>
        <p class="block-desc">核心概念速查，点击直达对应原理解析。</p>
      </header>
      <div class="terms">
        <a
          v-for="term in keyTerms"
          :key="term.name"
          :href="term.url"
          class="term"
        >
          <span class="term-k mono">{{ term.char }}</span>
          <span class="term-name">{{ term.name }}</span>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { data as articlesData } from '../../data/articles.data'

const activeCard = ref(0)
const titleChars = 'ENDLESSYOUNG'.split('')

// 格式化日期
const lastUpdateDisplay = computed(() => {
  const d = articlesData?.metrics?.lastUpdated
  if (!d) return '2026-10-04'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
})

const totalArticles = computed(() => articlesData?.metrics?.totalArticles || 312)
const totalParts = computed(() => 5)

// 组织 5 大板块结构
interface ChapterGroup {
  name: string
  articles: Array<{
    code: string
    title: string
    url: string
    hasDiagram: boolean
    description: string
    readingTime: number
    date: string
    categories: string[]
  }>
}

interface PartGroup {
  id: string
  name: string
  count: number
  chapters: ChapterGroup[]
}

const PART_DEFS = [
  { id: '01', name: '移动开发', dirs: ['Android', 'Kotlin', 'Flutter'] },
  { id: '02', name: '后端技术', dirs: ['Java', 'Python', 'SQL'] },
  { id: '03', name: 'AI 与智能体', dirs: ['Ai', 'Agent'] },
  { id: '04', name: '系统与底层', dirs: ['C', 'C++', 'Linux'] },
  { id: '05', name: '算法与数据结构', dirs: ['数据结构和算法'] },
]

const partsList = computed<PartGroup[]>(() => {
  const all = articlesData?.articles || []
  return PART_DEFS.map((pDef) => {
    const partArticles = all.filter((a) => pDef.dirs.includes(a.section))
    
    // 按子目录或分类切分章节
    const chapMap = new Map<string, typeof partArticles>()
    partArticles.forEach((art) => {
      // 从 rel 提取二级目录或分类
      const parts = art.rel.split('/')
      let chapName = parts.length > 2 ? parts[1] : art.section
      if (chapName === 'Compose') chapName = 'Jetpack Compose'
      if (!chapMap.has(chapName)) chapMap.set(chapName, [])
      chapMap.get(chapName)!.push(art)
    })

    const chapters: ChapterGroup[] = []
    let artSeq = 1
    chapMap.forEach((arts, chapName) => {
      chapters.push({
        name: chapName,
        articles: arts.map((a) => {
          const code = `${pDef.id}.${chapName.slice(0, 4).toUpperCase()}.${String(artSeq++).padStart(2, '0')}`
          return {
            code,
            title: a.title,
            url: a.url,
            hasDiagram: a.hasDiagram,
            description: a.description || `「${chapName}」章节下的原理笔记。`,
            readingTime: a.readingTime || 5,
            date: a.created || '2026-10-04',
            categories: a.categories || [],
          }
        }),
      })
    })

    return {
      id: pDef.id,
      name: pDef.name,
      count: partArticles.length,
      chapters,
    }
  })
})

const totalChapters = computed(() => {
  return partsList.value.reduce((acc, p) => acc + p.chapters.length, 0)
})

// 默认展开第一个 Part
const openParts = ref<Set<string>>(new Set(['01']))

function togglePart(id: string) {
  if (openParts.value.has(id)) {
    openParts.value.delete(id)
  } else {
    openParts.value.add(id)
  }
}

// 翻牌预览状态
const previewCard = ref<{
  key: string
  num: string
  title: string
  summary: string
  meta1: string
  meta2: string
  hasFig: boolean
  items?: Array<{ label: string; text: string }>
}>({
  key: 'init',
  num: 'START HERE',
  title: '技术参考手册',
  summary: '包含 Android、Java、Kotlin、AI 智能体与系统底层的 312 篇核心原理解析。',
  meta1: 'VOL.2026',
  meta2: '312 ARTICLES',
  hasFig: true,
  items: [
    { label: '移动开发', text: 'Activity, Handler, Compose, 协程' },
    { label: '后端技术', text: 'CAS, AQS, 线程池, JVM GC, 分代' },
    { label: 'AI 与智能体', text: 'Agent 规划, RAG, MCP 协议, 机器学习' },
  ],
})

function hoverPart(part: PartGroup) {
  previewCard.value = {
    key: `part-${part.id}`,
    num: `PART ${part.id}`,
    title: part.name,
    summary: part.chapters.map((c) => c.name).join(' / '),
    meta1: `${part.count} 篇文章`,
    meta2: `${part.chapters.length} 个章节`,
    hasFig: false,
    items: part.chapters.slice(0, 3).map((c) => ({
      label: c.name,
      text: c.articles.slice(0, 2).map((a) => a.title).join(', '),
    })),
  }
}

function hoverArticle(art: any) {
  previewCard.value = {
    key: `art-${art.code}`,
    num: art.code,
    title: art.title,
    summary: art.description,
    meta1: art.date,
    meta2: `${art.readingTime} MIN`,
    hasFig: art.hasDiagram,
    items: [
      { label: '分类', text: art.categories.join(' · ') || '技术原理' },
      { label: '状态', text: '已归档 · 静态索引' },
    ],
  }
}

// 最近日志列表
const recentLogs = computed(() => {
  const all = articlesData?.articles || []
  return all
    .filter((a) => a.created)
    .sort((a, b) => b.created.localeCompare(a.created))
    .slice(0, 5)
    .map((a) => ({
      date: a.created,
      section: a.sectionLabel || a.section,
      title: a.title,
      url: a.url,
    }))
})

// 核心索引词条
const keyTerms = [
  { char: 'A', name: 'AIDL', url: '/Android/AIDL' },
  { char: 'A', name: 'Activity 生命周期', url: '/Android/Activity的生命周期详解' },
  { char: 'C', name: 'CAS 比较并交换', url: '/Java/CAS' },
  { char: 'C', name: 'Channel 通道', url: '/Kotlin/Channel' },
  { char: 'C', name: 'CompletableFuture', url: '/Java/CompletableFuture' },
  { char: 'F', name: 'Flow 异步流', url: '/Kotlin/Flow' },
  { char: 'F', name: 'ForkJoinPool', url: '/Java/ForkJoinPool' },
  { char: 'G', name: 'GC 算法', url: '/Java/GC算法' },
  { char: 'H', name: 'Handler 机制', url: '/Android/Handler' },
  { char: 'H', name: 'HashMap 结构', url: '/Java/HashMap' },
  { char: 'M', name: 'MCP 协议', url: '/Agent/MCP' },
  { char: 'R', name: 'RAG 检索增强', url: '/Agent/RAG' },
  { char: 'T', name: 'ThreadLocal', url: '/Java/ThreadLocal' },
  { char: '二', name: '二分查找', url: '/数据结构和算法/二分查找' },
  { char: '三', name: '三色标记算法', url: '/Java/三色标记算法' },
  { char: '双', name: '双亲委派机制', url: '/Java/双亲委派机制' },
  { char: '协', name: 'Kotlin 协程', url: '/Kotlin/协程' },
  { char: '线', name: '线程池执行机制', url: '/Java/线程池' },
]

// 刊头逐字动画
onMounted(() => {
  if (typeof window === 'undefined') return
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!isReduced) {
    const chars = document.querySelectorAll('.mh-title .ch')
    chars.forEach((c, i) => {
      const el = c as HTMLElement
      const dx = (((i * 7) % 5) - 2) * 16
      const dy = (((i * 3) % 3) - 1) * 12
      el.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 620, delay: 160 + i * 36, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' }
      )
    })
  }
})
</script>

<style scoped>
.eng-home {
  position: relative;
  z-index: 1;
  width: 100%;
}

.wrap {
  width: 100%;
  max-width: var(--ey-wrap, 1280px);
  margin: 0 auto;
  padding: 0 var(--ey-pad, 40px);
}

.mono {
  font-family: var(--ey-font-mono, monospace);
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

/* ============ 刊头 (Masthead) ============ */
.masthead {
  padding-top: 72px;
  padding-bottom: 96px;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, .08));
}

.mh-meta {
  display: flex;
  justify-content: space-between;
  color: var(--fg-3, #6c6f75);
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, .08));
}

.mh-title {
  margin: 28px 0 0;
  font: 700 clamp(56px, 11.2vw, 156px)/0.9 var(--ey-font-display, 'Space Grotesk', sans-serif);
  letter-spacing: -0.045em;
  white-space: nowrap;
  color: var(--fg, #e9e9e6);
}

.mh-title .ch {
  display: inline-block;
  will-change: transform;
}

.mh-title .ch-accent {
  color: var(--accent, #ff4f00);
}

.mh-foot {
  margin-top: 56px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 24px;
  align-items: end;
}

.mh-lede {
  grid-column: 1 / 7;
  margin: 0;
  font-size: 22px;
  line-height: 1.6;
  color: var(--fg-2, #a4a6ab);
}

.mh-stats {
  grid-column: 7 / 13;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--line-2, rgba(255, 255, 255, .16));
}

.mh-stats > div {
  padding-top: 14px;
}

.mh-stats > div + div {
  border-left: 1px solid var(--line, rgba(255, 255, 255, .08));
  padding-left: 18px;
}

.mh-stats dt {
  color: var(--fg-3, #6c6f75);
}

.mh-stats dd {
  margin: 10px 0 0;
  font: 600 48px/1 var(--ey-font-display, 'Space Grotesk', sans-serif);
  letter-spacing: -0.03em;
  color: var(--fg, #e9e9e6);
}

/* ============ 区块通用 ============ */
.block {
  padding-top: 96px;
}

.block-head {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 24px;
  align-items: baseline;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--fg, #e9e9e6);
}

.block-num {
  grid-column: 1 / 3;
  color: var(--accent, #ff4f00);
}

.block-head h2 {
  grid-column: 3 / 7;
  margin: 0;
  font: 600 34px/1.1 var(--ey-font-display, 'Space Grotesk', sans-serif);
  letter-spacing: -0.02em;
  color: var(--fg, #e9e9e6);
}

.block-desc {
  grid-column: 7 / 13;
  margin: 0;
  color: var(--fg-3, #6c6f75);
  font-size: 14px;
}

/* ============ 目录 ============ */
.contents-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  column-gap: 24px;
}

.parts {
  grid-column: 1 / 9;
}

.part {
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, .08));
}

.part-row {
  width: 100%;
  display: grid;
  grid-template-columns: 80px auto 1fr auto 28px;
  align-items: baseline;
  gap: 16px;
  padding: 22px 0;
  text-align: left;
  outline: none;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
}

.part-num {
  font: 500 13px/1 var(--ey-font-mono, monospace);
  color: var(--fg-3, #6c6f75);
  transition: color 120ms;
}

.part-name {
  font: 600 26px/1.1 var(--ey-font-display, 'Space Grotesk', sans-serif);
  letter-spacing: -0.01em;
  color: var(--fg, #e9e9e6);
  transition: transform 240ms cubic-bezier(.16, 1, .3, 1);
}

.leader {
  height: 1px;
  align-self: center;
  background-image: radial-gradient(circle, var(--fg-3, #6c6f75) 0.8px, transparent 1px);
  background-size: 8px 2px;
  background-repeat: repeat-x;
  transition: background-size 240ms cubic-bezier(.16, 1, .3, 1);
}

.part-count {
  font: 600 26px/1 var(--ey-font-display, 'Space Grotesk', sans-serif);
  letter-spacing: -0.02em;
  color: var(--fg, #e9e9e6);
}

.part-toggle {
  position: relative;
  width: 14px;
  height: 14px;
  justify-self: end;
  align-self: center;
}

.part-toggle::before,
.part-toggle::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 14px;
  height: 1.5px;
  background: var(--fg, #e9e9e6);
  transition: transform 240ms cubic-bezier(.16, 1, .3, 1);
}

.part-toggle::after {
  transform: rotate(90deg);
}

.part.open .part-toggle::after {
  transform: rotate(0deg);
}

.part-row:hover .part-num,
.part.open .part-num {
  color: var(--accent, #ff4f00);
}

.part-row:hover .part-name {
  transform: translateX(6px);
}

.part-row:hover .leader {
  background-size: 4px 2px;
}

.part-body {
  display: grid;
  transition: grid-template-rows 480ms cubic-bezier(.16, 1, .3, 1);
}

.part-inner {
  overflow: hidden;
}

.chapters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 32px;
  padding: 4px 0 32px 96px;
}

.chap {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 240ms, transform 480ms cubic-bezier(.16, 1, .3, 1);
  transition-delay: calc(var(--i) * 40ms);
}

.part.open .chap {
  opacity: 1;
  transform: none;
}

.chap-head {
  display: flex;
  justify-content: space-between;
  padding: 10px 0 8px;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, .08));
  color: var(--fg-3, #6c6f75);
}

.chap ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.art-link {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  align-items: baseline;
  padding: 7px 0;
  font-size: 15px;
  outline: none;
  text-decoration: none;
  color: var(--fg, #e9e9e6);
}

.art-num {
  font: 500 11px/1 var(--ey-font-mono, monospace);
  color: var(--fg-3, #6c6f75);
  letter-spacing: .04em;
  transition: color 120ms;
}

.art-title {
  transition: transform 240ms cubic-bezier(.16, 1, .3, 1), color 120ms;
}

.art-link:hover .art-num {
  color: var(--accent, #ff4f00);
}

.art-link:hover .art-title {
  transform: translateX(4px);
  color: var(--accent, #ff4f00);
}

.art-link.has-fig .art-title::after {
  content: 'FIG';
  margin-left: 8px;
  padding: 1px 4px;
  font: 600 9px/1 var(--ey-font-mono, monospace);
  letter-spacing: .1em;
  color: var(--accent, #ff4f00);
  border: 1px solid var(--accent, #ff4f00);
  vertical-align: 2px;
}

/* ============ 翻牌预览 (FLAP) ============ */
.flap {
  grid-column: 9 / 13;
  position: sticky;
  top: calc(56px + 24px);
  align-self: start;
  margin-top: 22px;
}

.flap-label {
  color: var(--fg-3, #6c6f75);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, .08));
}

.flap-stage {
  position: relative;
  height: 320px;
  overflow: hidden;
  perspective: 900px;
}

.flap-card {
  position: absolute;
  inset: 0;
  padding-top: 20px;
  backface-visibility: hidden;
  transform-origin: 50% 0;
}

.flap-card .fc-num {
  font: 500 12px/1 var(--ey-font-mono, monospace);
  color: var(--accent, #ff4f00);
  letter-spacing: .06em;
}

.flap-card .fc-title {
  margin: 12px 0 10px;
  font: 600 28px/1.15 var(--ey-font-display, 'Space Grotesk', sans-serif);
  letter-spacing: -0.01em;
  color: var(--fg, #e9e9e6);
}

.flap-card .fc-sum {
  margin: 0;
  color: var(--fg-2, #a4a6ab);
  font-size: 14px;
  line-height: 1.7;
}

.flap-card .fc-meta {
  margin-top: 18px;
  display: flex;
  gap: 16px;
  color: var(--fg-3, #6c6f75);
}

.flap-card ul {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
}

.flap-card li {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  border-top: 1px solid var(--line, rgba(255, 255, 255, .08));
  font-size: 14px;
  color: var(--fg-2, #a4a6ab);
}

.flap-card li span:first-child {
  font: 500 11px/1.9 var(--ey-font-mono, monospace);
  color: var(--fg-3, #6c6f75);
  min-width: 88px;
}

/* 翻牌过渡动效 */
.flap-flip-enter-active {
  transition: all 420ms cubic-bezier(.16, 1, .3, 1);
}
.flap-flip-leave-active {
  transition: all 240ms cubic-bezier(.7, 0, .84, 0);
}
.flap-flip-enter-from {
  opacity: 0;
  transform: translateY(36%) rotateX(-72deg);
}
.flap-flip-leave-to {
  opacity: 0;
  transform: translateY(-36%) rotateX(72deg);
}

/* ============ 图集 ============ */
.gallery {
  margin-top: 32px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  user-select: none;
}

.gallery::-webkit-scrollbar {
  display: none;
}

.gallery-track {
  display: flex;
  gap: 24px;
  padding: 0 max(40px, calc((100vw - 1280px) / 2 + 40px));
  width: max-content;
}

.fig-card {
  width: 380px;
  flex: none;
  border: 1px solid var(--line-2, rgba(255, 255, 255, .16));
  background: var(--surface, #17181b);
  text-decoration: none;
  color: inherit;
  transition: border-color 240ms, transform 240ms cubic-bezier(.16, 1, .3, 1);
}

.fig-card:hover {
  border-color: var(--fg, #e9e9e6);
  transform: translateY(-4px);
}

.fig-stage {
  position: relative;
  height: 220px;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, .08));
  overflow: hidden;
}

.fig-cap {
  padding: 14px 16px 16px;
}

.fig-cap .mono {
  color: var(--accent, #ff4f00);
  font-size: 11px;
}

.fig-cap h3 {
  margin: 6px 0 0;
  font: 600 17px/1.4 var(--ey-font-display, 'Space Grotesk', sans-serif);
  color: var(--fg, #e9e9e6);
}

/* mini: CAS */
.m-cas .mem {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 76px;
  height: 76px;
  margin: -38px 0 0 -38px;
  border: 1.5px solid var(--fg, #e9e9e6);
  display: grid;
  place-items: center;
  font: 600 30px/1 var(--ey-font-display, 'Space Grotesk', sans-serif);
  color: var(--fg, #e9e9e6);
}

.m-cas .mem span {
  position: absolute;
  animation: cas-num 4s steps(1) infinite;
}
.m-cas .mem span:nth-child(2) { animation-name: cas-num2; }
.m-cas .mem span:nth-child(3) { animation-name: cas-num3; }

@keyframes cas-num { 0%, 40% { opacity: 1; } 40.01%, 100% { opacity: 0; } }
@keyframes cas-num2 { 0%, 40% { opacity: 0; } 40.01%, 80% { opacity: 1; } 80.01%, 100% { opacity: 0; } }
@keyframes cas-num3 { 0%, 80% { opacity: 0; } 80.01%, 100% { opacity: 1; } }

.m-cas .th {
  position: absolute;
  top: 50%;
  width: 46px;
  height: 28px;
  margin-top: -14px;
  display: grid;
  place-items: center;
  font: 600 11px/1 var(--ey-font-mono, monospace);
  border: 1px solid var(--fg-2, #a4a6ab);
  background: var(--bg, #111214);
  color: var(--fg, #e9e9e6);
}

.m-cas .t1 { left: 30px; animation: cas-t1 4s cubic-bezier(.16, 1, .3, 1) infinite; }
.m-cas .t2 { right: 30px; animation: cas-t2 4s cubic-bezier(.16, 1, .3, 1) infinite; }

@keyframes cas-t1 {
  0%, 15% { transform: none; }
  30%, 40% { transform: translateX(84px); background: var(--accent, #ff4f00); color: #fff; border-color: var(--accent, #ff4f00); }
  55%, 100% { transform: none; }
}

@keyframes cas-t2 {
  0%, 25% { transform: none; }
  38% { transform: translateX(-84px); }
  44% { transform: translateX(-60px); border-color: var(--accent, #ff4f00); }
  50%, 62% { transform: none; }
  75%, 82% { transform: translateX(-84px); background: var(--accent, #ff4f00); color: #fff; border-color: var(--accent, #ff4f00); }
  95%, 100% { transform: none; }
}

/* mini: 分代 */
.m-gen {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2.2fr;
  gap: 6px;
  padding: 26px 18px;
}

.m-gen .zone {
  position: relative;
  border: 1px solid var(--line-2, rgba(255, 255, 255, .16));
}

.m-gen .zone b {
  position: absolute;
  left: 6px;
  top: 4px;
  font: 500 9px/1 var(--ey-font-mono, monospace);
  color: var(--fg-3, #6c6f75);
  letter-spacing: .1em;
}

.m-gen .objs {
  position: absolute;
  inset: 26px 18px;
}

.m-gen .obj {
  position: absolute;
  left: 14px;
  width: 14px;
  height: 14px;
  background: var(--fg, #e9e9e6);
  animation: gen-move 5s cubic-bezier(.16, 1, .3, 1) infinite;
}

.m-gen .obj:nth-child(1) { top: 28px; }
.m-gen .obj:nth-child(2) { top: 60px; animation-delay: -1.2s; }
.m-gen .obj:nth-child(3) { top: 92px; animation-name: gen-die; }
.m-gen .obj:nth-child(4) { top: 124px; animation-delay: -2.4s; }

@keyframes gen-move {
  0%, 15% { transform: none; }
  30%, 45% { transform: translateX(118px); }
  60%, 70% { transform: translateX(172px); }
  88%, 100% { transform: translateX(250px); background: var(--accent, #ff4f00); }
}

@keyframes gen-die {
  0%, 20% { opacity: 1; transform: none; }
  30%, 100% { opacity: 0; transform: scale(.2); }
}

/* mini: 二分 */
.m-bin {
  padding: 50px 22px 0;
}

.m-bin .bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 110px;
}

.m-bin .bars i {
  flex: 1;
  background: var(--fg-3, #6c6f75);
}

.m-bin .bars i.hit {
  background: var(--accent, #ff4f00);
  animation: bin-hit 4s steps(1) infinite;
}

@keyframes bin-hit {
  0%, 74% { background: var(--fg-3, #6c6f75); }
  75%, 100% { background: var(--accent, #ff4f00); }
}

.m-bin .ptr {
  position: absolute;
  top: 172px;
  width: 0;
  height: 0;
  border: 6px solid transparent;
  border-bottom: 9px solid var(--fg, #e9e9e6);
}

.m-bin .lo { animation: bin-lo 4s cubic-bezier(.16, 1, .3, 1) infinite; left: 22px; }
.m-bin .hi { animation: bin-hi 4s cubic-bezier(.16, 1, .3, 1) infinite; left: 338px; }
.m-bin .mid { border-bottom-color: var(--accent, #ff4f00); animation: bin-mid 4s cubic-bezier(.16, 1, .3, 1) infinite; left: 180px; }

@keyframes bin-lo { 0%, 25% { transform: none; } 35%, 100% { transform: translateX(185px); } }
@keyframes bin-hi { 0%, 50% { transform: none; } 60%, 100% { transform: translateX(-80px); } }
@keyframes bin-mid { 0%, 30% { transform: none; } 40%, 55% { transform: translateX(80px); } 65%, 100% { transform: translateX(53px); } }

/* mini: Handler */
.m-loop .ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 140px;
  height: 140px;
  margin: -70px 0 0 -70px;
  border: 1px dashed var(--line-2, rgba(255, 255, 255, .16));
  border-radius: 50%;
  animation: spin 3s linear infinite;
}

.m-loop .ring::after {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  width: 11px;
  height: 11px;
  margin-left: -6px;
  background: var(--accent, #ff4f00);
}

.m-loop .q {
  position: absolute;
  left: 22px;
  top: 50%;
  display: flex;
  gap: 4px;
  transform: translateY(-50%);
}

.m-loop .q i {
  width: 10px;
  height: 22px;
  border: 1px solid var(--fg-2, #a4a6ab);
  animation: q-pulse 3s steps(1) infinite;
}

.m-loop .q i:nth-child(2) { animation-delay: -1s; }
.m-loop .q i:nth-child(3) { animation-delay: -2s; }

.m-loop .lab {
  position: absolute;
  font: 500 9px/1 var(--ey-font-mono, monospace);
  color: var(--fg-3, #6c6f75);
  letter-spacing: .1em;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes q-pulse { 0%, 66% { background: transparent; } 67%, 100% { background: var(--fg, #e9e9e6); } }

/* ============ 更新日志 ============ */
.log {
  list-style: none;
  margin: 32px 0 0;
  padding: 0;
}

.log-row {
  display: grid;
  grid-template-columns: 140px 160px 1fr 40px;
  align-items: baseline;
  gap: 24px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, .08));
  text-decoration: none;
  color: var(--fg, #e9e9e6);
  transition: transform 240ms cubic-bezier(.16, 1, .3, 1);
}

.log-row:hover {
  transform: translateX(6px);
  color: var(--accent, #ff4f00);
}

.log-date {
  color: var(--fg-3, #6c6f75);
  font-size: 13px;
}

.log-tag {
  color: var(--accent, #ff4f00);
  font-size: 12px;
}

.log-title {
  font-size: 16px;
  font-weight: 500;
}

.log-arrow {
  text-align: right;
  color: var(--fg-3, #6c6f75);
}

/* ============ 索引 ============ */
.terms {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.term {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border: 1px solid var(--line-2, rgba(255, 255, 255, .16));
  background: var(--surface, #17181b);
  text-decoration: none;
  color: var(--fg, #e9e9e6);
  font-size: 14px;
  transition: border-color 120ms, transform 120ms;
}

.term:hover {
  border-color: var(--accent, #ff4f00);
  transform: translateY(-2px);
}

.term-k {
  color: var(--accent, #ff4f00);
  font-weight: 700;
}

/* 响应式适配 */
@media (max-width: 960px) {
  .mh-foot {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .mh-lede {
    grid-column: 1 / -1;
  }
  .mh-stats {
    grid-column: 1 / -1;
  }
  .block-head {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .block-num, .block-head h2, .block-desc {
    grid-column: 1 / -1;
  }
  .contents-grid {
    grid-template-columns: 1fr;
  }
  .parts {
    grid-column: 1 / -1;
  }
  .flap {
    display: none;
  }
  .chapters {
    grid-template-columns: 1fr;
    padding-left: 20px;
  }
  .log-row {
    grid-template-columns: 100px 1fr 20px;
  }
  .log-tag {
    display: none;
  }
}
</style>
