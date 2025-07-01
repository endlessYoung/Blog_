# JobScheduler

## 1. 什么是JobScheduler

`JobScheduler` 是 Android 5.0（API 21）引入的系统级后台任务调度 API，旨在帮助开发者以低功耗、系统友好的方式执行后台任务。它提供条件触发、持久化、系统统一调度等机制，是 Google 在 Doze 模式、App Standby 等电量管理策略下推荐使用的后台执行方案。

## 2.  为什么使用 JobScheduler？
| 传统方案                   | 问题                                   |
|----------------------------|--------------------------------------|
| `AlarmManager` + `Service` | 精度差、执行时机不明确、难以管理任务重试 |
| 常驻 Service               | 高耗电，容易被系统限制或杀死            |
| Thread / HandlerThread     | 生命周期不可控、受 App 状态影响         |

**JobScheduler的优势**
1. 系统统一调度，降低电量消耗
2. 支持任务约束条件（网络/充电/空闲等）
3. 支持任务重试与失败恢复
4. 支持持久化（设备重启后仍可恢复）
5. 系统自动拉起 App 并调用任务执行（无须常驻服务）

## 3. JobScheduler 架构与工作机制

| 组件                  | 作用                                     |
|-----------------------|----------------------------------------|
| `JobInfo`             | 描述任务，包括执行条件、延迟策略等         |
| `JobService`          | 接收调度器回调，执行任务逻辑              |
| `JobScheduler`        | 提供任务调度 API，由 App 侧调用           |
| `JobSchedulerService` | 系统服务，统一管理 Job 条件监听与调度执行 |

## 4. 工作流程

::: code-group
``` scss
JobScheduler.schedule(JobInfo)
    ↓
系统保存 JobInfo（JobStore）
    ↓
监听执行条件（如网络状态、是否充电）
    ↓
条件满足，唤醒 App（即使已被杀）
    ↓
系统自动调用 JobService.onStartJob()
    ↓
任务异步执行，完成后调用 jobFinished()
```
:::

## 5. 使用方法

1. **JobInfo：任务描述**

::: code-group
``` java
new JobInfo.Builder(jobId, new ComponentName(context, MyJobService.class))
    .setRequiredNetworkType(JobInfo.NETWORK_TYPE_UNMETERED) // 需要 WiFi
    .setRequiresCharging(true) // 设备充电时执行
    .setRequiresDeviceIdle(false) // 空闲时执行
    .setMinimumLatency(3000) // 延迟至少3秒
    .setOverrideDeadline(10000) // 最迟10秒必须执行
    .setPersisted(true) // 重启后仍保留
    .setBackoffCriteria(3000, JobInfo.BACKOFF_POLICY_EXPONENTIAL) // 重试策略
    .build();
```
:::

2. **支持的网络类型**

NETWORK_TYPE_NONE（无网络要求）
NETWORK_TYPE_ANY（任意网络）
NETWORK_TYPE_UNMETERED（非计费网络，如 Wi-Fi）
NETWORK_TYPE_NOT_ROAMING（非漫游）
NETWORK_TYPE_CELLULAR（仅蜂窝）

3. **通过 `MyJobService` 执行任务**

::: code-group
``` java
public class MyJobService extends JobService {
    @Override
    public boolean onStartJob(JobParameters params) {
        new Thread(() -> {
            // 执行任务逻辑
            jobFinished(params, false); // false 表示任务完成，不重试
        }).start();
        return true; // 异步任务
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return true; // true 表示系统会尝试重试任务
    }
}
```
:::

4. **调度器使用**

::: code-group
``` java
JobScheduler scheduler = (JobScheduler) context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
scheduler.schedule(jobInfo);
```
:::

- `schedule(JobInfo)`：提交任务
- `cancel(jobId)`：取消任务
- `cancelAll()`：取消所有任务
- `getAllPendingJobs()`：获取当前所有挂起任务

## 6. 系统行为与限制说明
与 `Doze` 模式的关系
在 `Doze` 模式下，只有通过 `JobScheduler` 提交的任务才能被系统延迟批量调度（`Idle maintenance window`）。
**频繁提交 Job 不会立即执行，系统会智能合并执行以省电。**