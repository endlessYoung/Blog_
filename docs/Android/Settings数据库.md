# Settings数据库

`Settings` 是一个存储系统和用户设置的数据库，它主要用于保存设备的配置信息和用户偏好设置。这些设置存储在一个 SQLite 数据库中，并通过 `Android` 提供的 `Settings API` 进行访问。`settings` 相关的数据最后是存在xml中，app层面都是通过SettingProvider 调用到systemserver进程进行保存

Settings 类有三个主要子类用于访问不同类型的设置信息：
1. `Settings.System`: 用于访问系统级别的设置，如音量，亮度等；
2. `Settings.Secure`: 用于访问与安全相关的设置，这些设置只能通过系统或拥有特权的应用访问和修改。如锁屏密码等；
3. `Settings.Global`：用于访问全局的设置项。

## 1. Settings 数据库的存储位置

`Settings` 数据库的文件通常位于 `/data/data/com.android.providers.settings/databases/settings.db`。

- 表结构
数据库包含以下主要表：
`system`
`secure`
`global`
这些表的列通常是：

- `name`：设置的名称（Key）。
- `value`：设置的值。

## 2. 访问 Settings 数据库

1. 获取和更改设置的值(使用 `ContentResolver` 的 `getString` 方法读取设置值：)

``` java
import android.provider.Settings;

String brightness = Settings.System.getString(
    getContentResolver(), 
    Settings.System.SCREEN_BRIGHTNESS
);

Settings.System.putString(
    getContentResolver(),
    Settings.System.SCREEN_BRIGHTNESS,
    "200"
);

String androidId = Settings.Secure.getString(
    getContentResolver(), 
    Settings.Secure.ANDROID_ID
);


String airplaneMode = Settings.Global.getString(
    getContentResolver(),
    Settings.Global.AIRPLANE_MODE_ON
);

Settings.Global.putString(
    getContentResolver(),
    Settings.System.SCREEN_BRIGHTNESS,
    "200"
);
```

## 3. 访问权限

由于 `Settings` 涉及系统和安全设置，不是所有设置都可以被任意应用访问。根据设置类型，可能需要以下权限：

系统设置权限：

WRITE_SETTINGS：允许修改系统范围的设置。

``` xml
<uses-permission android:name="android.permission.WRITE_SETTINGS" />
```

