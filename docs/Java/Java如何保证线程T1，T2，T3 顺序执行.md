# Java如何保证线程T1，T2，T3 顺序执行

## 1. 方法1：join()方法

`Thread.join()` 方法会使当前线程等待另一个线程执行完毕后再继续执行。通过在 T1、T2、T3 之间调用 `join()`，可以确保线程按顺序执行。

::: code-group
``` java
public class ThreadOrderExample {

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            System.out.println("T1 is executing");
        });

        Thread t2 = new Thread(() -> {
            System.out.println("T2 is executing");
        });

        Thread t3 = new Thread(() -> {
            System.out.println("T3 is executing");
        });

        t1.start();  // 启动线程T1
        t1.join();   // 主线程等待T1执行完

        t2.start();  // 启动线程T2
        t2.join();   // 主线程等待T2执行完

        t3.start();  // 启动线程T3
        t3.join();   // 主线程等待T3执行完
    }
}
```
:::

## 2. 方法2：countDownLatch方法

`CountDownLatch` 是一个同步辅助类，它允许一个或多个线程一直等待，直到其他线程完成操作。可以用它来确保线程按照特定顺序执行。

::: code-group
``` java
import java.util.concurrent.CountDownLatch;

public class ThreadOrderExample {

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch latch1 = new CountDownLatch(1);  // T1 完成后释放
        CountDownLatch latch2 = new CountDownLatch(1);  // T2 完成后释放

        Thread t1 = new Thread(() -> {
            System.out.println("T1 is executing");
            latch1.countDown();  // T1 完成后释放 latch1
        });

        Thread t2 = new Thread(() -> {
            try {
                latch1.await();  // 等待 T1 执行完
                System.out.println("T2 is executing");
                latch2.countDown();  // T2 完成后释放 latch2
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread t3 = new Thread(() -> {
            try {
                latch2.await();  // 等待 T2 执行完
                System.out.println("T3 is executing");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        t1.start();
        t2.start();
        t3.start();
    }
}
```
:::

## 3. 方法3：CyclicBarrier

`CyclicBarrier` 是一种可以同步多个线程的工具，但它通常用于所有线程都要在某一点等待并且一旦达到同步点后再一起继续执行。如果想确保多个线程按顺序执行，`CyclicBarrier` 可以配合 `Runnable` 来实现。

::: code-group
``` java
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

public class ThreadOrderExample {

    public static void main(String[] args) throws InterruptedException {
        CyclicBarrier barrier1 = new CyclicBarrier(2);  // 第一个同步点
        CyclicBarrier barrier2 = new CyclicBarrier(2);  // 第二个同步点

        Thread t1 = new Thread(() -> {
            try {
                System.out.println("T1 is executing");
                barrier1.await();  // 到达第一个同步点
            } catch (InterruptedException | BrokenBarrierException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread t2 = new Thread(() -> {
            try {
                barrier1.await();  // 等待 T1 到达同步点
                System.out.println("T2 is executing");
                barrier2.await();  // 到达第二个同步点
            } catch (InterruptedException | BrokenBarrierException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread t3 = new Thread(() -> {
            try {
                barrier2.await();  // 等待 T2 到达同步点
                System.out.println("T3 is executing");
            } catch (InterruptedException | BrokenBarrierException e) {
                Thread.currentThread().interrupt();
            }
        });

        t1.start();
        t2.start();
        t3.start();
    }
}
```
:::

## 4. 方法4：使用 Semaphore

`Semaphore` 是一种控制访问共享资源的计数信号量，也可以用来控制线程执行的顺序。通过 `acquire()` 和 `release()` 方法，可以控制线程在特定点的执行顺序。

::: code-group
``` java
import java.util.concurrent.Semaphore;

public class ThreadOrderExample {

    public static void main(String[] args) throws InterruptedException {
        Semaphore semaphoreT2 = new Semaphore(0);  // 控制T2执行的信号量
        Semaphore semaphoreT3 = new Semaphore(0);  // 控制T3执行的信号量

        Thread t1 = new Thread(() -> {
            System.out.println("T1 is executing");
            semaphoreT2.release();  // 释放信号量，允许 T2 执行
        });

        Thread t2 = new Thread(() -> {
            try {
                semaphoreT2.acquire();  // 等待 T1 完成
                System.out.println("T2 is executing");
                semaphoreT3.release();  // 释放信号量，允许 T3 执行
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread t3 = new Thread(() -> {
            try {
                semaphoreT3.acquire();  // 等待 T2 完成
                System.out.println("T3 is executing");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        t1.start();
        t2.start();
        t3.start();
    }
}
```
:::

