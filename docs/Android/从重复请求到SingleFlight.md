---
title: 从重复请求到SingleFlight
description: 用一个可操作的 Feed 实验室说明，为什么相同的刷新会叠在一起，SingleFlight 合并的是进行中的任务，以及 Room Flow 为什么只负责把数据库的变化交给 UI。
categories: [Android]
tags: [android, kotlin, Room]
created: 2026-10-19
---

# 从重复请求到SingleFlight

首页的数据层经常同时被好几处碰到：页面刚打开、用户下拉、头部和列表各自还要同一份 Feed。这篇用一个离线实验室把这几件事拆开。先看请求怎么叠起来，再看进行中的任务怎么被共享，最后看结果怎样经过数据库回到列表。

## 一个看似简单的 Feed 刷新，为什么会发出五次请求？

下面这条时间线不是生命周期图，也不是说每次刷新都是 Bug。它只是一个首页在很短的时间里，对同一份数据发出了五次调用。

| 时刻   | 谁在要数据 | key            |
| ------ | ---------- | -------------- |
| 0 ms   | 进入首页   | `feed:u1:home` |
| 40 ms  | 下拉刷新   | `feed:u1:home` |
| 70 ms  | 头部模块   | `feed:u1:home` |
| 90 ms  | 列表模块   | `feed:u1:home` |
| 120 ms | 未读角标   | `feed:u1:home` |

下拉刷新是用户明确要的新数据。头部和列表如果各自发一次相同的首页请求，多出来的是重复工作，不是第二次刷新。角标如果要的其实是未读数，key 就不该和首页列表相同。

重复执行同一份请求，代价不只有流量。后返回的那一次如果直接覆盖列表，用户会看到顺序被弹回去。两个写入如果都按「整表替换」处理，后完成的旧请求会把新请求已经写好的数据盖掉。

调用次数和网络次数不是一回事。五次调用可以对应五次网络，也可以对应一次网络加四次等待。下面这个面板的状态由模型推进，时钟每 200 ms 走一格，每次请求固定 1200 ms。前三个按钮共用 `feed:home`，推荐用的是另一个 key。

<FeedBurstLab />

普通请求下，连点三次首页，实际请求也是三次。换成 SingleFlight，进行中的同一个 key 只会有一个任务，后来的调用显示「并入」。`feed:suggest` 即使首页还没完成，也会另起一个任务。不同 key 本来就该并行。

## 先搞懂一个概念：正在执行的任务也可以被共享

去重时最容易存错东西。把结果放进 Map，得到的是缓存：下一次调用直接拿旧值，不管你是不是想要一次新的刷新。把「这次还没做完的任务」放进 Map，得到的是合并：后来的调用等这一次做完，拿到同一次的结果；这一次结束之后，Map 就不再留着它。

`Map<K, Deferred<V>>` 存的是第二种。`Deferred` 是一个还可能在执行的句柄。多个协程可以对同一个句柄 `await()`，block 不会因此再执行。任务完成后句柄仍然能把结果交给晚到的 `await()`，但 SingleFlight 会在完成回调里把这条记录拿掉，所以它不负责「以后都用这份结果」。

缓存可以和它叠在一起用：先看缓存是否还新鲜，不新鲜再进入 SingleFlight。两件事先后发生，不是同一个机制的两种叫法。

## 拆解 SingleFlight 的 Kotlin 实现

常见的示意写法是 `computeIfAbsent` 里放一个 `LAZY` 的 `async`，每个调用方再注册一次 `invokeOnCompletion`，然后 `await()`。方向是对的，直接拿去用会碰到几件它没处理的事。

映射函数跑在 `ConcurrentHashMap` 的桶锁里。在里面启动网络，锁会被 IO 拖住，映射函数若再去碰同一张表，还有死锁的风险。`LAZY` 的作用是让映射函数只创建句柄，不执行 block。去重本身来自「同 key 复用同一个 Deferred」，不是来自 `LAZY`。

`computeIfAbsent` 只在 key 不存在时插入。任务已经完成、完成回调却还没执行时，格子里仍是那个旧 Deferred。`computeIfAbsent` 会把它交出去，调用方立刻拿到上一次的结果。这是一个很短的缓存窗口，和「只合并进行中的任务」不是一回事。所以下面用 `compute`：仍在活动就复用，已经结束就换成新的。

每个调用方都 `invokeOnCompletion`，清理本身是幂等的，但没有必要注册多次。回调放在创建分支里，只注册一次。

`await()` 会取消等待，不会取消这个 Deferred。前提是 Deferred 的父 Job 不是调用方。把 `async` 建在 Repository 持有的 scope 上，某个页面的协程取消，只会让自己的 `await()` 抛出 `CancellationException`，共享的那一次请求继续。scope 本身被取消时，子任务一起结束，还在等的人都会收到取消。

