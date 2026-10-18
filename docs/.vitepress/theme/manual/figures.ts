export type FigKind = 'cas' | 'bin' | 'gen' | 'loop'

export const FIG_DEFS: { title: string; kind: FigKind; caption: string }[] = [
  { title: 'CAS', kind: 'cas', caption: '两个线程竞争同一个变量' },
  { title: '伊甸园区算法', kind: 'gen', caption: '对象在分代之间的流动与晋升' },
  { title: '二分查找', kind: 'bin', caption: '指针收敛到目标元素' },
  { title: 'Handler', kind: 'loop', caption: 'Looper 不断从队列取出消息' },
]

export function figureFor(title: string) {
  return FIG_DEFS.find((item) => item.title === title)
}
