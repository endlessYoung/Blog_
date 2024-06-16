# Manifest详解

## 一、概念
在 Android 应用程序开发中，AndroidManifest.xml 是一个非常重要的文件，它描述了应用的基本信息、组件、权限等。

一个典型的 AndroidManifest.xml 文件结构如下：

::: code-group
``` xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp"
    android:versionCode="1"
    android:versionName="1.0">

    <!-- 应用级别的权限声明 -->
    <uses-permission android:name="android.permission.INTERNET" />

    <!-- 声明最小和目标 SDK 版本 -->
    <uses-sdk
        android:minSdkVersion="16"
        android:targetSdkVersion="30" />

    <!-- 应用的具体描述 -->
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        
        <!-- Activity 声明 -->
        <activity android:name=".MainActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- 其他组件声明，如 Service, BroadcastReceiver, ContentProvider -->
        <service android:name=".MyService" />
        <receiver android:name=".MyReceiver" />
        <provider
            android:name=".MyProvider"
            android:authorities="com.example.myapp.provider" />
        
    </application>

</manifest>

```
:::

## 二、关键元素和属性解析

## 1. **manifest标签**
   - xmlns:android: 定义了 XML 命名空间。
   - package: 定义应用程序的包名，这是应用在设备上唯一的标识符。
   - android:versionCode: 定义应用程序的版本代码，每次发布新版本时递增。
   - android:versionName: 定义应用程序的版本名称，通常是一个用户可见的字符串。
## 2. **uses-permission标签**
   - android:name: 声明应用程序所需的权限，例如访问互联网、读取联系人等。
   ::: code-group
   ``` xml
    <uses-permission android:name="android.permission.INTERNET" />
   ```
   :::
## 3. **uses-sdk标签**
   - android:minSdkVersion: 定义应用程序支持的最小 SDK 版本。
   - android:targetSdkVersion: 定义应用程序针对的目标 SDK 版本。
## 4. **application标签**（定义应用程序的全局属性和包含的组件）
   - android:allowBackup: 是否允许应用数据备份。
   - android:debuggable: 是否允许调试
   - android:fullBackupContent: 定义备份和恢复的内容。
   - android:largeHeap: 是否启用大堆内存
   - android:icon: 应用程序的图标。
   - android:label: 应用程序的标签。
   - android:roundIcon: 圆形图标（用于某些设备和启动器）。
   - android:supportsRtl: 是否支持从右到左的布局。
   - android:theme: 应用程序的主题。
## 5. **activity标签**
   - android:name: Activity 类的名称。
   - intent-filter: 定义这个 Activity 如何响应 Intent，例如 MAIN 和 LAUNCHER。
## 6. **service标签**
   - android:name: Service 类的名称。
## 7. **receiver标签**
   - android:name: BroadcastReceiver 类的名称。
## 8. **provider标签**
   - android:name: ContentProvider 类的名称。
   - android:authorities: 定义 ContentProvider 的授权 URI。
   ::: code-group
   ``` xml
<provider
    android:name=".MyProvider"
    android:authorities="com.example.myapp.provider"
    android:exported="true"
    android:grantUriPermissions="true">
    <grant-uri-permission android:pathPattern=".*" />

   ```
   :::
## 9. **meta-data标签**(用于在应用程序、Activity、Service 等组件中添加任意的键值对数据)
   ::: code-group
   ``` xml
   <meta-data
    android:name="com.example.MY_METADATA"
    android:value="some_value" />
   ```
   :::
## 10. **uses-feature标签**(声明应用程序使用的硬件或软件特性，例如摄像头、蓝牙等)
   ::: code-group
   ``` xml
   <uses-feature android:name="android.hardware.camera" android:required="true" />
   ```
   :::
## 11. **intent-filter标签**(定义组件可以处理哪些 Intent，通常用于 Activity、Service 和 BroadcastReceiver)
## 12. path-permission标签（用于在 ContentProvider 中设置特定路径的权限）
   ::: code-group
   ``` xml
<path-permission
    android:path="/my_path"
    android:readPermission="com.example.myapp.permission.READ"
    android:writePermission="com.example.myapp.permission.WRITE" />
   ```
   :::
## 13. grant-uri-permission标签（用于授予其他应用程序访问 URI 的权限。它通常用于 ContentProvider 中，允许你授予其他应用临时的读写权限）
## 14. instrumentation标签（用于定义应用程序的测试和调试代码。Instrumentation 是一个运行在应用程序进程中的类，用于监控应用的交互行为）
   ::: code-group
   ``` xml
<instrumentation
    android:name=".MyInstrumentation"
    android:targetPackage="com.example.myapp"
    android:functionalTest="true" />
   ```
   :::
## 15. compatible-screens标签（用于指定应用程序兼容的特定屏幕配置。这通常用于限制应用程序只在特定设备上可用）
   ::: code-group
   ``` xml
<compatible-screens>
    <!-- 支持的屏幕尺寸和密度 -->
    <screen android:screenSize="normal" android:screenDensity="hdpi" />
</compatible-screens>

   ```
   :::
## 16. supports-screens标签（用于声明应用程序支持的屏幕尺寸和密度）
   ::: code-group
   ``` xml
<supports-screens
    android:smallScreens="true"
    android:normalScreens="true"
    android:largeScreens="true"
    android:xlargeScreens="true"
    android:anyDensity="true" />
   ```
   :::
## 17. uses-configuration（用于声明应用程序使用的硬件配置，例如键盘类型、导航设备等）
   ::: code-group
   ``` xml
<uses-configuration android:reqKeyboardType="qwerty" />
   ```
   :::
## 18. permission标签（用于声明应用程序定义的自定义权限。这些权限可以在其他应用程序中请求，以访问你的应用程序提供的功能）
   ::: code-group
   ``` xml
<permission
    android:name="com.example.myapp.permission.MY_PERMISSION"
    android:protectionLevel="normal" />
   ```
   :::
## 19. activity-alias标签（activity-alias> 元素用于为一个现有的 Activity 定义一个别名。它允许你为同一个 Activity 创建多个入口点，可以使用不同的 intent-filter、标签等）
   ::: code-group
   ``` xml
<activity-alias
    android:name=".AliasActivity"
    android:targetActivity=".MainActivity"
    android:label="@string/alias_activity_label">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity-alias>
   ```
   :::

