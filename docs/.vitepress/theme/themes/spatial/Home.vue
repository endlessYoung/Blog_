<template>
  <div class="spatial-home" @mousemove="handleMouseMove">
    <!-- ================= 首页英雄区 (Hero) ================= -->
    <section class="hero wrap" id="hero">
      <div class="hero-copy">
        <span class="eyebrow glass-flat">
          <i class="live-dot"></i>
          技术笔记 · 最近更新 <b>{{ lastUpdateDisplay }}</b>
        </span>
        <h1 class="hero-title" id="heroTitle" aria-label="Endless Young">
          <span class="w w1">
            <span v-for="(ch, idx) in 'Endless'.split('')" :key="idx" class="ch">{{ ch }}</span>
          </span>
          <span class="w w2">
            <span v-for="(ch, idx) in 'Young'.split('')" :key="idx" class="ch">{{ ch }}</span>
          </span>
        </h1>
        <p class="hero-tag">把底层原理，做成看得见、摸得着的东西。</p>
        <p class="hero-lede">Android、Java 与 AI 的原理笔记。写给想弄懂“为什么”的工程师。</p>
        <div class="hero-actions">
          <a href="#contents" class="pill-btn primary">浏览目录</a>
          <a href="/catalog/" class="pill-btn">全站目录索引</a>
          <a href="/figures/" class="pill-btn">交互图集库</a>
        </div>
      </div>

      <!-- 三层毛玻璃堆叠卡片 (Hero Stack) -->
      <div class="hero-stack" id="heroStack" aria-label="精选">
        <!-- 第 3 层：规模统计 -->
        <div class="layer l3 glass" data-depth="3" data-spec>
          <span class="layer-label">规模</span>
          <dl class="stats">
            <div>
              <dt>篇文章</dt>
              <dd>{{ totalArticles }}</dd>
            </div>
            <div>
              <dt>个部分</dt>
              <dd>05</dd>
            </div>
            <div>
              <dt>个章节</dt>
              <dd>{{ totalChapters }}</dd>
            </div>
          </dl>
        </div>

        <!-- 第 2 层：最新收录 -->
        <a href="/Java/CAS" class="layer l2 glass" data-depth="2" data-spec id="heroLatest">
          <span class="layer-label">最新收录</span>
          <span class="latest-num">02.JUC.02</span>
          <span class="latest-title">比较并交换 (CAS)</span>
          <span class="latest-date">{{ lastUpdateDisplay }}</span>
        </a>

        <!-- 第 1 层：机制剖析特写 -->
        <a href="/Java/CAS" class="layer l1 glass" data-depth="1" data-spec id="heroFeature">
          <div class="g-stage m-cas running">
            <div class="mc-mem glass-strong">
              <span>0</span><span>1</span><span>2</span>
            </div>
            <div class="mc-t t1 mini-cap">T1</div>
            <div class="mc-t t2 mini-cap">T2</div>
            <div class="mc-x o1"><div class="mini-orb"></div></div>
            <div class="mc-x o2"><div class="mini-orb"></div></div>
          </div>
          <div class="feat-cap">
            <span class="feat-title">CAS 原理可视化</span>
            <span class="feat-num">FIG.01</span>
          </div>
        </a>
      </div>
    </section>

    <!-- ================= § 01 目录 (Contents) ================= -->
    <section id="contents" class="block wrap">
      <header class="block-head">
        <span class="block-kicker">01</span>
        <h2>目录</h2>
        <p class="block-desc">点开一个部分展开章节，悬停文章在右侧预览。全站 312 篇核心原理解析。</p>
      </header>

      <div class="contents-grid">
        <div class="parts" id="parts">
          <div
            v-for="part in partsList"
            :key="part.id"
            class="part glass"
            :class="{ open: openParts.has(part.id) }"
            data-spec
          >
            <button
              class="part-head"
              :aria-expanded="openParts.has(part.id)"
              @click="togglePart(part.id)"
              @mouseenter="hoverPart(part)"
            >
              <span class="part-num">{{ part.id }}</span>
              <div>
                <span class="part-name">{{ part.name }}</span>
                <span class="part-en">{{ part.enName }}</span>
              </div>
              <div class="part-chips">
                <span v-for="chip in part.chips" :key="chip">{{ chip }}</span>
              </div>
              <span class="part-count">{{ part.count }}<small>篇</small></span>
              <span class="part-toggle"><i></i></span>
            </button>

            <div class="part-body" v-show="openParts.has(part.id)">
              <div class="part-inner">
                <div class="chapters">
                  <div v-for="chap in part.chapters" :key="chap.name" class="chap">
                    <div class="chap-head">
                      <span>{{ chap.name }}</span>
                      <span>{{ String(chap.articles.length).padStart(2, '0') }}</span>
                    </div>
                    <ul>
                      <li v-for="art in chap.articles" :key="art.url">
                        <a :href="art.url" class="art" @mouseenter="hoverArticle(art)">
                          <span class="art-num">{{ art.code }}</span>
                          <span class="art-title">
                            {{ art.title }}
                            <span v-if="art.hasDiagram" class="fig-tag">FIG</span>
                          </span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空间版右侧毛玻璃预览舞台 -->
        <aside class="preview glass" data-spec aria-live="polite">
          <div class="preview-stage">
            <transition name="pv-fade" mode="out-in">
              <div :key="previewCard.key" class="pv">
                <span class="pv-kicker">{{ previewCard.kicker }}</span>
                <h3 class="pv-title">{{ previewCard.title }}</h3>
                <p class="pv-sum">{{ previewCard.sum }}</p>
                <div class="pv-meta">
                  <span>{{ previewCard.meta1 }}</span>
                  <span>{{ previewCard.meta2 }}</span>
                  <span v-if="previewCard.hasFig" class="is-fig">含交互原理图</span>
                </div>
                <div class="pv-open">
                  <span>点击左侧条目直接打开文章</span>
                  <kbd>ENTER</kbd>
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
        <p class="block-desc">站内可交互讲解的动态卡片。悬停激活演示，点击进入原理文章。</p>
      </header>
    </section>

    <div class="gallery" id="gallery">
      <div class="gallery-track">
        <!-- 图集卡片 1: CAS -->
        <a href="/Java/CAS" class="g-card glass" data-spec>
          <div class="g-stage m-cas running">
            <div class="mc-mem glass-strong"><span>0</span><span>1</span><span>2</span></div>
            <div class="mc-t t1 mini-cap">T1</div>
            <div class="mc-t t2 mini-cap">T2</div>
            <div class="mc-x o1"><div class="mini-orb"></div></div>
            <div class="mc-x o2"><div class="mini-orb"></div></div>
          </div>
          <div class="g-cap">
            <div class="g-num">FIG.01 // ATOMIC</div>
            <h3 class="g-title">比较并交换 (CAS)</h3>
            <span class="g-sub">无锁原子同步与 CPU 指令解析</span>
          </div>
        </a>

        <!-- 图集卡片 2: 分代回收 -->
        <a href="/Java/GC算法" class="g-card glass" data-spec>
          <div class="g-stage m-gen running">
            <div class="mg-row">
              <div class="mg-zone mini-cap">EDEN</div>
              <div class="mg-zone mini-cap">S0</div>
              <div class="mg-zone mini-cap">S1</div>
              <div class="mg-zone mini-cap">OLD</div>
            </div>
            <div class="mg-objs">
              <div class="mg-o"><div class="mini-orb"></div></div>
              <div class="mg-o"><div class="mini-orb"></div></div>
              <div class="mg-o"><div class="mini-orb"></div></div>
              <div class="mg-o"><div class="mini-orb"></div></div>
            </div>
          </div>
          <div class="g-cap">
            <div class="g-num">FIG.02 // JVM GC</div>
            <h3 class="g-title">分代垃圾回收</h3>
            <span class="g-sub">Eden、Survivor 与老年代内存流动机制</span>
          </div>
        </a>

        <!-- 图集卡片 3: Handler -->
        <a href="/Android/Handler" class="g-card glass" data-spec>
          <div class="g-stage m-loop running">
            <div class="ml-queue glass-strong"></div>
            <div class="ml-msg"></div>
            <div class="ml-msg"></div>
            <div class="ml-msg"></div>
            <div class="ml-ring">
              <div class="ml-arm"><div class="mini-orb"></div></div>
            </div>
            <div class="ml-core glass-strong mini-cap">LOOPER</div>
          </div>
          <div class="g-cap">
            <div class="g-num">FIG.03 // ANDROID</div>
            <h3 class="g-title">Handler 消息循环</h3>
            <span class="g-sub">MessageQueue 派发与主线程驱动架构</span>
          </div>
        </a>

        <!-- 图集卡片 4: 二分查找 -->
        <a href="/数据结构和算法/二分查找" class="g-card glass" data-spec>
          <div class="g-stage m-bin running" style="padding: 40px 20px 0;">
            <div style="display: flex; align-items: flex-end; gap: 8px; height: 110px;">
              <i style="flex: 1; height: 25px; background: var(--ink-3); border-radius: 4px;"></i>
              <i style="flex: 1; height: 45px; background: var(--ink-3); border-radius: 4px;"></i>
              <i style="flex: 1; height: 65px; background: var(--ink-3); border-radius: 4px;"></i>
              <i style="flex: 1; height: 85px; background: var(--accent); border-radius: 4px; box-shadow: 0 0 14px var(--accent);"></i>
              <i style="flex: 1; height: 105px; background: var(--ink-3); border-radius: 4px;"></i>
            </div>
          </div>
          <div class="g-cap">
            <div class="g-num">FIG.04 // ALGORITHM</div>
            <h3 class="g-title">二分区段收敛</h3>
            <span class="g-sub">有序区间折半查找与双指针边界</span>
          </div>
        </a>
      </div>
    </div>
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
  { id: '01', name: '移动开发', enName: 'MOBILE ENGINEERING', dirs: ['Android', 'Kotlin', 'Flutter'], chips: ['Activity', 'Handler', 'Compose', '协程'] },
  { id: '02', name: '后端技术', enName: 'BACKEND ARCHITECTURE', dirs: ['Java', 'Python', 'SQL'], chips: ['CAS', 'AQS', '线程池', 'JVM GC'] },
  { id: '03', name: 'AI 与智能体', enName: 'AI & AGENT WORKFLOW', dirs: ['Ai', 'Agent'], chips: ['Agent 架构', 'RAG', 'MCP 协议'] },
  { id: '04', name: '系统与底层', enName: 'SYSTEMS & NATIVE', dirs: ['C', 'C++', 'Linux'], chips: ['C++', 'Linux 内核', '内存模型'] },
  { id: '05', name: '算法与数据结构', enName: 'ALGORITHMS & DATA', dirs: ['数据结构和算法'], chips: ['二分查找', '排序', '树与图'] },
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

    const chapters: Array<{ name: string; articles: Array<any> }> = []
    let seq = 1
    chapMap.forEach((arts, chapName) => {
      chapters.push({
        name: chapName,
        articles: arts.map((a) => ({
          code: `${pDef.id}.${chapName.slice(0, 4).toUpperCase()}.${String(seq++).padStart(2, '0')}`,
          title: a.title,
          url: a.url,
          hasDiagram: a.hasDiagram,
          description: a.description || `「${chapName}」章节下的技术原理解析。`,
          readingTime: a.readingTime || 5,
          date: a.created || '2026-10-04',
        })),
      })
    })

    return {
      id: pDef.id,
      name: pDef.name,
      enName: pDef.enName,
      chips: pDef.chips,
      count: partArticles.length,
      chapters,
    }
  })
})

