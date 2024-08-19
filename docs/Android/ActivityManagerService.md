# ActivityManagerService

## 1. 概述

 `AMS` 是Android提供的一个用于管理Activity运行状态的系统进程，也是编写APK应用时使用最频繁的系统服务。

AMS中最重要的两个核心就是 `ActivityTask` 和 `ActivityStack`, 其中**ActivityStack是Activity的记录者与管理者，同时也为AMS管理系统运行情况提供了基础**。**ActivityTask是**

AMS也是寄存于systemserver中的，它会在系统启动时，创建一个线程来循环处理客户的请求。AMS会向ServiceManager登记多种BinderServer如activity、meminfo、cpuinfo，不过只有activity才是AMS服务的主要对象，并由其实现，剩余的功能是其他service提供的。

源码

ActivityManagerService类提供了一个静态的main函数，通过它可以轻松启动AMS，然后调用setSystemProcess来把这个重要的系统服务注册到ServiceManager。由此可见它和WMS一样，都是实名的BinderServer。

1. 组件状态管理

所有四大组件的状态，包括其开启、关闭等，如startActivity、startActivityAndWait、activityPaused、startService、stopService、removeContentProvider等。

2. 组件状态查询

这类函数用于查询组件当前的运行状况，如getCallingActivity、getServices等。

3. Task相关

Task相关的方法包括removeSubTask、removeTask、moveTaskBackwards、moveTaskToFront等

4. 其他

AMS还提供了许多辅助功能，系统运行时信息的查询getMemoryInfo、setDebugApp等。

## 2. 管理当前Activity状态的ActivityStack

mMainStack变量和源码


1. ActivityState

一共有以下几种状态：

enum Activtiy {
    INITIALIZING, // 初始化状态
    RESUMED, // 恢复状态
    PAUSING, // 正在暂停
    PAUSED, // 已暂停
    STOPPING, // 正在停止
    STOPPED, // 已停止
    FINISHING, // 正在完成
    DESTORYING, // 正在销毁
    DESTORYED, // 已销毁
}

2. 一系列ArrayList<ActivityRecord>成员变量：记录每个Activity的运行时信息

一句话描述:AMS是通过ActivityStack来记录、管理系统中的Activity和其他组件的状态，并提供查询功能的一个系统服务。

AMS是系统进程的一部分，运行在一个独立的线程中。其主要的工作就是管理、记录和查询。类似于户籍办，办理登记和查询。AMS的任务只是保管Activity的状态信息，而像Activity中描述的UI界面如何显示是WindowManagerService和SurfaceFlinger完成的。
