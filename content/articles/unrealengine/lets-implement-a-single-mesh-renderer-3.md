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
この記事では、UE5 上でメインの World とは別の空間・ビューポートを対象としたの軽量なレンダリング機能を実装してみるものです。
想定用途は、アイテムのプレビュー表示など、高度なレンダリング機能を必要としないが、軽量に個別のメッシュを描画したい場合などです。

この記事は、以下の記事の続編になります。

1. [単一 Static Mesh レンダラを FPreviewScene で実装する](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer)
2. [単一 Static Mesh レンダラを独自メッシュパスで実装する...ための前提知識編](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2)

1 の記事では、FPreviewScene というユーティリティを使って、メインの World とは別の UWorld インスタンスを作成し、その内部のカメラにレンダリングさせることで、単一の Static Mesh を専用ビューポートに描画する方法を紹介しました。

しかし、この方法には課題もありました。単一メッシュをレンダリングしたいだけなのに専用の UWorld インスタンスが必要だったり、レンダリング機能についても多数のメッシュを描画する前提で設計されていたりするために、速度やメモリ資源の面で無駄が多いのです。使い勝手としてはメリットがありますが、処理負荷としては UWorld や FScene のインスタンスが必要なぶん SceneCapture2D よりも悪いかもしれません。 

そこで、 2 の記事では、単一メッシュを描画するための最小限の機能を持つレンダラを実装するための前提知識を紹介しました。この記事では、その知識を元に、実際に単一メッシュを描画するためのレンダラを実装していきます。

