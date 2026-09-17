<template>
  <section class="nf" :class="{ 'nf--motion': motionReady }" aria-labelledby="nf-title">
    <div class="nf__scene" aria-hidden="true">
      <div class="nf__stage">
        <img
          class="nf__art nf__art--light"
          :src="lightArt"
          alt=""
          width="1280"
          height="720"
          decoding="async"
        />
        <img
          class="nf__art nf__art--dark"
          :src="darkArt"
          alt=""
          width="1280"
          height="720"
          decoding="async"
        />
        <div class="nf__cat">
          <img class="nf__cat-tail" :src="tailArt" alt="" width="379" height="174" decoding="async" />
          <img class="nf__cat-body" :src="catArt" alt="" width="301" height="464" decoding="async" />
        </div>
      </div>
    </div>

    <div class="nf__content">
      <p class="nf__code">
        404
        <span class="nf__spark" aria-hidden="true" />
      </p>
      <h1 id="nf-title" class="nf__title">你访问的页面好像不见了</h1>
      <p class="nf__lead">也许它去了另一个路口，或者正在写下下一篇笔记。</p>
      <p v-if="lostPath" class="nf__path">
        <span class="nf__path-label">当前地址</span>
        <code class="nf__path-value">{{ lostPath }}</code>
      </p>
      <div class="nf__actions">
        <a class="VPButton nf__home" :href="withBase('/')">回到首页</a>
      </div>
      <nav class="nf__dirs" aria-label="常用分类">
        <p class="nf__dirs-label">也可以从这里继续</p>
        <div class="nf__chips">
          <a
            v-for="item in dirs"
            :key="item.link"
            class="VPButton nf__chip"
            :href="withBase(item.link)"
          >
            {{ item.title }}
          </a>
        </div>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'

interface HomeCategory {
  title: string
  link: string
}

const FALLBACK_DIRS: HomeCategory[] = [
  { title: '移动开发', link: '/Android/Android简介' },
  { title: 'AI 与智能体', link: '/Ai/监督学习入门' },
  { title: '后端技术', link: '/Java/Integer1000与100的比较' },
  { title: '系统与底层', link: '/C/1' },
  { title: '前端与脚本', link: '/JS/1' },
  { title: '算法与数据结构', link: '/数据结构和算法/合并数组' },
]

const route = useRoute()
const { theme } = useData()
const lightArt = withBase('/404-scene-light.png')
const darkArt = withBase('/404-scene-dark.png')
const catArt = withBase('/404-cat.png')
const tailArt = withBase('/404-cat-tail.png')
const motionReady = ref(false)

const dirs = computed(() => {
  const cats = theme.value.homeCategories as HomeCategory[] | undefined
  if (cats?.length) {
    return cats.map((c) => ({ title: c.title, link: c.link }))
  }
  return FALLBACK_DIRS
})

const lostPath = computed(() => {
  const raw = route.path || ''
  if (!raw || raw === '/' || /\/404(?:\.html)?\/?$/.test(raw)) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
})

onMounted(() => {
  document.querySelector('.Layout')?.classList.add('site-not-found')
  requestAnimationFrame(() => {
    motionReady.value = true
  })
})
onUnmounted(() => {
  document.querySelector('.Layout')?.classList.remove('site-not-found')
})
</script>

<style scoped>
.nf {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: calc(100dvh - var(--vp-nav-height, 64px) - 5.5rem);
  overflow: hidden;
}

