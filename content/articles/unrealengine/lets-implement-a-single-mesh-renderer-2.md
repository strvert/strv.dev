---
title: '単一Static Meshレンダラを独自メッシュパスで実装する...ための前提知識編'
description: 'アイテムの描画とか、一つだけのメッシュをレンダリングするのに便利なツールを実装してみる記事のその２。独自のメッシュパスを実装して単一パスの軽量なレンダラを書くのに必要なUnreal Engine の描画機能について解説する'
enforceCreatedAt: 2023/12/25
enforceUpdatedAt: 2023/12/25
tags:
    - Unreal Engine
    - Unreal C++
    - RHI
    - RDG
    - Advent Calendar
assets: '/article-assets/unrealengine/lets-implement-a-single-mesh-renderer-2'
advent_calendar:
    name: 'Unreal Engine (UE) Advent Calendar 2023'
    link: 'https://qiita.com/advent-calendar/2023/ue'
    day: 17
---

# Introduction

この記事は、昨日投稿した記事、『[単一 Static Meshレンダラを実装する (FPreviewScene編)](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer)』の続編です。
昨日の記事では、FPreviewScene という機能を利用し、裏に別の World / Scene を用意して、そちらでメッシュをレンダリングする実験をしました。

前回の手法には課題も多かったので、より単独メッシュのレンダリングに特化した独自のメッシュパスを追加することで、高速にメッシュ画像を得る記事を書こうと思いました。
しかし、その実装を説明するための前提知識が多いので、まずは前提知識編を書きます。UE がメッシュをレンダリングする機構についてまとめるので、よければ参考にしてください。

(これは UE アドカレ 2023 に12/25に投稿した記事です！　空いてた過去枠にタイムリープ投稿しています)

# 目次

## 検証環境

- UE 5.3
- Windows

## 対象読者

- 基礎的なグラフィックスプログラミングの知識がある
- UE のメッシュレンダリングに興味がある

# Shader はどうやって扱われるのか？
UE には、Shader のコードや、それが利用するパラメータのリフレクション情報などをまとめた `FShader` というクラスがあります。
このクラスの派生として、 `FGlobalShader` や `FMaterialShader` などがあります。

## FGlobalShader
UE でシェーダーを書くとき、最も利用するクラスだと思います。HLSL + C++ で完結する機能である場合にはとりあえずこれを使っておけば、VS, PS, CS はもちろん、GSなどのシェーダーも定義することができます。
定義のためには RDG のマクロを活用すると楽に扱うことが可能で、次のサンプルのようにパラメータやエントリポイントを設定することができます。
```cpp
class FBufferVisualizeShaderPS : public FGlobalShader
{
	DECLARE_GLOBAL_SHADER(FBufferVisualizeShaderPS);
	SHADER_USE_PARAMETER_STRUCT(FBufferVisualizeShaderPS, FGlobalShader);

	BEGIN_SHADER_PARAMETER_STRUCT(FParameters,)
		SHADER_PARAMETER_STRUCT_REF(FViewUniformShaderParameters, View)
		SHADER_PARAMETER_STRUCT(FScreenPassTextureViewportParameters, OutputViewport)
		SHADER_PARAMETER_STRUCT_INCLUDE(FSceneTextureShaderParameters, SceneTextures)
		SHADER_PARAMETER_SAMPLER(SamplerState, Sampler)
		RENDER_TARGET_BINDING_SLOTS()
	END_SHADER_PARAMETER_STRUCT()
};

IMPLEMENT_GLOBAL_SHADER(FBufferVisualizeShaderPS, "/StaticMeshRendererShaders/Private/BufferVisualizeShader.usf",
                        "MainPS", SF_Pixel);

```

BEGIN_SHADER_PARAMTER_STRUCT() などのマクロを使うと、その場にパラメータの構造体が宣言されます。単に構造体ができるだけではなく、変数名のリフレクションやメモリレイアウトの最適化なども行ってくれます。
ここで収集された名前はシェーダー内で値にアクセスするときのパラメータ名にもなるので、従来手動で行っていたバインド処理などを行わなくてよくなっています。

