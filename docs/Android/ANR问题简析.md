# ANR问题简析

ANR问题，相信是每位开发日常都会遇到的问题，对于这类问题的分析，按照官方的推荐，或网络博客的总结思路能解决一定的问题，但是多数时候大家的困惑就是应用本逻辑很简单，耗时很短或应用堆栈完全正常，或者或处于空闲状态，可系统为什么就认为接收者发生ANR了呢？下面将之前公司的一次内部分享开放出来，用几个实例从不同角度分析导致ANR产生的Root Case。也希望对大家以后分析该类问题有一定参考，不对的地方欢迎大家拍砖。

## 1.ANR类型
1. 广播ANR
2. Service ANR
3. ContentProvider ANR
4. Input ANR
5. 面向系统：WatchDog

## 2.产生ANR原因，如下几种：
1. 主线程耗时操作
2. 主线程被其它线程Block
3. 系统级响应阻塞
4. 系统或进程自身可用内存紧张
5. CPU资源被抢占
对于这些ANR，先给大家的推荐一下大致分析思路和相关日志，通常发生ANR时，首先去查找对应`Trace日志`，看看主线程是否在处理该广播或被阻塞，如果发现上述现象，那么恭喜你，已经很接近答案了。但如果发现堆栈完全处于空闲状态，那么很不幸，就需要扩大参考面了，需要结合log日志进行分析，日志包括`logcat`, `kernel日志`，`cpuinfo`以及`meminfo`等，参考顺序从前向后。

1、`分析logcat思路`：首先在日志中搜索（“`anr in`”，“`low_memory`”, “`slow_operation`”）等关键字，通过该类关键字主要是查看系统Cpu负载，如果是发现应用进程CPU明显过高，那么很有可能是该进程抢占CPU过多导致，系统调度不及时,误认为应用发生了超时行为。

2、`分析kernel思路`：在此类日志中直接搜索`lowmemorykiller`, 如果存在则查看发生时间和ANR时间是否大致对应，相差无几的话，可以从该日志中看到操作系统层面当前内存情况，`Free Memory`说明的是空闲物理内存，`File Free`说明的则是文件`Cache`，也就是应用或系统从硬盘读取文件，使用结束后，`kernel`并没有这正释放这类内存，加以缓存，目的是为了下次读写过程加快速度。当然，发现Free和Other整体数值都偏低时，Kernel会进行一定程度的内存交换，导致整个系统卡顿。同时这类现象也会体现在log日志“`slow_operation`”中，即系统进程的调度也会收到影响。

3、`分析cpuinfo思路`：这类日志一目了然，可以清晰的看到哪类进程CPU偏高，如果存在明显偏高进程，那么ANR和此进程抢占CPU有一定关系。当然，如发现`Kswapd`，`emmc`进程在top中，则说明遇到系统内存压力或文件IO开销。

4、`分析meminfo思路`：分析该类日志，主要是看哪类应用或系统占用内存偏高，如果应用内存占用比较正常，系统也没有发生过度内存使用，那么则说明系统中缓存了大量进程，并没有及时释放导致系统整体内存偏低。

5、综合分析当时系统环境：例如电量（低电可能会引起手机限频，限核等等），手机温度（温度过高也可能会引起限频），以及操作频率（例如执行monkey测试）等等；

## 3.实例一：主线程进行耗时操作，或被进程内其它线程阻塞，示例：
第一步，观察Trace 主线程堆栈，发现主线程在申请内存过程中被block，等待GC结束，但通过堆栈进一步发现其GC并没有发生在该线程，也就是说在其他线程在执行GC动作，而主线程在申请内存过程中需要等待GC完成，再进一步申请内存。

