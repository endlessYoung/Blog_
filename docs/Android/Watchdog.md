# Watchdog

## 1.概述

Watchdog的中文的“看门狗”，有保护的意思。最早引入Watchdog是在单片机系统中，Linux也引入了Watchdog，在Linux内核下，当Watchdog启动后，便设定了一个定时器，如果在超时时间内没有对/dev/Watchdog进行写操作，则会导致系统重启。通过定时器实现的Watchdog属于软件层面。

Android设计了一个软件层面Watchdog，用于保护一些重要的系统服务，当出现故障时，通常会让Android系统重启。由于这种机制的存在，就经常会出现一些system_server进程被Watchdog杀掉而发生手机重启的问题。

## 2.Watchdog 的启动
Android的Watchdog是一个单例线程，在System Server时就会初始化Watchdog。Watchdog在初始化时，会构建很多HandlerChecker，大致可以分为两类：

1. Monitor Checker，用于检查是Monitor对象可能发生的死锁, AMS, PKMS, WMS等核心的系统服务都是Monitor对象。
2. Looper Checker，用于检查线程的消息队列是否长时间处于工作状态。Watchdog自身的消息队列，Ui, Io, Display这些全局的消息队列都是被检查的对象。此外，一些重要的线程的消息队列，也会加入到Looper Checker中，譬如AMS, PKMS，这些是在对应的对象初始化时加入的。

``` java
private void startBootstrapServices(@NonNull TimingsTraceAndSlog t) {
        ......
        // Start the watchdog as early as possible so we can crash the system server// if we deadlock during early boott.traceBegin("StartWatchdog");
        final Watchdog watchdog = Watchdog.getInstance();    // 对象创建
        watchdog.start();    // 调用start方法初始化
        mDumper.addDumpable(watchdog);
        ......
}
```

Watchdog.java，创建对象，并启动内部线程，执行run方法。

``` java
private Watchdog() {
        mThread = new Thread(this::run, "watchdog");

        // Initialize handler checkers for each common thread we want to check.  Note
        // that we are not currently checking the background thread, since it can
        // potentially hold longer running operations with no guarantees about the timeliness
        // of operations there.
        //
        // Use a custom thread to check monitors to avoid lock contention from impacted other
        // threads.
        // 创建HandlerThread监控线程并启动，线程名称为"watchdog.monitor"
        ServiceThread t = new ServiceThread("watchdog.monitor",
                        android.os.Process.THREAD_PRIORITY_DEFAULT, true /*allowIo*/);
        t.start();
        // 封装到HandlerChecker，加入mHandlerCheckers列表
        mMonitorChecker = new HandlerChecker(new Handler(t.getLooper()), "monitor thread");
        mHandlerCheckers.add(withDefaultTimeout(mMonitorChecker));
        // 将foreground thread、main thread、ui thread等加入mHandlerCheckers列表
        mHandlerCheckers.add(withDefaultTimeout(
                        new HandlerChecker(FgThread.getHandler(), "foreground thread")));
        // Add checker for main thread.  We only do a quick check since there
        // can be UI running on the thread.
        mHandlerCheckers.add(withDefaultTimeout(
                        new HandlerChecker(new Handler(Looper.getMainLooper()), "main thread")));
        // Add checker for shared UI thread.
        mHandlerCheckers.add(withDefaultTimeout(
                        new HandlerChecker(UiThread.getHandler(), "ui thread")));
        // And also check IO thread.
        mHandlerCheckers.add(withDefaultTimeout(
                        new HandlerChecker(IoThread.getHandler(), "i/o thread")));
        // And the display thread.
        mHandlerCheckers.add(withDefaultTimeout(
                        new HandlerChecker(DisplayThread.getHandler(), "display thread")));
        // And the animation thread.
        mHandlerCheckers.add(withDefaultTimeout(
                         new HandlerChecker(AnimationThread.getHandler(), "animation thread")));
        // And the surface animation thread.
        mHandlerCheckers.add(withDefaultTimeout(
                        new HandlerChecker(SurfaceAnimationThread.getHandler(),
                                "surface animation thread")));
        // Initialize monitor for Binder threads.
        addMonitor(new BinderThreadMonitor());
        mInterestingJavaPids.add(Process.myPid());
        // See the notes on DEFAULT_TIMEOUT.
        assert DB || DEFAULT_TIMEOUT > ZygoteConnectionConstants.WRAPPED_PID_TIMEOUT_MILLIS;
        mTraceErrorLogger = new TraceErrorLogger();
}

public void start() {       
    mThread.start();
}
```

