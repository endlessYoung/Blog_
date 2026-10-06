<template>
  <div class="spatial-home">
    <!-- ================= 空间 Hero ================= -->
    <section class="spatial-hero wrap">
      <div class="hero-copy">
        <span class="eyebrow glass-flat">
          <i class="live-dot"></i>技术笔记 · 最近更新 <b>{{ lastUpdateDisplay }}</b>
        </span>
        <h1 class="hero-title" aria-label="Endless Young">Endless Young</h1>
        <p class="hero-tag">把底层原理，做成看得见、摸得着的东西。</p>
        <p class="hero-lede">Android、Java 与 AI 的原理笔记。写给想弄懂“为什么”的工程师。</p>
        <div class="hero-actions">
          <a href="#contents" class="pill-btn primary">浏览目录</a>
          <a href="/archive/" class="pill-btn">搜索全部文章</a>
        </div>
      </div>

      <!-- 三层毛玻璃堆叠卡片 (Hero Stack) -->
      <div class="hero-stack" aria-label="精选卡片堆叠">
        <div class="layer l3 glass">
          <span class="layer-label">规模统计</span>
          <dl class="stats">
            <div><dt>篇文章</dt><dd>{{ totalArticles }}</dd></div>
            <div><dt>个部分</dt><dd>05</dd></div>
            <div><dt>个章节</dt><dd>12</dd></div>
          </dl>
        </div>
        <a href="/Java/CAS" class="layer l2 glass">
          <span class="layer-label">核心原理</span>
          <div class="layer-title">比较并交换 (CAS)</div>
          <div class="layer-desc">无锁并发与原子变量的基石原理与内存屏障。</div>
        </a>
        <a href="/Android/Handler" class="layer l1 glass">
          <span class="layer-label">机制剖析</span>
          <div class="layer-title">Handler 消息循环</div>
          <div class="layer-desc">Looper、MessageQueue 与主线程无休止的事件驱动模型。</div>
        </a>
      </div>
    </section>

    <!-- ================= § 01 目录 (Contents) ================= -->
    <section id="contents" class="block wrap">
      <header class="block-head">
        <span class="block-kicker">01</span>
        <h2>目录</h2>
        <p class="block-desc">点开一个部分展开章节，悬停文章在右侧预览。全站内容按模块分层。</p>
      </header>

      <div class="contents-grid">
        <div class="parts">
          <div
            v-for="part in partsList"
            :key="part.id"
            class="part glass"
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
              <span class="part-count">{{ part.count }} 篇</span>
              <span class="part-chevron">›</span>
            </button>

            <div class="part-body" :style="{ gridTemplateRows: openParts.has(part.id) ? '1fr' : '0fr' }">
              <div class="part-inner">
                <div class="chapters">
                  <div v-for="chap in part.chapters" :key="chap.name" class="chap">
                    <div class="chap-title">{{ chap.name }}</div>
                    <ul>
                      <li v-for="art in chap.articles" :key="art.url">
                        <a :href="art.url" class="art-link" @mouseenter="hoverArticle(art)">
                          <span class="art-bullet"></span>
                          <span class="art-title">{{ art.title }}</span>
                          <span v-if="art.hasDiagram" class="art-tag">FIG</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空间版预览卡片 (Glass Preview) -->
        <aside class="preview glass" aria-live="polite">
          <div class="preview-stage">
            <transition name="fade" mode="out-in">
              <div :key="previewCard.key" class="preview-card">
                <div class="pc-badge">{{ previewCard.badge }}</div>
                <h3 class="pc-title">{{ previewCard.title }}</h3>
                <p class="pc-desc">{{ previewCard.desc }}</p>
                <div class="pc-meta">
                  <span>{{ previewCard.meta1 }}</span>
                  <span>{{ previewCard.meta2 }}</span>
                </div>
              </div>
            </transition>
          </div>
        </aside>
      </div>
    </section>

    <!-- ================= § 02 图集 (Figures) ================= -->
    <section id="figures" class="block wrap">
      <header class="block-head">
        <span class="block-kicker">02</span>
        <h2>图集</h2>
        <p class="block-desc">站内可交互讲解的动态卡片，点击直达深度长文。</p>
      </header>

      <div class="gallery-grid">
        <a href="/Java/CAS" class="fig-glass-card glass">
          <div class="fig-icon">⚡</div>
          <h3>比较并交换 (CAS)</h3>
          <p>多线程无锁同步与 CPU 原子指令解析</p>
        </a>
        <a href="/Java/GC算法" class="fig-glass-card glass">
          <div class="fig-icon">♻️</div>
          <h3>分代垃圾回收</h3>
          <p>JVM Eden、Survivor 与老年代流动机制</p>
        </a>
        <a href="/数据结构和算法/二分查找" class="fig-glass-card glass">
          <div class="fig-icon">🔍</div>
          <h3>二分区段收敛</h3>
          <p>有序数据检索与左右边界处理</p>
        </a>
        <a href="/Android/Handler" class="fig-glass-card glass">
          <div class="fig-icon">🔄</div>
          <h3>Handler 消息循环</h3>
          <p>Looper 队列派发与 Linux epoll 机制</p>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { data as articlesData } from '../../data/articles.data'

