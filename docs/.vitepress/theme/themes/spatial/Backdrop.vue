<template>
  <div class="sky" aria-hidden="true">
    <i class="blob b1"></i>
    <i class="blob b2"></i>
    <i class="blob b3"></i>
    <i class="blob b4"></i>
    <div class="grain"></div>
  </div>
</template>

<style scoped>
.sky {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: var(--base);
}

.blob {
  position: absolute;
  width: 72vmax;
  height: 72vmax;
  border-radius: 50%;
  background: radial-gradient(circle at center, var(--c) 0%, color-mix(in srgb, var(--c) 40%, transparent) 34%, transparent 66%);
  will-change: transform;
  animation: drift 46s ease-in-out infinite alternate;
}

.b1 {
  --c: var(--blob-1);
  left: -22vmax;
  top: -26vmax;
}

.b2 {
  --c: var(--blob-2);
  right: -24vmax;
  top: -6vmax;
  animation-duration: 54s;
  animation-delay: -12s;
}

.b3 {
  --c: var(--blob-3);
  left: 18vmax;
  bottom: -40vmax;
  animation-duration: 60s;
  animation-delay: -30s;
}

.b4 {
  --c: var(--blob-4);
  left: -30vmax;
  bottom: -30vmax;
  width: 56vmax;
  height: 56vmax;
  animation-duration: 50s;
  animation-delay: -20s;
  opacity: .7;
}

@keyframes drift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  33% { transform: translate3d(6vmax, 4vmax, 0) scale(1.08); }
  66% { transform: translate3d(-4vmax, 7vmax, 0) scale(.94); }
  100% { transform: translate3d(5vmax, -3vmax, 0) scale(1.04); }
}

.grain {
  position: absolute;
  inset: 0;
  opacity: var(--grain-op);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none !important;
  }
}
</style>
