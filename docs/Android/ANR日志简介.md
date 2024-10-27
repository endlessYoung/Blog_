# Anr日志简介

## 1. 日志关键信息解释
``` txt
// 发生anr的进程id，时间和进程名称。
----- pid 2023 at 2018-07-24 19:33:17 -----

// 发生ANR的包名
Cmd line: com.rui.android.poc

// 线程的基本信息
// CheckJNI is off: 表示Java Native Interface（JNI）检查功能被关闭。
// JNI调用不会进行额外的错误检查，可以提高性能但是会忽略部分错误。

// workarounds are off: 表示所有的临时解决方案被禁用，
// 这可能是为了追求性能或专注于应用的正常行为。

// pins=0 表示当前没有JNI引用被固定在内存中，
// 也就是没有活动的JNI引用指向Java对象

// global=348 表示当前存在348个全局引用。
// 在JNI中，全局引用是指由C/C++代码持有的对象，
// 这些对象不会被垃圾回收
JNI: CheckJNI is off; workarounds are off; pins=0; globals=348

// tll=0 当前线程锁的数量(Thread Local Locks)
// tsl=0 当前持有的可重入锁的数量(Thread-Safe Locks)
// tscl=0 当前持有的可重入锁中被其他线程锁定的数量(Thread-Safe Contention Locks)
// ghl=0 全局锁的数量(Global Locks)
(mutexes: tll=0 tsl=0 tscl=0 ghl=0)

// 线程名称、daemon是守护线程，线程的优先级（默认为5）
// 线程锁id和线程状态
// 一个线程名称，如果是自己手动创建的线程，一般会命名为
// Thread-xxx 的格式，其中xxx线程id，只增不减不会复用
// 这其中的tid并不是线程的id，它是一个在Java虚拟机中
// 用来实现线程锁的变量，随着线程的增减，这个变量的值
// 是可能被复用的
"main" prio=5 tid=1 NATIVE // 线程状态

// group 线程组的名称
// sCount 线程被挂起的次数，当一个线程被调试后，sCount会
// 重置为0，调试完毕后sCount会根据是否被正常挂起增长，
// dsCount 线程被调试器挂起的次数，dsCount不会被重置为0，
// 所以dsCount也可以用来判断这个线程是否被调试过
// obj 这个线程的Java对象的地址
// self 这个线程Native的地址
| group="main" sCount=1 dsCount=0 obj=0x4164dcf0 self=0x41565628

// 线程的调度信息
// sysTid linux下的内核线程id
// nice 线程的调度优先级
// sched 标志了线程的调度策略和优先级
// cgrp 调度属组
// handle 线程的处理函数地址
  | sysTid=2023 nice=-1 sched=0/0 cgrp=apps handle=1074626900

// 线程当前上下文信息
// state 调度状态
// schedstat 从/proc/[pid]/task/[tid]/schedstat 读出
// 三个值分别代表线程在cpu上执行的时间、线程的等待时间
// 和线程执行的时间片长度，有的android内核版本不支持这项
// 三个值都是0
// utm 线程用户态下使用的时间值(jiffies)
// stm 内核态下的调度时间值
// core 最后执行这个线程的cpu核的符号
 | state=S schedstat=( 0 0 0 ) utm=49 stm=21 core=0

// 线程的调用栈信息（这里可以查看到导致ANR的代码调用流程）
  (native backtrace unavailable)  
  at libcore.io.Posix.open(Native Method)  
  at libcore.io.BlockGuardOs.open(BlockGuardOs.java:110)  
  at libcore.io.IoBridge.open(IoBridge.java:430)  
  at java.io.FileInputStream.<init>(FileInputStream.java:78)  
  at com.ruiven.android.Peripheral.util.kingFiles.write(kingFiles.java:58)  
  at com.ruiven.android.Peripheral.util.kingFiles.write(kingFiles.java:51)  
  at com.ruiven.android.Peripheral.util.kingLog.writeToFiles(kingLog.java:71)  
  at com.ruiven.android.Peripheral.util.kingLog.f(kingLog.java:47)  
  at com.ruiven.android.poc.receiver.ReceiverBatteryChanged.onReceive(ReceiverBatteryChanged.java:114)  
  at android.app.LoadedApk$ReceiverDispatcher$Args.run(LoadedApk.java:767)  
  at android.os.Handler.handleCallback(Handler.java:769)  
  at android.os.Handler.dispatchMessage(Handler.java:97)  
  at android.os.Looper.loop(Looper.java:136)  
  at com.ruiven.android.Peripheral.util.Cockroach$1.run(Cockroach.java:38)  
  at android.os.Handler.handleCallback(Handler.java:769)  
  at android.os.Handler.dispatchMessage(Handler.java:97)  
  at android.os.Looper.loop(Looper.java:136)  
  at android.app.ActivityThread.main(ActivityThread.java:5375)  
  at java.lang.reflect.Method.invokeNative(Native Method)  
  at java.lang.reflect.Method.invoke(Method.java:515)  
  at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:976)  
  at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:792)  
  at dalvik.system.NativeStart.main(Native Method)

// binder线程是进程的线程池中用来处理binder请求的线程
"Binder_3" prio=5 tid=23 NATIVE  
| group="main" sCount=1 dsCount=0 obj=0x41b765f8 self=0x4f213f18  
| sysTid=1347 nice=0 sched=0/0 cgrp=apps handle=1327603952  
| state=S schedstat=( 0 0 0 ) utm=0 stm=3 core=1

#00  pc 000205d0  /system/lib/libc.so (__ioctl+8) 
#01  pc 0002d01f  /system/lib/libc.so (ioctl+14)  
#02  pc 0001e519  /system/lib/libbinder.so (android::IPCThreadState::talkWithDriver(bool)+140)  
#03  pc 0001ec67  /system/lib/libbinder.so (android::IPCThreadState::getAndExecuteCommand()+6)  
#04  pc 0001ecfd  /system/lib/libbinder.so (android::IPCThreadState::joinThreadPool(bool)+48)  
#05  pc 000236cd  /system/lib/libbinder.so  
#06  pc 0000ea19  /system/lib/libutils.so (android::Thread::_threadLoop(void*)+216)  
#07  pc 0004e769  /system/lib/libandroid_runtime.so (android::AndroidRuntime::javaThreadShell(void*)+68)  
#08  pc 0000e54b  /system/lib/libutils.so  
#09  pc 0000d240  /system/lib/libc.so (__thread_entry+72)  
#10  pc 0000d3dc  /system/lib/libc.so (pthread_create+240)  at dalvik.system.NativeStart.run(Native Method)

// JDWP线程是支持虚拟机调试的线程，
// daemon表示守护进程，不需要关心"JDWP" 
daemon prio=5 tid=4 VMWAIT  
| group="system" sCount=1 dsCount=0 obj=0x41a21868 self=0x4cc821b0  
| sysTid=785 nice=0 sched=0/0 cgrp=apps handle=1257589656  
| state=S schedstat=( 0 0 0 ) utm=0 stm=0 core=1  
#00  pc 00021420  /system/lib/libc.so (recvmsg+8)  
#01  pc 000668ab  /system/lib/libdvm.so  
#02  pc 00066adf  /system/lib/libdvm.so  
#03  pc 000697af  /system/lib/libdvm.so  
#04  pc 00059fdd  /system/lib/libdvm.so  
#05  pc 0000d240  /system/lib/libc.so (__thread_entry+72)  
#06  pc 0000d3dc  /system/lib/libc.so (pthread_create+240)  at dalvik.system.NativeStart.run(Native Method)

// “Signal Catcher”负责接收和处理kernel发送的各种信号，
// 例如SIGNAL_QUIT、SIGNAL_USR1等就是被该线程
// 接收到并处理的，traces.txt 文件中的内容就是由该线程负责输出的，
// 可以看到它的状态是RUNNABLE.
"Signal Catcher" daemon prio=5 tid=3 RUNNABLE  
| group="system" sCount=0 dsCount=0 obj=0x41a21770 self=0x4af3e5e0  
| sysTid=784 nice=0 sched=0/0 cgrp=apps handle=1257677168  
| state=R schedstat=( 0 0 0 ) utm=2 stm=2 core=1  at dalvik.system.NativeStart.run(Native Method)
----- end 2023 -----
```

