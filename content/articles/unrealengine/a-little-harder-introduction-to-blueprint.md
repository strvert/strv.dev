---
title: 'すこし厳しい Blueprint 入門'
description: 'Blueprint に本当に入門するために、Blueprint の実行モデルや実装について説明する記事'
enforceCreatedAt: 2022/12/18
enforceUpdatedAt: 2022/12/18
tags:
    - Unreal Engine
    - Unreal C++
    - Blueprint
    - Advent Calendar
assets: '/article-assets/unrealengine/a-little-harder-introduction-to-blueprint'
advent_calendar:
    name: 'Unreal Engine (UE) Advent Calendar 2022'
    link: 'https://qiita.com/advent-calendar/2022/ue'
    day: 18
---

# Introduction

Unreal Engine ユーザーたるもの、Blueprint は日々活用されていることでしょう。そういった皆々様方は、かつてBlueprint に入門されたことかと思いますが、Blueprint
の裏側を覗きに行く機会はあまりないかもしれません。

Unreal Engine に搭載されたスクリプティング言語としての Blueprint が、はたしてどのような形で記述され、誰によって実行され、どうやって C++ と連携しているのか？
そんな裏側について掘り下げ、「Blueprint に入門」してみるのが本記事です。

使えなさそうで、意外と実用できる場面もある知識だったりしますので、興味のある方はぜひ読んでみてください。「そんなこととっくに知ってるぜ」というパワー系の皆さんは、本記事の粗を探してつついてくれると大変助かります。

# 目次


# 前提
## 検証環境

- UE 5.1
- UHT は C# 実装版を利用

## 対象読者

- C++ がある程度読める
- Unreal のリフレクションに関する知識 (FPropertyがわかればよい) がある
- 原理に興味がある

## 記述範囲と注意事項

本記事での範疇は、Blueprint コードの内部表現、Blueprint 実行システムの構造などに焦点を当てます。

Blueprint Graph 画面の描画や、ノードの定義方法などについてはあまり詳しく掘り下げません。

また、本記事はエンジンのソースを読むことで得られた情報に基づいており、用語などは極力ソースに準拠するようにしていますが、説明のための記事上の用語が存在することがあります。Unreal
Engine 以外の一般論については通常の用語を使用しています。

# プログラミング言語としての Blueprint

まず、Blueprint の実行システムについて、大まかな構造を理解しましょう。Blueprint をひとつのプログラミング言語としてみたとき、以下のような特徴を持つと言えるでしょう。

* ドメイン固有言語 (DSL)
* スクリプト言語
* ノードベース・ビジュアルプログラミング言語
* 非ネイティブコンパイル言語
* C++ との相互運用性
* オブジェクト指向言語
* 明示的な型付け
* 型安全ではない、弱い静的型付け

