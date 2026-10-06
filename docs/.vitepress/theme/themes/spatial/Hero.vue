<template>
  <section class="spatial-hero" id="spatial-hero" aria-labelledby="spatial-hero-title">
    <div class="spatial-hero__body">
      <!-- 眉标 -->
      <div class="spatial-hero__eyebrow">
        <span class="spatial-hero__badge">
          <span class="spatial-hero__dot" aria-hidden="true"></span>
          SPATIAL ARCHITECTURE
        </span>
        <span class="spatial-hero__date">最近更新：{{ lastUpdateDisplay }}</span>
      </div>

      <!-- 主标题 -->
      <h1 id="spatial-hero-title" class="spatial-hero__title">
        <span class="spatial-hero__name">ENDLESS</span>
        <span class="spatial-hero__name spatial-hero__name--alt">YOUNG</span>
      </h1>

      <p class="spatial-hero__desc">
        技术笔记站 · 500+ 系统设计与工程实践精选。在空间视差与毛玻璃透镜中探索现代计算架构。
      </p>

      <!-- CTA 按钮组 -->
      <div class="spatial-hero__cta">
        <a href="/catalog/" class="spatial-btn spatial-btn--primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="2" width="5" height="5" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="2" y="9" width="5" height="5" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
            <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
          </svg>
          浏览目录
        </a>
        <a href="/figures/" class="spatial-btn spatial-btn--glass">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          交互图集
        </a>
      </div>
    </div>

    <!-- 3D 浮空卡片叠堆 (Hero Stack) -->
    <div
      class="spatial-hero__stack"
      ref="stackRef"
      @mousemove="handleStackMouseMove"
      @mouseleave="handleStackMouseLeave"
      aria-label="站点规模与精选笔记"
    >
      <!-- 后层：统计规模 -->
      <div class="spatial-card spatial-card--l3">
        <div class="spatial-card__label">站点规模</div>
        <div class="spatial-stats">
          <div class="spatial-stat-item">
            <span class="spatial-stat-num">{{ articleCount }}</span>
            <span class="spatial-stat-unit">篇技术笔记</span>
          </div>
          <div class="spatial-stat-item">
            <span class="spatial-stat-num">{{ sectionCount }}</span>
            <span class="spatial-stat-unit">个技术栏目</span>
          </div>
          <div class="spatial-stat-item">
            <span class="spatial-stat-num">{{ diagramCount }}</span>
            <span class="spatial-stat-unit">张交互图表</span>
          </div>
        </div>
      </div>

      <!-- 中层：精选专栏 -->
      <div class="spatial-card spatial-card--l2">
        <div class="spatial-card__label">最新聚焦</div>
        <div class="spatial-card__title">Android 底层机制与 Compose 现代响应式演进</div>
        <div class="spatial-card__sub">深入 Linux Binder 通信、AQS 独占锁与 Compose SlotTable 内部原理</div>
      </div>

      <!-- 前层：主打入口卡片 -->
      <a href="/Android/Android简介" class="spatial-card spatial-card--l1">
        <div class="spatial-card__tag">FEATURED ARTICLE</div>
        <div class="spatial-card__headline">移动系统级核心技术剖析 →</div>
        <div class="spatial-card__meta">系统底层 · 架构模式 · 源码拆解</div>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  articleCount?: number
  sectionCount?: number
  diagramCount?: number
  lastUpdate?: string
}>(), {
  articleCount: 312,
  sectionCount: 5,
  diagramCount: 4,
  lastUpdate: '',
})

