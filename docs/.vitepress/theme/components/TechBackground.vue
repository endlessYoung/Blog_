<!-- 首页：深海军底 + CRT 扫描 + glitch 彩条 + 透视网格；文章页仅保留弱网格 -->
<!--
  重要：勿在 scoped 里写 :global(body:has(...)) .child / :global(html.dark) .child
  Vue 会把子选择器丢掉，把 opacity/height/background 直接打到 body/html 上，
  造成整页半透明「遮罩感」（尤其 ≤960px）。首页条件样式一律放 unscoped。
-->
<script setup lang="ts"></script>

<template>
  <div class="tech-bg" aria-hidden="true">
    <div class="tech-bg__base" />
    <div class="tech-bg__glow tech-bg__glow--left" />
    <div class="tech-bg__glow tech-bg__glow--right" />
    <div class="tech-bg__floor" />
    <div class="tech-bg__grid" />
    <div class="tech-bg__glitch" />
    <div class="tech-bg__scan" />
    <div class="tech-bg__grain" />
    <div class="tech-bg__particles" />
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
  background: #03050a;
}

.tech-bg__base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(8, 40, 60, 0.55), transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(60, 20, 90, 0.25), transparent 55%),
    linear-gradient(180deg, #061018 0%, #03050a 45%, #020308 100%);
}

.tech-bg__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  pointer-events: none;
}

.tech-bg__glow--left {
  width: min(70vw, 720px);
  height: min(70vw, 720px);
  top: 8%;
  left: -16%;
  background: radial-gradient(
    circle,
    rgba(34, 211, 238, 0.42) 0%,
    rgba(16, 185, 129, 0.14) 42%,
    transparent 68%
  );
  opacity: 0.9;
  animation: glowDrift 18s ease-in-out infinite alternate;
}

.tech-bg__glow--right {
  width: min(52vw, 520px);
  height: min(52vw, 520px);
  bottom: 4%;
  right: -12%;
  background:
    radial-gradient(circle at 40% 40%, rgba(34, 211, 238, 0.22) 0%, transparent 45%),
    radial-gradient(circle, rgba(34, 211, 238, 0.28) 0%, transparent 62%);
  opacity: 0.85;
  animation: glowDrift 22s ease-in-out infinite alternate-reverse;
}

.tech-bg__floor {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: -8%;
  height: 48vh;
  opacity: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.18) 1px, transparent 1px);
  background-size: 48px 48px;
  transform: perspective(420px) rotateX(62deg);
  transform-origin: 50% 100%;
  mask-image: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.55) 35%, rgba(0, 0, 0, 0.9) 100%);
}

.tech-bg__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.07) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 90% 70% at 50% 30%, rgba(0, 0, 0, 0.75), transparent 100%);
  opacity: 0.25;
}

.tech-bg__glitch {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent 0%, rgba(34, 211, 238, 0.55) 8%, rgba(34, 211, 238, 0.15) 22%, transparent 35%) 0 18% / 100% 3px no-repeat,
    linear-gradient(90deg, transparent 40%, rgba(34, 211, 238, 0.65) 52%, rgba(34, 211, 238, 0.2) 62%, transparent 78%) 0 34% / 100% 2px no-repeat,
    linear-gradient(90deg, transparent 10%, rgba(103, 232, 249, 0.5) 28%, transparent 48%) 0 52% / 100% 2px no-repeat,
    linear-gradient(90deg, transparent 55%, rgba(192, 132, 252, 0.55) 68%, rgba(34, 211, 238, 0.35) 78%, transparent 92%) 0 71% / 100% 3px no-repeat,
    linear-gradient(90deg, transparent 5%, rgba(34, 211, 238, 0.4) 18%, transparent 32%) 0 84% / 100% 2px no-repeat;
  mix-blend-mode: screen;
  animation: glitchBars 5.5s steps(1, end) infinite;
}

.tech-bg__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 2px,
    rgba(0, 0, 0, 0.28) 2px,
    rgba(0, 0, 0, 0.28) 3px
  );
}

.tech-bg__grain {
  position: absolute;
  inset: 0;
  opacity: 0.02;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: soft-light;
  pointer-events: none;
}

