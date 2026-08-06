import { createMarkdownRenderer, defineConfig, HeadConfig, SiteData } from 'vitepress'
import markdownItKatex from 'markdown-it-katex'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { Feed } from 'feed'

// ??/??????frontmatter: noindex???? sitemap ???
const noindexPages = new Set<string>()
const createdDates: Record<string, string> = (() => {
  try {
    return JSON.parse(readFileSync(join(__dirname, 'created-dates.json'), 'utf-8'))
  } catch { return {} }
})()

interface RelatedEntry {
  title: string
  link: string
  meta: string
}

/** Build a static "related reading" index from article frontmatter (SSR-friendly). */
function listMarkdownFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === '.vitepress' || entry === 'node_modules') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) results.push(...listMarkdownFiles(full))
    else if (entry.endsWith('.md')) results.push(full)
  }
  return results
}

function parseFrontmatterLine(line: string): [string, unknown] | null {
  const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
  if (!m) return null
  const key = m[1]
  let raw = m[2].trim()
  if (/^\[.*\]$/.test(raw)) {
    const arr = raw
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
    return [key, arr]
  }
  raw = raw.replace(/^['"]|['"]$/g, '')
  if (raw === 'true') return [key, true]
  if (raw === 'false') return [key, false]
  return [key, raw]
}

function parseArticleFrontmatter(file: string): Record<string, unknown> {
  const text = readFileSync(file, 'utf-8')
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const fm: Record<string, unknown> = {}
  if (!m) return fm
  for (const line of m[1].split(/\r?\n/)) {
    const kv = parseFrontmatterLine(line)
    if (kv) fm[kv[0]] = kv[1]
  }
  return fm
}

/** relativePath -> up to 4 related articles (tag intersection + same category). */
const relatedIndex: Record<string, RelatedEntry[]> = (() => {
  const srcDir = join(__dirname, '..')
  const files = listMarkdownFiles(srcDir).map((file) => {
    const fm = parseArticleFrontmatter(file)
    return {
      rel: relative(srcDir, file).replace(/\\/g, '/'),
      title: String(fm.title || '').trim(),
      tags: Array.isArray(fm.tags) ? (fm.tags as string[]).map((t) => String(t).trim().toLowerCase()) : [],
      categories: Array.isArray(fm.categories) ? (fm.categories as string[]).map((c) => String(c).trim()) : [],
      noindex: !!fm.noindex,
      created: String(fm.created || fm.date || ''),
    }
  })

  const index: Record<string, RelatedEntry[]> = {}
  for (const a of files) {
    if (a.noindex || !a.title) continue
    const scored = files
      .filter((b) => b !== a && !b.noindex && b.title && b.rel !== 'index.md' && !b.rel.endsWith('/index.md') && (b.tags.length > 0 || b.categories.length > 0))
      .map((b) => {
        let score = 0
        for (const tag of b.tags) if (a.tags.includes(tag)) score += 2
        if (b.categories.some((c) => a.categories.includes(c))) score += 1
        return { b, score }
      })
      .filter((s) => s.score > 0)
    scored.sort((x, y) => y.score - x.score || y.b.created.localeCompare(x.b.created) || x.b.title.localeCompare(y.b.title))
    index[a.rel] = scored.slice(0, 4).map((s) => ({
      title: s.b.title,
      link: '/' + s.b.rel.replace(/(?:(^|\/)index)?\.md$/, '$1'),
      meta: s.b.categories[0] || '',
    }))
  }
  return index
})()

/** 首页分类卡片：按目录统计文章数 + 按 created 取最新代表文章（SSR 构建期计算） */
interface HomeCategory {
  title: string
  icon: string
  count: number
  link: string
  articles: { title: string; link: string }[]
}

const HOME_CATEGORY_DEFS: { title: string; icon: string; dirs: string[]; link: string }[] = [
  { title: '移动开发', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>', dirs: ['Android', 'Kotlin', 'Flutter'], link: '/Android/' },
  { title: 'AI 与智能体', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9z"/><path d="M19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z"/></svg>', dirs: ['Ai', 'Agent'], link: '/Ai/' },
  { title: '后端技术', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>', dirs: ['Java', 'Python', 'SQL'], link: '/Java/' },
  { title: '系统与底层', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>', dirs: ['C', 'C++', 'Linux'], link: '/C/' },
  { title: '前端与脚本', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', dirs: ['JS', 'Common'], link: '/JS/' },
  { title: '算法与数据结构', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', dirs: ['数据结构和算法'], link: '/数据结构和算法/' },
]

const homeCategories: HomeCategory[] = HOME_CATEGORY_DEFS.map((def) => {
  const srcDir = join(__dirname, '..')
  const files = listMarkdownFiles(srcDir)
    .map((file) => {
      const rel = relative(srcDir, file).replace(/\\/g, '/')
      const fm = parseArticleFrontmatter(file)
      return {
        rel,
        title: String(fm.title || '').trim(),
        created: String(fm.created || fm.date || createdDates[rel] || ''),
        noindex: !!fm.noindex,
      }
    })
    .filter((a) => a.title && !/index\.md$/i.test(a.rel))
    .filter((a) => !/^\d+\.md$/.test(a.rel.split('/').pop() || ''))
    .filter((a) => def.dirs.some((d) => a.rel.startsWith(d + '/')))
  const articles = files
    .sort((a, b) => b.created.localeCompare(a.created) || a.rel.localeCompare(b.rel))
    .slice(0, 4)
    .map((a) => ({
      title: a.title,
      link: '/' + a.rel.replace(/(?:(^|\/)index)?\.md$/, '$1'),
    }))
  return { title: def.title, icon: def.icon, link: def.link, count: files.length, articles }
})
const customElements = [
  'math',
  'maction',
  'maligngroup',
  'malignmark',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mlongdiv',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'ms',
  'mscarries',
  'mscarry',
  'mscarries',
  'msgroup',
  'mstack',
  'mlongdiv',
  'msline',
  'mstack',
  'mspace',
  'msqrt',
  'msrow',
  'mstack',
  'mstack',
  'mstyle',
  'msub',
  'msup',
  'msubsup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
  'math',
  'mi',
  'mn',
  'mo',
  'ms',
  'mspace',
  'mtext',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'msqrt',
  'mstyle',
  'mmultiscripts',
  'mover',
  'mprescripts',
  'msub',
  'msubsup',
  'msup',
  'munder',
  'munderover',
  'none',
  'maligngroup',
  'malignmark',
  'mtable',
  'mtd',
  'mtr',
  'mlongdiv',
  'mscarries',
  'mscarry',
  'msgroup',
  'msline',
  'msrow',
  'mstack',
  'maction',
  'semantics',
  'annotation',
  'annotation-xml'
]


const isProduction = process.env.NODE_ENV === 'production'

/** 代码块顶栏语言展示（与 code-card-template 一致）；键为小写 */
const markdownLanguageLabel: Record<string, string> = {
  xml: 'XML',
  java: 'Java',
  kotlin: 'Kotlin',
  groovy: 'Groovy',
  gradle: 'Gradle',
  js: 'JavaScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  jsx: 'JSX',
  py: 'Python',
  python: 'Python',
  cpp: 'C++',
  c: 'C',
  cs: 'C#',
  go: 'Go',
  rs: 'Rust',
  swift: 'Swift',
  md: 'Markdown',
  mdc: 'MDC',
  vue: 'Vue',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sql: 'SQL',
  sh: 'Shell',
  bash: 'Bash',
  yaml: 'YAML',
  yml: 'YAML',
  json: 'JSON',
  toml: 'TOML',
  ini: 'INI',
  aidl: 'AIDL',
}

function prettifyFenceLang(lang: string) {
  const k = lang.toLowerCase()
  return markdownLanguageLabel[k] ?? lang.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function escapeHtmlText(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Endlessyoung's Blog",
  description: "这是endlessyoung的个人博客",
  // Cyberpunk / Sci-Fi：默认深色。Hero 霓虹渐变标题与霓虹按钮通过 --vp-home-hero-* / --vp-button-brand-*（见 theme/custom.css）
  appearance: 'dark',
  sitemap: {
    hostname: 'https://endlessyoung.github.io/Blog_',
    transformItems(items) {
      return items.filter((item) => {
        const clean = (item.url || '').replace(/^\//, '').replace(/\.html$/, '').replace(/\/index$/, '')
        return !noindexPages.has(clean)
      })
    },
  },
  base: isProduction ? '/Blog_/' : '/',
  markdown: {
    // Shiki：深色 Dracula 贴合赛博霓虹；浅色保留 one-light
    theme: {
      light: 'one-light',
      dark: 'dracula'
    },
    languageAlias: {
      'aidl': 'java',
      'kotlinscripts': 'kotlin',
      'gradle': 'groovy'
    },
    languageLabel: markdownLanguageLabel,
    /** 与 code-card-template 一致：左侧行号 gutter */
    lineNumbers: true,
    config: (md: any) => {
      md.use(markdownItKatex)
      const defaultImage = md.renderer.rules.image
      md.renderer.rules.image = (tokens: any, idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx]
        token.attrSet('loading', 'lazy')
        token.attrSet('decoding', 'async')
        return defaultImage ? defaultImage(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
      }
      const fence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens: any, idx: number, options: any, env: any, self: any) => {
        const token = tokens[idx]
        // 必须在调用原始 fence（Shiki）之前规范化：` ``` java` 的 info 带前导空格时会被当成未知语言 → 无高亮
        if (token.info) {
          token.info = String(token.info).trim().replace(/\s+/g, ' ')
        }
        const rawInfo = token.info ? String(token.info) : ''
        const info = rawInfo.split(/\s+/).find(Boolean) || ''

        // Mermaid 图表：HTML 转义后放入 div。
        // 浏览器不会解析 &lt; &gt; 为真实标签，textContent 读回时恢复原始代码。
        if (info.toLowerCase() === 'mermaid' || info.toLowerCase() === 'mmd') {
          return `<div class="mermaid"><pre>${md.utils.escapeHtml(token.content)}</pre></div>`
        }

        const html = fence ? fence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)

        let lang = info
        if (!lang) {
          const classMatch = html.match(/language-([a-z0-9_+-]+)/i)
          if (classMatch?.[1]) lang = classMatch[1]
        }
        if (!lang) return html

        const label = prettifyFenceLang(lang)
        let out = html
        /* VP 在行号模式下会生成 class="language- line-numbers-mode"，需补全 language-xxx */
        out = out.replace(/class="language-\s+/g, `class="language-${lang} `)
        out = out.replace(/class='language-\s+/g, `class='language-${lang} `)
        out = out.replace(/\bclass="language-"/g, `class="language-${lang}"`)
        out = out.replace(/\bclass='language-'/g, `class='language-${lang}'`)
        out = out.replace(/<span class="lang"><\/span>/gi, `<span class="lang">${escapeHtmlText(label)}</span>`)

        if (!out.includes('data-lang=') && !out.includes('data-language=')) {
          const replacedDouble = out.replace(/<div class="([^"]*language-[^"]*)"/, `<div class="$1" data-lang="${lang}"`)
          if (replacedDouble !== out) out = replacedDouble
          else out = out.replace(/<div class='([^']*language-[^']*)'/, `<div class='$1' data-lang="${lang}"`)
        }
        return out
      }
    }
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => customElements.includes(tag)
      }
    },
  },
  locales: {
    root: {
      label: 'Chinese',
      lang: 'zh-CN'
    }
  },
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', href: '/Blog_/favicon.ico' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'RSS', href: '/Blog_/feed.xml' }], // 也是放在/public目录中
    // Hero 霓虹标题 / 霓虹按钮：深浅色双套变量（与 theme/custom.css 双保险）
    [
      'style',
      {},
      `
html.dark {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(120deg, #00f0ff 0%, #7000ff 45%, #00ff66 100%);
  --vp-button-brand-bg: #00f0ff;
  --vp-button-brand-hover-bg: #5cffff;
  --vp-button-brand-text: #0b0f19;
  --vp-button-brand-border: #00f0ff;
  --vp-c-brand-1: #00f0ff;
  --vp-c-brand-2: #7000ff;
  --vp-c-brand-3: #00ff66;
}
html:not(.dark) {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: linear-gradient(120deg, #0e7490 0%, #6d28d9 48%, #047857 100%);
  --vp-button-brand-bg: #0891b2;
  --vp-button-brand-hover-bg: #0e7490;
  --vp-button-brand-text: #ffffff;
  --vp-button-brand-border: #0891b2;
  --vp-c-brand-1: #0891b2;
  --vp-c-brand-2: #6d28d9;
  --vp-c-brand-3: #059669;
  --vp-c-bg: #eef3f8;
  --vp-c-text-1: #0f172a;
}
      `.trim()
    ],
    ['link', { rel: 'stylesheet', href: '/Blog_/katex.min.css' }],
    ['meta', { name: 'msvalidate.01', content: 'C134079F38DF28B5CB2B9AE952C0CBC7' }],
    ['meta', { name: 'google-site-verification', content: 'bNLBnwMb4Bl-KmTweCSRTZaLa4ZRD2Z7YgqTjpUU-Hw' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    // Open Graph (global fallbacks; per-page overrides in transformHead)
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: "Endlessyoung's Blog" }],
    ['meta', { property: 'og:image', content: 'https://endlessyoung.github.io/Blog_/index.png' }],
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: 'https://endlessyoung.github.io/Blog_/index.png' }],
  ],
  transformPageData(pageData) {
    const fm = pageData.frontmatter as Record<string, any> | undefined
    // Collect noindex pages so they can be excluded from sitemap
    const key = ((pageData as any).relativePath || pageData.filePath?.replace(/^.*[\\/]docs[\\/]/, '') || '').replace(/\.md$/, '')
    if (fm?.noindex && key) noindexPages.add(key)
    // Auto-inject created date from git cache if missing in frontmatter
    if (!fm?.created) {
      if (key && createdDates[key]) {
        (pageData.frontmatter as any).created = createdDates[key]
      }
    }
  },

  transformHead(ctx) {
    const siteUrl = 'https://endlessyoung.github.io'
    const base = isProduction ? '/Blog_/' : '/'

    // Build canonical / og:url: strip .md, replace /index.html → /
    let pagePath = ctx.page.replace(/\.md$/, '.html')
    if (pagePath === 'index.html' || pagePath.endsWith('/index.html')) pagePath = pagePath.replace(/index\.html$/, '')
    const url = pagePath ? `${siteUrl}${base}${pagePath}` : `${siteUrl}${base}`

    const fm = ctx.pageData.frontmatter as Record<string, any> | undefined
    // ??/?????????frontmatter: noindex: true?
    if (fm?.noindex) {
      return [
        ['meta', { name: 'robots', content: 'noindex, nofollow' }],
      ]
    }
    const ogTitle = fm?.title || ctx.title
    const ogDescription = fm?.description || ctx.description
    const ogType = ctx.page === 'index.md' ? 'website' : 'article'

    const tags = Array.isArray(fm.tags) ? (fm.tags as string[]).join(', ') : ''
    const created = fm.created ? String(fm.created) : ''
    const lastUpdatedTs = typeof ctx.pageData.lastUpdated === 'number' ? ctx.pageData.lastUpdated : 0
    const dateModified = lastUpdatedTs ? new Date(lastUpdatedTs).toISOString() : ''
    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: ogTitle }],
      ['meta', { property: 'og:description', content: ogDescription }],
      ['meta', { property: 'og:type', content: ogType }],
      ['meta', { name: 'twitter:title', content: ogTitle }],
      ['meta', { name: 'twitter:description', content: ogDescription }],
    ]
    if (ctx.page === 'index.md') {
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: "Endlessyoung's Blog",
        url: `${siteUrl}${base}`,
        inLanguage: 'zh-CN',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}${base}?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      })])
    } else if (!ctx.page.startsWith('tags/')) {
      const articleSchema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: ogTitle,
        inLanguage: 'zh-CN',
        mainEntityOfPage: url,
        author: { '@type': 'Person', name: 'Endless Young' },
        publisher: { '@type': 'Organization', name: 'Endless Young' },
      }
      if (ogDescription) articleSchema.description = ogDescription
      if (tags) articleSchema.keywords = tags
      if (created) articleSchema.datePublished = created
      if (dateModified) articleSchema.dateModified = dateModified
      head.push(['script', { type: 'application/ld+json' }, JSON.stringify(articleSchema)])
    }
    return head
  },

  async buildEnd(siteConfig) {
    const siteUrl = 'https://endlessyoung.github.io'
    const base = '/Blog_/'
    const feedUrl = `${siteUrl}${base}`
    const md = await createMarkdownRenderer(siteConfig.srcDir, siteConfig.markdown, base, siteConfig.logger)

    const feed = new Feed({
      title: "Endlessyoung's Blog",
      description: 'Endless Young 的个人技术博客，涵盖 Android、Java、Kotlin、AI/ML、Python 等领域的原创文章。',
      id: feedUrl,
      link: feedUrl,
      language: 'zh-CN',
      image: `${siteUrl}${base}index.png`,
      favicon: `${siteUrl}${base}favicon.ico`,
      copyright: `© ${new Date().getFullYear()} Endless Young`,
      author: { name: 'Endless Young', link: feedUrl },
    })

    const articles: Array<{ title: string; url: string; created: string; html: string; excerpt: string; categories: string[] }> = []
    for (const file of listMarkdownFiles(siteConfig.srcDir)) {
      const rel = relative(siteConfig.srcDir, file).replace(/\\/g, '/')
      if (rel === 'index.md' || rel.endsWith('/index.md')) continue
      const fm = parseArticleFrontmatter(file)
      if (fm.noindex) continue
      const title = String(fm.title || '').trim()
      if (!title) continue
      const created = String(fm.created || fm.date || createdDates[rel.replace(/\.md$/, '')] || '1970-01-01')
      const body = readFileSync(file, 'utf-8').replace(/^---[\s\S]*?---\r?\n?/, '')
      const html = md.render(body)
      const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      articles.push({
        title,
        url: feedUrl + rel.replace(/\.md$/, '.html'),
        created,
        html,
        excerpt: String(fm.description || '').trim() || plain.slice(0, 200),
        categories: Array.isArray(fm.categories) ? (fm.categories as string[]).map(String) : [],
      })
    }

    articles.sort((a, b) => b.created.localeCompare(a.created))
    for (const a of articles.slice(0, 50)) {
      feed.addItem({
        title: a.title,
        id: a.url,
        link: a.url,
        description: a.excerpt,
        content: a.html,
        date: new Date(a.created),
        author: [{ name: 'Endless Young', link: feedUrl }],
        category: a.categories.map((c) => ({ name: c })),
      })
    }

    writeFileSync(join(siteConfig.outDir, 'feed.xml'), feed.rss2(), 'utf-8')
  },
  vite: {
    build: {
      // Large lazy chunks (local search index / async AI search) stay above the
      // default limit; the eager theme bundle is split via async components.
      chunkSizeWarningLimit: 1700,
    },
  },
  themeConfig: {
    related: relatedIndex,
    homeCategories,
    outline: { level: [2, 4] },
    logo: '/panda.webp',
    darkModeSwitchLabel: "🌓",
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    lightModeSwitchTitle: "Switch to light theme",
    darkModeSwitchTitle: "Switch to dark theme",
    comment: {
      serverURL: 'https://waline-service-five.vercel.app',
      lang: 'zh-cn',
      reaction: true,
      search: true,
      placeholder: '欢迎留下你的评论...',
      emoji: [
        '//unpkg.com/@waline/emojis@1.2.0/weibo',
        '//unpkg.com/@waline/emojis@1.2.0/bilibili',
        '//unpkg.com/@waline/emojis@1.2.0/tieba',
      ]
    },
    nav: [
      { text: 'Android', link: '/Android/' },
      {
        text: '编程语言',
        items: [
          { text: 'Java', link: '/Java/' },
          { text: 'Kotlin', link: '/Kotlin/' },
          { text: 'Python', link: '/Python/1' },
          { text: 'JavaScript', link: '/JS/1' },
          { text: 'C', link: '/C/1' },
          { text: 'C++', link: '/C++/1' },
        ]
      },
      { text: 'Ai', link: '/Ai/' },
      { text: 'Agent', link: '/Agent/' },
      {
        text: '数据与算法',
        items: [
          { text: '数据结构和算法', link: '/数据结构和算法/合并数组' },
          { text: 'SQL', link: '/SQL/全文搜索' },
        ]
      },
      { text: 'Flutter', link: '/Flutter/dart语言简介' },
      { text: 'Linux', link: '/Linux/Index' },
    ],

    sidebar: {
      '/Android/': [
        {
          text: 'Android基础',
          collapsed: false,
          items: [
            { text: 'Android简介', link: '/Android/Android简介' },
            { text: 'Manifest详解', link: '/Android/Manifest详解' },
            { text: '活动(Activity)', link: '/Android/Activity' },
            { text: 'Activity的启动模式', link: '/Android/Activity的启动模式' },
            { text: 'SparseArray', link: '/Android/SparseArray' },
            { text: 'RecyclerView和ListView区别', link: '/Android/RecyclerView和ListView区别' },
            { text: 'RecyclerView知识点汇总', link: '/Android/RecyclerView知识点汇总' },
            { text: 'DecorView', link: '/Android/DecorView' },
            { text: 'BottomNavigationView', link: '/Android/BottomNavigationView' },
            { text: '服务(Service)', link: '/Android/Service' },
            { text: '广播(BroadcastReceiver)', link: '/Android/BroadcastReceiver' },
            { text: '内容提供器(ContentProvider)', link: '/Android/ContentProvider' },
            { text: 'Activity栈', link: '/Android/Activity栈' },
            { text: 'Activity的生命周期详解', link: '/Android/Activity的生命周期详解' },
            { text: '进程和应用生命周期', link: '/Android/进程和应用生命周期' },
            { text: 'Parcelable和Bundle', link: '/Android/Parcelable和Bundle' },
            { text: 'Service的启动方式和区别', link: '/Android/Service的启动方式和区别' },
            { text: 'Service生命周期', link: '/Android/Service生命周期' },
            { text: 'Service 的bindService与startService混合使用场景', link: '/Android/Service 的bindService与startService混合使用场景' },
            { text: 'JobScheduler', link: '/Android/JobScheduler' },
            { text: 'Intent', link: '/Android/Intent' },
            { text: 'Fragment', link: '/Android/Fragment' },
            { text: 'Fragment几种不同的commit方法', link: '/Android/Fragment几种不同的commit方法' },
            { text: 'Fragment转场动画', link: '/Android/Fragment转场动画' },
            { text: 'setRetainInstance', link: '/Android/setRetainInstance' },
            { text: 'Handler', link: '/Android/Handler' },
            { text: 'AlarmManager', link: '/Android/AlarmManager' },
            { text: 'SurfaceView', link: '/Android/SurfaceView' },
            { text: 'AIDL', link: '/Android/AIDL' },
            { text: 'AIDL的关键字', link: '/Android/AIDL的关键字' },
            { text: 'SharedPreference', link: '/Android/SharedPreference' },
            { text: 'DataBinding', link: '/Android/DataBinding' },
            { text: 'ViewBinding', link: '/Android/ViewBinding' },
            { text: 'ViewModel 和 LiveData', link: '/Android/ViewModel 和 LiveData' },
            { text: '创建有参ViewModel', link: '/Android/创建有参ViewModel' },
            { text: '事件分发机制', link: '/Android/事件分发机制' },
            { text: 'Context', link: '/Android/Context' },
            { text: 'AssestManager', link: '/Android/AssestManager' },
            { text: 'MediaPlayer', link: '/Android/MediaPlayer' },
            { text: '安卓中的线程和线程池', link: '/Android/安卓中的线程和线程池' },
            { text: '自定义View', link: '/Android/自定义View' },
            { text: 'DataStore', link: '/Android/DataStore' },
            { text: '如何优化自定义 View 的性能', link: '/Android/如何优化自定义 View 的性能' },
            { text: 'Settings数据库', link: '/Android/Settings数据库' },
            { text: 'WorkManager', link: '/Android/WorkManager' },
            { text: '如何实现应用重启', link: '/Android/如何实现应用重启' },
            { text: '一个App会创建多少个Application对象', link: '/Android/一个App会创建多少个Application对象' },
            { text: 'Android文件系统', link: '/Android/Android文件系统' },
            { text: '获取位置信息', link: '/Android/获取位置信息' },
            { text: '安卓进程通信的方法', link: '/Android/安卓进程通信的方法' },
            { text: 'ContentProvider 的线程模型与权限控制', link: '/Android/ContentProvider 的线程模型与权限控制' },
            { text: 'AsyncTask', link: '/Android/AsyncTask' },
            { text: 'Jobservice', link: '/Android/Jobservice' },
          ],
        },
        {
          text: '组件通信',
          collapsed: false,
          items: [
            { text: 'Activity和Fragment的低耦合通信', link: '/Android/Activity和Fragment的低耦合通信' },
            { text: 'Android与Service通信', link: '/Android/Android与Service通信' },
            { text: '事件总线EventBus', link: '/Android/事件总线EventBus' },
          ],
        },
        {
          text: 'Jetpack Compose',
          collapsed: false,
          items: [
            { text: 'Compose Gradle 配置', link: '/Android/Compose/Compose的gradle配置' },
            { text: 'Compose 状态管理', link: '/Android/Compose/ComposeStateManagement' },
            { text: 'Compose 布局系统 & Modifier', link: '/Android/Compose/Compose布局系统 & Modifier' },
          ],
        },
        {
          text: 'debug与调试',
          collapsed: false,
          items: [
            { text: '安卓常见的内存泄漏点', link: '/Android/安卓常见的内存泄漏点' },
            { text: 'Fragment找不到id对应view', link: '/Android/Fragment找不到id对应view' },
            { text: 'dumpsys', link: '/Android/dumpsys' },
            { text: 'ANR问题简析', link: '/Android/ANR问题简析' },
            { text: 'Watchdog', link: '/Android/Watchdog' },
            { text: 'ADB', link: '/Android/ADB' },
            { text: 'AndroidTest编译Provider冲突问题', link: '/Android/AndroidTest编译Provider冲突问题' },
            { text: 'AndroidTest测试Service无响应问题', link: '/Android/AndroidTest测试Service无响应问题' },
            { text: '深入理解crash问题', link: '/Android/深入理解crash问题' },
            { text: 'Application为什么不能作为Dialog的context', link: '/Android/Application为什么不能作为Dialog的context' },
            { text: 'App卡顿优化', link: '/Android/App卡顿优化' },
            { text: '帧率和卡顿监控方案', link: '/Android/帧率和卡顿监控方案' },
            { text: 'Android ip 命令详解', link: '/Android/Android ip 命令详解' },
          ],
        },
        {
          text: '常见三方库',
          collapsed: false,
          items: [
            { text: '三方库面试题', link: '/Android/三方库面试题' },
            { text: 'LeakCanary原理分析', link: '/Android/LeakCanary原理分析' },
            { text: 'LeakCanary源码分析', link: '/Android/LeakCanary源码分析' },
            { text: 'Retrofit', link: '/Android/Retrofit' },
          ],
        },
        {
          text: '编译',
          collapsed: false,
          items: [
            { text: 'Android.mk', link: '/Android/Android.mk' },
            { text: '安卓类加载器', link: '/Android/安卓类加载器' },
            { text: 'APK打包流程', link: '/Android/APK打包流程' },
            { text: 'pageSize', link: '/Android/pageSize' },
          ],
        },
        {
          text: '性能优化',
          collapsed: false,
          items: [
            { text: 'RecyclerView性能优化', link: '/Android/RecyclerView性能优化' },
          ],
        },
        {
          text: 'JNI',
          collapsed: false,
          items: [
            { text: '初识JNI', link: '/Android/初识JNI' },
            { text: '安卓类加载器', link: '/Android/安卓类加载器' },
          ],
        },
        {
          text: 'Framework',
          collapsed: false,
          items: [
            { text: 'AOSP架构', link: '/Android/AOSP架构' },
            { text: 'Android进程和线程', link: '/Android/Android进程和线程' },
            { text: 'Handler、MessageQueue和Looper', link: '/Android/Handler、MessageQueue和Looper' },
            { text: 'ActivityThread线程(UI主线程)', link: '/Android/ActivityThread线程(UI主线程)' },
            { text: '为什么主线程可以直接new Handler', link: '/Android/为什么主线程可以直接new Handler' },
            { text: 'Handler.postDelayed()消息时间准确吗', link: '/Android/Handler.postDelayed()消息时间准确吗' },
            { text: 'Thread类', link: '/Android/Thread类' },
            { text: 'Notification从发送到显示的流程简析', link: '/Android/Notification从发送到显示的流程简析' },
            { text: 'ActivityManagerService', link: '/Android/ActivityManagerService' },
            { text: 'WindowManagerService', link: '/Android/WindowManagerService' },
            { text: 'Android系统启动流程', link: '/Android/Android系统启动流程' },
            { text: 'AMS如何启动App进程', link: '/Android/AMS如何启动App进程' },
            { text: 'AMS和WMS的关系', link: '/Android/AMS和WMS的关系' },
            { text: 'SystemServer进程的意义', link: '/Android/SystemServer进程的意义' },
            { text: 'setContentView之后发生了什么', link: '/Android/setContentView之后发生了什么' },
            { text: 'StartActivity之后发生了什么', link: '/Android/StartActivity之后发生了什么' },
            { text: 'Activity启动过程', link: '/Android/Activity启动过程' },
            { text: 'View的绘制过程都是用的同一个canvas吗？', link: '/Android/View的绘制过程都是用的同一个canvas吗？' },
            { text: 'onResume中获取宽高有效吗？', link: '/Android/onResume中获取宽高有效吗？' },
            { text: 'SurfaceFlinger', link: '/Android/SurfaceFlinger' },
            { text: 'PhoneWindow', link: '/Android/PhoneWindow' },
            { text: 'Binder', link: '/Android/Binder' },
            { text: 'App进程为什么天生支持Binder通信', link: '/Android/App进程为什么天生支持Binder通信' },
            { text: '进程保活', link: '/Android/进程保活' },
            { text: 'Activity中viewtree的创建过程', link: '/Android/Activity中viewtree的创建过程' },
            { text: 'WMS中窗口的注册', link: '/Android/WMS中窗口的注册' },
            { text: 'ViewRoot的基本工作方式', link: '/Android/ViewRoot的基本工作方式' },
            { text: 'ViewTree的遍历', link: '/Android/ViewTree的遍历' },
            { text: 'Zygote如何保证加载速度', link: '/Android/Zygote如何保证加载速度' },
            { text: 'Zygote进程的fork', link: '/Android/Zygote进程的fork' },
            { text: 'invalidate会触发其他View的重绘吗？', link: '/Android/invalidate会触发其他View的重绘吗？' },
          ],
        },
        {
          text: '图形渲染',
          collapsed: false,
          items: [
            { text: '图形渲染', link: '/Android/图形渲染' },
            { text: '渲染机制', link: '/Android/渲染机制' },
            { text: '深入理解图形渲染的关键角色和关系', link: '/Android/深入理解图形渲染的关键角色和关系' },
            { text: 'WindowManagerService', link: '/Android/WindowManagerService' },
            { text: 'Surface和SurfaceHolder', link: '/Android/Surface和SurfaceHolder' },
            { text: 'HWC的合成策略', link: '/Android/HWC的合成策略' },
            { text: 'Skia', link: '/Android/Skia' },
            { text: 'vulkan', link: '/Android/vulkan' },
          ],
        },
        {
          text: '序列化',
          collapsed: false,
          items: [
          ],
        },
        {
          text: '安全',
          collapsed: false,
          items: [
            { text: 'v1和v2签名机制', link: '/Android/v1和v2签名机制' },
          ],
        },
        {
          text: '安卓日志系统',
          collapsed: false,
          items: [
            { text: '日志详解', link: '/Android/日志详解' },
            { text: 'logd日志简介及典型案例分析', link: '/Android/logd日志简介及典型案例分析' },
            { text: 'EventLog日志', link: '/Android/EventLog日志' },
            { text: 'MainLog日志', link: '/Android/MainLog日志' },
            { text: 'RadioLog日志', link: '/Android/RadioLog日志' },
            { text: 'SystemLog日志', link: '/Android/SystemLog日志' },
            { text: 'CrashLog日志', link: '/Android/CrashLog日志' },
            { text: 'Trace日志', link: '/Android/Trace日志' },
          ],
        },
        {
          text: '实践',
          collapsed: false,
          items: [
            { text: '亮度调节', link: '/Android/实践-亮度调节' },
            { text: '手机所有应用', link: '/Android/实践-手机所有应用' },
            { text: 'OpenGL-纹理', link: '/Android/OpenGL-纹理' },
            { text: '路径动画', link: '/Android/实践-路径动画' },
            { text: 'recyclerview分组', link: '/Android/实践-recyclerview分组' },
            { text: 'Widget', link: '/Android/实践-Widget' },
            { text: '启动相机的方法', link: '/Android/启动相机的方法' },
            { text: '相机扭曲的解决办法', link: '/Android/相机扭曲的解决办法' },
          ],
        },
        {
          text: '进阶',
          collapsed: false,
          items: [
            { text: '安卓常见架构', link: '/Android/安卓常见架构' },
            { text: 'Intent发送数据的上限', link: '/Android/Intent发送数据的上限' },
            { text: 'Looper死循环为什么不会导致应用卡死', link: '/Android/Looper死循环为什么不会导致应用卡死' },
            { text: '如何实现定时器', link: '/Android/如何实现定时器' },
            { text: 'LiveData', link: '/Android/LiveData' },
            { text: 'AMS剖析', link: '/Android/AMS剖析' },
            { text: 'Android一个APP里面最少有几个线程', link: '/Android/Android一个APP里面最少有几个线程' },
            { text: 'Vsync机制', link: '/Android/Vsync机制' },
            { text: '实现定时循环', link: '/Android/实现定时循环' },
            { text: '安卓性能优化', link: '/Android/安卓性能优化' },
            { text: '封装阻塞的任务队列', link: '/Android/封装阻塞的任务队列' },
            { text: '后台显示toast方案', link: '/Android/后台显示toast方案' },
            { text: '多进程模式', link: '/Android/多进程模式' },
            { text: 'Bitmap优化', link: '/Android/Bitmap优化' },
          ],
        },
        {
          text: '安卓与设计模式',
          collapsed: false,
          items: [
            { text: '策略模式实现状态校验', link: '/Android/策略模式实现状态校验' },
          ],
        },
        {
          text: 'OpenGL ES',
          collapsed: false,
          items: [
            { text: 'OpenGL ES初步探索', link: '/Android/OpenGL ES初步探索' },
            { text: '坐标系统', link: '/Android/OpenGL ES坐标系统' },
            { text: '纹理', link: '/Android/OpenGL-纹理' },
          ],
        },
        {
          text: 'Gradle',
          collapsed: false,
          items: [
          ],
        },
        {
          text: 'NDK',
          collapsed: false,
          items: [
          ],
        },
      ],
      '/Ai/': [
        {
          text: '机器学习',
          collapsed: false,
          items: [
            { text: '监督学习', link: '/Ai/监督学习入门' },
            { text: '非监督学习', link: '/Ai/非监督学习' },
            { text: '数据归一化', link: '/Ai/数据归一化' },
            { text: '数据降维', link: '/Ai/数据降维' },
            { text: '正规方程及其推导', link: '/Ai/正规方程及其推导' },
            { text: '梯度下降', link: '/Ai/梯度下降' },
            { text: 'Hard sigmoid和soft sigmoid', link: '/Ai/Hard sigmoid和soft sigmoid' },
            { text: 'Rectified Linear Unit', link: '/Ai/Rectified Linear Unit' },
            { text: '深度神经网络', link: '/Ai/深度神经网络' },
            { text: '正则化', link: '/Ai/正则化方法' },
            { text: '深度学习', link: '/Ai/深度学习' },
            { text: '全连接前馈网络(FNN)', link: '/Ai/全连接前馈网络' },
            { text: '卷积神经网络(CNN)', link: '/Ai/卷积神经网络' },
            { text: '正向传播和反向传播', link: '/Ai/正向传播和反向传播' },
            { text: '决策树算法', link: '/Ai/决策树算法' },
            { text: '贝叶斯算法', link: '/Ai/贝叶斯算法' },
            { text: '随机森林算法', link: '/Ai/随机森林算法' },
            { text: '交叉熵', link: '/Ai/交叉熵' },
            { text: '生产式AI的本质', link: '/Ai/AI导论/生产式AI的本质' },
            { text: '代价函数', link: '/Ai/代价函数' },
            { text: '极限森林', link: '/Ai/极限森林' },
            { text: '欠拟合和过拟合', link: '/Ai/欠拟合和过拟合' },
          ],
        },
        {
          text: '回归算法',
          collapsed: false,
          items: [
            { text: '线性回归', link: '/Ai/线性回归' },
            { text: '多项式回归', link: '/Ai/多项式回归' },
            { text: '岭回归', link: '/Ai/岭回归' },
            { text: 'Lasso回归', link: '/Ai/Lasso回归' },
            { text: '逻辑回归', link: '/Ai/逻辑回归' },
            { text: '弹性网络回归', link: '/Ai/弹性网络回归' },
            { text: '支持向量回归(SVR)', link: '/Ai/支持向量回归(SVR)' },
            { text: '神经网络回归', link: '/Ai/神经网络回归' },
          ],
        },
        {
          text: '聚类算法',
          collapsed: false,
          items: [
            { text: '聚类算法', link: '/Ai/聚类算法' },
            { text: 'K-means', link: '/Ai/K-means' },
            { text: 'DESCAN', link: '/Ai/DESCAN' },
            { text: '层次聚类', link: '/Ai/层次聚类' },
          ],
        },
        {
          text: 'Pytorch',
          collapsed: false,
          items: [
          ],
        },
      ],
      '/Agent/': [
        {
          text: 'Agent 基础',
          collapsed: false,
          items: [
            { text: 'Agent 开发总览', link: '/Agent/' },
            { text: 'Agent 基础概念', link: '/Agent/基础概念' },
            { text: 'Agent 架构模式', link: '/Agent/架构模式' },
            { text: '提示词工程', link: '/Agent/提示词工程' },
            { text: 'Function Calling', link: '/Agent/FunctionCalling' },
            { text: '记忆系统', link: '/Agent/记忆系统' },
          ],
        },
        {
          text: '框架与工具',
          collapsed: false,
          items: [
            { text: 'LangChain', link: '/Agent/LangChain' },
            { text: 'LangGraph', link: '/Agent/LangGraph' },
            { text: 'CrewAI / AutoGen', link: '/Agent/CrewAI-AutoGen' },
            { text: 'ADK', link: '/Agent/ADK' },
            { text: 'MCP', link: '/Agent/MCP' },
            { text: 'Dify', link: '/Agent/Dify' },
          ],
        },
        {
          text: '知识与推理',
          collapsed: false,
          items: [
            { text: '知识图谱', link: '/Agent/知识图谱' },
            { text: 'RAG', link: '/Agent/RAG' },
            { text: 'Chunking', link: '/Agent/Chunking' },
            { text: 'Embedding', link: '/Agent/Embedding' },
            { text: 'Agent Skill', link: '/Agent/Skill' },
            { text: 'Tool Use', link: '/Agent/ToolUse' },
          ],
        },
        {
          text: '实践进阶',
          collapsed: false,
          items: [
            { text: 'Multi-Agent', link: '/Agent/MultiAgent' },
            { text: '工作流设计', link: '/Agent/工作流设计' },
            { text: '评估与监控', link: '/Agent/评估监控' },
            { text: '可观测性', link: '/Agent/可观测性' },
            { text: 'Agent 安全', link: '/Agent/Agent安全' },
          ],
        },
      ],
      '/JS/': [
        {
          text: 'JS',
          collapsed: false,
          items: [
          ],
        },
      ],
      '/数据结构和算法/': [
        {
          text: '简单题',
          collapsed: false,
          items: [
            { text: '合并数组', link: '/数据结构和算法/合并数组' },
            { text: '移除元素', link: '/数据结构和算法/移除元素' },
            { text: '二分查找', link: '/数据结构和算法/二分查找' },
          ],
        },
        {
          text: '位运算',
          collapsed: false,
          items: [
            { text: '异或运算', link: '/数据结构和算法/异或运算' },
          ],
        },
      ],
      '/Java/': [
        {
          text: 'Java基础',
          collapsed: false,
          items: [
            { text: 'Integer1000与100的比较', link: '/Java/Integer1000与100的比较' },
            { text: '动态代理', link: '/Java/动态代理' },
            { text: '反射', link: '/Java/反射' },
            { text: 'HashMap', link: '/Java/HashMap' },
            { text: '类之间的关系', link: '/Java/类之间的关系' },
          ],
        },
        {
          text: 'Java并发',
          collapsed: false,
          items: [
            { text: 'ThreadLocal', link: '/Java/ThreadLocal' },
            { text: 'CAS', link: '/Java/CAS' },
            { text: '线程池', link: '/Java/线程池' },
            { text: 'ForkJoinPool', link: '/Java/ForkJoinPool' },
            { text: 'Java如何保证线程T1，T2，T3 顺序执行', link: '/Java/Java如何保证线程T1，T2，T3 顺序执行' },
            { text: 'CompletableFuture', link: '/Java/CompletableFuture' },
            { text: 'volatile和synchronize的区别', link: '/Java/volatile和synchronize的区别' },
            { text: '线程池核心线程空闲时处于什么状态', link: '/Java/线程池核心线程空闲时处于什么状态' },
          ],
        },
        {
          text: 'JVM',
          collapsed: false,
          items: [
            { text: 'JVM概述', link: '/Java/JVM概述' },
            { text: 'JVM分区', link: '/Java/JVM分区' },
            { text: 'String的intern方法', link: '/Java/String的intern方法' },
            { text: '对象初始化流程', link: '/Java/对象初始化流程' },
            { text: 'GC算法', link: '/Java/GC算法' },
            { text: '伊甸园区算法', link: '/Java/伊甸园区算法' },
            { text: '分代模型的六种垃圾回收器', link: '/Java/分代模型的六种垃圾回收器' },
            { text: '浮动垃圾', link: '/Java/浮动垃圾' },
            { text: '三色标记算法', link: '/Java/三色标记算法' },
            { text: '双亲委派机制', link: '/Java/双亲委派机制' },
          ],
        },
      ],
      '/Kotlin/': [
        {
          text: 'kotlin基础',
          collapsed: false,
          items: [
            { text: '集合', link: '/Kotlin/集合' },
            { text: '作用域函数', link: '/Kotlin/作用域函数' },
            { text: '范围表达式', link: '/Kotlin/范围表达式' },
            { text: '编译时常量', link: '/Kotlin/编译时常量' },
            { text: '主构造函数和次构造函数', link: '/Kotlin/主构造函数和次构造函数' },
            { text: '泛型', link: '/Kotlin/泛型' },
            { text: '类型擦除', link: '/Kotlin/类型擦除' },
            { text: 'reified', link: '/Kotlin/reified' },
            { text: '逆变和协变', link: '/Kotlin/逆变和协变' },
            { text: '序列', link: '/Kotlin/序列' },
            { text: '类别名', link: '/Kotlin/类别名' },
            { text: '操作符重载', link: '/Kotlin/操作符重载' },
            { text: '数据类', link: '/Kotlin/数据类' },
            { text: '内联函数', link: '/Kotlin/内联函数' },
            { text: '中缀函数', link: '/Kotlin/中缀函数' },
            { text: 'Any和Unit以及Nothing', link: '/Kotlin/Any和Unit以及Nothing' },
            { text: '初始化数组', link: '/Kotlin/初始化数组' },
            { text: '延迟初始化属性', link: '/Kotlin/延迟初始化属性' },
            { text: '扩展函数', link: '/Kotlin/扩展函数' },
            { text: 'sealed类', link: '/Kotlin/sealed类' },
            { text: '高阶函数', link: '/Kotlin/高阶函数' },
            { text: '委托', link: '/Kotlin/委托' },
            { text: 'Lambda表达式', link: '/Kotlin/Lambda表达式' },
            { text: 'lateinit和lazy', link: '/Kotlin/lateinit和lazy' },
            { text: '对象表达式和对象声明有什么区别', link: '/Kotlin/对象表达式和对象声明有什么区别' },
            { text: '顶层函数', link: '/Kotlin/顶层函数' },
            { text: '可见性修饰符', link: '/Kotlin/可见性修饰符' },
            { text: 'by lazy和lazy', link: '/Kotlin/by lazy和lazy' },
            { text: '协程', link: '/Kotlin/协程' },
            { text: 'Object关键字', link: '/Kotlin/Object关键字' },
            { text: 'Kotlin中的挂起函数', link: '/Kotlin/Kotlin中的挂起函数' },
          ],
        },
        {
          text: '协程',
          collapsed: false,
          items: [
            { text: '协程', link: '/Kotlin/协程' },
            { text: '协程作用域', link: '/Kotlin/协程作用域' },
            { text: '协程Job', link: '/Kotlin/协程Job' },
            { text: 'coroutineContext', link: '/Kotlin/coroutineContext' },
            { text: '协程的异常处理', link: '/Kotlin/协程的异常处理' },
            { text: 'Channel', link: '/Kotlin/Channel' },
            { text: 'Mutex', link: '/Kotlin/Mutex' },
            { text: '协程上下文', link: '/Kotlin/协程上下文' },
            { text: '高并发场景下的协程调度与调优', link: '/Kotlin/高并发场景下的协程调度与调优' },
            { text: '协程生命周期', link: '/Kotlin/协程生命周期' },
          ],
        },
        {
          text: 'Flow',
          collapsed: false,
          items: [
            { text: 'Flow', link: '/Kotlin/Flow' },
          ],
        },
      ],
      '/Python/': [
        {
          text: 'python基础',
          collapsed: false,
          items: [
          ],
        },
        {
          text: 'numpy',
          collapsed: false,
          items: [
            { text: 'numpy的常用方法', link: '/Python/numpy的常用方法' },
          ],
        },
        {
          text: 'ski-learn',
          collapsed: false,
          items: [
          ],
        },
        {
          text: 'pytorch',
          collapsed: false,
          items: [
          ],
        },
      ],
      '/Flutter/': [
        {
          text: 'dart语言简介',
          collapsed: false,
          items: [
            { text: 'dart语言简介', link: '/Flutter/dart语言简介' },
          ],
        },
      ],
      '/SQL/': [
        {
          text: 'SQL基础',
          collapsed: false,
          items: [
            { text: 'SQL简介', link: '/SQL/SQL基础/SQL简介' },
          ],
        },
        {
          text: 'SQL',
          collapsed: false,
          items: [
            { text: '全文搜索', link: '/SQL/全文搜索' },
          ],
        },
      ],
      '/C/': [
        {
          text: 'C',
          collapsed: false,
          items: [
          ],
        },
      ],
      '/C++/': [
        {
          text: 'C++',
          collapsed: false,
          items: [
            { text: '头文件的声明规范', link: '/C++/头文件的声明规范' },
            { text: '模板', link: '/C++/模板' },
          ],
        },
      ],
      '/Linux/': [
        {
          text: 'Linux',
          collapsed: false,
          items: [
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/endlessYoung' }
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2019-present <a href="https://github.com/endlessYoung">Endless Young</a>'
    }
  }
})