## 5. 方法5：使用 ExecutorService 和 Future

通过 `ExecutorService` 提交线程任务，并使用 `Future.get()` 方法来确保任务按顺序执行。`Future.get()` 会阻塞当前线程，直到对应的任务完成，因此可以通过它来控制线程的顺序。

::: code-group
``` java
import java.util.concurrent.*;

public class ThreadOrderExample {

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        ExecutorService executor = Executors.newFixedThreadPool(3);  // 创建一个线程池

        // 提交任务
        Future<?> future1 = executor.submit(() -> {
            System.out.println("T1 is executing");
        });

        // 使用 Future.get() 阻塞，确保 T1 执行完毕后再执行 T2
        future1.get();

        Future<?> future2 = executor.submit(() -> {
            System.out.println("T2 is executing");
        });

        // 阻塞，确保 T2 执行完毕后再执行 T3
        future2.get();

        Future<?> future3 = executor.submit(() -> {
            System.out.println("T3 is executing");
        });

        // 阻塞，确保 T3 执行完毕
        future3.get();

        executor.shutdown();  // 关闭线程池
    }
}
```
:::


## 6. 方法6：使用 Lock 和 Condition

`Lock` 和 `Condition` 是更低级别的同步工具，它们提供了比 `synchronized` 更精细的控制。通过 `Condition` 对象，可以让线程等待特定的条件，从而控制线程按顺序执行。

::: code-group
``` java
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.Condition;

public class ThreadOrderExample {

    public static void main(String[] args) throws InterruptedException {
        Lock lock = new ReentrantLock();
        Condition conditionT2 = lock.newCondition();
        Condition conditionT3 = lock.newCondition();

        Thread t1 = new Thread(() -> {
            lock.lock();
            try {
                System.out.println("T1 is executing");
                conditionT2.signal();  // 唤醒 T2
            } finally {
                lock.unlock();
            }
        });

        Thread t2 = new Thread(() -> {
            lock.lock();
            try {
                conditionT2.await();  // 等待 T1 完成
                System.out.println("T2 is executing");
                conditionT3.signal();  // 唤醒 T3
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
            }
        });

        Thread t3 = new Thread(() -> {
            lock.lock();
            try {
                conditionT3.await();  // 等待 T2 完成
                System.out.println("T3 is executing");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
            }
        });

        t1.start();
        t2.start();
        t3.start();
    }
}
```
:::

`ReentrantLock` 和 `Condition` 可以精确控制线程的执行顺序。通过 `conditionT2.signal()` 和 `conditionT3.signal()` 控制 T2 和 T3 在适当时机开始执行。
`await()` 会使线程进入等待状态，直到其他线程调用 `signal()` 唤醒它。

## 7. 方法7：使用 AtomicBoolean 或 AtomicInteger

可以通过使用 `AtomicBoolean` 或 `AtomicInteger` 来控制线程的执行顺序。这些原子变量提供线程安全的操作，允许在多个线程之间共享状态。

::: code-group
``` java
import java.util.concurrent.atomic.AtomicInteger;

public class ThreadOrderExample {

    public static void main(String[] args) throws InterruptedException {
        AtomicInteger counter = new AtomicInteger(0);  // 用于控制线程顺序

        Thread t1 = new Thread(() -> {
            while (counter.get() != 0) {}  // 等待 counter 为 0
            System.out.println("T1 is executing");
            counter.incrementAndGet();  // T1 执行完后将 counter 设置为 1
        });

        Thread t2 = new Thread(() -> {
            while (counter.get() != 1) {}  // 等待 counter 为 1
            System.out.println("T2 is executing");
            counter.incrementAndGet();  // T2 执行完后将 counter 设置为 2
        });

        Thread t3 = new Thread(() -> {
            while (counter.get() != 2) {}  // 等待 counter 为 2
            System.out.println("T3 is executing");
        });

        t1.start();
        t2.start();
        t3.start();
    }
}
```
:::