const totalChapters = computed(() => {
  return partsList.value.reduce((acc, p) => acc + p.chapters.length, 0)
})

const openParts = ref<Set<string>>(new Set(['01']))

function togglePart(id: string) {
  if (openParts.value.has(id)) openParts.value.delete(id)
  else openParts.value.add(id)
}

const previewCard = ref({
  key: 'init',
  kicker: 'START HERE',
  title: '探索核心原理解析',
  sum: '包含了 Android、Java、Kotlin、AI 智能体与系统底层的 312 篇核心笔记。悬停条目可在右侧实时预览脉络。',
  meta1: '312 篇文章',
  meta2: '5 大模块',
  hasFig: true,
})

function hoverPart(part: any) {
  previewCard.value = {
    key: `p-${part.id}`,
    kicker: `PART ${part.id}`,
    title: part.name,
    sum: `包含 ${part.chapters.map((c: any) => c.name).join(' / ')} 等关键章节。`,
    meta1: `${part.count} 篇文章`,
    meta2: `${part.chapters.length} 个章节`,
    hasFig: false,
  }
}

function hoverArticle(art: any) {
  previewCard.value = {
    key: `a-${art.code}`,
    kicker: art.code,
    title: art.title,
    sum: art.description,
    meta1: art.date,
    meta2: `${art.readingTime} MIN READ`,
    hasFig: art.hasDiagram,
  }
}

