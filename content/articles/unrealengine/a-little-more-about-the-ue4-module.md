---
title: 'ちょっとだけくわしくUE4 モジュールの話'
description: 'UE4のモジュールシステムについて、すこしだけ詳しく書いた記事'
enforceCreatedAt: 2019/7/28
enforceUpdatedAt: 2019/10/29
tags:
  - Unreal Engine
  - Unreal C++
assets: '/article-assets/unrealengine/a-little-more-about-the-ue4-module'
---

# 趣旨

UE4 は本当にいろいろなことができますが、特定のトピックに対する情報のまとまった記事というのがあまりない気がします。
手順書的な記事は結構あったりするのですが、そのものに対する解説記事的なのは更にない気がします。なので、UE4 の勉強がてら書いてみました。この記事を読むときは、手元で同じように実装を読んでいってもらえるとわかりやすいかと思います。

僕は趣味で UE4 をやっているへっぽこ学生なので、なにか間違っていたら遠慮なくご指摘いただけると、僕とこの記事を今後見る人が助かります。

# 環境

- エンジンバージョン: 4.22.3
- プロジェクト名: MyProject
- OS: Windows 10

プロジェクト名や環境依存の名前などは適時読み替えてください。

# モジュール

UE4 においてモジュールとは、エンジンを構成する構成単位そのものです。

エンジン自体が大きな塊ではなく、機能ごとにモジュールという形で分割されています。また、UE4 においてはプラグインもモジュールとして実装されます。

