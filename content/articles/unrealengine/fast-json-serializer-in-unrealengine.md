---
title: 'UHT を拡張して UE 最速(?) 高機能な JSON シリアライザプラグインを作ってみた'
description: 'UHT を使ったコード生成プラグインで、最速(?)クラスの JSON シリアライザを作る話'
enforceCreatedAt: 2024/12/25
enforceUpdatedAt: 2024/12/25
tags:
    - Unreal Engine
    - Unreal C++
    - Blueprint
    - Advent Calendar
assets: '/article-assets/unrealengine/fast-json-serializer-in-unrealengine'
advent_calendar:
    name: 'Unreal Engine (UE) Advent Calendar 2024'
    link: 'https://qiita.com/advent-calendar/2024/ue'
    day: 25
---

# Introduction
コンテンツやサービスの開発を行っていると、 Unreal Engine の上から Web API を呼び出したくなったり、インテグレーションツールとの連携やロギングのためにデータ構造をシリアライズしたくなることがあります。
幸いなことに、UE には C++ / BP ともに JSON を扱うための機能が提供されています。

しかし、それらの機能にはいくつかの課題点があります。そこで、今回は UHT (Unreal Header Tool) を拡張して利用することで、最速レベルのパフォーマンス持ちながら標準機能を超える機能性の JSON シリアライザプラグインである `GenJson` を開発してみました。 
エンジン改造は不要で、プラグインとして導入するだけで利用できます。

