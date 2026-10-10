<script lang="ts">
import type MiniSearchType from 'minisearch'

interface Doc {
  id: string
  title: string
  titles: string[]
}

const engines = new Map<string, MiniSearchType<Doc>>()
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useData, useRouter, withBase } from 'vitepress'
import { prefetchPage } from '../reading/prefetch'
import type { SearchResult } from 'minisearch'
import localSearchIndex from '@localSearchIndex'
import { buildManualCatalog, findManualArticle, normPath } from '../reading/catalog'
import { pageMeta, recentPages } from '../reading/corpus'

const props = defineProps<{ initial?: string }>()
const emit = defineEmits<{ close: [] }>()

interface Item {
  key: string
  href: string
  page: string
  title: string
  trail: string
  sub: boolean
}

interface Group {
  page: string
  section: string
  num: string
  title: string
  trail: string
  items: Item[]
  heads: string[]
}

const { localeIndex, theme, site } = useData()
const router = useRouter()
const query = ref(props.initial || '')
const scope = ref('all')
const input = ref<HTMLInputElement | null>(null)
const listEl = ref<HTMLElement | null>(null)
const active = ref(0)
const engine = shallowRef<MiniSearchType<Doc> | null>(null)
const loading = ref(true)

const parts = computed(() => buildManualCatalog(theme.value.sidebar))

const sectionNames = computed(() => {
  const names = new Map<string, string>()
  const walk = (items: { text?: string; link?: string; items?: unknown[] }[] = []) => {
    for (const item of items) {
      const root = normPath(item.link || '').split('/').filter(Boolean)[0]
      if (root && item.text && !names.has(root)) names.set(root, item.text)
      if (item.items) walk(item.items as typeof items)
    }
  }
  walk(theme.value.nav || [])
  return names
})

function stripBase(id: string) {
  const base = site.value.base || '/'
  const path = id.startsWith('/') ? id : `/${id}`
  return base !== '/' && path.startsWith(base) ? `/${path.slice(base.length)}` : path
}

function pagePath(id: string) {
  return normPath(stripBase(id).split('#')[0])
}

function sectionOf(page: string) {
  return page.split('/').filter(Boolean)[0] || ''
}

function sectionLabel(section: string) {
  return sectionNames.value.get(section) || decodeURIComponent(section)
}

function describe(page: string, fallback: string) {
  const hit = findManualArticle(parts.value, page)
  return {
    num: hit?.article.num || '',
    title: hit?.article.title || fallback,
    trail: hit ? `${hit.part.name} · ${hit.chapter.name}` : sectionLabel(sectionOf(page)),
  }
}

const hits = computed(() => {
  const text = query.value.trim()
  if (!text || !engine.value) return []
  return engine.value.search(text) as (SearchResult & Doc)[]
})

const terms = computed(() => {
  const text = query.value.trim()
  return [...new Set([...text.split(/\s+/), ...hits.value.flatMap((hit) => hit.terms)])].filter(Boolean)
})

const allGroups = computed<Group[]>(() => {
  const text = query.value.trim()
  if (!text) {
    return recentPages(8).map((meta) => {
      const page = normPath(meta.url)
      const info = describe(page, meta.title)
      return {
        page,
        section: sectionOf(page),
        ...info,
        heads: [],
        items: [{ key: page, href: page, page, title: info.title, trail: info.trail, sub: false }],
      }
    })
  }
  const groups = new Map<string, Group>()
  for (const hit of hits.value) {
    const page = pagePath(hit.id)
    if (page.startsWith('/tags')) continue
    let group = groups.get(page)
    if (!group) {
      if (groups.size >= 24) continue
      const info = describe(page, hit.titles?.[0] || hit.title)
      group = { page, section: sectionOf(page), ...info, heads: [], items: [] }
      group.items.push({ key: page, href: page, page, title: info.title, trail: info.trail, sub: false })
      groups.set(page, group)
    }
    const anchored = hit.id.includes('#')
    const head = [...(hit.titles || []).slice(1), hit.title].filter(Boolean).join(' / ')
    if (anchored && head && group.items.length < 4 && hit.title !== group.title) {
      group.items.push({ key: hit.id, href: stripBase(hit.id), page, title: hit.title, trail: head, sub: true })
      group.heads.push(hit.title)
    }
  }
  const needle = text.toLowerCase()
  return [...groups.values()]
    .map((group, order) => {
      const title = group.title.toLowerCase()
      const rank = title === needle ? 3 : title.startsWith(needle) ? 2 : title.includes(needle) ? 1 : 0
      return { group, order, rank }
    })
    .sort((a, b) => b.rank - a.rank || a.order - b.order)
    .map((entry) => entry.group)
})

