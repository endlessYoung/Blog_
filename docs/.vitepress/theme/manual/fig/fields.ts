export interface FigFrame {
  fields: Record<string, string>
  lines: number[]
}

const FIELD = /^([a-z][a-z0-9-]*):\s*(.*)$/

export function parseFieldBlock(content: string): Record<string, string> | null {
  const lines = content.split('\n').filter((line) => line.trim().length > 0)
  if (!lines.length || !lines.every((line) => FIELD.test(line))) return null
  const fields: Record<string, string> = {}
  for (const line of lines) {
    const match = FIELD.exec(line)
    if (!match) return null
    fields[match[1]] = match[2].trim()
  }
  return fields
}

export function parseLineSpec(value: string): number[] {
  const lines: number[] = []
  for (const part of value.split(',')) {
    const piece = part.trim()
    if (!piece) continue
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(piece)
    if (range) {
      const start = Number(range[1])
      const end = Number(range[2])
      const lo = Math.min(start, end)
      const hi = Math.max(start, end)
      for (let n = lo; n <= hi; n++) lines.push(n)
      continue
    }
    if (/^\d+$/.test(piece)) lines.push(Number(piece))
  }
  return lines
}

export function readScrolly(host: HTMLElement): { code: string[]; frames: FigFrame[] } {
  const src = host.querySelector<HTMLElement>(':scope .cas-steps > .fig-code-src')
  const code = src ? src.textContent.replace(/\n$/, '').split('\n') : []
  src?.remove()
  const frames = [...host.querySelectorAll<HTMLElement>(':scope .cas-steps > .cas-step')].map((step) => {
    const fields: Record<string, string> = {}
    for (const attr of [...step.attributes]) {
      if (!attr.name.startsWith('data-') || attr.name === 'data-step') continue
      fields[attr.name.slice(5)] = attr.value
    }
    return { fields, lines: parseLineSpec(fields.lines || '') }
  })
  return { code, frames }
}
