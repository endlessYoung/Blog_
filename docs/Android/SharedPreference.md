# SharedPreference

## 一、 SharedPreferences 简介
SharedPreferences是Android的一个接口类，是Android 数据存储（保存内部）的一种方法。主要以*.xml的形式保存在Android /data/data/com.***包名/shared_prefs下，SharedPreferences 类提供了一个通用框架，以便用户能够保存和检索原始数据类型的键值对，原始数据类型如下：。Boolean**，**Int**，**Float**，**Long**，**String**。

1.SharedPreferences 使用方法如下:
创建保存数据的xml文件，使用Editor 向xml文件中保存数据，commit()保存数据

xml保存位置
/data/data/com.***包名/shared_prefs

## 二、SharedPreferences 保存数据的方法
主要使用 **putBoolean()** 和 **putString()**、**putInt()** 等方法添加值。

## 三、SharedPreferences读取数据的方法
主要使用 **getBoolean()** 和 **getString()**、**getInt()** 等 获取保存的数据

## 四、总结SharePerference Utils 封装类使用方法

1.移除SharePerference 保存的值

``` java
    private static SharedPreferences sp;
    private static String SPXMLNAME = "sp_config";

    /**
     * @param ctx 上下文环境
     * @param key 要从config.xml移除节点的name的名称
     */
    public static void removeKey(Context ctx, String key) {
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        sp.edit().remove(key).commit();
    }
```

2.保存，获取 Boolean 类型值方法

``` java
    // 1,存储boolean变量方法
    public static void putBoolean(Context ctx, String key, boolean value) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        sp.edit().putBoolean(key, value).commit();
    }

    // 2,读取boolean变量方法
    public static boolean getBoolean(Context ctx, String key, boolean defValue) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        return sp.getBoolean(key, defValue);
    }
```

3.保存，获取String类型值方法
``` java
    public static void putString(Context ctx, String key, String value) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        sp.edit().putString(key, value).commit();
    }

    public static String getString(Context ctx, String key, String defValue) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        return sp.getString(key, defValue);
    }
```

4.保存，获取Int类型值方法

``` java
    //
    public static void putInt(Context ctx, String key, int value) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        sp.edit().putInt(key, value).commit();
    }

    public static int getInt(Context ctx, String key, int defValue) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        return sp.getInt(key, defValue);
    }
```

5. SharePerferenceUtils
``` java
package com.programandroid.Utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SharePerferenceUtils {

    private static SharedPreferences sp;
    private static String SPXMLNAME = "sp_config";

    /**
     * @param ctx
     *            上下文环境
     * @param key
     *            要从config.xml移除节点的name的名称
     */
    public static void removeKey(Context ctx, String key) {
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        sp.edit().remove(key).commit();
    }

    // 1,存储boolean变量方法
    public static void putBoolean(Context ctx, String key, boolean value) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        sp.edit().putBoolean(key, value).commit();
    }

    // 2,读取boolean变量方法
    public static boolean getBoolean(Context ctx, String key, boolean defValue) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        return sp.getBoolean(key, defValue);
    }

    public static void putString(Context ctx, String key, String value) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        sp.edit().putString(key, value).commit();
    }

    public static String getString(Context ctx, String key, String defValue) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        return sp.getString(key, defValue);
    }

    //
    public static void putInt(Context ctx, String key, int value) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        sp.edit().putInt(key, value).commit();
    }

    public static int getInt(Context ctx, String key, int defValue) {
        // name存储文件名称
        if (sp == null) {
            sp = ctx.getSharedPreferences(SPXMLNAME, Context.MODE_PRIVATE);
        }
        return sp.getInt(key, defValue);
    }
}
```

1. Activity 类中使用方法如下：
保存数据调用方法如下：

``` java 
SharePerferenceUtils.putInt(getApplicationContext(), "int_key", 1);
```

获取数据调用方法如下：
```java 
SharePerferenceUtils.getString(getApplicationContext(), "string_key", "default_values");
```
五、SharedPreferences 数据保存位置
SharedPreferences保存在app内部(/data/data/com.***包名/shared_prefs)，当手动清除APK 数据的时候，保存的数据会被清除掉

