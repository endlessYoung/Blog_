---
title: 全站时间线归档
description: Endless Young 个人技术博客按年份与月份全站文章归档
layout: doc
---

<script setup>
import { computed } from 'vue'
import { data as articlesData } from './.vitepress/theme/data/articles.data'

const articles = computed(() => (articlesData?.articles || []).filter(Boolean))

// 按年份分组
const yearGroups = computed(() => {
  const groups = {}
  for (const art of articles.value) {
    if (!art) continue
    const year = art.created ? art.created.slice(0, 4) : '早期'
    if (!groups[year]) groups[year] = []
    groups[year].push(art)
  }
  // 降序排序
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((year) => ({
      year,
      articles: groups[year].filter(Boolean).sort((a, b) => ((b && b.created) || '').localeCompare((a && a.created) || '')),
    }))
})
</script>

# 全站时间线归档

按时间线纵览本站所有技术演进与学习足迹。

<div class="archive-container">
  <div v-for="g in yearGroups" :key="g.year" class="archive-year-group">
    <h2 class="archive-year-title">
      {{ g.year }}
      <span class="archive-year-count">{{ g.articles.length }} 篇</span>
    </h2>

    <ul class="archive-list" role="list">
      <li v-for="art in g.articles" :key="art ? art.url : Math.random()" class="archive-item">
        <time class="archive-date" :datetime="art ? art.created : ''">
          {{ art && art.created ? art.created.slice(5) : '--' }}
        </time>
        <span class="archive-sec-tag">{{ art ? art.section : '' }}</span>
        <a :href="art ? art.url : '#'" class="archive-link">{{ art ? art.title : '' }}</a>
      </li>
    </ul>

  </div>
</div>

<style scoped>
.archive-container {
  margin-top: 32px;
}
.archive-year-group {
  margin-bottom: 40px;
}
.archive-year-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  border-bottom: var(--ey-border-width, 1px) solid var(--ey-line);
  padding-bottom: 8px;
  margin-bottom: 16px;
}
.archive-year-count {
  font-family: var(--ey-font-mono);
  font-size: 14px;
  color: var(--ey-accent);
}
.archive-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.archive-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  padding: 4px 0;
}
.archive-date {
  font-family: var(--ey-font-mono);
  font-size: 13px;
  color: var(--ey-fg-3);
  width: 50px;
  flex-shrink: 0;
}
.archive-sec-tag {
  font-family: var(--ey-font-mono);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: var(--ey-radius-sm);
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  color: var(--ey-accent);
  width: 70px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}
.archive-link {
  color: var(--ey-fg);
  text-decoration: none;
  transition: color var(--ey-dur-fast);
}
.archive-link:hover {
  color: var(--ey-accent);
}
@media (max-width: 480px) {
  .archive-sec-tag {
    display: none;
  }
}
</style>
