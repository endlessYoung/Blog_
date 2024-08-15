# AndroidTest测试Service无响应问题

startService发现没有相应

## 原因

service是耗时任务，测试进程结束了还没有接收到service的执行结果回调，assertTrue 或者 assertEquals 断言直接失败！

