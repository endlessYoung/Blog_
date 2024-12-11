# coroutineContext

## 1. 什么是coroutineContext

`coroutineContext` 是一个 `CoroutineContext` 类型的对象，它是一个不可变的集合，能够存储和访问协程的多个不同上下文元素。每个元素在协程执行时都有特定的作用，允许你灵活控制协程的行为。

`coroutineContext` 通过 `CoroutineScope` 或者协程本身来获取。它是协程的上下文对象，通常用来访问与协程相关的配置项。

## 2. CoroutineContext 的组成

`CoroutineContext` 是一个键值对类型的集合，每一个元素是一个 `CoroutineContext.Element`。常见的 `CoroutineContext`元素包括：

- `Job`: 协程的生命管理周期
- `Dispatcher`: 决定协程在哪个线程或者线程池中执行。
- `CoroutineExeceptionHandler`: 处理协程异常。
- `ThreadLocal`: 用于协程内的共享数据（可以跨协程使用）
- `ContinuationInterceptor`：用于拦截协程的继续执行过程。

1) Job
Job 是协程的生命周期管理者，用来控制协程的启动、取消、等待等行为。当协程启动时，它会自动关联一个 Job，可以通过 `coroutineContext[Job]` 来访问。

::: code-group
``` kotlin
val job = launch {
    delay(1000)
    println("协程完成！")
}

val jobFromContext = coroutineContext[Job] // 获取 Job
println(jobFromContext?.isActive) // true (表示协程还在运行)
```
:::

2) Dispatcher
`Dispatcher` 决定了协程执行的线程或线程池。常用的 `Dispatcher` 有：

- `Dispatchers.Default`：默认调度器，适用于 CPU 密集型任务。
- `Dispatchers.IO`：适用于 I/O 密集型任务（如网络请求、文件操作）。
- `Dispatchers.Main`：适用于 UI 线程（用于 Android 开发中与 UI 相关的协程）。
- `Dispatchers.Unconfined`：不限制协程执行在哪个线程，适用于短小的、没有阻塞操作的协程。

::: code-group
``` kotlin
val job = launch(Dispatchers.IO) {
    // 在 IO 线程池中执行
    delay(1000)
    println("IO 协程完成！")
}

val dispatcher = coroutineContext[CoroutineDispatcher] // 获取 Dispatcher
println(dispatcher) // Dispatchers.IO
```
:::

3) CoroutineExceptionHandler
`CoroutineExceptionHandler` 处理协程中的异常。它允许捕获和处理协程内部抛出的异常。可以在 `coroutineContext` 中设置一个异常处理器。

::: code-group
``` kotlin
val exceptionHandler = CoroutineExceptionHandler { _, exception ->
    println("Caught exception: $exception")
}

val job = launch(exceptionHandler) {
    throw Exception("Something went wrong!")
}

// 输出: Caught exception: java.lang.Exception: Something went wrong!

```
:::

4) ContinuationInterceptor
`ContinuationInterceptor` 允许拦截协程的继续执行过程，通常用于实现协程的自定义调度策略。它用于管理协程的挂起和恢复行为。

::: code-group
``` kotlin
val interceptor = object : ContinuationInterceptor {
    override val key: CoroutineContext.Key<*>
        get() = ContinuationInterceptor
    override fun interceptContinuation(continuation: Continuation<*>): Continuation<*> {
        // 可以自定义如何处理协程的继续执行
        return continuation
    }
}

val job = launch(interceptor) {
    delay(1000)
    println("协程完成！")
}

```
:::

5) ThreadLocal
`ThreadLocal` 允许在协程内保存特定的共享数据，可以在不同的协程间传递数据，或者确保每个协程有独立的副本。

::: code-group
``` kotlin
val threadLocal = ThreadLocal<String>()

val job = launch {
    threadLocal.set("Shared data in coroutine")
    println(threadLocal.get()) // 输出: Shared data in coroutine
}
```
:::

## 3. 获取coroutineContext的方法

1) 通过 CoroutineScope 获取
每个协程作用域都有一个 `coroutineContext` 属性，可以直接访问：

::: code-group
``` kotlin
val job = launch {
    println("Job is running in: ${coroutineContext[CoroutineDispatcher]}")
}
```
:::

2) 通过 withContext 修改 CoroutineContext
使用 `withContext` 函数在协程内部切换到一个新的上下文，它会返回一个新的 `CoroutineContext`。在 withContext 中修改上下文时，原有的上下文元素会被保留，但你可以覆盖或添加新的元素。

::: code-group
``` kotlin
val job = launch {
    withContext(Dispatchers.IO) {
        // 在 IO 线程中执行
        println("Switching to IO thread!")
    }
}
```
:::

## 4. coroutineContext和组合

可以通过`+`操作符组合多个 `CoroutineContext` 元素。当想要为协程指定多个不同上下文配置时，可以将他们组合在一起。

::: code-group
``` kotlin
val job = launch(Dispatcher.IO + CoroutineExceptionHandler {_, exception -> 
    println("Caught Exception: $exception")
}) {
    throw Exception("Test exception")
}

// Dispatcher.IO 和 CoroutineExceptionHandler 组合成一个新的 CoroutineContext
```
:::