## FMaterialShader
これも `FShader` の派生です。様々なシェーダータイプに対応している点は `FGlobalShader` と同様ですが、こちらは Material で記述されたノードグラフと組み合わせて使うためのベースクラスです。
UE の Material は、ノードベースでシェーダーを書けるようにした機能です。背後では、Material が生成した HLSL コードを、 `FMaterialShader` で実装されたシェーダーが利用する形でレンダリングに使用されています。
`FMaterialShader` には、その組み合わせ部分をサポートするためのユーティリティが実装されています。

## FMeshMaterialShader
`FMaterialShader` を更に派生したクラスで、マテリアルを使いつつメッシュを描画することを目的とした機能が実装されています。 
UE には、レンダリング処理にメッシュ情報を渡すための処理を行う `FVertexFactory` というクラスがあります。 `FMeshMaterialShader` は、 `FVertexFactory` が提供する頂点バッファ情報やレイアウト情報をシェーダーのパラメータとしてバインディングすることができます。

# シェーダーのコンパイル設定
`FShader` の派生を実装するとき、そのシェーダーのコンパイル設定を行いたいことがあります。たとえば、.ush / .ush 内のマクロの定義を変更したいとか、 コンパイル結果の検証を追加したいとかです。
そのような場合には、 `FShader` の以下の static メンバ関数をオーバーライドすることができます。

```cpp title=Shader.h
/** サブクラスでオーバーライドして、コンパイルが行われる直前にコンパイル環境を変更することができる。 */
static void ModifyCompilationEnvironment(const FShaderPermutationParameters&, FShaderCompilerEnvironment&) {}

/** サブクラスでオーバーライドして、特定の並べ替えがコンパイルされるべきかどうかを決定することができる。 */
static bool ShouldCompilePermutation(const FShaderPermutationParameters&) { return true; }

/** コンパイル結果が有効かどうかを判断するために、サブクラスでオーバーライドすることができる。 */
static bool ValidateCompiledResult(EShaderPlatform InPlatform, const FShaderParameterMap& InParameterMap, TArray<FString>& OutError) { return true; }
```

たとえば、 FGlobalShader を継承している場合に `ModifyCompilationEnvironment` をオーバーライドするとしたら、次のようになります。

```cpp
static void ModifyCompilationEnvironment(const FGlobalShaderPermutationParameters& Parameters, FShaderCompilerEnvironment& OutEnvironment)
{
	// 親の実装も呼んであげる(任意)
	FGlobalShader::ModifyCompilationEnvironment(Parameters, OutEnvironment);

	// Define を追加
	OutEnvironment.SetDefine(TEXT("SUPPORTS_ANISOTROPIC_MATERIALS"), 0);
}
```

また、`ShouldCompilePermutaion` はかなり重要です。この関数の挙動によって、生成されるシェーダーの数に大きな影響が出る可能性があります。
そもそも、Shader Permutation とは、シェーダー実装が適用対象、機能、プラットフォーム、ライトなど様々な使用方法で動作できるように、用途の組み合わせごとに微妙に異なるシェーダーを生成する仕組みのことです。
UE のシェーダーには多数のマクロが利用されており、利用方法に合わせてマクロの値がスイッチするようになっています。これを知らずに運用すると、組み合わせ爆発によって膨大な数のシェーダーをコンパイルしてパッケージに含めることになってしまうこともあります。

`ShouldCompilePermutaion` には、そのシェーダーのコンパイルが特定の条件下で必要かどうかを判定する実装を追加できます。以下は FMeshMaterialShader を継承しているときの実装例です。