.nf__scene {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.nf__stage {
  position: absolute;
  right: 0;
  top: 50%;
  aspect-ratio: 16 / 9;
  height: 100%;
  width: auto;
  transform: translate3d(0, -50%, 0);
}

@media (min-aspect-ratio: 16 / 9) {
  .nf__stage {
    width: 100%;
    height: auto;
  }
}

.nf__art {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: fill;
  opacity: 0;
  transform: translateZ(0);
}

.nf--motion .nf__art {
  transition: opacity 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

.nf__cat {
  position: absolute;
  left: 58.6%;
  top: 38.8%;
  z-index: 3;
  width: 11%;
}

.nf__cat-body,
.nf__cat-tail {
  display: block;
}

.nf__cat-body {
  position: relative;
  z-index: 2;
  width: 100%;
  height: auto;
  transform-origin: 52% 86%;
  will-change: transform;
}

.nf__cat-tail {
  position: absolute;
  z-index: 1;
  left: -52%;
  bottom: 4%;
  width: 96%;
  height: auto;
  transform-origin: 88% 42%;
  will-change: transform;
}

.nf--motion .nf__cat-body {
  animation: nf-cat-breathe 6.4s cubic-bezier(0.37, 0, 0.63, 1) infinite;
}

.nf--motion .nf__cat-tail {
  animation: nf-cat-wag 5.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

@keyframes nf-cat-breathe {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scaleY(1);
  }
  50% {
    transform: translate3d(0, -1.6%, 0) scaleY(1.018);
  }
}

@keyframes nf-cat-wag {
  0%,
  100% {
    transform: rotate(8deg);
  }
  50% {
    transform: rotate(-16deg);
  }
}

.nf__content {
  position: relative;
  z-index: 4;
  width: min(34rem, 100%);
  padding: 28px 20px 40px;
}

.nf__code {
  position: relative;
  display: inline-block;
  margin: 0 0 12px;
  font-family: 'Space Grotesk Variable', var(--cyber-font-display, ui-sans-serif), sans-serif;
  font-size: clamp(4.4rem, 12vw, 7.2rem);
  font-weight: 700;
  letter-spacing: -0.06em;
  line-height: 1.08;
  color: #f8fafc;
}

.nf__spark {
  position: absolute;
  top: 0.18em;
  right: -0.42em;
  width: 0.28em;
  height: 0.28em;
  background: #f5c15d;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
}

.nf__title {
  margin: 0 0 10px;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(1.28rem, 2.2vw, 1.7rem);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1.35;
  color: #f8fafc;
}

.nf__lead {
  margin: 0 0 18px;
  max-width: 28em;
  font-size: 0.98rem;
  line-height: 1.75;
  color: rgba(226, 232, 240, 0.78);
}

.nf__path {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 12px;
  margin: 0 0 22px;
}

.nf__path-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.62);
}

.nf__path-value {
  display: inline-block;
  max-width: 100%;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 15, 28, 0.45);
  font-family: var(--tech-font-mono, ui-monospace, monospace);
  font-size: 0.8rem;
  line-height: 1.4;
  color: #e2e8f0;
  overflow-wrap: anywhere;
}

.nf__actions {
  margin-bottom: 28px;
}

.nf a.nf__home,
.nf a.nf__chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  text-decoration: none !important;
  white-space: nowrap;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.nf a.nf__home {
  height: 42px;
  padding: 0 22px;
  border-radius: 9999px !important;
  border: 1px solid #00f0ff !important;
  background: #00f0ff !important;
  color: #0b0f19 !important;
  -webkit-text-fill-color: #0b0f19 !important;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 8px 24px rgba(0, 240, 255, 0.22) !important;
}

.nf a.nf__chip {
  height: 34px;
  padding: 0 14px;
  border-radius: 9999px !important;
  border: 1px solid rgba(34, 211, 238, 0.35) !important;
  background: rgba(8, 15, 28, 0.45) !important;
  color: #e8f0ff !important;
  -webkit-text-fill-color: #e8f0ff !important;
  font-size: 13px;
  font-weight: 500;
  box-shadow: none !important;
}

.nf a.nf__home:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
}

.nf a.nf__chip:hover {
  transform: translateY(-2px);
  border-color: rgba(34, 211, 238, 0.7) !important;
  background: rgba(34, 211, 238, 0.12) !important;
}

.nf a.nf__home:focus-visible,
.nf a.nf__chip:focus-visible {
  outline: 2px solid var(--tech-c-accent, #22d3ee);
  outline-offset: 3px;
}

.nf a.nf__home:active,
.nf a.nf__chip:active {
  transform: translateY(1px) scale(0.98);
}

.nf__dirs-label {
  margin: 0 0 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.62);
}

.nf__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (min-width: 768px) {
  .nf {
    padding-left: clamp(24px, 6vw, 88px);
  }

  .nf__content {
    width: min(28rem, 44vw);
    padding: 40px 24px 56px 0;
  }
}

