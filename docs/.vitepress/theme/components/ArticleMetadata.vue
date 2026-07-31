<template>
  <div v-if="!hideMeta" class="article-metadata">
    <span v-if="isWip" class="meta-item wip-badge">
      <span class="icon"><i class="fa-solid fa-hammer"></i></span>
      建设中
    </span>
    <span class="meta-item" v-if="formattedCreated">
      <span class="icon"><i class="fa-solid fa-calendar-plus"></i></span>
      创建于 {{ formattedCreated }}
    </span>
    <span class="meta-item" v-if="formattedUpdated">
      <span class="icon"><i class="fa-solid fa-calendar-check"></i></span>
      更新于 {{ formattedUpdated }}
    </span>
    <span class="meta-item" v-if="readingTime > 0">
      <span class="icon"><i class="fa-solid fa-clock"></i></span>
      {{ readingTime }} 分钟阅读
    </span>
    <span class="meta-item" v-if="wordCount > 0">
      <span class="icon"><i class="fa-solid fa-file-lines"></i></span>
      {{ wordCount }} 字
    </span>
    <span class="meta-item pageview-item" v-if="showPageViews">
      <span class="icon"><i class="fa-solid fa-eye"></i></span>
      <span class="waline-pageview-count" :data-path="route.path"></span>
    </span>
  </div>
</template>

<script setup>
import { useData, useRoute } from 'vitepress'
import { computed, ref, onMounted, watch, nextTick } from 'vue'

const { theme, page } = useData()
const route = useRoute()

const wordCount = ref(0)
const readingTime = ref(0)

const showPageViews = computed(() => {
  return theme.value.comment?.pageview !== false
})

const hideMeta = computed(() => !!page.value.frontmatter?.hideArticleMeta)

const isWip = computed(() => !!page.value.frontmatter?.noindex)

const formattedCreated = computed(() => {
  const created = page.value.frontmatter?.created
  if (!created) return ''
  const d = new Date(created)
  if (isNaN(d.getTime())) return created
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedUpdated = computed(() => {
  if (!page.value.lastUpdated) return ''
  return new Date(page.value.lastUpdated).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const analyzeContent = () => {
  setTimeout(() => {
    const docElement = document.querySelector('.vp-doc')
    if (!docElement) {
      wordCount.value = 0
      readingTime.value = 0
      return
    }

    const text = docElement.innerText || ''
    const latin = (text.match(/[a-zA-Z0-9]+/g) || []).reduce((n, w) => n + w.length, 0)
    const cjk = (text.match(/[一-鿿㐀-䶿豈-﫿]/g) || []).length
    const count = latin + cjk

    wordCount.value = count
    readingTime.value = Math.ceil(count / 400)
  }, 100)
}

onMounted(() => {
  analyzeContent()
})

watch(() => route.path, () => {
  nextTick(() => {
    analyzeContent()
  })
})
</script>

<style>
/* Waline fills this span with the pageview count; append label when non-empty */
.pageview-item .waline-pageview-count:not(:empty)::after {
  content: ' 次浏览';
}
</style>

<style scoped>
.article-metadata {
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  flex-wrap: wrap;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.wip-badge {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #b45309;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.45);
}
html.dark .wip-badge {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.35);
}
</style>
