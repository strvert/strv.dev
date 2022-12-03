---
title: 'すこし厳しい Blueprint 入門 '
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
Unreal Engine ユーザーたるもの、Blueprint は日々活用されていることでしょう。そういった皆々様方は、かつてBlueprint に入門されたことかと思いますが、Blueprint の裏側を覗きに行く機会はあまりないかもしれません。

Unreal Engine に搭載されたスクリプティング言語としての Blueprint が、果たしてどのような形で記述され、誰に寄って実行され、どうやって c++ と連携しているのか？ そんな裏側について掘り下げ、「Blueprint に入門」してみるのが本記事です。

使えなさそうで、意外と実用できる場面もある知識だったりしますので、興味のある方はぜひ読んでみてください。「そんなこととっくに知ってるぜ」というパワー系の皆さんは、本記事の粗を探してつついてくれると大変助かります。

# 検証環境

- UE 5.1

# 記述範囲と注意事項
本記事での範疇は、Blueprint コードの内部表現、Blueprint 実行システムの構造、Blueprint のコンパイルなどに焦点を当てます。

Blueprint Graph 画面の描画や、ノードの定義方法などについてはあまり詳しく掘り下げません。

また、本記事はエンジンのソースを読むことで得られた情報に基づいており、用語などは極力ソースに準拠するようにしていますが、説明のための記事上の用語が存在することがあります。Unreal Engine 以外の一般論については通常の用語を使用しています。

# プログラミング言語としての Blueprint 

まず、Blueprint の実行システムについて、大まかな構造を理解しましょう。Blueprint をひとつのプログラミング言語としてみたとき、以下のような特徴を持つと言えるでしょう。

* スクリプト言語
* ノードベース・ビジュアルプログラミング言語
* 非ネイティブコンパイル言語
* C++ との相互運用性
* オブジェクト指向言語
* 明示的な型付け
* 型安全ではない、弱い静的型付け