在ANR日志中，重点关注主线程的堆栈跟踪。通常，主线程被阻塞的原因可能包括但不限于：

1. 长时间的计算任务。
2. 数据库查询。
3. 文件读写。
4. 网络请求。
5. 锁竞争。

## 2. 线程状态

| Thread.java中定义的状态 | Thread.cpp中定义的状态 | 说明                                      |
| ----------------------- | ---------------------- | ----------------------------------------- |
| TERMINATED              | ZOMBIE                 | 线程死亡，终止运行                        |
| RUNNABLE                | RUNNING/RUNNABLE       | 线程可运行或正在运行                      |
| TIMED_WAITING           | TIMED_WAIT             | 执行了带有超时参数的wait、sleep或join函数 |
| BLOCKED                 | MONITOR                | 线程阻塞，等待获取对象锁                  |
| WAITING                 | WAIT                   | 执行了无超时参数的wait函数                |
| NEW                     | INITIALIZING           | 新建，正在初始化，为其分配资源            |
| NEW                     | STARTING               | 新建，正在启动                            |
| RUNNABLE                | NATIVE                 | 正在执行JNI本地函数                       |
| WAITING                 | VMWAIT                 | 正在等待VM资源                            |
| RUNNABLE                | SUSPENDED              | 线程暂停，通常是由于GC或debug被暂停       |
|                         | UNKNOWN                | 未知状态                                  |

