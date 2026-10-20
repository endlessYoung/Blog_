// ::::scrolly name / :::step / :::note
// A fence directly inside a scrolly is that figure's source. It is not rendered in the reading column.
// A step may start with `key: value` lines and a blank line. `lines` accepts `2, 4` and `5-9`.
// Any other key is data for the board registered under the page's figure kind.

import { parseFieldBlock } from './fig/fields'

type Token = { type: string; nesting: number; info: string; content?: string; meta?: { fields?: Record<string, string>; figCode?: boolean } }

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stepIndex(tokens: Token[], idx: number) {
  let count = 0
  for (let i = idx - 1; i >= 0; i--) {
    const token = tokens[i]
    if (token.type === 'container_scrolly_open') return count
    if (token.type === 'container_step_open') count++
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

function annotate(state: { tokens: Token[] }) {
  const tokens = state.tokens
  let scrolly = 0
  let step = 0
  for (const token of tokens) {
    if (token.type === 'container_scrolly_open') scrolly++
    else if (token.type === 'container_scrolly_close') scrolly--
    else if (token.type === 'container_step_open') step++
    else if (token.type === 'container_step_close') step--
    else if (scrolly > 0 && step === 0 && token.type === 'fence') {
      token.meta = { ...token.meta, figCode: true }
    }
  }
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'container_step_open') continue
    const fields: Record<string, string> = {}
    let cursor = i + 1
    while (cursor < tokens.length && tokens[cursor].type === 'paragraph_open') {
      const inline = tokens[cursor + 1]
      const close = tokens[cursor + 2]
      if (!inline || inline.type !== 'inline' || !close || close.type !== 'paragraph_close') break
      const parsed = parseFieldBlock(inline.content || '')
      if (!parsed) break
      Object.assign(fields, parsed)
      tokens.splice(cursor, 3)
    }
    if (Object.keys(fields).length) tokens[i].meta = { ...tokens[i].meta, fields }
  }
}

function fieldAttrs(token: Token) {
  const fields = token.meta?.fields
  if (!fields) return ''
  return Object.entries(fields).map(([key, value]) => ` data-${escapeHtml(key)}="${escapeHtml(value)}"`).join('')
}

export function scrollyMarkdown(md: any) {
  md.core.ruler.after('block', 'scrolly-annotate', annotate)
  container(md, 'step', 3, (tokens, idx) => {
    if (tokens[idx].nesting !== 1) return '</section>\n'
    const label = tokens[idx].info.replace(/^\s*step\s*/, '').trim()
    const index = stepIndex(tokens, idx)
    const active = index === 0 ? ' active' : ''
    return `<section class="cas-step${active}" data-step="${index}"${fieldAttrs(tokens[idx])}><span class="mono">${escapeHtml(label)}</span>\n`
  })
  container(md, 'scrolly', 4, (tokens, idx) => {
    if (tokens[idx].nesting !== 1) return '</ManualScrolly>\n'
    const name = tokens[idx].info.replace(/^\s*scrolly\s*/, '').trim().split(/\s+/)[0] || ''
    return name ? `<ManualScrolly name="${escapeHtml(name)}">\n` : '<ManualScrolly>\n'
  })
  container(md, 'note', 3, (tokens, idx) => {
    if (tokens[idx].nesting !== 1) return '</aside>\n'
    const label = tokens[idx].info.replace(/^\s*note\s*/, '').trim()
    return `<aside class="cas-note"><span class="mono">NOTE · ${escapeHtml(label)}</span>\n`
  })
}
