---
title: 标签：Handler
description: 与「Handler」相关的文章共 4 篇
hideArticleMeta: true
---

# 标签：Handler

共 **4** 篇文章：

- [为什么主线程可以直接new Handler](/Android/为什么主线程可以直接new Handler) — 在 Android 中，Handler 是用来处理线程之间的消息通信和异步操作的一个重要工具，通常它用于在非主线程（如后台线程）中发送消息或执行任务，并确保这些任务最终在主线程中执行。对于 Handler 的使用，有一个重要的问题是为什么在 主线程 中可以直接?
- [Handler.postDelayed()消息时间准确吗](/Android/Handler.postDelayed()消息时间准确吗) — Handler.postDelayed() 方法用于在延迟一定时间后执行一个任务，它是 Android 中常用的延时执行操作的方式。尽管这种方法在许多场景中非常实用，但它的时间准确性和可靠性可能会受到多种因素的影响。
- [Handler、MessageQueue和Looper](/Android/Handler、MessageQueue和Looper) — Looper不断获取MessageQueue中的一个Message，然后交给Handler来处理。
- [Handler](/Android/Handler) — Handler 用于线程间通信的消息传递机制。Handler其实就是在主线程起一个子线程，子线程运行并生成 Message，Looper 获取Message并传递给Handler，Handler逐个获取子线程中的Message。
