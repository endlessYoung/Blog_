<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRouter, withBase } from 'vitepress'
import { buildManualCatalog, findManualArticle, normPath } from '../reading/catalog'
import { type UpdateEntry } from '../reading/corpus'
import { isToday, useRecentWeekUpdates } from '../reading/updates'
import { prefetchPage } from '../reading/prefetch'
import ManualOdo from './ManualOdo.vue'
import { rollOdo } from './motion'

const emit = defineEmits<{ close: [] }>()

const { theme } = useData()
const router = useRouter()

const scope = ref('all')
const onlyNew = ref(false)
const limit = ref(20)
const active = ref(0)
const listKey = ref(0)
const listEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const countEl = ref<HTMLElement | null>(null)

const parts = computed(() => buildManualCatalog(theme.value.sidebar))
const { unreadEntries, readCount, markRead, markAllRead, resetRead } = useRecentWeekUpdates()

interface EnrichedEntry extends UpdateEntry {
  num: string
  trail: string
  categoryKey: string
  categoryLabel: string
  shortDate: string
  bucket: 'today' | 'week'
}

const BUCKET_META: Record<EnrichedEntry['bucket'], { code: string; label: string }> = {
  today: { code: '01', label: '今日更新' },
  week: { code: '02', label: '近 7 天' },
}

const allEntries = computed<EnrichedEntry[]>(() =>
  unreadEntries.value.map((entry) => {
    const hit = findManualArticle(parts.value, entry.page.url)
    const rawCat = entry.page.category || '其他'
    const categoryKey = rawCat.toLowerCase()
    return {
      ...entry,
      num: hit?.article.num || '—',
      trail: hit ? `${hit.part.name} · ${hit.chapter.name}` : rawCat,
      categoryKey,
      categoryLabel: rawCat,
      shortDate: entry.date.slice(5) || entry.date,
      bucket: isToday(entry.date) ? 'today' : 'week',
    }
  }),
)

const categories = computed(() => {
  const counts = new Map<string, { key: string; label: string; count: number }>()
  for (const item of allEntries.value) {
    if (onlyNew.value && item.kind !== 'new') continue
    const prev = counts.get(item.categoryKey)
    if (prev) prev.count += 1
    else counts.set(item.categoryKey, { key: item.categoryKey, label: item.categoryLabel, count: 1 })
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6)
})

const filtered = computed(() =>
  allEntries.value.filter((item) => {
    if (onlyNew.value && item.kind !== 'new') return false
    if (scope.value !== 'all' && item.categoryKey !== scope.value) return false
    return true
  }),
)

const visible = computed(() => filtered.value.slice(0, limit.value))
const remaining = computed(() => Math.max(0, filtered.value.length - visible.value.length))
const totalText = computed(() => String(filtered.value.length).padStart(2, '0'))

const grouped = computed(() => {
  const order: EnrichedEntry['bucket'][] = ['today', 'week']
  const map = new Map<EnrichedEntry['bucket'], { entry: EnrichedEntry; flatIndex: number }[]>()
  visible.value.forEach((entry, idx) => {
    const list = map.get(entry.bucket) || []
    list.push({ entry, flatIndex: idx })
    map.set(entry.bucket, list)
  })
  return order
    .filter((k) => (map.get(k)?.length || 0) > 0)
    .map((k) => ({ key: k, code: BUCKET_META[k].code, label: BUCKET_META[k].label, items: map.get(k)! }))
})

function triggerCountRoll() {
  nextTick(() => {
    if (countEl.value) rollOdo(countEl.value, 40)
  })
}

watch([scope, onlyNew], () => {
  limit.value = 20
  active.value = 0
  listKey.value += 1
  triggerCountRoll()
  if (listEl.value) listEl.value.scrollTop = 0
})

watch(() => filtered.value.length, () => {
  if (active.value >= visible.value.length) {
    active.value = Math.max(0, visible.value.length - 1)
  }
  triggerCountRoll()
})

watch(active, () => {
  nextTick(() => {
    listEl.value?.querySelector<HTMLElement>('.upd-row.on')?.scrollIntoView({ block: 'nearest' })
  })
})

