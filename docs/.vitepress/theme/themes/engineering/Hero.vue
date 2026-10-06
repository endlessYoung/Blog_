<template>
  <!--
    工程主题 首页 Hero
    对应原型 prototypes/manual/ 的首页区块：
    - 大字标 ENDLESSYOUNG（移动端支持换行 ENDLESS / YOUNG）
    - Odometer 翻牌计数器（文章数、分类数）
    - 最近更新时间戳
    - CTA 按钮：进入目录 / 查看图集

    SSR 友好：全部内容在静态 HTML 中可见（Odometer 数字在客户端再做翻牌动效）
    JS 禁用时：显示静态计数和标准链接
  -->
  <section class="eng-hero" id="hero" aria-labelledby="hero-title">
    <!-- 章节状态栏 -->
    <div class="eng-hero__eyebrow" aria-label="站点状态">
      <span class="eng-hero__live" aria-hidden="true">
        <span class="eng-hero__pulse"></span>
        LIVE
      </span>
      <span class="eng-hero__date">
        <time :datetime="lastUpdateIso">最近更新：{{ lastUpdateDisplay }}</time>
      </span>
      <span class="eng-hero__sep" aria-hidden="true">/</span>
      <span>技术笔记站</span>
    </div>

    <!-- 主标题：移动端自动折行 -->
    <h1 id="hero-title" class="eng-hero__title" aria-label="Endless Young 技术博客">
      <span class="eng-hero__name eng-hero__name--endless">ENDLESS</span><!--
      --><span class="eng-hero__name eng-hero__name--young">YOUNG</span>
    </h1>

    <!-- 遥测仪表盘 (Odometer) -->
    <div class="eng-hero__metrics" role="group" aria-label="站点统计">
      <div class="eng-metric" v-for="m in metrics" :key="m.label">
        <div class="eng-metric__value" :ref="el => bindMetricEl(el, m)" aria-live="off">
          <span class="eng-metric__num">{{ m.display }}</span>
        </div>
        <div class="eng-metric__label">{{ m.label }}</div>
        <div class="eng-metric__unit" aria-hidden="true">{{ m.unit }}</div>
      </div>
    </div>

    <!-- CTA 操作 -->
    <nav class="eng-hero__cta" aria-label="主要入口">
      <a href="/catalog/" class="eng-cta-btn eng-cta-btn--primary">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        进入目录
      </a>
      <a href="/figures/" class="eng-cta-btn eng-cta-btn--secondary">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="5.5" cy="5.5" r="1" fill="currentColor"/>
          <path d="M2 11l3-3 2 2 3-3 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        交互图集
      </a>
      <a href="/archive/" class="eng-cta-btn eng-cta-btn--ghost">
        全部索引 →
      </a>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Metric {
  label: string
  target: number
  display: string
  unit: string
}

// 这里的数字来自 articles.data.ts 构建期注入的统计
// 传入 Props（由父组件从 data 中读取）
const props = withDefaults(defineProps<{
  articleCount?: number
  sectionCount?: number
  diagramCount?: number
  lastUpdate?: string  // ISO 日期字符串
}>(), {
  articleCount: 309,
  sectionCount: 5,
  diagramCount: 4,
  lastUpdate: '',
})

const metrics = ref<Metric[]>([
  { label: '篇技术文章', target: props.articleCount, display: '0', unit: 'ART' },
  { label: '个技术栏目', target: props.sectionCount, display: '0', unit: 'SEC' },
  { label: '张交互图表', target: props.diagramCount, display: '0', unit: 'DGM' },
])

const lastUpdateIso = computed(() => props.lastUpdate || new Date().toISOString().slice(0, 10))
const lastUpdateDisplay = computed(() => {
  if (!props.lastUpdate) return '—'
  const d = new Date(props.lastUpdate)
  if (isNaN(d.getTime())) return props.lastUpdate
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})

// Odometer 翻牌动效（客户端专属）
function animateCounter(el: HTMLElement, from: number, to: number, duration = 1200) {
  const start = performance.now()
  const numEl = el.querySelector<HTMLElement>('.eng-metric__num')
  if (!numEl) return

  function step(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.round(from + (to - from) * eased)
    numEl.textContent = String(current)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

const metricEls = new Map<string, HTMLElement>()

function bindMetricEl(el: unknown, m: Metric) {
  if (el instanceof HTMLElement) {
    metricEls.set(m.label, el)
  }
}

onMounted(() => {
  // 检查动效偏好
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  metrics.value.forEach((m) => {
    if (prefersReduced) {
      m.display = String(m.target)
    } else {
      m.display = '0'
      const el = metricEls.get(m.label)
      if (el) {
        // 使用 IntersectionObserver 懒触发
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(el, 0, m.target)
              m.display = String(m.target)
              observer.disconnect()
            }
          })
        }, { threshold: 0.3 })
        observer.observe(el)
      } else {
        m.display = String(m.target)
      }
    }
  })
})
</script>

