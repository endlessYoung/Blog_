# 协程Job

## 1. 什么是Job
`Job` 是协程的生命周期管理者。每一个协程都有一个关联的 `Job`, `Job` 可以用来控制协程的 **执行**、**取消**、**等待**等操作。

当启动一个协程时，`Job` 会自动关联到协程。例如，`launch` 或者 `async` 创建的协程都会返回一个 `Job`，可以使用这个 `Job` 来管理协程。

## 2. 协程与Job的关系

`Job` 可以通过以下方法控制协程：
1. `cancel()`: 取消协程。
2. `join()`: 等待协程完成。
3. `isActive()`: 检查协程是否处于活动状态
4. `isCompleted()`: 检查协程是否已经完成
5. `isCancelled()`: 检查协程是否已被取消

## 3. Job 和协程的生命周期

- **启动阶段**：协程被创建并开始执行
- **运行阶段**：协程正在执行代码
- **取消阶段**：协程被取消后会中断执行，通常会抛出 `CancellationException`。
- **完成阶段**：协程的工作完成，退出执行。


## 4. 父子协程与Job

协程可以嵌套，也就是说一个协程可以启动另一个协程，这时父协程和子协程会形成父子关系。父协程的 `Job` 和子协程的 `Job` 相关联，子协程的 `Job` 会作为父协程的子任务。

1) 父协程取消子协程
如果父协程被取消，那么所有子协程也会被取消，除非子协程在启动时指定了不同的 Job。

::: code-group
``` kotlin
val parentJob = launch {
    val childJob = launch {
        delay(1000)
        println("子协程完成！")
    }
    delay(500)
    println("父协程取消！")
    parentJob.cancel() // 取消父协程
}
// 此时，parentJob 被取消后，childJob 会被自动取消。
```
:::

2) 子协程独立于父协程
通过显式传递 Job，使子协程独立于父协程：

::: code-group
``` kotlin
val parentJob = launch {
    val childJob = launch(parentJob) {
        delay(1000)
        println("子协程完成！")
    }
}
// 即使父协程被取消，子协程也不会被自动取消。
```
:::


## 5. 代码示例

1. **cancel**方法
::: code-group
``` kotlin
val job = launch {
    delay(1000)
    println("这条不会被执行")
}

job.cancel()
```
:::

2. **join**方法

::: code-group
``` kotlin
val job = launch {
    delay(1000)
    println("协程完成")
}

job.join()
println("主线程继续执行")
```
:::

3. **isActive**方法

::: code-group
``` kotlin
val job = launch {
    delay(1000)
    println("协程完成")
}

println(job.isActive) // true 正在执行

job.join()

println(job.isActive) // false 协程已经完成
```
:::

4. **isCompleted** 和 **isCancelled**方法不同

::: code-group
``` kotlin
val job = launch {
    delay(1000)
}

println(job.isCompleted) // false
println(job.isCancelled) // false

job.cancel()

println(job.isCompleted) // true
println(job.isCancelled) // true
```
:::
