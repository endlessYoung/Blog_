<template>
  <section v-if="recent.length" class="home-tx" aria-label="最新文章">
    <div class="home-tx__inner">
      <div class="home-tx__head">
        <div class="home-tx__head-row">
          <span class="home-tx__label">最新文章</span>
          <span class="home-tx__meta">{{ recent.length }}</span>
        </div>
        <div class="home-tx__rule" aria-hidden="true" />
      </div>
      <ul class="home-tx__list">
        <li v-for="(item, index) in recent" :key="item.href" class="home-tx__item">
          <a class="home-tx__link" :href="item.href" :title="item.title">
            <span class="home-tx__idx">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="home-tx__section">{{ item.section }}</span>
            <span class="home-tx__title">{{ item.title }}</span>
            <span class="home-tx__stamp">{{ item.stamp }}</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'

type TxItem = {
  title: string
  section: string
  href: string
  stamp: string
  ts: number
}

const rawDocs = import.meta.glob(
  [
    '/Android/**/*.md',
    '/Ai/**/*.md',
    '/Agent/**/*.md',
    '/Java/**/*.md',
    '/Kotlin/**/*.md',
    '/Python/**/*.md',
    '/JS/**/*.md',
    '/C/**/*.md',
    '/C++/**/*.md',
    '/Flutter/**/*.md',
    '/SQL/**/*.md',
    '/Linux/**/*.md',
    '/Common/**/*.md',
    '/数据结构和算法/**/*.md',
  ],
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
) as Record<string, string>

const SKIP_FILES = new Set(['index.md', 'readme.md', 'getting-started.md'])

function sectionOf(path: string): string {
  const cleaned = path.replace(/\\/g, '/').split('/').filter((p) => p && p !== '.' && p !== '..')
  if (cleaned.length >= 2) return cleaned[0].toUpperCase()
  return 'DOCS'
}

