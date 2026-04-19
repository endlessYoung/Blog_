<!-- 背景：近黑底 + 细蓝图网格 + 左侧青绿漫射（对标 LetAiCode 类落地页氛围） -->
<script setup lang="ts"></script>

<template>
  <div class="tech-bg" aria-hidden="true">
    <div class="tech-bg__glow tech-bg__glow--left" />
    <div class="tech-bg__glow tech-bg__glow--right" />
    <div class="tech-bg__grid" />
    <div class="tech-bg__grain" />
    <div class="tech-bg__vignette" />
  </div>
</template>

<style scoped>
.tech-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: -3;
  background: #050508;
}

.tech-bg__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  pointer-events: none;
}

/* 左侧青绿光晕，模拟产品图里的主光源 */
.tech-bg__glow--left {
  width: min(70vw, 720px);
  height: min(70vw, 720px);
  top: 10%;
  left: -18%;
  background: radial-gradient(
    circle,
    rgba(34, 211, 238, 0.28) 0%,
    rgba(16, 185, 129, 0.1) 42%,
    transparent 68%
  );
  opacity: 0.95;
  animation: glowDrift 18s ease-in-out infinite alternate;
}

/* 右侧极弱紫粉，增加纵深，不参与主叙事 */
.tech-bg__glow--right {
  width: min(52vw, 520px);
  height: min(52vw, 520px);
  bottom: 2%;
  right: -14%;
  background:
    radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.14) 0%, transparent 45%),
    radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, transparent 62%);
  opacity: 0.85;
  animation: glowDrift 22s ease-in-out infinite alternate-reverse;
}

.tech-bg__grid {
  position: absolute;
  inset: 0;
  transform: translateY(
    calc(var(--home-immersion, 0) * 36px + var(--home-below, 0) * 28px)
  );
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 85% 70% at 50% 35%, rgba(0, 0, 0, 0.65), transparent 100%);
  opacity: 0.55;
}

.tech-bg__grain {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
  pointer-events: none;
}

.tech-bg__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 100% 85% at 50% 50%, transparent 30%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
}

@keyframes glowDrift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    transform: translate3d(2%, -1.5%, 0) scale(1.04);
  }
}

@media (max-width: 960px) {
  .tech-bg__grid {
    background-size: 36px 36px;
    opacity: 0.42;
  }

  .tech-bg__glow--left {
    opacity: 0.75;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tech-bg__glow--left,
  .tech-bg__glow--right {
    animation: none;
  }

  .tech-bg__grid {
    transform: none;
  }
}
</style>

<style>
/* 浅色：底与网格对比度随 zinc 页底，避免仍用近黑 #050508 */
html:not(.dark) .tech-bg {
  background: linear-gradient(180deg, #fafafa 0%, #f4f4f5 45%, #e4e4e7 100%);
}

html:not(.dark) .tech-bg__glow--left {
  background: radial-gradient(
    circle,
    rgba(6, 182, 212, 0.18) 0%,
    rgba(34, 197, 94, 0.08) 42%,
    transparent 68%
  );
  opacity: 0.65;
}

html:not(.dark) .tech-bg__glow--right {
  background:
    radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.06) 0%, transparent 45%),
    radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 62%);
  opacity: 0.38;
  width: min(44vw, 420px);
  right: -8%;
}

html:not(.dark) .tech-bg__grid {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  opacity: 0.4;
}

html:not(.dark) .tech-bg__vignette {
  background: radial-gradient(ellipse 100% 85% at 50% 50%, transparent 35%, rgba(0, 0, 0, 0.04) 100%);
}
</style>
