<template>
  <nav class="ey-breadcrumb" aria-label="文章面包屑导航">
    <div class="ey-breadcrumb__item">
      <a href="/">首页</a>
      <span class="ey-breadcrumb__sep" aria-hidden="true">/</span>
    </div>
    <div class="ey-breadcrumb__item" v-if="sectionLabel">
      <a :href="`/catalog/#${sectionLabel}`">{{ sectionLabel }}</a>
      <span class="ey-breadcrumb__sep" aria-hidden="true">/</span>
    </div>
    <div class="ey-breadcrumb__item" v-if="section && section !== sectionLabel">
      <span class="ey-breadcrumb__sec">{{ section }}</span>
      <span class="ey-breadcrumb__sep" aria-hidden="true">/</span>
    </div>
    <div class="ey-breadcrumb__item ey-breadcrumb__current" aria-current="page">
      <span>{{ currentTitle }}</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as articlesData } from '../../data/articles.data'

const { page, frontmatter } = useData()

const currentUrl = computed(() => '/' + page.value.relativePath.replace(/(?:^|\/)index\.md$/, '').replace(/\.md$/, ''))
const matchedArticle = computed(() => articlesData?.articles?.find((a) => a.url === currentUrl.value))

const currentTitle = computed(() => frontmatter.value.title || matchedArticle.value?.title || page.value.title || '当前文章')
const section = computed(() => matchedArticle.value?.section || page.value.relativePath.split('/')[0] || '')
const sectionLabel = computed(() => matchedArticle.value?.sectionLabel || '')
</script>

<style scoped>
.ey-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ey-space-2, 8px);
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 12px);
  color: var(--ey-fg-3);
  margin-bottom: var(--ey-space-4, 16px);
  letter-spacing: var(--ey-tracking-wide);
}

.ey-breadcrumb__item {
  display: inline-flex;
  align-items: center;
  gap: var(--ey-space-2, 8px);
}

.ey-breadcrumb a {
  color: var(--ey-fg-3);
  text-decoration: none;
  transition: color var(--ey-dur-fast);
}

.ey-breadcrumb a:hover {
  color: var(--ey-accent);
}

.ey-breadcrumb__sep {
  color: var(--ey-line-2);
}

.ey-breadcrumb__current {
  color: var(--ey-fg);
  font-weight: 500;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