// 鼠标高光反射互动
function handleMouseMove(e: MouseEvent) {
  if (typeof document === 'undefined') return
  const cards = document.querySelectorAll<HTMLElement>('.glass[data-spec]')
  cards.forEach((card) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    card.style.setProperty('--px', `${x}px`)
    card.style.setProperty('--py', `${y}px`)
  })
}
</script>

<style scoped>
/* ============ 空间主题首页原生对齐 prototypes/spatial/style.css ============ */
.spatial-home {
  position: relative;
  z-index: 1;
  width: 100%;
}

.wrap {
  width: 100%;
  max-width: var(--wrap, 1200px);
  margin: 0 auto;
  padding: 0 var(--pad, 40px);
}

/* 真实亚克力毛玻璃 */
.glass {
  position: relative;
  isolation: isolate;
  background: var(--glass-fill);
  -webkit-backdrop-filter: blur(var(--blur)) saturate(var(--sat));
  backdrop-filter: blur(var(--blur)) saturate(var(--sat));
  border-radius: var(--r-xl);
  box-shadow:
    inset 0 1px 0 var(--glass-inset),
    0 1px 2px rgb(var(--shadow) / .05),
    0 16px 36px -10px rgb(var(--shadow) / .15);
}

:root[data-theme='dark'] .glass {
  box-shadow:
    inset 0 1px 0 var(--glass-inset),
    0 1px 2px rgb(0 0 0 / .3),
    0 18px 40px -10px rgb(0 0 0 / .5);
}

