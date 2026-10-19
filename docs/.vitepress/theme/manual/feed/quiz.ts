export interface QuizItem {
  id: string
  prompt: string
  options: string[]
  answer: number
  why: string
}

export const QUIZ: QuizItem[] = [
  {
    id: 'once',
    prompt: '三个协程同时对 key = feed:u1:home 调用 run，而且第一次调用的任务还没完成。block 会执行几次？',
    options: ['三次，每个协程各执行一次', '一次，另外两个等待同一个 Deferred', '零次，因为 Map 里已经有结果'],
    answer: 1,
    why: '后两个调用在 compute 里看到仍活动的 Deferred，就 await 它。block 只在创建那一次执行。',
  },
  {
    id: 'again',
    prompt: '任务完成，invokeOnCompletion 已经把这个 Deferred 从 Map 移除。再调用同一个 key 会怎样？',
    options: ['直接返回上一次的结果', '再执行一次 block', '抛异常，因为 key 已经用过'],
    answer: 1,
    why: 'Map 里放的是进行中的任务，不是结果。记录清掉之后，下一次就是一次新的请求。',
  },
  {
    id: 'mutex',
    prompt: '两个协程抢同一把 Mutex，各自带着自己的网络请求。锁保证了什么？',
    options: ['两个人按顺序各执行一次自己的请求', '两个人共享同一次请求的结果', '第二个人直接拿到缓存'],
    answer: 0,
    why: 'Mutex 只让临界区里同时有一个协程。它不会把第二个协程的 block 换成第一个协程的 Deferred。',
  },
  {
    id: 'room',
    prompt: '两个界面都 collect 了同一个 Room Flow。这等于把 Feed 的网络请求合并了吗？',
    options: ['等于。Flow 的收集者会共享同一次 API 调用', '不等于。Flow 发出的是数据库查询结果，请求合并要靠 SingleFlight 这类机制', '等于。Room 会在有收集者时自动刷新网络'],
    answer: 1,
    why: 'Room Flow 在表变化时重新查询。它不知道有没有人正在请求网络，也不会替你合并请求。',
  },
  {
    id: 'cancel',
    prompt: 'A、B、C 正在等同一个 Deferred。B 所在的协程取消了。应该发生什么？',
    options: ['D1 继续执行，A 和 C 仍拿到结果', 'D1 一起取消，A 和 C 也失败', '只把 B 的那一份网络请求取消'],
    answer: 0,
    why: 'Deferred 的父作用域是 Repository 持有的 scope，不是 B。B 取消的是自己的 await，不是共享任务。没有“B 的那一份请求”，因为请求只有一份。',
  },
  {
    id: 'key',
    prompt: '多用户应用里，刷新首页都用 key = "feed"。会出什么问题？',
    options: ['没有问题，首页数据都一样', '不同用户的进行中刷新会被合并，后加入的人可能拿到别人的结果', 'Room 会按用户把 key 自动拆开'],
    answer: 1,
    why: 'SingleFlight 只认 key。用户、分类、分页游标只要会影响结果，就得写进 key。它不会自己理解业务。',
  },
]
