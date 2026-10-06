<template>
  <div
    class="ey-reading-bar"
    :style="{ transform: `scaleX(${progress})` }"
    aria-hidden="true"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const progress = ref(0)

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  if (docHeight <= 0) {
    progress.value = 0
    return
  }
  progress.value = Math.min(1, Math.max(0, scrollTop / docHeight))
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<style scoped>
.ey-reading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--ey-accent);
  transform-origin: left;
  z-index: 1000;
  pointer-events: none;
  transition: transform var(--ey-dur-instant) linear;
}

@media (prefers-reduced-motion: reduce) {
  .ey-reading-bar {
    transition: none;
  }
}
</style>
