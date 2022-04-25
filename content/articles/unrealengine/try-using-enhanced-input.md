---
title: 'Enhanced Input の基礎的な解説'
description: 'Enhanced Input Plugin を解説してみる記事'
tags:
  - Unreal Engine
  - Blueprint
assets: '/article-assets/unrealengine/try-using-enhanced-input'
---

# 概要

UE には、Project Setting から可能な Input Mapping 機能があります。しかし、それとは別に、Enhanced Input という入力処理のプラグインがエンジンにビルトインされています。
Enhanced Input は入力アクションの定義やマッピングをアセットベースで行うことが可能なほか、入力によって得られる値を柔軟に変換することができます。

今回は、Enhanced Input を使った入力処理を解説してみようと思います。

# 環境

- Unreal Engine 5.0.1
- Windows 11

# 準備

Enhaned Input を利用するためには、まずプラグインを有効化する必要があります。 有効化して、エディタを再起動しましょう。

![enable plugin](#/enable-plugin.jpg)

また、Enhanced Input で入力を受け取るためには、Project Setting から `Default Player Input Class` と `Default Input Component Class` を変更する必要があります。　以下のように変更しましょう。

![project setting](#/project-setting.jpg)

# 解説

Enhanced Input を有効化すると、以下の 3 つのアセットが作成可能になります。

![asset types](#/asset-types.jpg)

- Input Action
- Input Mapping Context
- Player Bindable Input Config

このうち、Input Action と Input Mapping Context についての説明を行います。

## Input Action

Input Action は、主に以下のようなことが設定できるアセットです。

- Value Type : アクションから取得できる値の型
  - bool
  - Axis1D → float
  - Axis2D → Vector2D
  - Axis3D → Vector
- Triggers : イベントを発火させるデフォルトのトリガ条件
- Modifiers : 取得前に行われるデフォルトの値変換処理

![input action details](#/input-action-details.jpg)

これらが主要な設定項目なのですが、面白いことに、この中で Input Action が必ず設定しなければならないのは、 `Value Type` のみです。Triggers と Modifiers の設定は、後に説明する Input Mapping Context でも設定することができます。

ここで考えておきたいのは、Project Setting などから行う入力マッピングと、Input Action で行えるアクション定義とでは、設定できる対象の**粒度**が異なるということです。
キーボードでの前後左右移動を実装したいとき、従来であれば `Move Forward` / `Move Right`のような軸別のイベントを複数定義して行うのが一般的だったと思います。
しかし、Enhanced Input で移動を実装しようと思ったら、 `IA_Move`という Input Action アセット（名前は例）を一つ作成し、Value Type に 2 次元の入力であることを示す`Axis2D`を設定することで対応します。
アクションが求める入力値のタイプと、そのアクションとを、入力のレベルでそのまま対応させるのです。明快ですね。

また、Input Action では、そのアクションが**実際にどのデバイスのどの入力と紐づくのか**ということを設定しません。ここでは、アクションの宣言(アセットの作成と同義)と、そのアクションから得られる値の型さえ設定すればよいのです。インターフェースのようです。

## Input Mapping Context

Input Mapping Context は、Input Action を使って定義したアクションと、実際のデバイスによる入力とのマッピングを行えるアセットです。
Input Mapping Context によるキーマップは、アセットの単位で実行時に Player Controller に追加したり削除したりすることができます。
シーンによって可能な操作を変更したり、入力に利用するデバイス別に Input Mapping Context を用意して切り替えたり、あとから DLC などで追加のデバイス用マッピングを追加したりなど、非常に柔軟な運用が可能となります。

主な設定項目は以下のようなものです。

- アクション定義として利用する Input Action
- アクションにマップする入力(配列)
  - Triggers: この入力における追加のトリガ条件
  - Modifiers: この入力における追加の値変換処理
  - Player Mappable Options: キーコンフィグの実装に利用できる、このマップ設定を指す名前などの情報

![input mapping context details](#/input-mapping-context-details.jpg)

Input Mapping Context には、複数の Input Action によるアクション定義への入力マッピングを設定できます。
![multiple input action](#/multiple-input-action.jpg)

Input Action 側でも設定できた Triggers や Modifiers ですが、Input Mapping Context に存在するプロパティも効果は全く同じです。異なるのは、その設定の影響範囲です。
Input Action 側で設定した場合には、その Input Action によるアクション定義を使った、すべてのシチュエーションにおいて設定が適用されます。
一方、Input Mapping Context 側で設定する場合には、その Input Mapping Context が有効な状況(Context)で、その特定のキーマッピングを利用した場合にのみ有効となる設定となります。

個人的には、基本は Input Mapping Context の方で設定を行うこととして、様々なシーンや入力デバイスを通しても共通と思われるトリガ条件や、常に行う値変換などがある場合にのみ、Input Action 側での設定を行うのが良いのではないかと思います。

## Trigger と Modifier

改めて、Trigger と Modifier についての説明をしたいと思います。

### Trigger

Trigger は、Input Action で定義したアクション、もしくは Input Mapping Context で定義されたキーマップが、イベントをトリガする条件を設定するものです。配列として複数設定することが可能です。
注意として、Trigger はイベントの発火をフィルタするものであると捉えたほうがよいものです。イベントの発火を生み出すものではありません。
Enhanced Input では、Trigger の登録数が 0 である場合、マッピングされたキーに何らかの入力がある時に、毎 Tick イベントが発火します。
そこに Trigger を設定すると、Trigger の条件を満たすときにのみイベントが発火するようになるのです。

Trigger には様々な種類が用意されており、選択したものによって、表示される設定項目が変わります。
ここに表示される Trigger は、`UInputTrigger`クラスを継承して定義することによって、独自に実装することもできます。

![triggers](#/triggers.jpg)

### Modifier

Modifier は、キー入力から得られた生の値を、対応するアクションの処理に利用できる値に変換するために利用するものです。
Input Action で定義したアクション、もしくは Input Mapping Context で定義されたキーマップに対して設定することができます。

![modifiers](#/modifiers.jpg)

例えば、前後左右の移動を行う場合、最終的な移動処理では、X 軸と Y 軸のそれぞれへの入力の大きさを値として（2 次元値として）利用したくなります。
そんなとき、Input Action では、Value Type に`Axis2D`を設定します。しかし、入力デバイスがキーボードなどである場合、前後左右それぞれに異なるキーをマッピングしなければならず、単純なマッピングでは求める値をアクションから得ることができません。

Value Type が`Axis2D`なアクションに対してキーボードからの入力が発生すると、それがどのキーであったとしても、Enhanced Input は`(1.0, 0.0)`という値を受け取ります。ここで、Modifier を使うと、以下のように各方向への入力に対して、ほしい値を作り出すことができます。

| 押されたキー   | 生の値     | Modifier による変換                                                                                                                  | アクションから取得できる値 |
| -------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 「前に進む」   | (1.0, 0.0) | 行わない                                                                                                                             | (1.0, 0.0)                 |
| 「後ろに進む」 | (1.0, 0.0) | **Negate** Modifier で X 軸の符号反転を行う。                                                                                        | (-1.0, 0.0)                |
| 「右に進む」   | (1.0, 0.0) | **Swizzle Input Axis Values** Modifier で、(X, Y)の値を(Y, X)に並び替える。                                                          | (0.0, 1.0)                 |
| 「左に進む」   | (1.0, 0.0) | **Negate** Modifier で X 軸の符号反転を行う。<br>その後、**Swizzle Input Axis Values** Modifier で、(X, Y)の値を(Y, X)に並び替える。 | (0.0, -1.0)                |

これはすごいですね！　これまでの Project Setting によるマッピングでは、単純なスケールの変換くらいしかできませんでした。しかし、Enhanced Input では、次元を持った値を、様々な Modifier を組み合わせることで自在に変換し、あらゆる入力デバイスに対して対応できる統一的なアクションを定義することができるのです。
この機能を見ると、Input Action と Input Mapping Context の双方で Trigger や Modifier が設定できた理由がよくわかります。
Input Action には共通の設定を行い、Input Mapping Context には様々な入力デバイスやシーンに応じたキーマッピングとトリガ条件、値の変換を記述することができるのです。

Modifier も Trigger 同様、`UInputModifier`クラスを継承することで、独自に実装することができます。

## イベントの受け取り方

これでアクションとキーマッピングの定義法はわかったかと思います。
ここでは、実際にイベントを受け取る方法についての説明を行います。

### 利用する Input Mapping Context の登録

Enhanced Input が発行するイベントを受け取るには、利用している`Player Controller`に、利用したい Input Mapping Context アセットを登録する必要があります。
ここで設定した Input Mapping Context アセットの内容が、その`Player Controller`で利用できるキーマッピング設定となるのです。この登録は、実行時に解除したり新たに登録したりすることができます。
実際には、以下のように、`Player Controller`が保持している `Enhanced Input Local Player Subsystem`を通して設定を行うことができます。

![pc imc register](#/pc-imc-register.jpg)

`Player Controller`が取得できる、Character や Pawn から設定を行うこともできます。

![ch imc register](#/ch-imc-register.jpg)

複数のマッピングを登録したい場合には、配列などに Input Mapping Context を格納して、ループで登録したりなんてこともできます。

### イベントを利用する

これで、イベントを受け取ることができます。
Enhanced Input が有効になっていると、Input Action アセットを作成しただけで、ノード一覧に該当するイベントノードが登録されるようです。
この時点で、Input Mapping Context に設定したキーマッピングで、このイベントを発火させることができるようになります。
定義に利用した Trigger の種類によって、有効な実行ピン(Triggered, Started, Ongoing, ...)が変化します。

![ia event](#/ia-event.jpg)

注意点として、このノードは、そのアクションを利用する Input Mapping Context が登録されていなくても配置できるというものがあります。
配置はできますが、利用している`Player Controller`に、そのアクションのイベントを発火させる Input Mapping Context が登録されていないと、永遠に発火することはありません。
また、このイベントノードは普通のイベントノードとは別物で(どこでもノード一覧に出てくることからもわかりますが)、Enhanced Input プラグイン内部で拡張されたノードです。
配置すると、対応する Input Action をノード内部で**ハード参照**します。
つまり、このノードを配置した`Character`や`Player Controller`も、その Input Action アセットをハード参照することになります。
これを避けたい場合、C++などで Input Action セットのソフト参照からイベントを発火させるツールを書いたり、同様のものをプロジェクト専用の Player Controller クラスに実装したりする必要があると思われます。

# 移動ができる設定の例

簡易的な移動が可能な設定の例を提示します。以下のことを実現します。

- マウスによる視点変更
- 視点方向に基づいた前後左右移動
- 複数種のデバイスによる移動入力
  - キーボード入力のコンテキスト
  - マウス入力のコンテキスト

## IA_Move: 移動アクション定義

`IA_Move`という Input Action アセットを作成し、以下の項目を設定します。

- Value Type: Axis2D(Vector2D)

これだけです。**移動という入力アクションは、2 次元の値を提供するものである**という定義をしただけです。
前後左右への移動ですので、2 次元の値です。

## IA_Look: 視点変更アクション定義

`IA_Look`という Input Action アセットを作成し、以下の項目を設定します。

- Value Type: Axis2D(Vector2D)

なんと`IA_Move`と全く同じです。今回の視点変更は左右上下を見渡すことができればよいので、必要なのはやはり 2 次元の値だからです。

## IMC_Keyboard: キーボードでのキーマッピング時の設定

`IMC_Keyboard`という Input Mapping Context アセットを作成し、以下の項目を設定します。
少し設定項目が多いので、画像で示します。

![imc keyboard](#/imc-keyboard.jpg)

### IA_Move へのマッピング

`W`, `A`, `S`, `D` キーへのマッピングを行っています。
移動なので、押されているときには常にイベントが発火し続けてほしいです。
Enhanced Input は Trigger なしの場合に入力があると毎 Tick イベントが発火するようになるので、Trigger は設定しなくてよいです。

各キーが示す方向にあわせて、入力で得られた生の値に対する Modifier による変換を設定しています。これについては、Modifier について説明した説で示した例が、この内容の説明となっています。そちらをご参照ください。

### IA_Look へのマッピング

マウスの画面上での 2 次元移動へのマッピングを行っています。
移動同様、常にイベントが発火してほしいものなので、Trigger は設定していません。マウスの動きが発生していと入力中という判定になります。

マウスの移動から得られる生の値ははじめから 2 次元値なので、そのまま視点移動に使えそうな気もしますが、実際には画面の座標系の関係で Y 軸の値を反転させてやる必要があります。
そのために、`Nagate` Modifier を一つ追加して、Y 軸の反転を設定しています。

## IMC_Mouse: マウス入力時の設定

こちらは、マウス入力によって移動も行う場合の設定です。

![imc mouse](#/imc-mouse.jpg)

### IA_Move へのマッピング

マウスで左右の移動を行うのは難しいので、**マウスの左ボタンを 0.25 秒以上押し続けると前進を始める**というものにしました。

ボタン入力は 1 次元の値なので、2 次元の値を要求する `IA_Move`の場合、生の値は `(1.0, 0.0)`になります。これはそのままで前進を示す値(X 軸に正の値)なので、特に Modifier は必要ありません。

0.25 秒以上押し続けたら、という条件は、**Hold** Trigger を追加し、`Hold Time Threshold` を設定することで対応しました。

### IA_Look へのマッピング

`IMC_Keyboard`の場合と同様です。

## 移動実装

マッピングの登録と、発火したイベントによる実際の移動や視点変更は、以下のように作成しました。
これは Player Controller に対する実装です。

![pc impl](#/pc-impl.jpg)

BeginPlay のところを見ると、`EInputDevice` の値で、マウスのキーマッピングとキーボードのキーマッピングのどちらを利用するかを簡潔に切り替えることができるようになっていることがわかります。
そして、Input Action に対応した 2 つのイベントには、簡易的な移動と視点変更が実装されています。一つのアクションに対して一つのイベントが定義され、はじめから使いやすい変換済の値が入力されてくることを前提とできるため、こちらも大変簡潔に記述することができています。

今回は見やすさのため、`Input Mapping Context`の指定や、どのマッピングを利用するかの選択などを固定で記述していますが、実際には、これらすべてを実行時に動的に変更することができます。
また、この例のように異なるデバイスのマッピングを利用する場合には、切り替えではなく両方を同時に登録して使うことのほうが多いかとは思いますが、まあわかり易い例として……。

# おわりに

良い機能ですね(しみじみ)。いっぱい使いたいです。

今回は`Player Bindable Input Config`について説明しませんでしたが、これを利用すると簡単にプレイヤーが利用可能なキーコンフィグを作成できます。機会を見て解説したいと思います。
