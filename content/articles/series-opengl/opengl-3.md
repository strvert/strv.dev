---
title: OpenGL入門から3DCGレンダラ実装まで その3
description: "OpenGL入門から3DCGレンダラ実装まで"
series: "OpenGL入門から3DCGレンダラ実装まで"
seriesIndex: 3
tags:
  - 'OpenGL'
---

## 補助ライブラリ
ここまでOpenGLについて記述してきましたが、OpenGLがハードウェアやOSと近いものである特性上、ライブラリとしての取り扱いも特殊な箇所があります。直接的にプラットフォーム間の環境の差異を受けるため、OpenGLを用いたプログラミングでは本来プラットフォーム固有の実装を記述する必要があります。
しかし、これはかなり面倒なことですし、情報共有やクロスプラットフォーム性と言った面でも非常に効率が悪くなります。そこで、OpenGLにはいくつかの領域において補助ライブラリが存在します。

これは公式の仕様によるものではありませんが、一般的に広く使われており、公式もこういった補助ライブラリの利用を強く推奨しています。とはいえ、決してOpenGLを簡単な描画ライブラリとしてラップするような性質のものではなく、様々な種類があるOSやGPUを”GPUを使って描画や処理を行う環境”として抽象化してくれるに過ぎないという点には注意が必要です。

### OpenGL Load Library

一般的なC/C++のライブラリであれば、そのライブラリのヘッダをインクルードし、適切にリンカが参照を解決できるように設定すればライブラリの関数を利用することができます。
しかし、OpenGLはそれでは利用できません。これはプラットフォームによってOSやハードウェアの実行可能な命令が異なることに由来しているようで、OpenGLは実行時に利用する関数のポインタを生成し、変数に割り当てることで呼び出し可能オブジェクトの作成を行います。本来、プログラマはこの初期化処理を実装しないとOpenGLの関数を使うことすらできません。更に、このロード処理自体もプラットフォームによって異なる実装が必要となります。

これらは**OpenGL ロードライブラリ(OpenGL Loading Library)**と呼ばれる部類の補助ライブラリを利用することで自動化することが可能で、クロスプラットフォーム対応も容易となります。
以下に、いくつかの主要なOpenGLロードライブラリを紹介します。

#### GLEW（OpenGL Extension Wrangler）
公式ページ: http://glew.sourceforge.net/

Windows, Linux, Mac OS X, FreeBSD, Irix, Solarisなど多くのプラットフォームをサポートするOpenGLロードライブラリです。
インクルードして以下のように初期化関数を呼び出すことで、そのプラットフォームで利用可能なOpenGLの関数を読み込んで利用可能にすることができます。

```cpp[Example]
GLenum err = glewInit();
if (GLEW_OK != err)
{
  /* 初期化に失敗した場合の処理 */
  fprintf(stderr, "Error: %s\n", glewGetErrorString(err));
}
```

#### glad (Multi-Language Vulkan/GL/GLES/EGL/GLX/WGL Loader-Generator)
公式ページ: https://github.com/Dav1dde/glad

多言語対応のロードライブラリ**ジェネレータ**です。ジェネレータというのはどういうことかと言うと、利用したい機能やプロファイル、APIバージョンなどを指定することで、使いたい機能のみを含んだロードライブラリを生成できるバックエンドであるということです。
このバックエンドのインターフェースはコマンドラインやWebサービスなど複数用意されており、利用したい手段を選んでローダーを生成することができます。
以下の画像はgladのWebインターフェースで、各設定を簡単に選択できるようになっていることがわかります。
![DeepinScreenshot_select-area_20191216071639.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/225893/0ac6b6d5-88d0-cf63-83d4-1d07715b90b0.png)

必要なものだけを選んでライブラリを生成することができるため、GLEWと比較してライブラリサイズが小さく軽量です。また、C/C++以外の言語やOpenGL以外のGL系インターフェースへの対応も行なわれているため、そういった利用の場合にも便利です。

今回の実装ではgladを利用します。

### Context/Window Toolkits Library
OpenGLはコンテキストを対象としてGPUを利用した処理を記述することができますが、コンテキスト自体の作成や、出来上がった画像をウィンドウとして画面に表示したりするところはサポートしてくれません。コンテキストの作成やウィンドウ表示/管理、入出力などはOS固有の手法が必要とされるため、この部分でも補助ライブラリを利用することが推奨されています。

#### freeglut
公式ページ: http://freeglut.sourceforge.net/

過去に主流だったGLUTというライブラリの後継で、ウィンドウ管理やキーボード/マウス入力などに対するサポートが含まれています。OpenGLコンテキストの生成にも対応しています。GLUTの後継であるというポリシーから、GLUTのインターフェースをあまり変えないように設計されています。GLUTから遡るとOpenGL自体と同じくらい歴史があり、情報が比較的豊富なようです。

#### GLFW
公式ページ: https://www.glfw.org/

