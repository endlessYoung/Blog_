# Retrofit

`Retrofit` 是一个类型安全的 `HTTP` 客户端，主要用于与 `RESTful API` 进行交互，简化了网络请求的流程。

`Retrofit` 适用 Converter 来处理请求和响应的转换，支持 `JSON`、`XML`、`Protobuf` 等格式。常见的转换器有：
1. `GsonConvertFactory`: 用于 `JSON` 格式的解析。
2. `MoshiConvertFactory`: 用于 `Moshi` 的 `JSON` 解析。
3. `SimpleXMLConvertFactory`: 用于 `XML` 格式的解析。

`Retrofit` 支持同步（`execute()`）和异步（`enqueue()`）请求。Retrofit 和 OkHttp 一起适用，能使用拦截器（`Interceptor`）来处理请求和响应

## 2. Retrofit 工作流程

1. 定义接口：
使用 `Retrofit` 定义 HTTP 请求，利用注解来描述 API 的请求路径、HTTP 方法、请求体等。
2. 创建 Retrofit 实例：
配置 `Retrofit` 实例，指定 `Base URL` 和 `转换器`（例如，使用 Gson 解析 JSON）。
3. 执行请求：
通过调用接口方法来执行请求，Retrofit 会根据接口定义自动生成网络请求，并返回相应的结果。

## 3. 主要功能和接口

1. `GET` 请求：用于获取数据。
2. `POST` 请求：用于提交数据。
3. `PUT` 请求：用于更新数据。
4. `DELETE` 请求：用于删除数据。

## 4. 示例

1. 添加 `Retrofit` 依赖

::: code-group
``` xml
dependencies {
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:okhttp:4.9.0'
}
```
:::

2. 定义 API 接口

::: code-group
``` java
public interface ApiService {

    // 定义一个 GET 请求，获取用户信息
    @GET("users/{user}/repos")
    Call<List<Repo>> getUserRepos(@Path("user") String user);

    // 定义一个 POST 请求，提交 JSON 数据
    @POST("users")
    Call<User> createUser(@Body User user);

    // 定义一个异步请求的 GET 方法
    @GET("users/{user}/repos")
    Call<List<Repo>> getUserReposAsync(@Path("user") String user);
}
```
:::

3. 创建 Retrofit 实例

::: code-group
``` java
Retrofit retrofit = new Retrofit.Builder()
        .baseUrl("https://api.github.com/")
        .addConverterFactory(GsonConverterFactory.create()) // 使用 Gson 转换器
        .build();
```
:::

4. 创建 API 服务

::: code-group
``` java
ApiService apiService = retrofit.create(ApiService.class);
```
:::

5. 发起同步请求

::: code-group
``` java
Call<List<Repo>> call = apiService.getUserRepos("octocat");
try {
    Response<List<Repo>> response = call.execute();  // 同步执行
    if (response.isSuccessful()) {
        List<Repo> repos = response.body();
        // 处理 repos 数据
    } else {
        // 处理请求失败的情况
    }
} catch (IOException e) {
    e.printStackTrace();
}
```
:::

6. 发起异步请求

::: code-group
``` java
Call<List<Repo>> call = apiService.getUserReposAsync("octocat");
call.enqueue(new Callback<List<Repo>>() {
    @Override
    public void onResponse(Call<List<Repo>> call, Response<List<Repo>> response) {
        if (response.isSuccessful()) {
            List<Repo> repos = response.body();
            // 处理 repos 数据
        }
    }

    @Override
    public void onFailure(Call<List<Repo>> call, Throwable t) {
        // 处理请求失败
    }
});
```
:::

## 5. 进阶功能
1. 请求和响应拦截器：

可以使用 `OkHttp` 拦截器来对请求或响应进行处理。例如，添加统一的请求头，处理错误响应等。

::: code-group
``` java
OkHttpClient client = new OkHttpClient.Builder()
        .addInterceptor(new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
                Request request = chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer token")
                        .build();
                return chain.proceed(request);
            }
        })
        .build();

Retrofit retrofit = new Retrofit.Builder()
        .baseUrl("https://api.github.com/")
        .client(client) // 使用自定义的 OkHttpClient
        .addConverterFactory(GsonConverterFactory.create())
        .build();
```
:::

2. 自定义转换器：

除了 `Gson` 和 `Moshi` 等常见的转换器，你也可以自定义转换器来支持其他数据格式。

3. 支持分页：

对于分页请求，可以通过 `@Query` 注解来传递分页参数，获取不同页面的数据。

4. 缓存：
可以使用 OkHttp 的缓存机制，配置请求的缓存策略，减少不必要的网络请求。