/* 细边高光微描边 */
.glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(150deg, var(--edge-1), var(--edge-2) 38%, var(--edge-2) 64%, var(--edge-3));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
  z-index: 2;
}

/* 鼠标跟随反射 */
.glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(520px circle at var(--px, 50%) var(--py, -60%), var(--spec), transparent 42%);
  opacity: 0;
  transition: opacity 500ms var(--ease-soft);
  pointer-events: none;
  z-index: -1;
}

@media (hover: hover) {
  .glass[data-spec]:hover::before {
    opacity: 1;
  }
}

.glass-flat {
  background: var(--flat);
  box-shadow: inset 0 0 0 1px var(--flat-line);
}

.glass-strong {
  background: var(--glass-strong);
  backdrop-filter: blur(var(--blur));
  -webkit-backdrop-filter: blur(var(--blur));
  box-shadow: inset 0 1px 0 var(--glass-inset), inset 0 0 0 1px var(--flat-line);
}

/* 胶囊按钮 */
.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 14px;
  background: var(--flat);
  box-shadow: inset 0 0 0 1px var(--flat-line);
  color: var(--ink);
  text-decoration: none;
  white-space: nowrap;
  transition: all 200ms;
}

.pill-btn.primary {
  background: var(--accent);
  color: var(--accent-ink, #fff);
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--accent) 70%, transparent), inset 0 1px 0 rgba(255, 255, 255, .35);
}