const scopes = computed(() => {
  const counts = new Map<string, number>()
  for (const group of allGroups.value) counts.set(group.section, (counts.get(group.section) || 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, label: sectionLabel(key), count }))
})

const groups = computed(() =>
  scope.value === 'all' ? allGroups.value : allGroups.value.filter((group) => group.section === scope.value),
)

const flat = computed(() => groups.value.flatMap((group) => group.items))
const current = computed(() => flat.value[active.value] || null)
const currentGroup = computed(() => groups.value.find((group) => group.page === current.value?.page) || null)
const currentMeta = computed(() => (current.value ? pageMeta(current.value.page) : undefined))

watch(query, () => {
  active.value = 0
  scope.value = 'all'
})
watch(scope, () => { active.value = 0 })
watch(active, () => {
  nextTick(() => listEl.value?.querySelector('.on')?.scrollIntoView({ block: 'nearest' }))
})
watch(current, (item) => {
  if (!item) return
  prefetchPage(withBase(item.href.startsWith('/') ? item.href : `/${item.href}`))
})

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)
}

function mark(text: string) {
  const safe = escapeHtml(text)
  const words = terms.value
    .filter((word) => word.length > 0)
    .map((word) => escapeHtml(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
  if (!query.value.trim() || !words.length) return safe
  return safe.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>')
}

function indexOf(item: Item) {
  return flat.value.indexOf(item)
}

function cycleScope(step: number) {
  const keys = ['all', ...scopes.value.map((entry) => entry.key)]
  const at = keys.indexOf(scope.value)
  scope.value = keys[(at + step + keys.length) % keys.length]
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = Math.min(flat.value.length - 1, active.value + 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = Math.max(0, active.value - 1)
  } else if (event.key === 'Tab' && scopes.value.length > 1) {
    event.preventDefault()
    cycleScope(event.shiftKey ? -1 : 1)
  } else if (event.key === 'Enter' && current.value) {
    event.preventDefault()
    open(current.value, event.ctrlKey || event.metaKey)
  }
}

function open(item: Item, newTab = false) {
  const href = item.href.startsWith('/') ? item.href : `/${item.href}`
  if (newTab) {
    window.open(withBase(href), '_blank')
    return
  }
  emit('close')
  router.go(withBase(href))
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  await nextTick()
  input.value?.focus()
  if (props.initial) input.value?.select()
  const key = localeIndex.value
  const cached = engines.get(key)
  if (cached) {
    engine.value = cached
  } else {
    const loader = localSearchIndex[key]
    if (loader) {
      const [{ default: MiniSearch }, mod] = await Promise.all([
        import('minisearch'),
        loader(),
      ])
      const built = MiniSearch.loadJSON<Doc>(mod.default, {
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles'],
        searchOptions: {
          fuzzy: 0.2,
          prefix: true,
          boost: { title: 4, text: 2, titles: 1 },
        },
      })
      engines.set(key, built)
      engine.value = built
    }
  }
  loading.value = false
})

onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="ey-palette">
    <div class="ey-palette-backdrop" @click="emit('close')" />
    <div class="ey-palette-panel" role="dialog" aria-modal="true" aria-label="搜索">
      <div class="ey-palette-input">
        <span class="ey-palette-prompt">/</span>
        <input
          ref="input"
          v-model="query"
          type="text"
          placeholder="搜索标题、章节或正文"
          autocomplete="off"
          spellcheck="false"
          aria-label="搜索"
        />
        <button v-if="query" type="button" class="ey-palette-clear" @click="query = ''; input?.focus()">清空</button>
        <kbd>ESC</kbd>
      </div>

      <div v-if="query.trim() && scopes.length > 1" class="ey-palette-scopes">
        <button type="button" :class="{ on: scope === 'all' }" @click="scope = 'all'">
          全部<span>{{ allGroups.length }}</span>
        </button>
        <button
          v-for="entry in scopes"
          :key="entry.key"
          type="button"
          :class="{ on: scope === entry.key }"
          @click="scope = entry.key"
        >{{ entry.label }}<span>{{ entry.count }}</span></button>
      </div>

      <div class="ey-palette-body">
        <div ref="listEl" class="ey-palette-list">
          <div class="ey-palette-label">
            <span>{{ query.trim() ? '结果' : '最近更新' }}</span>
            <span>{{ groups.length }} 篇</span>
          </div>
          <p v-if="loading && query.trim()" class="ey-empty">正在读取索引…</p>
          <p v-else-if="query.trim() && !groups.length" class="ey-empty">没有匹配“{{ query.trim() }}”的文章，换个关键词试试。</p>
          <section v-for="group in groups" :key="group.page" class="ey-palette-group">
            <button
              v-for="item in group.items"
              :key="item.key"
              type="button"
              class="ey-palette-row"
              :class="{ on: indexOf(item) === active, sub: item.sub }"
              @mouseenter="active = indexOf(item)"
              @click="open(item, $event.ctrlKey || $event.metaKey)"
            >
              <template v-if="!item.sub">
                <span class="ey-palette-num">{{ group.num || '—' }}</span>
                <span class="ey-palette-main">
                  <strong v-html="mark(item.title)" />
                  <small>{{ item.trail }}</small>
                </span>
                <span class="ey-palette-sec">{{ sectionLabel(group.section) }}</span>
              </template>
              <template v-else>
                <span class="ey-palette-num">§</span>
                <span class="ey-palette-main"><span v-html="mark(item.trail)" /></span>
                <span class="ey-palette-sec">↵</span>
              </template>
            </button>
          </section>
        </div>

        <aside class="ey-palette-preview">
          <template v-if="current && currentGroup">
            <div class="ey-palette-label"><span>预览</span><span>{{ sectionLabel(currentGroup.section) }}</span></div>
            <div class="ey-pv-num">{{ currentGroup.num || '—' }}</div>
            <h3 v-html="mark(currentGroup.title)" />
            <p class="ey-pv-trail">{{ currentGroup.trail }}</p>
            <div v-if="current.sub" class="ey-pv-target">
              <span>跳转到</span>
              <b v-html="mark(current.trail)" />
            </div>
            <ul v-else-if="currentGroup.heads.length" class="ey-pv-heads">
              <li v-for="head in currentGroup.heads" :key="head">§ <span v-html="mark(head)" /></li>
            </ul>
            <dl class="ey-pv-meta">
              <template v-if="currentMeta?.updated">
                <dt>更新</dt><dd>{{ currentMeta.updated.slice(0, 10) }}</dd>
              </template>
              <template v-if="currentMeta?.tags?.length">
                <dt>标签</dt><dd>{{ currentMeta.tags.slice(0, 5).join(' · ') }}</dd>
              </template>
            </dl>
          </template>
          <template v-else>
            <div class="ey-palette-label"><span>快捷键</span><span>KEYS</span></div>
            <dl class="ey-pv-keys">
              <dt><kbd>/</kbd></dt><dd>随时打开搜索</dd>
              <dt><kbd>↑</kbd><kbd>↓</kbd></dt><dd>选择结果</dd>
              <dt><kbd>TAB</kbd></dt><dd>切换栏目</dd>
              <dt><kbd>ENTER</kbd></dt><dd>打开，按住 Ctrl 在新标签打开</dd>
              <dt><kbd>ESC</kbd></dt><dd>关闭</dd>
            </dl>
          </template>
        </aside>
      </div>

      <div class="ey-palette-foot">
        <span><kbd>↑↓</kbd> 选择</span>
        <span><kbd>TAB</kbd> 栏目</span>
        <span><kbd>ENTER</kbd> 打开</span>
        <span class="ey-palette-status">{{ loading ? '索引加载中' : `${engine?.documentCount ?? 0} 条索引` }}</span>
      </div>
    </div>
  </div>
</template>