さらに、エンジンを用いて開発される C++プロジェクトのソースも、新たなモジュールとして扱われます。
以下にモジュールのイメージ図を示します。
![UE4Archtecture.png](#/module-architecture.png)

この図を見ていただくと、エンジンとして持っている大量のモジュールの中に、C++プロジェクトで実装した内容が新規モジュールとして追加されている構造がわかりやすいと思います。この C++プロジェクトで実装を行うモジュールのことを、ゲームモジュールといいます。特に、C++プロジェクト作成時にデフォルトで作成されるゲームモジュールのことをプライマリゲームモジュールと呼び、プライマリゲームモジュールはプロジェクトに 1 つしか存在できません。

UE4 におけるビルドは、モジュール単位で行われます。ビルドを行うと、1 モジュールにつき 1 つの`.dll`、つまりダイナミックリンクライブラリが出力されます。こうしてビルドされたダイナミックリンクライブラリを読み込んでいき、結果として UE4 という大きなシステムが動作していることになります。

UE4 はこのようなアーキテクチャによって、Unreal C++プログラマがお世話になっている**ホットリロード**を実現しています。本来 C++のような事前コンパイルを必要とする言語は、対象のプログラムを起動したままソースを再コンパイルして変更を反映するなどもちろんできません。しかし、UE4 ではこのようなモジュール単位でのビルドの仕組みがあるため、UE4 という大きな視点ではプログラムを起動したまま、変更のあったモジュールのみリビルドし、変更前に読み込んでいた dll をアンロード、変更後の dll を**ホットリロード**しているのです。モジュール様様、動的リンク様様ですね。

なお、モジュールのビルド結果である dll の場所は、UE4 上で`module list`というコマンドを打つと簡単に確認できます。
![image.png](#/module-list-console.png)

## ゲームモジュールを追加する意義

プライマリゲームモジュール以外にゲームモジュールを追加作成すべきシチュエーションの例を挙げておきます。
プロジェクト上で独自のアセットを実装し、ゲーム上で利用するとします。この独自アセットには、エディタ上での作成機能、インポート機能、独自エディタが実装されています。

この時、アセット自体に含まれるプロパティやメソッドは、ゲーム上に必要な情報です。しかし、エディタ機能やインポート機能などは、ゲーム上に必要な情報でしょうか？これはエディタを用いて制作を行う過程において必要な実装情報であって、Shipping ビルドを行ってユーザーにゲームを公開する際には含む必要のない情報です。しかしそんな都合はビルドシステムもコンパイラも察してくれないため、1 つのモジュールに愚直に実装してしまうと、エディタにしか必要のない情報をゲームに含めてしまいます。

ここで新規モジュールの登場です。UE4 のビルドシステムには、ビルド設定ごとにビルドに含めるモジュールを変更する機能が用意されています。このため、新規モジュールを用意しカスタムエディタや新規作成機能部分のみをこちらに実装、Editor ビルド時にのみ対象とするよう設定すれば、Game ビルド(Shipping ビルドなどのこと)時にはゲームに必要な実装のみを含めることができるようになります。

また、モジュールを分割することでビルド時のリンク速度を上げることができます。ただし、ゲーム実装自体を分割すると、リンク速度の向上とトレードオフとして実行時に読み込む DLL の数が増えるため、ゲームプレイにおいては悪影響を及ぼす恐れがあり（ますと公式に書いてあり）ます。実際の影響の程度は検証を行っていないためわかりませんが、そこまで大きな影響はなさそうな気もします。というか Game ビルド時にはサードパーティ製以外のバイナリは実行ファイルにまとめられているはずですが、モジュール数は影響するんでしょうか？

コードの結合度を下げて、使い回しを楽にしやすいという利点もあります。

## モジュールの構成

C++プロジェクトを作成すると、Source 以下はこんな構成になっていると思います。

```treeview

-- Source
    |-- MyProject
    |   |-- MyProject.Build.cs
    |   |-- MyProject.cpp
    |   `-- MyProject.h
    |-- MyProject.Target.cs
    `-- MyProjectEditor.Target.cs
```

ここで`MyProject`というディレクトリの中に入っているのが、C++プロジェクト作成時に生成されるプライマリゲームモジュールです。
`MyProject.cpp`, `MyProject.h`といった C++ファイルはモジュールについての実装を行うために用意されているファイルです。

## モジュールファイル

ここで重要なのは`MyProject.Build.cs`という C#ファイルです。このファイルは、モジュールに関する各種設定を行うためのファイルで、モジュールファイルと呼ばれるものです。UE4 でビルドを行う際には、ビルドツールがモジュールファイルを探索し、モジュールを認識することで、モジュールに含まれるコードが適切な設定でビルドされます。

では、デフォルトで生成されている`MyProject.Build.cs`を覗いてみましょう。

```csharp title="MyProject.Build.cs"
// Fill out your copyright notice in the Description page of Project Settings.

using UnrealBuildTool;

public class MyProject : ModuleRules
{
	public MyProject(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore" });

		PrivateDependencyModuleNames.AddRange(new string[] {  });
	}
}
```

デフォルトでは、そこまで複雑な設定は行われていません。`PublicDependencyModuleNames`というメンバ変数の配列になにか文字列を追加しているところと、`PCHUsage`というメンバ変数になにか代入しているところだけです。順に説明します。

配列`PublicDependencyModuleNames`は、この`MyProject.Build.cs`が示すモジュールが依存するモジュールの名前をセットし、モジュール内で外部の依存するモジュールを利用できるように設定する変数です。依存しているモジュールがここに含まれていないと、ビルド時にエラーが出ます。

`PCHUsage`というのは、IWYU(Include-What-You-Use)というシステムの利用方法について設定する変数です。IWYU についてはここでは解説しませんが、簡単に言えば依存関係をいい感じに整理することでビルド速度などを早くしてくれる機能です。詳細は以下の記事とドキュメントを御覧ください。

> IWYU でコーディングしよう
> http://miyahuji111.hatenablog.com/entry/2017/04/03/081222

> IWYU リファレンス ガイド
> https://api.unrealengine.com/JPN/Programming/UnrealBuildSystem/IWYUReferenceGuide/index.html

ここではこの 2 つしか設定が行われていませんが、他にも多くの設定項目が存在します。
設定可能な項目については以下の記事とドキュメントが詳しいです。

> ModuleRules(XXX.build.cs ファイル)について
> https://qiita.com/takayashiki2/items/db995c558024c3db8223

> アンリアル ビルド システムのモジュール ファイル
> https://api.unrealengine.com/JPN/Programming/UnrealBuildSystem/ModuleFiles/index.html

設定項目に代入すべき列挙型の中身が不明だったりして困惑することがありますが、そんなときにはエンジンソースに含まれているビルドツールのソースを読みに行きましょう！！

## ターゲットファイル

`Source`の直下にある`MyProject.Target.cs`,`MyProjectEditor.Target.cs`の 2 つの C#ファイルもやはりビルドに関する設定を行うファイルで、ターゲットファイルと呼ばれるものです。これらの中では、上記の`MyProject.Build.cs`等で発見されたモジュールのうち、”どれを”ビルド対象にするかという設定を行います。

つまり、モジュールとして完璧な形のコードを作成しても、ここに設定を追記しなければモジュールはビルドに含まれないということです。

では、なぜこのファイルは 2 つ生成されるのでしょうか。ここで、Game ビルド時と Editor ビルド時で含まれるモジュールを変えられるというところに話が戻ります。
`MyProjectEditor.Target.cs`に設定したモジュールは Editor ビルド時にビルド対象となり、`MyProject.Target.cs`に設定したモジュールは Game ビルド時にビルド対象となるといったように、使い分けることができます。
試しに、`MyProject.Target.cs`の方を見てみます。

```csharp title="MyProject.Target.cs"
// Fill out your copyright notice in the Description page of Project Settings.

using UnrealBuildTool;
using System.Collections.Generic;

public class MyProjectTarget : TargetRules
{
	public MyProjectTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;

		ExtraModuleNames.AddRange( new string[] { "MyProject" } );
	}
}

```

まず、`Type`という変数にこの`MyProject.Target.cs`によって行われるビルドの種類を指定しています。ちなみに、ビルドツールのコードではこの`TargetType`という型は以下のように列挙型として定義されています。

```csharp title="ビルドツールより抜粋(TargetRules.cs)"
	public enum TargetType
	{
		Game,
		Editor,
		Client,
		Server,
		Program,
	}
```

生成される`MyProject.Target.cs`,`MyProjectEditor.Target.cs`は`TargetType`に`Game`,`Editor`が設定されたターゲットファイルですが、ビルドツールを見るとまだ他にもタイプがあるようです。

> アンリアルビルド システムのターゲット ファイル
> https://api.unrealengine.com/JPN/Programming/UnrealBuildSystem/TargetFiles/index.html

公式から引用させていただくと、それぞれこんな意味があるそうです。

> Game - クック済みデータの実行を要求するスタンドアロン ゲームです。
> Client - Game と同じですが、サーバー コードは含まれません。ネットワーク ゲームに役立ちます。
> Server - Game と同じですが、クライアント コードは含まれません。ネットワーク ゲームのデディケイテッド サーバーに役立ちます。
> Editor - アンリアル エディタを拡張するターゲットです。
> Program - アンリアル エンジンに加えてビルドされているスタンドアロン ユーティリティ プログラムです。

なお、引用元に重大な誤植があったため、引用文は一部修正を加えています。

これだけビルドタイプがあるにも関わらず、デフォルトでは 2 種類分しか生成されないということは、自分でターゲットファイルを追加することができるということです。ターゲットファイルの作成については流石に話がそれすぎるのでここでは解説しません。ちなみに、同じビルドタイプのターゲットファイルを複数作成しても、1 つしか認識されませんのでご注意ください。

次に、`ExtraModuleNames`です。ここが重要なところで、ビルドターゲットにするモジュールの識別名をセットする配列です。

デフォルトではゲームモジュールがプライマリゲームモジュール 1 つしかないので 1 つしか指定されておらず、`MyProject.Target.cs`と`MyProjectEditor.Target.cs`どちらも同じ設定になっていますが、前述のような都合でモジュールを追加した場合は大変便利です。

IDE などからビルドを行う際には、ターゲットファイルのクラス名が併記されたビルド設定が生成されているので、対応するものを選択すれば、どちらの設定でビルドを行うか指定することができます。

## .uproject ファイル

UE4 のプロジェクト直下に生成される`.uproject`ファイルにもモジュールに関する設定項目が存在します。
今回生成された`MyProject.uproject`を覗いてみます。

```json title=MyProject.uproject
{
	"FileVersion": 3,
	"EngineAssociation": "4.22",
	"Category": "",
	"Description": "",
	"Modules": [
		{
			"Name": "MyProject",
			"Type": "Runtime",
			"LoadingPhase": "Default"
		}
	]
}
```

モジュールに関する項目は`"Modules"`の箇所です。ここには、プロジェクトで定義したモジュールを設定します。モジュールファイルやターゲットファイルには基本的にビルドに関する設定を行ってきましたが、`.uproject`に記述するのは起動時の読み込み対象のモジュールの識別名です。ここに記述しなくてもビルド対象にすることはできますが、起動時の読み込みやホットリロード等の対象にはなりません。

また、識別名だけでなく、そのモジュールを読み込む動作タイプと、読み込みタイミングも設定することができます。それぞれ以下のようになっています。

### Type

| 読み込み時タイプ名  | 概要                                                    |
| ------------------- | ------------------------------------------------------- |
| Runtime             | 通常実行時には読み込む                                  |
| RuntimeNoCommandlet | 実行時、コマンドレットでない場合読み込む                |
| RuntimeAndProgram   | 実行時かつビルドターゲットが Progarm である場合読み込む |
| CookedOnly          | クックビルドされた後の場合読み込む                      |
| Developer           | デベロッパツールをサポートしたエンジン上でのみ読み込む  |
| Editor              | エディタビルドの場合読み込む                            |
| EditorNoCommandlet  | エディタビルドかつコマンドレットでない場合読み込む      |
| Program             | Program ビルドされた場合のみ読み込む                    |
| ServerOnly          | Server ビルドされた場合のみ読み込む                     |
| ClientOnly          | Client ビルドされた場合のみ読み込む                     |

### LoadingPhase

| 読み込み順 | ローディングフェーズ名 | タイミング                                       |
| ---------- | ---------------------- | ------------------------------------------------ |
| 1          | EarliestPossible       | 可能な限り最も早く読み込みます                   |
| 2          | PostConfigInit         | エンジン設定の初期化後に読み込みます             |
| 3          | PreEaryLoadingScreen   | PreLoadingScreen よりも前に読み込みます          |
| 4          | PreLoadingScreen       | 画面が起動する前に読み込みます                   |
| 5          | PreDefault             | Default の前に読み込みます                       |
| 6          | Default                | 通常のモジュールロードタイミングで読み込みます   |
| 7          | PostDefault            | Default の後に読み込みます                       |
| 8          | PostEngineInit         | エンジンの初期化処理が終了したあとに読み込みます |

なお、モジュールを追加する際には以下のようにします。

```json title=MyProject.uproject
{
	"FileVersion": 3,
	"EngineAssociation": "4.22",
	"Category": "",
	"Description": "",
	"Modules": [
		{
			"Name": "MyProject",
			"Type": "Runtime",
			"LoadingPhase": "Default"
		},
		{
			"Name": "NewModule",
			"Type": "Editor",
			"LoadingPhase": "Default"
		}
	]
}
```

## なぜビルド設定が C#?

設定ファイルが C#なのは、UE4 のビルドツールが本体が C#で書かれていることに由来します。

モジュールファイルや後述のターゲットファイルといった C#による設定ファイルは、Generate ~などのメニューからプロジェクトを生成する際にビルドが行われ、そのプロジェクトにおけるモジュールのビルドルールとなる DLL が生成されます。

これをビルドツール本体が動的リンクすることで、C++プロジェクトのゲームモジュールを含めた適切なビルドを行っているんだと思います。（間違っていたらごめんなさい）
謎のビルドエラーが起こったときに Intermediate を消すと動くのはここにも一因があると思われます。

コンテキストメニュー
![image.png](#/build-context-menu.png)

生成されたビルドルールの DLL
![image.png](#/build-rule-dlls.png)

単なる設定ファイルとしてだけでなく、ビルド時に行いたい処理なども記述できるので結構便利です。

# モジュールの実装を確認してみる

ここまでモジュールの設定方法とビルドについて詳しく見てきましたが、肝心のモジュールの宣言方法に触れていません。モジュール自体は C++実装なのですから、モジュールの宣言も C++で行ってやる必要があります。

改めてモジュールの構成を示します。

```treeview
-- Source
    |-- MyProject
    |   |-- MyProject.Build.cs
    |   |-- MyProject.cpp
    |   `-- MyProject.h
    |-- MyProject.Target.cs
    `-- MyProjectEditor.Target.cs
```

C#のファイルたちは皆設定を行うファイルだったので、モジュールの実装を行うのは残った C++ファイル 2 つ、`MyProject.h`と`MyProject.cpp`です。

とりあえず、デフォルトの状態のこの 2 つのファイルを見てみましょう。

```cpp title="MyProject.h"
// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
```

```cpp title="MyProject.cpp"
// Fill out your copyright notice in the Description page of Project Settings.

#include "MyProject.h"
#include "Modules/ModuleManager.h"

IMPLEMENT_PRIMARY_GAME_MODULE( FDefaultGameModuleImpl, MyProject, "MyProject" );
```

もはや無です。というか、実装らしき箇所が 1 箇所しかありません。
これはこの C++プロジェクトが生成した、プライマリゲームモジュールをコードであるため、`IMPLEMENT_PRIMARY_GAME_MODULE`というマクロで、そのマクロ名の通りプライマリゲームモジュールが実装されています。
では、このマクロを含め、モジュール定義のためのマクロたちを紹介します。

## IMPLEMENT_PRIMARY_GAME_MODULE

これはたった今登場した、プライマリゲームモジュール実装のためのマクロです。
プライマリゲームモジュールはプロジェクト上に 1 つしか実装できないため、必然的にこのマクロもプロジェクトを通して 1 つのモジュールにしか書くことはありません。逆に、これがないと Shipping ビルドなどのモノリシックビルド時にビルドが通らないんじゃないかと思います。(試してないです)

```cpp
IMPLEMENT_PRIMARY_GAME_MODULE(ModuleImplClass, ModuleName, GameName)
```

このマクロは、第一引数に**モジュールを実装したクラス**、第二引数に**モジュール名**、第三引数に**ゲーム(プロジェクト)名**を取ります。

第一引数に渡すモジュールを実装したクラスは、後述の`IModuleInterface`というインターフェイスを継承して実装したモジュールクラスを渡すことができます。

第二引数に渡すモジュール名は、他のモジュールやエンジン上からこのモジュールを識別する際の名称として使われる文字列を決定します。実装クラスと同じ名前である必要はありません。例えば、ターゲットファイルの`ExtraModuleNames`に渡していたのはここで決定される識別名です。

第三引数はゲーム(プロジェクト)名を渡すのですが、実装を覗くと、この第三引数はもう利用されていません。昔はここに渡したゲーム名を利用した処理が行われていたようなのですが、現在は`.uproject`ファイルから自動的にプロジェクト名をパースしてくるようで、コード上でも廃止予定とされています。おそらく残っているのは後方互換性のためでしょう。現状も値を渡さなければエラーが出ますが、実際は文字列さえ渡しておけば良いと思われます。

## IMPLEMENT_GAME_MODULE

こちらはゲームモジュールを実装するためのマクロです。ゲームモジュールはプライマリゲームモジュールと異なり、プロジェクト上に複数個実装することが可能なため、このマクロも複数のモジュールに書くことができます。ゲームコードを含むモジュールはこれで実装しましょう。

```cpp
IMPLEMENT_GAME_MODULE(ModuleImplClass, ModuleName)
```

第一引数と第二引数はプライマリゲームモジュールの場合と同じで、実装クラスとその識別名を与えます。
(プライマリゲームモジュールの第三引数は廃止予定だったので、中身は異なりますが渡しているものは実質同じですね。)

## IMPLEMENT_MODULE

こちらはシンプルなモジュールを実装するためのマクロです。ゲームコードを含まないモジュールはこのマクロで実装されます。

```cpp
IMPLEMENT_MODULE(ModuleImplClass, ModuleName)
```

渡している引数は`IMPLEMENT_GAME_MODULE`と同様です。

ここで使われている`IMPLEMENT_PRIMARY_GAME_MODULE`というマクロはプライマリゲームモジュールを実装する(implement なので)マクロなのですが、実は初期状態では、はじめから用意されている`FDefaultGameModuleImpl`という最低限のクラスをゲームモジュールとして利用(代用？)しているだけです。もっとモジュールクラス自体に機能を持たせるために用意されている手段は後述しますので、とりあえず`FDefaultGameModuleImpl`の中身を見てみます。

## モジュール実装マクロの余談

<font color="darkred">**この節には不確定要素が多いです。**</font>
ここまで紹介してきたモジュール実装のためのマクロたちですが、実装を見るとこれらはビルド方式によって内部処理が変動しているようです。プラットフォームなどによる変動はもちろんあるのですが、最も大きいのが**Monolithic(一枚岩)**と**Modular(まとまりごと)**という 2 種類のリンクタイプのによる違いです。
リンクがわからない方は詳しくは調べてほしいのですが、ざっくり言えばコンパイルした複数のファイルや必要なライブラリを正しく関連付ける作業です。

この 2 つのリンクタイプによって生まれるビルドの結果は「ビルド結果として得られるバイナリが実行ファイルにまとまっているか、多量の.dll などに分散しているか」の違いがあります。

パッケージングのビルドや Game ビルド(Shipping ビルド)などは実行ファイルとしてバイナリがまとまるため**Monolithic**で行われて、Editor ビルドの際などは.dll としてバイナリがモジュールごとに生成されるため**Modular**で行われていることがわかります。

そして、Modular でリンクが行われる際、前述の`IMPLEMENT_MODULE`,`IMPLEMENT_GAME_MODULE`,`IMPLEMENT_PRIMARY_GAME_MODULE`の 3 つのモジュール実装マクロの内部処理に**差はありません**。

すべての実装マクロが、リンクタイプが Modular 時の`IMPLEMENT_MODULE`の処理へと渡されています。これは推測ですが、Modular すなわち Editor 上で開発を行っている際には、エンジンというソフトウェアの管理はエンジン側にあるため、ゲームモジュールを含めすべてのモジュールは内部的には同等のプログラムとして扱われているのではないでしょうか。確かに、Game ビルド時のようにプライマリゲームモジュール中心で動作していたら、それ自身のホットリロードは困難な気がします。(怪しいです。違ったら指摘してほしいところ No.1 です)

一方 Monolithic 時の実装は`IMPLEMENT_PRIMARY_GAME_MODULE`が独自の複雑な処理に変わったり、`IMPLEMENT_MODULE`の処理からホットリロードの処理が外されたりしています。しかし、実装を見る限りでは`IMPLEMENT_MODULE`と`IMPLEMENT_GAME_MODULE`の間にはこちらでも差異は見られない気がします……。というか、`IMPLEMENT_GAME_MODULE`の実装は常に以下になっています。

```cpp title="ModuleManager.hより抜粋"
#define IMPLEMENT_GAME_MODULE( ModuleImplClass, ModuleName ) \
	IMPLEMENT_MODULE( ModuleImplClass, ModuleName )
```

うーん。各所の説明を読むと別のものとされているのですが、表面上のものなのでしょうか？有識者の方、教えて下さい。

# モジュールクラスについて

ここでは、モジュール実装マクロに渡すモジュールクラスについて触れます。
例として、デフォルトで生成された`IMPLEMENT_PRIMARY_GAME_MODULE`に渡されていた`FDefaultGameModuleImpl`クラスの実装に注目しましょう。

```cpp title="ModuleManager.hより抜粋"
class FDefaultModuleImpl
	: public IModuleInterface
{ };

class FDefaultGameModuleImpl
	: public FDefaultModuleImpl
{
	virtual bool IsGameModule() const override
	{
		return true;
	}
};
```

ここからわかることは、`IModuleInterface`というクラス(インターフェイス?)を継承して、先程の`FDefaultGameModuleImpl`は作られていたということです。そして、`FDefaultGameModuleImpl`は唯一つ、`IsGameModule`という`bool`を返すメソッドで`true`を返すというオーバーライドが実装されています。`IsGameModule`はその名と型の通り、自らがゲームモジュールである場合`true`を返すよう設定するためのメソッドです。

ここではこれ 1 つのみですが、`IModuleInterface`が宣言・定義されている`ModuleInterface.h`の実装を覗くと、他のオーバーライド可能なメソッドを知ることができます。自分でゲームモジュールを追加で宣言する場合には、このあたりを利用することが多いため、一度目を通しておくと良いです。一応ドキュメントもありますが、実装ファイル以上の情報はありません。

> IModuleInterface
> https://api.unrealengine.com/INT/API/Runtime/Core/Modules/IModuleInterface/index.html

# モジュール実装に多用されるメソッド

`IModuleInterface`には、設定項目的なメソッド以外にも、モジュールの実装にあたって非常に重要なメソッドがいくつか定義されています。
それらをオーバライドすることで、独自モジュール実装に利用することができます。ここでは、特に使用頻度の高いメソッドについて触れます。

## StartupModule

モジュールの DLL がロードが開始された直後に呼び出されるメソッドです。モジュールのオブジェクトが作成されて真っ先に呼び出されると考えれば良いです。ここには、依存関係にあるモジュールの読み込みや、このモジュールで行う実装の初期化処理などを行うことができます。

## PostLoadCallback

モジュールのロードが後に実行されるメソッドです。

## ShutdonwModule

モジュールが完全にアンロードされる直前に呼び出されます。終了時処理などを行うことができます。

## PreUnloadCallback

モジュールのアンロード開始前に呼び出されるメソッドです。

この 4 つのメソッドを以下のような実装でオーバーライドしてビルドの上、ホットリロードが行われた場合の出力を確認してみます。

```cpp title="実装例.cpp"

/*
** このコードは単体では動作しません。また、ShutdownModuleとPreUnloadCallbackについては
** 前回ビルドの結果が出力されるため、2回以上リビルドしなければ後述の出力は得られません。
*/

class FMyProjectModule : public FDefaultGameModuleImpl
{
public:
    virtual void StartupModule() override
    {
        UE_LOG(LogTemp, Log, TEXT("StartupModule"))
    }

    virtual void PostLoadCallback() override
    {
        UE_LOG(LogTemp, Log, TEXT("PostLoadCallback"))
    }

    virtual void ShutdownModule() override
    {
        UE_LOG(LogTemp, Log, TEXT("ShutdonwModule"))
    }

    virtual void PreUnloadCallback() override
    {
        UE_LOG(LogTemp, Log, TEXT("PreUnloadCallback"))
    }
};

IMPLEMENT_PRIMARY_GAME_MODULE(FMyProjectModule, MyProjectModule, "MyProject")

```

```text title=ホットリロード時の出力
LogTemp: PreUnloadCallback
LogTemp: ShutdonwModule
LogTemp: StartupModule
LogTemp: PostLoadCallback
```

つまり、以下のような実行順で実行されるということがわかります。

| 実行順 | メソッド名         |
| ------ | ------------------ |
| 1      | StartupModule      |
| 2      | PostLoadCallback   |
| -      | (モジュール動作中) |
| 3      | PreUnloadCallback  |
| 4      | ShutdonwModule     |

これらは本当によく使うため、覚えておきましょう。

# まとめ

- UE4 はモジュールの集合体！
- モジュールには種類があって、使い分ける
- モジュールは自作できる。
- モジュール実装のための便利なものが親として提供されているから、頑張って使いこなそう！

# おわりに

粗く長くやりましたが、モジュールの宣言のされかたやビルドツールとの関わりなどが少しわかっていただけたら嬉しいです。
