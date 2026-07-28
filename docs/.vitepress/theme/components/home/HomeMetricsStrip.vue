<template>
  <section v-if="recent.length" class="home-tx" aria-label="最近传输">
    <div class="home-tx__head">
      <span class="home-tx__dot" aria-hidden="true" />
      <span class="home-tx__tag">RECENT TX</span>
      <span class="home-tx__meta">最近传输 · {{ recent.length }}</span>
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

/** 与 HomeHeroOrb 相同：扫主要栏目 md */
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
  if (cleaned.length >= 2) return cleaned[0]
  return 'Docs'
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
      title: title.length > 48 ? `${title.slice(0, 46)}…` : title,
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
/* Hero 卡内底部次级区：贴底填空，不抢 slogan / CTA */
.home-tx {
  position: relative;
  z-index: 1;
  width: 100%;
  margin-top: auto;
  padding-top: 12px;
  padding-bottom: 2px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.home-tx__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-family: var(--tech-font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(161, 161, 170, 0.9);
}

.home-tx__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(34, 211, 238, 0.75);
  box-shadow: 0 0 6px rgba(34, 211, 238, 0.25);
  animation: homeTxPulse 3.6s ease-in-out infinite;
}

.home-tx__tag {
  color: rgba(34, 211, 238, 0.85);
  font-weight: 600;
}

.home-tx__meta {
  margin-left: auto;
  letter-spacing: 0.04em;
  text-transform: none;
  color: rgba(113, 113, 122, 0.95);
}

.home-tx__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.home-tx__link {
  display: grid;
  grid-template-columns: 1.6em 4.8em minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.18s ease;
}

.home-tx__link:hover {
  background: rgba(34, 211, 238, 0.06);
}

.home-tx__link:hover .home-tx__title {
  color: rgba(103, 232, 249, 0.95);
}

.home-tx__idx,
.home-tx__section,
.home-tx__stamp {
  font-family: var(--tech-font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 10.5px;
  letter-spacing: 0.04em;
}

.home-tx__idx {
  color: rgba(34, 211, 238, 0.65);
  font-variant-numeric: tabular-nums;
}

.home-tx__section {
  color: rgba(161, 161, 170, 0.92);
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-tx__title {
  min-width: 0;
  font-family: var(--tech-font-ui, ui-sans-serif, system-ui, sans-serif);
  font-size: 12.5px;
  font-weight: 550;
  line-height: 1.35;
  color: #e4e4e7;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.18s ease;
}

.home-tx__stamp {
  color: rgba(113, 113, 122, 0.95);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@keyframes homeTxPulse {
  0%,
  100% {
    opacity: 0.45;
    box-shadow: 0 0 4px rgba(34, 211, 238, 0.15);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(34, 211, 238, 0.35);
  }
}

@media (max-width: 639px) {
  .home-tx__link {
    grid-template-columns: 1.6em minmax(0, 1fr) auto;
    grid-template-areas:
      'idx section stamp'
      'idx title title';
    row-gap: 2px;
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
  }

  .home-tx__stamp {
    grid-area: stamp;
  }
}

:global(html:not(.dark)) .home-tx {
  border-top-color: rgba(8, 145, 178, 0.14);
}

:global(html:not(.dark)) .home-tx__head {
  color: #64748b;
}

:global(html:not(.dark)) .home-tx__tag {
  color: #0891b2;
}

:global(html:not(.dark)) .home-tx__meta {
  color: #94a3b8;
}

:global(html:not(.dark)) .home-tx__dot {
  background: rgba(8, 145, 178, 0.7);
  box-shadow: 0 0 5px rgba(8, 145, 178, 0.2);
}

:global(html:not(.dark)) .home-tx__idx {
  color: #0891b2;
}

:global(html:not(.dark)) .home-tx__section {
  color: #64748b;
}

:global(html:not(.dark)) .home-tx__title {
  color: #0f172a;
}

:global(html:not(.dark)) .home-tx__stamp {
  color: #94a3b8;
}

:global(html:not(.dark)) .home-tx__link:hover {
  background: rgba(8, 145, 178, 0.06);
}

:global(html:not(.dark)) .home-tx__link:hover .home-tx__title {
  color: #0e7490;
}

@media (prefers-reduced-motion: reduce) {
  .home-tx__dot {
    animation: none;
    opacity: 0.75;
  }

  .home-tx__link {
    transition: none;
  }
}
</style>