```cpp
static bool ShouldCompilePermutation(const FMeshMaterialShaderPermutationParameters& Parameters)
{
	static FName NAME_LocalVertexFactory(TEXT("FLocalVertexFactory"));
	return (Parameters.MaterialParameters.MaterialDomain == MD_Surface) &&
		Parameters.VertexFactoryType == FindVertexFactoryType(NAME_LocalVertexFactory);
}
```
この例では、利用している Vertex Factory(後述) が `FLocalVertexFactory` で、利用しようとしているマテリアルにドメインが `Surface` であるときにだけコンパイルされるべきであるとしています。
これを設定しないと、本来利用しない or 利用できない使用方法に対しても無駄にシェーダー生成の組み合わせを増やしてしまうおそれがあります。




# 頂点データの受け渡し
VertexFactory は、Vertex Shader が必要とする頂点データのリソースを提供してくれるもので、C++ / HLSL の両方で提供されます。
Vertex Shader で行う処理はメッシュタイプによって違うので、 VertexFactory もメッシュにあわせて種類があります。
たとえば、
- StaticMesh
  - FLocalVertexShader
- SkeletalMesh
  - FGpuSkinVertexFactory
 
などです。これらは C++ クラスですが、次のようにして .ush と実装と関連付けることで、VertexShader への入力を定義します。

```cpp title=LocalVertexFactoryの例
// C++ 側実装
class FLocalVertexFactory : public FVertexFactory
{
	DECLARE_VERTEX_FACTORY_TYPE_API(FLocalVertexFactory, ENGINE_API);
	// 略
};

// .ush の関連付けを定義
IMPLEMENT_VERTEX_FACTORY_TYPE(FLocalVertexFactory,"/Engine/Private/LocalVertexFactory.ush",
	  EVertexFactoryFlags::UsedWithMaterials
	| EVertexFactoryFlags::SupportsStaticLighting
	| EVertexFactoryFlags::SupportsDynamicLighting
	| EVertexFactoryFlags::SupportsPrecisePrevWorldPos
	| EVertexFactoryFlags::SupportsPositionOnly
	| EVertexFactoryFlags::SupportsCachingMeshDrawCommands
	| EVertexFactoryFlags::SupportsPrimitiveIdStream
	| EVertexFactoryFlags::SupportsRayTracing
	| EVertexFactoryFlags::SupportsRayTracingDynamicGeometry
	| EVertexFactoryFlags::SupportsLightmapBaking
	| EVertexFactoryFlags::SupportsManualVertexFetch
	| EVertexFactoryFlags::SupportsPSOPrecaching
	| EVertexFactoryFlags::SupportsGPUSkinPassThrough
	| EVertexFactoryFlags::SupportsLumenMeshCards
);
```

すると、VertexShader で処理中のメッシュタイプに合わせた Vertex Factory の値を `FVertexFactoryInput` パラメータとして利用できるようになります。

```hlsl title=VSでの入力例
// この include で、自動的に VS が適用されているメッシュの VertexFactory が選択的に include される。
#include "/Engine/Generated/VertexFactory.ush"

// FVertexFactoryInput の中身が利用している VertexFactory の定義になる
void MainVS(FVertexFactoryInput Input, out float4 Position: SV_POSITION)
{
	// 略
}
```

VertexFactory のシェーダを書くときにはいくつかの「お約束」があり、ファクトリが提供すべき型の名前(`FVertexFactoryInput`や`FVertexFactoryIntermediates`)や、関数の名前があります。
名前が揃えられていることで、シェーダーに include させる VertexFactory シェーダーの切り替えで頂点データの取得処理を変化させることができるのです。そして、切り替えはUEのシェーダーシステムが自動的に行なってくれます。
これにより、様々なメッシュタイプごとに VertexShader を書かなくても、VertexFactory によって抽象化されたあとの頂点データへの処理だけを考えればよくなっているのです。

# グラフィックス命令の発行
シェーダーの定義方法を説明しましたが、それを使った命令の発行と実行を知らなければ描画を実行できません。
現在 (UE5.3) のバージョンでは、 RDG (Rendering Dependency Graph) という機能があり、これを使うと便利に描画リソース管理や描画命令発行ができます。

