# ADB

## 1.高级用法
- app入口：adb logcat | grep -i displayed
- 杀掉应用并重新启动：adb shell am start -W -n <package_name>/<activity_name> -S，其中<package_name>是应用程序的包名，<activity_name>是要启动的Activity名称。
- 清除缓存以及权限都重置：adb shell pm clear <package_name>
- 查看设备安装包名：adb shell pm list packages
- 输出日志到某个文件：adb logcat -d>logcat.txt
- 打印默认日志数据：adb logcat
- 打印日志详细时间的简单数据：adb logcat -v time
- 打印级别为Error的信息：adb logcat "*:E"
- 打印时间和级别是Error的信息：adb logcat -v time "*:E"MAC系统使用该命令，需要添加双引号
- 指定包名输出日志：adb logcat -v time *:E -e <package_name>
- 清除之前的日志信息：adb logcat -c
- 过滤日志：adb logcat | grep "kpl_coach" | grep “PkRoomActivity"
- 关键字或过滤日志：adb logcat | grep -E "kpl_coach|PkRoomActivity"
- 获取近期崩溃日志：adb shell logcat -b crash
- 获取SDK版本号：adb shell getprop ro.build.version.release
- 获取手机名称：adb shell getprop ro.product.brand
- 获取手机型号：adb shell getprop ro.product.model
- 获取手机IP：adb shell ifconfig
- 获取手机设备ID：adb shell settings get secure android_id
- 获取手机分辨率：adb shell dumpsys window displays
- 获取手机Mac地址：adb shell cat/sys/class/net/wlan0/address
- 获取手机截图：adb shell screencap /sdcard/screenshot.png
- 录制屏幕：adb shell screenrecord
- 根据包名得到进程id：adb shell ps | grep <package_name>

## 2.性能统计
- 获取所有的dumpsys子命令：adb shell dumpsys | grep -I DUMP
- 获取当前activity：adb shell dumpsys activity top
- 获取特定包基本信息：adb shell dumpsys package <package_name>
- 获取系统通知：adb shell dumpsys notification
- 获得内存信息：adb shell dumpsys meminto <package_name>
- 获取cpu信息：adb shell dumpsys cpuinfo
- 获取gpu绘制分析：adb shell dumpsys gfxinfo <package_name>
- 获取电量：adb shell dumpsys battery

