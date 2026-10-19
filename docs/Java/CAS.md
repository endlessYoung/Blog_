---
title: CAS
description: CAS (Compare And Swap，比较和交换)，是非阻塞同步的实现原理，它是CPU硬件的指令，从CPU层面保证比较与交换两个操作的原子性。 CAS 指令操作包括三个参数：
categories: [Java]
tags: [java, CAS]
created: 2025-01-15
---

# CAS

## 什么是 CAS

`CAS`（Compare And Swap，比较并交换）是非阻塞同步的实现原理。它是 CPU 硬件提供的指令，从硬件层面保证“比较”与“交换”两个操作作为一个整体原子地完成。CAS 指令包含三个操作数：

1. **内存位置 V**：需要操作的内存位置，通常是一个共享变量。
2. **预期值 E**：期望该内存位置当前的值。
3. **新值 N**：如果内存位置的当前值与预期值相等，就把它更新为新值。

**如果相等，就写入新值；如果不相等，说明已经有别的线程修改过这个位置，本次操作失败。**失败的线程不会被挂起，可以自行决定重试还是放弃。

:::note 硬件
在 x86 上，CAS 对应带 `lock` 前缀的 `cmpxchg` 指令；ARM 上则由 LDREX / STREX 这类指令对实现。
:::

## 在 JDK 中的样子

`AtomicInteger.incrementAndGet()` 最终调用 `Unsafe.getAndAddInt()`：先读取当前值，再用 CAS 尝试写入“当前值 + 1”，失败就回到循环开头。

```java
// java.util.concurrent.atomic.AtomicInteger
public final int incrementAndGet() {
    return U.getAndAddInt(this, VALUE, 1) + 1;
}

// jdk.internal.misc.Unsafe
public final int getAndAddInt(Object o, long offset, int delta) {
    int v;
    do {
        v = getIntVolatile(o, offset);          // 读取当前值
    } while (!weakCompareAndSetInt(o, offset, v, v + delta)); // 失败就重试
    return v;
}
```

:::note 可见性
读取用的是 `getIntVolatile`，保证每次都能看到其他线程最新写入的值，原理见 [volatile](/Java/volatile和synchronize的区别)。
:::

## 动手看一遍

::::scrolly
:::step 01 · 准备
两个线程 T1、T2 同时对同一个 AtomicInteger 调用 incrementAndGet()，value 初始为 0。继续往下滚动，右侧的图会跟着推进；也可以用图下方的按钮单步执行。
:::
:::step 02 · 同时读取
两个线程几乎同时读取 value，各自拿到 expect = 0。没有任何锁，读取互不影响。
:::
:::step 03 · T1 抢先
T1 先执行 CAS：内存中的值等于它手里的 expect，都是 0，于是把 value 写成 1，返回成功。
:::
:::step 04 · T2 失败
T2 随后执行 CAS。它的 expect 还是 0，但内存已经变成 1，比较失败，写入被拒绝。T2 不会被挂起，而是回到循环开头重试。
:::
:::step 05 · 重试成功
T2 重新读取到 1，计算出 2，这一次 CAS 成功。
:::
:::step 06 · 结果
最终 value = 2，两次自增都没有丢失。整个过程没有线程被阻塞，代价是 T2 多执行了一轮循环。

把鼠标移到图中的代码行上，相关的寄存器和内存会同时高亮，反过来也一样。
:::
::::

## 应用场景与代价

- **乐观锁**：`java.util.concurrent.atomic` 包中的 `AtomicInteger`、`AtomicReference` 等都基于 CAS 实现。
- **无锁数据结构**：无锁队列、无锁栈用 CAS 保证线程安全，[线程池](/Java/线程池) 内部的状态位也用它更新。

**优点**：在不阻塞线程的情况下完成原子操作，避免了锁带来的上下文切换和死锁问题。

**缺点**：

- **ABA 问题**：CAS 只比较当前值和预期值，无法知道这个值是否被改过又改回来。可以通过版本号或时间戳解决。
- **循环开销**：竞争激烈时 CAS 反复失败，线程一直空转重试，性能反而下降。
- **只能保护一个变量**：多个变量需要合并成一个对象，或者改用锁；需要线程隔离时可以考虑 [ThreadLocal](/Java/ThreadLocal)。

:::note ABA
`AtomicStampedReference` 为值附带一个版本号，比较时同时比较值和版本。
:::

:::note 高竞争
`LongAdder` 把一个计数拆到多个槽位上分散竞争，求和时再合并。
:::
