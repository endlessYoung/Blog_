export type Zone = 'eden' | 's0' | 's1' | 'old'

export interface GuidedBeat {
  label: string
  text: string
  extra?: string
  log: string
}

export interface GenBeat extends GuidedBeat {
  a: Zone
  showB: boolean
  age: string
  gc: boolean
}

export interface BinBeat extends GuidedBeat {
  lo: number
  hi: number
  mid: number
  found: boolean
}

export type LoopPhase = 'build' | 'queue' | 'next' | 'take' | 'handle' | 'rest'

export type GcPhase = 'heap' | 'mark' | 'sweep' | 'copy' | 'compact'

export interface LoopBeat extends GuidedBeat {
  phase: LoopPhase
}

export interface GcBeat extends GuidedBeat {
  phase: GcPhase
}

export const BIN_VALUES = [3, 7, 11, 14, 18, 21, 25, 29, 33, 36, 40, 44]
export const BIN_TARGET = 29

export const GEN_BEATS: GenBeat[] = [
  {
    label: '01 · 分配',
    text: '新对象先进伊甸园区。A 仍被引用，B 创建完就没有引用了。',
    log: 'A、B 进入 <b>Eden</b>。B 已经没有引用。',
    a: 'eden',
    showB: true,
    age: '0',
    gc: false,
  },
  {
    label: '02 · Minor GC',
    text: '伊甸园区放满后触发 Minor GC。回收器找出还有引用的对象，没有引用的对象被回收。',
    log: 'Minor GC：<b>B</b> 没有引用，回收。A 仍然存活。',
    a: 'eden',
    showB: false,
    age: '0',
    gc: true,
  },
  {
    label: '03 · 复制到 S0',
    text: '存活对象从伊甸园区复制到空着的幸存者区，年龄加 1。伊甸园区被清空。',
    log: 'A 复制到 <b>S0</b>，年龄变为 1。Eden 清空。',
    a: 's0',
    showB: false,
    age: '1',
    gc: false,
  },
  {
    label: '04 · 换到 S1',
    text: '下一次 Minor GC，A 还活着，就从 S0 复制到 S1，年龄再加 1。S0 被清空。两个幸存者区轮流担任“空的那一个”。',
    log: 'A 从 S0 复制到 <b>S1</b>，年龄变为 2。S0 清空。',
    a: 's1',
    showB: false,
    age: '2',
    gc: false,
  },
  {
    label: '05 · 年龄增加',
    text: '之后每次 Minor GC，A 都在 S0 和 S1 之间复制一次，年龄加一。中间这些次这里不再逐次展开。',
    log: 'A 仍在幸存者区之间复制。年龄来到 <b>14</b>，还没到晋升阈值。',
    a: 's0',
    showB: false,
    age: '14',
    gc: false,
  },
  {
    label: '06 · 晋升',
    text: '年龄达到 MaxTenuringThreshold（默认 15）后，A 被移到老年代。长期存活的对象不再参与年轻代的每次复制。',
    log: '年龄达到 <b>15</b>，A 晋升到 <b>Old</b>。',
    a: 'old',
    showB: false,
    age: '15',
    gc: false,
  },
]

export const BIN_BEATS: BinBeat[] = [
  {
    label: '01 · 准备',
    text: '数组已经升序。要找的是 29。left 指向开头，right 指向末尾，查找范围是整段。',
    log: '目标 <b>29</b>。left = 0，right = 11。',
    lo: 0,
    hi: 11,
    mid: -1,
    found: false,
  },
  {
    label: '02 · 第一次中点',
    text: 'mid = left + (right - left) / 2 = 5，对应的值是 21。21 小于 29，目标只可能在右半段，left 移到 mid + 1。',
    log: 'nums[5] = 21 &lt; 29，<b>left = 6</b>。',
    lo: 6,
    hi: 11,
    mid: 5,
    found: false,
  },
  {
    label: '03 · 丢掉右半',
    text: '新的中点是 8，值是 33。33 大于 29，right 移到 mid - 1。左半那些比 21 还小的位置已经不在范围内。',
    log: 'nums[8] = 33 &gt; 29，<b>right = 7</b>。',
    lo: 6,
    hi: 7,
    mid: 8,
    found: false,
  },
  {
    label: '04 · 再收一次',
    text: '现在范围内只剩 25 和 29。中点取到 25，仍然小于目标，left 再往右移一格。',
    log: 'nums[6] = 25 &lt; 29，<b>left = 7</b>。',
    lo: 7,
    hi: 7,
    mid: 6,
    found: false,
  },
  {
    label: '05 · 命中',
    text: 'left 和 right 重合在 29 上。中点的值等于目标，返回下标 7。十二个元素只比较了四次。',
    log: 'nums[7] = 29，<b>找到了</b>，返回 7。',
    lo: 7,
    hi: 7,
    mid: 7,
    found: true,
  },
]

