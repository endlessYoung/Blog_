/**
 * Scan all tracked .md files via git and cache their first-commit dates.
 * Output: docs/.vitepress/created-dates.json  →  { "path/to/file.md": "2023-10-04" }
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const docsDir = path.resolve(__dirname, '..', 'docs')
const cachePath = path.join(docsDir, '.vitepress', 'created-dates.json')

// Load existing cache
let cache = {}
if (fs.existsSync(cachePath)) {
  try { cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8')) } catch {}
}

const files = execSync('git -c core.quotepath=off ls-files "*.md"', {
  cwd: docsDir, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024
}).trim().split('\n').filter(Boolean)

let added = 0, cached = 0

for (let i = 0; i < files.length; i++) {
  const file = files[i].trim()
  if (cache[file]) { cached++; continue }

  let date
  try {
    date = execSync(
      `git log --diff-filter=A --follow --format=%aI -- "${file}"`,
      { cwd: docsDir, encoding: 'utf-8', timeout: 3000 }
    ).trim().split('\n').pop()
  } catch { continue }

  if (date && date.startsWith('20')) {
    cache[file] = date.slice(0, 10)
    added++
  }
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf-8')
console.log(`created-dates: ${added} new, ${cached} cached, ${Object.keys(cache).length} total`)
