<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  size?: number | string
}>()

const uid = 'ey-' + Math.random().toString(36).slice(2, 8)
const isDrawing = ref(false)
const isDrawn = ref(true)
let timer: ReturnType<typeof setInterval> | null = null

function triggerDraw() {
  if (typeof window === 'undefined') return
  isDrawn.value = false
  isDrawing.value = false

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isDrawing.value = true
    })
  })
}

function onAnimEnd(e: AnimationEvent) {
  if (e.animationName === 'eyDrawStroke') {
    isDrawing.value = false
    isDrawn.value = true
  }
}

function startInterval() {
  if (timer) clearInterval(timer)
  // Periodic interval: re-trigger drawing animation every 12s
  timer = setInterval(() => {
    if (typeof document !== 'undefined' && document.hidden) return
    triggerDraw()
  }, 12000)
}

function onVisibilityChange() {
  if (typeof document === 'undefined') return
  if (!document.hidden && !isDrawing.value) {
    startInterval()
  }
}

onMounted(() => {
  // Cold start entry animation with slight delay for layout stabilization
  setTimeout(() => {
    triggerDraw()
  }, 120)

  startInterval()
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
})
</script>

<template>
  <span
    class="ey-logo-wrap"
    :class="{ 'is-drawing': isDrawing, 'is-drawn': isDrawn }"
    :style="{ width: (size || 26) + 'px', height: (size || 26) + 'px' }"
    @animationend="onAnimEnd"
  >
    <svg
      class="ey-logo-svg"
      viewBox="0 0 710 710"
      :width="size || 26"
      :height="size || 26"
      aria-hidden="true"
    >
      <defs>
        <mask :id="uid + '-mask'" maskUnits="userSpaceOnUse" x="0" y="0" width="710" height="710">
          <rect width="710" height="710" fill="black" />
          <path
            class="ey-mask-stroke"
            d="M 20,312 C 29.2,314.0 55.8,321.3 75,324 C 94.2,326.7 117.5,326.7 135,328 C 152.5,329.3 164.2,334.3 180,332 C 195.8,329.7 214.2,321.8 230,314 C 245.8,306.2 262.0,296.3 275,285 C 288.0,273.7 300.5,259.5 308,246 C 315.5,232.5 321.3,216.7 320,204 C 318.7,191.3 310.8,175.7 300,170 C 289.2,164.3 272.0,165.7 255,170 C 238.0,174.3 212.5,181.3 198,196 C 183.5,210.7 174.0,234.7 168,258 C 162.0,281.3 159.3,312.7 162,336 C 164.7,359.3 171.7,383.3 184,398 C 196.3,412.7 217.3,421.0 236,424 C 254.7,427.0 277.0,426.0 296,416 C 315.0,406.0 334.3,386.7 350,364 C 365.7,341.3 378.3,308.3 390,280 C 401.7,251.7 412.7,210.0 420,194 C 427.3,178.0 431.0,177.0 434,184 C 437.0,191.0 437.7,215.3 438,236 C 438.3,256.7 434.0,286.0 436,308 C 438.0,330.0 443.3,355.0 450,368 C 456.7,381.0 465.7,392.3 476,386 C 486.3,379.7 498.3,356.7 512,330 C 525.7,303.3 541.0,260.0 558,226 C 575.0,192.0 600.3,148.3 614,126 C 627.7,103.7 631.0,96.0 640,92 C 649.0,88.0 660.3,93.3 668,102 C 675.7,110.7 685.0,126.7 686,144 C 687.0,161.3 684.3,181.7 674,206 C 663.7,230.3 643.0,261.0 624,290 C 605.0,319.0 582.3,348.3 560,380 C 537.7,411.7 513.3,448.3 490,480 C 466.7,511.7 439.3,547.0 420,570 C 400.7,593.0 386.0,610.7 374,618 C 362.0,625.3 353.0,622.0 348,614 C 343.0,606.0 340.3,587.7 344,570 C 347.7,552.3 356.7,530.3 370,508 C 383.3,485.7 403.3,458.7 424,436 C 444.7,413.3 472.0,390.7 494,372 C 516.0,353.3 535.7,338.3 556,324 C 576.3,309.7 598.7,296.7 616,286 C 633.3,275.3 652.7,264.3 660,260"
            fill="none"
            stroke="white"
            stroke-width="58"
            stroke-linecap="round"
            stroke-linejoin="round"
            pathLength="1000"
          />
        </mask>
      </defs>

      <g class="ey-masked-content" :mask="`url(#${uid}-mask)`">
        <image
          class="ey-logo-img ey-logo-dark"
          :href="withBase('/logo-dark.png')"
          width="710"
          height="710"
        />
        <image
          class="ey-logo-img ey-logo-light"
          :href="withBase('/logo-light.png')"
          width="710"
          height="710"
        />
      </g>
    </svg>
  </span>
</template>

<style scoped>
.ey-logo-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  line-height: 1;
  user-select: none;
}

.ey-logo-svg {
  display: block;
  overflow: visible;
  width: 100%;
  height: 100%;
}

.ey-logo-img {
  width: 710px;
  height: 710px;
}

.ey-logo-dark {
  display: none;
}

.ey-logo-light {
  display: block;
}

:root.dark .ey-logo-dark,
html.dark .ey-logo-dark {
  display: block;
}

:root.dark .ey-logo-light,
html.dark .ey-logo-light {
  display: none;
}

/* Mask animation */
.ey-mask-stroke {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
}

.ey-logo-wrap.is-drawing .ey-mask-stroke {
  stroke-dashoffset: 1000;
  animation: eyDrawStroke 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.ey-logo-wrap.is-drawn .ey-masked-content {
  mask: none !important;
  -webkit-mask: none !important;
}

@keyframes eyDrawStroke {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ey-logo-wrap.is-drawing .ey-mask-stroke {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