## 3.加入Watchdog监控方式
有两种方式加入Watchdog监控：

1. addThread()：用于监测Handler线程，默认超时时长为60s.这种超时往往是所对应的handler线程消息处理得慢；
2. addMonitor(): 用于监控实现了Watchdog.Monitor接口的服务.这种超时可能是”android.fg”线程消息处理得慢，也可能是monitor迟迟拿不到锁；

``` java
// PowerManagerService.java

 @Override
public void onStart() {
    // 加入watchdog监听
    Watchdog.getInstance().addMonitor(this);    // pms服务实现了Watchdog.Monitor接口
    Watchdog.getInstance().addThread(mHandler);
}

// 在watch dog中调用，用于检测PMS服务中是否存在死锁
@Override // Watchdog.Monitor implementation
public void monitor() {
    // Grab and release lock for watchdog monitor to detect deadlocks.
    synchronized (mLock) {
    }
}
```

``` java

// monitor对象加入mMonitorQueue，mMonitorQueue加入到mMonitors
public void addMonitor(Monitor monitor) {
    synchronized (mLock) {
            mMonitorChecker.addMonitorLocked(monitor);
    }
}

void addMonitorLocked(Monitor monitor) {
        // We don't want to update mMonitors when the Handler is in the middle of checking
        // all monitors. We will update mMonitors on the next schedule if it is safe
        mMonitorQueue.add(monitor);
}
// handler对象加入到mHandlerCheckers列表
public void addThread(Handler thread) {
    synchronized (mLock) {
            final String name = thread.getLooper().getThread().getName();
            mHandlerCheckers.add(withDefaultTimeout(new HandlerChecker(thread, name)));
    }
}

public final class HandlerChecker implements Runnable {
......
    public void scheduleCheckLocked(long handlerCheckerTimeoutMillis) {
            mWaitMaxMillis = handlerCheckerTimeoutMillis;
            if (mCompleted) {
                    // Safe to update monitors in queue, Handler is not in the middle of work
                    mMonitors.addAll(mMonitorQueue);
                    mMonitorQueue.clear();
            }
            if ((mMonitors.size() == 0 && mHandler.getLooper().getQueue().isPolling())
                            || (mPauseCount > 0)) {
                    // Don't schedule until after resume OR
                    // If the target looper has recently been polling, then
                    // there is no reason to enqueue our checker on it since that
                    // is as good as it not being deadlocked.  This avoid having
                    // to do a context switch to check the thread. Note that we
                    // only do this if we have no monitors since those would need to
                    // be executed at this point.
                    mCompleted = true;
                    return;
            }
            if (!mCompleted) {
                    // we already have a check in flight, so no need
                    return;
            }

            mCompleted = false;
            mCurrentMonitor = null;
            mStartTimeMillis = SystemClock.uptimeMillis();
            mHandler.postAtFrontOfQueue(this);
    }
    ......
}
```


## 4.Watchdog的监测机制
Watchdog本身是一个线程，它的run()方法实现如下：

