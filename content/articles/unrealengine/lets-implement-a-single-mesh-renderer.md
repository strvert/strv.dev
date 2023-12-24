---
title: '単一 Static Meshレンダラを実装する (FPreviewScene編)'
description: 'アイテムの描画とか、一つだけのメッシュをレンダリングするのに便利なツールを実装してみる記事'
enforceCreatedAt: 2023/12/24
enforceUpdatedAt: 2023/12/24
tags:
    - Unreal Engine
    - Unreal C++
    - RHI
    - RDG
    - Advent Calendar
assets: '/article-assets/unrealengine/lets-implement-a-single-mesh-renderer'
advent_calendar:
    name: 'Unreal Engine (UE) Advent Calendar 2023'
    link: 'https://qiita.com/advent-calendar/2023/ue'
    day: 24
---

# Introduction

Unreal Engine の売りの一つは広大なワールドを扱うことができるシステムや、それをリアルタイムにレンダリングする高度なグラフィックス機能です。しかし、常にそこまで高度なワールドシステムやレンダラが必要なわけではありません。
たとえば、ゲームインベントリ画面でアイテムのメッシュをUI上に表示したい！みたいな需要はしばしばあるでしょう。

この記事は、単一メッシュを描画するのに特化した描画をUEで実装してみる実験記録です。

