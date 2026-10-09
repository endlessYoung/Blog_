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