::: code-group
``` txt
"main" prio=5 tid=1 WaitingForGcToComplete

  native: #00 pc 0000000000019980  /system/lib64/libc.so (syscall+28)
  native: #01 pc 000000000013a62c  /system/lib64/libart.so (_ZN3art17ConditionVariable4WaitEPNS_6ThreadE+136)
  native: #02 pc 0000000000237f14  /system/lib64/libart.so (_ZN3art2gc4Heap19WaitForGcToCompleteENS0_7GcCauseEPNS_6ThreadE+1376)
  native: #03 pc 000000000024798c  /system/lib64/libart.so (_ZN3art2gc4Heap22AllocateInternalWithGcEPNS_6ThreadENS0_13AllocatorTypeEmPmS5_S5_PPNS_6mirror5ClassE+168)
  native: #04 pc 000000000050394c  /system/lib64/libart.so (artAllocObjectFromCodeRosAlloc+1412)
  native: #05 pc 00000000001215d0  /system/lib64/libart.so (art_quick_alloc_object_rosalloc+64)
  native: #06 pc 00000000018e72f0  /system/framework/arm64/boot.oat (Java_android_widget_TextView__0003cinit_0003e__Landroid_content_Context_2Landroid_util_AttributeSet_2II+1156)
  at android.widget.TextView.<init>(TextView.java:727)
  at android.widget.TextView.<init>(TextView.java:682)
  at android.widget.TextView.<init>(TextView.java:678)
  at java.lang.reflect.Constructor.newInstance!(Native method)
:::

第二步，再看看其它线程状态，进一步查找发现，下面任务正在执行GC

::: code-group
``` txt
"LeuiRunningState:Background" prio=5 tid=28 WaitingPerformingGc
"AsyncTask #6" prio=5 tid=20 WaitingPerformingGc
:::

综上可以得出大致结论，Tid=28,20线程执行GC,导致主线程申请内存被 Block.  但是进一步思考，应用GC是常有的事，但是为何这次需要这么长时间呢，带着疑问我们看看进程的内存使用情况：

::: code-group
``` txt
Total number of allocations 9887486
Total bytes allocated 732MB
Total bytes freed 476MB
Free memory 5KB
Free memory until GC 5KB
Free memory until OOME 5KB
Total memory 256MB
Max memory 256MB
```
:::


上面发现，应用已使用256Mb, 距离OOM只有5K，内存对象超过998万个，也就是说GC过程需要扫描这些对象的巨大部分，导致耗时很久，另外内存距离OOM只有5kb，说明有内存泄漏，或内存使用不合理。
综上，对于这个问题得出结论，应用进程内存存在泄漏或使用不当，导致GC时间过程，产生ANR。

## 4.实例二：应用内部线程逻辑依赖关系导致超时，触发ANR，示例：

第一步，观察Trace 主线程堆栈，发现主线程在Binder通信过程被Block.

