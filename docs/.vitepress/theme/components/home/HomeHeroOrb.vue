<template>
  <div class="home-hud">
    <div class="home-hud__aura" aria-hidden="true" />
    <svg
      class="home-hud__svg"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g class="home-hud__spin home-hud__spin--slow">
        <circle cx="200" cy="200" r="168" class="home-hud__ring" stroke-dasharray="2 10" />
        <circle cx="200" cy="200" r="152" class="home-hud__ring home-hud__ring--soft" />
        <path class="home-hud__arc" d="M200 32 A168 168 0 0 1 368 200" stroke-width="2" />
        <path class="home-hud__arc home-hud__arc--alt" d="M48 248 A168 168 0 0 1 152 44" stroke-width="1.5" />
      </g>

      <g class="home-hud__spin home-hud__spin--mid">
        <circle
          cx="200"
          cy="200"
          r="118"
          class="home-hud__ring home-hud__ring--mid"
          stroke-dasharray="18 8 4 8"
        />
        <circle cx="200" cy="82" r="3.5" class="home-hud__node" />
        <circle cx="318" cy="200" r="3.5" class="home-hud__node" />
        <circle cx="200" cy="318" r="3.5" class="home-hud__node" />
        <circle cx="82" cy="200" r="3.5" class="home-hud__node" />
      </g>

      <g class="home-hud__core">
        <polygon
          class="home-hud__hex home-hud__hex--outer"
          points="200,112 276,156 276,244 200,288 124,244 124,156"
        />
        <polygon
          class="home-hud__hex"
          points="200,138 254,169 254,231 200,262 146,231 146,169"
        />
        <circle cx="200" cy="200" r="28" class="home-hud__core-disk" />
        <circle cx="200" cy="200" r="10" class="home-hud__core-dot" />
        <path class="home-hud__cross" d="M200 168 V232 M168 200 H232" stroke-width="1.2" />
      </g>

      <g class="home-hud__scan">
        <path class="home-hud__scan-line" d="M200 200 L200 40" stroke-width="1.5" />
      </g>

      <path class="home-hud__bracket" d="M48 88 V56 H80" stroke-width="2" />
      <path class="home-hud__bracket" d="M352 88 V56 H320" stroke-width="2" />
      <path class="home-hud__bracket" d="M48 312 V344 H80" stroke-width="2" />
      <path class="home-hud__bracket" d="M352 312 V344 H320" stroke-width="2" />
    </svg>

    <!-- 假扫描：每隔几秒随机锁定一篇真实文章标题 -->
    <div
      class="home-hud__feed"
      :class="{ 'home-hud__feed--hit': hitPulse }"
      aria-live="polite"
    >
      <div class="home-hud__feed-row">
        <span class="home-hud__feed-tag">{{ statusTag }}</span>
        <span class="home-hud__feed-idx">#{{ String(hitIndex).padStart(3, '0') }}</span>
      </div>
      <a
        v-if="current"
        class="home-hud__feed-title"
        :href="current.href"
        :title="current.title"
      >
        {{ displayTitle }}
      </a>
      <p v-else class="home-hud__feed-title home-hud__feed-title--idle">
        indexing corpus…
      </p>
      <div class="home-hud__feed-meta">
        <span>{{ current?.section || '—' }}</span>
        <span class="home-hud__feed-sep">·</span>
        <span>{{ poolSize }} docs</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'

type ScanHit = {
  title: string
  section: string
  href: string
}

/**
 * VitePress srcDir = docs/，用绝对 glob 枚举各栏目文章（不依赖相对层级）
 */
const rawDocs = import.meta.glob(
  [
    '/Android/**/*.md',
    '/Ai/**/*.md',
    '/Agent/**/*.md',
    '/Java/**/*.md',
    '/Kotlin/**/*.md',
    '/Python/**/*.md',
    '/JS/**/*.md',
    '/C/**/*.md',
    '/C++/**/*.md',
    '/Flutter/**/*.md',
    '/SQL/**/*.md',
    '/Linux/**/*.md',
    '/Common/**/*.md',
    '/数据结构和算法/**/*.md',
  ],
  {
    eager: true,
    query: '?raw',
    import: 'default',
  }
) as Record<string, string>

const SKIP_FILES = new Set(['index.md', 'readme.md'])