> 特别说明一下 `MONITOR状态` 和 `SUSPEND状态`，**MONITOR状态一般是类的同步块或者同步方法造成的，SUSPENDED状态在debugger的时候会出现，可以用来区别是不是真的是用户正常操作跑出了ANR。**

``` txt
mutexes(互斥)的选项简写对应含义：

tll--thread list lock
tsl-- thread suspend lock
tscl-- thread suspend count lock
ghl--gc heap lock
hwl--heap worker lock
hwll--heap worker list lock
```

>在`trace`信息中，通过 `Cmd line: packagename` 可以找到要分析的进程这里要说一下，**并不是trace文件包含的应用就一定是造成ANR根本原因。**

## 3. 线程状态实例

1. TIMED_WAIT状态

``` txt
DALVIK THREADS:"main" prio=5 tid=3 TIMED_WAIT  
| group="main" sCount=1 dsCount=0 s=0 obj=0x400143a8  
| sysTid=691 nice=0 sched=0/0 handle=-1091117924  
at java.lang.Object.wait(Native Method)  - waiting on <0x1cd570> (a android.os.MessageQueue)  
at java.lang.Object.wait(Object.java:195)  
at android.os.MessageQueue.next(MessageQueue.java:144)  
at android.os.Looper.loop(Looper.java:110)  
at android.app.ActivityThread.main(ActivityThread.java:3742) 
at java.lang.reflect.Method.invokeNative(Native Method)  
at java.lang.reflect.Method.invoke(Method.java:515)  
at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:739)  
at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:497)  
at dalvik.system.NativeStart.main(Native Method)

"Binder Thread #3" prio=5 tid=15 NATIVE  
| group="main" sCount=1 dsCount=0 s=0 obj=0x434e7758  
| sysTid=734 nice=0 sched=0/0 handle=1733632  at dalvik.system.NativeStart.run(Native Method)
"Binder Thread #2" prio=5 tid=13 NATIVE  
| group="main" sCount=1 dsCount=0 s=0 obj=0x1cd570  
| sysTid=696 nice=0 sched=0/0 handle=1369840  at dalvik.system.NativeStart.run(Native Method)
"Binder Thread #1" prio=5 tid=11 NATIVE  
| group="main" sCount=1 dsCount=0 s=0 obj=0x433aca10  
| sysTid=695 nice=0 sched=0/0 handle=1367448  at dalvik.system.NativeStart.run(Native Method)
```

2. SUSPENDED状态

