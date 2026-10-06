import fs from 'node:fs'
import path from 'node:path'

export interface ArticleItem {
  rel: string           // 相对 docs/ 的路径，如 'Android/Activity.md'
  url: string           // clean URL，如 '/Android/Activity'
  title: string
  description: string
  created: string       // ISO 日期字符串，如 '2024-03-15'
  tags: string[]
  categories: string[]
  draft: boolean
  section: string       // 顶级目录名，如 'Android'
  sectionLabel: string  // 栏目名，如 '移动开发'
  prevArticle?: { title: string; url: string }
  nextArticle?: { title: string; url: string }
  posInGroup?: { index: number; total: number }
  hasDiagram: boolean   // frontmatter.hasDiagram === true 或含交互图
  readingTime: number   // 按 350字/min 估算，最少 1 分钟
}

export interface ArticlesData {
  articles: ArticleItem[]
  categories: {
    label: string
    dirs: string[]
    articles: ArticleItem[]
  }[]
  metrics: {
    totalArticles: number
    totalSections: number
    totalDiagrams: number
    lastUpdated: string
  }
}

// 栏目定义（与 config.mts 保持一致，前端与脚本暂无正式文章不纳入）
const HOME_CATEGORY_DEFS = [
  { label: '移动开发', dirs: ['Android', 'Kotlin', 'Flutter'] },
  { label: 'AI 与智能体', dirs: ['Ai', 'Agent'] },
  { label: '后端技术', dirs: ['Java', 'Python', 'SQL'] },
  { label: '系统与底层', dirs: ['C', 'C++', 'Linux'] },
  { label: '算法与数据结构', dirs: ['数据结构和算法'] },
]

// 排除的非文章/功能页系统文件
const IGNORED_FILES = new Set([
  'index.md',
  'catalog.md',
  'figures.md',
  'changelog.md',
  'archive.md',
  'theme-tokens.md',
  '404.md',
  'getting-started.md',
  'markdown-examples.md',
])

function getSectionLabel(dir: string): string {
  for (const cat of HOME_CATEGORY_DEFS) {
    if (cat.dirs.includes(dir)) {
      return cat.label
    }
  }
  return dir
}

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: content }

  const rawYaml = match[1]
  const body = match[2]
  const frontmatter: Record<string, any> = {}

  const lines = rawYaml.split(/\r?\n/)
  let currentKey = ''
  let inArray = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    if (inArray && trimmed.startsWith('-')) {
      const val = trimmed.replace(/^-\s*/, '').replace(/^['"]|['"]$/g, '')
      if (Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey].push(val)
      }
      continue
    }

    const colonIdx = line.indexOf(':')
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim()
      let value = line.slice(colonIdx + 1).trim()
      currentKey = key

      if (value === '') {
        inArray = true
        frontmatter[key] = []
      } else {
        inArray = false
        if (value.startsWith('[') && value.endsWith(']')) {
          frontmatter[key] = value
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean)
        } else if (value === 'true') {
          frontmatter[key] = true
        } else if (value === 'false') {
          frontmatter[key] = false
        } else {
          frontmatter[key] = value.replace(/^['"]|['"]$/g, '')
        }
      }
    }
  }

  return { frontmatter, body }
}

function calculateReadingTime(text: string): number {
  const clean = text.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '')
  const chineseChars = (clean.match(/[\u4e00-\u9fa5]/g) || []).length
  const words = (clean.match(/[a-zA-Z0-9_-]+/g) || []).length
  const totalCount = chineseChars + words
  return Math.max(1, Math.ceil(totalCount / 350))
}

function scanDir(dir: string, baseDir: string, fileList: string[] = []): string[] {
  const items = fs.readdirSync(dir)
  for (const item of items) {
    if (item.startsWith('.') || item === 'node_modules' || item === 'public' || item === 'tags') {
      continue
    }
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      scanDir(fullPath, baseDir, fileList)
    } else if (item.endsWith('.md')) {
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/')
      fileList.push(rel)
    }
  }
  return fileList
}

