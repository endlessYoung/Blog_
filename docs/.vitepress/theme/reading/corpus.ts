import { data } from './corpus.data'
import { findManualArticle, normPath, type ManualPart } from './catalog'

export interface CorpusPage {
  url: string
  title: string
  tags: string[]
  updated: string
}

export const corpus = data as CorpusPage[]

const byUrl = new Map(corpus.map((page) => [normPath(page.url), page]))

export function pageMeta(link: string) {
  return byUrl.get(normPath(link))
}

export function recentPages(limit = 8) {
  return corpus
    .filter((page) => page.updated)
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, limit)
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
      if (!name || seen.has(name)) continue
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
