<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'

const SCHEME_SHEEN = 'hero-copy-sheen'
const SCHEME_TIER = 'hero-copy-tier'
const SCHEMES = [SCHEME_SHEEN, SCHEME_TIER] as const

const { frontmatter } = useData()

function applyScheme(scheme: (typeof SCHEMES)[number]) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.classList.remove(...SCHEMES)
  root.classList.add(scheme)

  document.querySelectorAll<HTMLElement>('.home-landing, .VPContent.is-home').forEach((el) => {
    el.classList.remove(...SCHEMES)
    el.classList.add(scheme)
  })
}

onMounted(() => {
  if (frontmatter.value.layout !== 'home') return
  applyScheme(SCHEME_SHEEN)
})

onUnmounted(() => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.remove(...SCHEMES)
  document.querySelectorAll<HTMLElement>('.home-landing, .VPContent.is-home').forEach((el) => {
    el.classList.remove(...SCHEMES)
  })
})
</script>

<template>
  <!-- 默认注入 sheen；隐藏切换 UI，避免干扰全息终端美学 -->
  <div v-if="false" class="hero-copy-switch" aria-hidden="true" />
</template>
