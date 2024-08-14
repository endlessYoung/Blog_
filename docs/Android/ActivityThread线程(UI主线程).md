# ActivityThread线程(UI主线程)

## 1. ActivityThread和LooperThread的区别和联系

区别：
1. **prepareMainLooper 和 prepare**：
普通线程只需要prepare就可以了，而主线程使用的是prepareMainLooper。
prepareMainLooper虽然也需要调用prepare方法，其特殊之处在于该线程不允许退出。除此之外没有本质的区别。 
2. **Handler不同**：
普通线程生成一个与Looper绑定的Handler对象就行，而主线程是从当前线程中获取的Handler。

联系：
主线程因为使用的是prepareMainLooper方法，这个方法将通过prepare为主线程生成一个ThreadLocal的Looper对象，并让sMainLooper指向它。这样做的目的就是其他线程如果想要获取主线程的Looper，只需要调用getMainLooper()方法就可以了。
普通线程调用的也是prepare方法，也生成了一个ThreadLocal的Looper对象，只不过这个对象是通过myLooper()方法来访问的。当然，主线程内部也可以通过这个方法来访问普通线程的Looper对象。这样就能将两个线程的Looper隔离开并限制其访问权限。

## 2. sMainThreadHandler对象

当ActivityThread对象创建时，会在内部同时生成一个继承自Handler的H对象。

final H mH = new H();

ActivityThread.main 中调用的 thread.getHandler() 返回的就是mH。也就是说ActivityThread提供了一个"事件管家"来处理主线程中的各种消息。

Loop.loop()方法源码

可以看到，loop方法的主要工作就是不断地从消息队列中取出所需要处理的事件，然后分发给相应的责任人。如果消息队列为空，他很可能会进入睡眠让出CPU资源。而在具体事件的处理过程中，程序会post新的事件到队列中。另外，其他进程也可能投递新的事件到这个队列中。APK应用程序就是不断地执行处理队列事件的工作，直到其退出运行。另外，其他线程可能会通过IPC机制来向这一进程的主循环发送新事件等让程序动起来。
事实证明Looper内部确实管理了一个MessageQueue，它将作为线程的消息存储仓库，配合Handler、Looper一起完成一系列操作。