.pill-btn:hover {
  transform: translateY(-2px);
}

/* ============ 英雄区 (Hero) ============ */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, .92fr);
  gap: 56px;
  align-items: center;
  min-height: min(880px, 92vh);
  padding-top: 60px;
  padding-bottom: 60px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 34px;
  padding: 0 15px 0 12px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--ink-2);
}

.eyebrow b {
  font: 500 13px/1 var(--font-display);
  color: var(--ink);
}

.live-dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ok);
}

.live-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1.5px solid var(--ok);
  opacity: 0;
  animation: ping 2.6s var(--ease-soft) infinite;
}

@keyframes ping {
  0% { transform: scale(.4); opacity: .8; }
  80%, 100% { transform: scale(1.6); opacity: 0; }
}

.hero-title {
  margin: 28px 0 0;
  font: 300 clamp(56px, 8.2vw, 120px)/.94 var(--font-display);
  letter-spacing: -0.055em;
  color: var(--ink);
}

.hero-title .w {
  display: block;
  white-space: nowrap;
}

.hero-title .w2 {
  padding-left: .5em;
  color: color-mix(in oklab, var(--accent) 65%, var(--ink));
}

.hero-tag {
  margin: 30px 0 0;
  font-size: 24px;
  font-weight: 300;
  line-height: 1.5;
  color: var(--ink);
}

.hero-lede {
  margin: 10px 0 0;
  font-size: 16px;
  color: var(--ink-2);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 36px;
}

/* ============ 卡片堆叠 (Hero Stack) ============ */
.hero-stack {
  position: relative;
  height: 520px;
}

.layer {
  position: absolute;
  display: block;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  transition: transform 300ms cubic-bezier(.22, 1.12, .36, 1);
}

.layer:hover {
  transform: translateY(-4px) scale(1.02);
  z-index: 10;
}

.layer-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: .06em;
}

.layer-label::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: .7;
}

.l3 {
  top: 0;
  right: 0;
  width: 76%;
  --blur: 18px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 16px 0 0;
}

.stats div + div {
  padding-left: 18px;
  border-left: 1px solid var(--line);
}

.stats dt {
  font-size: 12.5px;
  color: var(--ink-3);
  order: 2;
}

.stats div {
  display: flex;
  flex-direction: column;
}

.stats dd {
  margin: 0;
  font: 300 46px/1.05 var(--font-display);
  letter-spacing: -0.04em;
  color: var(--ink);
}

.l2 {
  top: 130px;
  left: 0;
  width: 62%;
  padding-bottom: 56px;
  --blur: 22px;
}

.latest-num {
  display: inline-block;
  margin-top: 14px;
  font: 500 12px/1 var(--font-display);
  color: var(--accent);
  letter-spacing: .02em;
}

.latest-title {
  display: block;
  margin-top: 8px;
  font-size: 20px;
  font-weight: 400;
  color: var(--ink);
}

.latest-date {
  display: block;
  margin-top: 10px;
  font: 400 13px/1 var(--font-display);
  color: var(--ink-3);
}

.l1 {
  top: 280px;
  right: 2%;
  width: 66%;
  padding: 10px 10px 16px;
}

.g-stage {
  position: relative;
  height: 150px;
  border-radius: 20px;
  overflow: hidden;
  background: var(--stage);
  box-shadow: inset 0 0 0 1px var(--flat-line);
}

.feat-cap {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px 0;
}

.feat-title {
  font-size: 16px;
  color: var(--ink);
}

.feat-num {
  font: 500 12px/1 var(--font-display);
  color: var(--accent);
}

/* ============ 区块 ============ */
.block {
  padding-top: 110px;
}

.block-head {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  flex-wrap: wrap;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}

.block-kicker {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font: 400 14px/1 var(--font-display);
  color: var(--ink-2);
  background: var(--flat);
  box-shadow: inset 0 0 0 1px var(--flat-line);
}

.block-head h2 {
  margin: 0;
  font: 300 44px/1.1 var(--font-display);
  letter-spacing: -0.02em;
  color: var(--ink);
}

