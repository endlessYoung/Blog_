// Remove VitePress's Inter font preload from built HTML. The theme uses a
// system font stack now, so the preload would force a 70KB font download.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'docs', '.vitepress', 'dist')
const preloadRe = /<link rel="preload" href="[^"]*inter-roman-latin\.[\w-]+\.woff2" as="font"[^>]*>\s*/g

const files = []
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    else if (entry.name.endsWith('.html')) files.push(p)
  }
}
walk(dist)

let removed = 0
for (const file of files) {
  const html = readFileSync(file, 'utf8')
  const next = html.replace(preloadRe, () => {
    removed++
    return ''
  })
  if (next !== html) writeFileSync(file, next)
}
console.log(`strip-inter-preload: removed ${removed} preload tag(s) from ${files.length} html file(s)`)