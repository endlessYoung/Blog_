<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { mountFluid, type FluidField } from './field'

const route = useRoute()
const { isDark, frontmatter } = useData()
let field: FluidField | null = null
const canvas = ref<HTMLCanvasElement | null>(null)

function sync() {
  const home = frontmatter.value.layout === 'home'
  document.documentElement.classList.toggle('reading', !home)
  field?.calm(!home)
  field?.theme(!isDark.value)
}

function onBloom(event: Event) {
  const duration = Number((event as CustomEvent<number>).detail || 2600)
  field?.bloom(duration)
}

onMounted(() => {
  if (canvas.value) field = mountFluid(canvas.value)
  sync()
  window.addEventListener('ey-fluid-bloom', onBloom)
})

watch(() => [route.path, isDark.value, frontmatter.value.layout], sync)

onUnmounted(() => {
  window.removeEventListener('ey-fluid-bloom', onBloom)
  document.documentElement.classList.remove('reading')
  field?.destroy()
  field = null
})
</script>

<template>
  <div class="fl-sky" aria-hidden="true">
    <canvas ref="canvas" class="fl-canvas" />
    <div class="fl-fallback">
      <i /><i /><i />
    </div>
    <svg class="fl-defs">
      <defs>
        <filter id="fl-goo" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
        </filter>
        <filter id="fl-goo-sm" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
        <filter id="fl-liquid" x="-10%" y="-20%" width="120%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.022" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap id="fl-liquid-disp" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  </div>
</template>