.block-desc {
  margin: 0 0 6px auto;
  max-width: 500px;
  font-size: 14.5px;
  color: var(--ink-2);
  text-align: right;
}

/* ============ 目录 ============ */
.contents-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  margin-top: 36px;
  align-items: start;
}

.parts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.part {
  border-radius: 26px;
}

.part-head {
  width: 100%;
  display: grid;
  grid-template-columns: 70px minmax(0, 1fr) auto auto 40px;
  align-items: center;
  gap: 18px;
  padding: 22px 22px 22px 28px;
  text-align: left;
  border-radius: 26px;
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
}

.part-num {
  font: 300 46px/1 var(--font-display);
  letter-spacing: -0.05em;
  color: var(--ink-3);
  transition: color 300ms;
}

.part.open .part-num {
  color: var(--accent);
}

.part-name {
  display: block;
  font-size: 22px;
  font-weight: 400;
  color: var(--ink);
}

.part-en {
  display: block;
  margin-top: 3px;
  font: 400 12px/1 var(--font-display);
  color: var(--ink-3);
  letter-spacing: .04em;
}

.part-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 380px;
}

.part-chips span {
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--ink-2);
  background: var(--flat);
  box-shadow: inset 0 0 0 1px var(--flat-line);
}

.part.open .part-chips {
  opacity: 0;
  pointer-events: none;
}

.part-count {
  font: 300 30px/1 var(--font-display);
  letter-spacing: -0.03em;
  color: var(--ink);
}

.part-count small {
  margin-left: 4px;
  font-size: 13px;
  color: var(--ink-3);
}

.part-toggle {
  position: relative;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--flat);
  box-shadow: inset 0 0 0 1px var(--flat-line);
  transition: transform 300ms;
}

.part-toggle i {
  width: 8px;
  height: 8px;
  margin-top: -3px;
  border-right: 1.6px solid var(--ink-2);
  border-bottom: 1.6px solid var(--ink-2);
  transform: rotate(45deg);
}

.part.open .part-toggle {
  transform: rotate(180deg);
}

.part-inner {
  margin: 0 22px;
  padding: 18px 0 24px 76px;
  border-top: 1px solid var(--line);
}

.chapters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 24px;
}

.chap-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 12px 6px;
  font-size: 12.5px;
  color: var(--ink-3);
}

.chap ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.art {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  padding: 7px 12px;
  border-radius: 12px;
  font-size: 15px;
  text-decoration: none;
  color: var(--ink);
  transition: background 220ms;
}

.art:hover {
  background: var(--cap-fill);
}

.art-num {
  font: 400 12px/1 var(--font-display);
  color: var(--ink-3);
}

.art:hover .art-num {
  color: var(--accent);
}

.fig-tag {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 7px;
  border-radius: 999px;
  font: 600 10px/1.3 var(--font-display);
  letter-spacing: .08em;
  color: var(--accent);
  background: var(--accent-soft);
}

/* 预览舞台 */
.preview {
  position: sticky;
  top: 96px;
  height: 380px;
  border-radius: 26px;
  overflow: hidden;
}

.preview-stage {
  position: relative;
  height: 100%;
}

.pv {
  position: absolute;
  inset: 0;
  padding: 26px;
  display: flex;
  flex-direction: column;
}

.pv-kicker {
  display: inline-flex;
  width: fit-content;
  padding: 5px 11px;
  border-radius: 999px;
  font: 500 12px/1 var(--font-display);
  color: var(--accent);
  background: var(--accent-soft);
}

.pv-title {
  margin: 16px 0 10px;
  font-size: 26px;
  font-weight: 300;
  line-height: 1.3;
  color: var(--ink);
}

.pv-sum {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: var(--ink-2);
}

.pv-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
}

.pv-meta span {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--ink-2);
  background: var(--flat);
  box-shadow: inset 0 0 0 1px var(--flat-line);
}

.pv-meta .is-fig {
  color: var(--accent);
  background: var(--accent-soft);
}

