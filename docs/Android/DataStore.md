# DataStore

## 1. 什么是DataStore

Jetpack DataStore是一种数据存储方案，可以使用 `protocolBuffer` 存储 **键值对** 或者 **数据对象**。其使用Kotlin `协程`和 `Flow`，以 `异步` 和 `事务一致性` 的方式存储数据。推荐从SharedPreference迁移到DataStore。

> 如果是大型或者比较复杂的数据，优先考虑使用Room存储数据，DataStore比较适用于小型数据集，但是**不支持部分更新或者引用完整性**（*数据库的完整性分为：1.实体完整性；2.域完整性；3.引用完整性*）

## 2. Preference DataStore 和 Proto DataStore

`DataStore` 可以分为两种：
1. **Preference DataStore**：使用键值对存取数据，不需要预定义架构，也不需要确保数据类型的安全
2. **Proto DataStore**：将数据作为自定义数据类型的实例存取，需要使用 `protocolBuffer` 定义架构，但是可以确保数据类型的安全。

## 3. 使用DataStore

### 1. Preferences DataStore

- **配置依赖：** 
::: code-group
``` groovy
    dependencies {
        // 必选
        implementation "androidx.datastore:datastore-preferences:1.1.1"
        // 可选 - RxJava2 support
        implementation "androidx.datastore:datastore-preferences-rxjava2:1.1.1"
        // 可选 - RxJava3 support
        implementation "androidx.datastore:datastore-preferences-rxjava3:1.1.1"
    }
    // 或者用下面这个
    dependencies {
        implementation "androidx.datastore:datastore-preferences-core:1.1.1"
    }
    
```
:::

- **使用：**

`Preferences DataStore` 实现使用 `DataStore` 和 `Preferences` 类将简单的键值对保留在磁盘上。

- **创建Preferences DataStore：**

使用 `Preferences DataStore` 所创建的属性委托来创建 `DataStore<Preference>` 实例。在kotlin文件中顶层声明这个实例，就能在应用的其他地方通过这个属性访问 `DataStore<Preference>` 实例。这样能将 DataStore 设置为单例。如果使用的是 RxJava，应该用 `RxPreferenceDataStoreBuilder`。name参数必须使用Preferences DataStore的名称。

::: code-group
``` kotlin
// 顶部声明
val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")
```
:::

- **从Preference DataStore 中读取数据**

由于 Preference DataStore 不使用预定义的架构，所以必须给 `DataStore<Preference>` 实例中的每个值定义一个键。例如：如果想要给int类型定义一个键，需要使用 `intPreferenceKey()`。然后使用 `Data.data` 属性，通过 Flow 提供存储值。

::: code-group
``` kotlin
val EXAMPLE_COUNTER = intPreferencesKey("example_counter")
val exampleCounterFlow: Flow<Int> = context.dataStore.data
  .map { preferences ->
    preferences[EXAMPLE_COUNTER] ?: 0
}
```
:::

- **向 Preferences DataStore 写入数据**

Preference DataStore 提供了一个 `edit()` 方法，通过事务的方式更新 `DataStore` 中的数据。这个方法的 `transform` 参数接受代码块，可以更新数据。`transform` 中的所有代码都能看作成单个事务。

::: code-group
``` kotlin
suspend fun incrementCounter() {
  context.dataStore.edit { settings ->
    val currentCounterValue = settings[EXAMPLE_COUNTER] ?: 0
    settings[EXAMPLE_COUNTER] = currentCounterValue + 1
  }
}
```
:::

### 2. Proto DataStore

- **配置依赖：**
::: code-group
``` groovy
    // 必选
    dependencies {
        implementation "androidx.datastore:datastore:1.1.1"

        // 可选 - RxJava2 support
        implementation "androidx.datastore:datastore-rxjava2:1.1.1"

        // 可选 - RxJava3 support
        implementation "androidx.datastore:datastore-rxjava3:1.1.1"
    }

    // // 或者用下面这个
    dependencies {
        implementation "androidx.datastore:datastore-core:1.1.1"
    }
```
:::

- **从 Proto DataStore 读取数据**
使用 DataStore.data 显示所存储对象中相应属性的 Flow。

::: code-group
``` kotlin
val exampleCounterFlow: Flow<Int> = context.settingsDataStore.data
  .map { settings ->
    // The exampleCounter property is generated from the proto schema.
    settings.exampleCounter
  }
```
:::

- **向 Proto DataStore 写入数据**
`Proto DataStore` 提供了一个 `updateData()` 函数，用于以事务方式更新存储的对象。`updateData()` 可以提供数据的当前状态，作为数据类型的一个实例，并在**原子读-写-修改操作中以事务方式更新数据**。

::: code-group
``` kotlin
suspend fun incrementCounter() {
  context.settingsDataStore.updateData { currentSettings ->
    currentSettings.toBuilder()
      .setExampleCounter(currentSettings.exampleCounter + 1)
      .build()
    }
}
```
:::

