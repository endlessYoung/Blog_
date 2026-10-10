// Put html.manual on the document before any paint. Do not inline layout CSS —
// that fights the real theme and can leave a half-styled, non-hydrated page.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BOOT =
  '<script id="ey-manual-boot">(()=>{const r=document.documentElement;r.classList.add("manual");r.classList.remove("spatial","fluid");try{if(localStorage.getItem("ey-accent")==="blue")r.dataset.accent="blue"}catch(e){}})();</script>'

export function stampManualHtml(html) {
  html = html.replace(/<html\b([^>]*)>/i, (_, attrs) => {
    const classMatch = attrs.match(/\bclass\s*=\s*(["'])([^"']*)\1/i)
    if (classMatch) {
      if (/\bmanual\b/.test(classMatch[2])) return `<html${attrs}>`
      return `<html${attrs.replace(classMatch[0], `class=${classMatch[1]}manual ${classMatch[2]}${classMatch[1]}`)}>`
    }
    return `<html class="manual"${attrs}>`
  })

  html = html.replace(/\s*<script id="ey-manual-boot">[\s\S]*?<\/script>/, '')
  html = html.replace(/\s*<style id="ey-critical">[\s\S]*?<\/style>/, '')

  html = html.replace(/<head([^>]*)>/i, (open) => `${open}${BOOT}`)
  return html
}

function walkHtml(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walkHtml(p, files)
    else if (entry.name.endsWith('.html')) files.push(p)
  }
  return files
}

const invoked = process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/stamp-manual-html.mjs')
if (invoked) {
  const dist = join(process.cwd(), 'docs', '.vitepress', 'dist')
  const files = walkHtml(dist)
  let changed = 0
  for (const file of files) {
    const html = readFileSync(file, 'utf8')
    const next = stampManualHtml(html)
    if (next !== html) {
      writeFileSync(file, next)
    }
    changed++
  }
  console.log(`stamp-manual-html: stamped ${changed}/${files.length} html file(s)`)
}
