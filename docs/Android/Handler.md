---
title: Handler
description: Handler 用于线程间通信的消息传递机制。Handler其实就是在主线程起一个子线程，子线程运行并生成 Message，Looper 获取Message并传递给Handler，Handler逐个获取子线程中的Message。
categories: [Android]
tags: [android, Handler]
created: 2023-12-17
---

# Handler

## 同一个进程里的线程

Handler 传递的是**同一个进程里**、线程之间的消息。跨进程用 Binder 或 Socket。工作线程要更新界面时，不能自己改 View，只能把这件事交给已经在循环取消息的那个线程。

:::note 主线程
应用启动时主线程已经准备好 Looper，所以主线程里可以直接 `new Handler()`。见 [为什么主线程可以直接 new Handler](/Android/为什么主线程可以直接new Handler)。
:::

## 五件东西

- **Message**：要做的事。可以是一个 `what`，也可以带一个 `Runnable`。每条消息都有目标 Handler。
- **MessageQueue**：用链表保存消息。`enqueueMessage` 按 `when` 插入，不是谁先调用谁就一定排在最前。
- **Looper**：在一个线程里循环调用 `queue.next()`，再把取出的消息交给它的 target。
- **ThreadLocal**：每个线程自己的 Looper 存在这里，别的线程拿不到。原理见 [ThreadLocal](/Java/ThreadLocal)。
- **Handler**：消息的处理者。发送、处理、移除都从它进来。

## 取走一条消息

::::scrolly
:::step 01 · 构造消息
工作线程不能直接改界面。它构造一条 Message，target 指向主线程的 Handler。这时消息还没进队列。
:::
:::step 02 · 入队
enqueueMessage 按 when 把消息插进 MessageQueue。队列里现在有 UI、LOG、SAVE，头部是最先该处理的 UI。
:::
:::step 03 · next
主线程的 Looper.loop 一直在执行。它调用 queue.next()。队列空的时候，next() 会停在这里，直到有消息进来。
:::
:::step 04 · 取出
next() 把 UI 从链表上摘下来，交给 Looper。队列里剩下 LOG 和 SAVE。
:::
:::step 05 · 分发
Looper 调用 msg.target.dispatchMessage(msg)。因为 target 是主线程 Handler，handleMessage 就在主线程执行。
:::
:::step 06 · 继续循环
这条消息处理完，loop 回到开头，再取下一条。整个过程没有额外起线程，执行线程就是当初调用 Looper.loop() 的那一个。
:::
::::

```java
for (;;) {
    Message msg = queue.next(); // 队列空着就停在这里
    if (msg == null) return;    // quit
    msg.target.dispatchMessage(msg);
}
```
