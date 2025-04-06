# ForkJoinPool

## 1. ForkJoinPool 的核心设计思想

把大任务分成小任务，分而治之；让每个线程都有本地任务队列，空闲线程可以“偷”别的线程的任务来做（Work Stealing）

## 2. ForkJoinPool的结构

ForkJoinPool = 多个Worker线程 + 每个线程的 **双端队列（Deque）**
- 每个线程有自己的独立的任务队列（不共享）
- 自己提交的任务优先放到“尾部”执行
- 其他线程“偷任务”时，从“头部”拿任务（Work Stealing）

## 总结

ForkJoinPool 是为“可分治、可并行”的任务而生的调度器，吞吐高、调度灵活、线程利用率极高。