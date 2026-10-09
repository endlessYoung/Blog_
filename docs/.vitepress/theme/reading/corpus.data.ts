import { execFileSync } from 'node:child_process'
import { createContentLoader } from 'vitepress'

export interface CorpusPage {
  url: string
  title: string
  tags: string[]
  updated: string
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

export default createContentLoader('**/*.md', {
  transform(raw) {
    const pages: CorpusPage[] = []
    for (const page of raw) {
      const url = page.url.replace(/\.html$/, '').replace(/\/$/, '') || '/'
      if (url.startsWith('/tags') || url === '/404') continue
      if (page.frontmatter.layout === 'home') continue
      const tags = Array.isArray(page.frontmatter.tags)
        ? page.frontmatter.tags.map((tag) => String(tag))
        : []
      pages.push({
        url,
        title: String(page.frontmatter.title || url.split('/').pop() || url),
        tags,
        updated: dates.get(fileOf(url)) || '',
      })
    }
    return pages
  },
})