## RDG を使った描画命令発行のボイラープレート
RDG を使った描画機能の実装は、以下のボイラープレートから開始することができます。

```cpp
void UTinyRenderer::Render()
{
	// Render() が GameThread で呼ばれる
	// -------
	// ENQUEUE_RENDER_COMMAND マクロはラムダ式を RenderThread の実行キューに追加する
	ENQUEUE_RENDER_COMMAND(FStaticMeshRenderCommand)(
		[](FRHICommandListImmediate& RHICmdList) mutable
		{
			// RenderThread で実行される。RHICmdList から GraphBuilder を作成する。
			FRDGBuilder GraphBuilder(RHICmdList,
			                         RDG_EVENT_NAME("StaticMeshRender"),
			                         ERDGBuilderFlags::AllowParallelExecute);

			// ここでGraphBuilder を使って描画命令の発行(パスの追加とか)を行う

			// ↓ でBuilderが命令の発行を行う 
			GraphBuilder.Execute();
		});
}
```
レンダースレッド実行時に渡されてくる RHICmdList とは、RHI (Rendering Hardware Interface) のコマンドバッファです。RHI はグラフィックス機能の抽象化レイヤで、ハードウェアやプラットフォームの差異をUEが吸収してくれているものです。

RHI コマンドを RHICmdList に追加することで、描画処理を構築することができるのですが、RDG を使う場合は直接触れる機会が少し減ります。それは、RHI コマンドの構築は RDGBuilder が内部で行ってくれるからです。 RDGBuilder が提供する API を使って描画処理を記述すると、内部で処理のマージや並び替え、リソース管理命令の自動追加などを行った上で(DAGで実装されている)、適切なコマンドリストを生成してくれるのです。

## RDG によるリソースの取り扱い

### リソースの作成
例として、いくつかのリソースを RDG で作成してみます。

```cpp
// テクスチャの作成
const FRDGTextureDesc Desc = FRDGTextureDesc::Create2D(RectSizeXY, PF_DepthStencil,
														FClearValueBinding::DepthFar, TexCreate_DepthStencilTargetable | TexCreate_ShaderResource);
const FRDGTextureRef SceneDepth = GraphBuilder.CreateTexture(Desc, TEXT("SceneDepthZ"));


// バッファリソースとSRVの作成
TArray<FVector4f> InstanceSceneDataSOA = /* データを書き込み */;
const FRDGBufferRef RDGInstanceSceneDataBuffer = CreateStructuredBuffer(GraphBuilder,
		TEXT("InstanceSceneDataBuffer"), InstanceSceneDataSOA);
GPUScene.GPUSceneInstanceSceneData = GraphBuilder.CreateSRV(RDGInstanceSceneDataBuffer);


// RDG マクロで定義したシェーダパラメータの作成
FTinyRendererShaderParameters* PassParameters = GraphBuilder.AllocParameters<FTinyRendererShaderParameters>();
```
注意しなければいけないのは、**RDG が管理するリソースが本当に確保されることが保証されるのは後述する RDG Pass の間だけである**ということです。上記の方法で作成したリソースは、宣言のようなものであり、実際の確保と開放は RDG が利用パスを検出して自動管理します。

### RDG 外部とのリソースのやりとり
もちろん、RDG 以外で確保されたリソースとの連携も可能です。

```cpp
// 外部のテクスチャリソースを RDG リソースとして登録する
const FRenderTarget* RenderTarget = ViewFamily.RenderTarget;
const FRDGTextureRef TinyRendererOutputRef = GraphBuilder.RegisterExternalTexture(
	CreateRenderTarget(RenderTarget->GetRenderTargetTexture(), TEXT("TinyRendererOutput")));

// RDG 内部のテクスチャリソースを取り出す
TRefCountPtr<IPooledRenderTarget> OutTexture;
GraphBuilder.QueueTextureExtraction(RDGResource, &OuteTexture);
```

