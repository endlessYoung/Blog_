---
title: 标签：并发
description: 与「并发」相关的文章共 2 篇
hideArticleMeta: true
---

# 标签：并发

共 **2** 篇文章：

- [ART Monitor 锁膨胀、Linux Futex 挂起与优先级反转](/Android/ART Monitor锁膨胀、Linux Futex挂起与优先级反转) — 在 Android 移动端性能工程与流畅度治理的实践中，多线程并发安全与界面响应性能常常处于微妙的博弈之中。为了防止共享状态在并发读写时出现数据错乱，工程师最直接、最熟悉的防护手段就是使用互斥锁——无论是在 Java 中给方法或代码块加上 synchronized，
- [拆解 CoroutineScheduler：少量 CPU 线程如何支撑十万协程](/Kotlin/CoroutineScheduler底层编排) — 很多人在初学 Kotlin 协程时，都听过这样一句宣传语：“协程是轻量级线程，一台设备能轻松并发运行数十万个协程。” 然而只要稍加探究源码，就会发现一个令人困惑的矛盾事实： 在 Dispatchers.Default 调度器底层，线程池的线程数其实默认就等于设备的 CPU 核心数。
