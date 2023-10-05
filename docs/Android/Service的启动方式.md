# Service的启动方式

（1）Started Service被开启的service通过其他组件调用startService()被创建，这种service可以无限地运行下去，必须调用stopSelf()方法或者其他组件调用stopService()方法来停止它，当service被停止时，系统会销毁它

（2）Bounded Service被绑定的service是当其他组件（一个客户）调用bindService()来创建的，客户可以通过一个IBinder接口和service进行通信，客户可以通过unbindService()方法来关闭这种连接，一个service可以同时和多个客户绑定，当多个客户都解除绑定之后，系统会销毁service

