---
title: 'UE4のUnreal Build Toolのビルド開始までの流れについて'
description: 'UBTが各種ビルドモードを開始するまでにしていることについて調べたやつ'
enforceCreatedAt: 2019/6/14
enforceUpdatedAt: 2019/6/15
tags:
  - Unreal Engine
  - Unreal Build Tool
---

# 概要

別の UE4 のリフレクションについての記事を調べながら書こうとしていたのですが、ビルドツール周りについての項で既に肥大化しそうだったので別記事にすることにしました。

ここに書いてあるのはビルドツール全体の話ではなく、ビルドツールがビルドを開始するまでの流れと概要についてのメモです。

# 環境

- Unreal Engine 4.22.2
- Windows 10

文章中にソースコードの行数や関数・変数名等が登場しますが、これらは上述の環境におけるものですので、他の環境においては変動する可能性があります。

# Unreal Build Tool (UBT)

UE4 には独自のビルドツールが搭載されており、このビルドツールがいろいろやってくれていることで UE4 上での C++コーディングがとても楽になっています。例えば、UE4 で C++を使って実装したアクタのプロパティがエンジンの詳細パネルからアクセスできたり、BP 上で関数が呼び出せたりといったような機能はこのビルドツール(と、Unreal Header Tools)があるおかげです。
そもそも UnrealC++の構文機能は C++の標準機能を飛び出しているので、こいつが前処理してくれないとコンパイルにかけることすらできません。
まあそんなすごいことをやっているビルドツール(笑)なので、単にビルド設定をしているとかファイルを管理してるとか以上のことをやっており、ここの中身を少しでも知っておけばいろいろ楽なんじゃなかろうかと思うわけです。

# 呼び出しを追っていく

まず、UBT のソースコードはエンジンがインストールされているディレクトリから

```
Engine\Source\Programs\UnrealBuildTool
```

と辿っていくと見つかります。ここには何やらいろんなディレクトリがあり、それぞれの中にも大量のコードがあります。

```
UnrealBuildTool
|-- Configuration
|-- DotNetCore
|-- Executors
|-- Modes
|-- Platform
|-- ProjectFiles
|-- Properties
|-- System
|-- ToolChain
|-- UnrealBuildTool.cs
|-- UnrealBuildTool.csproj
|-- app.config
`-- app.manifest
```

## エントリーポイント

UBT のエントリーポイントは、UBT のコードがあるディレクトリにある`UnrealBuildTool.cs`内の Main 関数です。
それなりに長いので、ビルドに直接関係しそうなところだけ抜き出して、コメントを翻訳・追記してみます。
かなり削っているので、いろんなオプション機能や例外処理、パフォーマンス計測用のコードが消えています。ご注意ください。

```csharp[UnreaalBuildTool.csのMain関数]
		private static int Main(string[] ArgumentsArray)
		{
			// Mutex保持用変数
			SingleInstanceMutex Mutex = null;

            // コマンドライン引数をパース
            CommandLineArguments Arguments = new CommandLineArguments(ArgumentsArray);

            // グローバル設定をパース
            GlobalOptions Options = new GlobalOptions(Arguments);

            // ビルドを行うディレクトリを Engine/Source に変更します。
            DirectoryReference.SetCurrentDirectory(UnrealBuildTool.EngineSourceDirectory);

            //ビルド設定とビルド管理を保持するクラスの型情報を取得
            Type ModeType = typeof(BuildMode);

            // 動作モードの指定がされていた場合、動作モードに該当するクラスを探索して型情報をModeTypeに格納する
            if(Options.Mode != null)
            {
                // すべての有効なモードを探索
                Dictionary<string, Type> ModeNameToType = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase);
                foreach(Type Type in Assembly.GetExecutingAssembly().GetTypes())
                {
                    if(Type.IsClass && !Type.IsAbstract && Type.IsSubclassOf(typeof(ToolMode)))
                    {
                        ToolModeAttribute Attribute = Type.GetCustomAttribute<ToolModeAttribute>();
                        ModeNameToType.Add(Attribute.Name, Type);
                    }
                }
                // モードの設定を行う
                ModeNameToType.TryGetValue(Options.Mode, out ModeType)
            }

            // ビルドモードクラスの属性に設定されているオプションを取得
            ToolModeOptions ModeOptions = ModeType.GetCustomAttribute<ToolModeAttribute>().Options;

            // エンジンのコンテンツ(ソースコードなど)のプリフェッチ(事前読み込み)オプションが有効化されていれば開始
            if((ModeOptions & ToolModeOptions.StartPrefetchingEngine) != 0)
            {
                FileMetadataPrefetch.QueueEngineDirectory();
            }

            // XMLの設定ファイル読み込みが有効化されていれば読み込み
            if((ModeOptions & ToolModeOptions.XmlConfig) != 0)
            {
                string XmlConfigMutexName = SingleInstanceMutex.GetUniqueMutexForPath("UnrealBuildTool_Mutex_XmlConfig", Assembly.GetExecutingAssembly().CodeBase);
                using(SingleInstanceMutex XmlConfigMutex = new SingleInstanceMutex(XmlConfigMutexName, true))
                {
                    FileReference XmlConfigCache = Arguments.GetFileReferenceOrDefault("-XmlConfigCache=", null);
                    XmlConfig.ReadConfigFiles(XmlConfigCache);
                }
            }

            // SingleInstance(コードに対して複数のビルドが同時実行できない設定)が有効になっていれば、Mutexを設定
            if((ModeOptions & ToolModeOptions.SingleInstance) != 0 && !Options.bNoMutex)
            {
                string MutexName = SingleInstanceMutex.GetUniqueMutexForPath("UnrealBuildTool_Mutex", Assembly.GetExecutingAssembly().CodeBase);
                Mutex = new SingleInstanceMutex(MutexName, Options.bWaitMutex);
            }

            // すべてのプラットフォームに対してのビルドを登録する場合としない場合の設定
            if((ModeOptions & ToolModeOptions.BuildPlatforms) != 0)
            {
                UEBuildPlatform.RegisterPlatforms(false);
            }
            if((ModeOptions & ToolModeOptions.BuildPlatformsForValidation) != 0)
            {
                UEBuildPlatform.RegisterPlatforms(true);
            }

            // 設定されたモードから適切なハンドラを生成
            ToolMode Mode = (ToolMode)Activator.CreateInstance(ModeType);

            // ハンドラに設定されたモードを実行
            int Result = Mode.Execute(Arguments);

            // ビルド所要時間の表示が有効であれば表示
            if((ModeOptions & ToolModeOptions.ShowExecutionTime) != 0)
            {
	            // 表示用コード　省略
            }

            return Result;
		}