.tech-bg__particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background-image:
    radial-gradient(1.5px 1.5px at 12% 22%, rgba(34, 211, 238, 0.9), transparent),
    radial-gradient(1px 1px at 28% 68%, rgba(34, 211, 238, 0.7), transparent),
    radial-gradient(2px 2px at 46% 18%, rgba(103, 232, 249, 0.75), transparent),
    radial-gradient(1px 1px at 62% 78%, rgba(34, 211, 238, 0.7), transparent),
    radial-gradient(1.5px 1.5px at 78% 34%, rgba(192, 132, 252, 0.8), transparent),
    radial-gradient(1px 1px at 88% 58%, rgba(34, 211, 238, 0.6), transparent),
    radial-gradient(1px 1px at 18% 48%, rgba(255, 255, 255, 0.45), transparent),
    radial-gradient(2px 2px at 54% 42%, rgba(34, 211, 238, 0.55), transparent),
    radial-gradient(1px 1px at 36% 88%, rgba(34, 211, 238, 0.65), transparent),
    radial-gradient(1.5px 1.5px at 70% 12%, rgba(34, 211, 238, 0.7), transparent);
  animation: particleDrift 18s ease-in-out infinite alternate;
}

.tech-bg__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 100% 85% at 50% 40%, transparent 45%, rgba(0, 0, 0, 0.28) 100%);
  pointer-events: none;
}

@media (max-width: 960px) {
  .tech-bg__grid {
    background-size: 32px 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tech-bg__glow--left,
  .tech-bg__glow--right,
  .tech-bg__scan,
  .tech-bg__particles,
  .tech-bg__glitch {
    animation: none;
  }
}

@keyframes glowDrift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    transform: translate3d(2%, -1.5%, 0) scale(1.04);
  }
}

@keyframes scanDrift {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 24px;
  }
}

@keyframes particleDrift {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(0, -1.5%, 0);
  }
}

@keyframes glitchBars {
  0%,
  88%,
  100% {
    transform: translate3d(0, 0, 0);
    filter: none;
  }
  89% {
    transform: translate3d(-6px, 0, 0);
    filter: hue-rotate(20deg);
  }
  91% {
    transform: translate3d(8px, 2px, 0);
  }
  93% {
    transform: translate3d(-3px, -1px, 0);
  }
  95% {
    transform: translate3d(0, 0, 0);
  }
}
</style>

<style>
/* —— 首页 / 深浅色条件：必须 unscoped，完整选择器 —— */

body:has(.VPContent.is-home) .tech-bg__floor,
body:has(.home-landing) .tech-bg__floor {
  opacity: 0.55;
}

body:has(.VPContent.is-home) .tech-bg__grid,
body:has(.home-landing) .tech-bg__grid {
  opacity: 0.7;
}

body:has(.VPContent.is-home) .tech-bg__glitch,
body:has(.home-landing) .tech-bg__glitch {
  opacity: 0.85;
}

body:has(.VPContent.is-home) .tech-bg__scan,
body:has(.home-landing) .tech-bg__scan {
  opacity: 0.28;
  animation: techBgScanDrift 8s linear infinite;
}

body:has(.VPContent.is-home) .tech-bg__grain,
body:has(.home-landing) .tech-bg__grain {
  opacity: 0.06;
}

body:has(.VPContent.is-home) .tech-bg__particles,
body:has(.home-landing) .tech-bg__particles {
  opacity: 0.85;
}

body:has(.VPContent.is-home) .tech-bg__vignette,
body:has(.home-landing) .tech-bg__vignette {
  background: radial-gradient(ellipse 110% 90% at 50% 35%, transparent 50%, rgba(0, 0, 0, 0.22) 100%);
}

@keyframes techBgScanDrift {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 24px;
  }
}

