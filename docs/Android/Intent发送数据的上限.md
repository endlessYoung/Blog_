# Intent发送数据的上限

## 总结

1. 512k以下的数据可以正常发送。
2. 512k~1024k的数据会报错，crash。
3. 1024k以上的数据会报错：**TransactionTooLargeException**
4. 由于intent还要包括启动的Activity等信息，实际可以发送的数据量 **略小于512k**。

Intent携带信息的大小其实是受到Binder的限制（包括Binder的大小和缓存两种限制）。数据以Parcel对象的形式存放在Binder缓存区中。如果数据或返回值比缓存区域大，那么会抛出TransactionTooLargeException异常。

Binder缓存的上限在不同的Andorid系统中有所不同。具体的上限有 **BC_MAX_BUFFER** 常量定义。在6.0中，Binder缓存的上限是**1Mb**。从7。0开始，这个默认值被增加到**8Mb**。这里的数值是默认值，实际上可以通过修改系统属性来调整Binder的缓存上限。

在实际应用中，为了避免传递的数据过大，可以通过 **文件共享**、**ContentProvider** 等方式传递大型数据。在应用之间传递最好使用ContentProvider或共享存储等机制。