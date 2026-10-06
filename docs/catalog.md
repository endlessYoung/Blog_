---
title: 完整目录索引
description: Endless Young 个人技术笔记全站目录索引与分类导览
layout: doc
---

<script setup>
import { computed } from 'vue'
import { data as articlesData } from './.vitepress/theme/data/articles.data'

const categories = computed(() => articlesData?.categories || [])
const totalCount = computed(() => articlesData?.metrics?.totalArticles || 0)
</script>

# 完整目录索引

本站共收录 **{{ totalCount }}** 篇正式技术笔记，覆盖移动端系统级开发、AI 与智能体工程、后端与底层系统。

<div class="catalog-page-container">
  <div v-for="cat in categories" :key="cat.label" class="catalog-section" :id="cat.label">
    <h2 class="catalog-section-title">
      {{ cat.label }}
      <span class="catalog-section-count">({{ cat.articles.length }} 篇)</span>
    </h2>

    <div class="catalog-articles-grid">
      <a
        v-for="(art, idx) in (cat.articles || []).filter(Boolean)"
        :key="art ? art.url : idx"
        :href="art ? art.url : '#'"
        class="catalog-item"
      >
        <div class="catalog-item-header">
          <span class="catalog-item-idx">{{ String(idx + 1).padStart(2, '0') }}</span>
          <span class="catalog-item-section">{{ art ? art.section : '' }}</span>
          <span class="catalog-item-time">{{ art ? art.readingTime : 1 }} 分钟</span>
        </div>
        <div class="catalog-item-title">{{ art?.title }}</div>
        <div v-if="art?.description" class="catalog-item-desc">{{ art?.description }}</div>
      </a>
    </div>

  </div>
</div>

<style scoped>
.catalog-page-container {
  margin-top: 32px;
}
.catalog-section {
  margin-bottom: 48px;
}
.catalog-section-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  border-bottom: var(--ey-border-width, 1px) solid var(--ey-line);
  padding-bottom: 8px;
  margin-bottom: 20px;
}
.catalog-section-count {
  font-family: var(--ey-font-mono);
  font-size: 14px;
  color: var(--ey-accent);
}
.catalog-articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.catalog-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-md, 4px);
  text-decoration: none;
  transition: all var(--ey-dur-fast) var(--ey-ease-standard);
}
.catalog-item:hover {
  border-color: var(--ey-accent);
  background: var(--ey-surface-2);
}
.catalog-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--ey-font-mono);
  font-size: 11px;
  color: var(--ey-fg-3);
  margin-bottom: 8px;
}
.catalog-item-section {
  color: var(--ey-accent);
  font-weight: 600;
}
.catalog-item-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ey-fg);
  line-height: 1.4;
  margin-bottom: 4px;
}
.catalog-item-desc {
  font-size: 13px;
  color: var(--ey-fg-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