型などについては [Wikipedia](https://ja.wikipedia.org/wiki/%E5%9E%8B%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0) に説明を任せるとして、この後のために説明しておきたい事項について触れておきます。

## 非ネイティブコンパイル言語
Blueprint がネイティブコンパイル言語ではないというのは、最終的に Blueprint で記述された処理が実行される際に、機械語となって各プラットフォームの CPU で直接実行されない(できない)ということです。

これはスクリプト言語では珍しいことではありません。独自の命令などを定義した処理系をソフトウェアとして専用に実装し、その定義に従ったコードを与えれば、CPU で実行される機械語でなくともソフトウェア上で「実行する」ことは可能です。
その処理系が入力されたコードを解釈して、その示す意味のとおりに、実際のCPUやOSを制御すれば良いからです。
Blueprint はこのタイプの言語であり、Unreal Engine の上に実装されたソフトウェアの処理系によって解釈・実行されます。こういったコードを解釈・実行するようなソフトウェアのことをVMと呼ぶこともあります。

一方で、Blueprint はコンパイル言語です。このことは上記の内容と矛盾しません。Blueprint はコンパイルされると、 **Blueprint bytecode** というバイト列形式の中間表現を吐き出します。上記で述べた処理系が直接扱うのは、この bytecode のほうであり、ノードによる表現は直接扱えないのです。

このような仕組みを取っているのは、主に実行時コストを落とすためだと思われます。ノードによる表現が作成する、接続関係によるネットワーク表現は人間にとっては直感的ですが、そのまま実行するには向きませんし、扱うデータが大きくなります。そのため、より実行時に処理しやすく軽量な中間表現として bytecode を事前に生成しておき、実行時には bytecode のみを処理するという形式を取っているのでしょう。

なお、他に bytecode のような中間表現が用いられることのメリットは、中間表現を生成するコンパイラに選択肢を持たせることができることなどがあります。中間表現の仕様さえ満たしていれば、それを生成しているのがどんなコンパイラでも、中間表現を手書きできる謎の人間でも構わないわけです。このあたりの特性を利用している言語の例としては、.NET言語(C#, F#, ....)や[JVM](https://ja.wikipedia.org/wiki/Java%E4%BB%AE%E6%83%B3%E3%83%9E%E3%82%B7%E3%83%B3)言語(Java, Scala, Kotlin, ....)の実行系、あるいはコンパイラ基盤であるLLVMのLLVM-IR などが大活躍していますので、興味のある方はそちらをどうぞ。

また、過去には Blueprint のコンパイルバックエンドに、C++のコードを吐き出す実装(ネイティブ化)が存在しました。[こちらの公式ドキュメント](https://docs.unrealengine.com/5.1/ja/compiler-overview-for-blueprints-visual-scripting-in-unreal-engine/)を参照すると、5.1現在も `FKismetCppBackend` がデバッグ用に存在していることになっていますが、これは誤りであり、コード上からは完全に削除されているため、現在ではあらゆる Blueprint は bytecode として実行されます。

## C++との相互運用性
C++との相互運用性は、Blueprint の極めて強力な特徴です。Unreal Engine が独自のスクリプト言語を持っていることの大きなメリットとも言えるでしょう。

通常、複数言語の混在した開発において、言語間のデータの受け渡しや関数の呼び出しは大きな課題であり、そのためのレイヤや相互運用のためのライブラリがプロジェクトに導入されることも珍しくありません。

しかし、Blueprint ははじめから Unreal Engine で使われることを想定して設計され、独自のビルドシステムや C++ 側の実装の存在を前提として実装されているので、ほとんど意識せずに C++ との相互運用が可能となっています。

このことは Blueprint の言語設計にも影響を与えているはずです。たとえば、Blueprint はかなり強くオブジェクト指向を意識した言語です。これは、C++で定義されたクラスや、作成されたオブジェクトの階層的な構造をそのまま持ち込もうとすると、必然的にそうなるのでしょう。もちろん、ゲーム開発においてオブジェクト指向が大きな実績を持っているということもあるとは思います。

## 型安全ではない、弱い静的型付け
これについてはあまり詳しく触れませんが、Blueprint は静的型付け言語ですが、型安全性は保証されていません。
たとえば、ピンの型にWildcard(何でも入れられる)などを利用した場合、実行時に型の不一致でエラーが発生することがあります。
一方で、基本的に型を意識して扱うことができ、これもやはりC++との相互運用性を考えたスクリプティング言語としての経緯が見えるところです(そうじゃなくても型ほしいですけど)。

まあただ、Unreal には UObject という **†最強の基本クラス†** がいるので、なんとも言えませんが。

# Blueprint の歴史的背景と UnrealKismet
今後登場する **Kismet** という用語のために、少し Blueprint の歴史的背景について説明します。
Blueprint とは、Unreal Engine 4から搭載された機能でした。しかし、Unreal Engine におけるノードベースのビジュアルスクリプティング言語の歴史は Unreal Engine 4 からではありません。

Blueprint の系譜は Unreal Engine 3 から始まっています。残念ながら私は実際に触ったことはないのですが(当時10歳とかなのでそれはそう)、Unreal Engine 3 にも、 **UnrealKismet** というビジュアルスクリプティング言語が存在しました。
そして、Unreal Engine 4 の機能として公開された Blueprint 実装のコードベースは、この Kismet のものの多くを引き継いだものなのです。この継承の歴史は Unreal Engine 5 になっても途絶えておらず、エンジン内の Blueprint に関連するコードの髄所に Kismet という語が認められます。また、 `K2Node` の `K2` なども、 `Kismet 2` の略であると思います。


# Blueprint VM と スタックマシン
さて、Blueprint の基本的な特徴を把握したところで、Blueprint が実際に実行されている実行系の構造を見ていきます。
Blueprint の実行系とは、前述の Blueprint bytecode を読んで、それが意味するところの処理を実行してくれる実装のことです。このような解釈・実行系のことをVMと呼ぶこともあると言いましたが、Blueprint の該当する実装においても **Blueprint VM** と書かれることがあり、端的でわかりやすいので、この用語を採用します。

**Blueprint VM** は、[**スタックマシン**](https://ja.wikipedia.org/wiki/%E3%82%B9%E3%82%BF%E3%83%83%E3%82%AF%E3%83%9E%E3%82%B7%E3%83%B3)計算モデルを採用したVMです。
スタックマシンはこの種のVMではよく採用されており、たとえば Java の [JVM](https://ja.wikipedia.org/wiki/Java%E4%BB%AE%E6%83%B3%E3%83%9E%E3%82%B7%E3%83%B3) (....の一般的な実装)や、各種ブラウザに搭載されている [WebAssembly](https://ja.wikipedia.org/wiki/WebAssembly) の解釈実行系などもスタックマシンです。

スタックマシンに対比されるのはレジスタマシンであり、両者の違いは、処理のためのデータ(演算子が取る引数の値など)を配置する場所です。スタックマシンではメモリ上のスタックに対して値を Push / Pop することで処理を進めますが、レジスタマシンでは予め用意されたレジスタへの読み書きでこれを行います。

簡単でわかりやすい図が以下のブログ様にあったので、ぜひご参照ください。

https://yuukiyg.hatenablog.jp/entry/2014/03/21/223500

何の違いがあるのかと思われるかもしれませんが、この差異は命令数や最適化の容易性、環境依存度などに影響してきます。あと、単純にスタックマシンのが実装しやすいです。

Blueprint VM は




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