@media (max-width: 767px) {
  .nf {
    align-items: stretch;
  }

  .nf__cat {
    left: 56.8%;
    top: 39%;
    width: 18%;
  }

  .nf__content {
    width: 100%;
    padding: 20px 20px 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nf--motion .nf__art,
  .nf--motion .nf__cat-body,
  .nf--motion .nf__cat-tail,
  .nf a.nf__home:active,
  .nf a.nf__chip:active {
    transition: none;
    animation: none;
    transform: none;
  }
}
</style>

<!--
  浅色覆盖必须放 unscoped：scoped 里写 html:not(.dark) 会被 Vue 打到 html 上。
-->
<style>
.Layout.site-not-found .tech-bg {
  display: none;
}

body:has(.nf),
body:has(.Layout.site-not-found) {
  background-image: none !important;
  background-color: #0b1220 !important;
}

html:not(.dark) body:has(.nf),
html:not(.dark) body:has(.Layout.site-not-found) {
  background-color: #f4efe6 !important;
}

.Layout.site-not-found {
  background: #0b1220;
  transition: background-color 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

.Layout.site-not-found .VPContent {
  display: flex;
  flex-direction: column;
  padding-top: 0;
}

.Layout.site-not-found .nf {
  min-height: 100dvh;
  padding-top: var(--vp-nav-height, 64px);
}

.Layout.site-not-found .VPFooter {
  background: transparent !important;
}

html:not(.dark) .Layout.site-not-found {
  background: #f4efe6;
}

html:not(.dark) .nf__art--light,
html.dark .nf__art--dark {
  opacity: 1;
}

html:not(.dark) .nf__cat-body {
  filter: drop-shadow(0 10px 12px rgba(40, 28, 16, 0.22));
}

html.dark .nf__cat {
  filter: brightness(0.8) saturate(0.94);
}

html.dark .nf__cat-body {
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.5));
}

.nf--motion .nf__cat {
  transition: filter 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

html:not(.dark) .nf__code {
  color: #1f2937;
  -webkit-text-fill-color: #1f2937;
}

html:not(.dark) .nf__title {
  color: #1f2937;
}

html:not(.dark) .nf__lead,
html:not(.dark) .nf__path-label,
html:not(.dark) .nf__dirs-label {
  color: #6b7280;
}

html:not(.dark) .nf__path-value {
  border-color: rgba(28, 25, 23, 0.1);
  background: rgba(255, 255, 255, 0.72);
  color: #1f2937;
}

html:not(.dark) .nf a.nf__home {
  border-color: rgba(28, 25, 23, 0.22) !important;
  background: rgba(255, 255, 255, 0.72) !important;
  color: #1f2937 !important;
  -webkit-text-fill-color: #1f2937 !important;
  box-shadow: 0 8px 24px rgba(28, 25, 23, 0.06) !important;
}

html:not(.dark) .nf a.nf__home:hover {
  background: #ffffff !important;
  border-color: rgba(28, 25, 23, 0.38) !important;
  filter: none;
}

html:not(.dark) .nf a.nf__chip {
  border-color: rgba(28, 25, 23, 0.12) !important;
  background: rgba(255, 255, 255, 0.55) !important;
  color: #3f3f46 !important;
  -webkit-text-fill-color: #3f3f46 !important;
}

html:not(.dark) .nf a.nf__chip:hover {
  border-color: rgba(14, 116, 144, 0.35) !important;
  background: #ffffff !important;
}

html:not(.dark) .nf a.nf__home:focus-visible,
html:not(.dark) .nf a.nf__chip:focus-visible {
  outline-color: #0e7490;
}

@media (max-width: 767px) {
  html:not(.dark) .nf__content {
    background: linear-gradient(180deg, rgba(244, 239, 230, 0.82) 0%, rgba(244, 239, 230, 0.18) 100%);
  }

  html.dark .nf__content {
    background: linear-gradient(180deg, rgba(11, 18, 32, 0.76) 0%, rgba(11, 18, 32, 0.16) 100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .Layout.site-not-found {
    transition: none;
  }

  .nf--motion .nf__art,
  .nf--motion .nf__cat-body,
  .nf--motion .nf__cat-tail {
    transition: none !important;
    animation: none !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  html:not(.dark) .nf a.nf__home,
  html:not(.dark) .nf a.nf__chip {
    background: #ffffff !important;
  }
}
</style>