GLUTよりも新しく、GLUTなど他のライブラリでの経験を踏まえて設計されています。Linux, macOS, Microsoft Windows, FreeBSD, NetBSD, OpenBSDに対応し、頻繁にアップデートされています。マウス/キーボードに加えてジョイスティック入力へのサポートなども存在しています。
freeglutと比較してコンテキスト作成により詳細な属性設定が可能であったり、イベントループの扱いの違いによってより低レイテンシな入力処理対応が可能であったりするようです。

今回の実装ではGLFWを利用します。

# 環境構築
さて、説明も終わって早速実装と行きたいところですが、まずは環境を作らなければなりません。以下では、今回使用するものについて簡単に触れます。

## インストールするもの

### OpenGL本体
だいたい入ってるんじゃないかと思いますが、お使いの環境で利用可能な実装をインストールしてください。僕は今回NVIDIAのプロプライエタリドライバに含まれているOpenGL 4.6の実装を利用しています。古いデバイスをお使いの場合4.6が利用できない可能性がありますが、今回の記事では最新の拡張などは利用しないので3.x以上であれば問題ないと思われます。

### 補助ライブラリ系
以下のものを利用します。

- glad
- GLFW
- glm

上で説明した補助ライブラリに加えて、行列演算など数学系の処理を実装したライブラリであるglmも利用します。また、GLFWはご利用のディスプレイサーバに合ったものを選択するよう注意してください。

GLFWとglmについては、僕はArch Linux公式のリポジトリからパッケージマネージャを用いてインストールしました。
gladは各ディストロのリポジトリに存在しない可能性が高いためセットアップを説明します。
まず、[このサイト](https://glad.dav1d.de/)で以下のような設定を行なった上でGENERATEボタンを押すことで必要なものを含んだライブラリを生成することができます。プロファイルはコアプロファイルで固定ですが、OpenGLのバージョンについてはご自身の環境に合ったものを選択してください。僕と同じ環境で大丈夫な場合は、[このパーマリンク](http://glad.dav1d.de/#profile=core&specification=gl&api=gl%3D4.6&api=gles1%3Dnone&api=gles2%3Dnone&api=glsc2%3Dnone&language=c&loader=on)から僕が生成したものと全く同じものにアクセスすることもできます。
![DeepinScreenshot_select-area_20191217222125.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/225893/0c8ac0ee-e109-7f72-53ae-3121e334b339.png)

ファイルが生成されるとページが遷移し表示されるので、zipファイルをクリックしてダウンロードします。ダウンロードが完了したら、今回の開発で利用する作業ディレクトリをお好きなところに作成し、その直下にglad.zipを以下のように展開します。

``` :作業ディレクトリ直下のようす
advent_gl/
└── glad/
    ├── include/
    └── src/
```

以上です。この配置を前提にこの後CMakeのセットアップなどを行います。

### コンパイラ/ビルドツール系
適当に入れます。僕はArch Linux公式のリポジトリからパッケージマネージャを用いてインストールしました。今回の開発ではビルド等はCUIから行います。

- CMake
- make
- gcc

## ビルド環境の作成
今回はCMakeを用いたビルド環境で開発を行います。CMakeについての細かい解説は行いませんので、わからなければ適時調べてください。

### CMakeLists.txtの作成
CMakeを用いたビルドを行うため、CMakeLists.txtを作製します。また、gladはプロジェクトと一緒にソースからビルドを行う必要があるため、サブディレクトリとして専用のCMakeLists.txtを用意します。作業ディレクトリ内の構成は以下のようになります。

```
advent_ogl/
├── CMakeLists.txt
└── glad/
    ├── CMakeLists.txt
    ├── include/
    └── src/
```

追加した2つのCMakeLists.txtの内容は、以下に添付しておきます。このCMakeLists.txtは、作業ディレクトリ直下に配置されたmain.cppファイルを実行ファイルとしてビルドするように記述されています。

まずはメインとなる、プロジェクトビルド用のCMakeLists.txtです。

```cmake:./CMakeLists.txt
cmake_minimum_required(VERSION 3.12)

# プロジェクト名の設定
project(advent_gl)

# 必須ライブラリの存在チェック
find_package(glfw3 REQUIRED)
find_package(glm REQUIRED)

# glad関係
include_directories(glad/include)
add_subdirectory(glad)

# コンパイルオプション
add_compile_options(-O2 -Wall)

# 実行ファイルの指定
add_executable(advent_gl main.cpp)

# 実行ファイルにリンクするライブラリの指定
target_link_libraries(advent_gl glad glfw glm ${CMAKE_DL_LIBS})

# c++17を使う
set_property(TARGET advent_gl PROPERTY CXX_STANDARD 17)
```

続いて、gladをライブラリとして認識させてリンクするためのCMakeLists.txtです。

```cmake:./glad/CMakeLists.txt
cmake_minimum_required(VERSION 3.12)

# gladという名前でCMakeに認識させるライブラリを作成
# 静的ライブラリとしてコンパイル。含まれるソースを指定。
add_library(glad STATIC
    src/glad.c
)
```

以上CMakeによるプロジェクトのセットアップです。大変シンプルですね。