`LAZY` 还有一个空窗：句柄放进 Map 之后，如果创建者在 `start()` 之前被取消，任务谁也不启动，完成回调也不执行，这条记录就留在 Map 里。`start()` 不是挂起点。先 `start()` 再 `await()`，创建者要到 `await()` 才可能被取消，那时任务已经启动。

完成回调用 `remove(key, created)`。无条件 `remove(key)` 会在这种顺序里删错：D1 已经完成，D2 已经放进同一个 key，D1 的回调才执行。按值删除时，格子里如果已经不是 D1，D2 留着。

block 由第一次创建任务的调用方提供。同 key 的后来者即使带着另一段 lambda，也不会执行。因此 key 必须能决定这次请求做什么。block 不要依赖调用方自己的 Job、页面还在不在、或者某次调用独有的参数。那些差异应该写进 key，或者根本不要放进同一个 SingleFlight。

```kotlin
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.CoroutineStart
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.async

class SingleFlight<K, V>(private val scope: CoroutineScope) {
    private val inflight = ConcurrentHashMap<K, Deferred<V>>()

    suspend fun run(key: K, block: suspend () -> V): V {
        val deferred = checkNotNull(inflight.compute(key) { _, current ->
            if (current != null && current.isActive) {
                current
            } else {
                scope.async(start = CoroutineStart.LAZY) { block() }.also { created ->
                    created.invokeOnCompletion {
                        inflight.remove(key, created)
                    }
                }
            }
        })
        deferred.start()
        return deferred.await()
    }
}
```

失败和取消走同一条清理路径。block 抛异常，Deferred 异常完成，等待者都收到这个异常，回调把记录移除。下一次 `run` 会重新执行，错误结果不会被留在 Map 里。scope 取消时，子任务被取消，等待者收到 `CancellationException`，记录同样被移除。

有一个边界要单独说。block 里如果再 `run` 同一个 key，会等到自己，这是死锁。block 里不要再进入同一张表的同一个 key。

下面按同一次 `feed:u1:home` 走。每一步改的是 Map、等待者和网络状态。取消 B 只影响 B 的等待，不会把步骤倒回，也不会多出一次网络。

<FeedFlightLab />

## SingleFlight、Mutex、缓存和 StateFlow 的边界

这四个东西都出现在数据层附近，解决的问题不一样。

- **SingleFlight** 合并同 key、且尚未完成的那一次执行。完成后不留结果。
- **Mutex** 让一个临界区同时只有一个协程。排队的下一个人进来后，执行的仍是他自己的 block。锁不会把别人的请求换成你的结果。
- **缓存** 复用已经得到的结果。两次同时未命中时，缓存不会把它们合成一次请求，两个人都会去执行。命中之后才不再执行。
- **StateFlow** 保存一份当前状态，新的收集者先拿到当前值，之后拿到变化。用它放「刷新中 / 成功 / 失败」合适。它不发起网络，也不知道两个调用是不是同一次请求。
- **Room Flow** 是查询结果的观察。表变了，收集者收到新的查询结果。它同样不合并网络请求。

同一组输入是：连续两次 `feed:home`、一次 `feed:suggest`，全部结束之后再调用一次 `feed:home`。表里的数字来自和按钮相同的模型。

<FeedStrategyLab />

无控制执行 4 次。Mutex 也是 4 次，但第二次和第三次要排队，而且 `feed:suggest` 不能和首页同时执行。SingleFlight 把并发的两次首页并成 1 次，推荐另算 1 次，结束后的那次首页再执行，一共 3 次。缓存对并发的两次未命中仍执行两次，推荐 1 次，最后那次首页命中，执行也是 3 次，但多出来的是一次命中而不是一次合并。

所以缓存和 SingleFlight 可以串起来：缓存还新鲜就返回；不新鲜时，用 SingleFlight 保证刷新只有一个在飞。Mutex 留给真正的共享可变状态，不要拿它冒充请求合并。

## Feed 流的 Repository 应该如何设计？

UI 不直接拿着 API 的返回值。Repository 负责把「刷新」变成一次写库，Room 负责把库里的变化交给 UI。网络失败时不写库，列表就还是上一次的查询结果。这是把数据库当作这份列表的来源，不是 Room 自己会去请求网络。

`SingleFlight` 的 scope 用进程级的应用 scope，不要用 `viewModelScope`。页面关掉时，ViewModel 的取消只应该取消这次 `await()`。进行中的写库如果也挂在页面上，用户一切走，这次刷新就被掐断，Map 里的记录还可能停在已取消的任务上。