![](#/top.png)


# 目次

## 検証環境

- UE 5.3
- Windows

## 対象読者

- Unreal C++ がある程度読める
- 原理に興味がある

# 本題の前に: 一般的な解決策(SceneCapture2D)とその問題 
UI の上などにメッシュを描画したいときの一般的(？)な解決策は、 **SceneCapture2D** を利用することです。この手法については多くの情報があるため、説明はそちらに委ねます。
- [[UE4]アルファ付きキャプチャー画像の簡単作成](https://historia.co.jp/archives/13380/) - 株式会社ヒストリア様
- [UE5 で Render Target と SceneCapture(Component)2D で背景透過でメッシュをキャプチャする](https://you1dan.hatenablog.com/entry/2022/09/09/113633) - You are done! 様

この方法は大変簡便ですが、以下のような課題点があります。

### ゲームと同じワールドでキャプチャしなければならない
SceneCapture2D をアクティブにするためには、配置したワールドと同じワールドにプレイヤーが存在しなければなりません。

すると必然、地面の下など見えない場所に SceneCapture2D 用の撮影場所を用意してあげる必要が出てきます。ワールドのライティングやポストプロセスの影響を受けないように箱で囲ったり、ボリュームを設定したりなど、地味に面倒なセットアップが必要です。

また、多数のレベルを持つゲームの場合には、すべてのレベルに撮影場所を配置してあげないとメッシュがレンダリングできず、煩雑です。

### すぐに最適化の限界にぶち当たる
SceneCapture2D を利用した状態は、通常の画面の他にもう一つ画面がある状態となります。単一メッシュを簡単に描画するだけなら、そこにかける処理コストは可能な限り削りたいでしょう。
しかし当然ながら、SceneCapture2D で制御できるレンダリング機能は設定に表示されているものだけであり、最適化するにも限界があります。

### アルファ抜きもハイコスト
背景は不要な場合もあるので、SceneDepth や CustomStencil を使って背景を除去する必要があります。そのためにパスが増えてしまうと、さらなるコストが嵩んでいきます。

# UE のレンダリングの登場人物を理解する
後の実装法を理解するために、レンダリングの仕組みについて簡単に触れておきます。

また、以前作成した以下の資料の情報を踏まえるとより理解しやすくなると思います。

<script async class="docswell-embed" src="https://www.docswell.com/assets/libs/docswell-embed/docswell-embed.min.js" data-src="https://www.docswell.com/slide/K38NEM/embed" data-aspect="0.5625"></script><div class="docswell-link"></div>

<br>

## UWorld / FScene
UWorld とは、AActor が配置されたり、マルチプレイが実行されたりする、UE のゲームロジックの進行を取りまとめるシーン表現オブジェクトです。「UWorld ← ULevel ← AActor ← UComponent」の関係性があり、ゲームスレッド側の処理に必要な全情報が含まれます。

FScene とは、レンダースレッド用のシーン表現オブジェクトです。FScene には描画すべきプリミティブ、ライト、デカールなどの情報が格納されます。FScene の情報は UWorld の変更に追従する形で更新されていきます。

このように、ゲーム処理用とレンダリング処理用で個別のシーン表現を持っていることを理解する必要があります。

## FSceneView
FSceneView は、FScene 内部での視点を定義するオブジェクトです。シーン内での位置のほか、投影方法、ポストプロセス設定、利用するレンダリング機能のレベルなどを保持します。

普段利用する UE の機能でいうと、Camera に近いと言えるでしょう。

## FSceneViewFamily
FSceneViewFamily は、 FScene や FSceneView などのオブジェクトを保持して取りまとめるオブジェクトです。FSceneViewFamily が保持する FScene は 1 つですが、FSceneView は1つ以上含むことができます。
その Family 内のオブジェクトによるレンダリング全体に影響する描画設定なども含んでいます。

### FSceneViewFamilyContext
FSceneViewFamily の派生クラスで、スコープベースで FSceneView リソースを管理する機能を持っています。
視点を追加するとき、 FSceneView の生ポインタを FSceneViewFamily に渡しますが、使い終わったタイミングで自分で片付ける必要があります。
スコープで寿命が区切れる場合には、 FSceneViewFamilyContext を使っておくと、渡した FSceneView の管理を移譲できるので便利です。

## FSceneRenderer
レンダラ実装の本体です。毎フレームこのインスタンスが生成/破棄されます。
FSceneViewFamily を受け取って、Family が含む Scene を、各 View について描画します。
派生クラスとして以下のクラスがあり、モバイルプラットフォームとそれ以外とで切り替わるようになっています。

- `FDeferredShadingSceneRenderer`
- `FMobileSceneRenderer`

これらのクラスの命名は致命的に誤解を招きやすいものであることに注意してください。 `FDeferredShadingSceneRenderer` はディファードレンダラだけでなく、フォワードレンダラも実装しています。
また、`FMobileSceneRenderer` も同様に、ディファード/フォワードの両方を実装しています。


# 独自の専用シーンを用意できないか？
さて、前節で UE のレンダリングの登場人物を紹介しました。

通常、UE 製のゲームは World も Scene も同時に1つしか持ちません。しかし、これは制約ではなく、自分で用意すれば同時に複数の World や Scene を運用することができます。
独自にそれらが用意できれば、 SceneCapture2D の課題として挙げられたワールドが同一であるという問題が解決します。

## FPreviewScene
ゼロから用意することもできるのですが、FPreviewScene クラスを利用すると簡単に World と Scene を用意することができます。

実は、FPreviewScene クラスはいつもお世話になっているもので、アセットのサムネイルや、Unreal Editor 上のアセット編集画面などの Viewport をレンダリングするのに利用されています。

![](#/fpreviewscene.png)

名前や用途からして Editor 専用機能のように思えますが、 Game でも使うことが可能で、World と Scene の初期化や管理をカプセル化したクラスとして活用できます。

# FPreviewScene を使ったレンダリングを実装してみる
BP から簡単に利用できるように、次のようなクラスを宣言します。

```cpp title=StaticMeshRenderer.h
UCLASS(BlueprintType)
class RENDERINGPRACTICE_API UStaticMeshRenderer : public UObject
{
	GENERATED_BODY()

public:
	/**
	 * @brief StaticMeshRendererを作成する
	 */
	UFUNCTION(BlueprintCallable, Category = "Static Mesh Renderer", meta = (AutoCreateRefTerm = "BackgroundColor"))
	static UStaticMeshRenderer* CreateStaticMeshRenderer(UTextureRenderTarget2D* RenderTarget, const FLinearColor& BackgroundColor);

	/**
	 * @brief StaticMeshとそのTransformを設定する
	 */
	UFUNCTION(BlueprintCallable, Category = "Static Mesh Renderer")
	void SetStaticMesh(UStaticMesh* InStaticMesh, const FTransform& InTransform);

	/**
	 * @brief StaticMeshを1フレームだけ描画する。
	 */
	UFUNCTION(BlueprintCallable, Category = "Static Mesh Renderer")
	void Render();

	/**
	 * @brief 描画するカメラの情報
	 */
	UPROPERTY(BlueprintReadWrite, Category = "Static Mesh Renderer")
	FMinimalViewInfo ViewInfo;

private:
	/**
	 * @brief 描画に使用するWorldとSceneを保持するFPreviewScene
	 */
	TUniquePtr<FPreviewScene> RenderScene;
	
	/**
	 * @brief 描画先のRenderTarget
	 */
	UPROPERTY()
	TObjectPtr<UTextureRenderTarget2D> RenderTarget;

	/**
	 * @brief 描画するStaticMesh
	 */
	UPROPERTY()
	TObjectPtr<UStaticMeshComponent> StaticMeshComponent;

	/**
	 * @brief 背景色
	 */
	FLinearColor BackgroundColor;
};
```

それぞれの関数の実装を紹介しつつ説明します。

### CreateStaticMeshRenderer
単一メッシュレンダラのインスタンスを作成します。 FPreviewScene の初期化もここで行います。
また、描画先の RenderTarget もセットできるようにしておきます。

```cpp
UStaticMeshRenderer* UStaticMeshRenderer::CreateStaticMeshRenderer(UTextureRenderTarget2D* RenderTarget,
                                                                   const FLinearColor& BackgroundColor)
{
	UStaticMeshRenderer* StaticMeshRenderer = NewObject<UStaticMeshRenderer>(GetTransientPackage(), NAME_None, RF_Transient);
	StaticMeshRenderer->RenderScene = MakeUnique<FPreviewScene>(FPreviewScene::ConstructionValues()
	                                                            .SetEditor(false)
	                                                            .SetLightRotation(FRotator(304.736, 39.84, 0))
	                                                            .SetSkyBrightness(1.69f)
	                                                            .SetCreatePhysicsScene(false)
	                                                            .SetTransactional(false));
	StaticMeshRenderer->RenderTarget = RenderTarget;
	StaticMeshRenderer->BackgroundColor = BackgroundColor;

	return StaticMeshRenderer;
}
```

重要なのは、 FPreviewScene の構築パラメータに `.SetEditor(false)` を渡すことです。こうすることで、Game時でも動作する World と Scene を内部で構築してくれます。
ライトの設定なども行うことができるので、実現したい見た目に対して調整すると良いでしょう。BP にパラメータとして公開してもいいかもしれません。

### SetStaticMesh
描画する StaticMesh をセットします。World に直接 StaticMesh は追加できないので、StaticMeshComponent を作成して Mesh をセットしてから追加します。

```cpp
void UStaticMeshRenderer::SetStaticMesh(UStaticMesh* InStaticMesh, const FTransform& InTransform)
{
	if (!StaticMeshComponent)
	{
		StaticMeshComponent = NewObject<UStaticMeshComponent>(RenderScene->GetWorld());
		RenderScene->AddComponent(StaticMeshComponent, FTransform::Identity);
	}
	StaticMeshComponent->SetStaticMesh(InStaticMesh);
	StaticMeshComponent->SetRelativeTransform(InTransform);
	RenderScene->GetScene()->UpdateStaticDrawLists();
}
```

### Render
レンダリングを実行します。

```cpp
void UStaticMeshRenderer::Render()
{
	if (!StaticMeshComponent || !RenderTarget)
	{
		UE_LOG(LogTemp, Warning, TEXT("UStaticMeshRenderBP::RenderStaticMesh: Invalid parameters"));
		return;
	}

	FTextureRenderTargetResource* RenderTargetResource = RenderTarget->GameThread_GetRenderTargetResource();

	FSceneViewFamilyContext ViewFamily(FSceneViewFamily::ConstructionValues(
		RenderTargetResource, RenderScene->GetScene(), FEngineShowFlags(ESFIM_Game)));
  ViewFamily.EngineShowFlags.AntiAliasing = false;
	ViewFamily.EngineShowFlags.ScreenPercentage = false;
	ViewFamily.SetScreenPercentageInterface(new FLegacyScreenPercentageDriver(ViewFamily, 1.0f));

	const FIntRect ViewRect(0, 0, RenderTarget->SizeX, RenderTarget->SizeY);
	FSceneViewInitOptions ViewInitOptions;
	ViewInitOptions.SetViewRectangle(ViewRect);
	ViewInitOptions.ViewFamily = &ViewFamily;
	ViewInitOptions.ViewOrigin = ViewInfo.Location;
	ViewInitOptions.ViewRotationMatrix = FInverseRotationMatrix(ViewInfo.Rotation) * FMatrix(
		FPlane(0, 0, 1, 0),
		FPlane(1, 0, 0, 0),
		FPlane(0, 1, 0, 0),
		FPlane(0, 0, 0, 1));
	ViewInitOptions.FOV = ViewInfo.FOV;
	ViewInitOptions.DesiredFOV = ViewInfo.FOV;
	ViewInitOptions.BackgroundColor = BackgroundColor;
	FMinimalViewInfo::CalculateProjectionMatrixGivenViewRectangle(ViewInfo,
	                                                              AspectRatio_MaintainYFOV,
	                                                              ViewRect,
	                                                              ViewInitOptions);

	ViewFamily.Views.Add(new FSceneView(ViewInitOptions));
	FCanvas Canvas(RenderTargetResource,
	               nullptr,
	               RenderScene->GetWorld(),
	               RenderScene->GetWorld()->GetFeatureLevel(),
	               FCanvas::CDM_DeferDrawing);
	GetRendererModule().BeginRenderingViewFamily(&Canvas, &ViewFamily);
}
```
※ このコードでは省いていますが、実際には不要なポストプロセスやパスを切る設定を入れることができます

RenderTarget から取得した RHIリソース、カメラ設定から構築した FSceneView などを使って FSceneViewFamily を用意します。
それらを `GetRendererModule().BeginRenderingViewFamily()` に渡すと、内部でプラットフォームに適した `FSceneRenderer` を構築してレンダリングを実行してくれます。

思ったよりずっと簡単なのではないでしょうか？

## 一旦使ってみる
以下のBPグラフは、描画先の RenderTarget を Image Widget セットして StaticMesh が UI 上に表示されるようするサンプルです
<iframe src="https://blueprintue.com/render/frw9dthw/" scrolling="no" allowfullscreen width="100%" height="500px"></iframe>

ViewInfo にカメラ設定、 Mesh に描画したい StaticMesh を入れています。ここでは少しずつ回転しながら毎フレーム描画されるようにしています。

![](#/first.png)

ちゃんと描画されているようです！

## 背景を除去する
続いて、上で実装した描画機能に背景除去機能を拡張しましょう。ここでは、 `SceneViewExtension` という機能を使って描画のポストプロセスにパスを追加してみます。
`SceneViewExtension` とは、主に `FSceneRenderer` のレンダリング処理への拡張を提供する仕組みのことで、様々なタイミングでGBufferにアクセスして値を読み書きすることができます。

### 背景除去シェーダーを実装する
まずはプロジェクトやプラグイン内に `Shaders/Private/` ディレクトリを作成し、以下のようなファイルを作成します。

```hlsl title=BackgroundEraseShader.usf
#pragma once

#include "/Engine/Public/Platform.ush"
#include "/Engine/Private/ScreenPass.ush"
#include "/Engine/Private/Common.ush"

SamplerState Sampler;
SCREEN_PASS_TEXTURE_VIEWPORT(OutputViewport)

struct FInput
{
	noperspective float4 UVAndScreenPos: TEXCOORD0;
	float4 Position: SV_POSITION;
};

void BackgroundEraseMainPS(in FInput Input, out float4 OutColor: SV_Target0)
{
	const float2 ViewportUV = (Input.Position.xy - OutputViewport_ViewportMin.xy) * OutputViewport_ViewportSizeInverse.xy;
	const float2 BufferUV = ViewportUVToBufferUV(ViewportUV);

	const float Depth = Texture2DSample(SceneTexturesStruct.SceneDepthTexture, Sampler, BufferUV).r;
	const float4 Color = Texture2DSample(SceneTexturesStruct.SceneColorTexture, Sampler, BufferUV);

	OutColor = float4(Color.rgb, Depth > 0.0f ? 1.0f : 0.0f);
}
```

非常に単純なピクセルシェーダです。深度情報と色情報を両方 GBuffer からサンプルした上で、深度情報が書き込まれているピクセル以外の Alpha 値を 0 にしているだけです。
このピクセルシェーダによるパスを上で作成したレンダラの最後に接続することで背景を除去できますが、もうちょっと C++ 側での作業が必要です。

### モジュールにシェーダーのパスを通す
Module の Startup 時に、エンジンが認識する Shader ディレクトリを追加しておきます。

```cpp
void FRenderingPracticeModule::StartupModule()
{
	IPluginManager& PluginManager = IPluginManager::Get();
	const FString PluginShaderDir = PluginManager.FindPlugin(TEXT("RenderingPractice"))->GetBaseDir() / TEXT("Shaders");
	AddShaderSourceDirectoryMapping(TEXT("/StaticMeshRendererShaders"), PluginShaderDir);
}
```

自分はプラグイン内に入れたので、プラグインのRootディレクトリから `Shaders/` のパスを決定し、`StaticMeshRendererShadres/` という別名を定義することにしました。

### C++ 側のシェーダー対応実装を追加

C++ でシェーダーによる処理を呼び出せるようにするために、C++側の対応するクラスを作成する必要があります。

```cpp
class FBackgroundErasePS : public FGlobalShader
{
	DECLARE_GLOBAL_SHADER(FBackgroundErasePS);
	SHADER_USE_PARAMETER_STRUCT(FBackgroundErasePS, FGlobalShader);

	BEGIN_SHADER_PARAMETER_STRUCT(FParameters,)
		SHADER_PARAMETER_STRUCT_REF(FViewUniformShaderParameters, View)
		SHADER_PARAMETER_STRUCT(FScreenPassTextureViewportParameters, OutputViewport)
		SHADER_PARAMETER_STRUCT_INCLUDE(FSceneTextureShaderParameters, SceneTextures)
		SHADER_PARAMETER_SAMPLER(SamplerState, Sampler)
		RENDER_TARGET_BINDING_SLOTS()
	END_SHADER_PARAMETER_STRUCT()
};

IMPLEMENT_GLOBAL_SHADER(FBackgroundErasePS,
                        "/StaticMeshRendererShaders/Private/BackgroundEraseShader.usf",
                        "BackgroundEraseMainPS", SF_Pixel);
```

最近の UE が採用している RDG のマクロを利用することで、パラメータ定義が非常に簡潔に行なえていることがわかります。
このシェーダーは、SceneView のパラメータ、出力先 Viewport、GBufferなど SceneTextures、テクスチャサンプラをパラメータとして渡すことで利用できます。

### 作成したシェーダーを使ったパスを SceneViewExtension で拡張機能化
上記のシェーダーを、ポストプロセスパスとして追加する SceneViewExtension を作成します。

```cpp title=StaticMeshRendererSceneViewExtension.h
struct FStaticMeshRendererSceneViewExtensionContext : FSceneViewExtensionContext
{
private:
	virtual FName GetRTTI() const override;
  {
    return RTTIName;
  }
public:
	inline static const FName RTTIName = TEXT("FStaticMeshRendererSceneViewExtensionContext");
};

class FStaticMeshRendererSceneViewExtension final : public FSceneViewExtensionBase
{
public:
	FStaticMeshRendererSceneViewExtension(const FAutoRegister& AutoRegister);
	
	virtual void SetupViewFamily(FSceneViewFamily& InViewFamily) override {}
	virtual void SetupView(FSceneViewFamily& InViewFamily, FSceneView& InView) override {}
	virtual void BeginRenderViewFamily(FSceneViewFamily& InViewFamily) override {}
	
	virtual void SubscribeToPostProcessingPass(EPostProcessingPass Pass, FAfterPassCallbackDelegateArray& InOutPassCallbacks, bool bIsPassEnabled) override;

private:
	static FScreenPassTexture AfterTonemapPass(FRDGBuilder& GraphBuilder, const FSceneView& View, const FPostProcessMaterialInputs& Inputs);
};

FStaticMeshRendererSceneViewExtension::FStaticMeshRendererSceneViewExtension(const FAutoRegister& AutoRegister):
	FSceneViewExtensionBase(AutoRegister)
{
	FSceneViewExtensionIsActiveFunctor IsActiveFunctor;

	IsActiveFunctor.IsActiveFunction = [](const ISceneViewExtension* SceneViewExtension,
	                                      const FSceneViewExtensionContext& Context)
	{
		return Context.IsA(FStaticMeshRendererSceneViewExtensionContext());
	};

	IsActiveThisFrameFunctions.Add(IsActiveFunctor);
}

void FStaticMeshRendererSceneViewExtension::SubscribeToPostProcessingPass(EPostProcessingPass Pass,
                                                                          FAfterPassCallbackDelegateArray&
                                                                          InOutPassCallbacks, bool bIsPassEnabled)
{
	if (Pass == EPostProcessingPass::Tonemap)
	{
		InOutPassCallbacks.Add(
			FAfterPassCallbackDelegate::CreateStatic(&FStaticMeshRendererSceneViewExtension::AfterTonemapPass));
	}
}

FORCENOINLINE FScreenPassTexture FStaticMeshRendererSceneViewExtension::AfterTonemapPass(FRDGBuilder& GraphBuilder,
	const FSceneView& View,
	const FPostProcessMaterialInputs& Inputs)
{
	const FScreenPassTexture& SceneColor = Inputs.GetInput(EPostProcessMaterialInput::SceneColor);

	FScreenPassRenderTarget Output = Inputs.OverrideOutput;

	if (!Output.IsValid())
	{
		Output = FScreenPassRenderTarget::CreateFromInput(GraphBuilder,
		                                                  SceneColor,
		                                                  View.GetOverwriteLoadAction(),
		                                                  TEXT("StaticMeshRendererSceneViewExtension"));
	}

	const FScreenPassTextureViewport SceneColorViewport(SceneColor);
	const FScreenPassTextureViewport OutputViewport(Output);

	FBackgroundErasePS::FParameters* PassParameters = GraphBuilder.AllocParameters<FBackgroundErasePS::FParameters>();
	PassParameters->View = View.ViewUniformBuffer;
	PassParameters->OutputViewport = GetScreenPassTextureViewportParameters(OutputViewport);
	PassParameters->SceneTextures = Inputs.SceneTextures;
	PassParameters->Sampler = TStaticSamplerState<SF_Bilinear>::GetRHI();
	PassParameters->RenderTargets[0] = Output.GetRenderTargetBinding();

	TShaderMapRef<FBackgroundErasePS> PixelShader(GetGlobalShaderMap(View.FeatureLevel));

	AddDrawScreenPass(GraphBuilder,
	                  RDG_EVENT_NAME("BackgroundErase"),
	                  View,
	                  OutputViewport,
	                  SceneColorViewport,
	                  PixelShader,
	                  PassParameters);

	return MoveTemp(Output);
}
```

ここでは、 `SubscribeToPostProcessingPass()` をオーバーライドして、 ポスプロの`ToneMap` のタイミングにパスの処理を行うようにしています。
パスの処理では、 RDG が提供している `AddDrawScreenPass()` というスクリーンパス(画面全体に対して処理をするPixelShaderが主役のパス)向けの追加関数を使うことで、簡潔に追加処理を記述できています。
`Context` は、多数の SceneViewExtension の中からこの Extension を選択するためのマーカーとして実装しています。

Module の Startup で Extension を登録するようにしておきます。

```cpp
void FRenderingPracticeModule::StartupModule()
{
  /* -------
  *  省略
  ------- */

	FCoreDelegates::OnPostEngineInit.AddLambda([this]()
	{
		StaticMeshRendererSceneViewExtension
			= FSceneViewExtensions::NewExtension<FStaticMeshRendererSceneViewExtension>();
	});
}
```

これで、SceneViewExtension が利用可能になりました。

### Extension を適用する
作成した Extension を、単一メッシュレンダリング向けに用意した ViewFamily で利用するよう設定するには、以下の行を `Render()` 関数に書き足すだけで OK です。

```cpp
void UStaticMeshRenderer::RenderWithAlpha(bool bEnableAlpha)
{
  // 略
	FSceneViewFamilyContext ViewFamily(FSceneViewFamily::ConstructionValues(
		RenderTargetResource, RenderScene->GetScene(), FEngineShowFlags(ESFIM_Game)));

  // 略

  // ↓↓以下を追加
	if (bEnableAlpha)
	{
		static const FStaticMeshRendererSceneViewExtensionContext ExtensionContext;
		ViewFamily.ViewExtensions = GEngine->ViewExtensions->GatherActiveExtensions(ExtensionContext);
	}
  // ↑↑以上を追加
	
  // 略

	GetRendererModule().BeginRenderingViewFamily(&Canvas, &ViewFamily);
}
```

Extension の利用を引数からのフラグで制御可能にしたので、BPで背景の処理をパスごと有無を切り替えられます。

![](#/with-alpha.png)

きちんと背景が抜けました。

![](#/with-alpha-pic.png)

## FScenePreview を使ったメッシュレンダリングの所感

FScenePreview を使った単一メッシュレンダリングを実験してみて、以下のようなことがわかりました。

### 利点
- 簡単に実装できる
- 隔離したシーンをセットアップしてキャプチャが行えるので便利。BP上だけで画像が作れる。
- SceneCapture2d などよりはレンダリング機能へ深くアクセスできる
- 毎フレーム更新ではなく、メッシュ画像をランタイム生成する用途などには十分使える。

### 欠点
- パフォーマンス的に優れてるわけではない。また、数が増えると World / Scene のオーバーヘッドが目立ちそう
- FSceneRenderer の内部をいじり回すことはできない
- アルファ抜きは結局Extensionなどでパスを追加して対応するしか無い


# ということで……

実はこの記事は前座なのです。次回「独自メッシュパス編」では、より下のほうから手を入れることで、解決できなかった問題を回避したバージョンを実装していきます。

幸いまだアドベントカレンダーの記事の枠(過去)は空いているようなので、数日以内にタイムリープして投稿したいと思います。