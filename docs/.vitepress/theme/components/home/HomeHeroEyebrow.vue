<template>
  <div class="home-eyebrow">
    <span class="home-eyebrow__accent" aria-hidden="true" />
    <span class="home-eyebrow__accent home-eyebrow__accent--end" aria-hidden="true" />
  </div>
</template>

<style scoped>
.home-eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 0 24px;
  margin-bottom: 8px;
}

.home-eyebrow__text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(161, 161, 170, 0.75);
  white-space: nowrap;
}

.home-eyebrow__accent {
  flex: 1;
  max-width: 120px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.3));
}

.home-eyebrow__accent--end {
  background: linear-gradient(90deg, rgba(167, 139, 250, 0.25), transparent);
}

@media (max-width: 639px) {
  .home-eyebrow__accent {
    max-width: 48px;
  }
}

:global(html:not(.dark)) .home-eyebrow__accent {
  background: linear-gradient(90deg, transparent, rgba(8, 145, 178, 0.45));
}

:global(html:not(.dark)) .home-eyebrow__accent--end {
  background: linear-gradient(90deg, rgba(124, 58, 237, 0.38), transparent);
}
</style>
