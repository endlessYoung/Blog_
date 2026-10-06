<template>
  <!--
    空间主题专属 Backdrop (背景层)
    实现：多重漂移径向渐变光晕 (Drifting Blobs) + SVG 噪点肌理 (Grain)
    响应 data-fx：
      high: 完整平滑漂移动画
      low: 静态微光柔和渐变
      off: 纯色背景，不消耗任何动画帧
  -->
  <div class="spatial-backdrop" aria-hidden="true">
    <div class="spatial-sky">
      <div class="spatial-blob spatial-blob--1"></div>
      <div class="spatial-blob spatial-blob--2"></div>
      <div class="spatial-blob spatial-blob--3"></div>
      <div class="spatial-blob spatial-blob--4"></div>
    </div>
    <!-- 噪点纹理 -->
    <div class="spatial-grain"></div>
  </div>
</template>

<style scoped>
.spatial-backdrop {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  background-color: var(--ey-bg);
}

.spatial-sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.spatial-blob {
  position: absolute;
  width: 72vmax;
  height: 72vmax;
  border-radius: 50%;
  will-change: transform;
  filter: blur(40px);
}

.spatial-blob--1 {
  background: radial-gradient(circle at center, var(--ey-blob-1) 0%, transparent 66%);
  left: -22vmax;
  top: -26vmax;
  animation: spatial-drift 46s ease-in-out infinite alternate;
}

.spatial-blob--2 {
  background: radial-gradient(circle at center, var(--ey-blob-2) 0%, transparent 66%);
  right: -24vmax;
  top: -6vmax;
  animation: spatial-drift 54s ease-in-out -12s infinite alternate;
}

.spatial-blob--3 {
  background: radial-gradient(circle at center, var(--ey-blob-3) 0%, transparent 66%);
  left: 18vmax;
  bottom: -40vmax;
  animation: spatial-drift 60s ease-in-out -30s infinite alternate;
}

.spatial-blob--4 {
  background: radial-gradient(circle at center, var(--ey-blob-4) 0%, transparent 66%);
  left: -30vmax;
  bottom: -30vmax;
  width: 56vmax;
  height: 56vmax;
  opacity: 0.7;
  animation: spatial-drift 50s ease-in-out -20s infinite alternate;
}

@keyframes spatial-drift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  33% { transform: translate3d(5vmax, 3vmax, 0) scale(1.06); }
  66% { transform: translate3d(-3vmax, 6vmax, 0) scale(0.95); }
  100% { transform: translate3d(4vmax, -2vmax, 0) scale(1.03); }
}

/* 噪点层 */
.spatial-grain {
  position: absolute;
  inset: 0;
  opacity: var(--ey-grain-op, 0.06);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

/* 低特效或省电模式降级 */
:root[data-fx="low"] .spatial-blob {
  animation: none;
  filter: blur(24px);
}

:root[data-fx="off"] .spatial-sky,
:root[data-fx="off"] .spatial-grain {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .spatial-blob {
    animation: none;
  }
}
</style>