::: code-group
``` txt
"main" prio=5 tid=1 Native
  | group="main" sCount=1 dsCount=0 obj=0x75f0eaa8 self=0x7fad046a00
  | sysTid=4298 nice=-6 cgrp=default sched=0/0 handle=0x7fb1d18fe8
  | state=S schedstat=( 79488910537 19985244611 169915 ) utm=6564 stm=1384 core=0 HZ=100
  | stack=0x7fc237c000-0x7fc237e000 stackSize=8MB
  | held mutexes=
  kernel: (couldn't read /proc/self/task/4298/stack)
  native: #00 pc 00000000000683d0  /system/lib64/libc.so (__ioctl+4)
  native: #01 pc 00000000000723f8  /system/lib64/libc.so (ioctl+100)
  native: #02 pc 000000000002d584  /system/lib64/libbinder.so (_ZN7android14IPCThreadState14talkWithDriverEb+164)
  native: #03 pc 000000000002e050  /system/lib64/libbinder.so (_ZN7android14IPCThreadState15waitForResponseEPNS_6ParcelEPi+104)
  native: #04 pc 000000000002e2c4  /system/lib64/libbinder.so (_ZN7android14IPCThreadState8transactEijRKNS_6ParcelEPS1_j+176)
  native: #05 pc 0000000000025654  /system/lib64/libbinder.so (_ZN7android8BpBinder8transactEjRKNS_6ParcelEPS1_j+64)
  native: #06 pc 00000000000e0928  /system/lib64/libandroid_runtime.so (???)
  native: #07 pc 000000000139ba24  /system/framework/arm64/boot.oat (Java_android_os_BinderProxy_transactNative__ILandroid_os_Parcel_2Landroid_os_Parcel_2I+200)
  at android.os.BinderProxy.transactNative(Native method)
  at android.os.BinderProxy.transact(Binder.java:503)
  at android.nfc.INfcAdapter$Stub$Proxy.setAppCallback(INfcAdapter.java:529)
  at android.nfc.NfcActivityManager.requestNfcServiceCallback(NfcActivityManager.java:339)
  at android.nfc.NfcActivityManager.setNdefPushMessageCallback(NfcActivityManager.java:309)
:::

第二步，进一步查找此线程在和哪个进程进行通信，搜索关键字“setAppCallback”（Android命名习惯，客户端和服务端函数命名基本相同），在Nfc的Binder_3线程响应了客户端请求，但在处理过程中被线程1阻塞，顺着再看看线程1状态

::: code-group
``` txt
"Binder_3" prio=5 tid=17 Blocked

  | group="main" sCount=1 dsCount=0 obj=0x12ddf0a0 self=0x7fa670f000
  | sysTid=3183 nice=-6 cgrp=default sched=0/0 handle=0x7f93c30440
  | state=S schedstat=( 3041465858 2637156615 16961 ) utm=168 stm=136 core=3 HZ=100
  | stack=0x7f93b34000-0x7f93b36000 stackSize=1013KB
  | held mutexes=
  at com.android.nfc.P2pLinkManager.setNdefCallback(P2pLinkManager.java:420)
  - waiting to lock <0x0bed0520> (a com.android.nfc.P2pLinkManager) held by thread 1
  at com.android.nfc.NfcService$NfcAdapterService.setAppCallback(NfcService.java:1679)
  at android.nfc.INfcAdapter$Stub.onTransact(INfcAdapter.java:178)
  at android.os.Binder.execTransact(Binder.java:453)

