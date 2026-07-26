<template>
  <div id="comments"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { theme } = useData()
const route = useRoute()

// Waline v3+ returns pageview as `{ time: number }`; v2 wrote the object as "[object Object]".
// See: https://github.com/walinejs/waline/issues/2207
let walineInstance: { destroy?: () => void } | null = null

const loadWalineAssets = () => {
  const cssId = 'waline-css'
  const cssHref = 'https://unpkg.com/@waline/client@v3/dist/waline.css'
  let link = document.getElementById(cssId) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = cssId
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  link.href = cssHref

  const scriptId = 'waline-js'
  const scriptSrc = 'https://unpkg.com/@waline/client@v3/dist/waline.umd.js'
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null
  if (existing) {
    if (existing.src.includes('@waline/client@v3')) {
      return Promise.resolve()
    }
    existing.remove()
    delete (window as any).Waline
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = scriptId
    script.src = scriptSrc
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
    walineInstance?.destroy?.()
    walineInstance = null
    container.innerHTML = ''
    return
  }
  await loadWalineAssets()
  const waline = (window as any).Waline
  if (!waline?.init) return
  walineInstance?.destroy?.()
  walineInstance = null
  container.innerHTML = ''
  walineInstance = waline.init({
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

  // If pageview increment POST fails (e.g. DB schema), Waline leaves the
  // counter empty. Fall back to GET so `.time` still renders as a number.
  void fillPageviewFallback(waline, comment.serverURL, route.path)
}

const fillPageviewFallback = async (
  waline: any,
  serverURL: string,
  path: string
) => {
  await new Promise((r) => setTimeout(r, 800))
  const els = [
    ...document.querySelectorAll<HTMLElement>('.waline-pageview-count')
  ]
  const empty = els.filter((el) => !el.textContent?.trim())
  if (!empty.length || typeof waline.getPageview !== 'function') return
  try {
    const paths = empty.map(
      (el) => el.getAttribute('data-path') || el.dataset.path || path
    )
    const data = await waline.getPageview({ serverURL, paths })
    empty.forEach((el, i) => {
      const time = data?.[i]?.time
      if (typeof time === 'number') el.textContent = String(time)
    })
  } catch {
    // Keep empty rather than showing "[object Object]"
  }
}

onMounted(() => {
  mount()
})
onBeforeUnmount(() => {
  walineInstance?.destroy?.()
  walineInstance = null
})
watch(() => route.path, () => mount())
</script>

<style scoped>
#comments {
  margin-top: 24px;
}
</style>
