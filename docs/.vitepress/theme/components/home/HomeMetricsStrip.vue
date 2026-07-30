<template>
  <section v-if="recent.length" class="home-tx" aria-label="最新文章">
    <div class="home-tx__head">
      <span class="home-tx__frame" aria-hidden="true" />
      <span class="home-tx__dot" aria-hidden="true" />
      <span class="home-tx__tag">RECENT TX</span>
      <span class="home-tx__meta">最新文章 · {{ recent.length }}</span>
    </div>
    <ul class="home-tx__list">
      <li v-for="(item, index) in recent" :key="item.href" class="home-tx__item">
        <a class="home-tx__link" :href="item.href" :title="item.title">
          <span class="home-tx__status" aria-hidden="true" />
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
.home-tx {
  position: relative;
  z-index: 1;
  width: 100%;
  margin-top: auto;
  padding-top: 10px;
  padding-bottom: 4px;
  border-top: 1px solid rgba(34, 211, 238, 0.35);
  overflow: hidden;
}

.home-tx::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 3px,
    rgba(34, 211, 238, 0.07) 3px,
    rgba(34, 211, 238, 0.07) 4px
  );
  animation: homeTxScan 7s linear infinite;
  opacity: 1;
}

.home-tx__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 5px 8px 5px 10px;
  border: 1px solid rgba(34, 211, 238, 0.45);
  background: rgba(4, 12, 22, 0.85);
  box-shadow:
    inset 0 0 20px rgba(34, 211, 238, 0.06),
    0 0 12px rgba(34, 211, 238, 0.12);
  font-family: var(--tech-font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.95);
}

/* 角标框 */
.home-tx__frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(#67e8f9, #67e8f9) 0 0 / 8px 1.5px no-repeat,
    linear-gradient(#67e8f9, #67e8f9) 0 0 / 1.5px 8px no-repeat,
    linear-gradient(#c084fc, #c084fc) 100% 0 / 8px 1.5px no-repeat,
    linear-gradient(#c084fc, #c084fc) 100% 0 / 1.5px 8px no-repeat,
    linear-gradient(#c084fc, #c084fc) 0 100% / 8px 1.5px no-repeat,
    linear-gradient(#c084fc, #c084fc) 0 100% / 1.5px 8px no-repeat,
    linear-gradient(#67e8f9, #67e8f9) 100% 100% / 8px 1.5px no-repeat,
    linear-gradient(#67e8f9, #67e8f9) 100% 100% / 1.5px 8px no-repeat;
}

.home-tx__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #22d3ee;
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.9);
  animation: homeTxPulse 2s ease-in-out infinite;
}

.home-tx__tag {
  color: #67e8f9;
  font-weight: 800;
  text-shadow: 0 0 12px rgba(34, 211, 238, 0.65);
}

.home-tx__meta {
  margin-left: auto;
  letter-spacing: 0.06em;
  text-transform: none;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.home-tx__list {
  position: relative;
  z-index: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.home-tx__link {
  display: grid;
  grid-template-columns: 8px 1.8em 5.2em minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  padding: 6px 6px;
  border-radius: 2px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.15s ease;
}

.home-tx__link:hover {
  background: rgba(34, 211, 238, 0.1);
}

.home-tx__link:hover .home-tx__title {
  color: #ffffff;
  text-shadow: 0 0 10px rgba(34, 211, 238, 0.35);
}

.home-tx__status {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  justify-self: center;
  background: #22d3ee;
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.85);
  animation: homeTxPulse 2s ease-in-out infinite;
}

.home-tx__item:nth-child(2) .home-tx__status {
  animation-delay: 0.35s;
}

.home-tx__item:nth-child(3) .home-tx__status {
  animation-delay: 0.7s;
}

.home-tx__idx,
.home-tx__section,
.home-tx__stamp {
  font-family: var(--tech-font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 11px;
  letter-spacing: 0.06em;
}

.home-tx__idx {
  color: #22d3ee;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 8px rgba(34, 211, 238, 0.4);
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
  font-family: var(--tech-font-mono, 'JetBrains Mono', ui-monospace, monospace);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.3;
  color: #f8fafc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.15s ease;
}

.home-tx__stamp {
  color: #475569;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@keyframes homeTxPulse {
  0%,
  100% {
    opacity: 0.35;
    box-shadow: 0 0 4px rgba(34, 211, 238, 0.3);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.95);
  }
}

@keyframes homeTxScan {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 20px;
  }
}

/* 深色小屏：RECENT TX 头栏略提亮（完整选择器进 :global，避免泄漏到 html） */
@media (max-width: 960px) {
  :global(html.dark .home-tx__head) {
    background: rgba(10, 24, 40, 0.88);
    border-color: rgba(34, 211, 238, 0.55);
    box-shadow:
      inset 0 0 24px rgba(34, 211, 238, 0.1),
      0 0 14px rgba(34, 211, 238, 0.16);
  }
}

@media (max-width: 639px) {
  .home-tx__link {
    grid-template-columns: 8px 1.8em minmax(0, 1fr) auto;
    grid-template-areas:
      'status idx section stamp'
      'status idx title title';
    row-gap: 2px;
  }

  .home-tx__status {
    grid-area: status;
    align-self: start;
    margin-top: 5px;
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

:global(html:not(.dark) .home-tx) {
  border-top-color: rgba(8, 145, 178, 0.28);
}

:global(html:not(.dark) .home-tx::before) {
  background: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 3px,
    rgba(8, 145, 178, 0.05) 3px,
    rgba(8, 145, 178, 0.05) 4px
  );
  opacity: 0.5;
}

:global(html:not(.dark) .home-tx__head) {
  border-color: rgba(8, 145, 178, 0.3);
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  box-shadow: none;
}

:global(html:not(.dark) .home-tx__tag) {
  color: #0891b2;
  text-shadow: none;
}

:global(html:not(.dark) .home-tx__meta) {
  color: #94a3b8;
}

:global(html:not(.dark) .home-tx__dot),
:global(html:not(.dark) .home-tx__status) {
  background: #0891b2;
  box-shadow: 0 0 6px rgba(8, 145, 178, 0.35);
}

:global(html:not(.dark) .home-tx__idx) {
  color: #0891b2;
  text-shadow: none;
}

:global(html:not(.dark) .home-tx__section) {
  color: #64748b;
}

:global(html:not(.dark) .home-tx__title) {
  color: #0f172a;
}

:global(html:not(.dark) .home-tx__stamp) {
  color: #94a3b8;
}

:global(html:not(.dark) .home-tx__link:hover) {
  background: rgba(8, 145, 178, 0.06);
}

:global(html:not(.dark) .home-tx__link:hover .home-tx__title) {
  color: #0e7490;
  text-shadow: none;
}

@media (prefers-reduced-motion: reduce) {
  .home-tx__dot,
  .home-tx__status,
  .home-tx::before {
    animation: none;
  }

  .home-tx__dot,
  .home-tx__status {
    opacity: 0.9;
  }

  .home-tx__link {
    transition: none;
  }
}
</style>
