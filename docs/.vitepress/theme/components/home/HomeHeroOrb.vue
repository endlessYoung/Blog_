<template>
  <div class="home-orb" aria-hidden="true">
    <div class="home-orb__glow" />
    <div class="home-orb__ring home-orb__ring--a" />
    <div class="home-orb__ring home-orb__ring--b" />
    <div class="home-orb__core" />
    <div class="home-orb__grid" />
  </div>
</template>

<style scoped>
.home-orb {
  position: relative;
  width: min(100%, 360px);
  height: min(72vw, 360px);
  margin: 0 auto;
}

@media (min-width: 960px) {
  .home-orb {
    width: 100%;
    height: 100%;
    max-width: 400px;
    max-height: 400px;
    margin: 0;
  }
}

.home-orb__glow {
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 40% 35%,
    rgba(34, 211, 238, 0.24),
    rgba(167, 139, 250, 0.12) 45%,
    transparent 70%
  );
  filter: blur(28px);
  animation: orbGlow 8s ease-in-out infinite alternate;
}

.home-orb__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid transparent;
  pointer-events: none;
}

.home-orb__ring--a {
  border-style: dashed;
  border-color: rgba(34, 211, 238, 0.28);
  animation: orbSpin 28s linear infinite;
}

.home-orb__ring--b {
  inset: 12%;
  border-style: dashed;
  border-color: rgba(167, 139, 250, 0.22);
  animation: orbSpin 38s linear infinite reverse;
}

.home-orb__core {
  position: absolute;
  inset: 22%;
  border-radius: 50%;
  background: linear-gradient(
    145deg,
    rgba(18, 18, 22, 0.92) 0%,
    rgba(12, 14, 24, 0.85) 50%,
    rgba(10, 18, 28, 0.88) 100%
  );
  box-shadow:
    inset 0 0 50px rgba(34, 211, 238, 0.08),
    inset 0 -16px 36px rgba(167, 139, 250, 0.06),
    0 20px 50px rgba(0, 0, 0, 0.45);
}

.home-orb__grid {
  position: absolute;
  inset: 28%;
  border-radius: 50%;
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.04) 1px, transparent 1px);
  background-size: 14px 14px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 75%);
  opacity: 0.6;
}

@keyframes orbSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbGlow {
  0% {
    opacity: 0.85;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1.03);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-orb__ring--a,
  .home-orb__ring--b,
  .home-orb__glow {
    animation: none;
  }
}
</style>

<style>
/* 浅色：避免近黑「黑洞」球体；裁切外圈虚线，减轻右侧溢出感 */
html:not(.dark) .home-orb {
  overflow: hidden;
  border-radius: 50%;
}

html:not(.dark) .home-orb__core {
  background: linear-gradient(145deg, #e2e8f0 0%, #cbd5e1 42%, #f8fafc 100%);
  box-shadow:
    inset 0 0 36px rgba(6, 182, 212, 0.14),
    inset 0 -14px 28px rgba(124, 58, 237, 0.08),
    0 14px 36px rgba(15, 23, 42, 0.08);
}

html:not(.dark) .home-orb__ring--a {
  border-color: rgba(8, 145, 178, 0.38);
}

html:not(.dark) .home-orb__ring--b {
  border-color: rgba(124, 58, 237, 0.3);
}

html:not(.dark) .home-orb__glow {
  background: radial-gradient(
    circle at 40% 35%,
    rgba(6, 182, 212, 0.2) 0%,
    rgba(167, 139, 250, 0.1) 45%,
    transparent 70%
  );
  opacity: 0.75;
}

html:not(.dark) .home-orb__grid {
  background-image:
    linear-gradient(rgba(8, 145, 178, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(8, 145, 178, 0.06) 1px, transparent 1px);
  opacity: 0.45;
}
</style>
