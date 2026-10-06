<template>
  <section class="ey-related" aria-labelledby="related-heading" v-if="relatedList.length > 0">
    <div class="ey-related__header">
      <span class="ey-related__tag">RECOMMENDED // 关联探索</span>
      <h3 id="related-heading" class="ey-related__title">相关技术主题</h3>
    </div>

    <div class="ey-related__grid">
      <a
        v-for="item in relatedList"
        :key="item.url"
        :href="item.url"
        class="ey-related-card"
      >
        <span class="ey-related-card__section">{{ item.sectionLabel }}</span>
        <span class="ey-related-card__title">{{ item.title }}</span>
        <span class="ey-related-card__arrow" aria-hidden="true">→</span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { data as articlesData } from '../../data/articles.data'

const { page } = useData()

const currentUrl = computed(() => '/' + page.value.relativePath.replace(/(?:^|\/)index\.md$/, '').replace(/\.md$/, ''))

const relatedList = computed(() => {
  const all = articlesData?.articles || []
  const current = all.find((a) => a.url === currentUrl.value)
  if (!current) return []

  // 优先匹配相同标签，其次同 section，排除自身
  return all
    .filter((a) => a.url !== current.url && a.section === current.section)
    .slice(0, 3)
})
</script>

<style scoped>
.ey-related {
  margin-top: var(--ey-space-8, 48px);
  padding-top: var(--ey-space-6, 32px);
  border-top: var(--ey-border-width, 1px) solid var(--ey-line);
}

.ey-related__header {
  margin-bottom: var(--ey-space-4, 16px);
}

.ey-related__tag {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 11px);
  letter-spacing: var(--ey-tracking-wider);
  color: var(--ey-fg-3);
  display: block;
  margin-bottom: var(--ey-space-1, 4px);
}

.ey-related__title {
  font-family: var(--ey-font-display);
  font-size: var(--ey-text-lg, 18px);
  font-weight: 700;
  color: var(--ey-fg);
  margin: 0;
}

.ey-related__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--ey-space-3, 12px);
}

.ey-related-card {
  display: flex;
  flex-direction: column;
  gap: var(--ey-space-1, 4px);
  padding: var(--ey-space-3, 12px) var(--ey-space-4, 16px);
  background: var(--ey-surface);
  border: var(--ey-border-width, 1px) solid var(--ey-line);
  border-radius: var(--ey-radius-md, 4px);
  text-decoration: none;
  transition: border-color var(--ey-dur-fast) var(--ey-ease-standard),
              transform var(--ey-dur-fast) var(--ey-ease-standard);
  position: relative;
}

.ey-related-card:hover {
  border-color: var(--ey-accent);
  transform: translateY(-2px);
}

.ey-related-card__section {
  font-family: var(--ey-font-mono);
  font-size: var(--ey-text-xs, 10px);
  color: var(--ey-accent);
  text-transform: uppercase;
}

.ey-related-card__title {
  font-size: var(--ey-text-sm, 14px);
  font-weight: 600;
  color: var(--ey-fg);
  line-height: var(--ey-leading-tight);
}

.ey-related-card__arrow {
  position: absolute;
  right: var(--ey-space-3, 12px);
  bottom: var(--ey-space-2, 8px);
  font-size: 14px;
  color: var(--ey-fg-3);
  transition: transform var(--ey-dur-fast);
}

.ey-related-card:hover .ey-related-card__arrow {
  transform: translateX(3px);
  color: var(--ey-accent);
}
</style>