function cycleScope(step: number) {
  const keys = ['all', ...categories.value.map((c) => c.key)]
  if (keys.length <= 1) return
  const at = keys.indexOf(scope.value)
  scope.value = keys[(at + step + keys.length) % keys.length]
}

function openItem(entry: EnrichedEntry, newTab = false) {
  markRead(entry.page.url, entry.date)
  const href = withBase(entry.page.url)
  if (newTab) {
    window.open(href, '_blank')
    return
  }
  emit('close')
  router.go(href)
}

function onRowClick(event: MouseEvent, entry: EnrichedEntry) {
  if (event.button !== 0) return
  event.preventDefault()
  openItem(entry, event.ctrlKey || event.metaKey)
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key === 'Tab' && categories.value.length > 0) {
    event.preventDefault()
    cycleScope(event.shiftKey ? -1 : 1)
    return
  }
  if (!visible.value.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = Math.min(visible.value.length - 1, active.value + 1)
    const item = visible.value[active.value]
    if (item) prefetchPage(withBase(item.page.url))
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = Math.max(0, active.value - 1)
    const item = visible.value[active.value]
    if (item) prefetchPage(withBase(item.page.url))
  } else if (event.key === 'Enter') {
    const target = event.target as HTMLElement | null
    if (target && (target.tagName === 'BUTTON' || target.tagName === 'A')) return
    const item = visible.value[active.value]
    if (item) {
      event.preventDefault()
      openItem(item, event.ctrlKey || event.metaKey)
    }
  }
}

onMounted(() => {
  document.documentElement.classList.add('ey-locked')
  window.addEventListener('keydown', onKey)
  nextTick(() => {
    panelEl.value?.focus()
    if (countEl.value) rollOdo(countEl.value, 160)
  })
})

