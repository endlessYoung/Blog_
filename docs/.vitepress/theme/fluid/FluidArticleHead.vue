<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { buildManualCatalog, findManualArticle } from '../reading/catalog'

const { theme, frontmatter } = useData()
const route = useRoute()

const hit = computed(() => {
  if (frontmatter.value.layout === 'home') return null
  return findManualArticle(buildManualCatalog(theme.value.sidebar), route.path)
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <header v-if="hit" class="fl-ahead">
    <span class="fluid-a-num" data-vt>{{ hit.article.num }}</span>
    <p>
      <span>部分 <b>{{ hit.part.id }} {{ hit.part.name }}</b></span>
      <span>章节 <b>{{ hit.chapter.name }} {{ pad(hit.index) }}/{{ pad(hit.total) }}</b></span>
    </p>
  </header>
</template>
