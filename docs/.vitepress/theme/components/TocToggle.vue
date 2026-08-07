<template>
  <button
    class="toc-toggle"
    type="button"
    :aria-expanded="expanded"
    aria-label="切换右侧目录"
    :title="expanded ? '收起右侧目录' : '展开右侧目录'"
    @click.stop.prevent="toggle"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="15" y1="4" x2="15" y2="20" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'vp-toc-collapsed'
const expanded = ref(true)

function apply(collapsed: boolean): void {
  document.documentElement.classList.toggle('vp-toc-collapsed', collapsed)
  expanded.value = !collapsed
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function toggle(): void {
  const collapsed = document.documentElement.classList.contains('vp-toc-collapsed')
  apply(!collapsed)
}

onMounted(() => {
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      document.documentElement.classList.add('vp-panel-no-motion')
      apply(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('vp-panel-no-motion')
        })
      })
    }
  } catch {
    /* ignore */
  }
})
</script>

<style scoped>
.toc-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  margin-left: 8px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
}
.toc-toggle:hover {
  color: var(--vp-c-brand-1, #22d3ee);
  background: rgba(34, 211, 238, 0.08);
  border-color: rgba(34, 211, 238, 0.2);
}
html:not(.dark) .toc-toggle:hover {
  background: rgba(8, 145, 178, 0.07);
}
.toc-toggle svg {
  width: 18px;
  height: 18px;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}
.toc-toggle[aria-expanded='false'] svg {
  transform: scaleX(-1);
  opacity: 0.72;
}
.toc-toggle:active svg {
  transform: rotate(10deg) scale(0.92);
  opacity: 0.85;
}
.toc-toggle[aria-expanded='false']:active svg {
  transform: scaleX(-1) rotate(-10deg) scale(0.92);
}
@media (prefers-reduced-motion: reduce) {
  .toc-toggle svg {
    transition: none;
  }
}
</style>