@media (max-width: 960px) {
  body:has(.VPContent.is-home) .tech-bg__floor,
  body:has(.home-landing) .tech-bg__floor {
    opacity: 0.35;
    height: 36vh;
  }

  body:has(.VPContent.is-home) .tech-bg__glitch,
  body:has(.home-landing) .tech-bg__glitch {
    opacity: 0.35;
    mix-blend-mode: normal;
  }

  body:has(.VPContent.is-home) .tech-bg__particles,
  body:has(.home-landing) .tech-bg__particles {
    opacity: 0.45;
  }

  /* 小屏大幅削弱扫描/噪点，避免「蒙一层膜」 */
  body:has(.VPContent.is-home) .tech-bg__scan,
  body:has(.home-landing) .tech-bg__scan {
    opacity: 0.1;
    background: repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 3px,
      rgba(0, 0, 0, 0.12) 3px,
      rgba(0, 0, 0, 0.12) 4px
    );
  }

  body:has(.VPContent.is-home) .tech-bg__grain,
  body:has(.home-landing) .tech-bg__grain {
    opacity: 0.02;
    mix-blend-mode: normal;
  }

  html.dark .tech-bg {
    background: #071018;
  }

  html.dark .tech-bg__base {
    background:
      radial-gradient(ellipse 85% 55% at 50% 0%, rgba(14, 64, 88, 0.78), transparent 62%),
      radial-gradient(ellipse 65% 45% at 82% 18%, rgba(78, 32, 118, 0.34), transparent 55%),
      linear-gradient(180deg, #0b1a28 0%, #07141e 45%, #050e16 100%);
  }

  html.dark .tech-bg__glow--left {
    opacity: 1;
    background: radial-gradient(
      circle,
      rgba(34, 211, 238, 0.52) 0%,
      rgba(16, 185, 129, 0.18) 42%,
      transparent 68%
    );
  }

  html.dark .tech-bg__glow--right {
    opacity: 0.95;
  }

  html.dark body:has(.VPContent.is-home) .tech-bg__floor,
  html.dark body:has(.home-landing) .tech-bg__floor {
    opacity: 0.4;
  }

  html.dark body:has(.VPContent.is-home) .tech-bg__scan,
  html.dark body:has(.home-landing) .tech-bg__scan {
    opacity: 0.08;
    background: repeating-linear-gradient(
      0deg,
      transparent 0,
      transparent 3px,
      rgba(0, 0, 0, 0.1) 3px,
      rgba(0, 0, 0, 0.1) 4px
    );
  }

  html.dark body:has(.VPContent.is-home) .tech-bg__grain,
  html.dark body:has(.home-landing) .tech-bg__grain {
    opacity: 0.02;
    mix-blend-mode: normal;
  }

  html.dark .tech-bg__vignette,
  html.dark body:has(.VPContent.is-home) .tech-bg__vignette,
  html.dark body:has(.home-landing) .tech-bg__vignette {
    background: radial-gradient(
      ellipse 115% 95% at 50% 35%,
      transparent 55%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }

  html.dark body:has(.VPContent.is-home) .tech-bg__grid,
  html.dark body:has(.home-landing) .tech-bg__grid {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  body:has(.VPContent.is-home) .tech-bg__glitch,
  body:has(.home-landing) .tech-bg__glitch {
    opacity: 0.45;
    animation: none;
  }

  body:has(.VPContent.is-home) .tech-bg__scan,
  body:has(.home-landing) .tech-bg__scan {
    animation: none;
  }
}

/* 浅色 */
html:not(.dark) .tech-bg {
  background: linear-gradient(180deg, #fafafa 0%, #f4f4f5 45%, #e4e4e7 100%);
}

html:not(.dark) .tech-bg__base {
  background: transparent;
}

html:not(.dark) .tech-bg__glow--left {
  opacity: 0.45;
}

html:not(.dark) .tech-bg__glow--right {
  opacity: 0.28;
}

html:not(.dark) .tech-bg__floor,
html:not(.dark) body:has(.VPContent.is-home) .tech-bg__floor,
html:not(.dark) body:has(.home-landing) .tech-bg__floor {
  opacity: 0 !important;
}

html:not(.dark) .tech-bg__glitch,
html:not(.dark) body:has(.VPContent.is-home) .tech-bg__glitch,
html:not(.dark) body:has(.home-landing) .tech-bg__glitch {
  opacity: 0 !important;
}

html:not(.dark) .tech-bg__grid {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  opacity: 0.4;
}

html:not(.dark) body:has(.VPContent.is-home) .tech-bg__scan,
html:not(.dark) body:has(.home-landing) .tech-bg__scan {
  opacity: 0.08;
  background: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 3px,
    rgba(0, 0, 0, 0.04) 3px,
    rgba(0, 0, 0, 0.04) 4px
  );
}

html:not(.dark) .tech-bg__vignette {
  background: radial-gradient(ellipse 100% 85% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.04) 100%);
}

html:not(.dark) body:has(.VPContent.is-home) .tech-bg__particles,
html:not(.dark) body:has(.home-landing) .tech-bg__particles {
  opacity: 0.2;
}
</style>
