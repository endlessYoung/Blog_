<template>
  <div id="comments"></div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { theme } = useData()
const route = useRoute()

const loadWalineAssets = () => {
  const cssId = 'waline-css'
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link')
    link.id = cssId
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/@waline/client@v2/dist/waline.css'
    document.head.appendChild(link)
  }

  const scriptId = 'waline-js'
  if (document.getElementById(scriptId)) {
    return Promise.resolve()
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://unpkg.com/@waline/client@v2/dist/waline.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject()
    document.body.appendChild(script)
  })
}

const mount = async () => {
  const container = document.getElementById('comments')
  if (!container) return
  const comment = (theme.value as any).comment
  if (!comment?.serverURL) {
    container.innerHTML = ''
    return
  }
  await loadWalineAssets()
  const waline = (window as any).Waline
  if (!waline?.init) return
  container.innerHTML = ''
  waline.init({
    el: '#comments',
    serverURL: comment.serverURL,
    lang: comment.lang || 'zh-CN',
    dark: 'html.dark',
    reaction: comment.reaction,
    search: comment.search,
    emoji: comment.emoji,
    placeholder: comment.placeholder,
    pageview: true,
    path: route.path
  })
}

onMounted(() => {
  mount()
})
watch(() => route.path, () => mount())
</script>

<style scoped>
#comments {
  margin-top: 24px;
}
</style>
