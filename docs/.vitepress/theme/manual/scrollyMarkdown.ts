// ::::scrolly / :::step / :::note
// The article body stays markdown. These containers are the only slots a figure page uses.

type Token = { type: string; nesting: number; info: string }

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stepIndex(tokens: Token[], idx: number) {
  let depth = 0
  let count = 0
  for (let i = 0; i < idx; i++) {
    const token = tokens[i]
    if (token.type === 'container_scrolly_open') depth++
    else if (token.type === 'container_scrolly_close') depth--
    else if (depth > 0 && token.type === 'container_step_open') count++
  }
  return count
}

function container(md: any, name: string, minMarkers: number, render: (tokens: Token[], idx: number) => string) {
  const least = minMarkers
  const markerChar = ':'.charCodeAt(0)

  function rule(state: any, startLine: number, endLine: number, silent: boolean) {
    let pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]
    if (pos >= max || state.src.charCodeAt(pos) !== markerChar) return false
    const markerStart = pos
    pos = state.skipChars(pos, markerChar)
    const markerLen = pos - markerStart
    if (markerLen < least) return false
    const params = state.src.slice(pos, max)
    if (params.trim().split(/\s+/, 1)[0] !== name) return false
    if (silent) return true

    let nextLine = startLine
    let closed = false
    for (;;) {
      nextLine++
      if (nextLine >= endLine) break
      let closePos = state.bMarks[nextLine] + state.tShift[nextLine]
      const closeMax = state.eMarks[nextLine]
      if (closePos < closeMax && state.sCount[nextLine] < state.blkIndent) break
      if (state.src.charCodeAt(closePos) !== markerChar) continue
      if (state.sCount[nextLine] - state.blkIndent >= 4) continue
      const closeStart = closePos
      closePos = state.skipChars(closePos, markerChar)
      if (closePos - closeStart < markerLen) continue
      closePos = state.skipSpaces(closePos)
      if (closePos < closeMax) continue
      closed = true
      break
    }

    const parent = state.parentType
    const lineMax = state.lineMax
    state.parentType = 'container'
    state.lineMax = nextLine
    const tokenOpen = state.push(`container_${name}_open`, 'div', 1)
    tokenOpen.markup = state.src.slice(markerStart, markerStart + markerLen)
    tokenOpen.block = true
    tokenOpen.info = params
    tokenOpen.map = [startLine, nextLine]
    state.md.block.tokenize(state, startLine + 1, nextLine)
    const tokenClose = state.push(`container_${name}_close`, 'div', -1)
    tokenClose.markup = tokenOpen.markup
    tokenClose.block = true
    state.parentType = parent
    state.lineMax = lineMax
    state.line = nextLine + (closed ? 1 : 0)
    return true
  }

  md.block.ruler.before('fence', `container_${name}`, rule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list'],
  })
  md.renderer.rules[`container_${name}_open`] = render
  md.renderer.rules[`container_${name}_close`] = render
}

export function scrollyMarkdown(md: any) {
  container(md, 'step', 3, (tokens, idx) => {
    if (tokens[idx].nesting !== 1) return '</section>\n'
    const label = tokens[idx].info.replace(/^\s*step\s*/, '').trim()
    const index = stepIndex(tokens, idx)
    const active = index === 0 ? ' active' : ''
    return `<section class="cas-step${active}" data-step="${index}"><span class="mono">${escapeHtml(label)}</span>\n`
  })
  container(md, 'scrolly', 4, (tokens, idx) => (
    tokens[idx].nesting === 1 ? '<ManualScrolly>\n' : '</ManualScrolly>\n'
  ))
  container(md, 'note', 3, (tokens, idx) => {
    if (tokens[idx].nesting !== 1) return '</aside>\n'
    const label = tokens[idx].info.replace(/^\s*note\s*/, '').trim()
    return `<aside class="cas-note"><span class="mono">NOTE · ${escapeHtml(label)}</span>\n`
  })
}