function sectionOf(path: string): string {
  const cleaned = path.replace(/\\/g, '/').split('/').filter((p) => p && p !== '.' && p !== '..')
  // e.g. Android/Compose/Foo.md or Android/Foo.md
  if (cleaned.length >= 2) return cleaned[0]
  return 'Docs'
}

function titleFrom(raw: string, fileName: string): string {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (fm) {
    const t = fm[1].match(/^\s*title:\s*["']?(.+?)["']?\s*$/m)
    if (t?.[1]) return t[1].trim()
  }
  const h1 = raw.match(/^#\s+(.+)$/m)
  if (h1?.[1]) return h1[1].replace(/[#*`]/g, '').trim()
  return decodeURIComponent(fileName.replace(/\.md$/i, ''))
}

function hrefFrom(path: string): string {
  // /Android/Foo.md -> /Android/Foo
  let cleaned = path.replace(/\\/g, '/')
  if (cleaned.startsWith('/')) cleaned = cleaned.slice(1)
  cleaned = cleaned.replace(/\.md$/i, '')
  if (cleaned.endsWith('/index')) cleaned = cleaned.slice(0, -'/index'.length)
  const url = `/${cleaned}`.replace(/\/+/g, '/') || '/'
  return withBase(url)
}

function buildPool(): ScanHit[] {
  const list: ScanHit[] = []
  for (const [path, raw] of Object.entries(rawDocs)) {
    const norm = path.replace(/\\/g, '/')
    if (norm.includes('/.vitepress/') || norm.includes('.vitepress/')) continue
    const file = norm.split('/').pop() || ''
    if (SKIP_FILES.has(file.toLowerCase())) continue
    // 首页本身
    if (/(^|\/)index\.md$/i.test(norm) && !norm.includes('/')) continue
    const title = titleFrom(String(raw ?? ''), file)
    if (!title || title.length < 2) continue
    list.push({
      title,
      section: sectionOf(norm),
      href: hrefFrom(norm),
    })
  }
  return list
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const allArticles = buildPool()
/** 洗牌后顺序枚举，一轮结束后再洗牌，保证覆盖全部文章 */
let deck: ScanHit[] = shuffle(allArticles)
let deckPos = 0

const current = ref<ScanHit | null>(deck[0] ?? null)
const hitPulse = ref(false)
const hitIndex = ref(1)
const statusTag = ref('SCAN')
const displayTitle = computed(() => {
  const t = current.value?.title || ''
  // 桌面略长、移动端由 CSS 截断；这里只做极端超长保护
  return t.length > 64 ? `${t.slice(0, 62)}…` : t
})
const poolSize = computed(() => allArticles.length)

let timer: ReturnType<typeof setInterval> | null = null
let pulseTimer: ReturnType<typeof setTimeout> | null = null
let scanCount = 0

function pickNext() {
  if (!deck.length) return
  if (deckPos >= deck.length) {
    deck = shuffle(allArticles)
    deckPos = 0
  }
  const hit = deck[deckPos++]
  scanCount += 1
  hitIndex.value = scanCount
  statusTag.value = 'LOCK'
  hitPulse.value = true
  current.value = hit
  if (pulseTimer) clearTimeout(pulseTimer)
  pulseTimer = setTimeout(() => {
    hitPulse.value = false
    statusTag.value = 'SCAN'
  }, 900)
}

onMounted(() => {
  if (!allArticles.length) {
    statusTag.value = 'EMPTY'
    return
  }
  pickNext()
  // 小屏：静态展示当前文章链接，不做自动轮播，避免周期性重绘造成闪烁
  const smallScreen =
    typeof window !== 'undefined' &&
    (window.matchMedia('(max-width: 960px)').matches ||
      window.matchMedia('(hover: none)').matches)
  if (smallScreen) return
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  timer = setInterval(pickNext, reduced ? 7000 : 2800)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (pulseTimer) clearTimeout(pulseTimer)
})
</script>

<style scoped>
.home-hud {
  --hud-cyan: #00f0ff;
  --hud-violet: #7000ff;
  --hud-line: rgba(0, 240, 255, 0.45);
  --hud-line-soft: rgba(0, 240, 255, 0.2);
  --hud-fill: rgba(0, 240, 255, 0.08);
  --hud-core: rgba(11, 15, 25, 0.72);
  --hud-label: rgba(0, 240, 255, 0.72);
  --hud-panel: rgba(8, 12, 22, 0.78);

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: min(100%, 380px);
  height: auto;
  min-height: min(72vw, 320px);
  margin: 0 auto;
  padding-bottom: 0;
}

@media (min-width: 960px) {
  .home-hud {
    width: 100%;
    height: 100%;
    min-height: 0;
    max-width: 420px;
    max-height: 420px;
    margin: 0;
  }
}

.home-hud__aura {
  position: absolute;
  inset: 12%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 45%,
    rgba(0, 240, 255, 0.22),
    rgba(112, 0, 255, 0.12) 42%,
    transparent 70%
  );
  filter: blur(22px);
  animation: hudPulse 5.5s ease-in-out infinite alternate;
  pointer-events: none;
}

.home-hud__svg {
  position: relative;
  z-index: 1;
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  max-height: 100%;
  overflow: visible;
  flex: 1 1 auto;
}

.home-hud__ring {
  stroke: var(--hud-line);
  fill: none;
}

.home-hud__ring--soft {
  stroke: var(--hud-line-soft);
}

.home-hud__ring--mid {
  stroke: rgba(112, 0, 255, 0.45);
}

.home-hud__arc {
  stroke: var(--hud-cyan);
  fill: none;
  filter: drop-shadow(0 0 6px rgba(0, 240, 255, 0.65));
}

.home-hud__arc--alt {
  stroke: rgba(112, 0, 255, 0.75);
  filter: drop-shadow(0 0 6px rgba(112, 0, 255, 0.45));
}

.home-hud__node {
  fill: var(--hud-cyan);
  filter: drop-shadow(0 0 5px rgba(0, 240, 255, 0.85));
}

.home-hud__hex {
  fill: var(--hud-fill);
  stroke: var(--hud-cyan);
  stroke-width: 1.4;
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.35));
}

.home-hud__hex--outer {
  fill: transparent;
  stroke: rgba(112, 0, 255, 0.55);
  stroke-width: 1;
}

.home-hud__core-disk {
  fill: var(--hud-core);
  stroke: var(--hud-cyan);
  stroke-width: 1.2;
}

.home-hud__core-dot {
  fill: var(--hud-cyan);
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.9));
  animation: hudBlink 2.2s ease-in-out infinite;
}

.home-hud__cross {
  stroke: rgba(0, 240, 255, 0.55);
  fill: none;
}

.home-hud__bracket {
  stroke: var(--hud-cyan);
  fill: none;
  opacity: 0.7;
}

.home-hud__scan-line {
  stroke: var(--hud-cyan);
  stroke-linecap: round;
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.8));
  transform-origin: 200px 200px;
  animation: hudScan 4.5s linear infinite;
}