const lastUpdateDisplay = computed(() => {
  const d = articlesData?.metrics?.lastUpdated
  if (!d) return '2026-10-04'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
})

const totalArticles = computed(() => articlesData?.metrics?.totalArticles || 312)

const PART_DEFS = [
  { id: '01', name: '移动开发', dirs: ['Android', 'Kotlin', 'Flutter'] },
  { id: '02', name: '后端技术', dirs: ['Java', 'Python', 'SQL'] },
  { id: '03', name: 'AI 与智能体', dirs: ['Ai', 'Agent'] },
  { id: '04', name: '系统与底层', dirs: ['C', 'C++', 'Linux'] },
  { id: '05', name: '算法与数据结构', dirs: ['数据结构和算法'] },
]

const partsList = computed(() => {
  const all = articlesData?.articles || []
  return PART_DEFS.map((pDef) => {
    const partArticles = all.filter((a) => pDef.dirs.includes(a.section))
    const chapMap = new Map<string, typeof partArticles>()
    partArticles.forEach((art) => {
      const parts = art.rel.split('/')
      let chapName = parts.length > 2 ? parts[1] : art.section
      if (chapName === 'Compose') chapName = 'Jetpack Compose'
      if (!chapMap.has(chapName)) chapMap.set(chapName, [])
      chapMap.get(chapName)!.push(art)
    })

    const chapters: Array<{ name: string; articles: typeof partArticles }> = []
    chapMap.forEach((arts, chapName) => {
      chapters.push({ name: chapName, articles: arts })
    })

    return {
      id: pDef.id,
      name: pDef.name,
      count: partArticles.length,
      chapters,
    }
  })
})

const openParts = ref<Set<string>>(new Set(['01']))

function togglePart(id: string) {
  if (openParts.value.has(id)) openParts.value.delete(id)
  else openParts.value.add(id)
}

const previewCard = ref({
  key: 'init',
  badge: 'EXPLORE',
  title: '探索核心原理解析',
  desc: '悬停左侧文章可在此处实时预览内容脉络。',
  meta1: '312 篇笔记',
  meta2: '5 大模块',
})

function hoverPart(part: any) {
  previewCard.value = {
    key: `p-${part.id}`,
    badge: `PART ${part.id}`,
    title: part.name,
    desc: `包含 ${part.chapters.map((c: any) => c.name).join('、')} 等关键章节。`,
    meta1: `${part.count} 篇文章`,
    meta2: `${part.chapters.length} 个章节`,
  }
}

function hoverArticle(art: any) {
  previewCard.value = {
    key: `a-${art.url}`,
    badge: art.sectionLabel || art.section,
    title: art.title,
    desc: art.description || '点击进入阅读完整技术原理解析。',
    meta1: art.created || '2026-10-04',
    meta2: `${art.readingTime} 分钟阅读`,
  }
}
</script>

