<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useData } from 'vitepress'

defineProps<{ endpoint: string }>()

const loaded = ref(false)
const Documate = shallowRef<any>(null)
const { site } = useData()

function assetHref(name: string) {
  const base = site.value.base || '/'
  return `${base}${name}`
}

async function load() {
  if (loaded.value) return
  const mod = await import('@documate/vue')
  Documate.value = mod.default
  loaded.value = true
  // Documate styles are self-hosted to keep the blocking cdnjs
  // github-markdown @import out of the main stylesheet.
  for (const css of ['documate.css', 'github-markdown.css']) {
    const id = `dm-${css}`
    if (document.getElementById(id)) continue
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = assetHref(css)
    document.head.appendChild(link)
  }
}
</script>

<template>
  <div class="documate-lazy" @mouseenter="load" @focusin="load">
    <button
      v-if="!loaded"
      class="documate-lazy-trigger"
      type="button"
      aria-label="AI 搜索"
      title="AI 搜索"
      @click="load"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span class="documate-lazy-text">AI 搜索</span>
    </button>
    <component :is="Documate" v-else :endpoint="endpoint" />
  </div>
</template>

<style scoped>
.documate-lazy {
  display: flex;
  align-items: center;
}

.documate-lazy-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-family: var(--vp-font-family-base);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.documate-lazy-trigger:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

@media (max-width: 767px) {
  .documate-lazy-text {
    display: none;
  }

  .documate-lazy-trigger {
    width: 32px;
    justify-content: center;
    padding: 0;
  }
}
</style>
