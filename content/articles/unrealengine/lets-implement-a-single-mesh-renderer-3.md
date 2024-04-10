---
title: '単一Static Meshレンダラを独自メッシュパスで実装する'
description: 'アイテムの描画とか、一つだけのメッシュをレンダリングするのに便利なツールを実装してみる記事のその２。独自のメッシュパスを実装して単一パスの軽量なレンダラを書く。'
enforceCreatedAt: 2024/04/10
enforceUpdatedAt: 2024/04/10
tags:
    - Unreal Engine
    - Unreal C++
    - RHI
    - RDG
    - Advent Calendar
assets: '/article-assets/unrealengine/lets-implement-a-single-mesh-renderer-3'
---

# Introduction
この記事では、UE5 上でメインの World とは別の空間・ビューポートを対象とした軽量なレンダリング機能を実装してみるものです。
想定用途は、アイテムのプレビュー表示など、高度なレンダリング機能を必要としないが、軽量に個別のメッシュを描画したい場合などです。

この記事は、以下の記事の続編になります。

1. [単一 Static Mesh レンダラを FPreviewScene で実装する](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer)
2. [単一 Static Mesh レンダラを独自メッシュパスで実装する...ための前提知識編](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2)

1 の記事では、FPreviewScene というユーティリティを使って、メインの World とは別の UWorld インスタンスを作成し、その内部のカメラにレンダリングさせることで、単一の Static Mesh を専用ビューポートに描画する方法を紹介しました。

しかし、この方法には課題もありました。たとえば、
- 単一メッシュをレンダリングしたいだけなのに専用の UWorld インスタンスが必要
- レンダリング機能についても多数のメッシュを描画する前提で設計されていたりするために、速度やメモリ資源の面で無駄が多い

などです。
本記事では、 2 の記事で紹介した前提知識を元に、実際に単一メッシュを描画するためのレンダラを実装していきます。

 **StaticMesh から出発して独自のメッシュ描画パスを実装してみることは、UE のレンダリング機能を知る入口としても適しています。** 