.home-hud__spin {
  transform-origin: 200px 200px;
}

.home-hud__spin--slow {
  animation: hudSpin 28s linear infinite;
}

.home-hud__spin--mid {
  animation: hudSpin 16s linear infinite reverse;
}

.home-hud__core {
  transform-origin: 200px 200px;
  animation: hudBreath 6s ease-in-out infinite;
}

/* 扫描结果面板 */
.home-hud__feed {
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: 4%;
  z-index: 2;
  padding: 10px 12px 11px;
  border: 1px solid rgba(0, 240, 255, 0.35);
  border-radius: 8px;
  background: var(--hud-panel);
  backdrop-filter: blur(10px) saturate(140%);
  box-shadow:
    0 0 0 1px rgba(112, 0, 255, 0.12),
    0 0 20px rgba(0, 240, 255, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.home-hud__feed--hit {
  border-color: rgba(0, 255, 102, 0.65);
  box-shadow:
    0 0 0 1px rgba(0, 255, 102, 0.25),
    0 0 28px rgba(0, 240, 255, 0.28),
    0 0 36px rgba(0, 255, 102, 0.18);
  transform: translateY(-2px);
  animation: hudHitFlash 0.85s ease;
}

.home-hud__feed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.home-hud__feed-tag {
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--hud-cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.45);
}

.home-hud__feed--hit .home-hud__feed-tag {
  color: #00ff66;
  text-shadow: 0 0 10px rgba(0, 255, 102, 0.55);
}

.home-hud__feed-idx {
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(157, 176, 201, 0.85);
}

.home-hud__feed-title {
  display: block;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
  color: #e8f0ff;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.home-hud__feed-title:hover {
  color: var(--hud-cyan);
}

.home-hud__feed-title--idle {
  margin: 0;
  opacity: 0.7;
  font-weight: 500;
}

.home-hud__feed-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(157, 176, 201, 0.8);
  text-transform: uppercase;
}