function load(): ArticlesData {
  const docsDir = path.resolve(process.cwd(), 'docs')
  const files = scanDir(docsDir, docsDir)

  const items: ArticleItem[] = []
  let totalDiagrams = 0
  let latestDate = ''

  for (const rel of files) {
    // 排除功能页与根目录系统样例页
    if (IGNORED_FILES.has(rel) || rel.endsWith('/index.md')) {
      continue
    }

    const fullPath = path.join(docsDir, rel)
    const content = fs.readFileSync(fullPath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(content)

    const parts = rel.split('/')
    const section = parts[0]
    const sectionLabel = getSectionLabel(section)
    const filename = path.basename(rel)

    /**
     * 草稿判定规则（严格遵守用户确认 1）：
     * 1. 纯数字文件名 (如 1.md, 02.md，共 26 篇草稿/占位页)
     * 2. frontmatter 中显式声明 draft: true
     * 3. '前端与脚本'栏目 (JS, Common) 暂无正式文章，排除出正式文章列表
     * 占位页保留 URL 可直接访问并打上 noindex，但在目录、统计、上下篇与 sitemap 中排除。
     */
    const isDraft = /^\d+\.md$/.test(filename) || frontmatter.draft === true || ['JS', 'Common'].includes(section)

    const cleanName = filename.replace(/\.md$/, '')
    const title = frontmatter.title || cleanName

    const description = frontmatter.description || ''
    const created = frontmatter.created || frontmatter.date || ''
    if (created && created > latestDate) {
      latestDate = created
    }

    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : []
    const categories = Array.isArray(frontmatter.categories) ? frontmatter.categories : []
    const hasDiagram = frontmatter.hasDiagram === true || body.includes('DiagramCas') || body.includes('```mermaid')
    if (hasDiagram && !isDraft) {
      totalDiagrams++
    }

    // clean URL 路由
    let url = '/' + rel.replace(/(?:^|\/)index\.md$/, '').replace(/\.md$/, '')
    if (url === '') url = '/'

    const readingTime = calculateReadingTime(body)

    items.push({
      rel,
      url,
      title,
      description,
      created,
      tags,
      categories,
      draft: isDraft,
      section,
      sectionLabel,
      hasDiagram,
      readingTime,
    })
  }

  // 仅保留 309 篇非草稿正式文章
  const publishedArticles = items.filter((item) => !item.draft)

  // 按 section 分组并链接上下文前后篇
  const sectionMap = new Map<string, ArticleItem[]>()
  for (const art of publishedArticles) {
    if (!sectionMap.has(art.section)) {
      sectionMap.set(art.section, [])
    }
    sectionMap.get(art.section)!.push(art)
  }

  for (const [sec, list] of sectionMap.entries()) {
    list.sort((a, b) => a.rel.localeCompare(b.rel, 'zh-CN', { numeric: true }))
    const total = list.length
    for (let i = 0; i < total; i++) {
      list[i].posInGroup = { index: i + 1, total }
      if (i > 0) {
        list[i].prevArticle = { title: list[i - 1].title, url: list[i - 1].url }
      }
      if (i < total - 1) {
        list[i].nextArticle = { title: list[i + 1].title, url: list[i + 1].url }
      }
    }
  }

  // 组装 categories 结构（前端与脚本无文章，不展示）
  const categoriesData = HOME_CATEGORY_DEFS.map((cat) => {
    const matchedArticles = publishedArticles.filter((art) => cat.dirs.includes(art.section))
    return {
      label: cat.label,
      dirs: cat.dirs,
      articles: matchedArticles,
    }
  }).filter((cat) => cat.articles.length > 0)

  return {
    articles: publishedArticles,
    categories: categoriesData,
    metrics: {
      totalArticles: publishedArticles.length,
      totalSections: categoriesData.length,
      totalDiagrams,
      lastUpdated: latestDate || new Date().toISOString().slice(0, 10),
    },
  }
}

export declare const data: ArticlesData
export default {
  watch: ['../../../**/*.md'],
  load,
}
