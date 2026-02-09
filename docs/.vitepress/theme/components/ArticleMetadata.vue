<template>
  <div class="article-metadata" v-if="wordCount > 0">
    <span class="meta-item" v-if="formattedDate">
      <span class="icon">📅</span>
      {{ formattedDate }}
    </span>
    <span class="meta-item">
      <span class="icon">⏱️</span>
      {{ readingTime }} 分钟阅读
    </span>
    <span class="meta-item">
      <span class="icon">📝</span>
      {{ wordCount }} 字
    </span>
    <span class="meta-item" v-if="showPageViews">
      <span class="icon">👁️</span>
      <span class="waline-pageview-count" :data-path="route.path" /> 阅读
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

const formattedDate = computed(() => {
  if (!page.value.lastUpdated) return ''
  return new Date(page.value.lastUpdated).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const analyzeContent = () => {
  // Use a timeout to ensure the DOM is fully rendered
  setTimeout(() => {
    const docElement = document.querySelector('.vp-doc')
    if (!docElement) {
      wordCount.value = 0
      readingTime.value = 0
      return
    }

    const content = docElement.innerText || ''
    const words = content.match(/[\w\d\s,.\u00C0-\u024F]+/gi)
    const chinese = content.match(/[\u4E00-\u9FA5]/g) || []
    const count = (words ? words.reduce((acc, word) => acc + word.split(/\s+/).length, 0) : 0) + chinese.length
    
    wordCount.value = count
    readingTime.value = Math.ceil(count / 400) // Assuming 400 words per minute
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