onUnmounted(() => {
  document.documentElement.classList.remove('ey-locked')
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="ey-upd-backdrop" @click.self="emit('close')">
    <aside
      ref="panelEl"
      class="ey-upd-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="最近一周更新面板"
      tabindex="-1"
    >
      <div class="upd-rule" aria-hidden="true" />

      <header class="upd-head">
        <div class="upd-head-top">
          <div class="upd-eyebrow mono">
            <span class="upd-dot" aria-hidden="true" />
            <span>LOG // LAST 7 DAYS</span>
            <span ref="countEl" class="upd-total"><ManualOdo :value="totalText" /></span>
          </div>
          <div class="upd-head-actions">
            <button
              v-if="allEntries.length > 0"
              type="button"
              class="upd-clear mono"
              title="将近 7 天更新全部标为已读"
              @click="markAllRead()"
            >全部已读</button>
            <button type="button" class="upd-close mono" aria-label="关闭最近更新面板" @click="emit('close')">
              <kbd>ESC</kbd>
            </button>
          </div>
        </div>

        <div class="upd-title-row">
          <div class="upd-title-wrap">
            <h2>近一周更新</h2>
            <span class="upd-sub mono">{{ onlyNew ? 'NEW ONLY' : '7-DAY FEED' }}</span>
          </div>
          <div class="upd-mode" :class="{ 'is-new': onlyNew }" role="group" aria-label="更新类型筛选">
            <span class="upd-mode-thumb" aria-hidden="true" />
            <button
              type="button"
              class="upd-mode-btn mono"
              :aria-pressed="!onlyNew"
              @click="onlyNew = false"
            >全部</button>
            <button
              type="button"
              class="upd-mode-btn mono"
              :aria-pressed="onlyNew"
              @click="onlyNew = true"
            >仅新增</button>
          </div>
        </div>

        <div class="upd-cats" role="tablist" aria-label="按分类筛选">
          <button
            type="button"
            role="tab"
            class="upd-cat"
            :aria-selected="scope === 'all'"
            @click="scope = 'all'"
          >全部</button>
          <button
            v-for="cat in categories"
            :key="cat.key"
            type="button"
            role="tab"
            class="upd-cat"
            :aria-selected="scope === cat.key"
            @click="scope = cat.key"
          >{{ cat.label }}<span class="upd-cat-n mono">{{ cat.count }}</span></button>
        </div>
      </header>

      <div ref="listEl" class="upd-body">
        <div :key="listKey" class="upd-list-stage">
          <template v-if="grouped.length">
            <section v-for="group in grouped" :key="group.key" class="upd-group">
              <div class="upd-group-head mono">
                <span class="upd-group-title">
                  <span class="upd-group-code">§ {{ group.code }}</span>
                  <span>{{ group.label }}</span>
                </span>
                <span class="upd-group-count">{{ String(group.items.length).padStart(2, '0') }}</span>
              </div>
              <ul class="upd-list">
                <li
                  v-for="{ entry, flatIndex } in group.items"
                  :key="entry.page.url"
                  class="upd-item"
                  :style="{ '--i': Math.min(flatIndex, 14) }"
                >
                  <a
                    class="upd-row"
                    :class="{ on: active === flatIndex }"
                    :href="withBase(entry.page.url)"
                    :data-path="normPath(entry.page.url)"
                    data-peek
                    @mouseenter="active = flatIndex; prefetchPage(withBase(entry.page.url))"
                    @click="onRowClick($event, entry)"
                  >
                    <span class="upd-rail-node" aria-hidden="true" />
                    <div class="upd-row-content">
                      <div class="upd-meta mono">
                        <span class="upd-date">{{ entry.shortDate }}</span>
                        <span class="upd-badge" :class="entry.kind">{{ entry.kind === 'new' ? 'NEW' : 'UPD' }}</span>
                        <span class="art-num upd-num" data-vt>{{ entry.num }}</span>
                        <span class="upd-trail">{{ entry.trail }}</span>
                        <span class="upd-arrow" aria-hidden="true">→</span>
                      </div>
                      <div class="art-title upd-title" data-vt>{{ entry.page.title }}</div>
                      <p v-if="entry.page.description" class="upd-desc">{{ entry.page.description }}</p>
                    </div>
                  </a>
                </li>
              </ul>
            </section>
            <button
              v-if="remaining > 0"
              type="button"
              class="upd-more mono"
              @click="limit += 20"
            >
              <span>展开更多</span>
              <span class="upd-more-n">+{{ remaining }}</span>
            </button>
          </template>
          <div v-else class="upd-empty">
            <p class="mono">00 // ALL CAUGHT UP</p>
            <p v-if="readCount > 0">近 7 天内的更新已全部阅读。</p>
            <p v-else>近 7 天内暂无新发布的文章。</p>
            <button
              v-if="readCount > 0"
              type="button"
              class="upd-restore mono"
              @click="resetRead()"
            >恢复 {{ readCount }} 条已读记录</button>
          </div>
        </div>
      </div>

      <footer class="upd-foot mono">
        <div class="upd-foot-links">
          <a :href="withBase('/archives.html')" @click="emit('close')">全部归档</a>
          <span class="upd-sep">/</span>
          <a :href="withBase('/tags/')" @click="emit('close')">标签索引</a>
          <span class="upd-sep">/</span>
          <a :href="withBase('/feed.xml')" target="_blank" rel="noopener noreferrer">RSS</a>
        </div>
        <div class="upd-kbd-hint">
          <span><kbd>↑↓</kbd> 选择</span>
          <span><kbd>TAB</kbd> 分类</span>
          <span><kbd>↵</kbd> 打开</span>
        </div>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
.ey-upd-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  justify-content: flex-end;
  background: color-mix(in srgb, var(--man-bg) 58%, transparent);
  backdrop-filter: blur(8px) saturate(1.1);
}

.ey-upd-drawer {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(496px, 100vw);
  height: 100%;
  background:
    linear-gradient(to right, var(--man-grid) 1px, transparent 1px) 0 0 / 24px 24px,
    var(--man-bg);
  border-left: 1px solid var(--man-line-2);
  color: var(--man-fg);
  outline: none;
  overflow: hidden;
}

.upd-rule {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  transform-origin: left center;
  animation: upd-rule-sweep 420ms var(--man-ease) both;
}

@keyframes upd-rule-sweep {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.upd-head {
  flex: 0 0 auto;
  padding: 20px 24px 0;
  background: color-mix(in srgb, var(--man-bg) 92%, transparent);
  border-bottom: 1px solid var(--man-line);
}

.upd-head-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.upd-head-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.upd-clear {
  padding: 2px 7px;
  border: 1px solid var(--man-line-2);
  background: transparent;
  color: var(--man-fg-3);
  font-size: 10px;
  cursor: pointer;
  transition: border-color var(--man-tick), color var(--man-tick);
}

.upd-clear:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.upd-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--man-fg-3);
}

