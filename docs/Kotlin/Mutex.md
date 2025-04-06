# Mutex

## 1. 基本概念

`Mutex` 是一个轻量级的同步原语，是kt协程中用于实现互斥锁的工具，它通过确保同一时刻只有一个协程能访问某个资源，避免竟态条件和数据不一致的问题。工作原理类似于传统的线程互斥锁。是协程级别的，不会阻塞线程，而是挂起当前协程直到锁被释放。

## 2. 使用方法

`Mutex` 主要通过两种方法来操作：
1. `lock()`: 获取锁，如果锁已经被其他协程持有，则当前协程将挂起，直到锁可用。
2. `unlock()`: 释放锁，允许其他协程获取锁。

::: code-group
``` kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

val mutex = Mutex()

var counter = 0

suspend fun incrementCounter() {
    mutex.withLock {
        // 临界区代码
        val current = counter
        delay(100)  // 模拟耗时操作
        counter = current + 1
        println("Counter: $counter")
    }
}

fun main() = runBlocking {
    val jobs = List(10) {
        launch {
            incrementCounter()
        }
    }
    jobs.forEach { it.join() }
}
```
:::

`mutex.withLock` 可以在获取到锁的情况下执行代码块，代码块执行完毕后自动释放锁。

## 3. 高级用法

`Mutex` 与协程取消和超时控制

使用超时 `withTimeout` 来限制锁等待时间

::: code-group
``` kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.timeout

val mutex = Mutex()

suspend fun safeIncrementCounter() {
    try {
        // 尝试在100ms内获取锁
        if (mutex.tryLock()) {
            try {
                delay(100)
                println("Incremented safely")
            } finally {
                mutex.unlock()  // 确保解锁
            }
        } else {
            println("Failed to acquire lock within timeout")
        }
    } catch (e: Exception) {
        println("Error occurred: ${e.message}")
    }
}

fun main() = runBlocking {
    val jobs = List(10) {
        launch {
            safeIncrementCounter()
        }
    }
    jobs.forEach { it.join() }
}
```
:::

Mutex 确保对共享资源（sharedFlow）的线程安全访问
::: code-group
``` kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.collect

val mutex = Mutex()
val sharedFlow = MutableSharedFlow<String>()

suspend fun produceData() {
    mutex.withLock {
        sharedFlow.emit("data produced")
    }
}

suspend fun consumeData() {
    sharedFlow.collect {
        println("Consumed: $it")
    }
}

fun main() = runBlocking {
    val producer = launch {
        repeat(5) {
            produceData()
            delay(100)
        }
    }

    val consumer = launch {
        consumeData()
    }

    producer.join()
    consumer.cancel()
}
```
:::

在多个资源上加锁时，如果不小心，可能会导致死锁。Mutex 允许通过锁的排序策略避免此类问题。

::: code-group
``` kotlin
val mutexA = Mutex()
val mutexB = Mutex()

suspend fun taskA() {
    mutexA.lock()
    delay(100)
    mutexB.lock()
    println("Task A complete")
    mutexB.unlock()
    mutexA.unlock()
}

suspend fun taskB() {
    mutexB.lock()
    delay(100)
    mutexA.lock()
    println("Task B complete")
    mutexA.unlock()
    mutexB.unlock()
}

fun main() = runBlocking {
    val jobA = launch { taskA() }
    val jobB = launch { taskB() }
    
    jobA.join()
    jobB.join()
}
```
:::
这种代码会在 mutexA 和 mutexB 锁的顺序不一致时导致死锁（如 taskA 先锁 mutexA，taskB 先锁 mutexB）。
解决办法是按固定顺序获取锁（例如，mutexA 一定先锁）