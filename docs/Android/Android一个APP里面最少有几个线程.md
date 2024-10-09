# Android一个APP里面最少有几个线程

Android一个进程里面最少包含5个线程，分别为：

1. **main线程（主线程）**：
2. **FinalizerDaemon线程**：
终结者守护线程。对于重写了成员函数finalize的对象，它们被GC决定回收时，并没有马上被回收，而是被放入到一个队列中，等待
FinalizerDaemon守护线程去调用它们的成员函数finalize，然后再被回收。
3. **FinalizerWatchdogDaemon线程**：
监控终结者守护线程。用来监控FinalizerDaemon线程的执行。一旦检测那些重定了成员函数finalize的对象在执行成员函数finalize时超出一定的时候，那么就会退出VM。
4. **HeapTaskDaemon线程**：
堆栈守护线程。用来执行堆栈的操作，也就是用来将那些空闲的堆内存归还给系统。
5. **ReferenceQueueDaemon线程**：
引用队列守护线程。我们知道，在创建引用对象的时候，可以关联一个队列。当被引用对象引用的对象被GC回收的时候，被引用对象就会被加入到其创建时关联的队列去。这个加入队列的操作就是由ReferenceQueueDaemon守护线程来完成的。这样应用程序就可以知道哪些被引用对象引用的对象已经被回收了。