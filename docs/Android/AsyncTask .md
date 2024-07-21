# AsyncTask

## 1. 什么是AsyncTask 

`AsyncTask` 是 Android 开发中用于执行后台操作并在完成后更新 UI 的一种便捷工具。尽管 AsyncTask 曾经是 Android 开发中的重要组成部分，但它在 **Android 11 (API Level 30) 中已被弃用**。推荐使用其他方式，如 Java 的 Executor 或 Kotlin 的协程来替代它。

## 2. AsyncTask 的基本使用

::: code-group
``` java
// 在 Activity 或 Fragment 中创建一个 AsyncTask 子类
private class MyAsyncTask extends AsyncTask<Void, Integer, String> {

    // 这个方法在后台线程中运行，不能操作 UI
    @Override
    protected String doInBackground(Void... voids) {
        for (int i = 0; i <= 100; i++) {
            // 模拟耗时操作
            SystemClock.sleep(50);
            // 更新进度
            publishProgress(i);
        }
        return "任务完成";
    }

    // 这个方法在主线程中运行，可以操作 UI
    @Override
    protected void onProgressUpdate(Integer... values) {
        super.onProgressUpdate(values);
        // 更新 UI 进度
        int progress = values[0];
        // 比如更新 ProgressBar 的进度
        progressBar.setProgress(progress);
    }

    // 这个方法在主线程中运行，可以操作 UI
    @Override
    protected void onPostExecute(String result) {
        super.onPostExecute(result);
        // 显示结果
        textView.setText(result);
    }
}

// 启动 AsyncTask
new MyAsyncTask().execute();
```
:::

## 3. 推荐的替代方法

使用 Java Executor
Executor 是一个更灵活和现代的线程管理工具。

::: code-group
``` java
ExecutorService executor = Executors.newSingleThreadExecutor();
Handler handler = new Handler(Looper.getMainLooper());

executor.execute(new Runnable() {
    @Override
    public void run() {
        // 在后台线程中执行任务
        String result = performBackgroundTask();

        handler.post(new Runnable() {
            @Override
            public void run() {
                // 在主线程中更新 UI
                textView.setText(result);
            }
        });
    }
});
```
:::


## 3. 使用 Kotlin 协程
Kotlin 协程是 Android 开发的推荐方式，简洁且强大。

::: code-group
``` kotlin
import kotlinx.coroutines.*

fun performTask() {
    // 在主线程启动协程
    GlobalScope.launch(Dispatchers.Main) {
        // 在 IO 线程执行耗时操作
        val result = withContext(Dispatchers.IO) {
            performBackgroundTask()
        }
        // 在主线程更新 UI
        textView.text = result
    }
}
```
:::

