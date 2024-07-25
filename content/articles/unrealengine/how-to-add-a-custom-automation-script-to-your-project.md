---
title: 'プロジェクトに独自の Automation Project を追加しよう'
description: 'Unreal Engine における縁の下の力持ち、Automation Project の使い方'
tags:
    - Unreal Engine
    - Unreal Build Tool
    - Unreal Automation Tool
    - Plugin
assets: '/article-assets/unrealengine/how-to-add-a-custom-automation-script-to-your-project'
---

# Unreal Automation Tool とは？
Unreal Engine には、ビルドやテスト、デプロイなどの自動化を行うためのツールとして、Unreal Automation Tool (UAT) があります。
UAT が用意してくれているコマンドを実行すると、コマンドラインから Unreal Engine プロジェクトに対する様々な操作を実行することができます。
自動化目的だけではなく、エディタから実行されるビルドやデプロイ操作も、内部的には UAT (や UBT) が呼び出されていることが多いです。

## この記事を読むとわかること
UAT は非常に強力なツールです。しかし、既存のコマンドだけでは足りない場合もあります。そんなときには、独自の Automation Project を追加することができます。
Automation Project は C# プロジェクトであり、UAT から呼び出すコマンドを定義することができます。

独自コマンドの記述にあたっては、 Epic Games が提供するエンジン内の多数の C# ライブラリを利用することができます。これらのライブラリは、Unreal Engine のプロジェクトを操作したり、ビルドやデプロイを実行するための便利な機能を提供しています。
つまり、UAT コマンドを実装すると、独自のパッケージングフローの定義や、ビルド前後の処理、テストの自動化、CI/CD パイプラインの構築などに役立てることができます。


以前は、プロジェクトに独自の Automation Project を追加するのが少し大変でした。現在でも、公式ドキュメントには「Unreal Engine のソース ビルドが必要である」旨が記載されています。[^1]
[^1]: 『[自動化プロジェクトを作成する | Unreal Engine 5.4 Documentation](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/create-an-automation-project-in-unreal-engine?application_version=5.3)』 ソースコード版のエンジンにエンジンレベルでコマンドを追加する場合には、こちらの手順を利用できます。

しかし、**実際にはランチャー版の Unreal Engine でも Automation Project を追加することができます。**  
本稿では、その概要と手順を解説します。

# 目次

# 検証環境
- Unreal Engine 5.3, 5.4
- Windows 11
- JetBrains Rider 2024.1


# 既存のコマンドを見てみる
まずはイメージを掴むために、既存のコマンドを見てみましょう。
コマンドは、`RunUAT.bat` または `RunUAT.sh` を使って呼び出すことができます。
以下が UAT コマンドを呼び出す際の基本形です。

```powershell
<UnrealEngineRoot>\Engine\Build\BatchFiles\RunUAT.bat <CommandName> -<Option1>=<Value1> -<Option2>=<Value2> ...
```

ここでは Windows の PowerShell 環境を想定して、`RunUAT.bat` を使ってコマンドを呼び出す例を示しています。
- `<UnrealEngineRoot>`
    - Unreal Engine のインストールディレクトリを指します。
- `<CommandName>`
    - 実行したい UAT コマンドの名前を指定します。


たとえば、`BuildCookRun` という UAT コマンドを呼び出す場合は以下のようになります。
このコマンドを使うと、C++ モジュールのビルド、アセットのクック、パッケージング、デプロイなどを一気通貫で行うことができます。

```powershell
<UnrealEngineRoot>\Engine\Build\BatchFiles\RunUAT.bat BuildCookRun
-project=<ProjectPath>
-noP4
-platform=<Platform>
-clientconfig=<ClientConfig>
-build
-cook
-allmaps
-stage
-pak
-archive
-archivedirectory=<ArchiveDirectory>
```

本稿においては `BuildCookRun` はあくまで例なので解説は行いませんが、このようにして UAT コマンドを呼び出すことができます。


# Automation Project を作ってみる
Automation Project は、 UAT から呼び出し可能なコマンドを提供するプロジェクトの単位です。その内部には、コマンドを定義したクラスのほか、そのコマンドで利用するライブラリやリソースを含めることができます。
一つの Automation Project に複数のコマンドを含めることもできるので、類似したカテゴリのコマンドをまとめたプロジェクトを作成することも可能です。

## Automation Project が満たすべき条件

### 配置場所
Automation Project は、どこにでも作成することができます。
UE プロジェクトの中、プラグインの中はもちろん、全く関係ないディレクトリに配置することもできます。
目的に応じて適切な場所に配置してください。

### プロジェクトファイル
Automation Project は C# プロジェクトとして作成されます。一般的な C# プロジェクトは `.csproj` ですが、 Automation Project の場合は必ず `.automation.csproj` でなければなりません。
こうしておけば、 UAT が自動的にプロジェクトを発見して、自作のコマンドを認識してくれます。

