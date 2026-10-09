<template>
  <nav v-if="series" class="series-nav" aria-label="系列导航">
    <div class="series-nav__head">
      <span class="series-nav__badge">系列</span>
      <span class="series-nav__name">{{ series.title }}</span>
      <span v-if="series.total > 1" class="series-nav__progress">第 {{ series.index + 1 }}/{{ series.total }} 篇</span>
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

const series = computed<{ title: string; prev: SeriesItem | null; next: SeriesItem | null; index: number; total: number } | null>(() => {
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
      index,
      total: items.length,
    }
  }
  return null
})
</script>