<style scoped>
.eng-hero {
  position: relative;
  z-index: 1;
  padding: calc(var(--ey-topbar-h, 56px) + var(--ey-space-10, 80px)) var(--ey-pad, 40px) var(--ey-space-10, 80px);
  max-width: var(--ey-wrap, 1280px);
  margin: 0 auto;
  min-height: var(--ey-hero-min-h, 520px);  /* 防 CLS 固定高度 */
  display: flex;
  flex-direction: column;
  gap: var(--ey-space-6, 32px);
}

/* 状态栏 */
.eng-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--ey-space-3, 12px);
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  letter-spacing: var(--ey-tracking-wider, 0.08em);
  text-transform: uppercase;
  color: var(--ey-fg-3);
}

.eng-hero__live {
  display: flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
  color: var(--ey-accent);
  font-weight: 700;
}

.eng-hero__pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ey-accent);
  box-shadow: 0 0 0 0 var(--ey-accent);
  animation: eng-pulse 2s infinite;
}

@keyframes eng-pulse {
  0%   { box-shadow: 0 0 0 0 var(--ey-accent-soft); }
  70%  { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

@media (prefers-reduced-motion: reduce) {
  .eng-hero__pulse { animation: none; }
}

.eng-hero__sep {
  color: var(--ey-line-2, rgba(255,255,255,0.16));
}

/* 大字标题 */
.eng-hero__title {
  font-family: var(--ey-font-display);
  font-weight: 800;
  font-size: var(--ey-text-hero, clamp(36px, 8vw, 64px));
  line-height: 0.95;
  letter-spacing: var(--ey-tracking-tight, -0.02em);
  color: var(--ey-fg);
  margin: 0;
  /* 允许在中间换行 */
  word-break: keep-all;
  overflow-wrap: break-word;
}

/* 移动端：ENDLESS YOUNG 分两行，字号自适应不溢出 */
.eng-hero__name {
  display: inline-block;
}

@media (max-width: 480px) {
  .eng-hero__title {
    font-size: clamp(36px, 18vw, 64px);
  }
  /* 在 480 以下强制换行 */
  .eng-hero__name--young::before {
    content: '';
    display: block;
  }
}

/* 遥测仪表盘 */
.eng-hero__metrics {
  display: flex;
  gap: var(--ey-space-8, 48px);
  flex-wrap: wrap;
}

.eng-metric {
  display: flex;
  flex-direction: column;
  gap: var(--ey-space-1, 4px);
}

.eng-metric__value {
  font-family: var(--ey-font-mono);
  font-size: clamp(28px, 5vw, 42px);
  font-weight: 700;
  color: var(--ey-fg);
  line-height: 1;
  letter-spacing: var(--ey-tracking-tight);
  /* Tabular numbers for stable counter animation */
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}

.eng-metric__label {
  font-size: var(--ey-text-sm, 13px);
  color: var(--ey-fg-3);
}

.eng-metric__unit {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  letter-spacing: var(--ey-tracking-wider);
  color: var(--ey-accent);
  font-weight: 700;
}

/* CTA */
.eng-hero__cta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ey-space-3, 12px);
}

.eng-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
  padding: var(--ey-space-3, 12px) var(--ey-space-5, 24px);
  border-radius: var(--ey-radius-md, 4px);
  font-family: var(--ey-font-display);
  font-size: var(--ey-text-sm, 13px);
  font-weight: 600;
  letter-spacing: var(--ey-tracking-wide, 0.04em);
  text-decoration: none;
  transition: all var(--ey-dur-fast, 120ms) var(--ey-ease-standard);
  min-height: 44px;  /* 可触摸最小尺寸 */
}

.eng-cta-btn--primary {
  background: var(--ey-accent);
  color: var(--ey-accent-ink, #fff);
  border: var(--ey-border-width) solid var(--ey-accent);
}

.eng-cta-btn--primary:hover {
  filter: brightness(1.1);
}

.eng-cta-btn--secondary {
  background: var(--ey-surface);
  color: var(--ey-fg);
  border: var(--ey-border-width) solid var(--ey-line-2);
}

.eng-cta-btn--secondary:hover {
  border-color: var(--ey-accent);
  color: var(--ey-accent);
}

.eng-cta-btn--ghost {
  background: none;
  color: var(--ey-fg-2);
  border: none;
  padding-left: var(--ey-space-2);
}

.eng-cta-btn--ghost:hover {
  color: var(--ey-accent);
}

@media (max-width: 480px) {
  .eng-hero {
    padding-top: calc(var(--ey-topbar-h, 56px) + var(--ey-space-7, 40px));
    padding-bottom: var(--ey-space-8, 48px);
  }
  .eng-hero__metrics {
    gap: var(--ey-space-6, 32px);
  }
  .eng-cta-btn--ghost {
    display: none;
  }
}
</style>