### コマンドクラス
UAT は、 Automation Project に含まれるコマンドクラスを自動的に認識します。このとき、クラスは `BuildCommand` クラスを継承している必要があります。
`BuildCommand` クラスは、`AutomationTool` 名前空間に含まれています。

継承さえしておけば、リフレクションによって自動的にコマンドが認識されるため、特に設定は不要です。定義時のクラス名がコマンド名として使われます。
クラス名がコマンド名になるため、名前空間が違っても、クラス名は重複してはいけません。

## Automation Project のプロジェクトファイルを書く
まずは、 Automation Project のプロジェクトファイルを作成します。
UE プロジェクトの中など、適切な場所に Automation Project 用のディレクトリを作成し、その中に `.automation.csproj` ファイルを作成します。

```treeview
MyProject
├── MyCommand
│   └── MyCommand.automation.csproj
└── MyProject.uproject
```

ここでは、 `MyCommand.automation.csproj` というファイルを作成します。

```xml
<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <!-- プロジェクトの設定 -->
        <TargetFramework>net6.0</TargetFramework>
        <ImplicitUsings>enable</ImplicitUsings>
        <Nullable>enable</Nullable>
        <AssemblyName>BuildPlugins.Automation</AssemblyName>
        <RootNamespace>AutomationTool</RootNamespace>
    </PropertyGroup>

    <ItemGroup>
        <!-- エンジン内に含まれている C# プロジェクトを参照するときは、以下のように記述する -->
        <ProjectReference Include="$(EngineDir)\Source\Programs\AutomationTool\AutomationUtils\AutomationUtils.Automation.csproj"/>
        <ProjectReference Include="$(EngineDir)\Source\Programs\Shared\EpicGames.Core\EpicGames.Core.csproj"/>
        <ProjectReference Include="$(EngineDir)\Source\Programs\UnrealBuildTool\UnrealBuildTool.csproj"/>
    </ItemGroup>
</Project>
```

ここでは、 `<ItemGroup>` 内によく使うライブラリプロジェクトをサンプルとして追加しています。
`$(EngineDir)` は、UAT が Automation Project を認識してビルドする際に設定するプロパティです。たとえば `C:\Program Files\Epic Games\UE_5.3\Engine` のようなパスが設定されます。


### $(EngineDir) についての注意点
IDE に自動でプロジェクトへの参照を追加させると、相対パスで参照が追加されることがあります。すると、他の環境でビルドが通らなくなるといった問題が発生する可能性があります。
そのため、参照は必ず `$(EngineDir)` を使って絶対パスで記述するようにしましょう。

しかし、 `$(EngineDir)` は UAT がビルド時に設定するプロパティであるということは、IDE で編集中には認識されないということでもあります。
ビルドには問題はないのですが、IDE 上で参照エラーが出まくり、IDE を使っている意味がなくなるので、以下のような対応が必要です。

C# プロジェクトでは、ユーザー固有のプロパティを `.csproj.user` ファイルに記述することができます。このファイルに `$(EngineDir)` を設定しておけば、IDE もプロパティを認識してくれるようになります。

```treeview
MyProject
├── MyCommand
│   ├── MyCommand.automation.csproj
│   └── MyCommand.automation.csproj.user # このファイルを追加
└── MyProject.uproject
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="4.0" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <EngineDir>C:\Program Files\Epic Games\UE_5.3\Engine</EngineDir>
  </PropertyGroup>
</Project>
```

**このファイルは開発者の固有設定であるため、バージョン管理に含めるべきではありません。** `.gitignore` や `p4ignore` などで除外するようにしましょう。

## コマンドクラスを作成する
次に、 Automation Project に含めるコマンドクラスを作成します。
ここでは、 `MyCommand.cs` というファイルを作成して、そこに書いていくことにします。

```treeview
MyProject
├── MyCommand
│   ├── MyCommand.automation.csproj
│   ├── MyCommand.automation.csproj.user
│   └── MyCommand.cs # このファイルを追加
└── MyProject.uproject
```

まずは最低限の内容です。

```csharp
using AutomationTool;
using Microsoft.Extensions.Logging;

public sealed class MyCommand : BuildCommand
{
	public override void ExecuteBuild()
	{
        Logger.LogInformation("--- MyCommand ---");
        Logger.LogInformation("Hello, Automation Project!");
        Logger.LogInformation("-----------------");
	}
}
```

これだけで、 `MyCommand` という名前のコマンドが作成されます。

# 作成した UAT コマンドを実行する 
コマンドを実行するには、`RunUAT.bat` を使って呼び出します。

このとき、作成した Automation Project が含まれるディレクトリを `-ScriptDir=` オプションで指定します。

```powershell
<UnrealEngineRoot>\Engine\Build\BatchFiles\RunUAT.bat MyCommand -ScriptDir="<AutomationProjectDir>"
```

すると、コマンドが実行され、ログが出力されるはずです。
(具体的なパスはマスクしています)