export const LOOP_BEATS: LoopBeat[] = [
  {
    label: '01 · 构造消息',
    text: '工作线程不能直接改界面。它构造一条 Message，target 指向主线程的 Handler。这时消息还没进队列。',
    log: '工作线程构造 <b>UI</b>，target 是主线程 Handler。',
    phase: 'build',
  },
  {
    label: '02 · 入队',
    text: 'enqueueMessage 按 when 把消息插进 MessageQueue。队列里现在有 UI、LOG、SAVE，头部是最先该处理的 UI。',
    log: '三条消息按时间进入 <b>MessageQueue</b>，头部是 UI。',
    phase: 'queue',
  },
  {
    label: '03 · next',
    text: '主线程的 Looper.loop 一直在执行。它调用 queue.next()。队列空的时候，next() 会停在这里，直到有消息进来。',
    log: '<b>Looper</b> 调用 queue.next()，取到头部的 UI。',
    phase: 'next',
  },
  {
    label: '04 · 取出',
    text: 'next() 把 UI 从链表上摘下来，交给 Looper。队列里剩下 LOG 和 SAVE。',
    log: 'UI 离开队列，到了 <b>Looper</b> 手里。',
    phase: 'take',
  },
  {
    label: '05 · 分发',
    text: 'Looper 调用 msg.target.dispatchMessage(msg)。因为 target 是主线程 Handler，handleMessage 就在主线程执行。',
    log: 'dispatchMessage：<b>Handler</b> 在主线程处理 UI。',
    phase: 'handle',
  },
  {
    label: '06 · 继续循环',
    text: '这条消息处理完，loop 回到开头，再取下一条。整个过程没有额外起线程，执行线程就是当初调用 Looper.loop() 的那一个。',
    log: 'UI 处理完。队列还剩 LOG、SAVE，<b>loop</b> 继续。',
    phase: 'rest',
  },
]

export const GC_BEATS: GcBeat[] = [
  {
    label: '01 · 同一段堆',
    text: '回收之前，这段内存里活着的是 A、B、C，夹在中间的三格已经没有引用。三种算法面对的是同一段内存，差别在回收之后空闲空间长什么样。',
    log: '存活 <b>A B C</b>，中间三格是垃圾。',
    phase: 'heap',
  },
  {
    label: '02 · 标记',
    text: '从 GC Roots 顺着引用链走一遍，走到的对象标成存活。标记-清除、复制、整理，这一步是一样的。',
    log: 'A、B、C 被标上。没被走到的格子仍然是垃圾。',
    phase: 'mark',
  },
  {
    label: '03 · 清除',
    text: '标记-清除把没被标记的格子直接腾出来，活对象留在原地。空出来的是一块一块的洞，下一次分配只能沿着空闲链表找能放下的洞。',
    log: '垃圾被清掉。A、B、C <b>原地不动</b>，中间留下碎片。',
    phase: 'sweep',
  },
  {
    label: '04 · 复制',
    text: '复制算法把内存分成 From 和 To。只把活对象按顺序抄到 To 的开头，From 整块丢掉。To 里剩下的空闲是连在一起的，分配时移动堆顶指针就行。代价是有一半空间在备用。',
    log: 'A、B、C 复制到 <b>To</b> 的开头。From 清空。',
    phase: 'copy',
  },
  {
    label: '05 · 整理',
    text: '标记-整理不预留半区。活对象往内存的一端滑动，紧挨着排好，后面整段变成连续空闲。对象被移动之后，指向它们的引用都要改，这一步必须停掉用户线程。',
    log: 'A、B、C 滑到左端。右侧是<b>连续空闲</b>。',
    phase: 'compact',
  },
]
