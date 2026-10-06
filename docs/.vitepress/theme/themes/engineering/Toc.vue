<template>
  <!--
    工程主题专属 Toc (目录列表)
    形态：手册式精密点线列表 (Leader dots)
    用于首页目录导航或功能页目录卡片
  -->
  <section class="eng-toc" aria-labelledby="toc-heading">
    <div class="eng-toc__header">
      <div class="eng-toc__badge">
        <span class="eng-toc__badge-dot"></span>
        CATALOG // 手册索引
      </div>
      <h2 id="toc-heading" class="eng-toc__title">核心知识索引</h2>
      <p class="eng-toc__subtitle">全站工程笔记与系统级架构拆解</p>
    </div>

    <div class="eng-toc__grid">
      <article
        v-for="cat in categories"
        :key="cat.label"
        class="eng-toc-card"
      >
        <header class="eng-toc-card__head">
          <div class="eng-toc-card__tag">DIR // {{ cat.dirs.join(', ') }}</div>
          <h3 class="eng-toc-card__title">{{ cat.label }}</h3>
          <span class="eng-toc-card__count">{{ cat.articles.length }} 篇</span>
        </header>

        <ul class="eng-toc-list" role="list">
          <li
            v-for="(art, idx) in cat.articles.slice(0, 6)"
            :key="art.url"
            class="eng-toc-item"
          >
            <a :href="art.url" class="eng-toc-link">
              <span class="eng-toc-link__idx">{{ String(idx + 1).padStart(2, '0') }}</span>
              <span class="eng-toc-link__title">{{ art.title }}</span>
              <span class="eng-toc-link__dots" aria-hidden="true"></span>
              <span class="eng-toc-link__time">{{ art.readingTime }}m</span>
            </a>
          </li>
        </ul>

        <footer v-if="cat.articles.length > 6" class="eng-toc-card__foot">
          <a :href="`/catalog/#${cat.label}`" class="eng-toc-card__more">
            查看该分类全部 {{ cat.articles.length }} 篇 →
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
.eng-toc {
  position: relative;
  z-index: 1;
  max-width: var(--ey-wrap, 1280px);
  margin: 0 auto;
  padding: var(--ey-space-8, 48px) var(--ey-pad, 40px);
}

.eng-toc__header {
  margin-bottom: var(--ey-space-8, 48px);
}

.eng-toc__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  letter-spacing: var(--ey-tracking-wider);
  color: var(--ey-accent);
  margin-bottom: var(--ey-space-2, 8px);
}

.eng-toc__badge-dot {
  width: 6px;
  height: 6px;
  background: var(--ey-accent);
  border-radius: var(--ey-radius-sm);
}

.eng-toc__title {
  font-family: var(--ey-font-display);
  font-size: var(--ey-text-2xl, 32px);
  font-weight: 700;
  letter-spacing: var(--ey-tracking-tight);
  color: var(--ey-fg);
  margin: 0 0 var(--ey-space-2, 8px);
}

.eng-toc__subtitle {
  font-size: var(--ey-text-base, 15px);
  color: var(--ey-fg-3);
  margin: 0;
}

.eng-toc__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: var(--ey-space-6, 32px);
}

@media (max-width: 480px) {
  .eng-toc__grid {
    grid-template-columns: 1fr;
  }
}

.eng-toc-card {
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-md, 4px);
  padding: var(--ey-space-5, 24px);
  display: flex;
  flex-direction: column;
  transition: border-color var(--ey-dur-fast) var(--ey-ease-standard);
}

.eng-toc-card:hover {
  border-color: var(--ey-accent);
}

.eng-toc-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: var(--ey-border-width) solid var(--ey-line);
  padding-bottom: var(--ey-space-3, 12px);
  margin-bottom: var(--ey-space-4, 16px);
  flex-wrap: wrap;
  gap: var(--ey-space-2);
}

.eng-toc-card__tag {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  letter-spacing: var(--ey-tracking-wide);
  color: var(--ey-fg-3);
  width: 100%;
}

.eng-toc-card__title {
  font-family: var(--ey-font-display);
  font-size: var(--ey-text-lg, 20px);
  font-weight: 700;
  color: var(--ey-fg);
  margin: 0;
}

.eng-toc-card__count {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  color: var(--ey-accent);
  font-weight: 600;
}

.eng-toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--ey-space-3, 12px);
  flex: 1;
}

.eng-toc-item {
  margin: 0;
}

.eng-toc-link {
  display: flex;
  align-items: baseline;
  text-decoration: none;
  color: var(--ey-fg-2);
  font-size: var(--ey-text-sm, 14px);
  gap: var(--ey-space-2, 8px);
  transition: color var(--ey-dur-fast);
  min-height: 28px;
}

.eng-toc-link:hover {
  color: var(--ey-accent);
}

.eng-toc-link:hover .eng-toc-link__title {
  color: var(--ey-fg);
}

.eng-toc-link__idx {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-fg-disabled);
  flex-shrink: 0;
}

.eng-toc-link__title {
  color: var(--ey-fg-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 65%;
  transition: color var(--ey-dur-fast);
}

.eng-toc-link__dots {
  flex: 1;
  border-bottom: 1px dotted var(--ey-line-2);
  margin-bottom: 4px;
  min-width: 16px;
}

.eng-toc-link__time {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  color: var(--ey-fg-3);
  flex-shrink: 0;
}

.eng-toc-card__foot {
  margin-top: var(--ey-space-4, 16px);
  padding-top: var(--ey-space-3, 12px);
  border-top: var(--ey-border-width) solid var(--ey-line);
}

.eng-toc-card__more {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  color: var(--ey-accent);
  text-decoration: none;
  transition: opacity var(--ey-dur-fast);
}

.eng-toc-card__more:hover {
  opacity: 0.8;
}
</style>
