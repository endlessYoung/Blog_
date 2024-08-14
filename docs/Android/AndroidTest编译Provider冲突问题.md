# AndroidTest编译Provider冲突问题

## 1. 故障原因

安装AndroidTest的apk时报错信息：

>**INSTALL_FAILED_CONFLICTING_PROVIDER**

(**因为provider冲突所以无法安装apk，provider只能唯一**)

## 2. 故障排查方法

在AndroidStudio的项目目录中找到编译生成的 **apk文件**，双击打开并查看 **AndroidManifest.xml** 文件，搜索 **provider** 标签，查看该标签是否正确解析。

经检查发现provider标签的包名不正确，因**为AndroidTest会生成一个和main目录中一样的包名前缀然后加上test后缀加以区分**。
例如：main目录的包名是 `com.example.app` 那么AndroidTest目录的包名就自动生成为 `com.example.app.test`。

## 3. 原因分析：
1. **AndroidManifest.xml** 文件中还是没有添加包名的provider，所以包名会无法正确解析。
2. 但是造成报错的真正原因是 **AndroidTest 中没有配置 `AndroidManifest.xml` 文件** 从而默认使用了main中的**AndroidManifest.xml**文件，导致与main中的provider重复造成冲突。

## 4. 解决方案

**步骤一**：在AndroidTest目录中添加 `AndroidManifest.xml` 文件，然后将想要差异化的provider标签添加进来，修改provider的name的前缀为main中的包名前缀，也就是例子中的`com.example.app`。

**步骤二**：修改provider的 `authorities` ，在main中的provider的authorities的基础上添加.test作为区分。

**步骤三**：创建tools命名空间并添加 `tools:node="replace"` 属性使得在编译时可以正确替换掉main中的provider以解决冲突问题。