``` java

@Override
public void run() {
    boolean waitedHalf = false;
    while (true) {
        ...
        synchronized (this) {
            ...
            // 1. 调度所有的HandlerChecker
            for (int i=0; i<mHandlerCheckers.size(); i++) {
                HandlerChecker hc = mHandlerCheckers.get(i);
                hc.scheduleCheckLocked();
            }
            ...
            // 2. 开始定期检查
            long start = SystemClock.uptimeMillis();
            while (timeout > 0) {
                ...
                try {
                    wait(timeout);
                } catch (InterruptedException e) {
                    Log.wtf(TAG, e);
                }
                ...
                timeout = CHECK_INTERVAL - (SystemClock.uptimeMillis() - start);
            }

            // 3. 检查HandlerChecker的完成状态
            final int waitState = evaluateCheckerCompletionLocked();
            if (waitState == COMPLETED) {
                ...
                continue;
            } else if (waitState == WAITING) {
                ...
                continue;
            } else if (waitState == WAITED_HALF) {
                ...
                continue;
            }

            // 4. 存在超时的HandlerChecker
            blockedCheckers = getBlockedCheckersLocked();
            subject = describeCheckersLocked(blockedCheckers);
            allowRestart = mAllowRestart;
        }
        ...
        // 5. 保存日志，判断是否需要杀掉系统进程
        Slog.w(TAG, "*** GOODBYE!");
        Process.killProcess(Process.myPid());
        System.exit(10);
    } // end of while (true)
}
```

以上代码片段主要的运行逻辑如下：
Watchdog运行后，便开始无限循环，依次调用每一个HandlerChecker的scheduleCheckLocked()方法
调度完HandlerChecker之后，便开始定期检查是否超时，每一次检查的间隔时间由CHECK_INTERVAL常量设定，为30秒
每一次检查都会调用evaluateCheckerCompletionLocked()方法来评估一下HandlerChecker的完成状态：
COMPLETED表示已经完成
WAITING和WAITED_HALF表示还在等待，但未超时
OVERDUE表示已经超时。默认情况下，timeout是1分钟，但监测对象可以通过传参自行设定，譬如PKMS的Handler Checker的超时是10分钟
如果超时时间到了，还有HandlerChecker处于未完成的状态(OVERDUE)，则通过getBlockedCheckersLocked()方法，获取阻塞的HandlerChecker，生成一些描述信息
保存日志，包括一些运行时的堆栈信息，这些日志是我们解决Watchdog问题的重要依据。如果判断需要杀掉system_server进程，则给当前进程(system_server)发送signal 9
只要Watchdog没有发现超时的任务，HandlerChecker就会被不停的调度，那HandlerChecker具体做一些什么检查呢？ 

``` java

public final class HandlerChecker implements Runnable {

    public void scheduleCheckLocked() {
        // Looper Checker中是不包含monitor对象的，判断消息队列是否处于空闲
        if (mMonitors.size() == 0 && mHandler.getLooper().isIdling()) {
            mCompleted = true;
            return;
        }
        ...
        // 将Monitor Checker的对象置于消息队列之前，优先运行
        mHandler.postAtFrontOfQueue(this);
    }

    @Override
    public void run() {
        // 依次调用Monitor对象的monitor()方法
        for (int i = 0 ; i < size ; i++) {
            synchronized (Watchdog.this) {
                mCurrentMonitor = mMonitors.get(i);
            }
            mCurrentMonitor.monitor();
        }
        ...
    }
}
```

- 对于Looper Checker而言，会判断线程的消息队列是否处于空闲状态。如果被监测的消息队列一直闲不下来，则说明可能已经阻塞等待了很长时间
- 对于Monitor Checker而言，会调用实现类的monitor方法，譬如上文中提到的AMS.monitor()方法， 方法实现一般很简单，就是获取当前类的对象锁，如果当前对象锁已经被持有，则monitor()会一直处于wait状态，直到超时，这种情况下，很可能是线程发生了死锁。

## 5.总结

1. Watchdog用HandlerChecker来监控消息队列是否发生阻塞，用MonitorChecker来监控系统核心服务是否发生长时间持锁。
2. HandlerChecker通mHandler.getLooper().getQueue().isPolling()判断是否超时，BinderThreadMonitor主要是通过判断Binder线程是否超过了系统最大值来判断是否超时，其他MonitorChecker通过synchronized(this)`判断是否超时。
3. 超时之后，系统会打印一系列的信息，包括当前进程以及核心native进程的Stacktrace，kernel线程Stacktrace，打印Kernel里面blocked的线程以及所有CPU的backtraces。
4. 超时之后，Watchdog会杀掉自己，导致zygote重启。
