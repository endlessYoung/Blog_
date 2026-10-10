import { withBase } from 'vitepress'
// VitePress does not export pathToFile from the public client API.
// The client hash map lives on this module in the production bundle.
import { inBrowser, pathToFile } from 'vitepress/dist/client/app/utils.js'

const queued = new Set<string>()

function allow() {
  if (!inBrowser || import.meta.env.DEV) return false
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (conn?.saveData || (conn?.effectiveType && /2g/.test(conn.effectiveType))) return false
  return true
}

function enqueue(url: string, rel: 'prefetch' | 'preload', as?: string) {
  if (!url || queued.has(url)) return
  queued.add(url)
  const link = document.createElement('link')
  link.rel = rel
  link.href = url
  if (as) link.as = as
  document.head.appendChild(link)
}

export function prefetchPage(href: string | undefined | null) {
  if (!allow() || !href) return
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return
  try {
    const url = new URL(href, location.href)
    if (url.origin !== location.origin) return
    if (url.pathname === location.pathname) return
    const chunk = pathToFile(url.pathname)
    if (chunk) enqueue(chunk, 'prefetch')
  } catch {
    /* ignore bad hrefs */
  }
}

export function prefetchKatex() {
  if (!allow()) return
  if (document.getElementById('ey-katex') || document.getElementById('ey-katex-prefetch')) return
  const link = document.createElement('link')
  link.id = 'ey-katex-prefetch'
  link.rel = 'prefetch'
  link.as = 'style'
  link.href = withBase('/katex.min.css')
  document.head.appendChild(link)
}

export function prefetchHrefs(hrefs: Iterable<string>, limit = 12) {
  let n = 0
  for (const href of hrefs) {
    prefetchPage(href)
    if (++n >= limit) return
  }
}
