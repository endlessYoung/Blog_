# EventLog日志

## 前言：终端调试命令

::: code-group
``` shell
adb logcat -b events # 会打印出EventLog信息
```
:::

## 一、ActivityManager

| Num   | TagName                       | 格式                                                               | 功能               |
|-------|-------------------------------|--------------------------------------------------------------------|--------------------|
| 30001 | am_finish_activity            | User, Token, TaskID, ComponentName, Reason                         |                    |
| 30002 | am_task_to_front              | User, Task                                                         |                    |
| 30003 | am_new_intent                 | User, Token, TaskID, ComponentName, Action, MIMEType, URI, Flags   |                    |
| 30004 | am_create_task                | User, Task ID                                                      |                    |
| 30005 | am_create_activity            | User, Token, TaskID, ComponentName, Action, MIMEType, URI, Flags   |                    |
| 30006 | am_restart_activity           | User, Token, TaskID, ComponentName                                 |                    |
| 30007 | am_resume_activity            | User, Token, TaskID, ComponentName                                 |                    |
| 30008 | am_anr                        | User, pid, Package Name, Flags, reason                             | ANR                |
| 30009 | am_activity_launch_time       | User, Token, ComponentName, time                                   |                    |
| 30010 | am_proc_bound                 | User, PID, ProcessName                                             |                    |
| 30011 | am_proc_died                  | User, PID, ProcessName                                             |                    |
| 30012 | am_failed_to_pause            | User, Token, Wanting to pause, Currently pausing                   |                    |
| 30013 | am_pause_activity             | User, Token, ComponentName                                         |                    |
| 30014 | am_proc_start                 | User, PID, UID, ProcessName, Type, Component                       |                    |
| 30015 | am_proc_bad                   | User, UID, ProcessName                                             |                    |
| 30016 | am_proc_good                  | User, UID, ProcessName                                             |                    |
| 30017 | am_low_memory                 | NumProcesses, Lru                                                  |                    |
| 30018 | am_destroy_activity           | User, Token, TaskID, ComponentName, Reason                         |                    |
| 30019 | am_relaunch_resume_activity   | User, Token, TaskID, ComponentName                                 |                    |
| 30020 | am_relaunch_activity          | User, Token, TaskID, ComponentName                                 |                    |
| 30021 | am_on_paused_called           | User, ComponentName                                                |                    |
| 30022 | am_on_resume_called           | User, ComponentName                                                |                    |
| 30023 | am_kill                       | User, PID, ProcessName, OomAdj, Reason                             | 杀进程             |
| 30024 | am_broadcast_discard_filter   | User, Broadcast, Action, ReceiverNumber, BroadcastFilter           |                    |
| 30025 | am_broadcast_discard_app      | User, Broadcast, Action, ReceiverNumber, App                       |                    |
| 30030 | am_create_service             | User, ServiceRecord, Name, UID, PID                                |                    |
| 30031 | am_destroy_service            | User, ServiceRecord, PID                                           |                    |
| 30032 | am_process_crashed_too_much   | User, Name, PID                                                    |                    |
| 30033 | am_drop_process               | PID                                                                |                    |
| 30034 | am_service_crashed_too_much   | User, Crash Count, ComponentName, PID                              |                    |
| 30035 | am_schedule_service_restart   | User, ComponentName, Time                                          |                    |
| 30036 | am_provider_lost_process      | User, Package Name, UID, Name                                      |                    |
| 30037 | am_process_start_timeout      | User, PID, UID, ProcessName, |timeout                               |                    |
| 30039 | am_crash                      | User, PID, ProcessName, Flags, Exception, Message, File, Line      | Crash              |
| 30040 | am_wtf                        | User, PID, ProcessName, Flags, Tag, Message                        | Wtf                |
| 30041 | am_switch_user                | id                                                                 |                    |
| 30042 | am_activity_fully_drawn_time  | User, Token, ComponentName, time                                   |                    |
| 30043 | am_focused_activity           | User, ComponentName                                                |                    |
| 30044 | am_home_stack_moved           | User, To Front, Top Stack Id, Focused Stack Id, Reason             |                    |
| 30045 | am_pre_boot                   | User, Package                                                      |                    |
| 30046 | am_meminfo                    | Cached, Free, Zram, Kernel, Native                                 | 内存               |
| 30047 | am_pss                        | Pid, UID, ProcessName, Pss, Uss | 进程                 |                    |


**tag可能使用的部分场景：**

am_low_memory：位于AMS.killAllBackgroundProcesses或者AMS.appDiedLocked，记录当前Lru进程队列长度。<br>
am_pss：位于AMS.recordPssSampleLocked<br>
am_meminfo：位于AMS.dumpApplicationMemoryUsage<br>
am_proc_start:位于AMS.startProcessLocked，启动进程<br>
am_proc_bound:位于AMS.attachApplicationLocked<br>
am_kill: 位于ProcessRecord.kill，杀掉进程<br>
am_anr: 位于AMS.appNotResponding<br>
am_crash:位于AMS.handleApplicationCrashInner<br>
am_wtf:位于AMS.handleApplicationWtf<br>
am_activity_launch_time：位于ActivityRecord.reportLaunchTimeLocked()，后面两个参数分别是thisTime和 totalTime.<br>
am_activity_fully_drawn_time:位于ActivityRecord.reportFullyDrawnLocked, 后面两个参数分别是thisTime和 totalTime<br>
am_broadcast_discard_filter:位于BroadcastQueue.logBroadcastReceiverDiscardLocked<br>
am_broadcast_discard_app:位于BroadcastQueue.logBroadcastReceiverDiscardLocked<br>

