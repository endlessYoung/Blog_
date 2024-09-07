# Flow

## 1. 什么是Flow

kotlin的 Flow 是kotlin协程库的一部分，用于处理异步数据流。类似于RxJava的observable，但是基于Kotlin协程，提供了更简洁的处理异步数据流的方式。

## 2. Flow特性

1. **Flow 默认是冷的**：也就是说只有在收集 (collect) 时才会开始发送数据。每次收集时，Flow 都会重新执行代码。
2. **异步和非阻塞**：Flow 设计用于异步处理数据流，不会阻塞线程。由于它支持协程，支持所有协程的操作符和构造器。
3. **操作符**：Flow提供了丰富的操作符，如 map、filter、collect、flatMapConcat 等。支持函数式风格，可以组合和处理数据流。

## 3. 简单用法

::: code-group
``` kotlin
fun simpleFlow(): Flow<Int> = flow {
    for(i in 1..5){
        delay(100)
        emit(i)
    }
}

fun main() = runBlocking {
    simpleFlow().collect { value ->
        println(value)
    }
}
```
:::

Flow构造器（`Flow{}`）:可以使用flow构造器构建一个Flow，在这个代码块中可以使用 `emit()` 顺序发送值，然后用 `collect()` 方法从Flow中收集值。有点像java的`stream`。

## 4. Flow操作符

- **map**：用于转换发送的值
::: code-group
``` kotlin
val doubleFlow = simpleFlow().map{ it * 2 }
```
:::
- **filter**：用于根据条件过滤发送的值。
::: code-group
``` kotlin
val filterFlow = simpleFlow().filter{ it % 2 == 0 }
```
:::
- **flatMapConcat**：用于将每个发送的值转换为一个Flow，然后顺序地将它们连接起来。
::: code-group
``` kotlin
val flatMappedFlow = simpleFlow().flatMapConcat{ value -> 
    flowOf(value, value + 1)
}
```
:::
- **take**: 用于限制发送的值的数量。
::: code-group
``` kotlin
val limitedFlow = simpleFlow().take(3)
```
:::

## 5. StateFlow

`StateFlow` 是一个状态持有者，它是一个热流，也就是说无论是否有订阅者，它都在保持最新的状态。stateFlow类似于LiveData，但是更加灵活，可以在非UI层使用。

### 5.1 StateFlow特性：

1. **状态持有者**：StateFlow始终保持有一个最新的状态值，任何时候订阅者都能收到当前的最新状态。
2. **热流**：状态值始终保留并且可以在多个消费者之间共享。
3. **无背压**：没有背压机制，历史状态不会保存或者重放。

**状态管理**: StateFlow 适用于需要在应用程序中管理和共享状态的场景，如在 ViewModel 中管理 UI 状态。
**替代 LiveData**: 在非 UI 层（如业务逻辑层、数据层）替代 LiveData 使用。

### 5.2 使用方法

::: code-group
``` kotlin
fun main() = runBlocking {
    val stateFlow = MutableStateFlow(0) // 初始值为 0

    launch {
        stateFlow.collect { value ->
            println("Collected: $value")
        }
    }

    delay(100)
    stateFlow.value = 1 // 更新状态
    delay(100)
    stateFlow.value = 2 // 再次更新状态
}
```
:::

## 6. SharedFlow

`SharedFlow` 也是一个热流，用于向多个收集器广播事件的热流。与StateFlow不同的是，**SharedFlow没有状态**，只是传播事件给多个订阅者。它非常适合用于 `事件总线` 、 `信号广播` 等场景。

### 6.1 SharedFlow特性

1. **多播特性**：`SharedFlow` 可以有多个订阅者，每个订阅者都会接收到相同的事件。
2. **配置缓存**：`SharedFlow` 可以配置缓存，允许新的订阅者接收之前的事件。
3. **无默认值**：`SharedFlow` SharedFlow不像StateFlow那样需要持有状态，因此它没有默认值，也不会重播旧的事件，除非配置缓存。
4. **重放缓存**：`SharedFlow` 可以配置缓存的事件数，新订阅者可以接收到之前缓存的事件。

::: code-group
``` kotlin
fun main() = runBlocking {
    val sharedFlow = MutableSharedFlow<Int>(replay = 1) // 重播最新的一个事件

    launch {
        sharedFlow.collect { value ->
            println("Subscriber 1 collected: $value")
        }
    }

    delay(100)
    sharedFlow.emit(1) // 发送事件
    sharedFlow.emit(2) // 再次发送事件

    launch {
        sharedFlow.collect { value ->
            println("Subscriber 2 collected: $value")
        }
    }
}
```
:::

## 7. StateFlow 与 SharedFlow 与 LiveData 之间的区别

1. **持有状态不同**：`StateFlow` 持有状态，并且始终保留最新的状态。可以用于状态管理，替代 `LiveData`；`SharedFlow` 不持有状态，仅广播事件。适用于事件的广播和多播机制。

## 其他Flow

与前文相对的还有 `MutableSharedFlow` 和 `MutableStateFlow`，分别是其可变类型。