```kotlin
import androidx.room.Dao
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Upsert
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "feed_post")
data class FeedPost(
    @PrimaryKey val id: String,
    val userId: String,
    val category: String,
    val title: String,
    val sortKey: Long,
)

data class FeedPage(val items: List<FeedPost>)

@Dao
interface FeedDao {
    @Query(
        "SELECT * FROM feed_post WHERE userId = :userId AND category = :category ORDER BY sortKey"
    )
    fun observe(userId: String, category: String): Flow<List<FeedPost>>

    @Upsert
    suspend fun upsert(items: List<FeedPost>)
}

interface FeedApi {
    suspend fun fetch(userId: String, category: String, cursor: String?): FeedPage
}

class FeedRepository(
    private val api: FeedApi,
    private val dao: FeedDao,
    appScope: CoroutineScope,
) {
    private val flight = SingleFlight<String, Unit>(appScope)

    fun observe(userId: String, category: String): Flow<List<FeedPost>> =
        dao.observe(userId, category)

    suspend fun refresh(userId: String, category: String, cursor: String?) {
        val key = "feed:$userId:$category:${cursor ?: "head"}"
        flight.run(key) {
            val page = api.fetch(userId, category, cursor)
            dao.upsert(page.items)
        }
    }
}
```

ViewModel 把查询收成 UI 用的状态，另外用一个 `StateFlow` 表示这次刷新走到了哪。刷新失败只改刷新状态，不去把 `posts` 清空。`CancellationException` 要继续抛出，不能当成一次普通的刷新失败吞掉。

```kotlin
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

sealed interface Refresh {
    data object Idle : Refresh
    data object Loading : Refresh
    data object Ok : Refresh
    data object Failed : Refresh
}

class FeedViewModel(
    private val repo: FeedRepository,
    private val userId: String,
) : ViewModel() {
    val posts = repo.observe(userId, "home")
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private val _refresh = MutableStateFlow<Refresh>(Refresh.Idle)
    val refresh: StateFlow<Refresh> = _refresh.asStateFlow()

    fun refresh() {
        viewModelScope.launch {
            _refresh.value = Refresh.Loading
            _refresh.value = try {
                repo.refresh(userId, "home", null)
                Refresh.Ok
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (error: Exception) {
                Refresh.Failed
            }
        }
    }
}
```

`stateIn` 的初值是空列表，数据库里其实可能已有数据。收集开始后，Room 会先发出当前查询结果，所以「先看到旧数据」依赖的是这次查询，不是那个空的初值。初值只覆盖订阅尚未发出第一次结果的空隙。

点一次刷新，网络状态和列表是两条线。请求还在飞的时候，列表保持数据库里的内容；写入成功之后，列表才换成 Flow 发出的新结果。请求进行中再点，计数增加，不会再开一条网络。勾上失败时，走到 API 这一步就停，列表不动。

<FeedRoomLab />

## 真正上线前必须考虑的并发边界

key 是合并的全部依据。`feed` 一个字会把所有用户的首页刷新并成一次，后加入的人等到的是别人那次的结果。用户、分类、分页游标，只要变了结果就不同，就要进 key。同一页的重复刷新可以共用 `feed:u1:home:head`。下一页是 `feed:u1:home:cursor-20`，不能和首页共用。

失败之后允许重试，是因为异常完成会把记录删掉，下一次 `run` 会再执行。不要在 SingleFlight 里把失败也缓存下来，否则用户点重试会一直拿到同一次异常。要不要自动重试是业务决定，和合并无关。

一个调用方取消，不表示别人也不要这份数据。上面的实现按这个语义来：共享任务不挂在页面 scope 上。如果你的业务是「没有人等了就把请求取消」，那是另一项策略，需要自己数等待者。Feed 刷新通常希望切走页面也把这一页写完，所以这里不在等待者归零时取消任务。

SingleFlight 不使服务端变成幂等。合并掉的是客户端这一次进程里的同 key 调用。用户连点、超时重试、另一台设备的上传，服务端该怎么处理还得服务端自己定。它也不能拦住所有重复写入：block 外面又写了一次数据库，或者两个不同 key 写进同一张表，都不在它的控制范围内。

同一 key 因为同时只有一个活动任务，写库又放在 block 里，所以同 key 的写入顺序就是任务开始的顺序。不同 key 仍会交错。首页请求和下一页请求如果都「清空再插入」同一张首页表，后完成的那一页会把首页盖掉。分页结果要带着 cursor 落在自己的范围里。需要丢弃过期首页响应时，用请求代次：开始一次新的首页刷新就增加代次，写入前发现代次已经变了就放弃这次写入。代次不要放进会被合并的 block 里各自加一，否则后加入的调用方把代次改掉，共享的那一次写入会被自己判成过期。

这些里面，key 的粒度和「取消调用方不等于取消任务」会直接产生错数据。代次、自动重试、没人等待就取消请求，要看产品是否真的会碰到，再加。

## 看你有没有把边界分清

<FeedQuiz />