GitHub リポジトリ: [GenJson](https://github.com/strvert/GenJson)

アドカレネタとして 12/23 から書き始めたプラグインなので、まだまだ足りない部分が多く、整備されていない箇所だらけです。
しかし、わりと面白いものになってきたので、その内容や仕組みについて、利用している UE の機能についても触れながら解説していきたいと思います。


# 目次


# 標準機能の何が不満なのか？

今回作成したものの解説の前に、標準機能で JSON を操作する際の手法とその良し悪しについて整理しておきます。

まずはプラグインがどんなものか気になるという人は [GenJsonの機能紹介](#genjson-の機能紹介) までジャンプしてみてください。

## FJsonObject を使った生のオブジェクト操作
UE が提供する低レベルな Json 操作として、 C++ を使って FJsonObject のオブジェクトツリーを直接操作するものがあります。
これは以下のように使うことができます。

```cpp title="FJsonObject を使った JSON 操作"
// オブジェクトの作成
TSharedPtr<FJsonObject> JsonObject = MakeShared<FJsonObject>();

// プロパティの追加
JsonObject->SetNumberField(TEXT("score"), 42);

// サブオブジェクトの作成と追加
TSharedPtr<FJsonObject> SubObject = MakeShared<FJsonObject>();
JsonObject->SetObjectField(TEXT("user"), SubObject);

SubObject->SetStringField(TEXT("name"), TEXT("douglas"));

// JSON 文字列への変換
FString JsonString;
TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&JsonString);
FJsonSerializer::Serialize(JsonObject.ToSharedRef(), Writer);
```

```json title="生成される JSON"
{
    "score": 42,
    "user": {
        "name": "adams"
    }
}
```

たしかに、この方法であれば基本的なあらゆるデータ操作を行うことができるでしょう。

### 不満なところ
- 実現したいデータ構造に対して書き込み処理を手動で行わなければならない
- 文字列処理から逃れられず、宣言的でない
- (要するに)とにかく愚直

ちょっとした JSON を書き出すだけであれば許容できますが、大量のエンドポイントを備えた API への対応を書きたいときや、複雑なペイロードの合成、仕様変更への追従の容易さなどを考えるとあまりうれしくないでしょう。

## UStruct のリフレクションを使った JSON 書き出し
Unreal Engine には、クラスや構造体の型や名前といった情報を、ビルド後にも残して利用できるようにするためのリフレクション機能が備わっています。
UE のスクリプト用構造体である USTRUCT(UScriptStruct) は、以下のようなコードによってフィールドの UProperty を列挙したり読み取ったりすることができます。

```cpp title="サンプル構造体"
USTRUCT()
struct FUserData
{
    GENERATED_BODY()

    UPROPERTY()
    FString UserName;

    UPROPERTY()
    int32 TotalScore;
};
```
```cpp title="リフレクションによるプロパティの列挙"
FExampleUserData Struct{
    "Orwell",
    1984,
};

// 型情報オブジェクトを取得
const UStruct* StructType = Struct.StaticStruct();

// リフレクションでプロパティをループして出力
for (FProperty* Property : TFieldRange<FProperty>(StructType))
{
    // プロパティの名前を取得
    FString PropertyName = Property->GetName();
    if (const FIntProperty* IntProperty = CastField<FIntProperty>(Property))
    {
        // プロパティの型が int なら値を取得
        const int32 Value = IntProperty->GetPropertyValue(Property->ContainerPtrToValuePtr<int32>(&Struct));
        UE_LOG(LogTemp, Log, TEXT("%s: %d"), *PropertyName, Value);
    }
    else if (const FStrProperty* StrProperty = CastField<FStrProperty>(Property))
    {
        // プロパティの型が FString なら値を取得
        FString Value = StrProperty->GetPropertyValue(Property->ContainerPtrToValuePtr<FString>(&Struct));
        UE_LOG(LogTemp, Log, TEXT("%s: %s"), *PropertyName, *Value);
    }
}
```
```plaintext title="Output Log"
LogTemp: Name: Orwell
LogTemp: Age: 1984
```


これを利用した JSON シリアライザが FJsonObjectConverter です。
FJsonObjectConverter は、USTRUCT でデータ構造を宣言しておくだけで、その UProperty を自動で読み取って適切な JSON 型でシリアライズしてくれます。

```cpp title="USTRUCT を JSON にシリアライズ"
FUserData UserData{
    "Orwell",
    1984,
};
const UStruct* StructType = UserData.StaticStruct();

const TSharedRef<FJsonObject> JsonObject = MakeShared<FJsonObject>();
FJsonObjectConverter::UStructToJsonObject(StructType, &UserData, JsonObject);

FString JsonString;
TSharedRef<TJsonWriter<>> Writer = TJsonWriterFactory<>::Create(&JsonString);
FJsonSerializer::Serialize(JsonObject, Writer);
```

```json title="生成される JSON"
{
    "UserName": "Orwell",
    "TotalScore": 1984
}
```

こちらはそこそこ良い方法といえます。外部に JSON として吐き出すためのデータ構造が構造体として定義されていて明確ですし、JSON のプロパティの名前を手動で書いたりする必要もありません。
データ構造の仕様が変わったら、構造体の定義を変更するだけで済みます。また、書き出し処理はあらゆる USTRUCT に対して使えるため、再利用性が高いです。

### 不満なところ
- JSON のプロパティ名を柔軟に変更(ケース変換とか)できない。
- リフレクション情報の FName を文字列化して利用している。
- 特定の構造体のシリアライズをカスタムしたりすることができない。
- 実行時にリフレクション情報を読み出して利用しており、JSON オブジェクトを構築する前段階のコストが存在する。

こちらの不満は、主に拡張性とオーバーヘッドに関するものです。ややこしい内容が多いので項目ごとに説明していきます。


#### プロパティ名の柔軟な変更ができない
プロパティ名の変更や上書きができないのは時に致命的です。

なぜなら、UE のプロパティの命名規則は `PascalCase` なのに対し、世の中の JSON を喋るシステムは必ずしもそうとは限らず、むしろ `snake_case` や `camelCase` を採用しているシステムのが多いからです。
これに対処するには USTRUCT のプロパティ名を、Unreal C++ の命名規則を無視して `snake_case` などで書くことになりますが、気分が悪いのであまりやりたくないでしょう。

```cpp title="こんなのが混ざっていたら嫌"
USTRUCT()
struct FUserData
{
    GENERATED_BODY()

    UPROPERTY()
    FString user_name;

    UPROPERTY()
    int32 total_score;
};
```

#### リフレクション情報の FName を文字列化して利用している

実行時のリフレクション情報において、プロパティ名は `FName` で持たれます。JSON シリアライズでは、これを FString に変換した結果を利用してシリアライズを行います。

問題は、`FName` は case-insensitive、すなわち格納した文字列の大文字小文字を区別しない型であること、また、同じ名前の `FName` がエンジン上で複数回作成されたとしても、先に作成されたほうの `FName` インスタンスが使い回されることです。

これが何を意味するかというと、 `FName` は以下のように、意図したのと違う文字列が `FString` として取得されるケースがあるということです。

```cpp title="FNameの罠"
const FName First = TEXT("Neuromancer");
// "Neuromancer" と出力されることを期待する。(多くの場合)そのとおりになる。
UE_LOG(LogTemp, Log, TEXT("%s"), *First.ToString());

const FName Second = TEXT("NEUROMANCER");
// "NEUROMANCER" と出力されることを期待するが……？
UE_LOG(LogTemp, Log, TEXT("%s"), *Second.ToString());
```
```plaintext title="Output Log"
LogTemp: Neuromancer
LogTemp: Neuromancer
```
ケース違いの `FName` は、内部のテーブルに先に格納されたほうの値が再利用されてしまっていることがわかります。なおこの挙動、エディタ上では発生せず、パッケージングすると取得される文字列がまとまるので、罠になりやすいです。(FName を比較以外に使うな)

UProperty の実行時リフレクションが `FName` から取得された文字列に基づくということは、この方法を用いた JSON 生成では、パッケージング後のフィールド名が本質的に予測不能であるということです。
たまたまケース違いの `FName` が先に作成されているだけで、シリアライズ結果が変わってしまいます。

#### カスタムシリアライザと併用できない
データ構造や用途によって、特定の構造体に対してだけシリアライズ処理を上書きしたいということがあります。
例えば、特定の構造体に対しては、特定のプロパティを無視したり、特定のプロパティの値を変換したり、特定のプロパティを特定の条件下でシリアライズしたりといったことが考えられます。

```cpp title="特定の構造体に対してだけ特別な処理を行いたい"
USTRUCT()
struct FMyVector
{
    GENERATED_BODY()

    UPROPERTY()
    float X;

    UPROPERTY()
    float Y;

    UPROPERTY()
    float Z;
};
```
たとえば、この構造体は `{"X": 0.0, "Y": 1.0, "Z": 2.0}` ではなく、 `[0.0, 1.0, 2.0]` という配列形式にしたいかもしれません。 
このような場合にはカスタムシリアライザを実装したいですが、 FJsonObjectConverter ではそのようなことはできません。

#### リフレクションによるオーバーヘッド

また、リフレクション情報を利用して JSON オブジェクトを構築するというのは、その分のオーバーヘッドがあります。
[USTRUCT のリフレクションを使った JSON シリアライズ](#ustuct-のリフレクションを使った-json-書き出し) で小規模なプロパティ列挙のループを示しました。
FJsonObjectConverter では、あらゆるプロパティの種類である可能性を検証して、それに応じた処理を行うため、その分のオーバーヘッドが発生します。

構造体から愚直にメンバを指定して JSON オブジェクトを構築するのと比べると、どうしても遅くなってしまいます。

# GenJson の機能紹介

さて、ここからは GenJson の機能を紹介していきます。 GenJson は、上記の不満を踏まえて開発したもので、以下のような特徴を持っています。

- USTRUCT にメタ指定子を与えるだけで、JSON シリアライズ機能を利用可能
- プロパティ名のケース変換や上書きが可能
- シリアライズ関数のコード生成による、リフレクション情報不要の高速シリアライズ
- カスタムシリアライズ関数の実装が容易
- UENUM にも対応
- エンジン改造なし
- RapidJson ベース

## USTRUCT にメタ指定子を与えるだけで JSON シリアライズ機能を利用可能
GenJson は、USTRUCT に `meta = (Serialize)` のようにメタ指定子を与えるだけで、その構造体を JSON シリアライズ可能にします。

```cpp title="USTRUCT に Serialize を与えるだけで JSON シリアライズ可能"
USTRUCT(meta = (Serialize))
struct FUserData
{
    GENERATED_BODY()

    UPROPERTY()
    FString UserName;

    UPROPERTY()
    int32 TotalScore;
};
```
次のように利用します。

```cpp title="シリアライズの実行"
// 書き込みたいデータ
FUserData UserData{
    .UserName = TEXT("Huxley"),
    .TotalScore = 1932,
};

// Writer の初期化
GenJson::FRapidJsonStringBuffer StringBuffer;
GenJson::FJsonWriter Writer{StringBuffer};

// シリアライズ
GenJson::Write(UserData, Writer);

// JSON 文字列を出力
UE_LOG(LogTemp, Log, TEXT("%s"), *GenJson::ToString(StringBuffer));
```

```plaintext title="Output Log"
LogTemp: {"UserName":"Huxley","TotalScore":1932}
```

きちんと JSON にシリアライズされていることがわかります。標準のリフレクションを用いた方法と同等の結果が得られていますが、実行時にリフレクション情報は参照しておらず、オーバーヘッドは発生していません。

なお、この機能を利用するには、構造体の定義されているヘッダファイルの上部に以下のようなインクルードを追加する必要があります。

```cpp
#include "[HeaderName].genjson.h"
```

また、ファイルの末尾で以下のマクロを呼び出す必要があります。

```cpp
GENJSON_SERIALIZERS();
```

`meta = (Serialize)` を持っている構造体同士であれば、ネストされた構造体もシリアライズ可能です。

```cpp title="複数の構造体を含む構造体"
USTRUCT(meta = (Serialize))
struct FUserData
{
    GENERATED_BODY()

    UPROPERTY()
    FString UserName;

    UPROPERTY()
    int32 TotalScore;
};

USTRUCT(meta = (Serialize))
struct FUser
{
    GENERATED_BODY()

    UPROPERTY()
    bool IsAdmin;

    UPROPERTY()
    FUserData Data;
};
```

```plaintext title="Output Log"
LogTemp: {"IsAdmin":true,"Data":{"UserName":"Huxley","TotalScore":1932}}
```

## プロパティ名のケース変換や上書きが可能
GenJson では、プロパティ名のケース変換や上書きが可能です。以下のように、`meta = (RenameAll = "snake_case")` を UPROPERTY に与えることで、プロパティ名を `snake_case` に変換します。

```cpp
USTRUCT(meta = (Serialize, RenameAll = "snake_case"))
struct FUserData
{
    // 略
};
```

```plaintext title="Output Log"
LogTemp: {"user_name":"Huxley","total_score":1932}
```

自動でケース変換されていることがわかります。ケース変換による追加コストは一切発生しません。

利用可能なケースは以下の 4 つです。

- `snake_case`
- `camelCase`
- `PascalCase`
- `kebab-case`

また、`meta = (Rename = "new_name")` を UPROPERTY に与えることで、プロパティ名を上書きすることもできます。

```cpp
USTRUCT(meta = (Serialize))
struct FUserData
{
    GENERATED_BODY()

    UPROPERTY(meta = (Rename = "USERRRRRNAME"))
    FString UserName;

    // 略
};
```

```plaintext title="Output Log"
LogTemp: {"USERRRRRNAME":"Huxley","TotalScore":1932}
```

サポートされていないケースにしたいときや、特定のプロパティ名を変更したいときに便利です。

## シリアライズ関数の自動生成によるハイパフォーマンスなシリアライズ
エンジンの USTRUCT 自動シリアライザは、リフレクション情報の読み出しが余計なオーバーヘッドとなっていました。
GenJson では、 `meta = (Serialize)` の指定を受けた USTRUCT に対して、以下のようなシリアライズ関数を自動生成します。

```cpp title="自動生成されるシリアライズ関数"
template <>
struct GenJson::TSerializer<::FUserData>
{
	static bool Write(const FUserData& Instance, FJsonWriter& Writer)
	{
		Writer.StartObject();
		Writer.Key(TEXT("UserName"));
		GenJson::Write(Instance.UserName, Writer);
		Writer.Key(TEXT("TotalScore"));
		GenJson::Write(Instance.TotalScore, Writer);
		Writer.EndObject();
		return true;
	}
};
```

リフレクション情報を利用せず、ハードコードされたプロパティ名と型を利用してシリアライズを行うため、オーバーヘッドなしで高速なシリアライズが可能です。
GenJson がシリアライズ処理を試みるとき、目的の型に対してこのようなシリアライズ関数が存在するかを探し、存在する場合はそれを利用します。
そのため、`meta = (Serialize)` を与えた USTRUCT に対しては、統一した API でシリアライズを行うことができます。

```cpp title="統一されたシリアライズの実行"
// 書き込み関数はテンプレート化されていて、 Serialize が実装された任意の構造体を受け取ることができる。
template <typename T>
bool Write(const T& StructInstance, FJsonWriter& Writer)
```

また、見ての通り生成されるシリアライズ関数は static 関数であり、継承や仮想関数を利用していません。コンパイル時に適切な関数が静的に選択されるため、呼び出しにも関数呼び出し以上のオーバーヘッドは発生しません。

## カスタムシリアライズ関数の実装が容易
シリアライズ関数をカスタマイズしたい場合、 `meta = (Serialize)` でコードを生成させずに、以下の形式でシリアライズ関数を書いておけば、 GenJson はその関数を発見して利用します。

```cpp title="対象の構造体"
USTRUCT()
struct FMyVector
{
    GENERATED_BODY()

    UPROPERTY()
    float X;

    UPROPERTY()
    float Y;

    UPROPERTY()
    float Z;
};
```

```cpp title="カスタムシリアライズ関数の実装"
template <>
struct GenJson::TSerializer<FMyVector>
{
    static bool Write(const FMyVector& Instance, FJsonWriter& Writer)
    {
        Writer.StartArray();
        GenJson::Write(Instance.X, Writer);
        GenJson::Write(Instance.Y, Writer);
        GenJson::Write(Instance.Z, Writer);
        Writer.EndArray();
        return true;
    }
};
```

```plaintext title="Output Log"
LogTemp: [0.0, 1.0, 2.0]
```

カスタムしたい構造体は Serialize を付与せずに、代わりに上記の形式のシリアライズ関数を実装しておくだけで、その構造体に対してカスタムシリアライズが行われます。

## UENUM にも対応
GenJson は UENUM にも対応しています。以下のように、`meta = (Serialize)` を UENUM に与えることで、その列挙体を JSON シリアライズ可能にします。

```cpp title="UENUM に Serialize で JSON シリアライズ可能に"
UENUM(meta = (Serialize))
enum class ERarity : uint8
{
    Rare, // → "Rare"
    SuperRare, // → "SuperRare"
    UltraRare // → "UltraRare"
};
```

また、UENUM のプロパティ名のケース変換や上書きも可能です。

```cpp title="UENUM に RenameAll でケース変換"
UENUM(meta = (Serialize, RenameAll = "snake_case"))
enum class ERarity : uint8
{
    Rare, // → "rare"
    SuperRare, // → "super_rare"
    UltraRare // → "ultra_rare"
};
```

```cpp title="UENUM に Rename でプロパティ名上書き"
UENUM(meta = (Serialize))
enum class ERarity : uint8
{
    Rare UPARAM(meta = (Rename = "Rare")), // → "Rare"
    SuperRare UPARAM(meta = (Rename = "Super_Rare")), // → "Super_Rare"
    UltraRare UPARAM(meta = (Rename = "Ultra_Rare")) // → "Ultra_Rare"
};
```

UENUM 専用の機能として、文字列ではなく数値でシリアライズすることも可能です。数値としてシリアライズしたい場合には `meta = (AsNumber)` を追加で与えます。

```cpp title="UENUM に AsNumber で数値シリアライズ"
UENUM(meta = (Serialize, AsNumber))
enum class ERarity : uint8
{
    Rare = 0, // → 0
    SuperRare, // → 1
    UltraRare // → 2
};
```

## エンジン改造なし
コード生成や独自の指定子などを実装していますが、エンジン改造は不要です。プラグインとして導入するだけで手軽に利用することができます。

## RapidJson ベース
GenJson は、高速な JSON ライブラリである RapidJson をベースにしています。GenJson が UHT を使って生成するコードは、 RapidJson の API を利用しているため、JSON の操作自体も高速です。
RapidJson は UE に標準で含まれているものを利用しているので、追加のライブラリの導入は不要です。

[RapidJson](https://rapidjson.org/)

# GenJson の仕組みと関連 UE 機能の解説
この節では、GenJson の仕組みを解説しながら、それに利用した Unreal Engine の機能についても触れていきたいと思います。 

## メタ指定子による JSON シリアライズ機能の制御
機能紹介でも示した通り、 GenJson では、 USTRUCT や UPROPERTY にメタ指定子を与えるだけで、実行時に利用可能なシリアライズ機能を制御することができます。
メタ指定子とはどのようなものなのかを見てみましょう。

### UHT とリフレクション
meta を説明するために、リフレクションに簡単に触れておきます。リフレクションとは、本来であればコンパイル時に消失してしまい、実行時にはアクセスできないような「ソースコードやプログラムたちそれ自身の情報」を、実行時に利用可能にする機能です。
C# などの言語では、標準でリフレクションがサポートされており、実行時に型情報やメソッド情報を取得したり、それに基づいてインスタンスを生成したりすることができます。

C++ には本来リフレクション機能がありませんが、 Unreal Engine は独自のリフレクションシステムを持っています。その中核を担うのが、 UHT (Unreal Header Tool) です。
Unreal Engine のリフレクションシステムは、以下のようなプロセスで機能しています。

![](#/reflection-flow.png)

UCLASS や USTRUCT, UPROPERTY といった独自マクロは、 UHT (Unreal Header Tool) がパースして解釈します。  
UHT は解釈した情報をもとに、プロジェクトに追加の C++ コードを生成します。コンパイルされるコードは、ユーザーが書いた C++ コードと UHT によって生成されたコードが組み合わさっています。

UHT が生成したコードには、各クラスやプロパティについてのリフレクション情報が埋め込まれています。この情報を利用することで、実行時のリフレクションが成立しているのです。

### メタ指定子

メタ指定子も、UHT が解釈し、リフレクション情報に含まれるようになっています。ですから、以下のようにすることで、実行時に `meta = ()` に渡した情報にアクセスすることができるのです。

```cpp title="メタ指定子を持った USTRUCT"
USTRUCT(meta = (Serialize))
struct FUserData
{
    GENERATED_BODY()

    UPROPERTY(meta = (Rename = "USERRRRRNAME"))
    FString UserName;

    UPROPERTY()
    int32 TotalScore;
};
```

```cpp title="メタ指定子の情報を取得"
const UStruct* StructType = FUserData::StaticStruct();
if (StructType->HasMetaData(TEXT("Serialize")))
{
    UE_LOG(LogTemp, Log, TEXT("Serialize 指定あり: %s"), *StructType->GetName());
}

for (FPorperty* Property : TFieldRange<FProperty>(StructType))
{
    if (Property->HasMetaData(TEXT("Rename")))
    {
        UE_LOG(LogTemp, Log, TEXT("Rename: %s to %s"), *Property->GetName(), *Property->GetMetaData(TEXT("Rename")));
    }
}
```

```plaintext title="Output Log"
LogTemp: Serialize 指定あり: FUserData
LogTemp: Rename: UserName to USERRRRRNAME
```

`meta = ()` の中に書けるものにルールはないので、好きな情報を Key-Value の形式でプロパティに付加することができます。

これは大変便利で、プロパティに関する周辺機能の振る舞いを、メタ指定子の情報に基づいて切り替えることができるということになります。実際、UE のエディタ内でもよく利用されており、meta の記載によってエディタ上でのプロパティの見た目が変わったりすることがあります。

### メタ指定子はパッケージングで消える
プロパティの名前、型といった基本的な情報は、UHT が埋め込んだ情報をもとにパッケージング後も利用可能です。標準の USTRUCT → JSON シリアライザも、この情報に基づいて機能しています。

しかし、 `meta = ()` で与えるメタ指定子は、その情報がパッケージングで消失してしまいます。その仕組みは単純で、 meta のリフレクション情報を格納している `MetaData` というプロパティは、エディタ向けビルド以外ではコンパイルに含まれないようになっているからです。

```cpp title="MetaData の定義の引用"
#if WITH_METADATA
	// MetaData for the editor, or NULL in the game
	class UMetaData* MetaData;
#endif // WITH_METADATA
```

プリプロセッサマクロで切り替えられており、コードごと消えてしまうので、 C++ だけではどうやっても meta に書いた情報をパッケージング後に利用することはできません。

しかしながら、エディタが利用しているメタ指定子を眺めていると、その一部はどうもパッケージング後の挙動にも影響を与えるものがあるように見えてきます。C++ ではこれは不可能なはずですから、より上位の構造がこれを実現しているはずです。どうなっているのでしょうか？

### UHT によるコード生成
リフレクションのためのコード情報を生成しているのは UHT であると説明しました。 UHT は、C++ コンパイラよりも前に Unreal C++ のコードをパースして解釈します。

その過程で、UHT は UCLASS や UPROPERTY に記述された情報にアクセスすることができます。もちろん、そこにはメタ指定子も含まれます。つまり、メタ指定子の中の値に応じて、UHT は生成するコードを変えることができるのです。

UHT が利用しないメタデータに関してはそのまま MetaData 構造体に埋め込まれるだけで、それ以外の UHT の処理には関与しません。これではパッケージングで消えてしまい、コンテンツ機能から利用できません。  ならば、UHT を拡張して、パッケージング後にも残るような形でコード上に meta に由来する情報を残せれば、コンテンツ機能から活用することができるでしょう！

## UBT プラグインによるコード生成の拡張

GenJson の機能紹介でも述べた通り、 GenJson は UHT を拡張して、 meta の指定による JSON シリアライズ関数生成機能を提供しています。
この機能は、 UBT プラグインというメカニズムを利用しています。

UBT プラグインは、 UBT および UHT の機能を拡張するための UBT の機能です。 UBT プラグインを使うと、 UHT がパースした C++ コードや UE の独自マクロの情報を使って、新たなコードを生成したり、解析を行ったりすることができます。

UBT プラグインの作り方については、また別の記事にしたいと思いますが、ここでは GenJson が UBT プラグインを使ってどのような JSON シリアライズ関数を生成し、利用しているのかを見ていきましょう。

### GenJson によるコード生成

GenJson は、 meta = (Serialize) が指定された USTRUCT もしくは UENUM がある場合、そのファイルに対応する `.genjson.h` というファイルを生成します。
UE 標準のリフレクション機能で言うところの `.generated.h` と同じ立ち位置です。

このファイルには、そのファイルに存在する `meta = (Serialize)` が指定された USTRUCT や UENUM に対応したシリアライズ関数が記述されています。
ただ、シリアライズ関数はその場で定義されているのではなくて、「自動生成されたシリアライズ関数を埋め込むためのマクロ」が定義されます。

そのマクロが `GENJSON_SERIALIZERS` です。
これを、ファイルの末尾で呼び出すことで、そのファイルに存在するシリアライズ関数が埋め込まれます。

末尾に追加する必要があるのは、シリアライズ処理には構造体の完全な定義が必要であるためです。

### SFINAE による関数選択

GenJson は、シリアライズ関数の選択において、テンプレートメタプログラミングの手法である SFINAE を利用しています。
SFINAE は、関数テンプレートの特殊化を使って、コンパイル時に関数の選択を行う手法です。

GenJson のシリアライズプロセスでは、GenJson が生成したシリアライズ関数か、ユーザーが記述したシリアライズ関数かを区別していません。
どちらも SFINAE によって最も一致度が高いと判断された関数が選択されます。

このため、ユーザーによるシリアライズ関数のカスタマイズが容易に行えるという特徴があります。この点は、 UE や UHT の機能を使っているわけではなく、純粋に C++ のテクニックによって実現されています。

# まだ実現できていないこと
GenJson は、アドカレネタとして 12/23 から実装を開始した超ホット(?)なプラグインです。まだまだ実装途中で、以下のような機能や検証が実現できていません。

## デシリアライズ機能
現時点では、 GenJson はシリアライズ機能のみを提供しています。デシリアライズ機能も提供することで、 JSON 文字列から USTRUCT や UENUM に変換することができるようになります。
というかデシリアライズ機能がないのは使いにくすぎますし、どちらかというと負荷になるのはデシリアライズのほうなので、早急に実装したいです。同様の手法で実装できると考えています。

## Blueprint 対応
GenJson の API は、 C++ から呼び出すことを前提としています。これは、型にあわせたシリアライズ関数の選択が、コンパイル時に静的に行われるため、 Blueprint で指定した構造体をもとにシリアライズ関数を選択することができないためです。
しかし、この問題は静的に生成された関数を Blueprint から渡される UStruct オブジェクトをキーとして検索することで解決できると考えています。
この方法であれば、最上位の USTRUCT に対するシリアライズ関数を発見する検索コストだけが Blueprint からの呼び出し時には追加されますが、その後のシリアライズ処理は C++ からの呼び出しと同様に高速なままでしょう。    

## マルチ文字コードへの対応
現時点では、出力された JSON は常に UTF-8 でエンコードされるようになっています。 一般的な用途では問題ありませんが、 UE 内で JSON 文字列を扱う場合には、 UTF-16 に変換して FString で利用できたほうが便利です。
現状、そのためには変換を挟む必要があり好ましくありません。直接 UTF-16 で JSON 文字列を扱えるようにすることが望ましいです。

シリアライズ時に、エンコードを指定できるようにしたいです。

## メモリ使用量やパフォーマンスの検証
散々早いと言ってきましたが、実際にどの程度のパフォーマンスが出るのか、また、どの程度のメモリを消費するのか、といった実測ベースの検証がまだ行われていません。
(ちゃんとやるつもりだったのですが、アドカレの日までに間に合わなかった……)

とはいえ、GenJson はとにかく静的かつ愚直な処理のみを実行時に残すように設計されているため、標準のリフレクション機能を使ったシリアライズよりも高速であることは間違いない……はずです。

# まとめと感想
GenJson は、 UHT を拡張して UE の JSON シリアライズ機能を強化するプラグインです。
標準機能にはない、プロパティ名の柔軟な変更や上書き、高速なシリアライズ、カスタムシリアライズ関数の実装が可能です。
GenJson は、 USTRUCT や UENUM にメタ指定子を与えるだけで利用可能です。エンジン改造は不要で、プラグインとして導入するだけで利用していただくことができます。

また、UBT プラグインを使うと、 UHT を拡張してコード生成を行うことができます。 UE におけるコーディングの幅を大きく広げられます。
UBT プラグインなる機能をエンジンコード上で発見したときは、 「C# の Roslyn [^1] みたいなことが UE でできるってこと……？」 と思ってなにか作りたかったので、 GenJson はその一環として生まれました。

UBT プラグインの解説記事は、いつか書きますね……。


[^1]: 
    Roslyn は、 C# のコンパイラとして知られる .NET Compiler Platform のコードベースのことです。 Roslyn は、 C# のコードを解析し、コード生成を行うための API を提供しています。 Roslyn を使うことで、 C# のコードを解析してリファクタリングツールやコード生成ツールを作ることができます。　Roslyn はもとの C# コードの AST をいじることまでできるので、 UHT もそれくらいのことができるといいなあと思っていますが、まだ(たぶん)できません。