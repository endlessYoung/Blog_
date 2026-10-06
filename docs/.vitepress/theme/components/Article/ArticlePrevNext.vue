<template>
  <nav class="ey-prev-next" aria-label="上一篇 / 下一篇导航" v-if="prevArticle || nextArticle">
    <div class="ey-prev-next__col">
      <a
        v-if="prevArticle"
        :href="prevArticle.url"
        class="ey-prev-next__link ey-prev-next__link--prev"
        rel="prev"
      >
        <span class="ey-prev-next__label">← 上一篇</span>
        <span class="ey-prev-next__title">{{ prevArticle.title }}</span>
      </a>
    </div>

    <div class="ey-prev-next__col">
      <a
        v-if="nextArticle"
        :href="nextArticle.url"
        class="ey-prev-next__link ey-prev-next__link--next"
        rel="next"
      >
        <span class="ey-prev-next__label">下一篇 →</span>
        <span class="ey-prev-next__title">{{ nextArticle.title }}</span>
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useData } from 'vitepress'
import { data as articlesData } from '../../data/articles.data'

const { page } = useData()

const currentUrl = computed(() => '/' + page.value.relativePath.replace(/(?:^|\/)index\.md$/, '').replace(/\.md$/, ''))
const matchedArticle = computed(() => articlesData?.articles?.find((a) => a.url === currentUrl.value))

const prevArticle = computed(() => matchedArticle.value?.prevArticle)
const nextArticle = computed(() => matchedArticle.value?.nextArticle)

// 注入 head 标签中的 link[rel="prev"] 与 link[rel="next"] (SEO 规范)
watchEffect(() => {
  if (typeof document === 'undefined') return

  let prevLink = document.querySelector<HTMLLinkElement>('link[rel="prev"]')
  if (prevArticle.value) {
    if (!prevLink) {
      prevLink = document.createElement('link')
      prevLink.rel = 'prev'
      document.head.appendChild(prevLink)
    }
    prevLink.href = prevArticle.value.url
  } else if (prevLink) {
    prevLink.remove()
  }

  let nextLink = document.querySelector<HTMLLinkElement>('link[rel="next"]')
  if (nextArticle.value) {
    if (!nextLink) {
      nextLink = document.createElement('link')
      nextLink.rel = 'next'
      document.head.appendChild(nextLink)
    }
    nextLink.href = nextArticle.value.url
  } else if (nextLink) {
    nextLink.remove()
  }
})
</script>

<style scoped>
.ey-prev-next {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ey-space-5, 24px);
  margin-top: var(--ey-space-9, 64px);
  padding-top: var(--ey-space-6, 32px);
  border-top: var(--ey-border-width, 1px) solid var(--ey-line);
}

@media (max-width: 600px) {
  .ey-prev-next {
    grid-template-columns: 1fr;
  }
}

.ey-prev-next__col {
  display: flex;
}

.ey-prev-next__link {
  display: flex;
  flex-direction: column;
  gap: var(--ey-space-1, 4px);
  padding: var(--ey-space-4, 16px) var(--ey-space-5, 20px);
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-md, 4px);
  text-decoration: none;
  width: 100%;
  transition: border-color var(--ey-dur-fast) var(--ey-ease-standard),
              background var(--ey-dur-fast) var(--ey-ease-standard);
  min-height: 48px;
}

.ey-prev-next__link:hover {
  border-color: var(--ey-accent);
  background: var(--ey-surface-2);
}

.ey-prev-next__link--next {
  text-align: right;
  align-items: flex-end;
}

.ey-prev-next__label {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  letter-spacing: var(--ey-tracking-wider);
  text-transform: uppercase;
  color: var(--ey-fg-3);
}

.ey-prev-next__title {
  font-size: var(--ey-text-base, 15px);
  font-weight: 600;
  color: var(--ey-fg);
  line-height: var(--ey-leading-tight);
}
</style>
