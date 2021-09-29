---
title: OpenGL入門から3DCGレンダラ実装まで その4
description: "OpenGL入門から3DCGレンダラ実装まで"
series: "OpenGL入門から3DCGレンダラ実装まで"
tags:
  - 'OpenGL'
---

# ウィンドウを表示する
やっとc++のコードを書くことができます。ここでは、これからレンダラとなっていくソフトウェアのベースであるウィンドウ表示をやってみます。
はじめに今回利用するコードの全文を載せておきます。このコードは作業ディレクトリの直下に`main.cpp`という名前で作成します。

```cpp[main.cpp]
#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
#include <iostream>

const unsigned int WINDOW_WIDTH = 1440;
const unsigned int WINDOW_HEIGHT = 810;

void keyHandler(GLFWwindow*, int, int, int, int);

int main()
{
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 4);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);

    GLFWwindow* window = glfwCreateWindow(WINDOW_WIDTH, WINDOW_HEIGHT, "advent_gl", nullptr, nullptr);

    if (!window)
    {
        std::cerr << "Failed to create window." << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    glfwSetKeyCallback(window, keyHandler);

    if (!gladLoadGLLoader(reinterpret_cast<GLADloadproc>(glfwGetProcAddress)))
    {
        std::cerr << "Failed to initialize GLAD" << std::endl;
        return -1;
    }

    while (!glfwWindowShouldClose(window))
    {
        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}

void keyHandler(GLFWwindow *window, int key, int scancode, int action, int mods)
{
    switch (key)
    {
        case GLFW_KEY_ESCAPE:
            if (action == GLFW_PRESS)
            {
                glfwSetWindowShouldClose(window, GLFW_TRUE);
            }
            break;
    }
}
```

まだ真っ黒なウィンドウを出すだと言うのに、それなりのコード量がありますね。一つづつ見ていきましょう。

## ライブラリのインクルード
以下の部分です。

```cpp[main.cpp(ライブラリインクルード部)]
#include <glad/glad.h>
#include <GLFW/glfw3.h>

#include <glm/glm.hpp>
```

「いや、流石にそんな事知っているしみればわかるが」と思われたかもしれませんが、実は注意が必要です。
gladは自分よりも前にOpenGLを扱う(具体的にはgl.hをインクルードする)ライブラリが存在することを許さないため、基本的にgladを一番始めにインクルードしなければなりません。この順序を変えるとビルドが通らなくなります[^formatter]。

## ウィンドウ/コンテキストを作成

まずは以下の箇所です。ここはOSやディスプレイサーバーに合ったウィンドウの作成と、これからOpenGLで操作していくコンテキストを作成している部分になります。

```cpp[main.cpp(ウィンドウ/コンテキスト作成部)]
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 4);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_RESIZABLE, GLFW_FALSE);

    GLFWwindow* window = glfwCreateWindow(WINDOW_WIDTH, WINDOW_HEIGHT, "advent_gl", nullptr, nullptr);

    if (!window)
    {
        std::cerr << "Failed to create window." << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    glfwSetKeyCallback(window, keyHandler);
```

まず`glfwInit()`という関数を呼んでいます。これはほぼすべてのGLFWの関数を呼ぶ前に呼んでおく必要のある関数[^glfwInit]で、GLFWの初期化処理を行います。この初期化処理では実行されたコンピュータの環境をチェックし、利用可能なOpenGLの機能やキーボードやマウスなど入出力装置の取得、モニタの認識など重要な作業が行なわれます。GLFWを使えば、クロスプラットフォームで動くこれらの処理をこの1行でやってくれてしまうのです。最高ですね。