.pv-open {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding: 12px 14px 12px 16px;
  border-radius: 16px;
  font-size: 13.5px;
  color: var(--ink-2);
  background: var(--flat);
  box-shadow: inset 0 0 0 1px var(--flat-line);
}

.pv-open kbd {
  padding: 3px 8px;
  border-radius: 8px;
  background: var(--kbd);
  color: var(--ink-3);
}

.pv-fade-enter-active,
.pv-fade-leave-active {
  transition: opacity 220ms, transform 220ms;
}

.pv-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.pv-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ============ 图集 ============ */
.gallery {
  margin-top: 26px;
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
  gap: 22px;
  width: max-content;
  padding: 20px max(var(--pad), calc((100vw - var(--wrap)) / 2 + var(--pad))) 48px;
}

.g-card {
  display: block;
  width: 420px;
  flex: none;
  padding: 10px 10px 18px;
  border-radius: 28px;
  text-decoration: none;
  color: inherit;
  transition: transform 240ms cubic-bezier(.22, 1.12, .36, 1);
}

.g-card:hover {
  transform: translateY(-4px);
}

.g-stage {
  height: 220px;
}

.g-cap {
  padding: 16px 12px 0;
}

.g-num {
  font: 500 12px/1 var(--font-display);
  color: var(--accent);
  letter-spacing: .02em;
}

.g-title {
  margin: 8px 0 4px;
  font-size: 18px;
  font-weight: 400;
  color: var(--ink);
}

.g-sub {
  font-size: 13px;
  color: var(--ink-3);
}

/* 动效组件内部细节 */
.mini-cap {
  position: absolute;
  border-radius: 14px;
  background: var(--glass-strong);
  box-shadow: inset 0 1px 0 var(--glass-inset), inset 0 0 0 1px var(--flat-line);
  display: grid;
  place-items: center;
  font: 500 12px/1 var(--font-display);
  color: var(--ink-2);
}

