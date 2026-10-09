<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const columns = Array.from({ length: 12 }, (_, i) => i)
let removePointer: (() => void) | undefined

onMounted(() => {
  const root = document.documentElement
  const fine = window.matchMedia('(hover: hover)').matches
  if (!fine) return
  let frame = 0
  const onMove = (event: PointerEvent) => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      root.style.setProperty('--mx', `${event.clientX}px`)
      root.style.setProperty('--my', `${event.clientY}px`)
      root.classList.add('pointer-in')
    })
  }
  const onLeave = () => root.classList.remove('pointer-in')
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  removePointer = () => {
    window.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerleave', onLeave)
    cancelAnimationFrame(frame)
  }
})

onUnmounted(() => removePointer?.())
</script>

<template>
  <div class="manual-grid grid-layer" aria-hidden="true">
    <div class="wrap grid-cols">
      <i v-for="i in columns" :key="`b${i}`" :style="{ '--i': i }" />
    </div>
  </div>
  <div class="manual-grid grid-layer grid-glow" aria-hidden="true">
    <div class="wrap grid-cols">
      <i v-for="i in columns" :key="`g${i}`" />
    </div>
  </div>
</template>
