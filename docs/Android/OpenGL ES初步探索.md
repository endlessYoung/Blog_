# OpenGL ES初步探索

## 一、前言

::: tip
**本文中代码均为Kotlin**
:::

在应用开发过程中，我们经常会有诸如2D，3D的图形渲染的需要。在安卓平台上，有多种图形渲染技术可供选择，以下是一些主要的图形渲染技术：

1. **Canvas**：
   - **Canvas** 是安卓平台上的2D图形渲染技术。它允许你在View上绘制各种2D图形、文本和图像，以创建用户界面和定制绘图操作。

2. **OpenGL ES**：
   - **OpenGL ES**（OpenGL for Embedded Systems）是一种高性能的2D和3D图形渲染API，用于在安卓应用中创建复杂的图形和游戏。它直接与GPU交互，提供了强大的图形渲染功能，适用于需要高性能渲染的应用程序。

3. **Vulkan**：
   - **Vulkan** 是一个现代的、低级别的图形API，适用于安卓平台。它提供了更高的性能和更大的控制权，但相对复杂，通常适用于高度优化的图形应用。

4. **OpenGL**：
   - 除了OpenGL ES之外，安卓也支持标准的 **OpenGL**，用于在Android应用程序中进行2D和3D图形渲染。不过，需要注意的是，OpenGL ES更适用于移动设备，因为它专门针对嵌入式系统进行了优化。

5. **Android RenderScript**：
   - **RenderScript** 是一个高性能的计算和图形渲染框架，可以用于图像处理、计算密集型任务以及一些图形渲染操作。它可以利用多核CPU和GPU来加速图形和计算任务。

6. **Skia**：
   - **Skia** 是一个2D图形渲染引擎，是Android的默认渲染引擎之一。它用于绘制UI元素、文本和图像，以及处理图形操作。

7. **Unity 3D** 和 **Unreal Engine**：
   - 如果你要开发高度复杂的3D游戏或模拟应用，可以考虑使用游戏引擎，如 **Unity 3D** 或 **Unreal Engine**。它们提供了丰富的工具和资源，使游戏和虚拟现实应用的开发更加容易。

## 二、OpenGL的demo实践

在 Android 应用中使用 OpenGL ES 绘制图形，要为它们创建一个视图容器。其中一种比较直接的方式是同时实现 `GLSurfaceView` 和 `GLSurfaceView.Renderer`。**GLSurfaceView 是使用 OpenGL 绘制的图形的视图容器，而 GLSurfaceView.Renderer 可控制该视图中绘制的图形**。

GLSurfaceView 只是将 OpenGL ES 图形整合到您应用中的其中一种方式。适用于全屏或接近全屏的图形视图。如果希望将 OpenGL ES 图形整合到其布局的一小部分中，可以了解下 `TextureView`，也可以使用 SurfaceView 构建 OpenGL ES 视图，但这需要编写相当多的其他代码。

以下是一个最简单的用OpenGL实现图像加载的例子：

绘制形状
使用 OpenGL ES 2.0 绘制定义的形状需要大量代码，因为您必须向图形渲染管道提供大量详细信息。具体来说，您必须定义以下内容：

顶点着色程序 - 用于渲染形状的顶点的 OpenGL ES 图形代码。
片段着色程序 - 用于使用颜色或纹理渲染形状面的 OpenGL ES 代码。
程序 - 包含您希望用于绘制一个或多个形状的着色程序的 OpenGL ES 对象。
您至少需要一个顶点着色程序绘制形状，以及一个 Fragment 着色程序为该形状着色。您还必须对这些着色程序进行编译，然后将其添加到之后用于绘制形状的 OpenGL ES 程序中。以下示例展示了如何定义可用于绘制 Triangle 类中的形状的基本着色程序：


## bitmapTest

