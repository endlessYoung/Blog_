const INDEX_STOP = new Set([
  'a', 'an', 'the', 'of', 'and', 'or', 'to', 'for', 'with', 'from', 'in', 'on',
  'by', 'new', 'getting', 'started', 'example', 'examples', 'markdown',
  'unit', 'hard', 'soft', 'linear', 'rectified', 'means',
])

export function keepIndexTerm(tag: string) {
  const name = tag.trim()
  if (!name) return false
  if (/^t\d+$/i.test(name)) return false
  if (/^v\d+$/i.test(name)) return false
  return !INDEX_STOP.has(name.toLowerCase())
}