外部のリソースはRDGに渡しても、そのまま外部で寿命を管理する必要があります。RDG から取り出したリソースは、スマートポインタとして取得されるので、スマートポインタの寿命が尽きるまでGPUリソースの寿命が延長され、RDGのスコープを考える必要はありません。
1パスで処理を行う場合にはあまり使いませんが、ヒストリを利用したり、外部のRenderTagetに書き出したい場合などに便利です。

## 基本的なパスの追加
RDG を使ってパスを追加するときには、`GraphBuilder::AddPass()` を使うことができます。

```cpp
FTinyRendererShaderParameters* PassParameters = GraphBuilder.AllocParameters<FTinyRendererShaderParameters>();

GraphBuilder.AddPass(
			RDG_EVENT_NAME("MyPixelShaderPass", ViewRect.Width(), ViewRect.Height()),
			PassParameters,
			ERDGPassFlags::Raster | ERDGPassFlags::NeverCull,
			[ResourceOne, ResourceTwo, ...](FRHICommandList& RHICmdList)
{
	// RHICmdList を操作して、レンダリングパス処理を追加する
});
```

AddPass にわたすラムダ式は、呼び出し時に RHICmdList が渡されてくるので、ここでは従来どおりRHICmdListを操作して描画処理を記述します。
もちろん、RHICmdListを操作できるので従来どおり(RDG以前)の操作が自由にかけてしまうのですが、それは RDG Pass の意図ではありません。

RDG Pass では、引数に渡したパスパラメータに含まれる RDG リソースを検出し、GPUリソースの実体の確保を行ってくれます。そのため、**AddPass のラムダの中ではパラメータのリソースを利用した処理を書くこと**が望まれます。逆に、本来パスに不要なパラメータを大量に渡してしまったりすると、本来必要ないリソースをパスのために RDG が確保してしまうリスクがあるので注意が必要です。

## 目的別のRDGパス追加ユーティリティ
`GraphBuilder::AddPass()` はプリミティブなパス追加機能ですが、頻用の目的に対しては RDG がユーティリティ関数を用意しています。
いくつかの関数の定義を紹介します。

```cpp
// テクスチャをコピーするパスを追加
void AddCopyTexturePass(FRDGBuilder& GraphBuilder,
					FRDGTextureRef InputTexture,
					FRDGTextureRef OutputTexture,
					const FRHICopyTextureInfo& CopyInfo);


// スクリーンパス(指定したViewport全体を処理するパス)を追加する。Pixel Shader 画像を処理するのに便利。
template <typename PixelShaderType>
void AddDrawScreenPass(FRDGBuilder& GraphBuilder,
					FRDGEventName&& PassName,
					const FSceneView& View,
					const FScreenPassTextureViewport& OutputViewport,
					const FScreenPassTextureViewport& InputViewport,
					const TShaderRef<PixelShaderType>& PixelShader,
					typename PixelShaderType::FParameters* PixelShaderParameters,
					EScreenPassDrawFlags Flags = EScreenPassDrawFlags::None)


// メッシュパス(メッシュを処理するパス)を追加する。AddMeshBatchesCallback にメッシュ追加を行うコールバックを渡す。
template <typename PassParametersType, typename AddMeshBatchesCallbackLambdaType>
void AddSimpleMeshPass(FRDGBuilder& GraphBuilder,
					PassParametersType* PassParameters,
					const FScene* Scene,
					const FSceneView& View,
					FInstanceCullingManager *InstanceCullingManager,
					FRDGEventName&& PassName,
					const FIntRect& ViewPortRect,
					AddMeshBatchesCallbackLambdaType AddMeshBatchesCallback)


// ComputeShader のパスを追加する。
template <typename TShaderClass>
inline FRDGPassRef FComputeShaderUtils::AddPass(FRDGBuilder& GraphBuilder,
					FRDGEventName&& PassName,
					const TShaderRef<TShaderClass>& ComputeShader,
					typename TShaderClass::FParameters* Parameters,
					FIntVector GroupCount);
```