### 3. 在同步代码中使用 DataStore

DataStore 的主要优势之一是异步 API，但可能不一定始终能将周围的代码更改为异步代码。如果 使用的现有代码库采用同步磁盘 I/O，或者 的依赖项不提供异步 API，可能就会如此。

Kotlin 协程提供 runBlocking() 协程构建器，以帮助消除同步与异步代码之间的差异。可以使用 runBlocking() 从 DataStore 同步读取数据。RxJava 提供了针对 Flowable 的阻塞方法。以下代码会阻塞发起调用的线程，直到 DataStore 返回数据：

::: code-group
``` kotlin
val exampleData = runBlocking { context.dataStore.data.first() }
```
:::

对界面线程执行同步 I/O 操作可能会导致 ANR 或界面卡顿。 可以通过从 DataStore 异步预加载数据来减少这些问题：

::: code-group
``` kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    lifecycleScope.launch {
        context.dataStore.data.first()
        // You should also handle IOExceptions here.
    }
}
```
:::

这样，DataStore 可以异步读取数据并将其缓存在内存中。以后使用 runBlocking() 进行同步读取的速度可能会更快，如果初始读取操作已经完成，或许还可以完全避免磁盘 I/O 操作。

### 4. 在多进程代码中使用 DataStore

> DataStore 多进程功能目前在 1.1.0 版中提供

可以对 DataStore 进行配置，使其在不同进程中访问相同数据时确保实现与在单个进程中访问数据时相同的数据一致性。具体而言，DataStore 可保证：

读取仅返回已持久存储到磁盘的数据。
写后读一致性。
写入会序列化。
写入绝不会阻塞读取。
假设有一个包含一项服务和一个 activity 的示例应用：

服务在单独的进程中运行，并会定期更新 DataStore

::: code-group
``` xml
<service
  android:name=".MyService"
  android:process=":my_process_id" />
```
:::

> 重要提示：如需在其他进程中运行服务，请使用 android:process 属性。请注意，进程 ID 的前缀为英文冒号（“:”）。这样服务便可以在应用专用的新进程中运行。

::: code-group
``` kotlin
override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
      scope.launch {
          while(isActive) {
              dataStore.updateData {
                  Settings(lastUpdate = System.currentTimeMillis())
              }
              delay(1000)
          }
      }
}
```
:::

同时，应用会收集这些更改并更新其界面

::: code-group
``` kotlin
val settings: Settings by dataStore.data.collectAsState()
Text(
  text = "Last updated: $${settings.timestamp}",
)
```
:::

为了能够在不同进程中使用 DataStore，需要使用 MultiProcessDataStoreFactory 构造 DataStore 对象。
::: code-group
``` kotlin
val dataStore: DataStore<Settings> = MultiProcessDataStoreFactory.create(
   serializer = SettingsSerializer(),
   produceFile = {
       File("${context.cacheDir.path}/myapp.preferences_pb")
   }
)
```
:::

serializer 会告知 DataStore 如何读取和写入您的数据类型。请务必为该序列化器添加默认值，以便在尚未创建任何文件时使用。

::: code-group
``` kotlin
@Serializable
data class Settings(
   val lastUpdate: Long
)

@Singleton
class SettingsSerializer @Inject constructor() : Serializer<Settings> {

   override val defaultValue = Settings(lastUpdate = 0)

   override suspend fun readFrom(input: InputStream): Timer =
       try {
           Json.decodeFromString(
               Settings.serializer(), input.readBytes().decodeToString()
           )
       } catch (serialization: SerializationException) {
           throw CorruptionException("Unable to read Settings", serialization)
       }

   override suspend fun writeTo(t: Settings, output: OutputStream) {
       output.write(
           Json.encodeToString(Settings.serializer(), t)
               .encodeToByteArray()
       )
   }
}
```
:::

可以使用 Hilt 依赖项注入，以确保您的 DataStore 实例在每个进程中具有唯一性：

::: code-group
``` kotlin
@Provides
@Singleton
fun provideDataStore(@ApplicationContext context: Context): DataStore<Settings> =
   MultiProcessDataStoreFactory.create(...)
```
:::

## 4. 使用DataStore需要注意的点

1. **不要再同一个进程中为给定文件船舰多个DataStore实例**，如果给定文件在同一个进程中有多个有效的DataStore实例，DataStore会在读取或者更新数据的时候抛出IllegalStateException。
2. **DataStore的通用类型不能改变**，改变DataStore的类型可能会导致DataStore出现难以发现的bug。建议使用`protocolBuffer`
3. **不要对同一个文件混用 SingleProcessDataStore 和 MultiProcessDataStore**，如需从多个位置访问 DataStore，应始终使用 MultiProcessDataStore。
4. **尽可能避免在进行 DataStore 数据读取时阻塞线程**。阻塞界面线程可能会导致 ANR 或界面卡顿，而阻塞其他线程可能会导致死锁。