/** Generate crawlable article listings independently of the interactive homepage. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const docs = resolve('docs')
const categories = new Map([
  ['Android', ['Android 开发', 'Android 开发相关文章，涵盖 Jetpack、Framework 源码、性能优化与 Compose 等主题。']],
  ['Kotlin', ['Kotlin', 'Kotlin 学习笔记，涵盖语法、协程、Flow 与实战应用等主题。']],
  ['Java', ['Java', 'Java 学习笔记，涵盖并发、JVM、集合框架与基础语法等主题。']],
  ['Ai', ['AI / 机器学习', 'AI 与机器学习学习笔记，涵盖监督学习、神经网络、经典算法推导与工程实践。']],
  ['Agent', ['Agent 开发', 'AI Agent 开发相关内容，涵盖向量表示、文档切分与智能体工程实践。']],
])

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['.vitepress', 'node_modules', 'public', 'tags'].includes(entry.name)) return []
    const full = join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : entry.name.endsWith('.md') ? [full] : []
  })
}

function field(frontmatter, name) {
  return (frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1] || '')
    .trim().replace(/^['"]|['"]$/g, '')
}

function label(text) {
  return text.replace(/[\[\]<>]/g, '').replace(/\s+/g, ' ').trim()
}

const groups = new Map()
for (const file of walk(docs)) {
  const rel = relative(docs, file).replace(/\\/g, '/')
  if (!rel.includes('/') || /(^|\/)index\.md$/i.test(rel)) continue
  const source = readFileSync(file, 'utf8')
  const fm = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || ''
  if (field(fm, 'noindex') === 'true') continue
  const title = field(fm, 'title') || source.match(/^#\s+(.+)$/m)?.[1]
  if (!title) throw new Error(`Article needs a title: ${rel}`)
  const root = rel.split('/')[0]
  const list = groups.get(root) || []
  const url = '/' + rel.replace(/\.md$/, '.html').split('/').map(encodeURIComponent).join('/')
  list.push({ title: label(title), description: label(field(fm, 'description')), url })
  groups.set(root, list)
}

function articleLines(articles) {
  return [...articles].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
    .map((a) => `- [${a.title}](${a.url})${a.description ? ` — ${a.description}` : ''}`)
}

const archive = [
  '---',
  'title: 全部文章目录',
  'description: 按技术分类查阅本站的 Android、Kotlin、Java、AI、Agent、Python、数据结构与算法等文章。',
  'hideArticleMeta: true',
  '---', '', '# 全部文章目录', '',
  '这里按主题列出本站已开放索引的文章。可以直接打开文章，也可以通过[标签目录](/tags/)查找相关内容。尚未完成的占位笔记不列入本目录。', '',
]

for (const [root, articles] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
  const category = categories.get(root)
  archive.push(`## ${category?.[0] || root}`, '')
  if (category) archive.push(`[${category[0]}分类目录](/${root}/)`, '')
  archive.push(...articleLines(articles), '')
  if (!category) continue
  const [title, description] = category
  writeFileSync(join(docs, root, 'index.md'), [
    '---', `title: ${title}`, `description: ${description}`,
    'hideArticleMeta: true', '---', '', `# ${title}`, '', description, '',
    `本分类共 ${articles.length} 篇文章。以下目录可直接打开正文；其他主题见[全部文章目录](/archives.html)。`, '',
    ...articleLines(articles), '',
  ].join('\n'))
}

writeFileSync(join(docs, 'archives.md'), archive.join('\n'))
console.log(`archives: ${groups.size} categories, ${[...groups.values()].reduce((n, a) => n + a.length, 0)} articles`)