型などについては [Wikipedia](https://ja.wikipedia.org/wiki/%E5%9E%8B%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0)
に説明を任せるとして、この後のために説明しておきたい事項について触れておきます。

## ドメイン固有言語 (DSL)

Blueprint は汎用言語ではなく、特定のタスクに特化した[ドメイン固有言語](https://ja.wikipedia.org/wiki/%E3%83%89%E3%83%A1%E3%82%A4%E3%83%B3%E5%9B%BA%E6%9C%89%E8%A8%80%E8%AA%9E)です。このことは、Blueprint の設計にも大きく影響しています。詳しくは後述しますが、演算のような基本処理から、タスクスケジューリングのような高度な処理まで、Blueprint の実行基盤は全面的に Unreal Engine に依存しています。そのため、スタンドアロンな言語として切り離して利用するのはなかなか難しい作りになっていますが、よく言えば Unreal Engine と深く統合されていると言えます。切り離す必要もないですしね。

ところで、Wikipedia のドメイン固有言語のページを覗くと、Unreal Engine への言及があります。なんとそこで触れられているのは Blueprint ではなく Unreal Script なのですが……。加筆すべきか？

## 非ネイティブコンパイル言語

Blueprint がネイティブコンパイル言語ではないというのは、最終的に Blueprint で記述された処理が実行される際に、機械語となって各プラットフォームの CPU で直接実行されない(
できない)ということです。

これはスクリプト言語では珍しいことではありません。独自の処理系をソフトウェアとして実装し、その処理系に向けたコードを与えれば、CPU
で実行される機械語でなくともソフトウェア上で「実行する」ことは可能です。処理系がコードを解釈して、示される意味のとおりに、実際のCPUやOSを制御するように実装されていれば良いからです。
Blueprint はこのタイプの言語であり、Unreal Engine の上に実装されたソフトウェアの処理系によって解釈・実行されます。こういったコードを解釈・実行するようなソフトウェアのことをVMと呼ぶこともあります。

一方で、Blueprint はコンパイルもされる言語です。このことは上記の内容と矛盾しません。Blueprint はコンパイルされると、 **Blueprint bytecode**
というバイト列形式の中間表現を吐き出します。上記で述べた処理系が直接扱うのは、この bytecode のほうであり、ノードによる表現は直接扱えないのです。なお、詳細は後述しますが、Blueprint
bytecode を実行する処理系を **Blueprint VM** と言います。

このような仕組みを取っているのは、主に実行時コストを落とすためだと思われます。ノードによる表現が作成する、接続関係によるネットワーク表現は人間にとっては直感的ですが、そのまま実行するには向きませんし、扱うデータが大きくなります。そのため、より実行時に処理しやすく軽量な中間表現として
bytecode を事前に生成しておき、実行時には bytecode のみを処理するという形式を取っているのでしょう。

<div class="without-shadow">

![](#/blueprint-pipeline.png)

</div>

なお、他に bytecodeのような中間表現が用いられることのメリットは、中間表現を生成するコンパイラに選択肢を持たせることができることなどがあります。中間表現の仕様さえ満たしていれば、それを生成しているのがどんなコンパイラでも、中間表現を手書きできる謎の人間でも構わないわけです。このあたりの特性を利用している言語の例としては、.NET言語(
C#, F#, ....)や[JVM](https://ja.wikipedia.org/wiki/Java%E4%BB%AE%E6%83%B3%E3%83%9E%E3%82%B7%E3%83%B3)言語(Java, Scala,
Kotlin, ....)の実行系、あるいはコンパイラ基盤であるLLVMのLLVM-IR などに例があります。
Blueprint も、Blueprint VM バイトコードを吐き出す別言語のコンパイラというものを作成するのは不可能ではないはずです。

また、過去には Blueprint のコンパイルバックエンドに、C++のコードを吐き出す実装(ネイティブ化)
が存在しました。[こちらの公式ドキュメント](https://docs.unrealengine.com/5.1/ja/compiler-overview-for-blueprints-visual-scripting-in-unreal-engine/)
を参照すると、5.1現在も `FKismetCppBackend` がデバッグ用に存在していることになっていますが、これは誤りであり、コード上からは完全に削除されているため、現在ではあらゆる Blueprint
は bytecode として実行されます。

## C++との相互運用性

C++との相互運用性は、Blueprint の極めて強力な特徴です。Unreal Engine が独自のスクリプト言語を持っていることの大きなメリットとも言えるでしょう。

通常、複数言語の混在した開発において、言語間のデータの受け渡しや関数の呼び出しは大きな課題であり、そのためのレイヤや相互運用のためのライブラリがプロジェクトに導入されることも珍しくありません。

しかし、Blueprint ははじめから Unreal Engine で使われることを想定して設計され、独自のビルドシステムや C++ 側の実装の存在を前提として実装されているので、ほとんど意識せずに
C++ との相互運用が可能となっています。

<div class="without-shadow">

![](#/interoperability.png)

</div>

このことは Blueprint の言語設計にも影響を与えているはずです。たとえば、Blueprint はかなり強くオブジェクト指向を意識した言語です。C++で定義されたクラスや、作成されたオブジェクトの階層的な構造をそのまま持ち込もうとすると、必然的にそうなるのでしょう。もちろん、ゲーム開発においてオブジェクト指向が大きな実績を持っているということもあるとは思います。

## 型安全ではない、弱い静的型付け

これについてはあまり詳しく触れません。Blueprint は静的型付け言語ですが、型安全性は保証されていません。
たとえば、ピンの型にWildcard(何でも入れられる)などを利用した場合、実行時に型の不一致でエラーが発生することがあります。
一方で、基本的に型を意識して扱うことができ、これもやはりC++との相互運用性を考えたスクリプティング言語としての経緯が見えるところです(そうじゃなくても型ほしいですけど)。

まあただ、Blueprint には UObject という **†最強の基本クラス†** がいるので、なんとも言えませんが。

# Blueprint の歴史的背景と UnrealKismet

Blueprint に関するコードを読んでいくと、`Kismet` という語がよく登場しますので、軽く紹介しておきます。
Blueprint は、Unreal Engine 4から搭載された機能でした。しかし、Unreal Engine におけるノードベースのビジュアルスクリプティング言語の歴史は Unreal Engine 4 からではありません。

Blueprint の系譜は Unreal Engine 3 から始まっています。残念ながら私は実際に触ったことはないのですが(当時10歳)、Unreal Engine 3 にも、 **UnrealKismet** というビジュアルスクリプティング言語が存在しました。
そして、Unreal Engine 4 の機能として公開された Blueprint 実装のコードベースは、この Kismet の多くを引き継いだものなのです。この継承の歴史は Unreal Engine 5 になっても途絶えておらず、エンジン内の Blueprint に関連するコードの髄所に Kismet という語が認められます。また、 `K2Node` の `K2` なども、 `Kismet 2` の略であると思います。


# Blueprint VM 概要

さて、Blueprint の基本的な特徴を把握したところで、Blueprint が実際に実行されている実行系の構造を見ていきます。
Blueprint の実行系とは、前述の Blueprint bytecode を読んで、それが意味するところの処理を実行してくれる実装のことです。このような解釈・実行系のことをVMと呼ぶこともあると言いましたが、Blueprint の該当する実装においてもコード上で **Blueprint VM** と書かれることがあり、端的でわかりやすいので、この用語を採用します。

## 計算モデル

**Blueprint VM** の特徴をつかむために、どのような計算モデルを採用しているのか知ることにはメリットがあります。
この種の VM では[スタックマシン](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%BF%E3%83%83%E3%82%AF%E3%83%9E%E3%82%B7%E3%83%B3)などの計算モデルが採用されることが多いと思いますが、Blueprint がドメイン固有言語であり、C++と協調して動く、ゲームエンジン内の VM であるという特徴が、計算モデルにも影響を与えているように思われます。

というのも、Blueprint VM はスタックマシンともレジスタマシンとも断定し難い、双方の特徴を持った独自の構造をしているように(僕の目には)見えます。
このような構造になっているのには、Blueprint VM はデータがその内部に完結する必要がないという点の影響が大きいのではないかと個人的には思っています。この種の VM を汎用的な実行基盤として構築するのならば、そこで扱う全てのデータはVMが管理するレジスタなりメモリ上なりに収められ、規定のデータ構造や操作による管理で完結していなければなりません。
しかし、Blueprint VM はC++が隣に存在することが前提の仮想機械であり、Blueprint VM が管理しないC++上に確保されているC++変数の値などに大きく依存しています。C++ はすでに完全な機能を備えた言語処理系を持つ言語ですので、Blueprint VM は単体で完全な機能を備える必要がないわけです。すると当然、独立した通常の VM 実装とは異なる点が出てくるということでしょう。

## 命令セット設計

汎用 VM はそれだけであらゆる処理が実行できる(チューリング完全になる)ように構築されるので、(命令セットの設計思想によりますが)四則演算や論理演算などの基本的な命令を含む完結した命令セットを持ちます。これと比較すると、Blueprint VM の設計は非常に特殊です。 

たとえば、Blueprint VM は演算命令を一つも持ちません。「加算がしたければ加算処理を行う C++ 関数を呼び出せばよい」というような設計思想で作られているように思われます。実際、Blueprintにおける `int32` 同士の加算は、以下のように `UFUNCTION()` マクロで作成された C++ 関数で処理されます。

```cpp title=int32同士の加算
/** Addition (A + B) */
UFUNCTION(BlueprintPure, meta=(DisplayName = "int + int", CompactNodeTitle = "+", Keywords = "+ add plus", CommutativeAssociativeBinaryOperator = "true"), Category="Math|Integer")
static int32 Add_IntInt(int32 A, int32 B = 1);

KISMET_MATH_FORCEINLINE int32 UKismetMathLibrary::Add_IntInt(int32 A, int32 B)
{
	return A + B;
}
```

また、いかなるメモリ管理も行いません。メモリ管理は Unreal Engine の GC に依存しています。

代わりに、C++ との連携のための命令は豊富に持っています。たとえば、たった今見たような C++ で実装された関数は、 `EX_CallMath [0x67]` という命令によって呼び出すことができます。この命令は、ネイティブ関数として実装された `UFunction` も呼び出すことができる命令です。`UFunction` からネイティブ関数ポインタを取得し、引数や呼び出しコンテキストなどのデータと、戻り値を格納すべきアドレスをディスパッチした上で呼び出しを実行します。

## Blueprint VM 命令表

ここで、Blueprint VM に搭載されている命令の一覧を提示しておきます。
使われ方がわからないとピンとこないと思いますが、後の内容を読みつつ、必要に応じて参照する形で利用してください。

かなり大きなテーブルになったので、折りたたんであります。

<details>
<summary><b>Blueprint VM 命令セット</b></summary>

(一部編集中。ソースコードのコメントを元に翻訳したり、ソースを呼んで解説を追記する形で作成していますが、間に合わなくて空欄だったりコメント原文のままの箇所があります。)

<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{border-color:black;border-style:none;border-width:1px;font-size:14px;
  overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{border-color:black;border-style:none;border-width:1px;font-size:14px;
  font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top}
</style>
<table class="tg" style="table-layout: fixed;">
<colgroup>
<col style="inline-size: 12em">
<col style="inline-size: 4em">
<col style="">
</colgroup>
<thead>
  <tr>
    <th class="tg-0pky">命令名</th>
    <th class="tg-0pky">バイトコード</th>
    <th class="tg-0pky">説明</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="tg-0pky">EX_LocalVariable</td>
    <td class="tg-0pky">0x00</td>
    <td class="tg-0pky">関数のローカル変数を取得。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_InstanceVariable</td>
    <td class="tg-0pky">0x01</td>
    <td class="tg-0pky">オブジェクト変数を取得。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_DefaultVariable</td>
    <td class="tg-0pky">0x02</td>
    <td class="tg-0pky">コンテキストのオブジェクトのCDOを取得。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Return</td>
    <td class="tg-0pky">0x04</td>
    <td class="tg-0pky">関数から戻る。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Jump</td>
    <td class="tg-0pky">0x06</td>
    <td class="tg-0pky">ローカルアドレスに基づいて指定されたコード上の場所に Jump する。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_JumpIfNot</td>
    <td class="tg-0pky">0x07</td>
    <td class="tg-0pky">式が false だったならば、ローカルアドレスに基づいて Jump する。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Assert</td>
    <td class="tg-0pky">0x09</td>
    <td class="tg-0pky">アサートを発行。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Nothing</td>
    <td class="tg-0pky">0x0B</td>
    <td class="tg-0pky">何もしない</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Let</td>
    <td class="tg-0pky">0x0F</td>
    <td class="tg-0pky">FProperty を利用して、任意サイズの値の代入処理を行う。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ClassContext</td>
    <td class="tg-0pky">0x12</td>
    <td class="tg-0pky">CDO を利用して、指定した UClass の CDO をコンテキストとして処理を実行する。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_MetaCast</td>
    <td class="tg-0pky">0x13</td>
    <td class="tg-0pky">UClass 間のメタキャスト命令。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LetBool</td>
    <td class="tg-0pky">0x14</td>
    <td class="tg-0pky">真偽値の代入命令。Bool 値変数は Bitfield にパックして保持されるため、専用の命令が用意されている。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndParmValue</td>
    <td class="tg-0pky">0x15</td>
    <td class="tg-0pky">関数の任意引数デフォルト値の終了を示すようだが、5.1現在利用されているようには見えない。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndFunctionParms</td>
    <td class="tg-0pky">0x16</td>
    <td class="tg-0pky">関数の呼び出し引数定義の終了。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Self</td>
    <td class="tg-0pky">0x17</td>
    <td class="tg-0pky">Self オブジェクトを取得。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Skip</td>
    <td class="tg-0pky">0x18</td>
    <td class="tg-0pky">スキップ可能な式を表すようだが、5.1現在利用されているようには見えない。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Context</td>
    <td class="tg-0pky">0x19</td>
    <td class="tg-0pky">式を評価して作成した UObject のコンテキストで後続の処理を実行する。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Context_FailSilent</td>
    <td class="tg-0pky">0x1A</td>
    <td class="tg-0pky">EX_Context と同様だが、作成した UObject が無効値だった場合に例外をスローしない。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_VirtualFunction</td>
    <td class="tg-0pky">0x1B</td>
    <td class="tg-0pky">仮想関数を引数付きで呼び出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_FinalFunction</td>
    <td class="tg-0pky">0x1C</td>
    <td class="tg-0pky">完全に実装された通常の関数を引数付きで呼び出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_IntConst</td>
    <td class="tg-0pky">0x1D</td>
    <td class="tg-0pky">int32 を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_FloatConst</td>
    <td class="tg-0pky">0x1E</td>
    <td class="tg-0pky">float を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_StringConst</td>
    <td class="tg-0pky">0x1F</td>
    <td class="tg-0pky">FString を実行スタックから読み出す。読み込む実行スタック上の文字列は、ヌル終端する ANSI char として扱われる。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ObjectConst</td>
    <td class="tg-0pky">0x20</td>
    <td class="tg-0pky">UObject を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_NameConst</td>
    <td class="tg-0pky">0x21</td>
    <td class="tg-0pky">FName を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_RotationConst</td>
    <td class="tg-0pky">0x22</td>
    <td class="tg-0pky">FRotation を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_VectorConst</td>
    <td class="tg-0pky">0x23</td>
    <td class="tg-0pky">FVector を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ByteConst</td>
    <td class="tg-0pky">0x24</td>
    <td class="tg-0pky">実行スタックを 1 byte 読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_IntZero</td>
    <td class="tg-0pky">0x25</td>
    <td class="tg-0pky">int32 の定数 0 を結果に書き込む。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_IntOne</td>
    <td class="tg-0pky">0x26</td>
    <td class="tg-0pky">int32 の定数 1 を結果に書き込む。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_True</td>
    <td class="tg-0pky">0x27</td>
    <td class="tg-0pky">bool の定数 true を結果に書き込む。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_False</td>
    <td class="tg-0pky">0x28</td>
    <td class="tg-0pky">bool の定数 false を結果に書き込む。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_TextConst</td>
    <td class="tg-0pky">0x29</td>
    <td class="tg-0pky">FText を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_NoObject</td>
    <td class="tg-0pky">0x2A</td>
    <td class="tg-0pky">UObject* の定数 nullptr を結果に書き込む。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_TransformConst</td>
    <td class="tg-0pky">0x2B</td>
    <td class="tg-0pky">FTransform を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_IntConstByte</td>
    <td class="tg-0pky">0x2C</td>
    <td class="tg-0pky">実行スタックの 1 byte の値を読み出し、int32 で取得する。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_NoInterface</td>
    <td class="tg-0pky">0x2D</td>
    <td class="tg-0pky">オブジェクトを保持していない TScriptInterface を結果に書き込む。<code>.SetObject(nullptr);</code> を呼び出した状態。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_DynamicCast</td>
    <td class="tg-0pky">0x2E</td>
    <td class="tg-0pky">UObjectの dynamic cast を実行する。スタック上から `UClass` オブジェクトを読み出し、そのクラスに続く命令で評価される `UObject` がキャスト可能か(継承関係のチェック)を行う。キャスト可能であれば、有効な値を返し、キャスト不能であれば無効値を返す。この命令内では UObject 型しか扱っておらず、C++的な dynamic cast は行っていない。UClass の保持するリフレクション情報を元に、キャスト可能かどうかに基づいて、有効ならば評価された UObject を返すが、無効ならば返さないという処理である。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_StructConst</td>
    <td class="tg-0pky">0x2F</td>
    <td class="tg-0pky">UScriptStruct を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndStructConst</td>
    <td class="tg-0pky">0x30</td>
    <td class="tg-0pky"><code>EX_StructConst</code> に対応して利用され、実行スタック上で <code>EX_StructConst</code> のデータの終了を示す。ただし、UScriptStruct から存在すべきプロパティは判明するため、実行時にはこれは利用されておらず、シリアライズなどのエディタ処理で利用されている。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_SetArray</td>
    <td class="tg-0pky">0x31</td>
    <td class="tg-0pky">渡された TArray へのセットを開始する。実行スタックから評価された Array プロパティとオブジェクトアドレス、続いて <code>EX_EndArray</code> が現れるまで要素の値を読み取り順次 Array に追加する。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndArray</td>
    <td class="tg-0pky">0x32</td>
    <td class="tg-0pky"><code>EX_SetArray</code> に対応して利用され、TArray のセットの終了を示す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_PropertyConst</td>
    <td class="tg-0pky">0x33</td>
    <td class="tg-0pky">FProperty を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_UnicodeStringConst</td>
    <td class="tg-0pky">0x34</td>
    <td class="tg-0pky">FString を実行スタックから読み出す。読み込む実行スタック上の文字列は、ヌル終端する UTF-16 バイト列として扱われる。サロゲートペアを考慮して読み込まれる。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Int64Const</td>
    <td class="tg-0pky">0x35</td>
    <td class="tg-0pky">int64 を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_UInt64Const</td>
    <td class="tg-0pky">0x36</td>
    <td class="tg-0pky">uint64 を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_DoubleConst</td>
    <td class="tg-0pky">0x37</td>
    <td class="tg-0pky">double を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Cast</td>
    <td class="tg-0pky">0x38</td>
    <td class="tg-0pky">スタックからキャストコード(キャストする型の組み合わせと方向)を読み取り、そのコードに紐付けられたネイティブ関数を呼び出し、処理を引き継ぐ。呼び出されたネイティブ関数の中では、後続のスタック上のバイトを特定の型と見做して変換処理を実行する。この命令はBlueprint 実行処理の内部でキャストの必要が発生した際に利用されているようで、普段Blueprintを記述するときに直接利用することはない。たとえば、EX_Castには FloatToDouble の処理を行う関数があるが、Blueprint Graph 上で配置する Float to Cast のキャストノードは通常のC++関数であり、関連はない。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_SetSet</td>
    <td class="tg-0pky">0x39</td>
    <td class="tg-0pky">渡された TSet へのセットを開始する。実行スタックから評価された Set プロパティとオブジェクトアドレス、要素数を読み取り、続いて <code>EX_EndSet</code> が現れるまで要素の値を読み取り順次 Set に追加する。要素数が 0 であれば空の Set の作成のみが行われ、値の読み取りなしに実行スタックに <code>EX_EndSet</code> が現れなければならない。ただし、実装的には要素数は 1 以上かそれ未満かしか見ておらず、続く要素数ではなく追加していく Set の初期 Slack サイズを示している。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndSet</td>
    <td class="tg-0pky">0x3A</td>
    <td class="tg-0pky"><code>EX_SetSet</code> に対応して利用され、TSet のセットの終了を示す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_SetMap</td>
    <td class="tg-0pky">0x3B</td>
    <td class="tg-0pky">渡された TMap へのセットを開始する。実行スタックから評価された Map プロパティとオブジェクトアドレス、要素数を読み取り、続いて <code>EX_EndMap</code> が現れるまで要素の値を読み取り順次 Map に追加する。 要素の値は K, V, K, V... の順で実行スタックに積まれている。要素数が 0 であれば空の Map の作成のみが行われ、値の読み取りなしに実行スタックに <code>EX_EndSet</code> が現れなければならない。ただし、実装的には要素数は 1 以上かそれ未満かしか見ておらず、続く要素数ではなく追加していく Map の初期 Slack サイズを示している。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndMap</td>
    <td class="tg-0pky">0x3C</td>
    <td class="tg-0pky"><code>EX_SetMap</code> に対応して利用され、TMap のセットの終了を示す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_SetConst</td>
    <td class="tg-0pky">0x3D</td>
    <td class="tg-0pky">TSet を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndSetConst</td>
    <td class="tg-0pky">0x3E</td>
    <td class="tg-0pky"><code>EX_SetConst</code>と対応して利用され、実行スタック上の値データ列の終了を示す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_MapConst</td>
    <td class="tg-0pky">0x3F</td>
    <td class="tg-0pky">TMap を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndMapConst</td>
    <td class="tg-0pky">0x40</td>
    <td class="tg-0pky"><code>EX_MapConst</code>と対応して利用され、実行スタック上の値データ列の終了を示す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Vector3fConst</td>
    <td class="tg-0pky">0x41</td>
    <td class="tg-0pky">FVector3f を実行スタックから読み出す。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_StructMemberContext</td>
    <td class="tg-0pky">0x42</td>
    <td class="tg-0pky">スタック上の構造体メンバ Property と、続く命令で評価される構造体のオブジェクトを元に、Property が示すメンバのコンテキストを取得・設定する。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LetMulticastDelegate</td>
    <td class="tg-0pky">0x43</td>
    <td class="tg-0pky">Assignment to a multi-cast delegate</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LetDelegate</td>
    <td class="tg-0pky">0x44</td>
    <td class="tg-0pky">Assignment to a delegate</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LocalVirtualFunction</td>
    <td class="tg-0pky">0x45</td>
    <td class="tg-0pky">Special instructions to quickly call a virtual function that we know is going to run only locally</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LocalFinalFunction</td>
    <td class="tg-0pky">0x46</td>
    <td class="tg-0pky">Special instructions to quickly call a final function that we know is going to run only locally</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LocalOutVariable</td>
    <td class="tg-0pky">0x48</td>
    <td class="tg-0pky">local out (pass by reference) function parameter</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_DeprecatedOp4A</td>
    <td class="tg-0pky">0x4A</td>
    <td class="tg-0pky"></td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_InstanceDelegate</td>
    <td class="tg-0pky">0x4B</td>
    <td class="tg-0pky">const reference to a delegate or normal function object</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_PushExecutionFlow</td>
    <td class="tg-0pky">0x4C</td>
    <td class="tg-0pky">push an address on to the execution flow stack for future execution when a EX_PopExecutionFlow is executed. Execution continues on normally and doesn't change to the pushed address.</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_PopExecutionFlow</td>
    <td class="tg-0pky">0x4D</td>
    <td class="tg-0pky">continue execution at the last address previously pushed onto the execution flow stack.</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ComputedJump</td>
    <td class="tg-0pky">0x4E</td>
    <td class="tg-0pky">実行スタックの続く命令を評価して得られたオフセットを元にジャンプを行う。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_PopExecutionFlowIfNot</td>
    <td class="tg-0pky">0x4F</td>
    <td class="tg-0pky">continue execution at the last address previously pushed onto the execution flow stack, if the condition is not true.</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Breakpoint</td>
    <td class="tg-0pky">0x50</td>
    <td class="tg-0pky">Breakpoint 命令。エディタ上のコンパイルでのみ存在し、それ以外では <code>EX_Nothing</code> のように振る舞う。</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_InterfaceContext</td>
    <td class="tg-0pky">0x51</td>
    <td class="tg-0pky">Call a function through a native interface variable</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ObjToInterfaceCast</td>
    <td class="tg-0pky">0x52</td>
    <td class="tg-0pky">Converting an object reference to native interface variable</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndOfScript</td>
    <td class="tg-0pky">0x53</td>
    <td class="tg-0pky">Last byte in script code</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_CrossInterfaceCast</td>
    <td class="tg-0pky">0x54</td>
    <td class="tg-0pky">Converting an interface variable reference to native interface variable</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_InterfaceToObjCast</td>
    <td class="tg-0pky">0x55</td>
    <td class="tg-0pky">Converting an interface variable reference to an object</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_WireTracepoint</td>
    <td class="tg-0pky">0x5A</td>
    <td class="tg-0pky">Trace point. Only observed in the editor, otherwise it behaves like EX_Nothing.</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_SkipOffsetConst</td>
    <td class="tg-0pky">0x5B</td>
    <td class="tg-0pky">A CodeSizeSkipOffset constant</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_AddMulticastDelegate</td>
    <td class="tg-0pky">0x5C</td>
    <td class="tg-0pky">Adds a delegate to a multicast delegate's targets</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ClearMulticastDelegate</td>
    <td class="tg-0pky">0x5D</td>
    <td class="tg-0pky">Clears all delegates in a multicast target</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_Tracepoint</td>
    <td class="tg-0pky">0x5E</td>
    <td class="tg-0pky">Trace point. Only observed in the editor, otherwise it behaves like EX_Nothing.</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LetObj</td>
    <td class="tg-0pky">0x5F</td>
    <td class="tg-0pky">assign to any object ref pointer</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LetWeakObjPtr</td>
    <td class="tg-0pky">0x60</td>
    <td class="tg-0pky">assign to a weak object pointer</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_BindDelegate</td>
    <td class="tg-0pky">0x61</td>
    <td class="tg-0pky">bind object and name to delegate</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_RemoveMulticastDelegate</td>
    <td class="tg-0pky">0x62</td>
    <td class="tg-0pky">Remove a delegate from a multicast delegate's targets</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_CallMulticastDelegate</td>
    <td class="tg-0pky">0x63</td>
    <td class="tg-0pky">Call multicast delegate</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_LetValueOnPersistentFrame</td>
    <td class="tg-0pky">0x64</td>
    <td class="tg-0pky"></td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ArrayConst</td>
    <td class="tg-0pky">0x65</td>
    <td class="tg-0pky"></td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_EndArrayConst</td>
    <td class="tg-0pky">0x66</td>
    <td class="tg-0pky"></td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_SoftObjectConst</td>
    <td class="tg-0pky">0x67</td>
    <td class="tg-0pky"></td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_CallMath</td>
    <td class="tg-0pky">0x68</td>
    <td class="tg-0pky">static pure function from on local call space</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_SwitchValue</td>
    <td class="tg-0pky">0x69</td>
    <td class="tg-0pky"></td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_InstrumentationEvent</td>
    <td class="tg-0pky">0x6A</td>
    <td class="tg-0pky">Instrumentation event</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ArrayGetByRef</td>
    <td class="tg-0pky">0x6B</td>
    <td class="tg-0pky"></td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_ClassSparseDataVariable</td>
    <td class="tg-0pky">0x6C</td>
    <td class="tg-0pky">Sparse data variable</td>
  </tr>
  <tr>
    <td class="tg-0pky">EX_FieldPathConst</td>
    <td class="tg-0pky">0x6D</td>
    <td class="tg-0pky"></td>
  </tr>
</tbody>
</table>

</details>

ざっと見ても、C++ で定義された、かなり高級な型の値を実行スタックから読み出す命令や、同じく高級な型の代入命令などが多数存在します。また、特定の値を示すリテラルのように働き、固定の値を結果として書き込む命令も多いです。

## Blueprint VM ≒ デカい C++ の Wrapper
繰り返し述べたように、Blueprint VM は独立した VM とは言いにくい実装になっています。それ自体が困難ですが、仮に C++ と Unreal Engine から Blueprint VM を引き剥がしてスタンドアロンで動かしたとすると、四則演算も比較もできなくなりますから、まともな処理を動かすことはできないでしょう。
代わりに、C++ や Unreal Engine のシステムと深く結びついているため、Blueprint ではコンテンツ制作はもちろん、エディタに関するスクリプティングなどについても高い自由度を提供できているといえるかもしれません。

# Blueprint VM 詳解
そもそも、Blueprint の処理はどのように呼び出されるのでしょうか。UEngine は C++ のエントリポイントから起動しますから、Blueprint に処理を任せるために C++ と Blueprint を接続している仕組みがあるはずです。

この章では、Blueprint が実行される大きな流れについての説明を行います。

## 連携の本質は関数呼び出し
Unreal Engine 内部で Blueprint の処理が開始される場合、その多くは「Blueprint の関数を呼び出す」という操作に対応しています。
これはあらゆる処理において言えることです。Blueprint の Event についても、コンパイル時には関数に変換されており、C++ から呼び出されるときには直接的には関数として扱われています。

たとえば、Event の代表格である `Tick` や `BeginPlay` などは、コンパイル時に以下のような中間グラフ上の関数(Function stub)に変換されてからコンパイルされます。

<div class="without-shadow">

![](#/event-nodes.png)

![](#/event-stub-tick.png)

![](#/event-stub-beginplay.png)

</div>

また、Blueprint から C++ の処理を呼び出したいときもあります。このときにも、対応するのは C++ の関数を呼び出すという操作です。
ということで、Blueprint と C++ の連携を紐解く切り口として、相互に関数が呼び出される仕組みを見ていきましょう。

## UFunction
Unreal Engine においての Blueprint / C++ の相互関数呼び出しには、 UFunction というクラスが大きな役割を果たしています。
UFunctionを一言で説明すると、「Blueprint か C++ の関数を表す関数オブジェクト」です。

C++ の関数オブジェクトといえば、Unreal C++ なら `TFunction<>`、STL なら `<function>` の `std::function<>` などが思い浮かぶでしょう。これらは、C++ の関数様のオブジェクトを取り回すのに特化したクラスです。一方、`UFunction` は、Blueprint と C++ の双方で呼び出し可能な関数を表すクラスなのです。

### UFunction の内側

とはいえ、C++ の関数と Blueprint の関数はコンパイル後の内部表現が全く異なりますから、完全に共通化したデータを保持しているわけではありません。以下は、`UFunction` のなかで関数呼び出しに関わるメンバを示した図です。

<div class="without-shadow">

![](#/ufunction-structure.png)

</div>

`UFunction` は `UStruct` を継承した型であり、`UStruct` のほうにも重要な情報が保持されています。 
これらのパラメータのうち、C++ の関数と Blueprint の関数で使われ方が大きく異なるのは、 `Func` と `Script` です。

- Func
  - C++ の関数である時にのみ有効で、それ以外の場合には nullptr。
  - C++ の関数ポインタを保持する。
- Script
  - バイト列を保持する `TArray<uint8>` メンバ。
  - Blueprint の関数であるときにのみ長さが1以上となり、Blueprint バイトコードを保持する。

`UFunction` の呼び出し処理では、その `UFunction` が C++ 関数を表しているのか Blueprint 関数を表しているのかによって処理を分岐し、結果として共通した使用法で双方の関数を呼び出せるようにしているのです。

上図に示したそれ以外のメンバの役割は以下です。こちらは Blueprint / C++ 共通で利用されます。

- FunctionFlags
  - [EFunctionFlags](https://docs.unrealengine.com/5.1/en-US/API/Runtime/CoreUObject/UObject/EFunctionFlags/)で定義されたフラグをビットフィールドとして保持する。C++ 関数であるかを表す `FUNC_Native` なども定義されており、関数の属性を判別するのに多用される。
- NumParams
  - 関数の引数や戻り値などは、関数のパラメータとして扱われる。それらの総数を表す。
- ParamsSize
  - 関数のパラメータが総計で占めることになるメモリ上のサイズを表す。関数呼び出しの際に、パラメータのために確保すべき領域を知るためなどに利用される。
- ChildProperties
  - FProperty のリンクリスト。`UFunction` の場合は、関数のパラメータのリフレクション情報を保持する。これにより、引数の具体的な型や、オブジェクト上での配置位置オフセットなどが判明し、パラメータの利用が可能となる。

このように、`UFunction` は Blueprint / C++ の関数のシグニチャのための共通した表現を持ち、その処理の実体のみを個別に扱うことで、Blueprint / C++ どちらからも呼び出し可能な関数を実現しているクラスなのです。

### UFUNCTION() マクロの役割 Thunk / CustomThunk
`UFunction` と聞いて、いつも Unreal C++ で書いている `UFUNCTION` マクロを付けたメンバ変数のことを連想したのに、なにか違うものの説明をされて戸惑っている人がいるかもしれません。

公式ドキュメント含め厳密に言うと、`UFUNCTION` マクロを付けた関数自体が `UFunction` になるわけではありません。中身が書き換わるわけでもありませんし、実装はそのまま利用されます。しかし、 `UFUNCTION` マクロを付けた関数には、その関数を `UFunction` の `Func` メンバとして取り扱い可能にする(シグニチャをあわせて引数のディスパッチを行う)ためのラッパー関数が外部に生成されます。この生成は Unreal Header Tool によってビルド前に行われます。

ラッパー関数を生成する目的は、呼び出しのシグニチャを統一することです。`UFUNCTION` マクロは様々な引数や戻り値を持った関数に付けられますが、 `UFunction` の `Func` メンバが保持できるシグニチャは一定です。そこで、`Func` が保持できるシグニチャを持ったラッパー関数で包み、内部で引数の値や戻り値の処理を個別に行うことで、どんな関数でも `Func` で保持できるように差異を吸収するのです。

このラッパー関数によって、`UFUNCTION` マクロを付けた任意の C++ 関数を `UFunction` で保持することができるようになります。すると、C++ で実装した関数が Blueprint / C++ で扱えるようになるという仕組みなのです。


<div class="without-shadow">

![](#/what-ufunction.png)

</div>

ちなみに、このラッパー関数のことを、Unreal Engine では Thunk function (サンク関数) と呼んでいるようです。この名前に「オッ」となった人はいるでしょうか。そうです。出会って戸惑うUFUNCTION() 指定子ランキングトップの `UFUNCTION(CustomThunk)` とは、このサンク関数をUHTに自動生成させることを抑制し、自分自身でカスタムのサンク関数を記述するための指定子なのです。
CustomThunkの使い方については、別の記事を書こうと思っています。

## UFunctionの呼び出しと大きな流れ
`UFunction` はローカルだけでなくリモート(サーバーなど)で実行されることもあるので、エンジン内でも様々な方法の実行処理が記述されています。ここでは、ローカル関数に特化した呼び出しの流れを見てみます。簡単のため、一部コードは省いて、コメントを追記しました。

```cpp title=ScriptCore.cpp
#define RESULT_PARAM Z_Param__Result
#define RESULT_DECL void* const RESULT_PARAM

void ProcessLocalFunction(UObject* Context, UFunction* Fn, FFrame& Stack, RESULT_DECL)
{
  // UFunction の有効性をチェック
	checkSlow(Fn);
  // C++関数か？
	if(Fn->HasAnyFunctionFlags(FUNC_Native))
	{
    // C++の関数を直接呼び出し
		Fn->Invoke(Context, Stack, RESULT_PARAM);
	}
	else
	{
    // UFunction が持つ Script メンバに保持された Blueprint バイトコードを実行
		ProcessScriptFunction(Context, Fn, Stack, RESULT_PARAM, ProcessLocalScriptFunction);
	}
}
```

### C++ 関数に対する処理 
`UFunction` には `Invoke()` という、`Func` に保持する C++ 関数を呼び出すための専用メンバが存在します。C++ 関数に対する呼び出しは、このメンバを呼び出すだけで対応されています。

「この呼び出し方では様々な引数の関数に対応できないのでは？」と思うかもしれませんが、問題ありません。 [UFunction の説明の項](#ufunction-マクロの役割-thunk--customthunk) で述べた通り、C++ のネイティブ関数を `UFunction` で利用する場合、必ずシグニチャが統一されたラッパーである Thunk 関数が存在します。
最終的に関数に渡される引数の値や、その関数が紐づくオブジェクトは、すべてここで渡されている `Context` や `Stack` から Thunk 関数が取り出し、最終的な引数として決定します。
また、関数の戻り値は `RESULT_DECL` に格納されます。コード上部に定義を引用しましたが、`RESULT_DECL` は `void* const` を表すので、任意の戻り値のアドレスを受けることができます。

例として、Blueprint における Int 同士の加算を定義している以下の関数を保持する `UFunction` を `Invoke()` した場合を見てみます。

```cpp title=Add_IntInt()
static int32 Add_IntInt(int32 A, int32 B = 1);
```

UHT によって以下の Thunk 関数が自動生成され、`UFunction` の `Func` に保持されているので、`Invoke()` で実行されるのもこの Thunk 関数です。

```cpp title=Thunk関数
// static int32 Add_IntInt(int32 A, int32 B) の Thunk 関数
void UKismetMathLibrary::execAdd_IntInt(UObject* Context, FFrame& Stack, void* const Z_Param__Result)
{
	FIntProperty::TCppType Z_Param_A = FIntProperty::GetDefaultPropertyValue();
	// 第1引数を Stack.Code のバイトコードを評価して取得する。Codeが進む。
	Stack.StepCompiledIn<FIntProperty>(&Z_Param_A);;

	FIntProperty::TCppType Z_Param_B = FIntProperty::GetDefaultPropertyValue();
	// 第2引数を Stack.Code のバイトコードを評価して取得する。Codeが進む。
	Stack.StepCompiledIn<FIntProperty>(&Z_Param_B);;

	// 次の Stack.Code が nullptr でなければ、1つ Code を進める。
	Stack.Code += !!Stack.Code;;

	// 引数を C++関数にディスパッチ。値を結果格納用の引数に書き込んで終了。
	*(int32*)Z_Param__Result = UKismetMathLibrary::Add_IntInt(Z_Param_A, Z_Param_B);
}
```

`Stack` から C++ 関数に渡すべき引数の値などを読み出し、全ての準備が整ってから実際の C++関数の呼び出しを行っていることがわかります。

### Blueprint 関数に対する処理
Blueprint 関数は、ネイティブ実行可能なコードではなく Blueprint VM のバイトコードなので、単純に呼び出すことはできず、逐次バイトコードを処理していく必要があります。

上のコードで利用されている `ProcessScriptFunction()` のシグニチャは以下です。

```cpp
template<typename Exec>
void ProcessScriptFunction(UObject* Context, UFunction* Function, FFrame& Stack, RESULT_DECL, Exec ExecFtor)
```

`ProcessScriptFunction()` は、Blueprint 関数の呼び出しの前処理と、呼び出しまでを行ってくれるヘルパー関数です。
Blueprint 関数の引数や戻り値パラメータを保持するメモリ領域は、C++ の関数と異なり自動で確保されないので、呼び出す前に明示的に確保を行う必要があります。また、関数呼び出しに際しては、確保したメモリ領域や、関数の処理の実行状況、実行しているバイトコードへの命令カウンタなどをまとめて管理するスタックフレーム(のようなもの)を新たに構築する必要があります。

`ProcessScriptFunction()` が行う前処理の中では、渡された `UFunction` のプロパティ情報などを元に、必要なメモリの確保や初期化を行い、スタックフレーム(のようなもの)の構築までを行ってくれます。これは、 `FFrame` 型の変数として引き継がれていきます。`FFrame` については後ほど詳しく触れます。

第5引数の型がテンプレート型引数によって指定されており、ここに渡した関数が最後のバイトコード実行の処理として利用されます。
また、第5引数(最後の引数)に渡されているのは以下の関数です。簡単のため、例外処理は削除しています。

```cpp
void ProcessLocalScriptFunction(UObject* Context, FFrame& Stack, RESULT_DECL)
{
	UFunction* Function = (UFunction*)Stack.Node;
	// No POD struct can ever be stored in this buffer. 
	MS_ALIGN(16) uint8 Buffer[MAX_SIMPLE_RETURN_VALUE_SIZE] GCC_ALIGN(16);

	// バイトコードの実行。EX_Return 命令が現れるまで実行し続ける。
	while (*Stack.Code != EX_Return)
	{
    // 後続のバイトコードを一つ読み取り、その命令を実行する。内部では処理に依存した数だけ Stack.Code が進む。
		Stack.Step(Stack.Object, Buffer);
	}

  // 処理が終わったので一つコードを進め(EX_Return命令をステップオーバー)、終了処理に入る
  Stack.Code++;

  if (*Stack.Code != EX_Nothing)
  {
    // 次の命令が EX_Nothing でなければ、後続の命令を評価し、RESULT_PARAM に関数の結果を格納する
    Stack.Step(Stack.Object, RESULT_PARAM);
  }
  else
  {
    // EX_Nothing なら、命令カウンタを一つ進めて(EX_Nothingをステップオーバー)終了
    Stack.Code++;
  }
}
```

`ProcessLocalScriptFunction()` はローカルでバイトコードを実行する関数です。
この関数には、`ProcessScriptFunction()` が整えてくれた `FFrame& Stack` が渡されてきます。`Stack.Code` は `UFunction` の保持するバイトコード上の位置を示すポインタで、いわゆるプログラムカウンタの役割を果たします(後述)。処理をみると、`Stack.Code` を進めることで命令の処理位置が進んでいき、`EX_Return` まで実行され続けることがわかります。

## FFrame
さて、`UFunction` の実行にも登場しましたが、Blueprint VM の実行処理をより詳しく見ていくためには、`FFrame` のことを知る必要があります。

`FFrame` は、C / C++ など言語にも存在するスタックフレームに近い役割を果たすクラスです。スタックフレームとは、関数呼び出しのためにスタック領域に構築される、ローカル変数、リターンアドレス(呼び出し元のアドレス)、引数などの情報を持ったデータ構造です。関数が呼び出されると、その関数の命令を実行するための作業領域がメモリ上に必要ですし、自分がどこから呼ばれたのかがわからなければ関数からの return ができないので、それらの情報を扱うためのデータ構造を関数の呼び出し時に構築しているのです。

`FFrame` はスタックフレーム同様、関数呼び出しのたびに構築され、関数が終了すると破棄されるので、呼び出しがネストすると多段的に存在することもありますが、特定の関数呼び出しに対応する `FFrame` は一つであると考えてよいです。

`FFrame` はスタック領域に確保されるわけではありませんし、データ構造としてもスタックではありません。プログラムカウンタの役割を持つ変数や、直近の命令の結果を保持する変数などもメンバに持つので、それらはレジスタ的であるとも言えます。
下図は、`FFrame` の主要なメンバ変数を示したものです。典型的なスタックフレームにありそうなものを青、レジスタ的な働きをしているものを橙に塗り分けたので、参考程度に御覧ください。

<div class="without-shadow">

![](#/fframe-structure.png)

</div>

### 典型的なスタックフレームっぽいやつ
- UFunction* Node
  - 現在の `FFrame` に対応する `UFunction` のポインタを保持する。
- UObject* Object
  - 現在の `FFrame` に対応するコンテキストオブジェクト。多くの場合、関数が属する `UObject` のインスタンスと考えてもよい。ローカル変数へのアクセスなどに利用される。一部の命令の実行において、暗黙的に `this` と同等の役割として扱われる。
- uint8* Locals
  - 現在の `FFrame` に対応する `UFunction` のローカル変数を保持しているメモリ領域の先頭アドレス。複数のローカル変数が連続して配置されることがあるが、別途得られたローカル変数の `FProperty` の情報を元に先頭アドレスからのオフセットを計算し、任意のローカル変数にアクセスできるようになっている。
- FOutParamRec* OutParams
  - ミュータブルな参照渡しなどによって、戻り値以外の出力パラメータと認識される引数がある場合、その引数は `CPF_OutParm` というフラグを持つようになる。`OutParams` は、`FOutParmRec` のメンバとして、最初の追加出力引数の `FProperty` へのポインタ、その `FProperty` へのデータの保存先アドレス、および次の追加出力パラメータを保持する。リンクリストになっているので、一つずつ辿っていくことで、すべての追加出力パラメータにアクセスできる。
  - 戻り値を格納すべき領域は OutParams のように `FFrame` のメンバとしてではなく、`RESULT_DECL` のように、命令を処理する関数の引数として既定のものが渡されてくる。 

### レジスタっぽいやつ
- uint8* Code
  - いわゆるプログラムカウンタのような変数。実行中のバイトコードの実体は `UFunction` のメモリ領域などに配置されているが、 `Code` はそのバイトコード上の特定の位置をポイントすることで、現在実行中の命令位置を保持する。この変数の指す位置をインクリメントすることで、バイトコードの実行が進む。
- FProperty* MostRecentProperty
  - 直近の命令でアクセスされた `FProperty` のアドレスを保持する。これにより、Blueprint VM は、続く命令で前の命令で得られたプロパティに対するアクセスが可能になる。
- uint8* MostRecentPropertyAddress
  - `MostRecentProperty` のデータの実体が配置されたメモリ領域の先頭アドレス。 `FProperty` は型のリフレクション情報であり、値そのものは持たないので、`FProperty` の情報やメソッドを利用してこのメモリ領域から値を読み出すことで、実値へのアクセスが可能となる。
- uint8* MostRecentPropertyContainer
  - `MostRecentPropertyContainer` は、直近の命令でアクセスされた `FProperty` コンテナのメモリ領域の先頭アドレスを保持する。処理のステップによっては、「あるメンバプロパティのアドレス位置はまだわからないが、そのプロパティを持っているオブジェクトのアドレスはわかる」といったシチュエーションがよくある。プロパティを保持するオブジェクトのことを Property Container と呼んでおり、追加で Property Container のアドレスにオフセットをかけることでメンバのアドレスに到達できる。`FProperty` が保持するリフレクション情報には、オブジェクト内での自身のメモリ配置のオフセット情報が含まれているが、それは相対的な値であるため、オフセットをかける対象となる絶対アドレスとして `MostRecentPropertyContainer` が必要となる。 

## FFrame による Blueprint VM 命令のステップ実行
Blueprint VM のバイトコード実行の実体は、`FFrame` による `Code` ポインタのインクリメントです。 バイトコードには命令のほか、オブジェクトのバイト表現が埋め込まれたり、値リテラルを表すバイトが埋め込まれたりします。それらを処理次第、バイト数分だけ `Code` を進めるのです。

処理の実行に最も多用される `FFrame` のメンバ関数は、以下の `FFrame::Step()`です。

```cpp

void FFrame::Step(UObject* Context, RESULT_DECL)
{
	int32 B = *Code++;
	(GNatives[B])(Context,*this,RESULT_PARAM);
}
```

このメンバは、一つ先のバイトコードを読み出し、そのバイト値を関数ポインタの配列 `GNatives[]` のインデックスとすることで、命令コードによる命令関数の呼び出しを実現している関数です。先に命令表で示した命令コードが、ここでの変数 `B` に数値として読み出されるということです。

`GNatives[]` は以下のように定義されます。

```cpp
COREUOBJECT_API FNativeFuncPtr GNatives[EX_Max];
```

この配列に対して、命令処理を実装した関数が、各々追加されています。以下は単純な `EX_Jump` 命令の実装です。

```cpp title=EX_Jump
void UObject::execJump( UObject* Context, FFrame& Stack, RESULT_DECL )
{
  // 現在の Stack.Code 位置から、CodeSkipSizeType のサイズのメモリを読み出し、CodeSkipSizeType として解釈して返す。
  // sizeof(CodeSkipSizeType) だけ Stack.Code が進む。 
	CodeSkipSizeType Offset = Stack.ReadCodeSkipCount();
  // 現在の Stack.Code を、`UFunction` の保持するバイトコードへの特定オフセット位置に置き換える
	Stack.Code = &Stack.Node->Script[Offset];
}
IMPLEMENT_VM_FUNCTION( EX_Jump, execJump ); // GNatives に EX_Jump の値(列挙型であり命令コードを示す)で登録
```

なお、 `CodeSkipSizeType` とはバイトコード上のオフセットを表すのに十分なサイズの数値型で、多くのプラットフォームでは `uint32` です。
この処理によって、バイトコード上に示されたジャンプ位置に現在の `Stack.Code` を書き換え、後続する命令の内容を変更することができます。
`CodeSkipSizeType` が `uint32` であると仮定したときのバイトコードを図示するなら、以下のようになるでしょう。

<div class="without-shadow">

![](#/ex-jump.png)

</div>

また、もう少し複雑な例として、条件付きジャンプ `EX_JumpIfNot` も見てみましょう。

```cpp title=EX_JumpIfNot
void UObject::execJumpIfNot( UObject* Context, FFrame& Stack, RESULT_DECL )
{
	CHECK_RUNAWAY;

  // 希望されるジャンプ先のオフセット位置をバイトコードから読み出す
	CodeSkipSizeType Offset = Stack.ReadCodeSkipCount();

	// 続く命令を Step で評価する。その結果を第二引数の `Value` に受け取る。
	bool Value = 0;
	Stack.Step( Stack.Object, &Value );

  // `Value` の値によってジャンプするか否かを分岐
	if( !Value )
	{
		Stack.Code = &Stack.Node->Script[ Offset ];
	}
}
IMPLEMENT_VM_FUNCTION( EX_JumpIfNot, execJumpIfNot );
```

`EX_JumpIfNot` では、`FFrame::Step()` で実行された `execJumpIfNot()` の中で、更に `FFrame::Step()` を呼び出しています。
このパターンは多くの命令の実装で見られるもので、バイトコードの表現の自由度を向上させています。 `EX_JumpIfNot` は、`Value` を評価式に持つ単純な分岐命令などに利用できるものです。しかし、`Value` の値の決定を命令処理内部で更に `FFrame::Step()` することで、ジャンプするか否かの決定を、後続の任意のバイトコードの実行結果によって決定できるようになっているのです。
`Value` の値を決定するのはもしかすると単にバイトコード上に埋め込まれた定数かもしれませんし、複雑な処理の結果かもしれません。

<div class="without-shadow">

![](#/ex-jump-if-not.png)

</div>

続いて、`MostRecentProperty` などを利用する命令の例として、ローカル変数へのアクセス命令 `EX_LocalVariable` も見ておきます。
(例のごとく例外処理は省いています)

```cpp title=EX_LocalVariable
void UObject::execLocalVariable( UObject* Context, FFrame& Stack, RESULT_DECL )
{
  // バイトコードから、読み出したいプロパティを表す `FProperty` を読み出す。その分 Code は進む。
	FProperty* VarProperty = Stack.ReadProperty();
  // `Stack.Locals` が指すローカル変数メモリ領域に対して、`FProperty` のメモリ配置情報を適用し、読み出したいプロパティデータのアドレスを決定する。そのアドレスを `MostRecentProeprtyAddress` に入れておく。
  Stack.MostRecentPropertyAddress = VarProperty->ContainerPtrToValuePtr<uint8>(Stack.Locals);
  // ↑ で `MostRecentProeprtyAddress` を更新したので、そのプロパティのコンテナである `Stack.Locals` のアドレスに `MostRecentPropertyContainer` も更新しておく
  Stack.MostRecentPropertyContainer = Stack.Locals;

  if (RESULT_PARAM)
  {
    // プロパティに Getter が定義されているか
    if (VarProperty->HasGetter())
    {
      // されていたら Getter で読み出し、RESULT_PARAM に受け取る
      VarProperty->GetValue_InContainer(Stack.MostRecentPropertyContainer, RESULT_PARAM);
    }
    else
    {
      // されていなかったら、プロパティデータのアドレスからデータを RESULT_PARAM にコピーして値を読み出す
      VarProperty->CopyCompleteValueToScriptVM(RESULT_PARAM, Stack.MostRecentPropertyAddress);
    }
  }
}
IMPLEMENT_VM_FUNCTION( EX_LocalVariable, execLocalVariable );
```

このように、プロパティに直接アクセスする命令の中では、アクセスしたプロパティの履歴を `FFrame` の Recent~ 系のメンバに記録してくれるのです。これにより、`FFrame` を共用する後続の命令もそのプロパティにアクセス可能になるので、プロパティアクセスに頻繁に利用されます。

これらの命令が読めれば、大抵の命令の処理は読むことができます。 `ScriptCore.cpp` に実装がありますので、気になる命令は見てみるとよいでしょう。

## Blueprint VM 命令の定義
[Blueprint VM 命令表](#blueprint-vm-%E5%91%BD%E4%BB%A4%E8%A1%A8) で、定義されている命令とその役割は記載しましたが、実際にはどこにどうやって定義されているのかについてはまだ触れていませんでした。

これは、 `Runtime/CoreUObject/Public/UObject/Script.h` をみるとすぐにわかります。公式ドキュメントにも記載のある、 [`EExprToken`](https://docs.unrealengine.com/5.1/en-US/API/Runtime/CoreUObject/UObject/EExprToken/) が、Blueprint VM の命令のコードを決定しています。
ここで定義した列挙型の値を、一つ前の項でも見た命令の実装と紐づけて、 `GNatives[]` に入れておくことで、命令の呼び出しを実現しているようです。

<!--

# Blueprint Compiler

- void FBlueprintEditor::Compile()
- void FKismetEditorUtilities::CompileBlueprint(UBlueprint* BlueprintObj, EBlueprintCompileOptions CompileFlags, FCompilerResultsLog* pResults)
- void FBlueprintCompilationManager::CompileSynchronously(const FBPCompileRequest& Request)
- void FBlueprintCompilationManagerImpl::CompileSynchronouslyImpl(const FBPCompileRequestInternal& Request)
- void FBlueprintCompilationManagerImpl::FlushCompilationQueueImpl(bool bSuppressBroadcastCompiled, TArray<UBlueprint*>* BlueprintsCompiled, TArray<UBlueprint*>* BlueprintsCompiledOrSkeletonCompiled, FUObjectSerializeContext* InLoadContext)
- void FKismetCompilerContext::CompileFunctions(EInternalCompilerFlags InternalFlags)
- FKismetCompilerContext
- FNodeHandlingFunctor
- EKismetCompiledStatementType
- enum EExprToken : uint8
- void ProcessLocalScriptFunction(UObject* Context, FFrame& Stack, RESULT_DECL)

-->

## Blueprint バイトコードの逆アセンブル
ここまで、実装ベースで Blueprint VM の背後を見てきました。しかし、バイトコードの役割がわかるようになったからには、実際に実行されているバイトコードを確認してみたくなるでしょう。

Unreal Engine には、コンパイルして生成されたバイトコードを人間が読みやすい形で逆アセンブルして出力する `FKismetBytecodeDisassembler` というクラスが定義されています。これは Blueprint コンパイラの中でも利用できるようになっていて、Engine.ini に以下を加えることで有効化できます。

```
[Kismet]
CompileDisplaysBinaryBackend=True
```

これが有効化されていると、Blueprint のコンパイル時に、生成されたバイトコードを逆アセンブルしたテキストがログ出力されるようになります。
たとえば、以下のグラフをコンパイルすると……

![](#/sample-nodes.png)

これが出てきます。

```ini
LogK2Compiler: [function ReceiveBeginPlay]:
Label_0x0:
     $46: Local Final Script Function (stack node L_GameEntry_C::ExecuteUbergraph_L_GameEntry)
       $1D: literal int32 87
       $16: EX_EndFunctionParms
Label_0xF:
     $4: Return expression
       $B: EX_Nothing
Label_0x11:
     $53: EX_EndOfScript
LogK2Compiler: [function NewFunction]:
Label_0x0:
     $68: Call Math (stack node KismetSystemLibrary::PrintString)
       $17: EX_Self
       $1F: literal ansi string "Hello"
       $27: EX_True
       $27: EX_True
       $2F: literal struct LinearColor (serialized size: 16)
         $1E: literal float 0.000000
         $1E: literal float 0.660000
         $1E: literal float 1.000000
         $1E: literal float 1.000000
         $30: EX_EndStructConst
       $1E: literal float 2.000000
       $21: literal name None
       $16: EX_EndFunctionParms
Label_0x48:
     $4: Return expression
       $B: EX_Nothing
Label_0x4A:
     $53: EX_EndOfScript
```

`$xx` のように表示されているのが Blueprint VM の命令コードであり、それに合わせて命令の名前などを併記してくれています。
また、インデントを変えることでその内部で実行されている命令を表現してくれています。リテラル値を表す命令などではその値も示してくれているので、大変読みやすいです。

ただ、実際に Config に上記の設定を加えてみると、`Trace~` などのよくわからない命令が大量に入ると思います。これは Blueprint デバッガのための命令がノード単位で挿入されるからです。これを回避するには、エンジンのソースコードをいじるか、デバッガでデバッグ命令を挿入するかのフラグを上書きする必要があります。僕は面倒なので後者の手法で、`FKismetFunctionContext::bCreateDebugData` の値を `false` に上書きすることで綺麗な出力を得ています。

# この知識、何に使えるの？
普段意識する必要は全く無いでしょう。しかし、記事中でも少し触れた `CustomThunk` などの Thunk 関数を自作するようなコードは非常に強力です。というのも、本来は Blueprint VM 側に処理が隠されてしまい、結果の引数しか受け取れないはずの C++ 実装で、実行中の Blueprint VM の `FFrame` に直接操作を加えることができるのです。このため、ある種のメタプログラミングのようなことが可能になります。
代表格は `Wildcard` ピンなどです。たまに見かける、繋いではじめて型が確定する灰色のピンがあると思いますが、あれが `Wildcard` ピンで、そういった特殊な機能を気軽に利用できるようになります。

また、最適化などの面でもかなり役立つと思います。Blueprint VM を見ていると、案外まだ最適化の余地がありそうな実装がちらほら見受けられます。エンジンに手を加えずとも、Blueprint VM に様々な命令を実行させることはプロジェクトからも可能ですから、「さいきょうの最適化ノード」を構築することもできるでしょう。

今回の記事では間に合いませんでしたが、バイトコードを生成しているコンパイラに対して手を加えることもできます。Blueprint Compiler には CompilerExtension というコンパイラ拡張用のAPIが存在しており、コンパイラ側から実行したいバイトコードを変更することができます。K2_Node を深いレベルから実装する場合、`FNodeHandlingFunctor::Compile()` という、ノードの動作を Blueprint Compiler が処理できるステートメントに記述し直す処理を実装する必要があります。この場合にも Blueprint VM の知識は大いに役立つでしょう。

# まとめ
Blueprint VM は、Unreal Engine でのコンテンツ制作に特化したドメイン固有言語であるということが、実装からもよくわかりました。
高速化のためにバイトコードに変換されていますが、C++ との連携機能は柔軟かつ強力であり、我々が遊ぶ余地も沢山ありそうです。
みなさんもどんどん 「Blueprint を書いて」いきましょう！

# おわりに

コンパイラまで書こうと思ったけど間に合わなかったよ！！！

ところで、そろそろ公式に動きがありそうな新スクリプト言語 Verse が気になります。現時点の情報として、エンジンをまたいで利用可能なスクリプト言語であるとのことなので、Blueprint VM とは全く別の実行基盤が搭載されると考えたほうがよさそうです。
一応コンテンツ制作向けということで DSL とも言えるのかもしれませんが、汎化の具合によっては一つの汎用言語として、Blueprint VM の実装思想とはかなり異なるものなのかもしれません。待ち遠しいですね。

明日は [@dgtanake](https://qiita.com/dgtanaka) さんの『UEのPCゲーム対応について』です。楽しみですね。
　