const lastUpdateDisplay = computed(() => {
  if (!props.lastUpdate) return '2026.10'
  const d = new Date(props.lastUpdate)
  if (isNaN(d.getTime())) return props.lastUpdate
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`
})

const stackRef = ref<HTMLElement | null>(null)

// 3D 视差倾斜悬浮
function handleStackMouseMove(e: MouseEvent) {
  if (!stackRef.value) return
  const rect = stackRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  // 最大旋转角度 ±8deg
  const rotX = -y * 12
  const rotY = x * 12
  stackRef.value.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`
}

function handleStackMouseLeave() {
  if (!stackRef.value) return
  stackRef.value.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`
}
</script>

<style scoped>
.spatial-hero {
  position: relative;
  z-index: 1;
  max-width: var(--ey-wrap, 1240px);
  margin: 0 auto;
  padding: calc(var(--ey-topbar-h, 60px) + var(--ey-space-8, 48px)) var(--ey-pad, 40px) var(--ey-space-9, 64px);
  min-height: var(--ey-hero-min-h, 520px);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: var(--ey-space-8, 48px);
}

@media (max-width: 900px) {
  .spatial-hero {
    grid-template-columns: 1fr;
    padding-top: calc(var(--ey-topbar-h, 60px) + var(--ey-space-5, 24px));
  }
}

.spatial-hero__body {
  display: flex;
  flex-direction: column;
  gap: var(--ey-space-4, 16px);
}

.spatial-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--ey-space-3, 12px);
  flex-wrap: wrap;
}

.spatial-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
  padding: 4px 12px;
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-pill);
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  letter-spacing: var(--ey-tracking-wide);
  color: var(--ey-accent);
}

.spatial-hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ey-accent);
  box-shadow: 0 0 10px var(--ey-accent);
}

.spatial-hero__date {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  color: var(--ey-fg-3);
}

.spatial-hero__title {
  font-family: var(--ey-font-display);
  font-size: var(--ey-text-hero, clamp(38px, 8vw, 68px));
  font-weight: 800;
  line-height: 0.98;
  letter-spacing: var(--ey-tracking-tight);
  color: var(--ey-fg);
  margin: 0;
}

.spatial-hero__name--alt {
  color: var(--ey-accent);
}

.spatial-hero__desc {
  font-size: var(--ey-text-base, 16px);
  color: var(--ey-fg-2);
  line-height: 1.6;
  max-width: 480px;
  margin: 0;
}

.spatial-hero__cta {
  display: flex;
  align-items: center;
  gap: var(--ey-space-3, 12px);
  margin-top: var(--ey-space-2, 8px);
}

.spatial-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
  padding: var(--ey-space-3, 12px) var(--ey-space-6, 28px);
  border-radius: var(--ey-radius-lg, 22px);
  font-family: var(--ey-font-display);
  font-size: var(--ey-text-sm, 14px);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--ey-dur-fast) var(--ey-ease-spring);
  min-height: 46px;
}

.spatial-btn--primary {
  background: var(--ey-accent);
  color: var(--ey-accent-ink, #fff);
  box-shadow: 0 6px 20px var(--ey-accent-soft);
}

.spatial-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px var(--ey-accent-soft);
}

.spatial-btn--glass {
  background: var(--ey-surface);
  color: var(--ey-fg);
  border: var(--ey-border-width, 1px) solid var(--ey-line-2);
  backdrop-filter: blur(var(--ey-blur));
  -webkit-backdrop-filter: blur(var(--ey-blur));
}

.spatial-btn--glass:hover {
  background: var(--ey-surface-2);
  transform: translateY(-2px);
}

/* 3D 浮空卡片叠堆 */
.spatial-hero__stack {
  position: relative;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--ey-dur-normal) var(--ey-ease-spring);
  transform-style: preserve-3d;
}

.spatial-card {
  position: absolute;
  border-radius: var(--ey-radius-lg, 22px);
  padding: var(--ey-space-5, 24px);
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  backdrop-filter: blur(var(--ey-blur));
  -webkit-backdrop-filter: blur(var(--ey-blur));
  box-shadow: inset 0 1px 0 var(--ey-edge-top, rgba(255,255,255,0.2)), var(--ey-shadow-md);
  transition: all var(--ey-dur-normal) var(--ey-ease-spring);
  text-decoration: none;
  color: inherit;
}

.spatial-card--l3 {
  width: 90%;
  top: 0;
  z-index: 1;
  transform: translateZ(-40px) scale(0.92);
  opacity: 0.85;
}

.spatial-card--l2 {
  width: 95%;
  top: 70px;
  z-index: 2;
  transform: translateZ(-20px) scale(0.96);
  opacity: 0.95;
}

.spatial-card--l1 {
  width: 100%;
  top: 150px;
  z-index: 3;
  transform: translateZ(0px);
  border-color: var(--ey-line-accent);
}

.spatial-card--l1:hover {
  border-color: var(--ey-accent);
  transform: translateZ(10px) translateY(-4px);
}

.spatial-card__label,
.spatial-card__tag {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-accent);
  letter-spacing: var(--ey-tracking-wide);
  margin-bottom: var(--ey-space-2, 8px);
}

.spatial-stats {
  display: flex;
  gap: var(--ey-space-6, 32px);
}

.spatial-stat-item {
  display: flex;
  flex-direction: column;
}

.spatial-stat-num {
  font-family: var(--ey-font-mono);
  font-size: 26px;
  font-weight: 700;
  color: var(--ey-fg);
}

.spatial-stat-unit {
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-fg-3);
}

.spatial-card__title {
  font-family: var(--ey-font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--ey-fg);
  margin-bottom: 4px;
}

.spatial-card__sub {
  font-size: var(--ey-text-xs, 12px);
  color: var(--ey-fg-3);
}

.spatial-card__headline {
  font-family: var(--ey-font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--ey-fg);
  margin-bottom: 4px;
}

.spatial-card__meta {
  font-size: var(--ey-text-xs, 12px);
  color: var(--ey-accent);
}

@media (max-width: 480px) {
  .spatial-hero__stack {
    display: none;
  }
}
</style>
