export type FigKind = 'cas' | 'bin' | 'gen' | 'loop' | 'gc' | 'rv' | 'sort' | 'glide'

export const FIG_DEFS: { title: string; kind: FigKind; caption: string }[] = [
  { title: 'CAS', kind: 'cas', caption: '两个线程竞争同一个变量' },
  { title: '伊甸园区算法', kind: 'gen', caption: '对象在分代之间的流动与晋升' },
  { title: 'GC算法', kind: 'gc', caption: '同一段内存，清除、复制、整理' },
  { title: '二分查找', kind: 'bin', caption: '指针收敛到目标元素' },
  { title: 'Handler', kind: 'loop', caption: 'Looper 不断从队列取出消息' },
  { title: 'RecyclerView四级缓存', kind: 'rv', caption: '同一块 ViewHolder，按四级往下找' },
  { title: '常见的排序方法', kind: 'sort', caption: '同一段数组，五种排法' },
  { title: 'Glide四级缓存', kind: 'glide', caption: '活动资源、内存、磁盘双层，四级依次回退' },
]

export function figureFor(title: string) {
  return FIG_DEFS.find((item) => item.title === title)
}
