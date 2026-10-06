<template>
  <!--
    工程主题 Backdrop (背景层)
    实现：纯 CSS 精密 12 栏工程参考网格
    零 GPU 特效，零动画帧消耗，作为最稳定基线

    光标临近时对应网格列高亮（JS 辅助更新 CSS 自定义属性）
    JS 禁用时：静态网格，完整可读
  -->
  <div class="eng-backdrop" aria-hidden="true">
    <!-- 基础网格 -->
    <div class="eng-grid eng-grid--base" ref="gridBase">
      <div v-for="i in 12" :key="i" class="eng-grid__col"></div>
    </div>
    <!-- 光标附近的高亮网格 (客户端注水后激活) -->
    <div class="eng-grid eng-grid--glow" ref="gridGlow">
      <div v-for="i in 12" :key="i" class="eng-grid__col"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const gridGlow = ref<HTMLElement | null>(null)

let rafId = 0
let mouseX = 0
let mouseY = 0

function handleMouseMove(e: MouseEvent) {
  mouseX = e.clientX
  mouseY = e.clientY
}

function updateGlow() {
  if (!gridGlow.value) return
  const cols = gridGlow.value.querySelectorAll<HTMLElement>('.eng-grid__col')
  cols.forEach((col) => {
    const rect = col.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const dist = Math.abs(mouseX - centerX)
    // 距离 <= 240px 时逐渐高亮，超出则淡出
    const alpha = Math.max(0, 1 - dist / 240)
    col.style.setProperty('--glow-alpha', String(alpha))
  })
  rafId = requestAnimationFrame(updateGlow)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
  rafId = requestAnimationFrame(updateGlow)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.eng-backdrop {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.eng-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  max-width: var(--ey-wrap, 1280px);
  margin: 0 auto;
  padding: 0 var(--ey-pad, 40px);
  gap: var(--ey-gutter, 24px);
}

.eng-grid__col {
  border-left: var(--ey-border-width, 1px) solid var(--ey-grid-line, rgba(255,255,255,0.035));
  height: 100%;
}

/* 最后一列的右侧也要画 */
.eng-grid__col:last-child {
  border-right: var(--ey-border-width, 1px) solid var(--ey-grid-line, rgba(255,255,255,0.035));
}

/* 高亮层：列的透明度由 JS 控制 */
.eng-grid--glow .eng-grid__col {
  border-left-color: color-mix(
    in srgb,
    var(--ey-grid-glow, rgba(255,255,255,0.14)) calc(var(--glow-alpha, 0) * 100%),
    transparent
  );
}

.eng-grid--glow .eng-grid__col:last-child {
  border-right-color: color-mix(
    in srgb,
    var(--ey-grid-glow, rgba(255,255,255,0.14)) calc(var(--glow-alpha, 0) * 100%),
    transparent
  );
}

/* 小屏隐藏辅助网格 */
@media (max-width: 768px) {
  .eng-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  /* 4 栏以上的列隐藏 */
  .eng-grid__col:nth-child(n + 5) {
    display: none;
  }
  .eng-grid--glow {
    display: none;
  }
}
</style>
