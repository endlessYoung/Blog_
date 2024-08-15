# Thread类

## 1. 前言

首先要区分线程和线程类的概念。线程是操作系统CPU资源分配的调度单元，属于抽象的范畴，而线程类实际上是可执行的代码。


Thread实现了Runnable，也就是说线程是可执行的代码

调用线程的方法
1. Runnable是一个抽象接口类，唯一提供的方法就是run方法。一般情况使用Thread是自定义一个MyThread类继承自Thread，重写run方法，然后调用start方法
2. 直接实现Runnable，也是通过start启动。

线程有以下几种状态：
1. 已经创建还没有start: NEW
2. 处于可运行状态: RUNNABLE
3. 处于阻塞状态: BLOCKED
4. 处于等待状态: WAITING
5. 等待特定的时间: TIME_WAITING
6. 终止运行：TERMINATED

## 2. Thread休眠和唤醒

与线程相关的控制方法：notify、wait、notifyAll、interrupt、join、sleep等。