```

これがビルドツールのエントリーポイントです。もう少し詳しく見ていきます。

### コマンドライン引数のパース

まず、コマンドライン引数のパース部です。ここに関してはやってることはそのままですね。

```csharp
       // コマンドライン引数をパース
       CommandLineArguments Arguments = new CommandLineArguments(ArgumentsArray);

       // グローバル設定をパース
       GlobalOptions Options = new GlobalOptions(Arguments);
```

`CommandLineArguments`という便利なクラスが`Engine/Source/Programs/DotNETCommon/DotNETUtilities/CommandLineArguments.cs`に定義されていて、こいつにコマンドラインから受け取った引数配列を渡すだけでいい感じにしてくれているようです。
そして、いい感じの形にしたコマンドライン引数の情報を、これまた`GlobalOptions`という便利なクラスに渡しています。こちらは Main と同じ`UnrealBuildTool.cs`内にいます。`GlobalOptions`はその名の通り設定情報を保持するクラスなのですが、そのコンストラクタは引数として`CommandLineArguments`を受け取る仕様になっています。該当コンストラクタを抜き出してきました。

```csharp[UnreaalBuildTool.csのGlobalOptionsのコンストラクタ]
	public GlobalOptions(CommandLineArguments Arguments)
	{
		Arguments.ApplyTo(this);
		if (!string.IsNullOrEmpty(RemoteIni))
		{
			UnrealBuildTool.SetRemoteIniPath(RemoteIni);
		}
	}
```

やっていることは渡された`CommandLineArguments`のインスタンスが持っている`ApplyTo()`を、`GlobalOptions`自らに対して適用させるというのが主なようです。ついでに`-remoteini`が指定されている場合の処理もここでやっていますね。

ここで設定の適用された`GlobalOptions`が出来上がり、Main の方でそれを取得しているんですね。

### 動作モードと動作オプションの取得

個人的にここの処理がモダンな言語の暴力といった感じで好きです。
ここでは指定された動作モードに対応するクラスを取得してくる処理をしているわけなんですが、なかなかアクロバティックです。

```csharp
//初期値としてビルド設定とビルド管理を保持するクラスの型情報を取得
Type ModeType = typeof(BuildMode);

// 動作モードの指定がされていた場合、動作モードに該当するクラスを探索して型情報をModeTypeに格納する
if(Options.Mode != null)
{
    // すべての有効なモードを探索
    Dictionary<string, Type> ModeNameToType = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase);
    foreach(Type Type in Assembly.GetExecutingAssembly().GetTypes())
    {
        if(Type.IsClass && !Type.IsAbstract && Type.IsSubclassOf(typeof(ToolMode)))
        {
            ToolModeAttribute Attribute = Type.GetCustomAttribute<ToolModeAttribute>();
            ModeNameToType.Add(Attribute.Name, Type);
        }
    }

    // モードの設定を行う
    ModeNameToType.TryGetValue(Options.Mode, out ModeType)
}
```

まず、Type 型(型情報を持つやつ)の ModeType 変数を宣言しています。初期値はビルドモードを保持する`BuildMode`クラスです。
`BuildMode`クラスは`Engine/Source/Programs/UnrealBuildTool/Modes`にある`BuoldMode.cs`に宣言されているクラスなのですが、`Engine/Source/Programs/UnrealBuildTool/Modes`には他にも似たようなファイルがあります。

```
Modes/
|-- BuildMode.cs
|-- CleanMode.cs
|-- DeployMode.cs
|-- GenerateProjectFilesMode.cs
|-- JsonExportMode.cs
|-- SetupPlatformsMode.cs
|-- ValidatePlatformsMode.cs
|-- WriteDocumentationMode.cs
`-- WriteMetadataMode.cs
```

