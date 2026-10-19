export type BurstMode = 'plain' | 'single'

export interface BurstCaller {
  id: number
  key: string
  taskId: number
  at: number
  joined: boolean
  status: 'running' | 'done'
}

export interface BurstTask {
  id: number
  key: string
  startedAt: number
  endsAt: number
  status: 'running' | 'done'
  callerIds: number[]
}

export interface BurstState {
  now: number
  mode: BurstMode
  callers: BurstCaller[]
  tasks: BurstTask[]
  nextCaller: number
  nextTask: number
}

export const TASK_MS = 1200

export function emptyBurst(mode: BurstMode = 'plain'): BurstState {
  return { now: 0, mode, callers: [], tasks: [], nextCaller: 1, nextTask: 1 }
}

export function burstCall(state: BurstState, key: string): BurstState {
  const id = state.nextCaller
  const running = state.mode === 'single'
    ? state.tasks.find((task) => task.key === key && task.status === 'running')
    : undefined
  if (running) {
    return {
      ...state,
      nextCaller: id + 1,
      callers: [...state.callers, { id, key, taskId: running.id, at: state.now, joined: true, status: 'running' }],
      tasks: state.tasks.map((task) => task.id === running.id
        ? { ...task, callerIds: [...task.callerIds, id] }
        : task),
    }
  }
  const taskId = state.nextTask
  return {
    ...state,
    nextCaller: id + 1,
    nextTask: taskId + 1,
    callers: [...state.callers, { id, key, taskId, at: state.now, joined: false, status: 'running' }],
    tasks: [...state.tasks, {
      id: taskId,
      key,
      startedAt: state.now,
      endsAt: state.now + TASK_MS,
      status: 'running',
      callerIds: [id],
    }],
  }
}

export function burstTick(state: BurstState, dt: number): BurstState {
  const now = state.now + dt
  const done = new Set(state.tasks.filter((task) => task.status === 'running' && task.endsAt <= now).map((task) => task.id))
  if (!done.size) return { ...state, now }
  return {
    ...state,
    now,
    tasks: state.tasks.map((task) => done.has(task.id) ? { ...task, status: 'done' } : task),
    callers: state.callers.map((caller) => done.has(caller.taskId) ? { ...caller, status: 'done' } : caller),
  }
}

export function burstStats(state: BurstState) {
  return {
    calls: state.callers.length,
    runs: state.tasks.length,
    merges: state.callers.filter((caller) => caller.joined).length,
  }
}

export function burstProgress(task: BurstTask, now: number) {
  if (task.status === 'done') return 1
  const span = task.endsAt - task.startedAt
  if (span <= 0) return 1
  return Math.max(0, Math.min(1, (now - task.startedAt) / span))
}

export type Strategy = 'none' | 'mutex' | 'single' | 'cache'

export interface StratCall {
  id: number
  key: string
  at: number
  wait: 'ran' | 'queued' | 'joined' | 'hit'
  taskId: number | null
  status: 'running' | 'queued' | 'done'
  resultFrom: number | null
}

export interface StratTask {
  id: number
  key: string
  endsAt: number
  status: 'running' | 'done'
  callerIds: number[]
}

export interface StratState {
  now: number
  strategy: Strategy
  calls: StratCall[]
  tasks: StratTask[]
  queue: number[]
  cache: Record<string, number>
  nextId: number
  nextTask: number
}

export function emptyStrat(strategy: Strategy): StratState {
  return { now: 0, strategy, calls: [], tasks: [], queue: [], cache: {}, nextId: 1, nextTask: 1 }
}

function withTask(state: StratState, call: StratCall, wait: StratCall['wait']): StratState {
  const task: StratTask = {
    id: state.nextTask,
    key: call.key,
    endsAt: state.now + TASK_MS,
    status: 'running',
    callerIds: [call.id],
  }
  return {
    ...state,
    nextTask: state.nextTask + 1,
    tasks: [...state.tasks, task],
    calls: state.calls.map((item) => item.id === call.id
      ? { ...item, wait, taskId: task.id, status: 'running' }
      : item),
  }
}

export function stratCall(state: StratState, key: string): StratState {
  const call: StratCall = {
    id: state.nextId,
    key,
    at: state.now,
    wait: 'ran',
    taskId: null,
    status: 'running',
    resultFrom: null,
  }
  let next: StratState = { ...state, nextId: state.nextId + 1, calls: [...state.calls, call] }
  if (state.strategy === 'cache' && state.cache[key] != null) {
    return {
      ...next,
      calls: next.calls.map((item) => item.id === call.id
        ? { ...item, wait: 'hit', status: 'done', resultFrom: state.cache[key] }
        : item),
    }
  }
  if (state.strategy === 'single') {
    const running = state.tasks.find((task) => task.key === key && task.status === 'running')
    if (running) {
      return {
        ...next,
        tasks: next.tasks.map((task) => task.id === running.id
          ? { ...task, callerIds: [...task.callerIds, call.id] }
          : task),
        calls: next.calls.map((item) => item.id === call.id
          ? { ...item, wait: 'joined', taskId: running.id, status: 'running' }
          : item),
      }
    }
  }
  if (state.strategy === 'mutex' && state.tasks.some((task) => task.status === 'running')) {
    return {
      ...next,
      queue: [...next.queue, call.id],
      calls: next.calls.map((item) => item.id === call.id
        ? { ...item, wait: 'queued', status: 'queued' }
        : item),
    }
  }
  return withTask(next, call, 'ran')
}

