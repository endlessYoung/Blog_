<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  size?: number | string
}>()

const accent = ref<'orange' | 'blue'>('orange')

function updateAccent() {
  if (typeof document === 'undefined') return
  accent.value = document.documentElement.dataset.accent === 'blue' ? 'blue' : 'orange'
}

let observer: MutationObserver | null = null

onMounted(() => {
  updateAccent()
  observer = new MutationObserver(() => updateAccent())
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-accent']
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

const logoSrc = computed(() => {
  return withBase(accent.value === 'blue' ? '/logo-blue.png' : '/logo-orange.png')
})
</script>

<template>
  <span class="ey-logo-wrap" :style="{ width: (size || 24) + 'px', height: (size || 24) + 'px' }">
    <img
      class="ey-logo-img"
      :src="logoSrc"
      alt="EY Logo"
      :width="size || 24"
      :height="size || 24"
      loading="eager"
      decoding="async"
    />
  </span>
</template>

<style scoped>
.ey-logo-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  line-height: 1;
}

.ey-logo-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.35));
  transition: transform var(--man-snap, 240ms), filter var(--man-snap, 240ms);
}

:global(.ey-brand:hover) .ey-logo-img,
:global(.manual-brand:hover) .ey-logo-img {
  transform: scale(1.08);
  filter: drop-shadow(0 0 8px var(--accent));
}

@media (prefers-reduced-motion: reduce) {
  .ey-logo-img {
    transition: none;
  }
}
</style>
