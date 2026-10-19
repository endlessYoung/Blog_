const MANUAL = /^(?:\d+(?:\.\d+)*|[一二三四五六七八九十百]+)[.、．]\s*/

function stripManual(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node && !(node.textContent || '').trim()) node = walker.nextNode()
  if (!node?.textContent) return
  const next = node.textContent.replace(MANUAL, '')
  if (next === node.textContent) return
  const rest = (el.textContent || '').replace(node.textContent, next)
  if (rest.trim()) node.textContent = next
}

export interface HeadingMark {
  el: HTMLElement
  id: string
  title: string
  level: number
  no: string
}

// h2 is 1, h3 is 1.1, h4 is 1.1.1, h5 is 1.1.1.1.
// If an article never uses h2, the shallowest heading it does use is 1.
// A skipped level is filled so the number never contains 0.
export function markHeadings(root: ParentNode): HeadingMark[] {
  const heads = [...root.querySelectorAll<HTMLElement>('h2, h3, h4, h5')]
  const min = heads.reduce((n, el) => Math.min(n, Number(el.tagName.slice(1))), 5)
  const counts = [0, 0, 0, 0]
  return heads.map((el, i) => {
    const depth = Math.min(3, Number(el.tagName.slice(1)) - min)
    for (let d = 0; d < depth; d++) if (counts[d] === 0) counts[d] = 1
    counts[depth] += 1
    for (let d = depth + 1; d < counts.length; d++) counts[d] = 0
    const no = counts.slice(0, depth + 1).join('.')
    if (!el.id) el.id = `sec-${i}`
    el.dataset.no = no
    stripManual(el)
    return {
      el,
      id: el.id,
      title: (el.textContent || '').replace(/[\u200b#]/g, '').trim(),
      level: Number(el.tagName.slice(1)),
      no,
    }
  })
}