``` txt
"main" prio=5 tid=1 Suspended  
| group="main" sCount=1 dsCount=0 cgrp=bg_non_interactive handle=0x7fa2a39000  
| sysTid=16770 nice=-4 sched=0/0 cgrp=bg_non_interactive handle=0x7fa2a39000  
| state=S schedstat=( 2661049558440 288674775480 3568435 ) utm=226454 stm=39650 core=1 HZ=100  
| heldMutexes= at android.os.MessageQueue.removeMessages(MessageQueue.java:702) 
at android.os.Handler.removeCallbacks(Handler.java:487) 
at me.ele.android.lmagex.b$3.println(SourceFile:103) 
at android.os.Looper.loop(Looper.java:153) 
at android.app.ActivityThread.main(ActivityThread.java:5665) 
at java.lang.reflect.Method.invoke!(Native Method) 
at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:822) 
at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:712)
```

3. WAITING状态

``` txt
"main" prio=5 tid=1 Waiting  
| group="main" sCount=0 dsCount=0 flags=0 obj=0x731a0ec8 self=0xb40000753e8b6c00  
| sysTid=28146 nice=-10 cgrp=default sched=0/0 handle=0x753fe804f8  
| state=? schedstat=( 0 0 0 ) utm=0 stm=0 core=0 HZ=100  
| stack=0x7fd0403000-0x7fd0405000 stackSize=8192KB  
| held mutexes=  at java.lang.Object.wait(Native method)  - waiting on <0x025d68dd> (a android.opengl.GLSurfaceView$GLThreadManager)  
at java.lang.Object.wait(Object.java:442)  
at java.lang.Object.wait(Object.java:568)  
at android.opengl.GLSurfaceView$GLThread.onPause(GLSurfaceView.java:1731)  
at android.opengl.GLSurfaceView.onPause(GLSurfaceView.java:579)  
at com.amap.api.mapcore.util.e.onPause(SourceFile:117)  
at com.amap.api.mapcore.util.e.onDetachedGLThread(SourceFile:73)  
at com.amap.api.mapcore.util.c.destroy(SourceFile:5750)  
at com.amap.api.mapcore.util.t.onDestroy(SourceFile:207)  
at com.amap.api.maps.MapView.onDestroy(SourceFile:165)
```

## 4. log_main 分析

ANR分析时也需要注意分析 `Looper` 信息， `AnrManager` 信息， `WindowManager` 信息等等。

`AnrManager` 信息

