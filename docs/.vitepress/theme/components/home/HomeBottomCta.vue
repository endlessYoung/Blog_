<script setup lang="ts">
import { withBase } from 'vitepress'

const readUrl = withBase('/Android/Activity')
</script>

<template>
  <section class="home-cta">
    <div class="home-cta__card">
      <div class="home-cta__copy">
        <h2 class="home-cta__title">准备开始读了吗？</h2>
        <p class="home-cta__sub">从 Android 活动一篇入门，或直接打开 GitHub 看仓库结构。</p>
      </div>
      <div class="home-cta__actions">
        <a class="VPButton medium brand" :href="readUrl">进入阅读</a>
        <a
          class="VPButton medium alt"
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
  padding: 20px 24px 0;
}

@media (min-width: 640px) {
  .home-cta {
    padding: 28px 48px 0;
  }
}

@media (min-width: 960px) {
  .home-cta {
    padding: 32px 64px 0;
  }
}

.home-cta__card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px 26px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    125deg,
    rgba(10, 14, 32, 0.75) 0%,
    rgba(8, 6, 22, 0.85) 50%,
    rgba(6, 18, 28, 0.7) 100%
  );
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

@media (min-width: 720px) {
  .home-cta__card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 32px 36px;
  }
}

.home-cta__title {
  margin: 0 0 8px;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(1.18rem, 2vw, 1.38rem);
  font-weight: 650;
  color: #f4f4f5;
  letter-spacing: 0.02em;
}

.home-cta__sub {
  margin: 0;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(13px, 1.5vw, 15px);
  line-height: 1.68;
  color: rgba(212, 220, 232, 0.78);
  max-width: 28rem;
}

.home-cta__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

:global(html:not(.dark)) .home-cta__card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(125deg, rgba(255, 255, 255, 0.96) 0%, rgba(244, 244, 245, 0.98) 50%, rgba(250, 250, 250, 0.95) 100%);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
}

:global(html:not(.dark)) .home-cta__title {
  color: #18181b;
}

:global(html:not(.dark)) .home-cta__sub {
  color: #52525b;
}
</style>
