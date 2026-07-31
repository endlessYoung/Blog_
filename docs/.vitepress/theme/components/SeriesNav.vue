<template>
  <nav v-if="series" class="series-nav" aria-label="系列导航">
    <div class="series-nav__head">
      <span class="series-nav__badge">系列</span>
      <span class="series-nav__name">{{ series.title }}</span>
    </div>
    <div class="series-nav__body">
      <a
        v-if="series.prev"
        class="series-nav__item series-nav__item--prev"
        :href="withBase(series.prev.link)"
      >
        <span class="series-nav__dir">← 上一篇</span>
        <span class="series-nav__text">{{ series.prev.text }}</span>
      </a>
      <span v-else class="series-nav__item series-nav__item--edge">已是系列第一篇</span>

      <a
        v-if="series.next"
        class="series-nav__item series-nav__item--next"
        :href="withBase(series.next.link)"
      >
        <span class="series-nav__dir">下一篇 →</span>
        <span class="series-nav__text">{{ series.next.text }}</span>
      </a>
      <span v-else class="series-nav__item series-nav__item--edge">已是系列最后一篇</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

interface SeriesItem {
  text: string
  link: string
}

interface SidebarItem {
  text?: string
  link?: string
  items?: SidebarItem[]
}

const { theme, page } = useData()

/** 收集分组下所有带链接的文章条目（支持嵌套分组） */
function collectLinks(items: SidebarItem[] | undefined): SeriesItem[] {
  const result: SeriesItem[] = []
  if (!items) return result
  for (const item of items) {
    if (item.link && item.text) {
      result.push({ text: item.text, link: item.link })
    }
    if (item.items && item.items.length > 0) {
      result.push(...collectLinks(item.items))
    }
  }
  return result
}

function normalize(link: string): string {
  return link.replace(/^\/+|\/+$/g, '').toLowerCase()
}

const series = computed<{ title: string; prev: SeriesItem | null; next: SeriesItem | null } | null>(() => {
  const sidebar = theme.value.sidebar
  const current = normalize((page.value.relativePath || '').replace(/\.md$/, ''))
  if (!sidebar || !current) return null

  let groups: SidebarItem[] = []
  if (Array.isArray(sidebar)) {
    groups = sidebar
  } else {
    const key = Object.keys(sidebar).find((prefix) => {
      const base = normalize(prefix)
      return base.length > 0 && (current === base || current.startsWith(base + '/'))
    })
    groups = key ? sidebar[key] : []
  }

  for (const group of groups) {
    const items = collectLinks(group.items)
    const index = items.findIndex((item) => normalize(item.link) === current)
    if (index === -1) continue
    return {
      title: group.text || '系列文章',
      prev: index > 0 ? items[index - 1] : null,
      next: index < items.length - 1 ? items[index + 1] : null,
    }
  }
  return null
})
</script>

<style scoped>
.series-nav {
  margin-top: 32px;
  padding: 20px 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  transition: border-color 0.25s;
}
.series-nav:hover {
  border-color: var(--vp-c-brand-1);
}
.series-nav__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.series-nav__badge {
  flex-shrink: 0;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 20px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 999px;
}
.series-nav__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.series-nav__body {
  display: grid;
  gap: 10px;
}
.series-nav__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  text-decoration: none;
  transition: border-color 0.25s, background-color 0.25s;
}
a.series-nav__item:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.series-nav__dir {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.series-nav__text {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}
.series-nav__item--edge {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}
</style>