<style scoped>
.spatial-home {
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

.glass {
  background: var(--surface, rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(var(--blur, 20px));
  -webkit-backdrop-filter: blur(var(--blur, 20px));
  border: 1px solid var(--line-2, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius, 16px);
}

/* ============ Hero ============ */
.spatial-hero {
  padding-top: 80px;
  padding-bottom: 96px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 13px;
  color: var(--fg-2, #a4a6ab);
  width: fit-content;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent, #8ea2ff);
  box-shadow: 0 0 10px var(--accent, #8ea2ff);
}

.hero-title {
  margin: 0;
  font: 700 clamp(44px, 6vw, 72px)/1.05 var(--ey-font-display, sans-serif);
  letter-spacing: -0.03em;
  color: var(--fg, #fff);
}

.hero-tag {
  margin: 0;
  font-size: 22px;
  color: var(--accent, #8ea2ff);
  font-weight: 500;
}

.hero-lede {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--fg-2, #a4a6ab);
}

.hero-actions {
  display: flex;
  gap: 14px;
  margin-top: 12px;
}

.pill-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid var(--line-2, rgba(255, 255, 255, 0.16));
  background: rgba(255, 255, 255, 0.05);
  color: var(--fg, #fff);
  transition: all 200ms;
}

.pill-btn.primary {
  background: var(--accent, #8ea2ff);
  color: #0b0c14;
  border-color: var(--accent, #8ea2ff);
}

.pill-btn:hover {
  transform: translateY(-2px);
}

/* ============ 卡片堆叠 ============ */
.hero-stack {
  position: relative;
  height: 380px;
}

.layer {
  position: absolute;
  inset: 0;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  text-decoration: none;
  color: inherit;
  transition: transform 300ms cubic-bezier(.16, 1, .3, 1), box-shadow 300ms;
}

.layer.l3 {
  transform: translateY(0) scale(0.92);
  z-index: 1;
  opacity: 0.7;
}

.layer.l2 {
  transform: translateY(24px) scale(0.96);
  z-index: 2;
  opacity: 0.85;
}

.layer.l1 {
  transform: translateY(48px) scale(1);
  z-index: 3;
}

.layer:hover {
  transform: translateY(40px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
}

.layer-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--accent, #8ea2ff);
  margin-bottom: 8px;
}

.layer-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--fg, #fff);
}

.layer-desc {
  font-size: 14px;
  color: var(--fg-2, #a4a6ab);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0;
  gap: 16px;
}

.stats dt {
  font-size: 12px;
  color: var(--fg-3, #6c6f75);
}

.stats dd {
  margin: 4px 0 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--fg, #fff);
}

/* ============ 目录 ============ */
.block {
  padding-top: 80px;
}

.block-head {
  padding-bottom: 24px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--line, rgba(255, 255, 255, 0.1));
}

.block-kicker {
  font-family: monospace;
  font-size: 12px;
  color: var(--accent, #8ea2ff);
}

.block-head h2 {
  font-size: 32px;
  margin: 4px 0 8px;
  color: var(--fg, #fff);
}

.block-desc {
  margin: 0;
  color: var(--fg-2, #a4a6ab);
  font-size: 14px;
}

.contents-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 32px;
}

.part {
  margin-bottom: 16px;
  overflow: hidden;
}

.part-row {
  width: 100%;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.part-num {
  font-family: monospace;
  font-size: 13px;
  color: var(--accent, #8ea2ff);
}

.part-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--fg, #fff);
}

.part-count {
  margin-left: auto;
  font-size: 13px;
  color: var(--fg-3, #6c6f75);
}

.part-chevron {
  font-size: 20px;
  transition: transform 200ms;
}

.part.open .part-chevron {
  transform: rotate(90deg);
}

.part-body {
  display: grid;
  transition: grid-template-rows 300ms ease;
}

.part-inner {
  overflow: hidden;
  padding: 0 24px 20px;
}

.chapters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chap-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--fg-2, #a4a6ab);
  margin-bottom: 8px;
}

.chap ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.art-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 14px;
  color: var(--fg-2, #a4a6ab);
  text-decoration: none;
  transition: color 150ms;
}

.art-bullet {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--fg-3, #6c6f75);
}

.art-link:hover {
  color: var(--accent, #8ea2ff);
}

.art-link:hover .art-bullet {
  background: var(--accent, #8ea2ff);
}

.art-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--accent, #8ea2ff);
  color: #0b0c14;
  margin-left: auto;
}

/* 预览区 */
.preview {
  position: sticky;
  top: 96px;
  height: 340px;
  padding: 28px;
  align-self: start;
}

.pc-badge {
  font-family: monospace;
  font-size: 11px;
  color: var(--accent, #8ea2ff);
  margin-bottom: 12px;
}

.pc-title {
  font-size: 24px;
  margin: 0 0 12px;
  color: var(--fg, #fff);
}

.pc-desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--fg-2, #a4a6ab);
  margin: 0 0 20px;
}

.pc-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--fg-3, #6c6f75);
}

/* 图集网格 */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 24px;
}

.fig-glass-card {
  padding: 24px;
  text-decoration: none;
  color: inherit;
  transition: transform 200ms, border-color 200ms;
}

.fig-glass-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent, #8ea2ff);
}

.fig-icon {
  font-size: 28px;
  margin-bottom: 12px;
}

.fig-glass-card h3 {
  margin: 0 0 6px;
  font-size: 16px;
  color: var(--fg, #fff);
}

.fig-glass-card p {
  margin: 0;
  font-size: 13px;
  color: var(--fg-2, #a4a6ab);
  line-height: 1.5;
}

@media (max-width: 960px) {
  .spatial-hero {
    grid-template-columns: 1fr;
  }
  .hero-stack {
    display: none;
  }
  .contents-grid {
    grid-template-columns: 1fr;
  }
  .preview {
    display: none;
  }
  .chapters {
    grid-template-columns: 1fr;
  }
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