.upd-dot {
  width: 6px;
  height: 6px;
  background: var(--accent);
}

.upd-total {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border: 1px solid var(--man-line-2);
  color: var(--man-fg);
  font-weight: 600;
}

.upd-close {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.upd-close kbd,
.upd-kbd-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  border: 1px solid var(--man-line-2);
  color: var(--man-fg-3);
  font: 500 10px/1.35 var(--man-mono);
  transition: border-color var(--man-tick), color var(--man-tick);
}

.upd-close:hover kbd {
  border-color: var(--accent);
  color: var(--accent);
}

.upd-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.upd-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.upd-title-row h2 {
  margin: 0;
  font: 700 22px/1.15 var(--man-display);
  letter-spacing: -0.02em;
  color: var(--man-fg);
}

.upd-sub {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--man-fg-3);
}

.upd-mode {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--man-line-2);
  background: color-mix(in srgb, var(--man-fg) 2%, transparent);
}

.upd-mode-thumb {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 50%;
  background: var(--accent);
  transition: transform 240ms var(--man-ease);
  pointer-events: none;
}

.upd-mode.is-new .upd-mode-thumb {
  transform: translateX(100%);
}

.upd-mode-btn {
  position: relative;
  z-index: 1;
  height: 26px;
  padding: 0 11px;
  border: 0;
  background: transparent;
  color: var(--man-fg-2);
  font-size: 11px;
  cursor: pointer;
  transition: color 200ms var(--man-ease);
}

.upd-mode-btn[aria-pressed='true'] {
  color: var(--accent-ink);
  font-weight: 600;
}

.upd-cats {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  overflow-x: auto;
  scrollbar-width: none;
}

.upd-cats::-webkit-scrollbar {
  display: none;
}

.upd-cat {
  position: relative;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 2px 11px;
  border: 0;
  background: transparent;
  color: var(--man-fg-2);
  font: 500 13px/1 var(--man-display);
  cursor: pointer;
  transition: color var(--man-tick);
}

.upd-cat::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 240ms var(--man-ease);
}

.upd-cat:hover,
.upd-cat[aria-selected='true'] {
  color: var(--man-fg);
}

.upd-cat[aria-selected='true'] {
  font-weight: 700;
}

.upd-cat[aria-selected='true']::after {
  transform: scaleX(1);
}

.upd-cat-n {
  font-size: 10px;
  color: var(--man-fg-3);
}

.upd-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0 0 24px;
}

.upd-group + .upd-group {
  margin-top: 4px;
}

.upd-group-head {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 24px;
  background: color-mix(in srgb, var(--man-bg) 94%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--man-line);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--man-fg-3);
}

.upd-group-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.upd-group-code {
  color: var(--accent);
  font-weight: 600;
}

.upd-list {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.upd-list::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 24px;
  width: 1px;
  background: var(--man-line);
  pointer-events: none;
}

.upd-item {
  opacity: 0;
  transform: translateY(10px);
  animation: upd-row-in 360ms var(--man-ease) calc(var(--i, 0) * 28ms) forwards;
}

@keyframes upd-row-in {
  to {
    opacity: 1;
    transform: none;
  }
}

.upd-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 24px 14px 20px;
  border-left: 2px solid transparent;
  border-bottom: 1px solid var(--man-line);
  text-decoration: none;
  color: inherit;
  transition: background 160ms var(--man-ease), border-color 160ms var(--man-ease);
}

.upd-row:hover,
.upd-row.on {
  border-left-color: var(--accent);
  background: color-mix(in srgb, var(--man-fg) 4.5%, transparent);
}