# プラグインの公開
この記事の執筆にあたっては、プラグインとして機能を実装しました。プラグインのソースコードは [GitHub]() で公開しています。
中身の説明はともかくとりあえず使ってみたいという方は、[使い方](#使い方) のセクションまでスキップしてください。
なお、実験的な実装であり、きちんとした検証は行っていないので、あくまでも手法の参考としてご利用ください。

# 目次

# レンダラの実装
UE の デスクトップやハイエンドコンソール向けのレンダリング機能は、 `FDeferredShadingSceneRenderer` というクラスを中心に構成されています。このクラスは、名前の通り Deferred Rendering による描画機能を提供します。しかし、Deferred Rendering は多数のメッシュや光源を描画したり、高度なポストプロセスを適用したりするのには有益ですが、今回のようなシンプルな単一メッシュの描画には不要かもしれません。そこで、今回はデフォルトのレンダラを使わず、単一のパスでライティングまでを行う Forward Rendering によるレンダラを実装してみます。また、 UWorld や FScene といったシーン表現もオーバースペックなので利用せず、StaticMesh アセットを直接処理して描画することにします。


おおまかなレンダリングの流れは以下のようになります。



すべてのコードを示すと長くなるため、ここでは主要な部分のみを抜粋して説明します。また、エラーハンドリング等も記事上では省略しています。
全体のコードは [GitHub]() を参照してください。プラグインのソースを読みながら、その解説として記事を読むのが理解しやすいかもしれません。

## レンダラクラス FTinyRenderer の定義
手始めに、レンダラを表すクラスとして以下のような定義の `FTinyRenderer` クラスを作成します。

```cpp
class FTinyRenderer
{
public:
    // コンストラクタ
	explicit FTinyRenderer(const FSceneViewFamily& InViewFamily);
    // 描画メッシュの設定
	void SetStaticMesh(UStaticMesh* InStaticMesh, const FMatrix& InTransform);
    // 描画実行
	void Render(FRDGBuilder& GraphBuilder);

private:
	FTinySceneTextures SetupSceneTextures(FRDGBuilder& GraphBuilder) const;
	void RenderBasePass(FRDGBuilder& GraphBuilder, const FTinySceneTextures& SceneTextures);
	FGPUSceneResourceParameters SetupGPUSceneResourceParameters(FRDGBuilder& GraphBuilder) const;
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
	UStaticMesh* Mesh = StaticMesh.Get();

	// StaticMesh から MeshBatch を作成
	TArray<FMeshBatch> MeshBatches;
	CreateMeshBatch(Mesh, 0, MeshBatches)

	// GPUScene のためのパラメータをセットアップ
	const FGPUSceneResourceParameters GPUSceneResourceParameters = SetupGPUSceneResourceParameters(GraphBuilder);
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


しかし、今回のような単一メッシュの描画には、コンポーネントはオーバースペックです。そこで、コンポーネントを介さずに StaticMesh から直接 MeshBatch を作成する方法を考えます。
これを実装したのが `CreateMeshBatch()` 関数です。

```cpp
/**
 * @param InStaticMesh MeshBatch を作成する StaticMesh
 * @param InLODIndex MeshBatch を作成する StaticMesh の LODIndex
 * @param InMeshBatches 作成した MeshBatch を格納する配列
 * @return MeshBatch が作成できた場合は true、それ以外は false
 */
bool CreateMeshBatch(UStaticMesh* InStaticMesh, const int32 InLODIndex, TArray<FMeshBatch>& InMeshBatches)
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
		// 頂点ファクトリを設定
		MeshBatch.VertexFactory = &RenderData->LODVertexFactories[LODIndex].VertexFactory;
		MeshBatch.Type = PT_TriangleList;

		// MeshBatch の Element に IndexBuffer などを格納。MeshBatch は複数の Element を持つことができるが、エンジンでも多くの場合は 1 つの Element しか使われていない
		FMeshBatchElement& BatchElement = MeshBatch.Elements[0];
		// 頂点ファクトリの UniformBuffer を設定
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
MeshBatch は一つの MeshBatch に１つのマテリアルが割り当てられるため、セクションごとに MeshBatch を作成しています。
マテリアルのレンダースレッド表現については前回の [マテリアルとシェーダーレンダースレッド表現](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2/#マテリアルとシェーダーレンダースレッド表現) を参照してください。


また、頂点ファクトリは独自パスを書くうえで非常に重要です。頂点ファクトリはメッシュの種別に紐づく形で種類が異なり、メッシュの頂点データを後に書く Vertex Shader に提供してくれます。詳細は前回記事の [頂点データの受け渡し](https://strv.dev/blog/unrealengine--lets-implement-a-single-mesh-renderer-2#頂点ファクトリ) を参照してください。
ここでは StaticMesh に合わせて `FLocalVertexFactory` を利用する必要があります。

## GPUScene のためのパラメータをセットアップする
ここでは、 GPUScene のためのパラメータをセットアップしています。
GPUScene は、1つの DrawCall で複数のメッシュを描画するために、シェーダーパラメータとしてプリミティブ情報や、そのインスタンス情報のリスト(GPU インスタンシング)を格納し、パラメータとしてシェーダーに渡すことができる機能です。同一のプリミティブを多数描画する場合などに、描画コストを削減することができます。

今回のレンダラは単一メッシュなのに、どうして GPUScene をセットアップするんだ？　という疑問はもっともです。実際、機能としては必要ありません。ただ、UE の StaticMesh 描画における機能を可能な限り流用しようとすると GPUScene と切っても切り離しにくい部分があるため、ここでは 1 プリミティブ 1 インスタンスの GPUScene をセットアップすることにしました。

```cpp
FGPUSceneResourceParameters FTinyRenderer::SetupGPUSceneResourceParameters(FRDGBuilder& GraphBuilder) const
{
	const FPrimitiveUniformShaderParameters PrimitiveParams = FPrimitiveUniformShaderParametersBuilder{}
	                                                          .Defaults()
	                                                          .LocalToWorld(LocalToWorld)
	                                                          .ActorWorldPosition(LocalToWorld.GetOrigin())
	                                                          .CastShadow(false)
	                                                          .CastContactShadow(false)
	                                                          .InstanceSceneDataOffset(0)
	                                                          .NumInstanceSceneDataEntries(1)
	                                                          .Build();

	const FPrimitiveSceneShaderData PrimitiveSceneData = FPrimitiveSceneShaderData(PrimitiveParams);

	FInstanceSceneShaderData InstanceSceneData{};
	InstanceSceneData.Build(0, /* PrimitiveId */
	                        0, /* RelativeId */
	                        0, /* InstanceFlags */
	                        INVALID_LAST_UPDATE_FRAME, /* LastUpdateFrame */
	                        0, /* CustomDataCount */
	                        0.0f, /* RandomID */
	                        FRenderTransform::Identity, /* LocalToPrimitive */
	                        PrimitiveParams.LocalToRelativeWorld); /* PrimitiveToWorld */

	FGPUSceneResourceParameters GPUSceneParameters;
	{
		/* Primitive Data のバッファを作成 */
		const FRDGBufferRef RDGPrimitiveSceneDataBuffer = CreateStructuredBuffer(GraphBuilder,
			TEXT("PrimitiveSceneDataBuffer"), TArray{PrimitiveSceneData});
		GPUSceneParameters.GPUScenePrimitiveSceneData = GraphBuilder.CreateSRV(RDGPrimitiveSceneDataBuffer);
		GPUSceneParameters.NumScenePrimitives = 1;
	}
	{
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

	// たぶん NRVO が効くでしょう
	return GPUSceneParameters;
}
```

# 使い方