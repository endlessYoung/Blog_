// vp-icons.css is empty on this site and was render-blocking every HTML page.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'docs', '.vitepress', 'dist')
const re = /<link[^>]+href="[^"]*vp-icons\.css"[^>]*>\s*/gi

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
  let n = 0
  const next = html.replace(re, () => {
    n++
    return ''
  })
  if (n) {
    removed += n
    writeFileSync(file, next)
  }
}
console.log(`strip-blocking-vp-icons: removed ${removed} tag(s) from ${files.length} html file(s)`)