.mini-orb {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  border-radius: 50%;
  --o: var(--accent);
  background: radial-gradient(circle at 35% 30%, #fff 0 10%, color-mix(in srgb, var(--o) 65%, #fff) 32%, var(--o) 72%);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--o) 18%, transparent), 0 0 18px 2px color-mix(in srgb, var(--o) 55%, transparent);
}

/* CAS 动效 */
.m-cas .mc-t { top: 50%; width: 62px; height: 40px; margin: -20px 0 0 -31px; }
.m-cas .mc-t.t1 { left: 20%; }
.m-cas .mc-t.t2 { left: 80%; animation: mc-t2 6s var(--ease-soft) infinite; }
.m-cas .mc-t::before { content: ''; width: 6px; height: 6px; border-radius: 50%; position: absolute; left: 10px; top: 50%; margin-top: -3px; background: var(--accent); }
.m-cas .mc-t.t2::before { background: var(--t2); }
.m-cas .mc-mem { position: absolute; left: 50%; top: 50%; width: 76px; height: 76px; margin: -38px 0 0 -38px; border-radius: 26px; font: 300 34px/1 var(--font-display); color: var(--ink); display: grid; place-items: center; }
.m-cas .mc-mem span { position: absolute; animation: mc-v0 6s var(--spring-snappy) infinite; }
.m-cas .mc-mem span:nth-child(2) { animation-name: mc-v1; }
.m-cas .mc-mem span:nth-child(3) { animation-name: mc-v2; }
.m-cas .mc-x { position: absolute; inset: 0; }
.m-cas .mc-x.o1 { animation: mc-x1 6s var(--spring-gentle) infinite; }
.m-cas .mc-x.o2 { animation: mc-x2 6s var(--spring-gentle) infinite; }
.m-cas .o2 .mini-orb { --o: var(--t2); }

@keyframes mc-x1 { 0%, 8% { transform: translateX(-60px); } 26%, 100% { transform: translateX(0); } }
@keyframes mc-x2 { 0%, 36% { transform: translateX(60px); } 46% { transform: translateX(20px); } 60%, 66% { transform: translateX(60px); } 82%, 100% { transform: translateX(0); } }
@keyframes mc-v0 { 0%, 26% { opacity: 1; transform: none; } 30%, 100% { opacity: 0; transform: translateY(-24px); } }
@keyframes mc-v1 { 0%, 26% { opacity: 0; transform: translateY(24px); } 30%, 82% { opacity: 1; transform: none; } 86%, 100% { opacity: 0; transform: translateY(-24px); } }
@keyframes mc-v2 { 0%, 82% { opacity: 0; transform: translateY(24px); } 86%, 100% { opacity: 1; transform: none; } }
@keyframes mc-t2 { 0%, 45% { color: var(--ink-2); } 48%, 60% { color: var(--fail); } 64%, 100% { color: var(--ink-2); } }

/* 分代回收动效 */
.m-gen .mg-row { position: absolute; left: 16px; right: 16px; top: 50%; height: 120px; margin-top: -60px; display: grid; grid-template-columns: 2fr 1fr 1fr 2fr; gap: 8px; }
.m-gen .mg-zone { position: relative; place-items: start; padding: 10px; font-size: 11px; color: var(--ink-3); }
.m-gen .mg-objs { position: absolute; inset: 0; }
.m-gen .mg-o { position: absolute; left: 0; top: 50%; width: 14px; height: 14px; margin: -7px 0 0 -7px; animation: mg-move 6s var(--spring-bouncy) infinite; }
.m-gen .mg-o .mini-orb { width: 14px; height: 14px; margin: 0; left: 0; top: 0; --o: var(--ink-3); }
.m-gen .mg-o:nth-child(1) { top: 34%; }
.m-gen .mg-o:nth-child(2) { top: 56%; animation-delay: -1.5s; }
.m-gen .mg-o:nth-child(3) { top: 78%; animation-delay: -3.5s; }
.m-gen .mg-o:nth-child(4) { top: 50%; animation-delay: -4.5s; }
@keyframes mg-move {
  0%, 14% { transform: translateX(30px); }
  28%, 40% { transform: translateX(120px); }
  54%, 64% { transform: translateX(180px); }
  78%, 100% { transform: translateX(280px); }
}

/* Handler 动效 */
.m-loop .ml-queue { position: absolute; left: 8%; top: 50%; width: 120px; height: 46px; margin-top: -23px; border-radius: 16px; }
.m-loop .ml-msg { position: absolute; left: calc(8% + 10px); top: 50%; width: 16px; height: 26px; margin-top: -13px; border-radius: 7px; background: var(--accent); opacity: 0; animation: ml-msg 4.2s var(--spring-gentle) infinite; }
.m-loop .ml-msg:nth-of-type(2) { animation-delay: -1.4s; background: var(--t2); }
.m-loop .ml-msg:nth-of-type(3) { animation-delay: -2.8s; background: var(--ok); }
@keyframes ml-msg {
  0% { transform: translateX(0); opacity: 0; }
  8% { transform: translateX(0); opacity: 1; }
  33% { transform: translateX(35px); }
  66% { transform: translateX(70px); opacity: 1; }
  92%, 100% { transform: translateX(140px); opacity: 0; }
}
.m-loop .ml-ring { position: absolute; left: 66%; top: 50%; width: 124px; height: 124px; margin: -62px 0 0 -62px; border-radius: 50%; box-shadow: inset 0 0 0 1.5px var(--line); }
.m-loop .ml-arm { position: absolute; inset: 0; animation: spin 4.2s linear infinite; }
.m-loop .ml-arm .mini-orb { left: 50%; top: 0; }
.m-loop .ml-core { position: absolute; left: 66%; top: 50%; width: 76px; height: 40px; margin: -20px 0 0 -38px; border-radius: 999px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 960px) {
  .hero { grid-template-columns: 1fr; }
  .hero-stack { display: none; }
  .contents-grid { grid-template-columns: 1fr; }
  .preview { display: none; }
  .chapters { grid-template-columns: 1fr; padding-left: 0; }
  .part-head { grid-template-columns: 50px 1fr 30px; }
  .part-chips, .part-count { display: none; }
}
</style>
