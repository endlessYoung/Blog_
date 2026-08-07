<script setup lang="ts">
import { withBase } from 'vitepress'

const readUrl = withBase('/Android/Activity')
</script>

<template>
  <section class="home-cta">
    <div class="home-cta__card">
      <div class="home-cta__copy">
        <h2 class="home-cta__title">从这里开始读</h2>
        <p class="home-cta__sub">推荐先看 Android 的 Activity，也可以去 GitHub 翻仓库。</p>
      </div>
      <div class="home-cta__actions">
        <a class="home-cta__btn home-cta__btn--primary" :href="readUrl">开始阅读</a>
        <a
          class="home-cta__btn home-cta__btn--ghost"
          href="https://github.com/endlessYoung"
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-cta {
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
  padding: 28px 24px 8px;
}

@media (min-width: 640px) {
  .home-cta {
    padding: 36px 48px 12px;
  }
}

@media (min-width: 960px) {
  .home-cta {
    padding: 40px 64px 16px;
  }
}

/* α：轻面板 — 细边、淡底、无厚阴影 */
.home-cta__card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 22px 22px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  box-shadow: none;
}

@media (min-width: 720px) {
  .home-cta__card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    padding: 26px 28px;
  }
}

.home-cta__title {
  margin: 0 0 6px;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(1.12rem, 1.8vw, 1.28rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #f4f4f5;
}

.home-cta__sub {
  margin: 0;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: 14px;
  line-height: 1.65;
  color: rgba(212, 220, 232, 0.72);
  max-width: 28rem;
}

.home-cta__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.home-cta__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.home-cta__btn::after {
  content: none !important;
  display: none !important;
}

.home-cta__btn--primary {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border: 1px solid rgba(103, 232, 249, 0.55);
  background: #0e7490;
}

.home-cta__btn--primary:hover {
  transform: translateY(-1px);
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #0891b2;
  border-color: #67e8f9;
}

.home-cta__btn--ghost {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.08);
}

.home-cta__btn--ghost:hover {
  transform: translateY(-1px);
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border-color: rgba(103, 232, 249, 0.55);
  background: rgba(34, 211, 238, 0.14);
}

:global(html:not(.dark) .home-cta__card) {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.55);
  box-shadow: none;
}

:global(html:not(.dark) .home-cta__title) {
  color: #18181b;
}

:global(html:not(.dark) .home-cta__sub) {
  color: #52525b;
}

:global(html:not(.dark) .home-cta__btn--primary) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border-color: rgba(8, 145, 178, 0.45);
  background: #0e7490;
}

:global(html:not(.dark) .home-cta__btn--primary:hover) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: #0891b2;
  border-color: rgba(8, 145, 178, 0.65);
}

:global(html:not(.dark) .home-cta__btn--ghost) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border-color: rgba(8, 145, 178, 0.35);
  background: #164e63;
}

:global(html:not(.dark) .home-cta__btn--ghost:hover) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border-color: rgba(8, 145, 178, 0.55);
  background: #0e7490;
}
</style>
