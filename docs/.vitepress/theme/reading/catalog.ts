export interface ManualArticle {
  num: string
  title: string
  link: string
}

export interface ManualChapter {
  name: string
  articles: ManualArticle[]
}

export interface ManualPart {
  id: string
  name: string
  chapters: ManualChapter[]
  count: number
}

interface SideItem {
  text?: string
  link?: string
  items?: SideItem[]
}

const GROUPS: { id: string; name: string; roots: { path: string; label: string }[] }[] = [
  {
    id: '01',
    name: '移动开发',
    roots: [
      { path: '/Android/', label: 'Android' },
      { path: '/Kotlin/', label: 'Kotlin' },
      { path: '/Flutter/', label: 'Flutter' },
    ],
  },
  {
    id: '02',
    name: '编程语言',
    roots: [
      { path: '/Java/', label: 'Java' },
      { path: '/Python/', label: 'Python' },
      { path: '/JS/', label: 'JavaScript' },
      { path: '/C/', label: 'C' },
      { path: '/C++/', label: 'C++' },
    ],
  },
  {
    id: '03',
    name: 'AI 与智能体',
    roots: [
      { path: '/Ai/', label: 'AI' },
      { path: '/Agent/', label: 'Agent' },
    ],
  },
  {
    id: '04',
    name: '数据与系统',
    roots: [
      { path: '/数据结构和算法/', label: '数据结构' },
      { path: '/SQL/', label: 'SQL' },
      { path: '/Linux/', label: 'Linux' },
    ],
  },
]

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function normPath(input: string) {
  let p = input || '/'
  try {
    p = decodeURIComponent(p)
  } catch {
    /* keep raw */
  }
  p = p.split('#')[0].split('?')[0]
  p = p.replace(/^\/Blog_/, '')
  p = p.replace(/\.html$/, '')
  if (p.length > 1) p = p.replace(/\/$/, '')
  if (!p.startsWith('/')) p = `/${p}`
  return p
}

function collectLinks(items: SideItem[] | undefined, bucket: { title: string; link: string }[]) {
  for (const item of items || []) {
    if (item.items?.length) collectLinks(item.items, bucket)
    else if (item.link && item.text) bucket.push({ title: item.text, link: item.link })
  }
}

function chaptersForRoot(items: SideItem[] | undefined, rootLabel: string, prefixRoot: boolean): ManualChapter[] {
  const chapters: ManualChapter[] = []
  const loose: { title: string; link: string }[] = []
  for (const item of items || []) {
    if (item.items?.length) {
      const links: { title: string; link: string }[] = []
      collectLinks(item.items, links)
      if (!links.length) continue
      const name = item.text || rootLabel
      chapters.push({
        name: prefixRoot ? `${rootLabel} · ${name}` : name,
        articles: links.map((link) => ({ num: '', title: link.title, link: link.link })),
      })
    } else if (item.link && item.text) {
      loose.push({ title: item.text, link: item.link })
    }
  }
  if (loose.length) {
    chapters.unshift({
      name: rootLabel,
      articles: loose.map((link) => ({ num: '', title: link.title, link: link.link })),
    })
  }
  return chapters
}

export function buildManualCatalog(sidebar: unknown): ManualPart[] {
  const map = sidebar && typeof sidebar === 'object' && !Array.isArray(sidebar)
    ? sidebar as Record<string, SideItem[]>
    : null
  if (!map) return []

  return GROUPS.map((group) => {
    const prefixRoot = group.roots.length > 1
    const chapters = group.roots.flatMap((root) => {
      const items = map[root.path]
      if (!items) return []
      return chaptersForRoot(items, root.label, prefixRoot)
    })
    let chapterIndex = 0
    for (const chapter of chapters) {
      chapterIndex += 1
      chapter.articles.forEach((article, i) => {
        article.num = `${group.id}.${pad(chapterIndex)}.${pad(i + 1)}`
      })
    }
    const count = chapters.reduce((n, chapter) => n + chapter.articles.length, 0)
    return { id: group.id, name: group.name, chapters, count }
  }).filter((part) => part.count > 0)
}

export function findManualArticle(parts: ManualPart[], routePath: string) {
  const target = normPath(routePath)
  for (const part of parts) {
    for (const chapter of part.chapters) {
      const index = chapter.articles.findIndex((article) => normPath(article.link) === target)
      if (index >= 0) {
        return {
          part,
          chapter,
          article: chapter.articles[index],
          index: index + 1,
          total: chapter.articles.length,
        }
      }
    }
  }
  return null
}

export function catalogStats(parts: ManualPart[]) {
  return {
    articles: parts.reduce((n, part) => n + part.count, 0),
    parts: parts.length,
    chapters: parts.reduce((n, part) => n + part.chapters.length, 0),
  }
}
