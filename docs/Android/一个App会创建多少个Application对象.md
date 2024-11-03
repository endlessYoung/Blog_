# 一个App会创建多少个Application对象

## 结论

1. 单进程，创建1个application对象，执行一次onCreate()方法
2. 多进程(N)，创建N个application对象，执行N次onCreate()方法