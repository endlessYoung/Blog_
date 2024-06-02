# Jobservice



## JobService的用法

1. 创建一个类继承JobService并重写父类的onStartJob和onStopJob方法
2. 声明JobServiceID并创建一个JobInfo（Builder模式），设置好Job的启动条件
3. 获取JobSchedule服务执行任务

