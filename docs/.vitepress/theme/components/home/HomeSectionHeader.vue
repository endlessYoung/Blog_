<template>
  <header class="home-sec-head">
    <h2 class="home-sec-head__title">专栏</h2>
    <div class="home-sec-head__rule" aria-hidden="true" />
  </header>
</template>

<style scoped>
.home-sec-head {
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 14px;
}

@media (min-width: 640px) {
  .home-sec-head {
    padding-left: 48px;
    padding-right: 48px;
    padding-bottom: 16px;
  }
}

@media (min-width: 960px) {
  .home-sec-head {
    padding-left: 64px;
    padding-right: 64px;
    padding-bottom: 18px;
  }
}

.home-sec-head__title {
  margin: 0 0 12px;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(1.22rem, 2.2vw, 1.45rem);
  font-weight: 650;
  letter-spacing: 0.04em;
  color: #fafafa;
  -webkit-text-fill-color: currentColor;
}

.home-sec-head__rule {
  width: 48px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.55), rgba(34, 211, 238, 0.35), transparent);
}
</style>

<!-- 勿用 :global(html:not(.dark)) 包属性：Vue 会误编译成整页 html 规则，锁死 -webkit-text-fill-color，浅色代码高亮全变灰 -->
<style>
html:not(.dark) .home-sec-head__title {
  color: #0f172a !important;
  -webkit-text-fill-color: currentColor !important;
}

html:not(.dark) .home-sec-head__rule {
  background: linear-gradient(90deg, rgba(8, 145, 178, 0.5), rgba(8, 145, 178, 0.3), transparent);
}
</style>