```plaintext
G:\UnrealEngine\UE_5.3\Engine\Build\BatchFiles\RunUAT.bat MyCommand -ScriptDir="<AutomationProjectDir>"
Running AutomationTool...
Using bundled DotNet SDK version: 6.0.302
Starting AutomationTool...
Parsing command line: MyCommand -ScriptDir=<AutomationProjectDir>
Initializing script modules...
Building 1 projects (see Log 'Engine/Programs/AutomationTool/Saved/Logs/Log.txt' for more details)
 Restore...
 Build...
Build projects time: 12.79 s
Total script module initialization time: 14.66 s.
Executing commands...
--- MyCommand ---
Hello, Automation Project!
-----------------
BUILD SUCCESSFUL
AutomationTool executed for 0h 0m 15s
AutomationTool exiting with ExitCode=0 (Success)
```

ビルドも一緒に行われるのでいろいろなログが出力されますが、後ろの方できちんと記述したコマンドのログが出力されていることが確認できます。


# プロジェクトの情報を出力するコマンドを作ってみる

さて、ここまでで Automation Project を作成し、コマンドを実行する方法を解説しました。
少し具体的なコマンドを作ってみましょう。ここでは、プロジェクトのモジュール情報を出力するコマンドを作成します。

```csharp
using AutomationTool;
using EpicGames.Core;
using Microsoft.Extensions.Logging;
using UnrealBuildTool;

// ヘルプを属性で定義できる
[Help("このコマンドは、プロジェクトのモジュール情報を表示します。")]
[Help("Project", ".uproject ファイルのパスを指定します。")]
public sealed class ProjectInformation : BuildCommand
{
	public override void ExecuteBuild()
	{
		// 引数をパース
		var Project = ParseParamValue("Project");

		var ProjectFile = new FileReference(Project);
		var Descriptor = ProjectDescriptor.FromFile(ProjectFile);

		// プロジェクト情報を表示
		Logger.LogInformation("Project: {ProjectFile}", ProjectFile);

		var ProjectName = ProjectFile.GetFileNameWithoutExtension();
		Logger.LogInformation("ProjectName: {ProjectName}", ProjectName);

		// プロジェクトのモジュール情報を表示
		foreach (var Module in Descriptor.Modules)
		{
			Logger.LogInformation("\tModule: {ModuleName}", Module.Name);
			Logger.LogInformation("\t\tType: {ModuleType}", Module.Type);
		}

		var ProjectPlugins = Plugins.ReadProjectPlugins(ProjectFile.Directory);

		foreach (var Plugin in ProjectPlugins)
		{
			PrintPlugin(Plugin);
		}
	}

	private void PrintPlugin(PluginInfo Plugin)
	{
		// プラグイン情報を表示
		Logger.LogInformation("\tPlugin: {PluginName}", Plugin.Name);
		Logger.LogInformation("\t\tType: {PluginType}", Plugin.Type);
		
		// プラグインのモジュール情報を表示
		foreach (var Module in Plugin.Descriptor.Modules)
		{
			Logger.LogInformation("\t\tModule: {ModuleName}", Module.Name);
			Logger.LogInformation("\t\t\tType: {ModuleType}", Module.Type);
		}
	}
}
```

これを手元のプロジェクトに対して実行してみると、以下のようになりました。

```powershell
<UnrealEngineRoot>\Engine\Build\BatchFiles\RunUAT.bat ProjectInformation -ScriptDir="<AutomationProjectDir>" -Project="<ProjectPath>"
```


```md
Project: <ProjectPath>
ProjectName: DIContainer
        Module: DIContainer
                Type: Runtime
        Plugin: UnrealInjects
                Type: Project
                Module: UnrealInjects
                        Type: Runtime
                Module: UnrealInjectsEditor
                        Type: Editor
                Module: UnrealInjectsResolver
                        Type: Runtime
```

きちんとプロジェクトのモジュール情報が読み取られ、プラグインも含めて表示されていることが確認できました。

コードを見るとわかるように、コマンドとして成立させるためのヘルプ属性や、引数のパース、ログの出力など、一通りの機能が揃っています。
また、プロジェクトのモジュール情報を取得するために、`ProjectDescriptor` や `Plugins` などのライブラリを使っています。これらは、エンジン内に含まれる C# ライブラリで、活用することで簡単に UE プロジェクトの情報にアクセスできます。

この他にも、UBT によるビルドを呼び出す処理などを中心に豊富なクラスが提供されているため、カスタムのビルドフローを組んだり、ログを送信したりすることも難しくはありません。

# まとめ
本稿では、Unreal Engine の Automation Project について解説しました。
Automation Project は C# で記述できる分、 BuildGraph や CI ツール固有のスクリプトを頑張るよりも直感的にコマンドを記述できますし、クロスプラットフォームに動作させることもができます。

本稿では実装例としては示しませんでしたが、プラグインの下に Automation Project を配置し、プラグイン内のコードから RunUAT を実行するようなことをすれば、エディタ上から実行できるビルド機能を拡張するプラグインなんてものも作成できるでしょう。

ランチャー版で利用できるようになったことで、より一層使いやすく、可能性が広がっています。ぜひ、自分のプロジェクトに Automation Project を追加してみてください。