``` kotlin
import android.opengl.GLES20
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.ShortBuffer

class BitmapTest {
    // 每个顶点的坐标数
    private val COORDS_PER_VERTEX = 3
    // 每个纹理顶点的坐标数
    private val COORDS_PER_TEXTURE_VERTEX = 2
    // 顶点的坐标
    private var squareCoords = floatArrayOf(
        -1f, 1f, 0.0f,      // top left
        -1f, -1f, 0.0f,      // bottom left
        1f, -1f, 0.0f,      // bottom right
        1f, 1f, 0.0f       // top right
    )
    // 顶点所对应的纹理坐标
    private var texVertex = floatArrayOf(
        0f, 0f,      // top left
        0f, 1f,      // bottom left
        1f, 1f,       // bottom right
        1f, 0f     // top right
    )
    // 四个顶点的缓冲数组
    private val vertexBuffer: FloatBuffer =
        ByteBuffer.allocateDirect(squareCoords.size * 4).order(ByteOrder.nativeOrder())
            .asFloatBuffer().apply {
                put(squareCoords)
                position(0)
            }
    // 四个顶点的绘制顺序数组
    private val drawOrder = shortArrayOf(0, 1, 2, 0, 2, 3)

    // 四个顶点绘制顺序数组的缓冲数组
    private val drawListBuffer: ShortBuffer =
        ByteBuffer.allocateDirect(drawOrder.size * 2).order(ByteOrder.nativeOrder())
            .asShortBuffer().apply {
                put(drawOrder)
                position(0)
            }

    // 四个纹理顶点的缓冲数组
    private val texVertexBuffer: FloatBuffer =
        ByteBuffer.allocateDirect(texVertex.size * 4).order(ByteOrder.nativeOrder())
            .asFloatBuffer().apply {
                put(texVertex)
                position(0)
            }

    private var vPMatrixHandle: Int = 0

    /**
     * 顶点着色器代码;
     */
    private val vertexShaderCode =
        "attribute vec4 inputTextureCoordinate;" +
                " varying vec2 textureCoordinate;" +
                "attribute vec4 vPosition;" +
                "void main() {" +
                // 把vPosition顶点经过矩阵变换后传给gl_Position
                "  gl_Position = vPosition;" +
                "textureCoordinate = inputTextureCoordinate.xy;" +
                "}"

    /**
     * 片段着色器代码
     */
    private val fragmentShaderCode =
        "varying highp vec2 textureCoordinate;" +
                "uniform sampler2D inputImageTexture;" +
                "void main() {" +
                "  gl_FragColor = texture2D(inputImageTexture, textureCoordinate);" +
                "}"
    /**
     * 着色器程序ID引用
     */
    private var mProgram: Int

    init {
        // 编译顶点着色器和片段着色器
        val vertexShader: Int = loadShader(GLES20.GL_VERTEX_SHADER, vertexShaderCode)
        val fragmentShader: Int = loadShader(GLES20.GL_FRAGMENT_SHADER, fragmentShaderCode)
        // glCreateProgram函数创建一个着色器程序，并返回新创建程序对象的ID引用
        mProgram = GLES20.glCreateProgram().also {
            // 把顶点着色器添加到程序对象
            GLES20.glAttachShader(it, vertexShader)
            // 把片段着色器添加到程序对象
            GLES20.glAttachShader(it, fragmentShader)
            // 连接并创建一个可执行的OpenGL ES程序对象
            GLES20.glLinkProgram(it)
        }
    }

    private fun loadShader(type: Int, shaderCode: String): Int {
        // glCreateShader函数创建一个顶点着色器或者片段着色器,并返回新创建着色器的ID引用
        val shader = GLES20.glCreateShader(type)
        // 把着色器和代码关联,然后编译着色器
        GLES20.glShaderSource(shader, shaderCode)
        GLES20.glCompileShader(shader)
        return shader
    }

    private val vertexStride: Int = COORDS_PER_VERTEX * 4
    private val textVertexStride: Int = COORDS_PER_TEXTURE_VERTEX * 4

    fun draw(textureID: Int) {
        // 激活着色器程序 Add program to OpenGL ES environment
        GLES20.glUseProgram(mProgram)
        // 获取顶点着色器中的vPosition变量(因为之前已经编译过着色器代码,所以可以从着色器程序中获取);用唯一ID表示
        val position = GLES20.glGetAttribLocation(mProgram, "vPosition")
        // 允许操作顶点对象position
        GLES20.glEnableVertexAttribArray(position)
        // 将顶点数据传递给position指向的vPosition变量;将顶点属性与顶点缓冲对象关联
        GLES20.glVertexAttribPointer(
            position, COORDS_PER_VERTEX, GLES20.GL_FLOAT,
            false, vertexStride, vertexBuffer
        )
        // 激活textureID对应的纹理单元
        GLES20.glActiveTexture(textureID)
        // 绑定纹理
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textureID)
        // 获取顶点着色器中的inputTextureCoordinate变量(纹理坐标);用唯一ID表示
        val textureCoordinate = GLES20.glGetAttribLocation(mProgram, "inputTextureCoordinate")
        // 允许操作纹理坐标inputTextureCoordinate变量
        GLES20.glEnableVertexAttribArray(textureCoordinate)
        // 将纹理坐标数据传递给inputTextureCoordinate变量
        GLES20.glVertexAttribPointer(
            textureCoordinate, COORDS_PER_TEXTURE_VERTEX, GLES20.GL_FLOAT,
            false, textVertexStride, texVertexBuffer
        )
        // 按drawListBuffer中指定的顺序绘制四边形
        GLES20.glDrawElements(
            GLES20.GL_TRIANGLE_STRIP, drawOrder.size,
            GLES20.GL_UNSIGNED_SHORT, drawListBuffer
        )
        // 操作完后,取消允许操作顶点对象position
        GLES20.glDisableVertexAttribArray(position)
        GLES20.glDisableVertexAttribArray(textureCoordinate)
    }
}

```