RDG では、繰り返し利用するパターンは積極的にユーティリティ化することが推奨されています。パス追加以外の部分にも豊富なユーティリティが内蔵されているので、一度 `RenderGraphUtils.h`, `ScreenPass.h`, `SimpleMeshDrawCommandPass.h` などは眺めておくとよいでしょう。 

# メッシュレンダリング
ここまで、シェーダーや描画命令の発行方法を見てきました。いよいよメッシュ表現とそれが描画に投入される流れについて見ていきます。

## FPrimitiveSceneProxy
これはゲームスレッドの UPrimitiveComponent のミラーデータで、レンダースレッドで利用される「シーンに配置されて描画可能なもの」を表すオブジェクトです。
Component のタイプごとに存在し、SceneRenderer の要求を受けてメッシュデータをレンダラに提供したりしてくれます。UStaticMeshComponent / FStaticMeshSceneProxy などデータソースとしてメッシュアセットを持つものは、メッシュアセットをソースとしてデータを提供することになります。

UPrimitiveComponent には `CreateSceneProxy()` という仮想関数が定義されており、描画可能なコンポーネントを実装するときにはこれを実装する必要があります。

```cpp
FPrimitiveSceneProxy* PrimitiveSceneProxy = PrimitiveComponent->CreateSceneProxy();
```

## FMeshBatch
FPrimitiveSceneProxy から取得されるメッシュデータのバッチです。内部に頂点データやマテリアル、利用すべき VertexFactory など、メッシュのレンダリングに必要なすべての情報を含んでいます。

## FMeshPassProcessor
メッシュ描画を扱うパスを定義するクラスです。派生クラスを定義し、MeshBatch, シェーダー, マテリアル取得などのセットアップを記述すると、FMeshDrawCommand というメッシュ描画用の命令を構築してくれます。
FMeshDrawCommand はあとの段階で更に RHICommand に変換され、レンダリングが実行されます。

動的パスを簡易に実行するだけならば、前述の `AddSimpleMeshPass()` と組み合わせることで簡単にメッシュ描画パスを実行できます。
以下はエンジン内の例です。

```cpp title=DepthRendering.cpp
AddSimpleMeshPass(GraphBuilder, PassParameters, Scene, View, &InstanceCullingManager, RDG_EVENT_NAME("ViewMeshElementsPass"), View.ViewRect,
	[&View, Scene, DrawRenderState, &MeshElements, bRespectUseAsOccluderFlag, DepthDrawingMode](FDynamicPassMeshDrawListContext* DynamicMeshPassContext)
	{
		FDepthPassMeshProcessor PassMeshProcessor(
			EMeshPass::DepthPass,
			View.Family->Scene->GetRenderScene(),
			View.GetFeatureLevel(),
			&View,
			DrawRenderState,
			bRespectUseAsOccluderFlag,
			DepthDrawingMode,
			false,
			false,
			DynamicMeshPassContext);

		const uint64 DefaultBatchElementMask = ~0ull;

		for (const FMeshBatch& MeshBatch : MeshElements)
		{
			PassMeshProcessor.AddMeshBatch(MeshBatch, DefaultBatchElementMask, nullptr);
		}
	}
);
```

FDepthMeshPassProcessor は FMeshPassProcessor の派生です。ここでは `AddSimpleMeshPass()` の中で、MeshBatchを `AddMeshBatch()` することで描画コマンドを RHICommandList に追加しています。
コード上に RHICommandList は直接見えませんが、 `DynamicMeshPassContext` の中にコンテキストのコマンドリストが保持されており、 FMeshPassProcessor がコマンドを追加してくれます。

# マテリアルとシェーダー、レンダースレッド表現
ご存知の通り、マテリアルアセットは、ノードベースに GPU で実行されるグラフィックス処理を記述できる機能です。
当然ですが、 GPU にマテリアルノードを処理する機能は無いので、マテリアルから HLSL コードを生成しています。つまり、マテリアルは単なるグラフィカルなシェーダー言語であるということです。

