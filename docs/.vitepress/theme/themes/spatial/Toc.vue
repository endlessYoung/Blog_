<template>
  <section class="spatial-toc" id="spatial-toc" aria-labelledby="spatial-toc-heading">
    <header class="spatial-toc__header">
      <div class="spatial-toc__kicker">
        <span class="spatial-toc__kicker-num">01</span>
        <span>透镜目录 // SPATIAL INDEX</span>
      </div>
      <h2 id="spatial-toc-heading" class="spatial-toc__title">架构与系统全景</h2>
      <p class="spatial-toc__subtitle">
        在毛玻璃卡片中按领域展开章节，轻触直达各技术领域深度源码剖析。
      </p>
    </header>

    <div class="spatial-toc__grid">
      <article
        v-for="cat in categories"
        :key="cat.label"
        class="spatial-glass-card"
      >
        <header class="spatial-glass-card__head">
          <div class="spatial-glass-card__tag">{{ cat.dirs.join(' · ') }}</div>
          <h3 class="spatial-glass-card__title">{{ cat.label }}</h3>
          <span class="spatial-glass-card__badge">{{ cat.articles.length }} 篇</span>
        </header>

        <ul class="spatial-articles-list" role="list">
          <li
            v-for="(art, idx) in cat.articles.slice(0, 5)"
            :key="art.url"
            class="spatial-articles-item"
          >
            <a :href="art.url" class="spatial-article-link">
              <span class="spatial-article-idx">{{ String(idx + 1).padStart(2, '0') }}</span>
              <span class="spatial-article-title">{{ art.title }}</span>
              <span class="spatial-article-time">{{ art.readingTime }}m</span>
            </a>
          </li>
        </ul>

        <footer v-if="cat.articles.length > 5" class="spatial-glass-card__foot">
          <a :href="`/catalog/#${cat.label}`" class="spatial-more-link">
            展开全部 {{ cat.articles.length }} 篇笔记 →
          </a>
        </footer>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { data as articlesData } from '../../data/articles.data'

const categories = computed(() => articlesData?.categories || [])
</script>

<style scoped>
.spatial-toc {
  position: relative;
  z-index: 1;
  max-width: var(--ey-wrap, 1240px);
  margin: 0 auto;
  padding: var(--ey-space-8, 48px) var(--ey-pad, 40px);
}

.spatial-toc__header {
  margin-bottom: var(--ey-space-8, 48px);
}

.spatial-toc__kicker {
  display: inline-flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  color: var(--ey-accent);
  letter-spacing: var(--ey-tracking-wide);
  margin-bottom: var(--ey-space-2, 8px);
}

.spatial-toc__kicker-num {
  font-weight: 700;
  padding: 2px 6px;
  background: var(--ey-accent-soft);
  border-radius: var(--ey-radius-sm);
}

.spatial-toc__title {
  font-family: var(--ey-font-display);
  font-size: var(--ey-text-2xl, 34px);
  font-weight: 700;
  color: var(--ey-fg);
  margin: 0 0 var(--ey-space-2, 8px);
  letter-spacing: var(--ey-tracking-tight);
}

.spatial-toc__subtitle {
  font-size: var(--ey-text-base, 15px);
  color: var(--ey-fg-3);
  margin: 0;
}

.spatial-toc__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--ey-space-6, 28px);
}

@media (max-width: 480px) {
  .spatial-toc__grid {
    grid-template-columns: 1fr;
  }
}

.spatial-glass-card {
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-lg, 22px);
  padding: var(--ey-space-5, 24px);
  backdrop-filter: blur(var(--ey-blur));
  -webkit-backdrop-filter: blur(var(--ey-blur));
  box-shadow: inset 0 1px 0 var(--ey-edge-top, rgba(255,255,255,0.18)), var(--ey-shadow-sm);
  display: flex;
  flex-direction: column;
  transition: all var(--ey-dur-fast) var(--ey-ease-spring);
}

.spatial-glass-card:hover {
  border-color: var(--ey-line-accent);
  transform: translateY(-4px);
  box-shadow: inset 0 1px 0 var(--ey-edge-top, rgba(255,255,255,0.25)), var(--ey-shadow-md);
}

.spatial-glass-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: var(--ey-border-width) solid var(--ey-line);
  padding-bottom: var(--ey-space-3, 12px);
  margin-bottom: var(--ey-space-4, 16px);
  flex-wrap: wrap;
  gap: var(--ey-space-2);
}

.spatial-glass-card__tag {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-fg-3);
  width: 100%;
}

.spatial-glass-card__title {
  font-family: var(--ey-font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--ey-fg);
  margin: 0;
}

.spatial-glass-card__badge {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-accent);
  padding: 2px 8px;
  background: var(--ey-accent-soft);
  border-radius: var(--ey-radius-pill);
  font-weight: 600;
}

.spatial-articles-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ey-space-3, 12px);
  flex: 1;
}

.spatial-articles-item {
  margin: 0;
}

.spatial-article-link {
  display: flex;
  align-items: center;
  gap: var(--ey-space-3, 12px);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: var(--ey-radius-sm);
  color: var(--ey-fg-2);
  font-size: var(--ey-text-sm, 14px);
  transition: all var(--ey-dur-instant) var(--ey-ease-standard);
}

.spatial-article-link:hover {
  background: var(--ey-surface-2);
  color: var(--ey-fg);
  transform: translateX(4px);
}

.spatial-article-idx {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-fg-disabled);
}

.spatial-article-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spatial-article-time {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-fg-3);
}

.spatial-glass-card__foot {
  margin-top: var(--ey-space-4, 16px);
  padding-top: var(--ey-space-3, 12px);
  border-top: var(--ey-border-width) solid var(--ey-line);
}

.spatial-more-link {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  color: var(--ey-accent);
  text-decoration: none;
  transition: opacity var(--ey-dur-fast);
}

.spatial-more-link:hover {
  opacity: 0.8;
}
</style>