## MyGLRenderer

``` kotlin
package com.example.opengltest

import BitmapTest
import android.graphics.Bitmap
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.opengl.Matrix
import android.os.SystemClock
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

class MyGLRenderer : GLSurfaceView.Renderer {
    private lateinit var mTriangle: Triangle
    private val rotationMatrix = FloatArray(16)

    // vPMatrix is an abbreviation for "Model View Projection Matrix"
    private val vPMatrix = FloatArray(16)
    private val projectionMatrix = FloatArray(16)
    private val viewMatrix = FloatArray(16)

    private lateinit var bitmapSquare : BitmapTest
    // 纹理ID
    private var glTextureId = 0
    private var bitmap: Bitmap? = null

    override fun onSurfaceCreated(unused: GL10, config: EGLConfig) {
        GLES20.glClearColor(0.0f, 0.0f, 0.0f, 1.0f)

//        mTriangle = Triangle()

        bitmapSquare = BitmapTest()
        // 创建纹理
        glTextureId = OpenGLUtils.createTexture(bitmap, GLES20.GL_NEAREST, GLES20.GL_LINEAR,
            GLES20.GL_CLAMP_TO_EDGE, GLES20.GL_CLAMP_TO_EDGE)

    }

    override fun onDrawFrame(unused: GL10) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)

//        创建4*4矩阵数组
        val scratch = FloatArray(16)
        // Set the camera position (View matrix)
//      相机位于坐标原点，Z轴负方向移动了-3个单位，视角看向Z轴的正方向
        Matrix.setLookAtM(viewMatrix, 0, 0f, 0f, -3f, 0f, 0f, 0f, 0f, 1.0f, 0.0f)

        // Calculate the projection and view transformation
        Matrix.multiplyMM(vPMatrix, 0, projectionMatrix, 0, viewMatrix, 0)

        // Create a rotation transformation for the triangle
        val time = SystemClock.uptimeMillis() % 4000L
        val angle = 0.090f * time.toInt()
        Matrix.setRotateM(rotationMatrix, 0, angle, 0f, 0f, 1.0f)

        // Combine the rotation matrix with the projection and camera view
        // Note that the vPMatrix factor *must be first* in order
        // for the matrix multiplication product to be correct.
//        执行矩阵相乘操作
        Matrix.multiplyMM(scratch, 0, vPMatrix, 0, rotationMatrix, 0)

        // Draw triangle
//        mTriangle.draw(vPMatrix)
//        mTriangle.draw(scratch)

        bitmapSquare.draw(glTextureId)

    }

    override fun onSurfaceChanged(unused: GL10, width: Int, height: Int) {
        GLES20.glViewport(0, 0, width, height)

        val ratio: Float = width.toFloat() / height.toFloat()

        // this projection matrix is applied to object coordinates
        // in the onDrawFrame() method
        Matrix.frustumM(projectionMatrix, 0, -ratio, ratio, -1f, 1f, 3f, 7f)
    }


    fun loadShader(type: Int, shaderCode: String): Int {

        // create a vertex shader type (GLES20.GL_VERTEX_SHADER)
        // or a fragment shader type (GLES20.GL_FRAGMENT_SHADER)
        return GLES20.glCreateShader(type).also { shader ->

            // add the source code to the shader and compile it
            GLES20.glShaderSource(shader, shaderCode)
            GLES20.glCompileShader(shader)
        }
    }

    fun setImageBitmap(bitmap: Bitmap) {
        this.bitmap = bitmap
    }

}

```

