import mermaid from 'mermaid'

/** 与博客 Dracula / Cyberpunk 风格统一的 Mermaid 主题变量 */
const CYBERPUNK_THEME = {
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

let initialized = false

/** 扫描页面中尚未渲染的 .mermaid 元素并交给 Mermaid 渲染 */
export async function initMermaid(): Promise<void> {
  if (typeof document === 'undefined') return

  const els = document.querySelectorAll<HTMLElement>('.mermaid:not([data-processed])')
  if (els.length === 0) return

  if (!initialized) {
    mermaid.initialize(CYBERPUNK_THEME)
    initialized = true
  }

  // 逐个渲染：textContent 会自动反转义 HTML 实体，所以 <br/> 能完整保留
  for (const el of els) {
    const code = el.textContent?.trim() || ''
    if (!code) continue

    try {
      // 用 mermaid.render() 生成 SVG 再注入 DOM，兼容 v11
      const { svg } = await mermaid.render(`mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, code)
      el.innerHTML = svg
      el.setAttribute('data-processed', 'true')
    } catch (err: any) {
      console.error(`[mermaid] 渲染失败:\n${code}\n\n错误:`, err?.message ?? err)
      // 渲染失败时回退显示原始代码，方便排查
      el.innerHTML = `<pre style="color:#ff6b6b;white-space:pre-wrap;font-size:13px">${escapeHtml(code)}</pre>`
      el.setAttribute('data-processed', 'error')
    }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