**Activity生命周期相关的方法:**

am_on_resume_called: 位于AT.performResumeActivity<br>
am_on_paused_called: 位于AT.performPauseActivity, performDestroyActivity<br>
am_resume_activity: 位于AS.resumeTopActivityInnerLocked<br>
am_pause_activity: 位于AS.startPausingLocked<br>
am_finish_activity: 位于AS.finishActivityLocked, removeHistoryRecordsForAppLocked<br>
am_destroy_activity: 位于AS.destroyActivityLocked<br>
am_focused_activity: 位于AMS.setFocusedActivityLocked, clearFocusedActivity<br>
am_restart_activity: 位于ASS.realStartActivityLocked<br>
am_create_activity: 位于ASS.startActivityUncheckedLocked<br>
am_new_intent: 位于ASS.startActivityUncheckedLocked<br>
am_task_to_front: 位于AS.moveTaskToFrontLocked<br>

## 二、Power

| Num | TagName                 | 格式                                     | 功能                                                         |
|-----|------------------------|------------------------------------------|--------------------------------------------------------------|
| 2722 | battery_level          | level, voltage, temperature              | 电池电量、电压、温度信息                                       |
| 2723 | battery_status         | status, health, present, plugged, technology | 电池状态、健康状况、是否插入、充电状态、电池类型             |
| 2730 | battery_discharge      | duration, minLevel, maxLevel              | 电池放电持续时间、最小电量水平、最大电量水平                   |
| 2724 | power_sleep_requested  | wakeLocksCleared                          | 睡眠请求，唤醒锁已清除的数量                                   |
| 2725 | power_screen_broadcast_send | wakelockCount                         | 屏幕广播发送，涉及的唤醒锁计数                               |
| 2726 | power_screen_broadcast_done | on, broadcastDuration, wakelockCount     | 屏幕广播完成，屏幕状态（开/关）、广播持续时间、唤醒锁计数     |
| 2727 | power_screen_broadcast_stop | which, wakelockCount                   | 屏幕广播停止，停止原因、涉及的唤醒锁计数，系统未完全就绪     |
| 2728 | power_screen_state     | offOrOn, becauseOfUser, totalTouchDownTime, touchCycles | 屏幕开关状态、是否因用户操作、总触控按下时间、触控周期数 |
| 2729 | power_partial_wake_state | releasedorAcquired, tag                  | 部分唤醒状态变更，释放或获取、标签标识                         |

battery_level: [19,3660,352] //剩余电量19%, 电池电压3.66v, 电池温度35.2℃<br>
power_screen_state: [0,3,0,0] // 灭屏状态(0), 屏幕超时(3). 当然还有其他设备管理策略(1),其他理由都为用户行为(2)<br>
power_screen_state: [1,0,0,0] // 亮屏状态(1)<br>

**列举tag可能使用的部分场景：**

power_sleep_requested: 位于PMS.goToSleepNoUpdateLocked<br>
power_screen_state:位于Notifer.handleEarlyInteractiveChange, handleLateInteractiveChange<br>

## 三、EventLog完整语义分析

在源码EventLogTags.java中,有大量类似的定义,那么括号中数字是什么含义呢? (以进程启动为例)

::: code-group
``` txt
30014 am_proc_start (User|1|5),(PID|1|5),(UID|1|5),(Process Name|3),(Type|3),(Component|3)
```
:::

am_proc_start之后紧跟着的几个括号，其中括号里的内容格式如下：

::: code-group
``` txt
(<name>|data type[|data unit])
(<名字>|数据类型[|数据单位])
```
:::

## 四、数据类型

1: int
2: long
3: string
4: list

## 五、数据单位

1: Number of objects(对象个数)
2: Number of bytes(字节数)
3: Number of milliseconds(毫秒)
4: Number of allocations(分配个数)
5: Id
6: Percent(百分比)

## 六、实例解析

::: code-group
``` txt
am_proc_start (User|1|5),(PID|1|5),(UID|1|5),(Process Name|3),(Type|3),(Component|3)
am_proc_start: [0,9227,10002,com.android.browser,content provider,com.android.browser/.provider.BrowserProvider2]
```
:::

**含义如下**：

进程启动: UserId=0, pid=9227, uid=10002, ProcessName=com.android.browser, 数据类型=ContentProvider, 组件=com.android.browser/.provider.BrowserProvider2

events_log中搜索“am_finish_activity”， 可以判断到底是APP自行结束的（正常结束，后面有app-request字样），还是被其他进程强制结束的(force-stop)

