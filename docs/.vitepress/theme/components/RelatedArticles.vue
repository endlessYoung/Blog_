<template>
  <nav v-if="items.length" class="related-articles" aria-label="相关阅读">
    <h2 class="related-articles__title">相关阅读</h2>
    <ul class="related-articles__list">
      <li v-for="item in items" :key="item.link" class="related-articles__item">
        <a class="related-articles__link" :href="withBase(item.link)">
          <span class="related-articles__text">{{ item.title }}</span>
          <span v-if="item.meta" class="related-articles__meta">{{ item.meta }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

interface RelatedEntry {
  title: string
  link: string
  meta: string
}

const { theme, page } = useData()

const items = computed<RelatedEntry[]>(() => {
  const relPath = page.value.relativePath || ''
  const related = (theme.value as any).related
  if (!related || !Array.isArray(related[relPath])) return []
  return related[relPath] as RelatedEntry[]
})
</script>

<style scoped>
.related-articles {
  margin-top: 32px;
}
.related-articles__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.related-articles__title::before {
  content: '';
  flex-shrink: 0;
  width: 4px;
  height: 14px;
  border-radius: 2px;
  background: var(--vp-c-brand-1);
}
.related-articles__list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.related-articles__item {
  margin: 0;
}
.related-articles__link {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color 0.25s, background-color 0.25s;
}
.related-articles__link:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.related-articles__text {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}
.related-articles__meta {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--vp-c-text-3);
}
</style>
