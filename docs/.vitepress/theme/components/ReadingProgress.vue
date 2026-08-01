<template>
  <div v-if="enabled" class="reading-progress" aria-hidden="true">
    <div class="reading-progress__bar" :style="{ width: progress + '%' }"></div>
    <button
      v-show="showTop"
      class="reading-progress__top"
      type="button"
      aria-label="回到顶部"
      title="回到顶部"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const enabled = computed(() => frontmatter.value.layout !== 'home')

const progress = ref(0)
const showTop = ref(false)
let ticking = false

function update() {
  ticking = false
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0
  showTop.value = window.scrollY > window.innerHeight
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(update)
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  update()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 999;
  pointer-events: none;
}
.reading-progress__bar {
  height: 100%;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  transition: width 0.1s linear;
}
.reading-progress__top {
  position: fixed;
  pointer-events: auto;
  right: 24px;
  bottom: 28px;
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  transition: opacity 0.25s, border-color 0.25s, color 0.25s, background-color 0.25s;
}
.reading-progress__top:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.reading-progress__top svg {
  width: 18px;
  height: 18px;
}
@media (max-width: 640px) {
  .reading-progress__top {
    right: 16px;
    bottom: 20px;
  }
}
</style>