.home-hud__feed-sep {
  opacity: 0.5;
}

@keyframes hudSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes hudScan {
  to {
    transform: rotate(360deg);
  }
}

@keyframes hudPulse {
  from {
    opacity: 0.65;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1.05);
  }
}

@keyframes hudBreath {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

@keyframes hudBlink {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@keyframes hudHitFlash {
  0% {
    filter: brightness(1.35);
  }
  100% {
    filter: brightness(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-hud__spin--slow,
  .home-hud__spin--mid,
  .home-hud__scan-line,
  .home-hud__aura,
  .home-hud__core,
  .home-hud__core-dot,
  .home-hud__feed--hit {
    animation: none !important;
  }
}

/* 移动端：雷达缩小，扫描条沉底独立，避免叠在圆环上 */
@media (max-width: 959px) {
  .home-hud {
    width: 100%;
    max-width: 420px;
    min-height: 0;
    gap: 10px;
  }

  .home-hud__aura {
    inset: 8% 18% 32% 18%;
    /* 小屏减弱光晕 blur，避免雷达看起来发糊 */
    filter: blur(14px);
    opacity: 0.85;
  }

  .home-hud__svg {
    width: min(72vw, 260px);
    max-width: 260px;
    margin: 0 auto;
    flex: 0 0 auto;
  }

  .home-hud__feed {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    margin: 0;
    padding: 12px 14px;
  }

  .home-hud__feed-title {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 13px;
    line-height: 1.45;
  }

  .home-hud__feed-tag,
  .home-hud__feed-idx {
    font-size: 11px;
  }

  .home-hud__feed-meta {
    font-size: 11px;
    flex-wrap: wrap;
  }
}

@media (max-width: 479px) {
  .home-hud__svg {
    width: min(64vw, 220px);
    max-width: 220px;
  }
}
</style>

<style>
html:not(.dark) .home-hud {
  --hud-cyan: #0891b2;
  --hud-violet: #6d28d9;
  --hud-line: rgba(8, 145, 178, 0.5);
  --hud-line-soft: rgba(8, 145, 178, 0.22);
  --hud-fill: rgba(8, 145, 178, 0.08);
  --hud-core: rgba(255, 255, 255, 0.82);
  --hud-label: rgba(14, 116, 144, 0.8);
  --hud-panel: rgba(255, 255, 255, 0.88);
}

html:not(.dark) .home-hud__aura {
  background: radial-gradient(
    circle at 50% 45%,
    rgba(8, 145, 178, 0.18),
    rgba(109, 40, 217, 0.08) 42%,
    transparent 70%
  );
}

html:not(.dark) .home-hud__ring--mid {
  stroke: rgba(109, 40, 217, 0.4);
}

html:not(.dark) .home-hud__arc--alt {
  stroke: rgba(109, 40, 217, 0.7);
  filter: drop-shadow(0 0 4px rgba(109, 40, 217, 0.35));
}

html:not(.dark) .home-hud__feed-title {
  color: #0f172a;
}

html:not(.dark) .home-hud__feed-idx,
html:not(.dark) .home-hud__feed-meta {
  color: #64748b;
}

html:not(.dark) .home-hud__feed--hit {
  border-color: rgba(5, 150, 105, 0.55);
}

.VPHero.has-image .image-bg {
  opacity: 0.35 !important;
  background-image: radial-gradient(
    circle at center,
    rgba(0, 240, 255, 0.25),
    rgba(112, 0, 255, 0.1) 50%,
    transparent 72%
  ) !important;
}

html:not(.dark) .VPHero.has-image .image-bg {
  background-image: radial-gradient(
    circle at center,
    rgba(8, 145, 178, 0.18),
    rgba(109, 40, 217, 0.08) 50%,
    transparent 72%
  ) !important;
}
</style>