続いて`glfwWindowHint()`というのが何やらやっています。これは、GLFWで実際にウィンドウを作成する前に、これから作るウィンドウやそれに関連付けられるコンテキストの設定をGLFWに教えてあげる関数です。設定項目は[ここ](https://www.glfw.org/docs/latest/window_guide.html#window_hints)に一覧がありますが、もちろんすべてを設定する必要はありません。いくつかの必要な情報を選び取って設定します。今回は以下のような設定を行いました。

| 設定項目                   | 意味                                                                                                                                 | 今回の設定値             |
|----------------------------|--------------------------------------------------------------------------------------------------------------------------------------|--------------------------|
| GLFW_CONTEXT_VERSION_MAJOR | 利用するOpenGLの最大バージョン                                                                                                       | 4                        |
| GLFW_CONTEXT_VERSION_MINOR | 利用するOpenGLの最小バージョン                                                                                                       | 4                        |
| GLFW_OPENGL_PROFILE        | 利用するOpenGLプロファイル。`GLFW_OPENGL_FORWARD_COMPAT`(互換プロファイル)と`GLFW_OPENGL_CORE_PROFILE`(コアプロファイル)が指定可能。 | GLFW_OPENGL_CORE_PROFILE |
| GLFW_RESIZABLE             | 作成するウィンドウのサイズ変更が外部から可能かどうか。`GLFW_TRUE`か`GLFW_FALSE`を設定可能。[^windowSize]                                                  | GLFW_FALSE               |

これらの設定を行なった上で、満を持して`glfwCreateWindow()`でウィンドウとそれに紐づけられるコンテキストを作成します。ここではウィンドウサイズやウィンドウタイトルなどを設定しています。`nullptr`になっている部分は関連付けるウィンドウや対象とするモニタなどを設定できるのですが、今回は特に必要ないため指定していません。

これでOSやディスプレイサーバーに合ったウィンドウ/コンテキストを作成することが出来ました。しかし、まだこれではコンテキストが作成されただけで、これからこれを利用する設定は出来ていません。それを行うのが`glfwMakeContextCurrent()`です。これが呼び出されると、呼び出し元のスレッドに渡されたウィンドウが持つコンテキストが関連付けられます。今回の開発ではそこまでやりませんが、複数のコンテキストを扱う場合などにはこういった関数を各所で呼び出してコンテキストの取り回しを行うようです。

最後に、`glfwSetKeyCallback()`で作製したウィンドウに対する入力をハンドリングするコールバック関数を設定しています。　このコールバック関数は以下です。

```cpp[main.cpp(keyHandler関数)]
void keyHandler(GLFWwindow *window, int key, int scancode, int action, int mods)
{
    switch (key)
    {
        case GLFW_KEY_ESCAPE:
            if (action == GLFW_PRESS)
            {
                glfwSetWindowShouldClose(window, GLFW_TRUE);
            }
            break;
    }
}
```

大変単純ですね。コールバック引数として受けとった値を元に、エスケープキーが押されたら`glfwSetWindowShouldClose()`を呼び出しています。この関数に`GLFW_TRUE`をセットすると、対象のウィンドウにクローズのフラグ立ちます。このフラグにはウィンドウのオブジェクトを通して他の場所からアクセスできるため、このフラグを監視することでウィンドウの終了処理を書くことが出来ます。
もちろんこのハンドラはあらゆるキー入力に反応するので、ケースを増やすことで様々なキー入力に対応することができます。GLFWで定義されているキーの一覧は[ここ](https://www.glfw.org/docs/latest/group__keys.html)にあります[^closeInput]。

## OpenGL関数のロード
いよいよOpenGL関数のロード処理です。これは以下の部分で行なっています。

```cpp[main.cpp(OpenGL関数のロード部)]
    if (!gladLoadGLLoader(reinterpret_cast<GLADloadproc>(glfwGetProcAddress)))
    {
        std::cerr << "Failed to initialize GLAD" << std::endl;
        return -1;
    }
```

ちょっと不思議なコードに感じないでしょうか。`glfwGetProcAddress`と言うのに違和感があるかと思います。お察しの通りこれはGLFWの関数で、それを`GLADloadproc`という型に無理やりキャストした上でgladの`gladLoadGLLoader()`という関数に渡しています。ライブラリをまたいでいるし、なんだかよくわかりません。

実は、`glfwGetProcAddress`というのは以下のような文字列を受け取る関数です。この文字列はOpenGLの特定の機能を指し示す固有の文字列で、この関数は渡された文字列に該当する機能の関数があればその関数のポインタを返すという動作をします。

```cpp
GLFWglproc glfwGetProcAddress(const char * procname)
```

そして、gladはOpenGLの関数や拡張機能をロードするライブラリで、特に自分が使いたいものだけを選んで生成した上で利用することができるものでした。そう、ここでgladに`glfwGetProcAddress`を渡すことで、glad内部で読み込むことになっている機能名を片っ端からこれに突っ込んで、OpenGLの関数をロードしているのです。つまりは、`GLFWglproc`とかいうやつにOpenGLの関数ポインタが入って返ってくるということですね。これを踏まえて読めば納得のコードです。

## メイン処理ループ
いよいよメインの処理ループの部分です。以下のコードが該当します。

```cpp[main.cpp(メイン処理ループ部)]
    while (!glfwWindowShouldClose(window))
    {
        glfwSwapBuffers(window);
        glfwPollEvents();
    }
```

過去最高級にシンプルです。
まず、このループは`glfwWindowShouldClose()`の返す値が`GLFW_FALSE`である間だけ回り続けます。似たような関数名を先程見ましたね。これは渡されたウィンドウに存在するクローズのフラグの状態を取得する関数です。つまり、先程設定したコールバック内でエスケープキーが押されるとフラグが立ち、このループが終了するということになります。

内部では`glfwSwapBuffers()`と`glfwPollEvents()`というのを呼んでいます。`glfwSwapBuffers()`は今説明すると話がややこしくなるので次回以降に取っておきます。
`glfwPollEvents()`の方は、現在GLFWがイベントキューに受け取っているイベントを元に、設定された各種コールバックの呼び出しなどを行う関数です。ループ内で繰り返し呼び出され、新たにキューに入ってきたイベントがあれば処理を行い、キューから取り出すということをやっています。
これを呼び出さないと先程`glfwSetKeyCallback()`で設定した関数は永遠に呼び出されず、キー入力をハンドリングすることはできません。気をつけましょう。

# 実行してみる
さて、準備は整いました。ウィンドウを表示するコードも書いたし、ビルド環境も作りました。以下の手順でビルドが可能です。

まず。作業ディレクトリ直下に`build`というディレクトリを作成し、その中に移動します[^outOfSource]。この時点で以下のような状態になっているはずです。

```[作業ディレクトリの状態]
advent_ogl/
├── build/ ←いまここにいる
├── CMakeLists.txt
├── glad/
│   ├── CMakeLists.txt
│   ├── include/
│   └── src/
└── main.cpp
```

そこで以下の順にコマンドを実行します。

```shell[ビルドから実行まで]
$ cmake ..
$ make
$ ./advent_gl
```

すると、以下のように真っ黒な画面が表示されるはずです！

![DeepinScreenshot_select-area_20191219024326.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/225893/d8f2bd07-e11b-119c-15bf-1191245b5d36.png)

表示された方、やりました！我々の勝利です！されなかった方、残念です。何かわからないことがあれば聞いてください。僕もわからないかもしれません。

一応、先程入力したコマンドについて説明しておきます。
はじめの`cmake ..`というのは、作業ディレクトリ直下に作成したメインの`CMakeLists.txt`に対するCMakeの処理を走らせているコマンドです。これにより、記述された設定内容に従って`Makefile`などが生成されます。
2つ目のコマンドは生成された`Makefile`に対する処理です。CMakeがビルドのための`Makefile`を生成してくれたので、使うだけです。これを実行すると、同じディレクトリに`advent_gl`という名前の実行バイナリが出来上がるはずです。
3つ目は説明不要ですね。実行しただけです。

# まとめ
さて、周辺知識から長々とやってきましたが、まだウィンドウを表示しただけで、OpenGL的にはHelloWorldにも到達できていません。
次回からはいよいよレンダラの実装をやっていきます。はやくHelloWorldしたいですね。今回の内容でOpenGLのイメージや周辺状況を掴んでいただけていたら嬉しいです。僕も大変勉強になりました。
OpenGL、わくわくしますね。

# 参考文献
この記事の執筆にあたって、以下のページを参考にさせていだきました。

”Khronos OpenGL® Registry” Khronos Group. https://www.khronos.org/registry/OpenGL/index_gl.php
"Rendering Pipeline Overview"
 OpenGL Wiki.  https://www.khronos.org/opengl/wiki/Rendering_Pipeline_Overview
"Fixed Function Pipeline" OpenGL Wiki. https://www.khronos.org/opengl/wiki/Fixed_Function_Pipeline
"OpenGL Context" OpenGL Wiki. https://www.khronos.org/opengl/wiki/OpenGL_Context
"OpenGL" LEARN OpenGL. https://learnopengl.com/Getting-started/OpenGL
”Load OpenGL Functions”　OpenGL Wiki. https://www.khronos.org/opengl/wiki/Load_OpenGL_Functions
"OpenGL Loading Library" OpenGL Wiki. https://www.khronos.org/opengl/wiki/OpenGL_Loading_Library
"Related toolkits and APIs" OpenGL Wiki. https://www.khronos.org/opengl/wiki/Related_toolkits_and_APIs
”The OpenGL Extension Wrangler Library” glew. http://glew.sourceforge.net/
"FreeGlut" wikipedia https://en.wikipedia.org/wiki/FreeGLUT
"GLEW" wikipedia https://en.wikipedia.org/wiki/GLFW
"GLFW: Window Reference" GLFW. https://www.glfw.org/docs/latest/group__window.html
”GLFW: Window guide” GLFW.  https://www.glfw.org/docs/latest/window_guide.html
”GLFW: Keyboard keys” GLFW. https://www.glfw.org/docs/latest/group__keys.html

[^0]: え、なんで今から始めるのにVulkanじゃないのかって？それは、はじめて低レベルグラフィックスAPIを触るには低レベルすぎるからです。OpenGLをある程度理解したら時代に追いつこうと思います。

[^1]: ただし、必ずしもOpenGLのインターフェース部分を各社が実装しているとは限らず、Linux環境であればNVIDIA公式ドライバ以外はMesaというOpenGL実装を経由し、各デバイスの固有バックエンド実装を叩いているようなこともあります。尤も、OpenGLはPC環境以外でも多用るため、そのような場合には殆どGPUメーカーが規格に則ったOpenGL実装を提供している場合がほとんどなようです。また、組込みシステムなどに向けたOpenGLのサブセットであるOpenGL ESというものも存在します。

[^2]: OpenGLでもまだ高レベルすぎる！もっと細かくプログラマがGPUに関する処理を制御できるようにしたい！という需要や、長年のアップデートで蓄積したレガシーな設計の刷新のために、OpenGLの後継となるVulkanというAPIも策定されています。こちらはOpenGLが低レベルながら行なってくれている抽象化処理を更に分割し、ハードウェアを直接操作するような更なる低レベルAPIとなっています。

[^3]: 参照透過性が担保されないことが担保されています。

[^4]: 具体的にはOpenGL 3.0で従来機能が非推奨となり、OpenGL 3.1で完全に従来機能が削除。しかしOpenGL 3.2でコア仕様のAPIに加えて互換APIが追加され、ここで初めてプロファイルと言う概念が誕生したようです。

[^5]: 固定機能パイプラインでも内部的にはOpenGLが用意したシェーダーが利用されていますが、このシェーダーはOpenGLによって固定されています。それと比較した語として、プログラマによって記述可能なGLSLなどのシェーダー言語を用いたシェーダーのことをプログラマブルシェーダーと言います。

[^6]: OpenGLの書籍を購入したり検索したりなどした場合、特に断りがなく固定機能パイプラインを用いたレンダリングの解説がされている場合があります。古い情報であればそれが記述された時代にはそれしかなかったため仕方ないことであり、我々学習者は対象としているプロファイルとバージョンによく気をつけて読み進める必要があります。

[^formatter]:  「綺麗なコードを保持するためにLinterとFormatterを使う」という人は結構いると思いますが、多くのc++のFormatterは、インクルード順序に依存するお行儀の悪いヘッダを前提にしていません(この場合仕方ないですが……)。Formatterにソースを破壊されないように気をつけましょう。

[^glfwInit]: `glfwInit()`を呼ぶ前に呼び出せる関数としては、GLFWのバージョンを取得する関数や、GLFWで発生したエラーをハンドリングするコールバック関数の設定などがあります。

[^windowSize]: 今回これをわざわざ設定したのは、僕が開発環境にタイル型wmを採用しており、これを設定しないと起動時に勝手に変なサイズに変形させられてしうからです。これを設定することでfloatモードでウィンドウが表示されます。これを探すのにちょっと時間かかった。

[^closeInput]: なお、終了処理を記述し忘れるとタスクを外部から殺さなければ絶対に閉じられない無限ループ高負荷ウィンドウが生成されます。

[^outOfSource]: こういった、ビルド用のディレクトリを分けてビルドを行う手順のことを**out-of-sourceビルド**と言ったりします。ビルドの生成物とソースを完全に分離可能であるため大変取り回しが良いです。

