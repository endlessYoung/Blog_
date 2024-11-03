# CompletableFuture

`CompletableFuture` 是 Java 8 引入的一个类，属于 `java.util.concurrent` 包，主要用于异步编程和非阻塞操作。它提供了一种更简单和强大的方式来处理异步计算，相较于传统的 Future 类，`CompletableFuture` 提供了更丰富的功能和灵活性。

## 1. **理解 `CompletableFuture` 的基本概念**

`CompletableFuture` 是一个用于异步编程的类，它能够以非阻塞的方式处理任务。理解其核心概念：

- **异步执行**：`CompletableFuture` 允许在后台线程中异步执行计算，主线程不必等待结果。
- **任务组合**：可以通过链式调用将多个异步任务组合在一起，形成复杂的工作流。
- **异常处理**：提供内置的机制来处理异步任务中可能出现的异常。

## 2. **核心 API 的详细使用**

#### 创建 CompletableFuture

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    // 模拟长时间计算
    try {
        Thread.sleep(1000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "Hello, World!";
});
```

- **supplyAsync**：接受一个返回值的 `Supplier`，在另一个线程中异步执行，返回 `CompletableFuture` 对象。

#### 处理结果

```java
future.thenApply(result -> {
    // 处理计算结果
    return result.length();
}).thenAccept(length -> {
    // 使用结果
    System.out.println("Length: " + length);
});
```

- **thenApply**：接收前一个计算的结果并转换为新的结果。
- **thenAccept**：接收前一个计算的结果但不返回新结果。

#### 异常处理

```java
future.exceptionally(ex -> {
    System.err.println("Error: " + ex.getMessage());
    return null; // 处理异常后返回一个默认值
});
```

- **exceptionally**：处理在计算过程中发生的异常。

### 3. **任务组合示例**

#### 同步组合任务

```java
CompletableFuture<Integer> future1 = CompletableFuture.supplyAsync(() -> {
    return 100;
});

CompletableFuture<Integer> future2 = CompletableFuture.supplyAsync(() -> {
    return 200;
});

future1.thenCombine(future2, (result1, result2) -> {
    return result1 + result2; // 合并结果
}).thenAccept(sum -> {
    System.out.println("Sum: " + sum);
});
```

- **thenCombine**：将两个异步计算的结果组合在一起。

### 4. **处理多个任务**

#### 等待所有任务完成

```java
CompletableFuture<Void> allOfFuture = CompletableFuture.allOf(future1, future2);
allOfFuture.thenRun(() -> {
    System.out.println("All tasks are completed!");
});
```

- **allOf**：等待所有给定的 `CompletableFuture` 完成。

#### 等待任意一个任务完成

```java
CompletableFuture<Object> anyOfFuture = CompletableFuture.anyOf(future1, future2);
anyOfFuture.thenAccept(result -> {
    System.out.println("First completed result: " + result);
});
```

- **anyOf**：等待其中一个 `CompletableFuture` 完成并返回结果。

## 5. **深入理解和优化**

- **线程池管理**：使用自定义的 `Executor` 来管理线程池，避免使用默认的 ForkJoinPool，以便更好地控制线程数量和性能。

```java
ExecutorService executor = Executors.newFixedThreadPool(4);
CompletableFuture<Void> future = CompletableFuture.supplyAsync(() -> {
    // 任务逻辑
}, executor);
```

- **监控和调试**：使用 `whenComplete` 或 `handle` 来监控任务完成的状态，无论是正常完成还是异常完成。

```java
future.whenComplete((result, throwable) -> {
    if (throwable != null) {
        System.err.println("Error occurred: " + throwable.getMessage());
    } else {
        System.out.println("Result: " + result);
    }
});
```

## 6. **实践应用**

- **网络请求**：使用 `CompletableFuture` 发起异步 HTTP 请求，以提高应用的响应性。
- **数据处理**：在大数据处理场景中，将数据处理任务分配到多个线程中，利用 `CompletableFuture` 合并和处理结果。