export function stratTick(state: StratState, dt: number): StratState {
  const now = state.now + dt
  const tasks = state.tasks.map((task) => task.status === 'running' && task.endsAt <= now
    ? { ...task, status: 'done' as const }
    : task)
  const calls = state.calls.map((call) => {
    const task = tasks.find((item) => item.id === call.taskId)
    if (task?.status === 'done' && call.status === 'running') {
      return { ...call, status: 'done' as const, resultFrom: task.id }
    }
    return call
  })
  const cache = { ...state.cache }
  if (state.strategy === 'cache') {
    for (const task of tasks) {
      if (task.status === 'done' && cache[task.key] == null) cache[task.key] = task.id
    }
  }
  let next: StratState = { ...state, now, tasks, calls, cache }
  if (state.strategy === 'mutex' && !tasks.some((task) => task.status === 'running') && next.queue.length) {
    const id = next.queue[0]
    const call = calls.find((item) => item.id === id)
    if (call) {
      next = { ...next, queue: next.queue.slice(1) }
      next = withTask(next, call, 'queued')
    }
  }
  return next
}

export function stratDrain(state: StratState): StratState {
  let next = state
  for (let i = 0; i < 40; i += 1) {
    if (!next.tasks.some((task) => task.status === 'running') && !next.queue.length) return next
    next = stratTick(next, 200)
  }
  return next
}

export interface StrategyReport {
  strategy: Strategy
  runs: number
  joined: number
  queued: number
  hits: number
  parallel: boolean
  after: string
}

export function compareScript(): StrategyReport[] {
  const strategies: Strategy[] = ['none', 'mutex', 'single', 'cache']
  return strategies.map((strategy) => {
    let state = emptyStrat(strategy)
    state = stratCall(state, 'feed:home')
    state = stratCall(state, 'feed:home')
    state = stratCall(state, 'feed:suggest')
    state = stratDrain(state)
    state = stratCall(state, 'feed:home')
    state = stratDrain(state)
    const after = strategy === 'cache'
      ? '直接返回已有结果'
      : strategy === 'single'
        ? '再执行一次，不复用上次的结果'
        : strategy === 'mutex'
          ? '再执行自己的一次，不复用上次的结果'
          : '再执行一次'
    return {
      strategy,
      runs: state.tasks.length,
      joined: state.calls.filter((call) => call.wait === 'joined').length,
      queued: state.calls.filter((call) => call.wait === 'queued').length,
      hits: state.calls.filter((call) => call.wait === 'hit').length,
      parallel: strategy !== 'mutex',
      after,
    }
  })
}

export interface RoomRow {
  id: string
  title: string
  fresh: boolean
}

export interface RoomState {
  net: 'idle' | 'loading' | 'ok' | 'error'
  rows: RoomRow[]
  step: number
  merges: number
  fail: boolean
  note: string
}

export const ROOM_NOTES = [
  '空闲。列表是数据库里已经有的两篇。',
  'UI 发起刷新。网络是请求中，列表仍是旧数据。',
  'Repository 进入 SingleFlight，key 是 feed:u1:home。',
  '这个 key 没有进行中的任务，所以会执行一次网络请求。',
  'API 返回了新的一页。数据库还没写，列表仍是旧的。',
  'DAO.upsert 把这一页写入数据库。',
  'Room 的查询 Flow 发出新结果。变的是数据库，不是 API 把列表直接塞给 UI。',
  'UI 用 Flow 的新结果重绘。网络状态改为成功。',
]

const OLD_ROWS: RoomRow[] = [
  { id: 'a', title: '上周的草稿', fresh: false },
  { id: 'b', title: '还在库里的一条', fresh: false },
]

export function emptyRoom(): RoomState {
  return {
    net: 'idle',
    rows: OLD_ROWS.map((row) => ({ ...row })),
    step: 0,
    merges: 0,
    fail: false,
    note: ROOM_NOTES[0],
  }
}

export function roomRefresh(state: RoomState): RoomState {
  if (state.net === 'loading') {
    return { ...state, merges: state.merges + 1 }
  }
  return {
    ...state,
    net: 'loading',
    step: 1,
    merges: 0,
    note: ROOM_NOTES[1],
    rows: state.rows.map((row) => ({ ...row, fresh: false })),
  }
}

export function roomFail(state: RoomState, fail: boolean): RoomState {
  return { ...state, fail }
}

export function roomAdvance(state: RoomState): RoomState {
  if (state.net !== 'loading') return state
  const next = state.step + 1
  if (state.fail && state.step < 4 && next >= 4) {
    return {
      ...state,
      step: 4,
      net: 'error',
      note: 'API 失败。upsert 没有执行，Room Flow 不会为这次刷新发新数据，列表保持原样。',
    }
  }
  if (next >= 7) {
    return {
      ...state,
      step: 7,
      net: 'ok',
      note: ROOM_NOTES[7],
      rows: [
        { id: 'c', title: '刚刚拉到的新帖', fresh: true },
        { id: 'a', title: '上周的草稿', fresh: false },
        { id: 'b', title: '还在库里的一条', fresh: false },
      ],
    }
  }
  return { ...state, step: next, note: ROOM_NOTES[next] }
}

export function roomReset(fail: boolean): RoomState {
  return { ...emptyRoom(), fail }
}
