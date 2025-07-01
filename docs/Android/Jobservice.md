# JobService


## 1. 什么是JobService

`JobService` 是一个安卓系统组件，继承自Sevice（实际为系统托管的特殊服务），用于在满足任务条件时由系统唤醒并运行。是 `JobScheduler` 派发任务时调用的组件，用于执行具体的后台逻辑。

::: code-group
``` java
public abstract class JobService extends Service
```
:::

## 2. JobService 的核心作用

1. **接收系统调度器（JobScheduler）的任务启动指令；**
2. **在合适条件下被唤醒（充电、网络空闲）；**
3. **异步执行后台任务；**
4. **通知系统任务完成状态（jobFinished）。**

## 3. JobService 的生命周期

| 方法                               | 作用                                                         |
|------------------------------------|------------------------------------------------------------|
| `onCreate()`                       | JobService 创建时调用（一般不需要特殊处理）                    |
| `onStartJob(JobParameters params)` | 系统条件满足时调用，开始执行任务                              |
| `onStopJob(JobParameters params)`  | 任务被中断（例如条件变化、资源紧张），或任务超时被系统终止时调用 |
| `onDestroy()`                      | 服务被销毁时调用                                             |

> 注意点：
> 1. `onStartJob` 必须尽快返回，不能阻塞！ `JobService` 是在主线程调用的，不能直接做耗时操作。
> 2. 如果任务是异步的，必须返回 `true`，表示任务还在运行。
> 3. 同步任务（很少用），可在 `onStartJob` 中直接完成并返回 `false`。
> 4. 当任务结束时，调用 `jobFinished(params, needsReschedule)`告诉系统任务结束。
第二个参数很关键：
true = 系统会重新调度任务（例如你希望失败重试）
false = 表示任务已完成，无需重试。
如果异步任务没调用 `jobFinished`，系统会认为任务一直挂着，不会释放资源。


## 4. JobService的用法

1. 创建一个类继承JobService并重写父类的onStartJob和onStopJob方法
2. 声明JobServiceID并创建一个JobInfo（Builder模式），设置好Job的启动条件
3. 获取JobSchedule服务执行任务

::: code-group
``` java
public class MyJobService extends JobService {

    @Override
    public boolean onStartJob(JobParameters params) {
        Log.d("MyJobService", "Job started: " + params.getJobId());

        // 异步执行任务
        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.execute(() -> {
            // 执行任务
            doWork();
            jobFinished(params, false);
        });

        return true; // 异步任务
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        Log.d("MyJobService", "Job stopped: " + params.getJobId());
        // 可以在这里中断任务，例如关闭线程等
        return false; // false = 不重试，true = 让系统重新调度
    }

    private void doWork() {
        try {
            Thread.sleep(2000); // 模拟任务
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```
:::

## 5. 高级用法与优化技巧

1. 结合前台服务提升执行优先级在 JobService 内临时启动短生命周期的前台服务，提高在 Doze 模式下的存活率。
2. 在 onStopJob 内做好任务中断清理：例如中断线程、关闭流，避免资源泄露。
3. 监控 JobService 的调度行为：可将 JobService 的启动、停止、完成情况写入日志文件或上报后台，用于监控调度效果。
4. 配合线程池、协程而非每次 new Thread：避免频繁创建线程，提升效率。