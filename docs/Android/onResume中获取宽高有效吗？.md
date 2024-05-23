# onResume中获取宽高有效吗？

View 的测绘绘制流程就是从 `ViewRootImpl#performTraversals()` 开始的，而这个方法的调用是在 onResume() 方法之后，所以在 onCreate() 和 onResume() 方法中拿不到 View 的测量值。

View.post{} 为什么可以获取？

通过post可以将一个Runnable投放到消息队列尾部，意思是将任务添加到消息队列中，保证在UI线程执行。从本质上说，它还是依赖于以`Handler`、`Looper`、`MessageQueue`、`Message`为基础的异步消息处理机制。相对于新建Handler进行处理更加便捷。

下面举一个常用的例子，比如在onCreate方法中获取某个view的宽高,而直接View#getWidth获取到的值是0。要知道View显示到界面上需要经历 **onMeasure** 、 **onLayout** 和 **onDraw** 三个过程，而View的宽高是在onLayout阶段才能最终确定的，而在`Activity#onCreate`中并不能保证View已经执行到了onLayout方法，也就是说Activity的声明周期与View的绘制流程并不是一一绑定。

那为什么调用post方法就能起作用呢？首先`MessageQueue`是按顺序处理消息的，而在`setContentView()`后队列中会包含一条询问是否完成布局的消息，而我们的任务通过View#post方法被添加到队列尾部，保证了在layout结束以后才执行。

::: code-group
``` java
view.post(new Runnable() {
  @Override
  public void run() {
    int width = view.getWidth();
    int height = view.getHeight();
  }
});
```
:::

view.post(new Runnable() {}) 这个runnable的执行时机具体是什么？不同版本之间有差异么？

- 在Android 7.0之前，view.post()中的runnbale 并不能确定被执执行。具体来说：

View.post会分情况处理，如果View没有`attachedToWindow`时，会将Runnable对象缓存起来，如果View已经`attachedToWindow`，则会将Runnable对象post到主线程执行。
如果View.post的runnable对象被缓存起来，而在主线程中执行了post方法， `performTraversals`方法在主线程执行时，getRunQueue取出来的缓存对象即是主线程的runnable对象，可以正常执行；
如果View.post的runnable对象被缓存起来，而在子线程中执行post方法，则会在`sRunQueues`对应的子线程的数据结构中设置runnable对象，而`performTraversals`方法会在主线程执行，取出来的是sRunQueues对应主线程的数据结构，根据ThreadLocal执行机制，这个时候主线程取出来的值是空的，因此不执行。


- 在Android 7.0之后，view.post()中的runnbale 能确定被执执行。具体来说：

Android 7.0之后，除了performTraversal中会调用外，在View的dispatchAttachedToWindow中也会调用，但Android 7.0之后不管在主线程还是在子线程都可以成功执行view.post内部逻辑，并不是因为增加了调用时机，而是取消了ThreadLocal机制，使得不管在主线程还是子线程调用view.post方法，都会将runnable对象丢到主线程的任务队列中，更新UI或者获取view的信息。


## 总结

View的宽高是在`onLayout`阶段才能最终确定的，而在`Activity#onCreate`中并不能保证View已经执行到了onLayout方法，也就是说Activity的声明周期与View的绘制流程并不是一一绑定。所以onCreate() 和 onResume() 中获取不到View的宽高值。以Handler为基础，View.post() 将传入任务的执行时机调整到View 绘制完成之后。只有通过post方法才能获取View的测量宽度