## MyGLSurfaceView

``` kotlin
package com.example.opengltest

import android.content.Context
import android.graphics.BitmapFactory
import android.opengl.GLSurfaceView

class MyGLSurfaceView (context: Context) : GLSurfaceView(context){
    private val renderer : MyGLRenderer

    init {
        setEGLContextClientVersion(2)

        renderer = MyGLRenderer()
//        renderMode = RENDERMODE_WHEN_DIRTY
        val bitmap = BitmapFactory.decodeResource(context?.resources, R.drawable.img_1)
        renderer.setImageBitmap(bitmap)
        setRenderer(renderer)
    }
}

```

## OpenGLESActivity

``` kotlin
package com.example.opengltest

import android.app.Activity
import android.opengl.GLSurfaceView
import android.os.Bundle

class OpenGLESActivity : Activity() {
    private lateinit var gLView : GLSurfaceView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        gLView = MyGLSurfaceView(this)
        setContentView(gLView)


    }
}
```

## OpenGLUtils

``` kotlin
package com.example.opengltest

import android.graphics.Bitmap
import android.opengl.GLES20
import android.opengl.GLUtils


object OpenGLUtils {
    /**
     * 根据bitmap创建2D纹理
     * @param bitmap
     * @param minFilter     缩小过滤类型 (1.GL_NEAREST ; 2.GL_LINEAR)
     * @param magFilter     放大过滤类型
     * @param wrapS         纹理S方向边缘环绕;也称作X方向
     * @param wrapT         纹理T方向边缘环绕;也称作Y方向
     * @return 返回创建的 Texture ID
     */
    fun createTexture(
        bitmap: Bitmap?,
        minFilter: Int,
        magFilter: Int,
        wrapS: Int,
        wrapT: Int
    ): Int {
        val textureHandle =
            createTextures(GLES20.GL_TEXTURE_2D, 1, minFilter, magFilter, wrapS, wrapT)
        if (bitmap != null) {
            // 4.把bitmap加载到纹理中
            GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, bitmap, 0)
        }
        return textureHandle[0]
    }

    /**
     * 创建纹理
     * @param textureTarget Texture类型。
     * 1. 相机用 GLES11Ext.GL_TEXTURE_EXTERNAL_OES
     * 2. 图片用 GLES20.GL_TEXTURE_2D
     * @param count         创建纹理数量
     * @param minFilter     缩小过滤类型 (1.GL_NEAREST ; 2.GL_LINEAR)
     * @param magFilter     放大过滤类型
     * @param wrapS         纹理S方向边缘环绕;也称作X方向
     * @param wrapT         纹理T方向边缘环绕;也称作Y方向
     * @return 返回创建的 Texture ID
     */
    private fun createTextures(
        textureTarget: Int, count: Int, minFilter: Int, magFilter: Int, wrapS: Int,
        wrapT: Int
    ): IntArray {
        val textureHandles = IntArray(count)
        for (i in 0 until count) {
            // 1.生成纹理
            GLES20.glGenTextures(1, textureHandles, i)
            // 2.绑定纹理
            GLES20.glBindTexture(textureTarget, textureHandles[i])
            // 3.设置纹理属性
            // 设置纹理的缩小过滤类型（1.GL_NEAREST ; 2.GL_LINEAR）
            GLES20.glTexParameterf(textureTarget, GLES20.GL_TEXTURE_MIN_FILTER, minFilter.toFloat())
            // 设置纹理的放大过滤类型（1.GL_NEAREST ; 2.GL_LINEAR）
            GLES20.glTexParameterf(textureTarget, GLES20.GL_TEXTURE_MAG_FILTER, magFilter.toFloat())
            // 设置纹理的X方向边缘环绕
            GLES20.glTexParameteri(textureTarget, GLES20.GL_TEXTURE_WRAP_S, wrapS)
            // 设置纹理的Y方向边缘环绕
            GLES20.glTexParameteri(textureTarget, GLES20.GL_TEXTURE_WRAP_T, wrapT)
        }
        return textureHandles
    }
}

```

