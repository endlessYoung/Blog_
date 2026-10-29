/** Audit the built files that will actually be deployed, without running browser JavaScript. */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, sep } from 'node:path'

const origin = 'https://endlessyoung.top'
const dist = resolve('docs/.vitepress/dist')
const errors = []
const unescape = (value) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map((m) => [m[1].toLowerCase(), unescape(m[3])]))

function outputFile(url) {
  let path = decodeURIComponent(new URL(url, origin).pathname)
  if (path.endsWith('/')) path += 'index.html'
  else if (!/\.[^/]+$/.test(path)) path += '.html'
  const file = resolve(dist, '.' + path)
  if (!file.startsWith(dist + sep)) throw new Error(`URL escapes output directory: ${url}`)
  return file
}

function readPage(url) {
  const file = outputFile(url)
  return existsSync(file) && statSync(file).isFile() ? readFileSync(file, 'utf8') : null
}

const xml = readFileSync(resolve(dist, 'sitemap.xml'), 'utf8')
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/gs)].map((m) => unescape(m[1]))
if (!urls.length) errors.push('Sitemap has no URLs')
if (new Set(urls).size !== urls.length) errors.push('Sitemap has duplicate URLs')

for (const url of urls) {
  const parsed = new URL(url)
  if (parsed.origin !== origin || parsed.search || parsed.hash) errors.push(`Unexpected sitemap URL: ${url}`)
  const html = readPage(url)
  if (html === null) { errors.push(`Missing sitemap target: ${url}`); continue }
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || ''
  const meta = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]))
  if (meta.some((m) => /^(robots|googlebot)$/i.test(m.name || '') && /\b(noindex|none)\b/i.test(m.content || ''))) errors.push(`Noindex URL in sitemap: ${url}`)
  if (meta.some((m) => m['http-equiv']?.toLowerCase() === 'refresh')) errors.push(`Redirect URL in sitemap: ${url}`)
  const canonical = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0])).filter((m) => m.rel === 'canonical')
  if (canonical.length !== 1 || new URL(canonical[0].href, origin).href !== parsed.href) errors.push(`Canonical mismatch: ${url}`)
}

// Every submitted page must be discoverable from real <a href> links starting at home.
const queue = [origin + '/']
const queued = new Set([outputFile(queue[0])])
const reached = new Set()
for (let i = 0; i < queue.length; i++) {
  const url = queue[i]
  const file = outputFile(url)
  if (reached.has(file)) continue
  reached.add(file)
  const html = readPage(url)
  if (html === null) continue
  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attrs(match[0]).href
    if (!href) continue
    const next = new URL(href, url)
    if (next.origin !== origin) continue
    if (/\.[^/]+$/.test(next.pathname) && !next.pathname.endsWith('.html')) continue
    next.search = ''; next.hash = ''
    const nextFile = outputFile(next.href)
    if (!existsSync(nextFile)) { errors.push(`Broken internal link: ${next.href} (from ${url})`); continue }
    if (!queued.has(nextFile)) {
      queued.add(nextFile)
      queue.push(next.href)
    }
  }
}
for (const url of urls) {
  if (!reached.has(outputFile(url))) errors.push(`Sitemap URL has no static link path from home: ${url}`)
}

const robots = readFileSync(resolve(dist, 'robots.txt'), 'utf8')
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) errors.push('robots.txt must reference the production sitemap')
if (readFileSync(resolve(dist, 'CNAME'), 'utf8').trim() !== new URL(origin).hostname) errors.push('CNAME differs from the canonical host')

console.log(`SEO audit: ${urls.length} sitemap URLs, ${reached.size} pages reachable without JavaScript`)
if (errors.length) {
  console.error([...new Set(errors)].join('\n'))
  process.exit(1)
}
console.log('audit-seo: ok')
