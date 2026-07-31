/**
 * Generate tag aggregation pages from article frontmatter.
 * Output: docs/tags/index.md (overview) + docs/tags/<tag>/index.md (per tag).
 * Run before every build (see docs:build / docs:dev in package.json).
 */
import fs from 'fs'
import path from 'path'

const docsDir = path.resolve(process.cwd(), 'docs')
const tagsDir = path.join(docsDir, 'tags')

function walk(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.vitepress' || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walk(full))
    else if (entry.name.endsWith('.md')) results.push(full)
  }
  return results
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const fm = {}
  if (!m) return fm
  for (const line of m[1].split(/\r?\n/)) {
    const km = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!km) continue
    const key = km[1]
    let raw = km[2].trim()
    if (/^\[.*\]$/.test(raw)) {
      fm[key] = raw.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
    } else {
      raw = raw.replace(/^['"]|['"]$/g, '')
      fm[key] = raw === 'true' ? true : raw === 'false' ? false : raw
    }
  }
  return fm
}

function pageLink(rel) {
  return '/' + rel.replace(/\\/g, '/').replace(/(?:(^|\/)index)?\.md$/, '$1')
}

function sanitizeDir(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]+/g, '-').replace(/\s+/g, '-').replace(/^-+|-+$/g, '')
}

const articles = []
for (const file of walk(docsDir)) {
  const rel = path.relative(docsDir, file).replace(/\\/g, '/')
  if (rel === 'index.md' || rel.endsWith('/index.md')) continue
  const fm = parseFrontmatter(fs.readFileSync(file, 'utf-8'))
  if (fm.noindex) continue
  const title = String(fm.title || '').trim()
  if (!title) continue
  const tags = Array.isArray(fm.tags) ? fm.tags.map((t) => String(t).trim()).filter(Boolean) : []
  if (tags.length === 0) continue
  articles.push({
    rel,
    title,
    link: pageLink(rel),
    tags,
    description: String(fm.description || '').trim(),
    created: String(fm.created || fm.date || ''),
  })
}

// Group by lowercase tag key, keep the first-seen display name.
const tagMap = new Map()
for (const a of articles) {
  for (const tag of a.tags) {
    const key = tag.toLowerCase()
    if (!tagMap.has(key)) tagMap.set(key, { name: tag, items: [] })
    tagMap.get(key).items.push(a)
  }
}
const tags = [...tagMap.values()]
for (const t of tags) {
  t.items.sort((a, b) => b.created.localeCompare(a.created) || a.title.localeCompare(b.title))
}
tags.sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name))

// Remove stale generated tag dirs.
if (fs.existsSync(tagsDir)) {
  for (const entry of fs.readdirSync(tagsDir)) {
    if (entry === 'index.md') continue
    const full = path.join(tagsDir, entry)
    if (!tagMap.has(entry.toLowerCase()) && fs.statSync(full).isDirectory()) {
      fs.rmSync(full, { recursive: true, force: true })
    }
  }
}
fs.mkdirSync(tagsDir, { recursive: true })

// Overview page.
const overview = [
  '---',
  'title: 标签',
  'description: 按标签浏览全部文章',
  'hideArticleMeta: true',
  '---',
  '',
  '# 标签',
  '',
  `共 **${tags.length}** 个标签，**${articles.length}** 篇文章：`,
  '',
  ...tags.map((t) => `- [${t.name}（${t.items.length}）](/tags/${sanitizeDir(t.name)}/)`),
  '',
].join('\n')
fs.writeFileSync(path.join(tagsDir, 'index.md'), overview, 'utf-8')

// Per-tag pages.
for (const t of tags) {
  const dir = path.join(tagsDir, sanitizeDir(t.name))
  fs.mkdirSync(dir, { recursive: true })
  const lines = [
    '---',
    `title: 标签：${t.name}`,
    `description: 与「${t.name}」相关的文章共 ${t.items.length} 篇`,
    'hideArticleMeta: true',
    '---',
    '',
    `# 标签：${t.name}`,
    '',
    `共 **${t.items.length}** 篇文章：`,
    '',
    ...t.items.map((a) => `- [${a.title}](${a.link})${a.description ? ` — ${a.description}` : ''}`),
    '',
  ]
  fs.writeFileSync(path.join(dir, 'index.md'), lines.join('\n'), 'utf-8')
}

console.log(`tags: ${tags.length} groups, ${articles.length} articles indexed`)
