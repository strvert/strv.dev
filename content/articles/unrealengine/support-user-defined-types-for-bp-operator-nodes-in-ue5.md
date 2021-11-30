---
title: "UE5のBP演算子ノードにユーザー定義型を対応させる"
description: "UE5で追加されたType promotion機能付き演算子ノードに、ユーザー定義型サポートを追加する方法について"
enforceCreatedAt: 2021/6/8
enforceUpdatedAt: 2021/6/8
tags:
    - Unreal Engine
    - Blueprint
    - Unreal C++
    - Unreal Engine 5
---

# まえがき
## UE5の演算子ノードってなに？
先日Early Accessが開始されたUE5には、仮想化されたジオメトリを扱うシステムであるNaniteや、動的かつ高度なライティングを行うLumenなど目を引く新機能が満載です。
そんな華々しい機能の裏に隠れがちですが、同時に**ブループリントのType promotion**というBlueprintに関する地味ながら便利な変更も追加されています。この変更は、これまでそれぞれの型ごとに別々のノードとして実装されていた各種演算子(Operator)ノードを、任意の型を演算可能な統一された演算子ノードで行えるようにするというものです。

例えばUE4の時点では、加算に関するノードだけで以下のような状況になっていました。
![image.png](#/ue4-operator-nodes.png)

しかし、UE5以降では基本的な演算子ノードの入力ピンがすべてワイルドカードとなり、接続されたデータ型に対する加算処理を行うノードへと自動的に型をpromoteしてくれるようになったのです。
![image.png](#/ue5-operator-node.png)

# 素朴な疑問
Type promotionは簡便かつ整理された状態を提供してくれる素晴らしい変更ですが、この仕様を見ると「**ユーザーが追加した演算可能なデータ型に対してUE5の演算子ノードは対応可能なのか？？**」という疑問が湧いてきます。
C++を用いてワイルドカードを入力として持つBPノードを実装するためには、UFUNCTIONにCustomThunk等のmeta指定子とThunk関数の実装を用いるか、K2_Nodeを継承した独自ノードをUFUNCTIONマクロを用いずに実装する必要があります。Type promotionを行うUE5の演算子ノードも同様に実装されていることは容易に推察ができますが、データ型に対する演算処理のように後からユーザーが追加する可能性があり、かつ内部処理が常に自動生成できるとは限らない処理をワイルドカード化して問題ないのでしょうか。

# 調査結果
エンジンのソースを追った結果、非常に簡単にユーザー定義型をUE5の演算子ノードで扱うことができることがわかりました。以下では、ユーザー定義型をUE5のType promotionに対応させるために踏まえるべき点を記載します。

## 対象とするデータ型
実装例を提示するため、以下のようなサンプルのデータ型を定義しました。このデータ型を複素数型と見做して、UE5の演算子ノードで複素数に定義されるいくつかの演算を実装してみます。

```cpp:ComplexNumber.h
#pragma once
#include "ComplexNumber.generated.h"

USTRUCT(BlueprintType)
struct FComplexNumber
{
	GENERATED_BODY()

	FComplexNumber() : Real(0.0f), Imag(0.0f) {}
	FComplexNumber(const float Real, const float Imaginary) : Real(Real), Imag(Imaginary) {}

	UPROPERTY(BlueprintReadWrite, EditAnywhere)
	float Real;

	UPROPERTY(BlueprintReadWrite, EditAnywhere)
	float Imag;
};
```

## 実装例
詳細な説明に先んじて、実装例を提示します。

```cpp:ComplexNumberBlueprintLibrary.h
#pragma once

#include "CoreMinimal.h"
#include "ComplexNumber.h"
#include "ComplexNumberBlueprintLibrary.generated.h"

UCLASS()
class UComplexNumberBlueprintLibrary : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()
public:

	// ---------演算の実装はここから-----------

	// ComplexNumber + ComplexNumber (加算)
	UFUNCTION(BlueprintPure, meta=(DisplayName="ComplexNumber + ComplexNumber", CompactNodeTitle="+"), Category="ComplexNumber")
	static FComplexNumber Add_ComplexNumberComplexNumber(const FComplexNumber A, const FComplexNumber B) { return FComplexNumber(A.Real + B.Real, A.Imag + B.Imag); }

	// ComplexNumber - ComplexNumber (減算)
	UFUNCTION(BlueprintPure, meta=(DisplayName="ComplexNumber - ComplexNumber", CompactNodeTitle="-"), Category="ComplexNumber")
	static FComplexNumber Subtract_ComplexNumberComplexNumber(const FComplexNumber A, const FComplexNumber B) { return FComplexNumber(A.Real - B.Real, A.Imag - B.Imag); }

	// ComplexNumber * float (floatとの乗算)
	UFUNCTION(BlueprintPure, meta=(DisplayName="ComplexNumber * float", CompactNodeTitle="*"), Category="ComplexNumber")
	static FComplexNumber Multiply_ComplexNumberFloat(const FComplexNumber A, const float B) { return FComplexNumber(A.Real * B, A.Imag * B); }

	// ---------------ここまで---------------

	// ToString	(ComplexNumber)
	UFUNCTION(BlueprintPure, meta=(DisplayName = "ToString (ComplexNumber)", CompactNodeTitle="->", BlueprintAutoCast), Category="ComplexNumber")
	static FString ToString(const FComplexNumber In)
	{
		return FString::Printf(TEXT("%.3f %s %.3fi"),
				In.Real,
				In.Imag < 0 ? TEXT("-") : TEXT("+"),
				FMath::Abs(In.Imag));
	}
};

```

たったこれだけです。このコードをコンパイルすると、BPエディタにおいて**ComplexNumber同士の加算**、**ComplexNumber同士の減算**、**ComplexNumberとfloatの乗算**が演算子ノードによって行えるようになります。

> 接続が許可されるようになって……
> ![image.png](#/complex-type-1.png)
> 繋ぐとComplexNumberの加算ノードになる！
> ![image.png](#/complex-type-2.png)

こうして演算子ノードと接続した際に行われる処理は、当然ながら先程示したコードで実装されていた関数の内部の処理に置き換わっています。

## 対応のための条件
なんと、UE5の演算子ノードのType promotionに対応するにあたって必要な点は以下の3つのみです。

- 対象のデータ型に対して、`BlueprintPure`を指定されたstaticなUFUNCTIONの実装がどこかに存在すること。
- 演算を実装したUFUNCTIONに戻り値が存在すること。
- 演算を実装したUFUNCTIONの名前が`[演算名Prefix]_`で始まること。

> 参考: Engine\Source\Editor\BlueprintGraph\Private\BlueprintTypePromotion.cpp

必要となる`演算名Prefix`については次節で触れます。

先の実装についていたその他の指定子などは、全て細かなノードの見た目やカテゴリ表示に関するものであり、Type promotionとは一切関係がありません。条件を満たしたUFUNCTIONが存在するだけで、勝手にBPエディタがその存在を認識して、演算子ノードが処理の呼び分けを行ってくれるようになるのです。

## Type promotionがサポートする演算
以下に、Type promotionがサポートする演算と、その実装をするために必要なUFUNCTIONのPrefixとなる演算名の対応表を示します。

| 演算 | Prefix |
| ---- | -------------------------- |
| +    | Add                        |
| *    | Multiply                   |
| -    | Subtract                   |
| /    | Divide                     |
| >    | Greater                    |
| >=   | GreaterEqual               |
| <    | Less                       |
| <=   | LessEqual                  |
| !=   | NotEqual                   |
| ==   | EqualEqual                 |

> 参考: Engine\Source\Editor\BlueprintGraph\Private\BlueprintTypePromotion.cpp

このPrefixをUFUNCTIONの関数名の頭に付加することで、対応する演算の実装として認識してもらうことが出来ます。簡単ですね！

# おまけ
簡単に動くのはいいですが、一体どんな仕組みで動いているのか気になってしまうと思いますので、少し見てみましょう。

## どうやって実装を収集しているのか
実装を覗くと、この部分はなかなかのパワー的処理によって実現されています。以下はエンジンのソースコードからの抜粋です。

```cpp:BlueprintTypePromotion.cpp(抜粋)
void FTypePromotion::CreateOpTable()
{
	TRACE_CPUPROFILER_EVENT_SCOPE(FTypePromotion::CreateOpTable);
	const UEdGraphSchema_K2* Schema = GetDefault<UEdGraphSchema_K2>();

	OperatorTable.Empty();

	TArray<UClass*> Libraries;
	GetDerivedClasses(UBlueprintFunctionLibrary::StaticClass(), Libraries);
	for (UClass* Library : Libraries)
	{
		// Ignore abstract libraries/classes
		if (!Library || Library->HasAnyClassFlags(CLASS_Abstract))
		{
			continue;
		}

		for (UFunction* Function : TFieldRange<UFunction>(Library, EFieldIteratorFlags::ExcludeSuper, EFieldIteratorFlags::ExcludeDeprecated))
		{
			if(!IsPromotableFunction(Function))
			{
				continue;
			}

			FEdGraphPinType FuncPinType;
			FName OpName = GetOpNameFromFunction(Function);

			if (OpName != OperatorNames::NoOp && Schema->ConvertPropertyToPinType(Function->GetReturnProperty(), /* out */ FuncPinType))
			{
				AddOpFunction(OpName, Function);
			}
		}
	}
}
```

この`CreateOpTable`というメソッドが何をしているかをざっくりまとめると、以下のようになります。

1. `UBlueprintFunctionLibrary`を継承しているすべてのUClassを取得して配列に詰める。
1. UClassの配列をループして走査しながら、それぞれのUClassが持っているUFUNCTIONを走査する。
1. 前述の3つの条件を満たすUFUNCTIONが現れたら、それを演算子ノードの実装に利用可能であると見做してルックアップテーブルに詰める！

パワーを感じます。パワーです。とてもメタメタしています。楽しいですね。
なお、この`CreateOpTable`メソッドは、所属している`FTypePromotion`クラスのコンストラクタで呼び出されている他、エンジンのモジュール構成に変化があったとき(ホットリロード時など)に呼び出されるようになっています。

## なぜ本来の実装ノードがBPのメニューに現れないか
先程の実装例のUFUNCTIONは、ここまで述べてきたUE5以降のType promotionシステムの知識を無いものとして考えると、ただのBPから利用可能なUFUNCTION定義です。つまり、従来の考え方からするとそれ自体もBPのノードリストに登録されていなければおかしいはずです。しかし、実際にはそうなっておらず、「`ComplexNumber`用の演算ノード」は現れなくなっています。以下の画像のように、統合されたものしか表示されません。

![image.png](#/question.png)

これは、以下の部分のエンジンコードを見るとわかります。このメソッドは長いため、今回の内容にとって重要ではない場所は省いています。

```cpp:BlueprintFunctionNodeSpawner.cpp
UBlueprintFunctionNodeSpawner* UBlueprintFunctionNodeSpawner::Create(UFunction const* const Function, UObject* Outer/* = nullptr*/)
{
    // 略
	bool const bIsPromotableFunction = TypePromoDebug::IsTypePromoEnabled() && FTypePromotion::IsFunctionPromotionReady(Function);

	TSubclassOf<UK2Node_CallFunction> NodeClass;
	if (bIsPromotableFunction)
	{
		NodeClass = UK2Node_PromotableOperator::StaticClass();
	}
    // 略
	else
	{
		NodeClass = UK2Node_CallFunction::StaticClass();
	}

	return Create(NodeClass, Function, Outer);
}


UBlueprintFunctionNodeSpawner* UBlueprintFunctionNodeSpawner::Create(TSubclassOf<UK2Node_CallFunction> NodeClass, UFunction const* const Function, UObject* Outer/* = nullptr*/)
{
    // 略

	bool const bIsPromotableFunction =
		TypePromoDebug::IsTypePromoEnabled() &&
		FTypePromotion::IsFunctionPromotionReady(Function);

	FName OpName = FTypePromotion::GetOpNameFromFunction(Function);

	// If a spawner for this operator has been created already, than just return that
	if (bIsPromotableFunction && FTypePromotion::IsOperatorSpawnerRegistered(Function))
	{
		if (UBlueprintFunctionNodeSpawner* OpSpawner = FTypePromotion::GetOperatorSpawner(OpName))
		{
			return OpSpawner;
		}
	}

	UBlueprintFunctionNodeSpawner* NodeSpawner = NewObject<UBlueprintFunctionNodeSpawner>(Outer);
	NodeSpawner->SetField(const_cast<UFunction*>(Function));

    // 略

	FBlueprintActionUiSpec& MenuSignature = NodeSpawner->DefaultMenuSignature;

	if(bIsPromotableFunction)
	{
		MenuSignature.MenuName = FTypePromotion::GetUserFacingOperatorName(OpName);
		MenuSignature.Category = LOCTEXT("UtilityOperatorCategory", "Utilities|Operators");
		// Possibly generate some special tooltips for promotable operators?
		MenuSignature.Tooltip = FTypePromotion::GetUserFacingOperatorName(OpName);
		MenuSignature.Keywords = FTypePromotion::GetKeywordsForOperator(OpName);
		FTypePromotion::RegisterOperatorSpawner(OpName, NodeSpawner);
	}
	else
	{
		MenuSignature.MenuName = UK2Node_CallFunction::GetUserFacingFunctionName(Function);
		MenuSignature.Category = UK2Node_CallFunction::GetDefaultCategoryForFunction(Function, FText::GetEmpty());
		MenuSignature.Tooltip = FText::FromString(UK2Node_CallFunction::GetDefaultTooltipForFunction(Function));
		// add at least one character, so that PrimeDefaultUiSpec() doesn't attempt to query the template node
		MenuSignature.Keywords = UK2Node_CallFunction::GetKeywordsForFunction(Function);
	}

    // 略

	return NodeSpawner;
}
```

このコードには2つの`Create`というメソッドのオーバーロード定義が含まれており、上の`Create`の定義の最終行で下の`Create`を呼び出してもいるという構造になっています。
これらはBPエディタで右クリックした際に表示されるノードリスト(など)で利用される情報を作成するメソッドです。作成される情報の内容には、名前やTooltipなどの表示情報のほか、ユーザーによってそのリストからノードが選択されたときにエディタ上に実際にノードをSpawnさせるためのSpawnerオブジェクトなどが含まれます。BPエディタが初期化・変更されるなどして全体のリフレッシュ処理が実行されると、BPエディタは存在するすべてのUClassを走査して、それらが持っているAction(エディタからアクセス可能なUPropertyやUFunction、そしてそれらが持っている表示情報や利用時の処理など……)を収集します。その処理の流れの中で、UFunctionに関するものの一部はこの`Create`メソッドのところにUFunctionに関する情報を作成させ、取得しにやってくるのです。このとき呼ばれるのは、上の方の`Create`の定義からになります。この前提のもとにこの処理をまとめると、以下のようになります。

1. あるUFunctionが渡されてくる。Type promotionが有効化されていて、かつ受け取ったUFunctionがType promotionの条件を満たしてる場合、SpawnするBPノードのクラスを問答無用でUK2Node_PromotableOperatorノードにする。UK2Node_PromotableOperatorノードは統合後の演算子ノードの実装クラスである。
1. また、同じく受け取ったUFunctionが条件を満たしている場合、作成するActionの情報もUFunctionのものは直接利用せず、受け取ったUFunctionが「定義している演算が属する」演算の名前や表示名、検索キーワードが設定される。この時に作成された情報やSpawnerは登録される。
1. 再び、データ型は違うが属する演算は同じUFunctionが渡されてきたとする(例えば、Add_IntIntとAdd_FloatFloatはデータ型は違うがAdd演算に属する定義)。すると、登録処理の前に既に同じ演算のUK2Node_PromotableOperatorノードが登録されていることが検出され、新規に情報を作成するのではなく既に登録した情報を返すようになる。
1. 結果として、「ある演算に対して１つも実装が存在しないと、UE5のType promotionする演算子ノードも一つも存在しない。」「ある演算に対して１つ以上の実装が存在すると、それらに共通する演算子ノードが１つだけ登録される」という処理となる。

# おわりに
楽しい機能で大変良いですね。正直、はじめは新たなmeta指定子でも追加されたんだろうと思って実装を見始めたのですが、一切プリプロセスに変更を加えないで対応していて面白かったです。長くなりそうで面倒だったので触れませんでしたが、UK2Node_PromotableOperatorノードが行っている、収集した関数の実装から、渡されてきたピンの型情報に最も合致する関数を探し出す処理などもこの機能の根幹を占めている部分ですので、興味があれば実装を読んでみると面白いと思います。

ところで、こういう方面進めるなら、はやく部分的にでもUFUNCTIONをtemplateに対応させてくれないかなあという個人的な気持ちがあります。みなさんでこのPRを応援しましょう(他人任せ)。
https://github.com/EpicGames/UnrealEngine/pull/6902

