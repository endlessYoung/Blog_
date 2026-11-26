import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createContentLoader } from 'vitepress'

export interface CorpusPage {
  url: string
  title: string
  description?: string
  tags: string[]
  category: string
  created: string
  updated: string
}

function loadCreatedDates() {
  try {
    const raw = readFileSync(join(process.cwd(), 'docs', '.vitepress', 'created-dates.json'), 'utf8')
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

function gitDates() {
  const map = new Map<string, string>()
  try {
    const out = execFileSync('git', [
      '-c', 'core.quotepath=false',
      'log', '-n', '250',
      '--pretty=format:COMMIT %cI',
      '--name-only',
      '--', 'docs',
    ], {
      encoding: 'utf8',
      cwd: process.cwd(),
    })
    let date = ''
    for (const line of out.split(/\r?\n/)) {
      if (line.startsWith('COMMIT ')) {
        date = line.slice(7).trim().slice(0, 10)
        continue
      }
      if (!date || !line.endsWith('.md')) continue
      const rel = line.replace(/\\/g, '/')
      if (!rel.startsWith('docs/') || map.has(rel)) continue
      map.set(rel, date)
    }
  } catch {
    /* 仓库不可用时日志留空 */
  }
  return map
}

const dates = gitDates()
const createdCache = loadCreatedDates()

function fileOf(url: string) {
  let path = url
  try {
    path = decodeURIComponent(url)
  } catch {
    /* keep */
  }
  path = path.replace(/\.html$/, '').replace(/\/$/, '')
  return `docs${path}.md`
}

function normDate(raw: unknown): string {
  if (!raw) return ''
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString().slice(0, 10)
  }
  const s = String(raw).trim()
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : ''
}

function categoryOf(url: string, fmCategories: unknown): string {
  if (Array.isArray(fmCategories) && fmCategories.length > 0 && fmCategories[0]) {
    return String(fmCategories[0]).trim()
  }
  let decoded = url
  try {
    decoded = decodeURIComponent(url)
  } catch {
    /* keep */
  }
  const seg = decoded.replace(/^\//, '').split('/')[0] || ''
  return seg || '其他'
}

export default createContentLoader('**/*.md', {
  transform(raw) {
    const pages: CorpusPage[] = []
    for (const page of raw) {
      const url = page.url.replace(/\.html$/, '').replace(/\/$/, '') || '/'
      if (url.startsWith('/tags') || url === '/404' || url === '/archives') continue
      if (url === '/getting-started' || url === '/markdown-examples') continue
      if (page.frontmatter.layout === 'home') continue
      if (page.frontmatter.noindex || page.frontmatter.hideArticleMeta) continue
      const tags = Array.isArray(page.frontmatter.tags)
        ? page.frontmatter.tags.map((tag) => String(tag))
        : []
      const description = typeof page.frontmatter.description === 'string'
        ? page.frontmatter.description.trim()
        : ''
      const docRel = fileOf(url)
      const cacheKey = docRel.replace(/^docs\//, '')
      const fmCreated = normDate(page.frontmatter.created || page.frontmatter.date)
      const created = fmCreated || normDate(createdCache[cacheKey]) || ''
      const updated = dates.get(docRel) || created
      pages.push({
        url: page.url,
        title: String(page.frontmatter.title || url.split('/').pop() || url),
        description: description.length > 110 ? `${description.slice(0, 110)}…` : description || undefined,
        tags,
        category: categoryOf(url, page.frontmatter.categories),
        created: created || updated,
        updated,
      })
    }
    return pages
  },
})