function titleFrom(raw: string, fileName: string): string {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (fm) {
    const t = fm[1].match(/^\s*title:\s*["']?(.+?)["']?\s*$/m)
    if (t?.[1]) return t[1].trim()
  }
  const h1 = raw.match(/^#\s+(.+)$/m)
  if (h1?.[1]) return h1[1].replace(/[#*`]/g, '').trim()
  return decodeURIComponent(fileName.replace(/\.md$/i, ''))
}

function dateFrom(raw: string): { ts: number; stamp: string } {
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!fm) return { ts: 0, stamp: '----' }
  const block = fm[1]
  const pick =
    block.match(/^\s*updated:\s*["']?(.+?)["']?\s*$/m)?.[1] ||
    block.match(/^\s*date:\s*["']?(.+?)["']?\s*$/m)?.[1] ||
    block.match(/^\s*created:\s*["']?(.+?)["']?\s*$/m)?.[1]
  if (!pick) return { ts: 0, stamp: '----' }
  const d = new Date(pick.trim())
  if (Number.isNaN(d.getTime())) return { ts: 0, stamp: pick.trim().slice(0, 10) }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return { ts: d.getTime(), stamp: `${y}-${m}-${day}` }
}

function hrefFrom(path: string): string {
  let cleaned = path.replace(/\\/g, '/')
  if (cleaned.startsWith('/')) cleaned = cleaned.slice(1)
  cleaned = cleaned.replace(/\.md$/i, '')
  if (cleaned.endsWith('/index')) cleaned = cleaned.slice(0, -'/index'.length)
  const url = `/${cleaned}`.replace(/\/+/g, '/') || '/'
  return withBase(url)
}

function buildRecent(limit = 3): TxItem[] {
  const list: TxItem[] = []
  for (const [path, raw] of Object.entries(rawDocs)) {
    const norm = path.replace(/\\/g, '/')
    if (norm.includes('/.vitepress/') || norm.includes('.vitepress/')) continue
    const file = norm.split('/').pop() || ''
    if (SKIP_FILES.has(file.toLowerCase())) continue
    if (/(^|\/)index\.md$/i.test(norm) && !norm.includes('/')) continue
    const title = titleFrom(String(raw ?? ''), file)
    if (!title || title.length < 2) continue
    const { ts, stamp } = dateFrom(String(raw ?? ''))
    list.push({
      title: title.length > 64 ? `${title.slice(0, 62)}…` : title,
      section: sectionOf(norm),
      href: hrefFrom(norm),
      stamp,
      ts,
    })
  }
  return list.sort((a, b) => b.ts - a.ts || a.title.localeCompare(b.title, 'zh')).slice(0, limit)
}

const recent = buildRecent(3)
</script>

<style scoped>
/* 独立玻璃面板：对齐专栏卡气质 */
.home-tx {
  position: relative;
  z-index: 1;
  width: 100%;
  margin: 18px auto 8px;
  padding: 0 24px;
  box-sizing: border-box;
}

.home-tx__inner {
  position: relative;
  max-width: 1152px;
  margin: 0 auto;
  padding: 22px 24px 18px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 16px;
  background: rgba(16, 20, 30, 0.6);
  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.home-tx__head {
  margin-bottom: 14px;
}

.home-tx__head-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.home-tx__label {
  margin: 0;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: clamp(1.22rem, 2.2vw, 1.45rem);
  font-weight: 650;
  letter-spacing: 0.04em;
  color: #f8fafc;
  -webkit-text-fill-color: #f8fafc;
}

.home-tx__meta {
  margin-left: auto;
  font-family: var(--tech-font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: #64748b;
}

.home-tx__rule {
  width: 48px;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.55), rgba(34, 211, 238, 0.35), transparent);
}

.home-tx__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.home-tx__link {
  display: grid;
  grid-template-columns: 1.8em 5.2em minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 10px;
  padding: 8px 4px;
  border-radius: 0;
  border: none;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: color 0.25s ease;
}

.home-tx__link:focus-visible {
  outline: 2px solid rgba(34, 211, 238, 0.55);
  outline-offset: 2px;
  border-radius: 6px;
}

.home-tx__idx,
.home-tx__section,
.home-tx__stamp {
  font-family: var(--tech-font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
}

.home-tx__idx {
  color: #22d3ee;
  font-weight: 700;
  opacity: 0.9;
  text-align: right;
}

.home-tx__section {
  color: #94a3b8;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.home-tx__title {
  min-width: 0;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.55;
  color: #a3a8b5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background-image: linear-gradient(#22d3ee, #22d3ee);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition:
    color 0.25s ease,
    background-size 0.35s ease;
}

.home-tx__stamp {
  color: #64748b;
  white-space: nowrap;
}

.home-tx__link:hover .home-tx__title {
  color: #22d3ee;
  background-size: 100% 2px;
}

/* 去掉全局 a::after 下划线，只留标题底线 */
.home-tx__link::after {
  content: none !important;
  display: none !important;
  width: 0 !important;
}

@media (max-width: 960px) {
  .home-tx {
    margin-top: 14px;
  }

  .home-tx__inner {
    padding: 18px 16px 14px;
  }
}

@media (max-width: 639px) {
  .home-tx__link {
    grid-template-columns: 1.8em minmax(0, 1fr) auto;
    grid-template-areas:
      'idx section stamp'
      'idx title title';
    row-gap: 4px;
    padding: 10px 4px;
  }

  .home-tx__idx {
    grid-area: idx;
    align-self: start;
    padding-top: 2px;
  }

  .home-tx__section {
    grid-area: section;
  }

  .home-tx__title {
    grid-area: title;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 0.95rem;
  }

  .home-tx__stamp {
    grid-area: stamp;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-tx__title {
    transition: none;
  }
}
</style>

<style>
html.dark .home-tx__label,
.dark .home-tx__label {
  color: #f8fafc !important;
  -webkit-text-fill-color: #f8fafc !important;
}

html:not(.dark) .home-tx__inner {
  border-color: rgba(8, 145, 178, 0.13);
  background: rgba(255, 255, 255, 0.4);
  box-shadow:
    0 14px 36px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

html:not(.dark) .home-tx__label {
  color: #0f172a !important;
  -webkit-text-fill-color: currentColor !important;
}

html:not(.dark) .home-tx__meta {
  color: #64748b;
}

html:not(.dark) .home-tx__rule {
  background: linear-gradient(90deg, rgba(8, 145, 178, 0.5), rgba(8, 145, 178, 0.3), transparent);
}

html:not(.dark) .home-tx__idx {
  color: #0e7490;
}

html:not(.dark) .home-tx__section {
  color: #475569;
}

html:not(.dark) .home-tx__title {
  color: #475569;
  background-image: linear-gradient(#0e7490, #0e7490);
}

html:not(.dark) .home-tx__stamp {
  color: #64748b;
}

html:not(.dark) .home-tx__link:hover .home-tx__title {
  color: #0e7490;
}

html:not(.dark) .home-tx__link:focus-visible {
  outline-color: rgba(8, 145, 178, 0.7);
}

@media (min-width: 640px) {
  .home-tx {
    padding-left: 48px;
    padding-right: 48px;
  }
}

@media (min-width: 960px) {
  .home-tx {
    padding-left: 64px;
    padding-right: 64px;
  }
}
</style>
