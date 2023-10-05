# Parcelable 和 Bundle

Parcelable 和 Bundle 对象可跨进程边界使用，例如与 IPC/Binder 事务之间，带有 intent 的 Activity 之间等，还可以用来存储跨配置更改的瞬时状态。本页介绍了使用 Parcelable 和 Bundle 对象的建议和最佳做法。

::: tip
注意：Parcel 不是通用序列化机制，您绝不能将任何 Parcel 数据存储在磁盘上或通过网络发送。
:::

当应用创建 Intent 对象以在 startActivity(android.content.Intent) 中用于启动新的 Activity 时，应用可使用 putExtra(java.lang.String, java.lang.String) 方法传入参数。

操作系统会将 intent 的基础 Bundle 打包。然后，操作系统会创建新的 Activity，将数据拆包，并将 intent 传递给新的 Activity。

我们建议您使用 Bundle 类为 Intent 对象设置操作系统已知的基元。Bundle 类针对使用 parcel 进行编组和解组进行了高度优化。

在某些情况下，您可能需要一种机制来跨 Activity 发送复合对象或复杂对象。在这种情况下，自定义类应实现 Parcelable，并提供相应的 writeToParcel(android.os.Parcel, int) 方法。它还必须提供实现 Parcelable.Creator 接口的非空字段 CREATOR，该接口的 createFromParcel() 方法用于将 Parcel 转回为当前对象。如需了解详情，请参阅 Parcelable 对象的参考文档。

通过 intent 发送数据时，应小心地将数据大小限制为几 KB。发送过多数据会导致系统抛出 TransactionTooLargeException 异常。

## 二、在进程之间发送数据

在进程之间发送数据与在 Activity 之间发送数据类似。不过，在进程之间发送时，我们建议您不要使用自定义 Parcelable。如果您将一个自定义 Parcelable 对象从一个应用发送到另一个应用，则需要确保发送和接收的应用上都存在版本完全相同的自定义类。通常情况下，这可能是在两个应用中都会使用的通用库。如果您的应用尝试向系统发送自定义 Parblelable，则可能会发生错误，因为系统无法对其不了解的类进行解组。

例如，某个应用可能会使用 AlarmManager 类设置闹钟，并对闹钟 intent 使用自定义Parcelable。当闹钟响铃时，系统会修改 intent 的 extra Bundle 以添加重复计数。此修改可导致系统从 extra 中剥离自定义 Parcelable。这种剥离进而会导致应用在收到修改后的警报 intent 时崩溃，因为应用预计会收到 extra 数据，而它已不存在。

Binder 事务缓冲区的大小固定有限，目前为 1MB，由进程中正在处理的所有事务共享。由于此限制是进程级别而不是 Activity 级别的限制，因此这些事务包括应用中的所有 binder 事务，例如 onSaveInstanceState，startActivity 以及与系统的任何互动。超过大小限制时，将引发 TransactionTooLargeException。

对于 savedInstanceState 的具体情况，应将数据量保持在较小的规模，因为只要用户可以返回到该 Activity，系统进程就需要保留所提供的数据（即使 Activity 的进程已终止）。我们建议您将保存的状态保持在 50k 数据以下。

::: tip
注意：在 Android 7.0（API 级别 24）或更高版本中，系统会在运行时抛出 TransactionTooLargeException 异常。在较低版本的 Android 中，系统仅在 logcat 中显示警告。
:::