# プラグインの公開
この記事の執筆にあたっては、TinyRenderer というプラグインとして機能を実装しました。プラグインのソースコードは [GitHub](https://github.com/strvert/TinyRenderer) で公開しています。
なお、実験的な実装であり、きちんとした検証は行っていないので、あくまでも手法の参考としてご利用ください。

## 簡単な使い方
以下のように、BP から簡単にメッシュを指定して RenderTarget に描画させることができます。
![](#/sample.png)
これは UMG 上の Image Widget に配置した例です。
![](#/lamp.png)

背景色は RenderTarget の ClearColor で指定したものになるので、背景抜きのことを考えなくても透明に設定するだけではじめから背景無しで描画できます。

試した方は、動いたとか動かなかったとか、もしよければ @strvert までおしえてください。

## パフォーマンス
詳しくは [パフォーマンスの検証](#パフォーマンスの検証) に記載していますが、単一メッシュの描画においては、 SceneCapture2D や FPreviewScene といった手段よりもかなり高速に動作します。

参考として、 同一フレームに 500x500 の RenderTarget に 19382 三角ポリゴンのメッシュを描画して計測すると、フレーム内に占める時間は以下のような結果になりました。

![](#/compare.png)

- SceneCapture2D: 4.12ms
- [FPreviewScene](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer): 1.11ms
- <b>Tiny Renderer (本プラグイン): 0.02ms</b>

はやい。いや、むしろ SceneCapture2D などが単純なメッシュ描画には不要な機能が多すぎるということかもしれません。

## このプラグインでできないこと
このプラグインは、単一 StaticMesh を軽量に描画したいという目的に特化しています。そのため、以下のような機能は提供していません。

- 多数のメッシュからなるシーンの描画
- 複雑な照明環境の描画
- エフェクトやポストプロセスの適用

また、以下のような機能は技術的には(たぶん)可能ですが、実装には含まれていません。

- 不透明 (Opaque) 以外のマテリアルの描画
- Nanite メッシュの描画
- etc...

Nanite メッシュの描画については、Nanite を使った描画はできませんが、Fallback Mesh の LOD を指定して描画することは可能です。

さて、以降はこのプラグインの実装と関連する UE のグラフィックス機能について解説していきます。

# 目次

# おおまかな仕組みとコンセプト
長い記事になるので、まずはどんなコンセプトで実装されたものかをざっくりとまとめておきます。

UE の デスクトップやハイエンドコンソール向けのレンダリング機能は、Diferred Rendering による高度な機能を提供します。Deferred Rendering は多数のメッシュや光源を描画したり、高度なポストプロセスを適用したりするのには有益ですが、シンプルな単一メッシュの描画には不要です。

たとえば、ゲームのインベントリ画面にアイテムの 3D モデルをたくさん並べて表示したいとか、そんなときには高度な機能は不要で、小さな RenderTarget に単一のメッシュを高速に描画できることが重要です。

また、UE のレンダリング機能には AO や GI などの高度な機能のためのパスが多数含まれており、これらのパスは特定の Viewport だけで ON / OFF したりできない (CVars で一括管理されてしまう)ため、シンプルな Viewport 描画を行いにくいです。
利用される Shader についても複雑な構造になっており、単一メッシュの描画にはオーバースペックです。

そこで、単一のパスでライティングまでを行う Forward Rendering によるレンダラを UE の RHI / RDG を使って実装してみることにしました。また、 UWorld や FScene といったシーン表現や Actor, Component といったものも単一メッシュでは不要(ローカルのTransformしかない)なので利用せず、StaticMesh アセットを直接処理して描画することにします。

独自のシェーダーで描画を行いますが、アセットの互換性のため、きちんとUEのマテリアルアセットを利用して描画を行えるようにもしました。

**TinyRenderer は軽量で高速ですが、すごいことをしているわけではありません。むしろ、単一メッシュを描画するにはいらないことをなにもしてないないだけです。**

# 軽量な単一 StaticMesh レンダラの実装

すべてのコードを示すと長くなるため、面白い部分のみを抜粋して説明します。
全体のコードは [GitHub](https://github.com/strvert/TinyRenderer) を参照してください。プラグインのソースを読みながら、その解説として記事を読むのが理解しやすいかもしれません。

## レンダラクラス FTinyRenderer の定義
レンダラを表すクラスは `FTinyRenderer` であり、以下のように定義されています。

```cpp
class FTinyRenderer
{
public:
	// コンストラクタ。FSceneViewFamilyを受け取る
	explicit FTinyRenderer(const FSceneViewFamily& InViewFamily);
	// StaticMesh およびその変換行列を設定する
	void SetStaticMesh(UStaticMesh* InStaticMesh, const int32 InLODIndex, const FMatrix& InTransform);
	// 描画命令を発行する
	void Render(FRDGBuilder& GraphBuilder);

private:
	struct FTinySceneTextures
	{
		FRDGTextureRef SceneColorTexture;
		FRDGTextureRef SceneDepthTexture;
	};
	
	struct FMeshBatchesRequiredFeatures
	{
		bool bWorldPositionOffset = false;
	};

	FTinySceneTextures SetupSceneTextures(FRDGBuilder& GraphBuilder) const;
	void RenderBasePass(FRDGBuilder& GraphBuilder, const FTinySceneTextures& SceneTextures);

	bool CreateMeshBatch(UStaticMesh* InStaticMesh,
	                     const int32 InLODIndex,
	                     TArray<FMeshBatch>& InMeshBatches,
	                     FMeshBatchesRequiredFeatures& RequiredFeatures) const;
	
	FGPUSceneResourceParameters SetupGPUSceneResourceParameters(FRDGBuilder& GraphBuilder,
	                                                            const FMeshBatchesRequiredFeatures& RequiredFeatures) const;

	void SetGPUSceneResourceParameters(const FGPUSceneResourceParameters& Parameters);

	ERHIFeatureLevel::Type FeatureLevel;
	const FSceneViewFamily& ViewFamily;
	FSceneUniformBuffer SceneUniforms;
	TWeakObjectPtr<UStaticMesh> StaticMesh;
	FMatrix LocalToWorld;
	int32 LODIndex;
};
```

UE の他の機能との相互利用性を考慮して、 コンストラクタでは `FSceneViewFamily` を受け取って利用します。また、描画するメッシュや変換行列は `SetStaticMesh` で設定し、描画の実行は `Render` で行います。

`FSceneViewFamily` については[こちら](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer/#ue-のレンダリングの登場人物を理解する)を参照してください。

## レンダリング呼び出しの流れ
`FTinyRenderer::Render` は、呼び出し元から RDGBuilder を受け取り、 RDG を使ってリソースやパスの登録を行います。

```cpp
void FTinyRenderer::Render(FRDGBuilder& GraphBuilder)
{
	// レンダリング対象の SceneTextures を作成
	const FTinySceneTextures SceneTextures = SetupSceneTextures(GraphBuilder);
	// BasePass をレンダリング
	RenderBasePass(GraphBuilder, SceneTextures);
}
```

流れとしては、 `SetupSceneTextures` でレンダリングに利用するのテクスチャリソースを登録し、そこに `RenderBasePass` でパスの登録確保したリソースのパラメータのセットアップを実行するというものです。
RDG についての詳細は [前回の記事](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2#rdg-を使った描画命令発行のボイラープレート) を参照してください。

呼び出している関数の実装は次節以降で解説します。

### FTinyRenderer::SetupSceneTextures
まずは、 `SetupSceneTextures` の実装を見ていきます。

```cpp
FTinyRenderer::FTinySceneTextures FTinyRenderer::SetupSceneTextures(FRDGBuilder& GraphBuilder) const
{
	// 描画先の FRenderTarget を取得。これが SceneColor の出力先になる
	const FRenderTarget* RenderTarget = ViewFamily.RenderTarget;
	// RDG のリソース管理に外部の RenderTarget を登録し、RDG のテクスチャリソースを表す FRDGTextureRef を取得
	const FRDGTextureRef TinyRendererOutputRef = GraphBuilder.RegisterExternalTexture(
		CreateRenderTarget(RenderTarget->GetRenderTargetTexture(), TEXT("TinyRendererOutput")));

	// SceneDepth 用のテクスチャを作成。今回は外部から参照しないので、ここで作成して利用する。
	const FRDGTextureDesc Desc = FRDGTextureDesc::Create2D(RenderTarget->GetSizeXY(), PF_DepthStencil,
	                                                       FClearValueBinding::DepthFar,
	                                                       TexCreate_DepthStencilTargetable | TexCreate_ShaderResource);
	const FRDGTextureRef SceneDepth = GraphBuilder.CreateTexture(Desc, TEXT("SceneDepthZ"));

	return FTinySceneTextures{
		.SceneColorTexture = TinyRendererOutputRef,
		.SceneDepthTexture = SceneDepth
	};
}
```

ここでは、 RDG のリソース管理機能を利用して、レンダリングに利用するテクスチャリソースを定義しています。SceneColor には、外部の RenderTarget を利用し、SceneDepth は RDG のリソースとして作成しています。
RDG を使った実装では、 RDG がリソースのライフタイムを管理するため、外部化のリソースを利用するには登録を行って RDG のリソースとして扱う必要があります。別の場所で作成した RenderTarget を渡したい場合や、フレームをまたいで利用したいリソースがある場合には、このような方法を使うことになります。

### FTinyRenderer::RenderBasePass
次に、 `RenderBasePass` の実装を見ていきます。

```cpp
void FTinyRenderer::RenderBasePass(FRDGBuilder& GraphBuilder, const FTinySceneTextures& SceneTextures)
{
	SCOPED_NAMED_EVENT(FTinyRenderer_RenderBasePass, FColor::Emerald);

	// レンダリング対象の StaticMesh を取得
	UStaticMesh* Mesh = StaticMesh.IsValid() ? StaticMesh.Get() : nullptr;
	if (!Mesh)
	{
		UE_LOG(LogTinyRenderer, Warning, TEXT("StaticMesh is not valid"));
		return;
	}

	// StaticMesh から MeshBatch を作成
	TArray<FMeshBatch> MeshBatches;
	FMeshBatchesRequiredFeatures RequiredFeatures;
	if (!CreateMeshBatch(Mesh, LODIndex, MeshBatches, RequiredFeatures))
	{
		UE_LOG(LogTinyRenderer, Warning, TEXT("Failed to create mesh batch"));
		return;
	}

	// GPUScene のためのパラメータをセットアップ
	const FGPUSceneResourceParameters GPUSceneResourceParameters = SetupGPUSceneResourceParameters(GraphBuilder, RequiredFeatures);
	SetGPUSceneResourceParameters(GPUSceneResourceParameters);

	// レンダリング対象の View を取得	
	const FViewInfo* View = static_cast<const FViewInfo*>(ViewFamily.Views[0]);

	// レンダリングに利用する Shader のパラメータを構築
	FTinyRendererShaderParameters* PassParameters = GraphBuilder.AllocParameters<FTinyRendererShaderParameters>();
	PassParameters->View = View->ViewUniformBuffer;
	PassParameters->Scene = SceneUniforms.GetBuffer(GraphBuilder);
	// レンダリング結果の出力先を設定
	PassParameters->RenderTargets[0] = FRenderTargetBinding(SceneTextures.SceneColorTexture,
	                                                        ERenderTargetLoadAction::EClear);
	// DepthStencil の設定
	PassParameters->RenderTargets.DepthStencil = FDepthStencilBinding(SceneTextures.SceneDepthTexture,
	                                                                  ERenderTargetLoadAction::EClear,
	                                                                  ERenderTargetLoadAction::ELoad,
	                                                                  FExclusiveDepthStencil::DepthWrite_StencilWrite);

	// メッシュ描画用のパスを RDG に登録
	AddSimpleMeshPass(
		GraphBuilder, PassParameters, nullptr, *View, nullptr,
		RDG_EVENT_NAME("TinyRendererBasePass"),
		View->UnscaledViewRect, ERDGPassFlags::Raster,
		[View, MeshBatches](FDynamicPassMeshDrawListContext* DynamicMeshPassContext)
		{
			for (const FMeshBatch& MeshBatch : MeshBatches)
			{
				// マテリアルから ShaderBinding を取得するために、必要に応じて UniformExpression を更新
				MeshBatch.MaterialRenderProxy->UpdateUniformExpressionCacheIfNeeded(View->GetFeatureLevel());
				// MeshBatch を TinyRenderer 用の BasePassMeshProcessor に追加
				FTinyRendererBasePassMeshProcessor TinyRendererBasePassMeshProcessor(View, DynamicMeshPassContext);
				TinyRendererBasePassMeshProcessor.AddMeshBatch(MeshBatch, ~0ull, nullptr);
			}
		});
}
```
ここでは、レンダリングに必要なパラメータのセットアップから描画パスの登録までを行っています。具体的には、以下のような処理に分けられます。

- StaticMesh から MeshBatch を作成する。 MeshBatch はメッシュのレンダリングに必要な情報をまとめた構造体で、あらゆる描画可能なメッシュは MeshBatch に変換してから描画に使われる。
	- [CreateMeshBatch()](#staticmesh-から直接-meshbatch-を作成する)
- パスパラメータをセットアップする。ここでは描画先のテクスチャやビュー情報、シーン情報など基本的な要素のほか、 GPUScene に必要なパラメータもセットアップしている。
	- [SetupGPUSceneResourceParameters() ](#gpuscene-のためのパラメータをセットアップする)
- パスを RDG に登録する。 RDG には描画パスを登録するための関数が用意されており、ここでは `AddSimpleMeshPass` を使って MeshBatch を RDG に登録している。
- パス内部では、MeshPassProcessor を使って MeshBatch の描画命令を登録する。
	- [FTinyRendererBasePassMeshProcessor](#meshbatch-の描画命令を発行する-meshpassprocessor)


`AddSimpleMeshPass` は RDG 向けに提供されている便利な関数で、 MeshPassProcessor を使ったメッシュ描画パスに必要なコンテキストのセットアップを行ってくれます。

## StaticMesh から直接 MeshBatch を作成する
通常の UE のシーンでは、 StaticMesh などのアセットが直接シーンに配置されることはありません(できません)。シーンに存在するすべての可視存在は、 `UStaticMeshComponent` など `UPrimitiveComponent` を継承したコンポーネントとして配置されます。StaticMesh などのアセットは、コンポーネントに設定されることで間接的に利用されることになります。
レンダリングプロセスとしても、ゲームスレッドの `UPrimitiveComponent` の持つメソッドをもとに `FPrimitiveSceneProxy` が作成され、それをもとに `FMeshBatch` が作成されるという流れになります。 `FMeshBatch` が作成できれば、あとは `MeshPassProcessor` を使って描画命令を登録するだけで描画が行えます。

### FTinyRenderer::CreateMeshBatch
しかし、今回のような単一メッシュの描画には、コンポーネントはオーバースペックです。そこで、コンポーネントを介さずに StaticMesh から直接 MeshBatch を作成する方法を考えます。
これを実装したのが `CreateMeshBatch()` 関数です。

```cpp
/**
 * @param InStaticMesh MeshBatch を作成する StaticMesh
 * @param InLODIndex MeshBatch を作成する StaticMesh の LODIndex
 * @param InMeshBatches 作成した MeshBatch を格納する配列
 * @param RequiredFeatures MeshBatch が描画時に必要とする機能
 * @return MeshBatch が作成できた場合は true、それ以外は false
 */
bool FTinyRenderer::CreateMeshBatch(UStaticMesh* InStaticMesh, const int32 InLODIndex,
                                    TArray<FMeshBatch>& InMeshBatches,
                                    FMeshBatchesRequiredFeatures& RequiredFeatures) const
{
	SCOPED_NAMED_EVENT_F(TEXT("FTinyRenderer::CreateMeshBatch - %s"), FColor::Emerald, *InStaticMesh->GetName());

	// StaticMesh がコンパイル中の場合は MeshBatch を作成しない
	// Editor 用チェックであり、非 Editor ビルドでは定数化するので、最適化で消える
	if (InStaticMesh->IsCompiling())
	{
		return false;
	}

	// StaticMesh から RenderData を取得。ここに StaticMesh のメッシュデータが格納されている
	FStaticMeshRenderData* RenderData = InStaticMesh->GetRenderData();

	const int32 LODResourceIndex = FMath::Min(InLODIndex, RenderData->LODResources.Num() - 1);
	if (LODResourceIndex < 0)
	{
		return false;
	}

	// 以下、LODResources から指定の LODIndex のメッシュデータを読み出し、MeshBatch を作成する
	const FStaticMeshSectionArray& Sections = RenderData->LODResources[LODResourceIndex].Sections;

	// セクションの数だけ MeshBatch を作成。一般的に、StaticMesh に割り当てられているマテリアルの数と対応している
	for (int32 SectionIndex = 0; SectionIndex < Sections.Num(); SectionIndex++)
	{
		const FStaticMeshSection& Section = Sections[SectionIndex];
		if (Section.NumTriangles == 0)
		{
			continue;
		}

		const FStaticMeshLODResources& LODResource = RenderData->LODResources[LODResourceIndex];

		// データを MeshBatch に格納していく
		FMeshBatch MeshBatch;
		MeshBatch.VertexFactory = &RenderData->LODVertexFactories[LODResourceIndex].VertexFactory;
		MeshBatch.Type = PT_TriangleList;

		// MeshBatch の Element に IndexBuffer などを格納。MeshBatch は複数の Element を持つことができるが、エンジンでも多くの場合は 1 つの Element しか使われていない
		FMeshBatchElement& BatchElement = MeshBatch.Elements[0];
		const FLocalVertexFactory* VertexFactory = static_cast<const FLocalVertexFactory*>(MeshBatch.VertexFactory);
		BatchElement.VertexFactoryUserData = VertexFactory->GetUniformBuffer();

		BatchElement.IndexBuffer = &LODResource.IndexBuffer;
		BatchElement.FirstIndex = Section.FirstIndex;
		BatchElement.NumPrimitives = Section.NumTriangles;
		BatchElement.MinVertexIndex = Section.MinVertexIndex;
		BatchElement.MaxVertexIndex = Section.MaxVertexIndex;
		BatchElement.PrimitiveIdMode = PrimID_DynamicPrimitiveShaderData;

		MeshBatch.LODIndex = LODResourceIndex;
		MeshBatch.SegmentIndex = SectionIndex;
		MeshBatch.CastShadow = false;

		// マテリアルを取得
		if (const UMaterialInterface* MaterialInterface = InStaticMesh->GetMaterial(Section.MaterialIndex);
			BatchElement.NumPrimitives > 0 && MaterialInterface != nullptr)
		{
			const auto MaterialProxy = MaterialInterface->GetRenderProxy();
			// マテリアルのレンダースレッド表現である MaterialRenderProxy を MeshBatch に MaterialRenderProxy を格納
			MeshBatch.MaterialRenderProxy = MaterialProxy;
			InMeshBatches.Add(MeshBatch);

			const FMaterialRelevance& MaterialRelevance = MaterialInterface->GetRelevance_Concurrent(FeatureLevel);
			// マテリアルが利用を要求しているレンダリング機能を RequiredFeatures に格納
			if (MaterialRelevance.bUsesWorldPositionOffset)
			{
				RequiredFeatures.bWorldPositionOffset = true;
			}
		}
	}

	if (InMeshBatches.IsEmpty())
	{
		return false;
	}

	return true;
}
```

StaticMesh には LOD で分割されたメッシュデータが格納されており、更にその中に複数のセクションが存在します。セクションは、メッシュデータの一部を表すもので、一般的にはマテリアルごとに分割されています。
MeshBatch 一つあたり１つのマテリアルが割り当てられるため、セクションごとに MeshBatch を作成しています。
マテリアルのレンダースレッド表現については前回の [マテリアルとシェーダーレンダースレッド表現](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2/#マテリアルとシェーダーレンダースレッド表現) を参照してください。

UE のマテリアルはビジュアルシェーダー言語であるため、その設定によって要求されるレンダリング機能が変わります。ここでは例として、 MeshBatches の作成とともに、それらを描画するために WorldPositionOffset が必要かどうかを取得する処理を加えています。
取得した情報は後のシェーダーパラメータ作成に利用されます。


また、頂点ファクトリ(Vertex Factory)は独自パスを書くうえで非常に重要です。頂点ファクトリはメッシュの種別に紐づく形で様々な種類が存在しており、紐づくメッシュタイプの頂点データを処理して Vertex Shader に提供する役割を果たします。詳細は前回記事の [頂点データの受け渡し](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2#頂点ファクトリ) を参照してください。
ここでは StaticMesh が利用する頂点ファクトリである `FLocalVertexFactory` を前提として MeshBatch を作成しています。

## GPUScene のためのパラメータをセットアップする
GPUScene は、GPU 側にプリミティブやそのインスタンスの配置情報を表すバッファを持つことで、プリミティブの GPU への送信回数を最適化したり、一度のドローコールで複数のメッシュを描画したりできるようにする機能です。
StaticMesh のキャッシングや、いわゆる GPU Instancing と呼ばれるものなどはこれによって実現されています。

今回のレンダラはキャッシュ等を行わないし単一メッシュなのに、どうして GPUScene をセットアップするんだ？　という疑問はごもっともです。実際、機能としては必要ありません。ただ、UE の StaticMesh 描画実装をうまく流用して実装を行おうとすると GPUScene を利用しないほうが複雑になるため、 1 プリミティブ 1 インスタンスの GPUScene をセットアップすることにしました。

なお、FLocalVertexFactory の派生ファクトリを作成し、Shader のコンパイルパラメータを変更してから利用させることで、 GPUScene を利用しないようにすることも可能ではあります。FLocalVertexFactory をそのまま利用する場合には、GPUScene の利用がプラットフォームと Feature Level で自動的に決定されてしまいます。

### FTinyRenderer::SetupGPUSceneResourceParameters
GPUScene の基本的な仕組みは、Vertex Shader にわたす頂点情報に、プリミティブ ID などの情報を追加することで、GPU 側でプリミティブごとの情報を取得できるようにすることです。プリミティブごとの情報は別途バッファとして GPU に渡され、シェーダー側で利用されます。
この構築を行うのが `SetupGPUSceneResourceParameters` 関数です。

```cpp
/**
 * @param GraphBuilder RDGBuilder
 * @param RequiredFeatures 対象の MeshBatch の描画時に必要とする機能
 * @return GPUScene のためのパラメータ
 */
FGPUSceneResourceParameters FTinyRenderer::SetupGPUSceneResourceParameters(FRDGBuilder& GraphBuilder,
                                                                           const FMeshBatchesRequiredFeatures& RequiredFeatures) const
{
	/* PrimitiveData として使うパラメータを構築 */
	const FPrimitiveUniformShaderParameters PrimitiveParams = FPrimitiveUniformShaderParametersBuilder{}
	                                                          .Defaults()
	                                                          .LocalToWorld(LocalToWorld)
	                                                          .ActorWorldPosition(LocalToWorld.GetOrigin())
	                                                          .EvaluateWorldPositionOffset(RequiredFeatures.bWorldPositionOffset)
	                                                          .Build();
	const FPrimitiveSceneShaderData PrimitiveSceneData(PrimitiveParams);

	FGPUSceneResourceParameters GPUSceneParameters;
	{
		/* Primitive Data のバッファを作成 */
		const FRDGBufferRef RDGPrimitiveSceneDataBuffer = CreateStructuredBuffer(GraphBuilder,
			TEXT("PrimitiveSceneDataBuffer"), TArray{PrimitiveSceneData});
		GPUSceneParameters.GPUScenePrimitiveSceneData = GraphBuilder.CreateSRV(RDGPrimitiveSceneDataBuffer);
		GPUSceneParameters.NumScenePrimitives = 1;
	}
	{
		FInstanceSceneShaderData InstanceSceneData{};
		InstanceSceneData.Build(0, /* PrimitiveId */
		                        0, /* RelativeId */
		                        0, /* InstanceFlags */
		                        INVALID_LAST_UPDATE_FRAME, /* LastUpdateFrame */
		                        0, /* CustomDataCount */
		                        0.0f, /* RandomID */
		                        FRenderTransform::Identity, /* LocalToPrimitive */
		                        PrimitiveParams.LocalToRelativeWorld); /* PrimitiveToWorld */

		/* Instance Data のバッファを作成 */
		TArray<FVector4f> InstanceSceneDataSOA;
		InstanceSceneDataSOA.AddZeroed(FInstanceSceneShaderData::GetDataStrideInFloat4s());
		for (uint32 ArrayIndex = 0; ArrayIndex < FInstanceSceneShaderData::GetDataStrideInFloat4s(); ArrayIndex++)
		{
			InstanceSceneDataSOA[ArrayIndex] = InstanceSceneData.Data[ArrayIndex];
		}
		const FRDGBufferRef RDGInstanceSceneDataBuffer = CreateStructuredBuffer(GraphBuilder,
			TEXT("InstanceSceneDataBuffer"), InstanceSceneDataSOA);
		GPUSceneParameters.GPUSceneInstanceSceneData = GraphBuilder.CreateSRV(RDGInstanceSceneDataBuffer);
		GPUSceneParameters.InstanceDataSOAStride = 1;
		GPUSceneParameters.NumInstances = 1;
	}
	{
		/* ダミーのバッファで不要なパラメータを埋める */
		const FRDGBufferRef DummyBufferVec4 = GSystemTextures.GetDefaultStructuredBuffer(
			GraphBuilder, sizeof(FVector4f));
		const FRDGBufferRef DummyBufferLight = GSystemTextures.GetDefaultStructuredBuffer(
			GraphBuilder, sizeof(FLightSceneData));

		GPUSceneParameters.GPUSceneInstancePayloadData = GraphBuilder.CreateSRV(DummyBufferVec4);
		GPUSceneParameters.GPUSceneLightmapData = GraphBuilder.CreateSRV(DummyBufferVec4);
		GPUSceneParameters.GPUSceneLightData = GraphBuilder.CreateSRV(DummyBufferLight);
	}

	/* たぶん NRVO が効くのでそのまま返しちゃいましょう */
	return GPUSceneParameters;
}
```

`FPrimitiveUniformShaderParametersBuilder` を通して作成している `FPrimitiveSceneShaderData` は、プリミティブごとの情報を表す構造体です。一方 `FInstanceSceneShaderData` は、インスタンスごとの情報を表す構造体で、きちんと GPUScene を使うときには 1 つのプリミティブに対して複数のインスタンスが存在することを考慮して設計されています。
ここでは単一メッシュの描画を行うためどちらも１つで十分で、必要最低限の情報しか設定していません。高度な GPUScene の構築についてはエンジンの `Engine\UE5\Source\Runtime\Renderer\Private\GPUScene.cpp:FGPUScene::UploadGeneral()` が参考になります。

### FTinyRenderer::SetGPUSceneResourceParameters
これは単に、構築した GPUScene のパラメータを RDG のリソースとしてセットアップする関数です。

```cpp
void FTinyRenderer::SetGPUSceneResourceParameters(const FGPUSceneResourceParameters& Parameters)
{
	SceneUniforms.Set(SceneUB::GPUScene, Parameters);
}
```

## マテリアルを利用した描画処理を行えるシェーダーの作成
以上の内容で描画したいメッシュのセットアップは概ね完了しました。次に、描画処理を行うシェーダーを作成します。今回のシェーダーは以下のような要件を満たす必要があります。

- StaticMesh に割り当てられたマテリアルを使って描画することができる
- UE の標準レンダリング機能と近い見た目を提供する
- 軽量である

特に、マテリアルアセットと組み合わせて利用できるシェーダーの定義にはいくつか考慮すべきポイントがあるため、それについても解説します。

### FTinyRendererShader (VS/PS) の C++ 定義
まずは Shader の C++ 定義です。

```cpp
/* TinyRenderer の VS/PS 共通で利用する機能を定義 */
namespace TinyRendererShader
{
	/* シェーダーのコンパイル環境を変更 */
	static void ModifyCompilationEnvironment(const FMaterialShaderPermutationParameters& Parameters,
	                                         FShaderCompilerEnvironment& OutEnvironment)
	{
		/* GPUScene は利用するが、InstanceCulling は不要 */
		OutEnvironment.SetDefine(TEXT("USE_INSTANCE_CULLING_DATA"), 0);
		OutEnvironment.SetDefine(TEXT("USE_INSTANCE_CULLING"), 0);
	}

	/* 任意の ShaderPermutation に対してコンパイルを行うかどうかを判定 */
	static bool ShouldCompilePermutation(const FMeshMaterialShaderPermutationParameters& Parameters)
	{
		static FName NAME_LocalVertexFactory(TEXT("FLocalVertexFactory"));
		return (Parameters.MaterialParameters.MaterialDomain == MD_Surface) &&
			Parameters.VertexFactoryType == FindVertexFactoryType(NAME_LocalVertexFactory);
	}
}

/* TinyRenderer の頂点シェーダー C++ 定義 */
class FTinyRendererShaderVS : public FMeshMaterialShader
{
	DECLARE_SHADER_TYPE(FTinyRendererShaderVS, MeshMaterial);

	static void ModifyCompilationEnvironment(const FMaterialShaderPermutationParameters& Parameters,
	                                         FShaderCompilerEnvironment& OutEnvironment)
	{
		/* 親の環境定義を引き継ぎつつ、TinyRenderer 用の環境定義を追加 */
		FMeshMaterialShader::ModifyCompilationEnvironment(Parameters, OutEnvironment);
		TinyRendererShader::ModifyCompilationEnvironment(Parameters, OutEnvironment);
	}

	static bool ShouldCompilePermutation(const FMeshMaterialShaderPermutationParameters& Parameters)
	{
		return TinyRendererShader::ShouldCompilePermutation(Parameters);
	}
};

/* TinyRenderer のピクセルシェーダー C++ 定義 */
class FTinyRendererShaderPS : public FMeshMaterialShader
{
	DECLARE_SHADER_TYPE(FTinyRendererShaderPS, MeshMaterial);

	static void ModifyCompilationEnvironment(const FMaterialShaderPermutationParameters& Parameters,
	                                         FShaderCompilerEnvironment& OutEnvironment)
	{
		/* 親の環境定義を引き継ぎつつ、TinyRenderer 用の環境定義を追加 */
		FMeshMaterialShader::ModifyCompilationEnvironment(Parameters, OutEnvironment);
		TinyRendererShader::ModifyCompilationEnvironment(Parameters, OutEnvironment);

		/* PixelShader 特有の環境定義を追加 */
		/* ライトベイクは行わないので、ライトマップ系機能は不要 */
		OutEnvironment.SetDefine(TEXT("NEEDS_LIGHTMAP_COORDINATE"), 0);
		/* 独自の出力を行うため、通常の SceneTexture は不要 */
		OutEnvironment.SetDefine(TEXT("SCENE_TEXTURES_DISABLED"), 1);
	}

	static bool ShouldCompilePermutation(const FMeshMaterialShaderPermutationParameters& Parameters)
	{
		return TinyRendererShader::ShouldCompilePermutation(Parameters);
	}
};
```
[前回の記事](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2#shader-はどうやって扱われるのか) でも説明しましたが、UE のシェーダーは C++ 側の定義クラスと USF(HLSLもどき) 実装のペアで構成されます。
C++定義クラスの派生元としては、よく `FGlobalShader` が使われますが、これをマテリアルと組み合わせて利用するのは少し面倒です。
マテリアルと組み合わせて利用する場合には `FMaterialShader` もしくは `FMeshMaterialShader` の派生を定義することになり、特にメッシュ描画においては `FMeshMaterialShader` を使うと便利です。

UE のマテリアルアセットは、背後でシェーダーコードを生成します。しかし、このコードはそれ単体で動作するものではなく、別のテキストで実装されたシェーダーからコードの断片として利用されてはじめて機能します。
つまり UE のマテリアルとは、テキストのシェーダーが公開したカスタマイゼーションポイントを埋めるコードを生成するためのツールなのです。

このため、マテリアルとそれを利用するシェーダーは、常に組み合わせて合わせてコンパイルされる必要があります。組み合わせは 1対1 ではなく多対多の関係になり、このあらゆる組み合わせのことを ShaderPermutation と呼びます。
しかし、すべてのシェーダーとマテリアルに互換性があるわけではありません。たとえば、材質のマテリアルと組み合わせるシェーダーはポスプロのマテリアルとは互換性がありません。
また、互換性があっても、目的として利用しない組み合わせまでコンパイルしてしまうと、組み合わせ爆発によって長大なシェーダーコンパイルを引き起こす可能性があります。

そこで上記のコードのように、 `ShouldCompilePermutation` という関数を使ってシェーダーのコンパイル環境に対してフィルタリングを行います。今回のケースでは、 StaticMesh のレンダリングにさえ対応していればよいため、 組み合わせるマテリアルのドメインが `MD_Surface` であることと、適応するメッシュの頂点ファクトリが `FLocalVertexFactory` であることを条件としています。

より詳しくは [前回記事のシェーダーのコンパイル設定のセクション](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2/#シェーダーのコンパイル設定) を参照してください。

### 独自メッシュ描画パス処理の頂点シェーダー実装
UE では、HLSL をベースにした USF というファイル形式でシェーダーコードを記述します。USF をもとに各プラットフォーム向けのシェーダーコードが生成され、コンパイルされるため、共通のコードでクロスプラットフォームのシェーダーを記述することができます。

```hlsl
#include "/Engine/Generated/Material.ush"
#include "/Engine/Generated/VertexFactory.ush"

/* Vertex Shader から Pixel Shader へ受け渡すデータ */
struct FTinyRendererVSToPS
{
	float4 Position : SV_POSITION;
	float4 PixelPosition : POSITION8;
	FVertexFactoryInterpolantsVSToPS FactoryInterpolants;
};

/* Vertex Shader */
void MainVS(FVertexFactoryInput Input, out FTinyRendererVSToPS Output)
{
	ResolvedView = ResolveView();
	

	/* GPUScene から現在の処理対象のインスタンスの情報を取得 */
	FVertexFactoryIntermediates VFIntermediates = GetVertexFactoryIntermediates(Input);
	
	/* InstanceCullingData を Off にしていると、以下のフラグが常に false になってしまい、マテリアルが要求しても WPO が評価されない */
	/* このフラグが true でも、マテリアルが要求していない場合は WPO は評価されないので負荷の心配は不要 */
	VFIntermediates.bEvaluateWorldPositionOffset = true;
	
	const float4 WorldPositionExcludingWPO = VertexFactoryGetWorldPosition(Input, VFIntermediates);
	float4 WorldPos = WorldPositionExcludingWPO;
	
	const float3x3 TangentToLocal = VertexFactoryGetTangentToLocal(Input, VFIntermediates);

	/* マテリアルが生成した VertexShader 用のコードを呼び出し、結果を取得 */
	FMaterialVertexParameters VertexParameters = GetMaterialVertexParameters(Input, VFIntermediates, WorldPos.xyz, TangentToLocal);

	/* マテリアルが生成した WorldPositionOffset を適用 */
	WorldPos.xyz += GetMaterialWorldPositionOffset(VertexParameters);

	/* PixelShader に渡すデータを設定 */
	Output.Position = INVARIANT(mul(WorldPos, ResolvedView.TranslatedWorldToClip));
	Output.PixelPosition = WorldPos;
	Output.FactoryInterpolants = VertexFactoryGetInterpolantsVSToPS(Input, VFIntermediates, VertexParameters);
}
```

このシェーダーは、UE の標準頂点シェーダーを簡略化したような実装になっています。 重要なのは、 `GetMaterialVertexParameters` や `GetMaterialWorldPositionOffset` などの関数呼び出しです。これらは、マテリアルが生成したシェーダーコードを呼び出し、その結果を取得するための関数です。
どのマテリアルと組み合わせてコンパイルされるかの制御は C++ 側で行われるので、シェーダー側では `/Engine/Generated/Material.ush` などのヘッダーファイルをインクルードすることで、任意のマテリアルと組み合わせたときのシェーダーコードを取得することができます。

有り体に言えば、 `GetMaterialWorldPositionOffset` の値はマテリアルグラフで `WorldPositionOffset` に繋いだワイヤーの値がそのまま出てくるということです。

また、 GPUScene を有効にしているにもかかわらず InstanceCulling 機能を Off にしていると、 Primitive の InstanceCulling フラグが常に 0 になってしまい、マテリアルが要求しても WorldPositionOffset が評価されないという問題があります。
このため、シェーダー側で bEvaluateWorldPositionOffset を強制的に true にしています。ただし、マテリアルが要求していない場合は WPO は評価されないため、負荷の心配は不要です。

### 独自メッシュ描画パス処理のピクセルシェーダー実装
続いて、ピクセルシェーダーの実装です。

```hlsl
#define SUPPORT_CONTACT_SHADOWS 0

#include "/Engine/Private/BasePassCommon.ush"
#include "/Engine/Generated/Material.ush"
#include "/Engine/Private/ShadingModelsMaterial.ush"
#include "/Engine/Generated/VertexFactory.ush"
#include "/Engine/Private/DeferredLightingCommon.ush"

/* Pixel Shader */
void MainPS(
	in FTinyRendererVSToPS Interpolants,
	out float4 OutColor : SV_Target0
	OPTIONAL_IsFrontFace)
{
	ResolvedView = ResolveView();

	float3 WorldPosition = Interpolants.PixelPosition.xyz;

	/* マテリアルが生成した PixelShader 用のコードを呼び出し、結果を取得 */
	FMaterialPixelParameters MaterialParameters = GetMaterialPixelParameters(
		Interpolants.FactoryInterpolants, Interpolants.Position);
	FPixelMaterialInputs PixelMaterialInputs;
	{
		/* スクリーン座標系の位置を取得 */
		float4 ScreenPosition = SvPositionToResolvedScreenPosition(Interpolants.Position);
		/* マテリアルから更に追加のパラメータを取得 */
		CalcMaterialParametersEx(MaterialParameters, PixelMaterialInputs, Interpolants.Position, ScreenPosition, bIsFrontFace,
		                         WorldPosition, WorldPosition);
	}

	/* マテリアルの各種出力を取得 */
	GetMaterialCoverageAndClipping(MaterialParameters, PixelMaterialInputs);
	half Opacity = GetMaterialOpacity(PixelMaterialInputs);
	half3 BaseColor = GetMaterialBaseColor(PixelMaterialInputs);
	half Metallic = GetMaterialMetallic(PixelMaterialInputs);
	half Specular = GetMaterialSpecular(PixelMaterialInputs);
	half Roughness = max(0.015625f, GetMaterialRoughness(PixelMaterialInputs));
	float Anisotropy = GetMaterialAnisotropy(PixelMaterialInputs);
	uint ShadingModelID = GetMaterialShadingModel(PixelMaterialInputs);

	/* GBuffer (という名前の構造体) にマテリアルの各種出力を設定。テクスチャリソースとしての GBuffer はここでは使われていないので注意 */
	FGBufferData GBuffer = (FGBufferData)0;
	GBuffer.Depth = MaterialParameters.ScreenPosition.w;

	SetGBufferForShadingModel(
		GBuffer,
		MaterialParameters,
		Opacity,
		BaseColor,
		Metallic,
		Specular,
		Roughness,
		Anisotropy,
		0.0f,
		0.0f,
		0.0f,
		ShadingModelID);

	/* スペキュラカラーやディフューズカラーを計算 */
	GBuffer.SpecularColor = ComputeF0(GBuffer.Specular, GBuffer.BaseColor, GBuffer.Metallic);
	GBuffer.DiffuseColor = GBuffer.BaseColor - GBuffer.BaseColor * GBuffer.Metallic;
	{
		GBuffer.DiffuseColor = GBuffer.DiffuseColor * ResolvedView.DiffuseOverrideParameter.w + ResolvedView.
			DiffuseOverrideParameter.xyz;
		GBuffer.SpecularColor = GBuffer.SpecularColor * ResolvedView.SpecularOverrideParameter.w + ResolvedView.
			SpecularOverrideParameter.xyz;
	}
	half3 DiffuseColor = GBuffer.DiffuseColor * 0.05f;

	half3 CameraVector = -MaterialParameters.CameraVector;
	float DirectionalLightShadow = 1.0f;

	/* Directional Light の設定 */
	FDeferredLightData LightData = (FDeferredLightData)0;
	{
		LightData.Color = float3(1, 1, 1);
		LightData.FalloffExponent = 0;
		LightData.Direction = float3(-0.5, -0.5, 0.5);
		LightData.bRadialLight = false;
		LightData.SpecularScale = 1.0f;
		LightData.ShadowedBits = 0;
		LightData.HairTransmittance = InitHairTransmittanceData();
	}
	half4 LightAttenuation = 1.0f;
	/* ライティングを計算 */
	FLightAccumulator DirectionalLighting = AccumulateDynamicLighting(WorldPosition, CameraVector, GBuffer,
	                                                          1, ShadingModelID, LightData,
	                                                          LightAttenuation, 0, uint2(0, 0),
	                                                          DirectionalLightShadow);
	half3 Color = DirectionalLighting.TotalLight;

	/* 最後にエミッシブカラーを加算 */
	half3 Emissive = GetMaterialEmissive(PixelMaterialInputs);
	Color += Emissive;

	/* 最終的な色を出力 */
	OutColor = float4(Color.rgb, 1.0f);
}
```

このピクセルシェーダーは、UE のモバイル向け BasePass を参考に、固定された DirectionalLight による照明のみを行うようにしたシンプルなものです。単一メッシュであるため、反射や GI などの機能も無視することができます。
エンジンのために便利なユーティリティが多数用意されているため、照明計算やマテリアルのパラメータ取得なども比較的簡単に行うことができます。シェーディングモデルなども流用可能です。また、そのようにすることで、UE の標準レンダリング機能と近い見た目を提供することができます。

`GetMaterialPixelParameters` は、頂点シェーダーで取得した情報をもとに、マテリアルが生成したピクセルシェーダー用のコードを呼び出し、その結果を取得するための関数です。これにより、マテリアルのピクセルシェーダー向け出力を取得することができます。
ほかにもいくつかマテリアルからの出力を取得して利用しています。

### シェーダーの登録と RDG によるパラメータ定義
作成したシェーダーの C++ 定義と USF 実装を関連付けて登録します。また、シェーダーが利用するパラメータ構造体を RDG が提供するマクロを使って定義します。

```cpp
/* TinyRenderer の頂点シェーダーとピクセルシェーダーの実装 (.usf ファイル) と C++ 定義を関連付けて登録 */
IMPLEMENT_MATERIAL_SHADER_TYPE(, FTinyRendererShaderVS,
                                 TEXT("/StaticMeshRenderer/Private/TinyRendererShader.usf"),
                                 TEXT("MainVS"), SF_Vertex);
IMPLEMENT_MATERIAL_SHADER_TYPE(, FTinyRendererShaderPS,
                                 TEXT("/StaticMeshRenderer/Private/TinyRendererShader.usf"),
                                 TEXT("MainPS"), SF_Pixel);

/* TinyRenderer のシェーダーが利用するパラメータ構造体を定義 */
BEGIN_SHADER_PARAMETER_STRUCT(FTinyRendererShaderParameters,)
	SHADER_PARAMETER_STRUCT_REF(FViewUniformShaderParameters, View)
	SHADER_PARAMETER_RDG_UNIFORM_BUFFER(FSceneUniformParameters, Scene)
	SHADER_PARAMETER_STRUCT_INCLUDE(FInstanceCullingDrawParams, InstanceCullingDrawParams)

	RENDER_TARGET_BINDING_SLOTS()
END_SHADER_PARAMETER_STRUCT()
```

これにより、C++ の定義クラスと USF の実装が関連付けられるため、 C++ 定義クラスを使ってシェーダーを指定したり、 RDG のパラメータ構造体を使ってシェーダーにパラメータを渡すことができるようになります。
特に RDG のマクロによるパラメータ定義は便利です。主機能としては C++ 構造体を定義するマクロなのですが、同時にパラメータの名前やシェーダー側での参照名などのメタデータを定義してくれます。
手動でシェーダーへのパラメータのバインディングを書かなくても、RDG パスへパラメータ構造体として渡すだけで、名前や型をもとにバインディングやライフタイム管理を行ってくれます。

上で一度みたコードですが、パラメータ構造体を RDG のパスにわたしている部分のコードを再度見てみます。
```cpp
// パラメータ構造体の確保を行う
FTinyRendererShaderParameters* PassParameters = GraphBuilder.AllocParameters<FTinyRendererShaderParameters>();
// パラメータ構造体にパラメータをセット
PassParameters->View = View->ViewUniformBuffer;
PassParameters->Scene = SceneUniforms.GetBuffer(GraphBuilder);
// RenderTargets は RENDER_TARGET_BINDING_SLOTS マクロで定義されたスロットを指している。
PassParameters->RenderTargets[0] = FRenderTargetBinding(SceneTextures.SceneColorTexture,
														ERenderTargetLoadAction::EClear);
PassParameters->RenderTargets.DepthStencil = FDepthStencilBinding(SceneTextures.SceneDepthTexture,
																	ERenderTargetLoadAction::EClear,
																	ERenderTargetLoadAction::ELoad,
																	FExclusiveDepthStencil::DepthWrite_StencilWrite);
// パラメータ構造体 (PassParameters) を RDG のパスに渡す。これだけで RDG がシェーダーへのパラメータのバインディングやライフタイム管理を行ってくれる
AddSimpleMeshPass(
	GraphBuilder, PassParameters, nullptr, *View, nullptr,
	RDG_EVENT_NAME("TinyRendererBasePass"),
	View->UnscaledViewRect, ERDGPassFlags::Raster,
	[View, MeshBatches](FDynamicPassMeshDrawListContext* DynamicMeshPassContext)
	{
		// 省略。パスの実装
	});
```

特にリソース管理を人間が書かなくていいのは大きな利点と言えるでしょう。 注意点として、RDG が管理しているリソース(特に ~Ref みたいな型のリソース)はパスの外側ではまだ確保されていないことが普通です。そのため、リソースの実体にアクセスするためには AddPass や AddSimpleMeshPass などのパス実装の中で行う必要があります。
RDG はパスとそれが必要とするリソースを紐づけて管理することで、リソースを最適化するため、。

つまり、RDG で定義したパラメータ構造体を RDG パスに渡すというのは、構造体に含まれるリソースをメタデータをもとに列挙させ、必要に応じてリソースを確保・解放してもらうということになります。

## MeshBatch の描画命令を発行する MeshPassProcessor 
さて、CPU 側でのメッシュの準備と、GPU 側でそれを処理するシェーダーが準備できたので、それらを使って描画パスを発行する MeshPassProcessor を作成します。

### FTinyRendererBasePassMeshProcessor

```cpp
class FTinyRendererBasePassMeshProcessor : public FMeshPassProcessor
{
public:
	FTinyRendererBasePassMeshProcessor(const FSceneView* InView,
	                                   FMeshPassDrawListContext* InDrawListContext)
		: FMeshPassProcessor(nullptr, InView->GetFeatureLevel(), InView, InDrawListContext),
		  FeatureLevel(InView->GetFeatureLevel())
	{
		/* メッシュ描画時の RenderState を設定。パイプラインの挙動を制御することになる */
		PassDrawRenderState.SetBlendState(TStaticBlendState<>::GetRHI());
		PassDrawRenderState.SetDepthStencilAccess(FExclusiveDepthStencil::DepthWrite_StencilWrite);
		PassDrawRenderState.SetDepthStencilState(TStaticDepthStencilState<>::GetRHI());
	}

	/* この MeshPassProcessor を通じて指定された MeshBatch のメッシュ描画コマンドをコマンドリストに追加する処理 */
	bool TryAddMeshBatch(const FMeshBatch& MeshBatch,
	                     const uint64 BatchElementMask,
	                     const FPrimitiveSceneProxy* PrimitiveSceneProxy,
	                     const FMaterial& MaterialResource,
	                     const FMaterialRenderProxy& MaterialRenderProxy,
	                     const int32 StaticMeshId)
	{
		/* MeshBatch が利用する VertexFactory を取得 */
		const FVertexFactory* VertexFactory = MeshBatch.VertexFactory;
		TMeshProcessorShaders<FTinyRendererShaderVS, FTinyRendererShaderPS> TinyRenderPassShaders;

		/* MeshBatch が利用する ShaderType を登録 */
		FMaterialShaderTypes ShaderTypes;
		ShaderTypes.AddShaderType<FTinyRendererShaderVS>();
		ShaderTypes.AddShaderType<FTinyRendererShaderPS>();

		/* 上で登録した ShaderType と MeshBatch に割り当てられたマテリアルをもとに、実際に利用するシェーダーコードたちを取得 */
		FMaterialShaders Shaders;
		if (const FVertexFactoryType* VertexFactoryType = VertexFactory->GetType();
			!MaterialResource.TryGetShaders(ShaderTypes, VertexFactoryType, Shaders))
		{
			return false;
		}

		/* 頂点シェーダーとピクセルシェーダーを取得 */
		Shaders.TryGetVertexShader(TinyRenderPassShaders.VertexShader);
		Shaders.TryGetPixelShader(TinyRenderPassShaders.PixelShader);

		/* メッシュ描画時の RenderState を設定 */
		const FMeshPassProcessorRenderState DrawRenderState(PassDrawRenderState);

		FMeshMaterialShaderElementData ShaderElementData;
		ShaderElementData.InitializeMeshMaterialData(ViewIfDynamicMeshCommand, PrimitiveSceneProxy,
		                                             MeshBatch, StaticMeshId, true);

		const FMeshDrawCommandSortKey SortKey = CalculateMeshStaticSortKey(
			TinyRenderPassShaders.VertexShader, TinyRenderPassShaders.PixelShader);

		/* ラスタライザの FillMode と CullMode を設定 */
		const FMeshDrawingPolicyOverrideSettings OverrideSettings = ComputeMeshOverrideSettings(MeshBatch);
		const ERasterizerFillMode MeshFillMode = ComputeMeshFillMode(MaterialResource, OverrideSettings);
		const ERasterizerCullMode MeshCullMode = ComputeMeshCullMode(MaterialResource, OverrideSettings);

		/* MeshBatch に対応する描画コマンドを作成し、内部でコマンドリストに追加 */
		BuildMeshDrawCommands(
			MeshBatch,
			BatchElementMask,
			PrimitiveSceneProxy,
			MaterialRenderProxy,
			MaterialResource,
			DrawRenderState,
			TinyRenderPassShaders,
			MeshFillMode,
			MeshCullMode,
			SortKey,
			EMeshPassFeatures::Default,
			ShaderElementData);
		return true;
	}

	virtual void AddMeshBatch(const FMeshBatch& MeshBatch,
	                          const uint64 BatchElementMask,
	                          const FPrimitiveSceneProxy* PrimitiveSceneProxy,
	                          const int32 StaticMeshId = -1) override
	{
		const FMaterialRenderProxy* MaterialRenderProxy = MeshBatch.MaterialRenderProxy;

		while (MaterialRenderProxy)
		{
			if (const FMaterial* MaterialResource = MaterialRenderProxy->GetMaterialNoFallback(FeatureLevel);
				MaterialResource && TryAddMeshBatch(MeshBatch, BatchElementMask, PrimitiveSceneProxy,
				                                    *MaterialResource, *MaterialRenderProxy, StaticMeshId))
			{
				break;
			}
			/* 最初に取得したマテリアルが利用できなかったりコマンドの作成に失敗した場合は、Fallback のマテリアルを試す。
			   Fallback のマテリアルがない場合には nullptr が返るので、ループを抜ける */
			MaterialRenderProxy = MaterialRenderProxy->GetFallback(FeatureLevel);
		}
	}

private:
	FMeshPassProcessorRenderState PassDrawRenderState;
	ERHIFeatureLevel::Type FeatureLevel;
};
```

MeshPassProcessor は、UE が提供する `FMeshPassProcessor` を継承して作成するもので、シェーダーとそのパラメータをもとにメッシュ描画コマンドを発行します。詳細は[前回記事](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2/#メッシュレンダリング)および[公式ドキュメント](https://dev.epicgames.com/documentation/ja-jp/unreal-engine/mesh-drawing-pipeline-in-unreal-engine#fmeshpassprocessor)を参考にしてください。
ここで発行されたメッシュ描画コマンドが、更に RHI コマンド、プラットフォーム API へと変換され GPU に送信されることで描画が行われます。

`FMeshPassProcessor` には GPU のメッシュ描画バイプラインを設定するための便利な機能が多数用意されています。DepthStencil、BlendState、FillMode、CullMode などの設定を行うことで、描画の挙動を制御することができます。
また、上記の実装では、USF によるシェーダー実装とマテリアルをあわせて利用する方法も示されています。

# BP ラッパーの作成
作成したレンダラを BP から利用するためのラッパーを作成します。
基本的には単なる BP 向けクラスなのですべては解説しませんが、特に参考になりそうな部分のみ解説します。

## API の定義
以下のような単純な API の BP クラスを作成しました。

```cpp
UCLASS(BlueprintType)
class STATICMESHRENDERER_API UTinyRenderer : public UObject
{
	GENERATED_BODY()

public:
	UTinyRenderer();

	/* レンダーターゲットを指定して TinyRenderer を作成 */
	UFUNCTION(BlueprintCallable, Category = "Tiny Renderer",
		meta = (AutoCreateRefTerm = "BackgroundColor", WorldContext = "WorldContextObject"))
	static UTinyRenderer* CreateTinyRenderer(UObject* WorldContextObject,
	                                         UTextureRenderTarget2D* RenderTarget);

	/* 描画する StaticMesh をセット */
	UFUNCTION(BlueprintCallable, Category = "Static Mesh Renderer")
	void SetStaticMesh(UStaticMesh* InStaticMesh, const int32 LODIndex, const FTransform& InTransform);

	/* 描画を行う */
	UFUNCTION(BlueprintCallable, Category = "Static Mesh Renderer")
	void Render();

	/* カメラの設定 */
	UPROPERTY(BlueprintReadWrite, Category = "Static Mesh Renderer")
	FMinimalViewInfo ViewInfo;

private:
	// 省略
};
```


## カメラ設定 (FMinimalViewInfo) から ViewFamily の構築
UE では、描画には ViewFamily という構造体が必要です。今回作成したレンダラでも、共通した ViewFamily の設定に基づいて描画を行うように実装していました。
ViewFamily を構築するにあたっても、よく利用するカメラ設定と共通の項目で設定できたほうが便利です。そこで、 `FMinimalViewInfo` という構造体を設定項目として受け付けるようにしました。

`FMimalViewInfo` も UE が提供している View 設定の構造体で、以下のような内容を持ちます。

```cpp
struct FMinimalViewInfo
{
	GENERATED_USTRUCT_BODY()

	/** Location */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category=Camera)
	FVector Location;

	/** Rotation */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category=Camera)
	FRotator Rotation;

	/** The horizontal field of view (in degrees) in perspective mode (ignored in orthographic mode). */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category=Camera)
	float FOV;

	/** The originally desired horizontal field of view before any adjustments to account for different aspect ratios */
	UPROPERTY(Transient)
	float DesiredFOV;

	/** The desired width (in world units) of the orthographic view (ignored in Perspective mode) */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category=Camera)
	float OrthoWidth;

	... 以下省略
```

このように、よく見る UE のカメラ設定と同じような項目を持っていることがわかります。

### UTinyRenderer::Renderer
UTinyRenderer は、内部で FTinyRenderer オブジェクトを保持しています。 UTinyRenderer::Renderer では FTinyRenderer の Render を呼び出すことで描画を行いますが、それ以外にも ViewFamily の初期化や RDGBuilder の作成と実行といった重要な処理を行っています。

```cpp
void UTinyRenderer::Render()
{
	SCOPED_NAMED_EVENT(UTinyRenderer_Render, FColor::Green);
	
	if (!StaticMesh || !RenderTarget)
	{
		UE_LOG(LogTemp, Warning, TEXT("UStaticMeshRenderBP::RenderStaticMesh: Invalid parameters"));
		return;
	}

	/* RenderTaget から 描画リソースを取得 */
	const FTextureRenderTargetResource* RenderTargetResource = RenderTarget->GameThread_GetRenderTargetResource();


	/* ViewFamily オブジェクトの作成 */
	FSceneViewFamily::ConstructionValues ConstructionValues(RenderTargetResource, nullptr, FEngineShowFlags(ESFIM_Game));
	ConstructionValues.SetTime(FGameTime::GetTimeSinceAppStart());
	TUniquePtr<FSceneViewFamilyContext> ViewFamily = MakeUnique<FSceneViewFamilyContext>(ConstructionValues);

	/* ScreenPercentage の無効化 */
	ViewFamily->EngineShowFlags.ScreenPercentage = false;
	ViewFamily->SetScreenPercentageInterface(new FLegacyScreenPercentageDriver(*ViewFamily, 1.0f));

	/* MinimalViewInfo から ViewInitOptions を作成 */
	const FIntRect ViewRect(0, 0, RenderTarget->SizeX, RenderTarget->SizeY);
	FSceneViewInitOptions ViewInitOptions;
	ViewInitOptions.SetViewRectangle(ViewRect);
	ViewInitOptions.ViewFamily = ViewFamily.Get();
	ViewInitOptions.ViewOrigin = ViewInfo.Location;
	ViewInitOptions.ViewRotationMatrix = FMatrix(
		{0, 0, 1, 0},
		{1, 0, 0, 0},
		{0, 1, 0, 0},
		{0, 0, 0, 1});
	ViewInitOptions.FOV = ViewInfo.FOV;
	ViewInitOptions.DesiredFOV = ViewInfo.FOV;
	/* 投影行列を計算し、ViewInitOptions に設定 */
	FMinimalViewInfo::CalculateProjectionMatrixGivenViewRectangle(ViewInfo,
	                                                              AspectRatio_MaintainYFOV,
	                                                              ViewRect,
	                                                              ViewInitOptions);

	ENQUEUE_RENDER_COMMAND(FStaticMeshRenderCommand)(
		[ViewFamily = MoveTemp(ViewFamily), LODIndex = LODIndex, ViewInitOptions, StaticMesh = StaticMesh, MeshTransform = Transform](
		FRHICommandListImmediate& RHICmdList) mutable
		{
			SCOPED_NAMED_EVENT(FStaticMeshRenderCommand_Render, FColor::Green);

			/* TinyRenderer オブジェクトの作成 */
			FTinyRenderer Renderer(*ViewFamily);
			/* RenderThread で ViewFamily の初期化を完了 */
			GetRendererModule().CreateAndInitSingleView(RHICmdList, ViewFamily.Get(), &ViewInitOptions);

			/* RDGBuilder の作成 */
			FRDGBuilder GraphBuilder(RHICmdList,
			                         RDG_EVENT_NAME("StaticMeshRender"),
			                         ERDGBuilderFlags::AllowParallelExecute);
			/* StaticMesh の設定 */
			Renderer.SetStaticMesh(StaticMesh, LODIndex, MeshTransform.ToMatrixWithScale());
			
			/* 作成したレンダラによる描画処理の登録 */
			Renderer.Render(GraphBuilder);

			/* RDGBuilder による RHI コマンドの発行と実行 */
			GraphBuilder.Execute();
		});
}
```

BP から設定された MinimalViewInfo には、投影モードや FOV などの情報が含まれています。これをもとに、 FSceneViewInitOptions という View 初期化オプション構造体を作成します。一部は手動で設定する必要がありますが、投影行列の計算といった複雑な部分は `FMinimalViewInfo::CalculateProjectionMatrixGivenViewRectangle` を使って自動的に設定することができます。
また、これを利用することによって、UE のカメラと同じような挙動をさせることができます。

`ENQUEUE_RENDER_COMMAND` マクロで囲まれた部分は、次の RenderThread 処理で実行するように予約される部分です。 ViewFamily の完全な初期化は RenderThread で行う必要があるため、こちらで書かれています。

また、RGDBuilder や FTinyRenderer のオブジェクトもここで作成しています。これらは毎フレーム作成され、フレームの終了で破棄されるということです。
最後には RDGBuilder に登録された描画処理を下に RHI コマンドの発行が行われます。
このように見ると、今回書いたレンダラは RDGBuilder に描画処理の登録を行うものであり、実際のコマンドの発行は RDGBuilder に任せていることがよくわかります。パスに関わるコマンドが一度 RDGBuilder に登録され、最後にまとめてコマンドを発行する仕組みになっていることで、不要な処理の最適化や、任意のリソースがどの期間存在していなければならないかの決定をすることができるのです。

# パフォーマンスの検証
簡単にですが、作成したレンダラのパフォーマンスを検証してみます。

以下の3つを比較してみます。
1. SceneCaptureComponent2D による描画 (よくやるやつ)
1. 以前作成した FPreviewScene による描画
1. 今回作成した単一パスレンダラ(TinyRenderer)の描画

その他詳細は以下のとおりです。
- Win64 Development Build
- 描画サイズは 500x500 で描画
- サンプルのメッシュは
	- Triangles: 19382
	- Vertices: 11556
	- Materials: 1
- SceneCapture2D は SceneColor with SceneDepth をキャプチャし、マテリアルを使って深度で背景抜き。
- FPreviewScene は FPreviewScene でレンダリング後、背景抜き。
- TinyRenderer レンダリングしてそのまま表示 (RenderTarget の ClearColor を透明にしているので背景が描画されず、抜く必要がない)

セットアップが雑で(特に SceneCapture2D は制御がしにくいため)少しずつ見た目が違いますが、調整すればほぼ同じ見た目にすることは可能と思われます。

## 比較

検証環境は以下のとおりです。

- CPU: Ryzen 9 3900X 12-Core Processor
- RAM: 128GB
- GPU: GeForce RTX 3080 10GB

### Nsight Graphics の Scrubber を眺める
まずは、こんな比較画面のフレームを計測してみます。
![](#/compare.png)
ViewportSize: 1920x1080

Nsight Graphics の Scrubber を使って、フレーム内の描画処理を見てみます。
![](#/nsight-scrubber.png)

注意: この横軸は時間ではありません。

- <b style="color: blue">青領域</b>: メインのViewportの描画処理
- <b style="color: red">赤領域</b>: SceneCapture2D による描画処理
- <b style="color: yellow">黃領域</b>: FPreviewScene による描画処理
- <b style="color: green">緑領域</b>: TinyRenderer による描画処理

なんというか、驚異的です。メインの Viewport が最も大きな部分を占めているのは当然として、SceneCaptrue2D と FPreviewScene もそれなりに目立つ大きさで表示されています。また、処理内容としてもメインの Viewport と類似していて、Scene に対する一通りの描画処理が行われていそうなことがわかります。

いっぽう、TinyRenderer はもはや Scrubber 上ではほとんど見えないほどに小さな処理で済んでいることが伺えます。

### フレーム内処理時間の比較
次に、各描画処理の処理時間を比較してみます。

| 描画手法 | 処理時間 | フレーム内における割合 |
| --- | --- | --- |
| SceneCapture2D | 4.12 ms | 17.4 % |
| FPreviewScene | 1.11 ms | 4.7 % |
| TinyRenderer | 0.02 ms (16.38 μs) | 0.1 % |
| メインの Viewport(参考) | 約 13 ms | 約 55 % |

処理速度の面でも TinyRenderer が優位に立っています。また、詳しく計測していませんが、TinyRenderer は描画先の RenderTarget と Depth しか利用しないので、リソース面の優位性もあると思われます。

**もちろん、他の描画手法も BasePass の該当メッシュの描画処理だけ抜き出せば TinyRenderer と同等程度の処理時間しかかかっていません。** 冒頭の繰り返しになりますが、TinyRenderer は凄いことをしているわけではありません。 ただ、なにぶん標準の方法は単一メッシュ描画には不要な処理がほとんどすべてを占めてしまっており、それらを局所的に OFF にしたりすることにも限界があるため、全体としての処理時間が大きくなってしまっているのです。

### いっぱい描画したときの FPS の比較
この比較は FPreviewScene と TinyRenderer のみを対象に行いました。
SceneCapture2D は描画したい数だけレベル上に Actor を配置する必要があるので、そもそも個別にメッシュを大量にレンダリングするのが大変すぎて検証からはずしました。

画面は以下のように、10x10 で 100 個の StaticMesh を個別に描画し、毎フレーム描画するようにしました。

![](#/10x10.png)

以下が FPS の比較結果です。

| 描画手法 | 平均 FPS |
| --- | --- |
| TinyRenderer | 43.0 FPS |
| FPreviewScene | 2.2 FPS |
| SceneCapture2D | 100 個配置してRenderTarget設定するやつ作るの面倒すぎて検証してない |

やはり、 FPS にも大きな差が出ました。TinyRenderer は 2万ポリゴン近いメッシュを 100 個描画しても 40 FPS 程度で安定しているので、軽量なメッシュをインベントリで並べて表示するくらいの用途では十分な速度が得られると思われます。
いっぽう、 [FPreviewScene](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer/#独自の専用シーンを用意できないか) は設定によって SceneCapture2D よりは軽量であるはずですが、実用的な速度にはなりませんでした。

# さらなる改善可能性

## Opaque 以外の BlendMode の対応
現在、TinyRenderer は Opaque な BlendMode のマテリアルのみをサポートしています。半透明等の BlendMode もサポートするためには、ピクセルシェーダーの実装を変更する必要があります。

## ライティングの拡張
現在は一つの DirectionalLight のみをサポートしています。また、パラメータも固定されています。ピクセルシェーダーの変更によって、複数のライトやポイントライト、スポットライトなどのライトのサポートを追加することができます。

## Shader Permutaion の最適化
TinyRenderer のための MeshMaterialShader は、TinyRenderer で描画を行わないマテリアルなどに対しても組み合わせが作成されてしまいます。

何らかの方法で、TinyRenderer で利用したいマテリアルのみを設定できれば、TinyRenderer のためにシェーダーコンパイル時間が伸びる懸念を解消できますし、レンダラのシェーダーを変更したときの作業のイテレーションも早くなります。

## パフォーマンスの改善
すでに十分に高速ではありますが、主に CPU 側での描画コマンドの発行についてはまだ最適化の余地があります。というのも、現在の実装では毎フレーム MeshBatch や MeshDrawCommand の作成を1から行っています。
これらについては、フレームをまたいで再利用を行う実装を考えることは十分に可能であり、(実際にエンジンの StaticMesh を使ったシーン描画はそのようになっており)、さらなるパフォーマンスの向上が期待できます。

# まとめ
今回の記事では、シンプルな StaticMesh レンダラである TinyRenderer の紹介と、その実装方法について解説しました。TinyRenderer は目的のために必要なこと以外を何もしないことで高速に動作します。
UE の RHI や RDG、マテリアルといったグラフィックス機能は、エディタの背後で動くだけでなく、プラグイン実装のために柔軟に利用することができます。TinyRenderer の実装も、それらのお陰でかなりシンプルに実現されています。

記事内でも触れましたが、TinyRenderer はあくまで単一メッシュの描画に特化したものであり、複数のメッシュやライト、半透明などの複雑な描画を行う場合には、通常の UE の描画パスを利用することが望ましいです。また、見た目に関しても通常の UE の描画パスとは完全に一致するわけではないため、その点も注意が必要です。
単純に BP から制御してメッシュ描画を行いたい場合には、 FPreviewScene などの手法を取るのが適切と言えます。いくつかの個数のメッシュを少し表示したいだけであれば、 SceneCapture2D で頑張るのでも十分でしょう。


現時点では、技術的には可能でも実装していないことも多数あるため、今後気が向いたら改善していくかもしれません。よければ改造して遊んでみたり、Issue や PR を投げてもらえると楽しいので助かります。