これらのファイルにはすべて、`ToolMode`という抽象クラスを継承した各モードのクラスの実装が行われています。そして、これらのクラスは当然、C#で記述されたビルドツールがコンパイルされるときにビルドツール自体のバイナリの中に取り込まれます。
これを念頭に置いて、上記の処理からモードの探索部分を改めてみてみます。

```csharp
// すべての有効なモードを探索
Dictionary<string, Type> ModeNameToType = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase);
foreach(Type Type in Assembly.GetExecutingAssembly().GetTypes())
{
    if(Type.IsClass && !Type.IsAbstract && Type.IsSubclassOf(typeof(ToolMode)))
    {
        ToolModeAttribute Attribute = Type.GetCustomAttribute<ToolModeAttribute>();
        ModeNameToType.Add(Attribute.Name, Type);
    }
}
```

ここでは、はじめにモード名文字列をキーにとり、対応するモードが実装されたクラスの型情報を値に持つ連想配列を宣言しています。
そして次に、**ビルドツール自らのバイナリ内に宣言されている全ての public な型の情報を実行時に取得して**、その中から抽象クラス ToolMode を継承している型を抜き出し、そのクラスに設定されている Attribute(属性)情報からモード名を取得、ディクショナリに情報を追加しています。

クラスの属性については、以下のように各モードクラスの頭に宣言されています。僕はあまり C#を書かないので、C#にこんな属性の記法があることを初めて知りました。UnrealC++の記法ってやっぱり C#リスペクトあるんですかね。

```csharp
[ToolMode("Build", ToolModeOptions.XmlConfig | ToolModeOptions.BuildPlatforms | ToolModeOptions.SingleInstance | ToolModeOptions.StartPrefetchingEngine | ToolModeOptions.ShowExecutionTime)]
class BuildMode : ToolMode
{
//略
}
```

おそらくこの機構により、他の部分に一切手を加えなくても`Engine/Source/Programs/UnrealBuildTool/Modes`に新たなモードのクラスを実装したファイルを追加して引数のパース部にオプションを増やすだけでモードを増やせるようにしているのでしょう。

最後に、コマンドライン引数で指定されたモードに該当するモードが探索結果のディクショナリにあったら ModeType に参照渡しで設定して完璧です。

```csharp
// モードの設定を行う
ModeNameToType.TryGetValue(Options.Mode, out ModeType)
```

### 各種設定処理

ここでは、ここまでに取得した情報から各種設定を行っています。やっているだけな感じの処理が大半なので、コードは冒頭のみにします。前述の全文の方を御覧ください。

```csharp
// ビルドモードクラスの属性に設定されているオプションを取得
ToolModeOptions ModeOptions = ModeType.GetCustomAttribute<ToolModeAttribute>().Options;

// エンジンのコンテンツ(ソースコードなど)のプリフェッチ(事前読み込み)オプションが有効化されていれば開始。
if((ModeOptions & ToolModeOptions.StartPrefetchingEngine) != 0)
{
    FileMetadataPrefetch.QueueEngineDirectory();
}
// XMLの設定ファイル読み込みが有効化されていれば読み込み
// 略

// SingleInstance(コードに対して複数のビルドが同時実行できない設定)が有効になっていれば、Mutexを設定
// 略

// すべてのプラットフォームに対してのビルドを登録する場合としない場合の設定
// 略
```

### 処理実行

いよいよ情報が揃ったので、実行箇所です。

```csharp
// 設定されたモードから適切なハンドラを生成
ToolMode Mode = (ToolMode)Activator.CreateInstance(ModeType);

// ハンドラに設定されたモードを実行
int Result = Mode.Execute(Arguments);
```

モードに合わせたクラスの型情報を持っている`ModeType`をもとにインスタンスを作成し、抽象クラスである`ToolMode`にアップキャストしてハンドラ用の`Mode`変数に格納しています。今更ですが、抽象クラス`ToolMode`の中身はこんな感じです。

```csharp[ToolMode.csのToolModeクラス]
abstract class ToolMode
{
	public abstract int Execute(CommandLineArguments Arguments);
}
```

嘘ではないですがハンドラ(実行しかできない)みたいな感じがすごいですね。
まあ、そんな感じでこれを通して各モードの実装が実行されるわけですね。

# いったんまとめ

とりあえず Unreal Build Tool がビルドやその他の処理を呼び出すまでの流れはわかりました。
次はビルド処理を読んで記事を書こうと思います。
