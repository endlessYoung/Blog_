# LiveData

`LiveData` 是一个持有可观察数据的类，它可以感知组件的生命周期（如 `Activity` 和 `Fragment`）。`LiveData` 能自动管理观察者（即观察数据变化的对象），并确保数据只在可见的 UI 组件上更新，避免内存泄漏。

LiveData 的主要功能：
1. **生命周期感知**：只会在 Activity 或 Fragment 处于活跃状态（如前台或启动中）时，才会通知观察者数据的变化。
2. **自动管理观察者**：当观察者的生命周期结束时（如 Activity 被销毁），LiveData 会自动移除该观察者，防止潜在的内存泄漏。
3. **数据变化通知**：LiveData 会在持有的数据发生变化时通知所有活跃的观察者。

## setValue() 和 postValue() 的区别

1. 使用场景不同：程序在主线程中运行时，使用 `setValue` 更新 LiveData 的数据，程序在子线程中运行时；使用 `postValue` 更新 `LiveData` 的数据。
2. 调用机制不同： **`setValue` 是同步调用的**。它会立即更新 LiveData 中的数据，并通知观察者； **`postValue` 是异步调用**，它会将数据更新操作发送到主线程的消息队列中，所以不会立即通知观察者。
3. 典型用法：由于只能在主线程中使用，所以 `setValue` 通常在 viewModel 的方法或者UI线程中使用； `postValue` 适用于在工作线程或后台线程执行耗时任务，并希望在任务完成后更新 UI 的场景。

## observe() 和 observeForever() 的区别

- observe：

observe 常用于绑定UI组件，因为它确保只有在 Activity 或者 Fragment 可见时才更新UI，避免无用的UI更新以及内存泄漏。

1. `observe` 是生命周期感知的，它会跟踪 LifecycleOwner （通常是 Activity 或 Fragment）的生命周期。观察者只会在 LifecycleOwner 处于 **STARTED** 或者 **RESUMED** 状态时收到数据更新通知。
2. 当 LifecycleOwner 被销毁时，LiveData 会自动移除观察者，避免内存泄漏。

- observeForever：

1. 生命周期没有感知，observeForever 不依赖于 LifecycleOwner，因此一旦注册观察者，**会始终监听**LiveData的变化，无论生命周期状态如何。在主动移除或者调用 `removeObserver` 之前, 会一直监听数据变化。
2. 由于不依赖生命周期管理，必须手动移除观察者（removeObserver），否则可能会导致内存泄漏。适用于一些不依赖UI生命周期的场景，比如后台服务，单例对象等，或者在应用的整个生命周期内都监听数据变化。

### 区别总结：

| 特性             | `observe`                                  | `observeForever`                     |
| ---------------- | ------------------------------------------ | ------------------------------------ |
| **生命周期感知** | 是，依赖 `LifecycleOwner`                  | 否，不依赖 `LifecycleOwner`          |
| **数据接收条件** | 只有 `LifecycleOwner` 处于活跃状态时才接收 | 始终接收，无论生命周期状态如何       |
| **内存管理**     | 自动管理，在 `LifecycleOwner` 被销毁时移除 | 需要手动调用 `removeObserver` 来移除 |
| **使用场景**     | 常用于 UI 组件和与生命周期相关的场景       | 常用于全局对象或不依赖生命周期的场景 |

## LiveData 粘性事件

粘性事件就是指：当观察者开始观察 LiveData 时，它会接收到 LiveData中最近一次更新的数据（即使这个数据的变化在观察者注册之前就已经发生了）

表现为：当新的观察者注册时，即使没有新的数据更新，也会收到注册之前的 LiveData 保存的最新数据。

这种行为可以通过LiveData的设计原理来解释：

### **LiveData的内部实现**：

LiveData 中持有一个最新的数据值（mData），以及一个版本号（mVersion），表示当前数据的版本。当数据通过setvalue或者postvalue方法更新时，LiveData 将存储新数据并递增版本号，同时通知所有活跃的观察者。
当一个观察者注册时，LiveData 会将最新的数据发送给该观察者。如果观察者之前并未接收到该数据，它就会被立即通知到，即使这个数据的变化发生在观察者注册之前。
这是因为LiveData会比较观察者的版本号和内部的mVersion，如果观察者的版本号较低，就会收到最新的数据更新。这种机制保证了当新的观察者注册时，他总是能收到LiveData持有的当前值。

### 解决粘性事件问题的方法

1. **使用 `EventWrapper` 模式**:

2. **反射干涉Version**: 
LiveData判断这个事件是否分发出去的关键在considerNotify方法中。
每次setValue或postValue时，mVersion会+1，只要mLastVersion>=mVersion即证明之前有过setValue或postValue。现在我们想使在observer调用前的setValue方法不被分发出去，只需要在调用observer之前的某个节点处改，变使其 `mLastVersion = mVersion` 即可。
可以通过反射在observer中找到mObservers对象和当前mVersion，然后**将mVersion赋值给mLastVersion**。

``` kotlin
/**
 * Used as a wrapper for data that is exposed via a LiveData that represents an event.
 */
open class Event(private val content: T) {

    var hasBeenHandled = false
        private set // Allow external read but not write

    /**
     * Returns the content and prevents its use again.
     */
    fun getContentIfNotHandled(): T? {
        return if (hasBeenHandled) {
            null
        } else {
            hasBeenHandled = true
            content
        }
    }

    /**
     * Returns the content, even if it's already been handled.
     */
    fun peekContent(): T = content
}

//----------------------------使用时 --------------------------------
val l = MutableLiveData<>()
l.observe(this, Observer {
    it.getContentIfNotHandled()?.let { // Only proceed if the event has never been handled
        ...
    }
})
```
3. 使用 `SingleLiveEvent` 模式
你一次setValue后，多次observe，却只想消费一个observe。但是，SingleLiveEvent 的问题在于它仅限于一个观察者。如果您无意中添加了多个，则只会调用一个，并且不能保证哪一个
4. 开源组件 `UnPeekLiveData`