## HLSL への変換
詳しくは述べませんが、 `FHLSLMaterialTranslator` というクラスが変換を担っています。仕組みとしては、マテリアルのノードから多数の HLSL のコード片を組み立て、 `MaterialTemplate.ush` というテンプレートファイルに当てはめることでマテリアルのシェーダーを生成しています。

ただし、 `MaterialHLSLEmitter` という新しい HLSL 生成パイプラインの実装も始まっており、将来的には `FHLSLMaterialTranslator` は非推奨のレガシーになるかもしれません。
(大量の %s や %d を埋めていくテンプレート方式は正気でないと思っていたので納得ではあります)

## UMaterial / UMaterialInstance
これらは普段エディタで操作しているマテリアルアセットを表現しているクラスです。ユーザーに近いクラスで、マテリアルの編集データ及び生成済みのバイナリなどを保持します。
UMaterial / UMaterialInstance は継承関係にありませんが、どちらも UMaterialInterface というインターフェースを実装しています。　
ゲームスレッドで利用されます。

## FMaterialRenderProxy
マテリアルのレンダースレッド表現です。マテリアルパラメータを取得する機能などを実装しています。

## FMaterial / FMaterialResource
こちらもマテリアルのレンダースレッド表現で、マテリアルの多くの設定やシェーダーマップを保持しています。
FMaterialRenderProxy との違いがわかりにくいですが、コンポーネントとメッシュアセットの関係に近いです。メッシュアセットはメッシュデータを持ちますが、どこにどのように配置されるかはコンポーネントがデータを保持、決定します。
同様に、FMaterial / FMaterialResource はマテリアルの基本情報をすべて持っていますが、どのようなパラメータを与えて描画に利用されるかは FMaterialRenderProxy が決定します。

# マテリアルをシェーダーで利用する

FMaterialShader の派生として実装したシェーダーであれば、その内部でマテリアルが生成したシェーダーの結果にアクセスすることができます。
つまり、FMaterialShader のシェーダーとマテリアルの生成したシェーダーとコンパイル時に組み合わせて、新たなシェーダーデータを生成しているということです。
これは、次のように書くことで実現できます。

```cpp
// 必要データ
const FMaterial& MaterialResource = /* */;
const FMaterialRenderProxy& MaterialRenderProxy = /* */;
const FVertexFactory* VertexFactory = /* */;

// HLSL で実装した FMeshMaterialShader の派生シェーダー含んだ ShaderTypes を作成
FMaterialShaderTypes ShaderTypes;
ShaderTypes.AddShaderType<FMyMaterialShaderVS>();
ShaderTypes.AddShaderType<FMyMaterialShaderPS>();

// ShaderTypes と VertexFactoryType をもとに、MaterialResource から実際に利用するシェーダーを取得
FMaterialShaders Shaders;
const FVertexFactoryType* VertexFactoryType = VertexFactory->GetType();
if (!MaterialResource.TryGetShaders(ShaderTypes, VertexFactoryType, Shaders))
{
	// 無効な組み合わせだったり、コンパイルが終わっていなかったりすると失敗する
	return;
}

TShaderRef<FMyMaterialShaderVS> VertexShader;
TShaderRef<FMyMaterialShaderPS> PixelShader;

// シェーダーを取り出す
Shaders.TryGetVertexShader(VertexShader);
Shaders.TryGetPixelShader(PixelShader);

// 以降でマテリアル + FMeshMaterialShader のシェーダーを利用できるようになる
```

マテリアルを使ったシェーダーはエンジン改造なしでは書けないと思われることも多い気がするのですが、このようにすればマテリアルの生成したロジックを活用したグラフィック機能をプラグインなどで実装することも可能なのです。

# まとめ
この記事では、マテリアルをサポートした独自のメッシュパスを追加するために必要な前提知識を整理しました。ここに書いてある内容は、すべてプロジェクトやプラグインから利用可能なものです。
次回はいよいよ、単一メッシュレンダラの実装を行います。12月中に出せたらいいな！