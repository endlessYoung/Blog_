# Android.mk

## 1.简介

Android.mk 是Android 提供的一种makefile 文件,注意用来编译生成（exe，so，a，jar，apk）等文件。

![alt text](00dcc58c4bbfe9695e913e87ba6d9062.jpg)

## 2.Android.mk 的基本格式

Android.mk 基本格式如下

``` txt
# 定义模块当前路径LOCAL_PATH := $(call my-dir)  #清空当前环境变量include $(CLEAR_VARS)  
................  # 引入头文件等LOCAL_xxx       := xxx#编译生成的文件名  LOCAL_MODULE    := hello  #编译该模块所需的源码LOCAL_SRC_FILES := hello.c  #引入jar包等LOCAL_xxx       := xxx  
................  #编译生成文件的类型 #LOCAL_MODULE_CLASS  、JAVA_LIBRARIES#APPS 、 SHARED_LIBRARIES#EXECUTABLES 、 ETCinclude $(BUILD_EXECUTABLE)  
```

## 3.Android.mk 深入学习一

使用Android.mk 可以编译多个目标文件：

![alt text](image-38.png)

1. 编译动态库

C/C++ 文件编译生成静态库.so文件参考如下

``` txt
LOCAL_PATH := $(call my-dir)    include $(CLEAR_VARS)    # 生成libhell.soLOCAL_MODULE = libhello    

LOCAL_CFLAGS = $(L_CFLAGS)    
LOCAL_SRC_FILES = hello.c  
LOCAL_C_INCLUDES = $(INCLUDES) 
LOCAL_SHARED_LIBRARIES := libcutils    
LOCAL_COPY_HEADERS_TO := libhello   
LOCAL_COPY_HEADERS := hello.h   

#编译动态库 BUILD_SHARED_LIBRARYinclude $(BUILD_SHARED_LIBRARY)  
```

2. 编译静态库

C/C++ 文件编译生成静态库.a文件参考如下

``` txt
#编译静态库    LOCAL_PATH := $(call my-dir)    include $(CLEAR_VARS)    # 生成libhell.aLOCAL_MODULE = libhello

LOCAL_CFLAGS = $(L_CFLAGS)    
LOCAL_SRC_FILES = hello.c    
LOCAL_C_INCLUDES = $(INCLUDES)    
LOCAL_SHARED_LIBRARIES := libcutils    
LOCAL_COPY_HEADERS_TO := libhello   
LOCAL_COPY_HEADERS := hellos.h   

 # 编译 静态库    BUILD_STATIC_LIBRARYinclude $(BUILD_STATIC_LIBRARY)
```

## 4.Android.mk 深入学习二

![alt text](image-39.png)

1. 引用静态库

LOCAL_STATIC_LIBRARIES += libxxxxx
``` txt
LOCAL_STATIC_LIBRARIES := \
    ...
    libxxx2 \
    libxxx \
```

2. 引用动态库

LOCAL_SHARED_LIBRARIES += libxxxxx
``` txt
LOCAL_SHARED_LIBRARIES := liblog libnativehelper libGLESv2
```

3. 引用第三方库文件

LOCAL_LDFLAGS:=-L/PATH -Lxxx
``` txt
LOCAL_LDFLAGS := $(LOCAL_PATH)/lib/libtest.a
```

4. 引用第三方头文件

LOCAL_C_INCLUDES :=path
``` txt
eg:
LOCAL_C_INCLUDES = $(INCLUDES)
```

## 5.Android.mk 深入学习三

![alt text](image-40.png)

1. 编译apk

``` txt
  LOCAL_PATH := $(call my-dir)  include $(CLEAR_VARS)
  LOCAL_SRC_FILES := $(call all-subdir-java-files)  # 生成hello apk
  LOCAL_PACKAGE_NAME := hello  include $(BUILD_PACKAGE)
```

2. 编译jar包

``` txt
  LOCAL_PATH := $(call my-dir)  include $(CLEAR_VARS)
  LOCAL_SRC_FILES := $(call all-subdir-java-files)  # 生成 hello
  LOCAL_MODULE := hello  # 编译生成静态jar包
  include $(BUILD_STATIC_JAVA_LIBRARY)  #编译生成共享jar
  include $(BUILD_JAVA_LIBRARY)
```

- 静态jar包：

include $(BUILD_STATIC_JAVA_LIBRARY)
使用.class文件打包而成的JAR文件，可以在任何java虚拟机运行

- 动态jar包：

include $(BUILD_JAVA_LIBRARY)
在静态jar包基础之上使用.dex打包而成的jar文件，.dex是android系统使用的文件格式。

3. APK 依赖jar

``` txt
LOCAL_PATH := $(call my-dir)include $(CLEAR_VARS)# 静态jar包LOCAL_STATIC_JAVA_LIBRARIES := static-library#动态jar包LOCAL_JAVA_LIBRARIES := share-library

LOCAL_SRC_FILES := $(call all-subdir-java-files)
LOCAL_PACKAGE_NAME := helloinclude $(BUILD_PACKAGE)
```

4. 预编译jar包

``` txt
LOCAL_PATH := $(call my-dir)include $(CLEAR_VARS)#指定编译生成的文件类型LOCAL_MODULE_CLASS := JAVA_LIBRARIES
LOCAL_MODULE := hello
LOCAL_SRC_FILES :=  $(call all-subdir-java-files)# 预编译include $(BUILD_PREBUILT)
```

预编译文件类型如下：

1.LOCAL_MODULE_CLASS：
编译文件类型

2.JAVA_LIBRARIES：
dex归档文件

3.APPS：
APK文件

4.SHARED_LIBRARIES：
动态库文件

5.EXECUTABLES：
二进制文件

6.ETC：
其他文件格式

## 6.Android.mk 判断语句

Android.mk 中的判断语句

``` txt
ifeq($(VALUE), x)   #ifneq
  do_yeselse
  do_noendif
```

ifeq/ifneq：根据判断条件执行相关编译