"main" prio=5 tid=1 Native
  | group="main" sCount=1 dsCount=0 obj=0x75f0eaa8 self=0x7fad046a00
  | sysTid=2706 nice=0 cgrp=default sched=0/0 handle=0x7fb1d18fe8
  | state=S schedstat=( 115355173189 36125520701 224819 ) utm=8594 stm=2941 core=0 HZ=100
  | stack=0x7fc237c000-0x7fc237e000 stackSize=8MB
  | held mutexes=
  kernel: (couldn't read /proc/self/task/2706/stack)
  native: #00 pc 00000000000683d0  /system/lib64/libc.so (__ioctl+4)
  native: #01 pc 00000000000723f8  /system/lib64/libc.so (ioctl+100)
  native: #02 pc 000000000002d584  /system/lib64/libbinder.so (_ZN7android14IPCThreadState14talkWithDriverEb+164)
  native: #03 pc 000000000002e050  /system/lib64/libbinder.so (_ZN7android14IPCThreadState15waitForResponseEPNS_6ParcelEPi+104)
  native: #04 pc 000000000002e2c4  /system/lib64/libbinder.so (_ZN7android14IPCThreadState8transactEijRKNS_6ParcelEPS1_j+176)
  native: #05 pc 0000000000025654  /system/lib64/libbinder.so (_ZN7android8BpBinder8transactEjRKNS_6ParcelEPS1_j+64)
  native: #06 pc 00000000000e0928  /system/lib64/libandroid_runtime.so (???)
  native: #07 pc 000000000139ba24  /system/framework/arm64/boot.oat (Java_android_os_BinderProxy_transactNative__ILandroid_os_Parcel_2Landroid_os_Parcel_2I+200)
  at android.os.BinderProxy.transactNative(Native method)
  at android.os.BinderProxy.transact(Binder.java:503)
  at android.nfc.IAppCallback$Stub$Proxy.createBeamShareData(IAppCallback.java:113)
  at com.android.nfc.P2pLinkManager.prepareMessageToSend(P2pLinkManager.java:558)
  - locked <0x0bed0520> (a com.android.nfc.P2pLinkManager)
```
:::

通过主线程，又发现正进程Binder通信，同时被block,搜索关键字“createBeamShareData”，发现又回到浏览器线程，Binder_6线程响应此请求，同时也处于Waiting状态

::: code-group
``` txt
"Binder_6" prio=5 tid=12 Waiting
  | group="main" sCount=1 dsCount=0 obj=0x12c13a00 self=0x7f52850e00
  | sysTid=23857 nice=0 cgrp=default sched=0/0 handle=0x7f694ff440
  | state=S schedstat=( 705897380 828401158 3677 ) utm=45 stm=25 core=1 HZ=100
  | stack=0x7f69403000-0x7f69405000 stackSize=1013KB
  | held mutexes=
  at java.lang.Object.wait!(Native method)
  - waiting on <0x08a80433> (a java.lang.Object)
  at java.lang.Thread.parkFor$(Thread.java:1220)
  - locked <0x08a80433> (a java.lang.Object)
  at sun.misc.Unsafe.park(Unsafe.java:299)
  at java.util.concurrent.locks.LockSupport.park(LockSupport.java:158)
  at java.util.concurrent.locks.AbstractQueuedSynchronizer.parkAndCheckInterrupt(AbstractQueuedSynchronizer.java:810)
  at java.util.concurrent.locks.AbstractQueuedSynchronizer.doAcquireSharedInterruptibly(AbstractQueuedSynchronizer.java:970)
  at java.util.concurrent.locks.AbstractQueuedSynchronizer.acquireSharedInterruptibly(AbstractQueuedSynchronizer.java:1278)
  at java.util.concurrent.CountDownLatch.await(CountDownLatch.java:203)
  at com.android.browser.NfcHandler.createNdefMessage(NfcHandler.java:92)
  at android.nfc.NfcActivityManager.createBeamShareData(NfcActivityManager.java:377)
  at android.nfc.IAppCallback$Stub.onTransact(IAppCallback.java:53)
  at android.os.Binder.execTransact(Binder.java:453)
```
:::

为什么Binder_6处于Waiting状态？这就需要大家结合Read the Fuck Code的精神研究逻辑了，事后发现此线程的事件放在了主线程执行，当执行完毕后接收通知，停止waiting.

至此，我们找到了一条完整的链路，（ **浏览器主线程** ----> **NFC Binder_3** ----> **NFC主线程** ----> **浏览器 Binder_6** ----> **浏览器主线程** ），大家到此看到了根本原因，**死锁！！！**

综上，对于这个问题得出结论，应用通信过程中发生死锁导致ANR，后面只需解锁即可。

上面两类问题，相对简单，大家遇到时也多半能自行分析解决，下面两类涉及到较多系统或其它因素，问题比较隐晦，但是按照一定分析思路，静下来分析，多数时候还是能找到原因或给出优化方案的。

## 5.实例三：系统内存过低，kernel进行内存交换过程会引起整个系统运行缓慢(卡顿)，示例：

第一步，观察Trace 主线程堆栈，发现主线程处于Suspend状态；发生此类问题一般是两种情况，一种是进程自身过于繁忙，每次分配时间片都不够用，调度器强制把它置换成休眠了，另一种是系统比较繁忙，低优先级集成得不到时间片；带着这样的疑问，继续看：

::: code-group
``` txt
"main" prio=5 tid=1 Suspended
  | group="main" sCount=1 dsCount=0 obj=0x745518a0 self=0x7f86254a00
  | sysTid=21916 nice=0 cgrp=default sched=0/0 handle=0x7f8b30efc8
  | state=S schedstat=( 311762801762 96254728754 409881 ) utm=25610 stm=5566 core=0 HZ=100
  | stack=0x7fd023c000-0x7fd023e000 stackSize=8MB
  | held mutexes=
  at java.util.regex.Splitter.fastSplit(Splitter.java:73)
  at java.lang.String.split(String.java:1410)
  at java.lang.String.split(String.java:1392)
  at android.content.res.theme.LeResourceHelper.getResName(LeResourceHelper.java:193)
  at android.content.res.Resources.loadDrawable(Resources.java:2624)
  at android.content.res.Resources.getDrawable(Resources.java:862)
  at android.content.Context.getDrawable(Context.java:458)
  at android.widget.ImageView.resolveUri(ImageView.java:813)
```
:::


这个时候可以看看应用逻辑是否会存在繁忙操作不停抢占时间片，另一方面可以看看对应日志，通过logcat发现如下信息，

::: code-group
``` txt
11-17 09:49:41.392  1532  1574 E ActivityManager: ANR in com.android.systemui
11-17 09:49:41.392  1532  1574 E ActivityManager: PID: 21916
11-17 09:49:41.392  1532  1574 E ActivityManager: Reason: Broadcast of Intent { act=android.intent.action.TIME_TICK flg=0x50000014 mCallingUid=1000 (has extras) }
11-17 09:49:41.392  1532  1574 E ActivityManager: Load: 22.72 / 20.06 / 15.54  /分别对应1分钟/5分钟/15分钟/
11-17 09:49:41.392  1532  1574 E ActivityManager: CPU usage from 3ms to 24033ms later:
11-17 09:49:41.392  1532  1574 E ActivityManager:   60% 134/kswapd0: 0% user + 60% kernel
11-17 09:49:41.392  1532  1574 E ActivityManager:   32% 1532/system_server: 7.4% user + 25% kernel / faults: 31214 minor 423 major
```
:::

系统整体负载很重，常规下负载在10左右；另外发现kswapdCPU占用率极高，通过这两项可以得到系统内存偏低，不停kill进程并发生内存交换，是不是这样的呢？我们再搜索一下其它关键字Slow operation：

::: code-group
``` txt
11-17 09:42:25.292  1532  1572 W ActivityManager: Slow operation: 2440ms so far, now at startProcess: returned from zygote!
11-17 09:42:25.357  1532  1572 W ActivityManager: Slow operation: 2505ms so far, now at startProcess: done updating battery stats
11-17 09:42:25.357  1532  1572 I am_proc_start: [0,30188,10088,com.letv.android.usagestats,service,com.letv.android.usagestats/.UsageStatsReportService]
11-17 09:42:25.357  1532  1572 W ActivityManager: Slow operation: 2505ms so far, now at startProcess: building log message
11-17 09:42:25.357  1532  1572 I ActivityManager: Start proc 30188:com.letv.android.usagestats/u0a88 for service com.letv.android.usagestats/.UsageStatsReportService
11-17 09:42:25.357  1532  1572 W ActivityManager: Slow operation: 2505ms so far, now at startProcess: starting to update pids map
11-17 09:42:25.357  1532  1572 W ActivityManager: Slow operation: 2505ms so far, now at startProcess: done updating pids map
11-17 09:42:25.385  1532  1572 W ActivityManager: Slow operation: 2534ms so far, now at startProcess: done starting proc!
```
:::

发现普通系统函数执行一次就耗费了2S以上，足见系统卡顿。现在我们继续延着内存方向确认，看看meminfo日志吧

::: code-group
``` txt
Total PSS by process:
  3441530 kB: com.android.mms (pid 2518 / activities)
  229272 kB: mediaserver (pid 763)
```
:::

通过PSS发现，SMS进程内存占用超过3G！对，第一反应就是内存泄漏，普通应用甚至系统内存占用根本不可能达到这么多。如果大家有时间可以看看kernel日志，搜索lowmemoryKiller，发生问题时间内一定有大量的进程被kill.

综上，对于这个问题得出结论，应用在Native层发生内存泄漏(不要问我为什么不是Java层发生这么多内存泄漏@@)。导致系统整体内存吃紧，又因为其本身Persist属性，具有很高优先级（-12），LMK不会将其Kill.只能不停Kill其它应用，并进程内存交换。