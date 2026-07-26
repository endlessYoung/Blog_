<template>
  <div class="article-metadata">
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
    <span class="meta-item" v-if="showPageViews">
      <span class="icon"><i class="fa-solid fa-eye"></i></span>
      <span class="waline-pageview-count" :data-path="route.path" /> 次浏览
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
</style>
