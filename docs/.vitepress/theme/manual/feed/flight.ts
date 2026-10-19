export interface FlightFrame {
  title: string
  action: string
  why: string
  map: { key: string; id: string; state: string }[]
  waiters: string[]
  deferred: string
  network: string
  lines: number[]
}

export const FLIGHT_CODE = [
  'class SingleFlight<K, V>(private val scope: CoroutineScope) {',
  '    private val inflight = ConcurrentHashMap<K, Deferred<V>>()',
  '',
  '    suspend fun run(key: K, block: suspend () -> V): V {',
  '        val deferred = checkNotNull(inflight.compute(key) { _, current ->',
  '            if (current != null && current.isActive) current',
  '            else scope.async(start = CoroutineStart.LAZY) { block() }.also { created ->',
  '                created.invokeOnCompletion { inflight.remove(key, created) }',
  '            }',
  '        })',
  '        deferred.start()',
  '        return deferred.await()',
  '    }',
  '}',
]

export const FLIGHT_FRAMES: FlightFrame[] = [
  {
    title: '空闲',
    action: '还没有人调用 run。',
    why: 'Map 里保存的是进行中的 Deferred，不是上一次的结果。没有进行中的任务时，它就是空的。',
    map: [],
    waiters: [],
    deferred: '无',
    network: '未执行',
    lines: [],
  },
  {
    title: 'A 创建任务',
    action: 'A 调用 run("feed:u1:home")。compute 看不到仍在活动的 Deferred，于是创建一个 LAZY 的 D1，并只注册一次完成回调。',
    why: '创建发生在 Map 的原子更新里，block 还没有执行。LAZY 让映射函数只做登记，不在 ConcurrentHashMap 的桶锁里发起网络。',
    map: [{ key: 'feed:u1:home', id: 'D1', state: 'LAZY，未 start' }],
    waiters: [],
    deferred: 'D1 已放入 Map，尚未启动',
    network: '未执行',
    lines: [5, 7, 8],
  },
  {
    title: 'A 启动并等待',
    action: 'compute 返回之后，A 调用 start()，再 await()。start() 不是挂起点，所以 A 在真正挂起之前已经把任务启动了。',
    why: '去重靠的是 Map 里同一个 Deferred。LAZY 只负责把启动挪到锁外面，它本身不是去重。',
    map: [{ key: 'feed:u1:home', id: 'D1', state: 'Active' }],
    waiters: ['A'],
    deferred: 'D1 Active，block 已开始',
    network: '执行中',
    lines: [11, 12],
  },
  {
    title: 'B 并入 D1',
    action: 'B 用同一个 key 调用 run。compute 看到 D1.isActive，直接返回 D1，不再创建，也不再注册回调。',
    why: 'B 等待的是任务句柄。block 不会因为多了一个调用方再执行一次。',
    map: [{ key: 'feed:u1:home', id: 'D1', state: 'Active' }],
    waiters: ['A', 'B'],
    deferred: '仍是 D1',
    network: '执行中，仍是这一次',
    lines: [6],
  },
  {
    title: 'C 并入 D1',
    action: 'C 同样拿到 D1，停在 await()。三个调用方现在挂在同一个 Deferred 上。',
    why: 'await 可以有很多个。它们要的是同一次执行的结果，不是各自再跑一遍 block。',
    map: [{ key: 'feed:u1:home', id: 'D1', state: 'Active' }],
    waiters: ['A', 'B', 'C'],
    deferred: '仍是 D1',
    network: '执行中，仍是这一次',
    lines: [6, 12],
  },
  {
    title: '网络返回并写库',
    action: 'block 收到 API 结果，执行 DAO.upsert，然后正常返回。D1 完成。A、B、C 的 await 都恢复，拿到同一个返回值。',
    why: '共享的是这一次执行的结果。成功、失败都会原样交给所有还在等待的调用方。',
    map: [{ key: 'feed:u1:home', id: 'D1', state: 'Completed' }],
    waiters: ['A', 'B', 'C'],
    deferred: 'D1 已完成',
    network: '这一次已结束',
    lines: [7],
  },
  {
    title: '完成后清理',
    action: 'invokeOnCompletion 执行 inflight.remove(key, D1)。Map 变空。',
    why: 'remove(key, D1) 只有在格子里仍然是 D1 时才删除。如果清理发生前，同 key 已经放进了新的 D2，D2 会留下来。无条件 remove(key) 会把 D2 一起删掉。',
    map: [],
    waiters: [],
    deferred: 'D1 已从 Map 移除',
    network: '没有进行中的请求',
    lines: [8],
  },
  {
    title: '完成后再调用',
    action: 'D 再次 run 同一个 key。Map 里已经没有活动任务，于是新建 D2，再执行一次 block。',
    why: 'SingleFlight 不保存结果。任务结束后的下一次调用会重新请求。要复用已经拿到的数据，得另外加缓存。',
    map: [{ key: 'feed:u1:home', id: 'D2', state: 'Active' }],
    waiters: ['D'],
    deferred: '新的 D2，不是 D1',
    network: '重新执行',
    lines: [7, 8, 11],
  },
]
