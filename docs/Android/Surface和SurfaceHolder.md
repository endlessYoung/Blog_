# Surface 和 SurfaceHolder

`Surface` 对象使应用能够渲染要在屏幕上显示的图像。通过 `SurfaceHolder` 接口，应用可以编辑和控制 `Surface`。Surface 通过 BufferQueue 机制在生产者和消费者之间传递图像缓冲区。生产者可以是CPU绘图程序（如Canvas）、GLES渲染器或视频解码器，消费者通常是显示器（`SurfaceFlinger`）

## Surface

Surface是一个接口，供生产者和消费者交换缓冲区。

用于显示 `Surface`的`BufferQueue`通常配置为三重缓冲。缓冲区是按需分配的，因此，如果生产方足够缓慢地生成缓冲区（例如在 `60 fps` 的显示屏上以 `30 fps` 的速度缓冲）, 队列中可能只有两个分配的缓冲区。按需分配缓冲区有助于最大限度地减少内存消耗。可以在 `dumpsys SurfaceFlinger` 的输出中看到每个层级关联的缓冲区的摘要。

大多数客户端使用 `OpenGL ES` 或 `Vulkan` 渲染到Surface上，但是，有些客户端使用画布渲染到 Surface 上。

## BufferQueue

BufferQueue 是Android系统中用于管理图形缓冲区（通常是位图）的一个核心组件，它在生产者（如应用程序的绘图线程）和消费者（如SurfaceFlinger，负责合成并显示最终图像到屏幕上）之间起到桥梁作用。当生产方（如应用）首次请求缓冲区（通过调用lockCanvas()）时，BufferQueue会确保分配一个新的缓冲区（或者复用一个空闲的缓冲区），并将其内容清零，以避免数据泄露和视觉残留，保证隐私和安全。

### 画布渲染

画布渲染实现由Skia图形库提供。如果要绘制一个矩形，可以调用 `Canvas API`, 它会在缓冲区中适当地设置字节。为了确保绘制过程的安全性，不会在缓冲区正在被显示时进行写入，必须锁定该缓冲区以进行访问。您可以使用以下命令处理画布锁：

- **`lockCanvas()`** 可锁定缓冲区以在 CPU 上渲染，并返回用于绘图的画布。
- **`unlockCanvasAndPost()`** 可解锁缓冲区并将其发送到合成器。
- **`lockHardwareCanvas()`** 可锁定缓冲区以在 GPU 上渲染，并返回用于绘图的画布。

::: warning
**注意：当应用通过 lockCanvas() 锁定 Surface 时，所获得的画布一概不会获得硬件加速。**
:::

::: danger
**注意：如果调用 lockCanvas()，则无法使用 GLES 在 Surface 上绘图或从视频解码器向其发送帧。lockCanvas() 会将 CPU 渲染程序连接到 BufferQueue 的生产方，直到 Surface 被销毁时才会断开连接。与大多数生产方（如 GLES 或 Vulkan）不同，基于画布的 CPU 渲染程序无法在断开连接后重新连接到 Surface。**

一旦 lockCanvas() 被调用，Canvas 通过 CPU 直接访问缓冲区。这会占用缓冲区，使得 GLES 无法再使用相同的缓冲区进行绘图操作。
视频解码器也需要使用 BufferQueue 来传递解码后的帧。如果 Surface 已被 lockCanvas() 占用，解码器就无法使用该 Surface 进行帧传递。
调用 lockCanvas() 后，CPU 渲染程序成为 BufferQueue 的生产方，直到 Surface 被销毁时才会断开连接。
:::

缓冲区的复用与初始化
生产方每次完成一帧的绘制后，会通过unlockCanvasAndPost()将缓冲区提交给消费者。如果生产方再次请求缓冲区，BufferQueue可能会复用之前提交过的缓冲区，而不是每次都创建新的缓冲区。这意味着，如果不进行任何绘制操作就解锁并发布缓冲区，屏幕上显示的将是上次绘制的内容，形成了一个“循环播放”之前的帧的效果。
Surface 锁定与解锁的细节
lockCanvas() 方法允许生产方（应用）锁定一个缓冲区用于绘制。此操作会返回一个Canvas对象，使得应用可以在这个缓冲区上执行绘图指令。

如果在锁定时指定了脏区域（即需要更新的屏幕区域），这实际上是一种优化手段，意味着只有指定区域内的像素会被修改，而其他区域则保持不变，从而减少不必要的重绘和提升性能。

unlockCanvasAndPost() 释放锁并通知BufferQueue这一帧已经准备完毕，可以被消费。如果指定了脏区域，系统会在后台处理时仅更新这些区域，这涉及到从上一帧的缓冲区复制非脏像素到当前帧的操作，以保持画面的连续性。

SurfaceFlinger 和 HWC 的作用
SurfaceFlinger 是Android系统中的一个服务，负责将来自不同应用的Surface（可以理解为一个可绘制的区域）组合在一起，形成最终的显示画面。它会从BufferQueue获取缓冲区，并与硬件Composer（HWC）协同工作，以高效地将图像输出到屏幕上。

Hardware Composer (HWC) 是硬件加速层，直接与显示硬件交互，负责实际的图像合成和输出。在某些情况下，如果只是从缓冲区读取内容而不做修改（比如某些屏幕截图或视频录制场景），因为没有写入操作，理论上不需要等待独占访问权，这样可以进一步提高效率。


## SurfaceHolder

SurfaceHolder 的作用
**所有权管理**：SurfaceHolder允许应用程序与系统共享对Surface的控制权。这意味着多个组件或系统服务可以协调使用同一个Surface来展示内容，这对于复杂界面或需要底层渲染控制的场景特别重要，比如视频播放、游戏或自定义动画。

**参数配置**：通过SurfaceHolder接口，开发者可以获取和设置与Surface相关的参数，例如锁定画布进行绘图、设置格式、大小、以及监听Surface状态变化（如创建、销毁）等。这些操作对于实现动态图形内容的高效渲染和管理至关重要。

**SurfaceView 的集成**：SurfaceView是Android中一个特殊的视图组件，它包含一个Surface用于高效的图形渲染，并通过SurfaceHolder来暴露必要的控制接口。SurfaceView的设计目的是为了实现复杂的图形动画或视频播放，同时还能与其他UI元素平滑叠加，因为它有自己的Z轴顺序，可以在其他UI元素之上或之下独立绘制。

### 与View和MediaCodec的关系
**View交互**：虽然许多UI组件直接使用View来展示静态或简单的动态内容，但对于高性能或复杂的图形处理，直接操作Surface是更优的选择。这时，通过SurfaceHolder与SurfaceView结合，开发者可以在Surface上进行高效绘制，同时保持与常规UI组件的兼容性和交互性。

**MediaCodec与Surface**：MediaCodec是一个强大的API，用于编解码音频和视频数据。特别地，它可以直接将解码后的视频帧输出到一个Surface上，实现硬件加速的视频渲染。这意味着，开发者可以通过将MediaCodec与Surface（通常通过SurfaceHolder间接控制）配合使用，来实现实时高效的视频播放或处理，而无需先将数据复制到Bitmap等其他形式，大大提高了性能和效率。