## Triangle

``` kotlin
package com.example.opengltest

import android.opengl.GLES20
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

// number of coordinates per vertex in this array
const val COORDS_PER_VERTEX = 3
var triangleCoords = floatArrayOf(     // in counterclockwise order:
    0.0f, 0.622008459f, 0.0f,      // top
    -0.5f, -0.311004243f, 0.0f,    // bottom left
    0.5f, -0.311004243f, 0.0f      // bottom right
)

class Triangle {
    private var mProgram: Int

    private val fragmentShaderCode =
        "precision mediump float;" +
                "uniform vec4 vColor;" +
                "void main() {" +
                "  gl_FragColor = vColor;" +
                "}"
    private val vertexShaderCode =
    // This matrix member variable provides a hook to manipulate
        // the coordinates of the objects that use this vertex shader
        "uniform mat4 uMVPMatrix;" +
                "attribute vec4 vPosition;" +
                "void main() {" +
                // the matrix must be included as a modifier of gl_Position
                // Note that the uMVPMatrix factor *must be first* in order
                // for the matrix multiplication product to be correct.
                "  gl_Position = uMVPMatrix * vPosition;" +
                "}"

    // Use to access and set the view transformation
    private var vPMatrixHandle: Int = 0

    // Set color with red, green, blue and alpha (opacity) values
    val color = floatArrayOf(0.63671875f, 0.76953125f, 0.22265625f, 1.0f)

    private var vertexBuffer: FloatBuffer =
        // (number of coordinate values * 4 bytes per float)
        ByteBuffer.allocateDirect(triangleCoords.size * 4).run {
            // use the device hardware's native byte order
            order(ByteOrder.nativeOrder())

            // create a floating point buffer from the ByteBuffer
            asFloatBuffer().apply {
                    // add the coordinates to the FloatBuffer
                    put(triangleCoords)
                    // set the buffer to read the first coordinate
                    position(0)
            }
        }

    init {
        val vertexShader: Int = MyGLRenderer().loadShader(GLES20.GL_VERTEX_SHADER, vertexShaderCode)
        val fragmentShader: Int = MyGLRenderer().loadShader(GLES20.GL_FRAGMENT_SHADER, fragmentShaderCode)

        // create empty OpenGL ES Program
        mProgram = GLES20.glCreateProgram().also {

            // add the vertex shader to program
            GLES20.glAttachShader(it, vertexShader)

            // add the fragment shader to program
            GLES20.glAttachShader(it, fragmentShader)

            // creates OpenGL ES program executables
            GLES20.glLinkProgram(it)
        }
    }

    private var positionHandle: Int = 0
    private var mColorHandle: Int = 0

    private val vertexCount: Int = triangleCoords.size / COORDS_PER_VERTEX
    private val vertexStride: Int = COORDS_PER_VERTEX * 4 // 4 bytes per vertex

    fun draw(mvpMatrix: FloatArray) {
        // Add program to OpenGL ES environment
        GLES20.glUseProgram(mProgram)

        // get handle to vertex shader's vPosition member
        positionHandle = GLES20.glGetAttribLocation(mProgram, "vPosition").also {

            // Enable a handle to the triangle vertices
            GLES20.glEnableVertexAttribArray(it)

            // Prepare the triangle coordinate data
            GLES20.glVertexAttribPointer(
                it,
                COORDS_PER_VERTEX,
                GLES20.GL_FLOAT,
                false,
                vertexStride,
                vertexBuffer
            )

            // get handle to fragment shader's vColor member
            mColorHandle = GLES20.glGetUniformLocation(mProgram, "vColor").also { colorHandle ->

                // Set color for drawing the triangle
                GLES20.glUniform4fv(colorHandle, 1, color, 0)
            }

            // Draw the triangle
            GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, vertexCount)

            // Disable vertex array
            GLES20.glDisableVertexAttribArray(it)
        }

        // get handle to shape's transformation matrix
        vPMatrixHandle = GLES20.glGetUniformLocation(mProgram, "uMVPMatrix")

        // Pass the projection and view transformation to the shader
        GLES20.glUniformMatrix4fv(vPMatrixHandle, 1, false, mvpMatrix, 0)

        // Draw the triangle
        GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, vertexCount)

        // Disable vertex array
        GLES20.glDisableVertexAttribArray(positionHandle)
    }
}

```