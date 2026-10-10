import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

function listJs(dir) {
  const out = []
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name)
    if (name.isDirectory()) out.push(...listJs(p))
    else if (name.name.endsWith('.js')) out.push(p)
  }
  return out
}

const dist = join(process.cwd(), 'docs', '.vitepress', 'dist')
const htmlPath = join(dist, 'index.html')
const html = readFileSync(htmlPath, 'utf8')
const errors = []

const catalogLinks = (html.match(/manual-art-link/g) || []).length
if (catalogLinks > 24) {
  errors.push(`index.html still SSR ${catalogLinks} article links (expect collapsed catalog)`)
}

const blocking = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)].map((m) => m[0])
if (blocking.some((t) => t.includes('katex'))) {
  errors.push('homepage still has render-blocking katex.min.css')
}
if (blocking.some((t) => t.includes('vp-icons.css'))) {
  errors.push('vp-icons.css 仍是 render-blocking stylesheet')
}

const assets = join(dist, 'assets')
const files = listJs(assets)
const themePath = files.find((f) => /[/\\]theme\.[^/\\]+\.js$/.test(f))
if (!themePath) {
  errors.push('找不到 theme.*.js')
} else {
  const buf = readFileSync(themePath, 'utf8')
  const kb = Math.round(statSync(themePath).size / 1024)
  if (buf.includes('classDiagram') && buf.includes('gitGraph')) {
    errors.push(`${themePath} 仍内联了 mermaid vendor`)
  }
  if (buf.includes('MiniSearch') && buf.includes('loadJSON')) {
    errors.push(`${themePath} 仍内联了 minisearch`)
  }
  console.log(`theme chunk: ${themePath.replace(dist, '')} ${kb} KB`)
}

console.log(`index.html chars: ${html.length}`)
console.log(`manual-art-link count: ${catalogLinks}`)
console.log(`blocking stylesheets:\n${blocking.join('\n') || '(none)'}`)

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('assert-home-budget: ok')
