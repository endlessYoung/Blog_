export interface DiagramState {
  step: number
  name: string
  title: string
  desc: string
  memoryVal: number
  threadExpected: number
  threadUpdate: number
  result: 'pending' | 'success' | 'failed'
}

export const CAS_STEPS: DiagramState[] = [
  {
    step: 1,
    name: 'INITIAL',
    title: '初始状态：读取主存',
    desc: '线程 A 与线程 B 同时从主内存中读取共享变量 V 的当前值（V = 10）。线程 A 期望将其更新为 11。',
    memoryVal: 10,
    threadExpected: 10,
    threadUpdate: 11,
    result: 'pending',
  },
  {
    step: 2,
    name: 'INTERFERENCE',
    title: '并发干扰：线程 B 先行提交',
    desc: '线程 B 抢先一步执行 CAS(10, 20) 成功，主内存中的值被修改为 20。此时线程 A 尚未感知。',
    memoryVal: 20,
    threadExpected: 10,
    threadUpdate: 11,
    result: 'pending',
  },
  {
    step: 3,
    name: 'COMPARE',
    title: '线程 A 比较阶段：比对期望值',
    desc: '线程 A 尝试提交 CAS(10, 11)。CPU 硬件级原子指令对比主内存值 (20) 与预期值 (10)，发现不相等！',
    memoryVal: 20,
    threadExpected: 10,
    threadUpdate: 11,
    result: 'failed',
  },
  {
    step: 4,
    name: 'RETRY',
    title: '自旋重试：自适应重读与再次尝试',
    desc: 'CAS 操作失败返回 false。线程 A 进入自旋循环（Spin Loop），重新拉取主内存最新值 (20) 作为新的预期值再次发起比较。',
    memoryVal: 20,
    threadExpected: 20,
    threadUpdate: 21,
    result: 'pending',
  },
  {
    step: 5,
    name: 'SUCCESS',
    title: '重试成功：原子写入新值',
    desc: '此时内存值 (20) 与期望值 (20) 一致，线程 A 成功将主内存值原子更新为 21！CAS 操作成功结束。',
    memoryVal: 21,
    threadExpected: 20,
    threadUpdate: 21,
    result: 'success',
  },
]
