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

## 3. startActivity流程

startActivity用于启动一个Activit, 具体是什么Activity则是AMS通过系统中安装的所有程序包进行intent匹配得到的，并不局限于调用当前包的范围。
startActivity方法的调用流程：Activity1 -> startActivity@ContextImpl.java -> execStartActivity@Insturmentation.java -> startActivity@ActivityManagerService.java 

先介绍5个非常相近startActivity方法：
1. startActivity@ActivityManagerService.java
2. startActivityAsUser@ActivityManagerService.java
3. startActivityMayWait@ActivityStack.java
4. startActivityLocked@ActivityStack.java
5. startActivityUnheckedLocked@ActivityStack.java

这几个函数存在先后调用的关系。下面是源码

**需要填补**

## 4. ActivityTask

ActivityTask运用的是栈的管理方式，在AMS中就是众多Task的集合。Android提供了一系列的Flag标志来允许用户对Task进行实时调整。

### 4.1 管理ActivityTask

应用可以通过两种方法来影响ActivityTask的默认行为。

**方法1：在Activity标签中指定属性**

- android:taskAffinity
- android:launchMode
- android:allowTaskReparenting
- android:clearTaskOnLaunch
- android:alwaysRetainTaskState
- android:finishOnTaskLaunch

**方法2：使用Intent标志**
- FLAG_ACTIVITY_NEW_TASK
- FLAG_ACTIVITY_SINGLE_TOP
- FLAG_ACTIVITY_CLEAR_TOP
- FLAG_ACTIVITY_NO_HISTORY
- FLAG_ACTIVITY_MULTIPLE_TASK
- FLAG_ACTIVITY_EXCLUDES_FROM_RECENTS
- FLAG_ACTIVTIY_BROUGHT_TO_FRONT
- FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
- FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET
- FLAG_ACTIVITY_NO_USER_ACTION
- FLAG_ACTIVITY_REORDER_TO_FRONT
- FLAG_ACTIVITY_NO_ANIMATION
- FLAG_ACTIVITY_CLEAR_TASK
- FLAG_ACTIVITY_TASK_ON_HOME

## 5. Instrumentation机制

Instrumentation不仅可以自动化测试，而且可以使两个APK运行在同一个进程中，从而达到资源共享的目的。

Android在/system/bin下提供了很多中介程序来允许外部用户间接使用SystemService，例如pm、am等。

Instrumentation提供了允许用户获取应用与系统之间的交互流程的机制。
