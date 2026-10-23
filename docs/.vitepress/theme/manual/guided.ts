export type Zone = 'eden' | 's0' | 's1' | 'old'

export interface GuidedBeat {
  log: string
}

// Visible CAS steps are not the figure's internal frames.
export const CAS_FRAMES = [0, 2, 5, 6, 9, 10]

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

export type GcPhase = 'sweep' | 'copy' | 'compact'

export type RvPhase = 'scrap' | 'cache' | 'ext' | 'pool' | 'create'

export type GlidePhase = 'active' | 'memory' | 'resource' | 'data' | 'source'

export interface LoopBeat extends GuidedBeat {
  phase: LoopPhase
}

export interface GcBeat extends GuidedBeat {
  phase: GcPhase
}

export interface RvBeat extends GuidedBeat {
  phase: RvPhase
}

export interface GlideBeat extends GuidedBeat {
  phase: GlidePhase
}

export const BIN_VALUES = [3, 7, 11, 14, 18, 21, 25, 29, 33, 36, 40, 44]
export const BIN_TARGET = 29

export const GEN_BEATS: GenBeat[] = [
  {
    log: 'A、B 进入 <b>Eden</b>。B 已经没有引用。',
    a: 'eden',
    showB: true,
    age: '0',
    gc: false,
  },
  {
    log: 'Minor GC：<b>B</b> 没有引用，回收。A 仍然存活。',
    a: 'eden',
    showB: false,
    age: '0',
    gc: true,
  },
  {
    log: 'A 复制到 <b>S0</b>，年龄变为 1。Eden 清空。',
    a: 's0',
    showB: false,
    age: '1',
    gc: false,
  },
  {
    log: 'A 从 S0 复制到 <b>S1</b>，年龄变为 2。S0 清空。',
    a: 's1',
    showB: false,
    age: '2',
    gc: false,
  },
  {
    log: 'A 仍在幸存者区之间复制。年龄来到 <b>14</b>，还没到晋升阈值。',
    a: 's0',
    showB: false,
    age: '14',
    gc: false,
  },
  {
    log: '年龄达到 <b>15</b>，A 晋升到 <b>Old</b>。',
    a: 'old',
    showB: false,
    age: '15',
    gc: false,
  },
]

export const BIN_BEATS: BinBeat[] = [
  {
    log: '目标 <b>29</b>。left = 0，right = 11。',
    lo: 0,
    hi: 11,
    mid: -1,
    found: false,
  },
  {
    log: 'nums[5] = 21 &lt; 29，<b>left = 6</b>。',
    lo: 6,
    hi: 11,
    mid: 5,
    found: false,
  },
  {
    log: 'nums[8] = 33 &gt; 29，<b>right = 7</b>。',
    lo: 6,
    hi: 7,
    mid: 8,
    found: false,
  },
  {
    log: 'nums[6] = 25 &lt; 29，<b>left = 7</b>。',
    lo: 7,
    hi: 7,
    mid: 6,
    found: false,
  },
  {
    log: 'nums[7] = 29，<b>找到了</b>，返回 7。',
    lo: 7,
    hi: 7,
    mid: 7,
    found: true,
  },
]

export const LOOP_BEATS: LoopBeat[] = [
  {
    log: '工作线程构造 <b>UI</b>，target 是主线程 Handler。',
    phase: 'build',
  },
  {
    log: '三条消息按时间进入 <b>MessageQueue</b>，头部是 UI。',
    phase: 'queue',
  },
  {
    log: '<b>Looper</b> 调用 queue.next()，取到头部的 UI。',
    phase: 'next',
  },
  {
    log: 'UI 离开队列，到了 <b>Looper</b> 手里。',
    phase: 'take',
  },
  {
    log: 'dispatchMessage：<b>Handler</b> 在主线程处理 UI。',
    phase: 'handle',
  },
  {
    log: 'UI 处理完。队列还剩 LOG、SAVE，<b>loop</b> 继续。',
    phase: 'rest',
  },
]

export const GC_BEATS: GcBeat[] = [
  {
    log: '标记清除：A、B、C 先标上，再清掉没标记的格子。<b>原地不动</b>，中间是碎片。',
    phase: 'sweep',
  },
  {
    log: '复制：还是原来的 A、B、C，抄到 <b>To</b> 的开头。From 整块空出。',
    phase: 'copy',
  },
  {
    log: '标记整理：还是同一段。A、B、C 滑到左端，右侧是<b>连续空闲</b>。',
    phase: 'compact',
  },
]

export const RV_BEATS: RvBeat[] = [
  {
    log: 'A 在 <b>AttachedScrap</b>。同一次 layout 按 position 拿回，不重新绑定。',
    phase: 'scrap',
  },
  {
    log: 'A 进入 <b>CachedViews</b>，仍绑在原 position。缓存还空着一格。',
    phase: 'cache',
  },
  {
    log: '新 position 未命中缓存。<b>ViewCacheExtension</b> 返回 null。',
    phase: 'ext',
  },
  {
    log: 'A 按 viewType 进入<b>池</b>，绑定已清除。',
    phase: 'pool',
  },
  {
    log: '池里也没有这个 viewType。<b>onCreateViewHolder</b>。',
    phase: 'create',
  },
]

export const GLIDE_BEATS: GlideBeat[] = [
  {
    log: '第 1 级：<b>ActiveResources</b>（活动资源）。正在屏幕上显示的图片，通过弱引用持有，防止被内存 LRU 误删。',
    phase: 'active',
  },
  {
    log: '第 2 级：<b>MemoryCache</b>（内存缓存）。LruResourceCache。图片离开屏幕（引用计数归零）后存入；命中则移回 Active。',
    phase: 'memory',
  },
  {
    log: '第 3 级：<b>DiskCache RESOURCE</b>（转换后磁盘缓存）。已按目标 View 宽高裁剪缩放并变换后的文件，解码速度最快。',
    phase: 'resource',
  },
  {
    log: '第 4 级：<b>DiskCache DATA</b>（原始磁盘缓存）。网络下载的原图数据未经任何变换。尺寸不同时可直接在此重新解码，无需重复请求。',
    phase: 'data',
  },
  {
    log: '四级缓存全未命中。<b>Source / Network</b> 发起网络或数据源加载，下载完成后依次写入磁盘与内存。',
    phase: 'source',
  },
]
