---
title: '単一Static Meshレンダラを独自メッシュパスで実装する'
description: 'アイテムの描画とか、一つだけのメッシュをレンダリングするのに便利なツールを実装してみる記事のその２。独自のメッシュパスを実装して単一パスの軽量なレンダラを書く。'
enforceCreatedAt: 2024/04/07
enforceUpdatedAt: 2024/04/07
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
この記事の執筆にあたっては、プラグインとして機能を実装しました。プラグインのソースコードは [GitHub]() で公開しています。
中身の説明はともかくとりあえず使ってみたいという方は、[使い方](#使い方) のセクションまでスキップしてください。
なお、実験的な実装であり、きちんとした検証は行っていないので、あくまでも手法の参考としてご利用ください。

# 目次

# レンダラの実装
UE の デスクトップやハイエンドコンソール向けのレンダリング機能は、 `FDeferredShadingSceneRenderer` というクラスを中心に構成されています。このクラスは、名前の通り Deferred Rendering による描画機能を提供します。しかし、Deferred Rendering は多数のメッシュや光源を描画したり、高度なポストプロセスを適用したりするのには有益ですが、今回のようなシンプルな単一メッシュの描画には不要かもしれません。そこで、今回はデフォルトのレンダラを使わず、単一のパスでライティングまでを行う Forward Rendering によるレンダラを実装してみます。また、 UWorld や FScene といったシーン表現もオーバースペックなので利用せず、StaticMesh アセットを直接処理して描画することにします。


おおまかなレンダリングの流れは以下のようになります。



すべてのコードを示すと長くなるため、ここでは説明すると面白い部分のみを抜粋して説明します。また、エラーハンドリング等も記事上では省略しています。
全体のコードは [GitHub]() を参照してください。プラグインのソースを読みながら、その解説として記事を読むのが理解しやすいかもしれません。

## レンダラクラス FTinyRenderer の定義
手始めに、レンダラを表すクラスとして以下のような定義の `FTinyRenderer` クラスを作成します。

```cpp
class FTinyRenderer
{
public:
	// コンストラクタ。FSceneViewFamilyを受け取る
	explicit FTinyRenderer(const FSceneViewFamily& InViewFamily);
	// StaticMesh およびその変換行列を設定する
	void SetStaticMesh(UStaticMesh* InStaticMesh, const FMatrix& InTransform);
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
};
```

UE の他の機能との相互利用性を考慮して、 コンストラクタでは `FSceneViewFamily` を受け取って利用します。また、描画するメッシュや変換行列は `SetStaticMesh` で設定し、描画の実行は `Render` で行います。

## レンダリング呼び出しの流れ
まず流れの把握のために、`FTinyRenderer::Render` の実装を見ていきます。

```cpp
void FTinyRenderer::Render(FRDGBuilder& GraphBuilder)
{
	// レンダリング対象の SceneTextures を作成
	const FTinySceneTextures SceneTextures = SetupSceneTextures(GraphBuilder);
	// BasePass をレンダリング
	RenderBasePass(GraphBuilder, SceneTextures);
}
```

流れとしては、まず `SetupSceneTextures` でレンダリングに利用するのテクスチャリソースを作成し、そこに `RenderBasePass` で描画を実行するというものです。
引数の FRDGBuilder は、RDG のビルダークラスで、RHI コマンドの生成やそれに伴うリソースのライフタイム管理を発行するために利用します。詳細は [前回の記事](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2#rdg-を使った描画命令発行のボイラープレート) を参照してください。


それぞれの関数の実装は以下のようになります。

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
	if (!CreateMeshBatch(Mesh, 0, MeshBatches, RequiredFeatures))
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
	- FTinyRendererBasePassMeshProcessor


`AddSimpleMeshPass` は RDG 向けに提供されている便利な関数で、 MeshPassProcessor を使ったメッシュ描画パスに必要なコンテキストのセットアップを行ってくれます。

## StaticMesh から直接 MeshBatch を作成する
通常の UE のシーンでは、 StaticMesh などのアセットを直接シーンに配置されることはありません(できません)。シーンに存在するすべての可視存在は、 `UStaticMeshComponent` など `UPrimitiveComponent` を継承したコンポーネントとして配置されます。StaticMesh などのアセットは、コンポーネントに設定されることで間接的に利用されることになります。
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
bool FTinyRenderer::CreateMeshBatch(UStaticMesh* InStaticMesh, const int32 InLODIndex, TArray<FMeshBatch>& InMeshBatches, FMeshBatchesRequiredFeatures& RequiredFeatures) const
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

	const int32 LODIndex = FMath::Min(InLODIndex, RenderData->LODResources.Num() - 1);
	if (LODIndex < 0)
	{
		return false;
	}

	// 以下、LODResources から指定の LODIndex のメッシュデータを読み出し、MeshBatch を作成する
	const FStaticMeshSectionArray& Sections = RenderData->LODResources[LODIndex].Sections;

	// セクションの数だけ MeshBatch を作成。一般的に、StaticMesh に割り当てられているマテリアルの数と対応している
	for (int32 SectionIndex = 0; SectionIndex < Sections.Num(); SectionIndex++)
	{
		const FStaticMeshSection& Section = Sections[SectionIndex];
		if (Section.NumTriangles == 0)
		{
			continue;
		}

		const FStaticMeshLODResources& LODResource = RenderData->LODResources[LODIndex];

		// データを MeshBatch に格納していく
		FMeshBatch MeshBatch;
		MeshBatch.VertexFactory = &RenderData->LODVertexFactories[LODIndex].VertexFactory;
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

		MeshBatch.LODIndex = LODIndex;
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

			// マテリアルが利用を要求しているレンダリング機能を RequiredFeatures に格納
			if (MaterialInterface->GetRelevance_Concurrent(FeatureLevel).bUsesWorldPositionOffset)
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
GPUScene とは、GPU 側にプリミティブの配置情報などのシーン情報を表すバッファを持つことで、一度のドローコールで複数のメッシュを描画したりできる機能です。特に、同一のプリミティブを多数描画する場合などに命令をまとめ、描画コストを削減することができます。いわゆる GPU Instancing と呼ばれるものなどはこれによって実現されています。

今回のレンダラは単一メッシュなのに、どうして GPUScene をセットアップするんだ？　という疑問はごもっともです。実際、機能としては必要ありません。ただ、UE の StaticMesh 描画実装をうまく流用して実装を行おうとすると GPUScene を利用しないほうが複雑になるため、 1 プリミティブ 1 インスタンスの GPUScene をセットアップすることにしました。

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
	const FVertexFactoryIntermediates VFIntermediates = GetVertexFactoryIntermediates(Input);
	
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

### 独自メッシュ描画パス処理のピクセルシェーダー実装
続いて、ピクセルシェーダーの実装です。

```hlsl
#define SUPPORT_CONTACT_SHADOWS 0

#include "/Engine/Private/BasePassCommon.ush"
#include "/Engine/Generated/Material.ush"
#include "/Engine/Private/ShadingModelsMaterial.ush"
#include "/Engine/Generated/VertexFactory.ush"
#include "/Engine/Private/DeferredLightingCommon.ush"

/* Pixel Shader で使用するデータ */
FLightAccumulator LightAccumulator_SimpleAdd(FLightAccumulator A, FLightAccumulator B)
{
	FLightAccumulator Sum = (FLightAccumulator)0;
	Sum.TotalLight = A.TotalLight + B.TotalLight;
	Sum.ScatterableLightLuma = A.ScatterableLightLuma + B.ScatterableLightLuma;
	Sum.ScatterableLight = A.ScatterableLight + B.ScatterableLight;
	Sum.EstimatedCost = A.EstimatedCost + B.EstimatedCost;
	Sum.TotalLightDiffuse = A.TotalLightDiffuse + B.TotalLightDiffuse;
	Sum.TotalLightSpecular = A.TotalLightSpecular + B.TotalLightSpecular;
	return Sum;
}

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

	/* ディレクショナルライトの影響を計算 */
	FLightAccumulator DirectLighting = (FLightAccumulator)0;
	LightAccumulator_AddSplit(DirectLighting, DiffuseColor, 0.0f, DiffuseColor, 1.0f, false);

	half3 CameraVector = -MaterialParameters.CameraVector;
	float DirectionalLightShadow = 1.0f;

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
	FLightAccumulator NewLighting = AccumulateDynamicLighting(WorldPosition, CameraVector, GBuffer,
	                                                          1, ShadingModelID, LightData,
	                                                          LightAttenuation, 0, uint2(0, 0),
	                                                          DirectionalLightShadow);
	DirectLighting = LightAccumulator_SimpleAdd(DirectLighting, NewLighting);
	half3 Color = DirectLighting.TotalLight;

	/* 最後にエミッシブカラーを加算 */
	half3 Emissive = GetMaterialEmissive(PixelMaterialInputs);
	Color += Emissive;

	/* 最終的な色を出力 */
	OutColor = float4(Color.rgb, 1.0f);
}
```

このピクセルシェーダーは、UE のモバイル向けレンダラを参考に、固定された DirectionalLight による照明のみを行うように実装したシンプルなものです。
エンジンのために便利なユーティリティが多数用意されているため、照明計算やマテリアルのパラメータ取得なども比較的簡単に行うことができます。

`GetMaterialPixelParameters` は、頂点シェーダーで取得した情報をもとに、マテリアルが生成したピクセルシェーダー用のコードを呼び出し、その結果を取得するための関数です。これにより、マテリアルのピクセルシェーダー向け出力を取得することができます。

また、この Pixel

## MeshBatch の描画命令を発行する MeshPassProcessor 
作成した MeshBatch  

# 使い方