# APK打包流程

## 1. 前言

APK文件大致分为两个部分：代码 和 资源，所以打包也就分为这两个部分。
简要流程：
1. 通过 `AAPT` 工具进行资源文件的打包，生成 `R.java` 文件。
2. 通过 `AIDL` 工具处理AIDL文件，生成 `java` 文件。
3. 通过 `JavaC` 工具编译项目源码，生成 `class` 文件
4. 通过 `DEX` 工具将所有的class文件转换成 `DEX` 文件，该过程主要完成 `Java` 字节码转换成 `Dalvik` 字节码，压缩常量池以及清除冗余信息等。
5. 通过 `ApkBuilder` 工具将资源文件、DEX文件打包生成APK文件。
6. 利用 `KeyStore` 对生成的APK文件进行签名。
7. 如果是正式版的APK，还会使用 `ZipAlign` 进行对齐处理，对齐的过程就是将APK文件中所有的资源文件的起始距离都偏移4字节的整数倍，这样通过内存映射访问APK的速度会更快。


## 2. aapt阶段

## 3. aidl阶段

## 4. Java Compiler阶段

## 5. dex阶段

## 6. apkbuilder阶段

## 7. Jarsingner阶段

## 8. zipalign阶段