``` txt
// 行号后面：时间，用户ID（UID，1000通常为系统进程），进程ID（PID），线程ID（TID），日志级别，模块，内容
行  10719: 07-02 10:13:34.102  1000  1674  1674 I AnrManager: startAnrManagerService
行  10721: 07-02 10:13:34.262  1000  1674  1674 I AnrManager: prepareStackTraceFile: 

// 这里开始记录ANR dump信息
行  15333: 07-02 10:13:56.743  1000  1674  2963 I AnrManager: startAnrDump
行  15334: 07-02 10:13:56.743  1000  1674  2963 I AnrManager: isANRFlowSkipped() AnrFlow = 0
行  15335: 07-02 10:13:56.744  1000  1674  2963 I AnrManager: enableTraceLog: false

// ANR事件发生，应用 com.android.launcher 触发 ANR，原因是 Input dispatching timed out 
// (Application does not have a focused window)（输入分发超时，应用程序没有聚焦的窗口）。
// 开始收集ANR调试信息。
行  15336: 07-02 10:13:56.750  1000  1674  2963 I AnrManager: dumpAnrDebugInfo begin: AnrDumpRecord{ Input dispatching timed out (Application does not have a focused window) ProcessRecord{6ce010b 2378:com.android.launcher/u0a63} IsCompleted:false IsCancelled:false }, onlyDumpSelf = false, isSilentANR = false
行  15337: 07-02 10:13:56.750  1000  1674  2963 I AnrManager: dumpAnrDebugInfoLocked: AnrDumpRecord{ Input dispatching timed out (Application does not have a focused window) ProcessRecord{6ce010b 2378:com.android.launcher/u0a63} IsCompleted:false IsCancelled:false }, onlyDumpSelf = false, isSilentANR = false
行  15338: 07-02 10:13:56.758  1000  1674  2964 I AnrManager: /dev/binderfs/binder_logs/timeout_log isn't exist
行  15339: 07-02 10:13:56.790  1000  1674  2963 I AnrManager: dumpStackTraces begin!

// 堆栈信息转储结束。
行  15414: 07-02 10:14:00.878  1000  1674  2963 I AnrManager: dumpStackTraces end!
行  15415: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: ANR in com.android.launcher (com.android.launcher/.uioverrides.QuickstepLauncher), time=41755
行  15416: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: Reason: Input dispatching timed out (Application does not have a focused window)

// 这是系统的负载信息，分别代表1分钟、5分钟和15分钟的系统平均负载。这里表示系统的负载较高，特别是
// 在过去1分钟内。
行  15417: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: Load: 10.76 / 2.71 / 0.91

// 这是从 /proc/pressure/memory 文件中提取的内存压力信息。avg10, avg60, avg300 
// 分别是过去10秒、60秒和300秒的内存压力统计值。这里显示内存压力为0，说明在该时间段内系统并没有
// 内存压力。
行  15418: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: ----- Output from /proc/pressure/memory -----
行  15419: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: some avg10=0.00 avg60=0.00 avg300=0.00 total=0
行  15420: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: full avg10=0.00 avg60=0.00 avg300=0.00 total=0
行  15421: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: ----- End output from /proc/pressure/memory -----
行  15422: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: 
行  15423: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: Android time :[2024-07-02 10:14:00.87] [45.992]

// 这是CPU使用情况报告，显示在过去6.4秒内各个进程的CPU使用率。
行  15424: 07-02 10:14:00.882  1000  1674  2963 I AnrManager: CPU usage from 6404ms to 0ms ago (2024-07-02 10:13:50.238 to 2024-07-02 10:13:56.642):

// 1674/system_server 使用了45%的CPU时间，其中28%用于用户态，17%用于内核态，另外有2881次轻微
// 页面错误（minor faults），9次重大页面错误（major faults）。
行  15425: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   45% 1674/system_server: 28% user + 17% kernel / faults: 2881 minor 9 major

// 691/surfaceflinger 和其他进程的CPU使用情况也被详细列出
行  15426: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   36% 691/surfaceflinger: 24% user + 12% kernel / faults: 1263 minor
行  15427: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   32% 1992/com.android.systemui: 20% user + 12% kernel / faults: 379 minor
行  15428: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   27% 2790/android.process.acore: 25% user + 1.7% kernel / faults: 3484 minor 31 major
行  15429: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   21% 676/android.hardware.graphics.composer@2.1-service: 10% user + 10% kernel / faults: 851 minor
行  15430: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   20% 669/android.hardware.audio.service.mediatek: 9.9% user + 10% kernel
行  15431: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   12% 688/audioserver: 7.6% user + 4.5% kernel / faults: 119 minor 1 major
行  15432: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   9% 326/logd: 2% user + 7% kernel / faults: 557 minor
行  15433: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   7.4% 2126/com.android.networkstack.process: 5.7% user + 1.7% kernel / faults: 1353 minor 7 major
行  15434: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   4.2% 893/mobile_log_d: 1.8% user + 2.3% kernel / faults: 210 minor
行  15435: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   3.2% 518/kfps: 0% user + 3.2% kernel
行  15436: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   2.9% 684/android.hardware.memtrack-service.mediatek: 0.6% user + 2.3% kernel / faults: 824 minor
行  15437: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   2.6% 2144/com.android.permissioncontroller: 1.7% user + 0.9% kernel / faults: 234 minor
行  15438: 07-02 10:14:00.882  1000  1674  2963 I AnrManager:   2.6% 2293/com.android.phone: 2% user + 0.6% kernel / faults: 1004 minor
...

// 整个系统的CPU使用情况，总计36%的CPU使用率，其中19%是用户态，14%是内核态，IRQ（中断）占1.6%。
行  15506: 07-02 10:14:00.883  1000  1674  2963 I AnrManager: 36% TOTAL: 19% user + 14% kernel + 0% iowait + 1.6% irq + 0.4% softirq

// 这是在短时间内（从10:13:56.791到10:13:57.539之间）更详细的CPU使用情况。
// 1674/system_server 使用了74%的CPU，2963/AnrConsumer占用了43%的CPU（15%用户态，
// 28%内核态），以及其他子线程的使用情况。
行  15507: 07-02 10:14:00.883  1000  1674  2963 I AnrManager: CPU usage from 148ms to 897ms later (2024-07-02 10:13:56.791 to 2024-07-02 10:13:57.539):
行  15508: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:   74% 1674/system_server: 33% user + 41% kernel / faults: 240 minor
行  15509: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     43% 2963/AnrConsumer: 15% user + 28% kernel
行  15510: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     5.1% 1711/binder:1674_1: 5.1% user + 0% kernel
行  15511: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     5.1% 1720/android.display: 0% user + 5.1% kernel
行  15512: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     2.5% 1718/android.ui: 2.5% user + 0% kernel
行  15513: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     2.5% 1733/batterystats-ha: 2.5% user + 0% kernel
行  15514: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     2.5% 1821/InputDispatcher: 2.5% user + 0% kernel
行  15515: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     2.5% 1822/system_server: 0% user + 2.5% kernel
行  15516: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     2.5% 1823/InputReader: 2.5% user + 0% kernel
行  15517: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     2.5% 1901/RenderThread: 2.5% user + 0% kernel
行  15518: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     2.5% 2332/binder:1674_9: 2.5% user + 0% kernel
行  15519: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:   35% 691/surfaceflinger: 25% user + 10% kernel / faults: 130 minor
行  15520: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     20% 691/surfaceflinger: 17% user + 3.4% kernel
行  15521: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     5.1% 1062/surfaceflinger: 5.1% user + 0% kernel
行  15522: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     5.1% 1785/binder:691_3: 1.7% user + 3.4% kernel
行  15523: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     3.4% 1053/TimerDispatch: 1.7% user + 1.7% kernel
行  15524: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     1.7% 772/binder:691_2: 0% user + 1.7% kernel
行  15525: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:     1.7% 1054/app: 0% user + 1.7% kernel
行  15526: 07-02 10:14:00.883  1000  1674  2963 I AnrManager:   47% 1992/com.android.systemui: 27% user + 19% kernel / faults: 6 minor
...

// 这行日志记录了系统整体的CPU使用情况：
//	•	总使用率为32%。
//	•	其中 15% 是用户态（user mode），即应用程序或用户空间的进程使用的CPU时间。
//	•	14% 是内核态（kernel mode），即操作系统内核或设备驱动程序占用的CPU时间。
//	•	1.7% 是硬件中断（irq），表示系统响应外部硬件设备的中断请求所占用的CPU时间。
//	•	0.5% 是软中断（softirq），这通常与处理一些高优先级任务如网络包等相关。
行  15559: 07-02 10:14:00.883  1000  1674  2963 I AnrManager: 32% TOTAL: 15% user + 14% kernel + 1.7% irq + 0.5% softirq
行  15560: 07-02 10:14:00.883  1000  1674  2963 I AnrManager: dumpAnrDebugInfo end: AnrDumpRecord{ Input dispatching timed out (Application does not have a focused window) ProcessRecord{6ce010b 2378:com.android.launcher/u0a63} IsCompleted:true IsCancelled:false }, onlyDumpSelf = false , isSilentANR = false
行  15561: 07-02 10:14:00.884  1000  1674  2963 I AnrManager: addErrorToDropBox app = ProcessRecord{6ce010b 2378:com.android.launcher/u0a63} processName = com.android.launcher activityShortComponentName = com.android.launcher/.uioverrides.QuickstepLauncher parentShortComponentName = com.android.launcher/.uioverrides.QuickstepLauncher parentProcess = ProcessRecord{6ce010b 2378:com.android.launcher/u0a63} annotation = Input dispatching timed out (Application does not have a focused window) mTracesFile = /data/anr/anr_2024-07-02-10-13-57-639
行  15562: 07-02 10:14:00.886  1000  1674  2963 I AnrManager:  controller = null
```