.upd-rail-node {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border: 1px solid var(--man-line-2);
  background: var(--man-bg);
  transition: border-color 180ms var(--man-ease), background 180ms var(--man-ease), transform 180ms var(--man-ease);
}

.upd-row:hover .upd-rail-node,
.upd-row.on .upd-rail-node {
  border-color: var(--accent);
  background: var(--accent);
  transform: scale(1.2);
}

.upd-row-content {
  flex: 1 1 auto;
  min-width: 0;
}

.upd-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--man-fg-3);
}

.upd-date {
  flex: 0 0 auto;
  color: var(--man-fg-2);
}

.upd-badge {
  flex: 0 0 auto;
  padding: 1px 5px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.upd-badge.new {
  background: var(--accent);
  color: var(--accent-ink);
}

.upd-badge.updated {
  border: 1px solid var(--man-line-2);
  color: var(--man-fg-3);
}

.upd-num {
  flex: 0 0 auto;
  color: var(--man-fg-3);
  font-size: 11px;
}

.upd-trail {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upd-arrow {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--man-fg-3);
  opacity: 0.45;
  transform: translateX(0);
  transition: transform 200ms var(--man-ease), color 200ms var(--man-ease), opacity 200ms var(--man-ease);
}

.upd-row:hover .upd-arrow,
.upd-row.on .upd-arrow {
  color: var(--accent);
  opacity: 1;
  transform: translateX(4px);
}

.upd-title {
  font: 600 14.5px/1.44 var(--man-display);
  color: var(--man-fg);
  transition: color 160ms var(--man-ease);
}

.upd-row:hover .upd-title,
.upd-row.on .upd-title {
  color: var(--accent);
}

.upd-desc {
  display: -webkit-box;
  margin: 5px 0 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font: 400 12.5px/1.56 var(--man-display);
  color: var(--man-fg-2);
}

.upd-more {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 48px);
  margin: 16px 24px 0;
  padding: 10px 14px;
  border: 1px solid var(--man-line-2);
  background: transparent;
  color: var(--man-fg-2);
  font-size: 12px;
  cursor: pointer;
  transition: border-color var(--man-tick), color var(--man-tick), background var(--man-tick);
}

.upd-more:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}

.upd-more-n {
  padding: 1px 6px;
  border: 1px solid currentColor;
  font-size: 10px;
}

.upd-empty {
  padding: 56px 24px;
  text-align: center;
  color: var(--man-fg-3);
  font-size: 13px;
}

.upd-empty .mono {
  margin-bottom: 8px;
  letter-spacing: 0.12em;
  font-size: 11px;
}

.upd-restore {
  margin-top: 16px;
  padding: 7px 14px;
  border: 1px solid var(--man-line-2);
  background: transparent;
  color: var(--man-fg-2);
  font-size: 11px;
  cursor: pointer;
  transition: border-color var(--man-tick), color var(--man-tick);
}

.upd-restore:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.upd-foot {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 24px;
  background: color-mix(in srgb, var(--man-bg) 96%, transparent);
  border-top: 1px solid var(--man-line);
  font-size: 11px;
  color: var(--man-fg-3);
}

.upd-foot-links {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.upd-foot-links a {
  color: var(--man-fg-2);
  text-decoration: none;
  transition: color var(--man-tick);
}

.upd-foot-links a:hover {
  color: var(--accent);
}

.upd-sep {
  opacity: 0.4;
}

.upd-kbd-hint {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 10.5px;
}

@media (max-width: 640px) {
  .upd-head {
    padding: 16px 16px 0;
  }
  .upd-group-head {
    padding: 8px 16px;
  }
  .upd-list::before {
    left: 16px;
  }
  .upd-row {
    padding: 12px 16px 12px 12px;
    gap: 12px;
  }
  .upd-more {
    width: calc(100% - 32px);
    margin: 14px 16px 0;
  }
  .upd-foot {
    padding: 12px 16px;
  }
  .upd-kbd-hint {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .upd-rule,
  .upd-item {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .upd-mode-thumb,
  .upd-cat::after,
  .upd-rail-node,
  .upd-arrow {
    transition: none;
  }
}
</style>
