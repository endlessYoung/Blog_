import { data, type CorpusPage } from './corpus.data'
import { findManualArticle, normPath, type ManualPart } from './catalog'
import { keepIndexTerm } from './terms'

export type { CorpusPage } from './corpus.data'

export const corpus = data as CorpusPage[]

const byUrl = new Map(corpus.map((page) => [normPath(page.url), page]))

export function pageMeta(link: string) {
  return byUrl.get(normPath(link))
}

export interface UpdateEntry {
  page: CorpusPage
  date: string
  kind: 'new' | 'updated'
}

function dayDiff(a: string, b: string) {
  const ta = Date.parse(`${a}T00:00:00Z`)
  const tb = Date.parse(`${b}T00:00:00Z`)
  if (Number.isNaN(ta) || Number.isNaN(tb)) return 0
  return Math.round((tb - ta) / 86_400_000)
}

export function recentUpdates(limit = 60): UpdateEntry[] {
  return corpus
    .filter((page) => page.updated || page.created)
    .map((page): UpdateEntry => {
      const created = page.created || page.updated
      const updated = page.updated || page.created
      const date = updated >= created ? updated : created
      const isNew = !updated || created >= updated || dayDiff(created, updated) <= 2
      return { page, date, kind: isNew ? 'new' : 'updated' }
    })
    .sort((a, b) =>
      b.date.localeCompare(a.date)
      || (b.page.created || '').localeCompare(a.page.created || '')
      || a.page.title.localeCompare(b.page.title, 'zh'),
    )
    .slice(0, limit)
}

export function latestUpdateDate(): string {
  return recentUpdates(1)[0]?.date || ''
}

export function recentPages(limit = 8) {
  return recentUpdates(limit).map((entry) => ({
    ...entry.page,
    updated: entry.date,
  }))
}

export interface TermEntry {
  tag: string
  url: string
  title: string
}

export function termGroups() {
  const groups = new Map<string, TermEntry[]>()
  const seen = new Set<string>()
  for (const page of corpus) {
    for (const tag of page.tags) {
      const name = tag.trim()
      if (!keepIndexTerm(name) || seen.has(name)) continue
      seen.add(name)
      const key = termKey(name)
      const list = groups.get(key) || []
      list.push({ tag: name, url: page.url, title: page.title })
      groups.set(key, list)
    }
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'zh'))
    .map(([key, entries]) => ({
      key,
      entries: entries.sort((a, b) => a.tag.localeCompare(b.tag, 'zh')),
    }))
}

function termKey(tag: string) {
  const ch = [...tag][0] || '#'
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch
}

export function articleHit(parts: ManualPart[], link: string) {
  return findManualArticle(parts, link)
}
