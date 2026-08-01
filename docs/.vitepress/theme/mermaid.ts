import mermaid from 'mermaid'
import { openViewer } from './imageViewer'

/** ???Cyberpunk??????? Dracula / Cyberpunk ???? */
const DARK_THEME = {
  theme: 'base' as const,
  themeVariables: {
    primaryColor: '#7000ff33',
    primaryTextColor: '#f8f8f2',
    primaryBorderColor: '#00f0ff',
    secondaryColor: '#282a3688',
    secondaryTextColor: '#bdc3d0',
    secondaryBorderColor: '#6272a4',
    tertiaryColor: '#1e1e2e88',
    tertiaryTextColor: '#a0a8b8',
    tertiaryBorderColor: '#00ff6688',
    lineColor: '#00f0ff',
    textColor: '#f8f8f2',
    background: 'transparent',
    mainBkg: '#1a1a2e88',
    nodeBorder: '#00f0ff',
    clusterBkg: '#282a3644',
    clusterBorder: '#7000ff88',
    titleColor: '#00f0ff',
    edgeLabelBackground: '#1a1a2e',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  securityLevel: 'loose' as const,
  startOnLoad: false,
}

/** ??????????????????? */
const LIGHT_THEME = {
  theme: 'base' as const,
  themeVariables: {
    primaryColor: '#7c3aed22',
    primaryTextColor: '#1e293b',
    primaryBorderColor: '#6d28d9',
    secondaryColor: '#e2e8f0aa',
    secondaryTextColor: '#475569',
    secondaryBorderColor: '#94a3b8',
    tertiaryColor: '#f1f5f999',
    tertiaryTextColor: '#64748b',
    tertiaryBorderColor: '#05966988',
    lineColor: '#0e7490',
    textColor: '#1e293b',
    background: 'transparent',
    mainBkg: '#ffffff',
    nodeBorder: '#6d28d9',
    clusterBkg: '#f1f5f9aa',
    clusterBorder: '#7c3aed88',
    titleColor: '#0e7490',
    edgeLabelBackground: '#ffffff',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  securityLevel: 'loose' as const,
  startOnLoad: false,
}

let lastTheme: 'dark' | 'light' | null = null
let themeObserver: MutationObserver | null = null

function currentTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function serializeSvg(el: HTMLElement): string | null {
  const svg = el.querySelector('svg')
  if (!svg) return null
  const xml = new XMLSerializer().serializeToString(svg)
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
}

/** ?????? ImageViewer ????? */
function bindClickToOpen(el: HTMLElement): void {
  if (el.dataset.viewerBound) return
  el.dataset.viewerBound = 'true'
  el.addEventListener('click', (event) => {
    if (event.target instanceof SVGElement && (event.target as SVGElement).closest('a')) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const src = serializeSvg(el)
    if (!src) return
    openViewer([{ src, alt: 'Mermaid ??' }], 0)
  })
}

/** ????????????????????? */
function watchTheme(): void {
  if (typeof document === 'undefined' || themeObserver) return
  themeObserver = new MutationObserver(() => {
    const theme = currentTheme()
    if (lastTheme !== null && lastTheme !== theme) {
      void initMermaid(true)
    }
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

/** ?????????? .mermaid ????? Mermaid ?? */
export async function initMermaid(force = false): Promise<void> {
  if (typeof document === 'undefined') return

  const theme = currentTheme()
  if (lastTheme !== null && lastTheme !== theme) force = true
  lastTheme = theme

  let els = Array.from(document.querySelectorAll<HTMLElement>('.mermaid'))
  if (force) {
    // ??????????????????
    els = els.filter((el) => el.getAttribute('data-processed') !== 'error')
    for (const el of els) {
      const source = el.dataset.source
      if (source) {
        el.textContent = source
        delete el.dataset.source
      }
      el.removeAttribute('data-processed')
    }
    els = Array.from(document.querySelectorAll<HTMLElement>('.mermaid'))
  }

  els = els.filter((el) => !el.getAttribute('data-processed'))
  if (els.length === 0) return

  mermaid.initialize(theme === 'dark' ? DARK_THEME : LIGHT_THEME)

  for (const el of els) {
    const code = el.textContent?.trim() || ''
    if (!code) continue
    el.dataset.source = code

    try {
      // ? mermaid.render() ?? SVG ??? DOM??? v11
      const { svg } = await mermaid.render(`mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, code)
      el.innerHTML = svg
      el.setAttribute('data-processed', 'true')
      bindClickToOpen(el)
    } catch (err: any) {
      console.error(`[mermaid] ????:
${code}

??:`, err?.message ?? err)
      // ??????????????????
      el.innerHTML = `<pre style="color:#ff6b6b;white-space:pre-wrap;font-size:13px">${escapeHtml(code)}</pre>`
      el.setAttribute('data-processed', 'error')
    }
  }

  watchTheme()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
