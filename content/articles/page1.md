---
title: "[C++]型だけでN bit加算器を書こう"
description: "C++の型システムで組み合わせ回路を実装していきたいと思います。"
customThumbnail: "~/images/ogp/article_base.png"
---
# [C++]型だけでN bit加算器を書こう

## レギュレーション
上記の記事では、TypeScriptの型システムを用いた静的計算を「コンパイル時計算」とし、TypeScriptのコンパイル時計算で組み合わせ回路を実装するという趣旨になっていました。しかし、C++でこの言葉をそのまま採用して実装すると、`constexpr`で世界のすべてを殴り倒すことが出来てしまい、面白くありません。せっかくなので今回は、以下のような条件のもとでコードを書いてみましょう。

- 非型テンプレートパラメータ以外の場所では、定数値を含め値を書かない。
- 同様に、非型テンプレートパラメータを算出する以外の目的で`constexpr`な処理を利用しない。
- 実行時の処理については、上記の制約の対象としない。ただし、実行時にして良い処理は入出力に関するもののみとする。

もはや型で遊びたいだけであり、何が目的の実装なのかよくわかりませんが(そもそもレギュレーションガバガバですが)、まあよいでしょう。

## 検証環境
- clang version 12.0.0
- x86_64-pc-linux-gnu
- std=c++2a

## 注意点
本記事の実装では、fold expressionの展開数制限およびtemplateの再帰深度上限を回避するような実装は行っていません。ですので、Nを大きくしていくと意外とすぐ死にます。

## バイナリ型を定義する
先駆者様に倣って、0 or 1の保持にも型を利用していこうと思います。ここは複雑ではありませんので、全体のコードをいきなり提示します。

```cpp[binary.h]
#pragma once
#include <type_traits>

namespace Binary {
    struct Binary {};
    struct I : public Binary {};
    struct O : public Binary  {};

    template <typename T>
    concept IsBinary = std::is_base_of_v<Binary, T>;

    template <typename T>
    concept IsZero = std::is_same_v<T, O> && IsBinary<T>;

    template <typename T>
    concept IsOne = std::is_same_v<T, I> && IsBinary<T>;
}

```

マーカーの役割を果たす`Binary`型と、それを継承した`O`と`I`のバイナリ型を定義しました。今回はドントケアを含む回路は想定しませんので、回路で現れる値(型だけど)が0と1以外の値を取ることはありません。ですので、渡されてきた型がバイナリであるか、つまり`O`と`I`のどちらかであるかを判断するコンセプトを定義しています。また、対象の型が`O`であるか、`I`であるかを判断するための`IsZero`と`IsOne`のコンセプトも用意しました。

### 最低限の出力処理を用意しておく
この後論理ゲートを実装していきますが、結果が確認できないと困ります。予め最低限の出力処理を用意しておくことにします。レギュレーションより、ここでは自由な値の利用が許可されます。

```cpp[最低限の出力処理]
using Binary::O;
using Binary::I;

template <Binary::IsBinary T>
struct bitToChar {};

template <Binary::IsZero T>
struct bitToChar<T> { inline static constexpr const char v = '0'; };

template <Binary::IsOne T>
struct bitToChar<T> { inline static constexpr const char v = '1'; };

template <Binary::IsBinary T>
constexpr const char bitToCharV = bitToChar<T>::v;

template <template <typename, typename> typename Gate>
static void printTruthTable() {
    fmt::print("0 0 | {}\n", bitToCharV<Gate<O, O>>);
    fmt::print("0 1 | {}\n", bitToCharV<Gate<O, I>>);
    fmt::print("1 0 | {}\n", bitToCharV<Gate<I, O>>);
    fmt::print("1 1 | {}\n", bitToCharV<Gate<I, I>>);
}
```

このコードは、2入力1出力のゲート型を受け取って、その真理値表を出力するものです。基本論理ゲートの動作確認にはこれを使っていきます。

## 基本論理ゲートを実装する
前述の記事では、基本論理ゲートの出力をテーブル化して参照するようにしていました。しかし、**NAND論理の完全性**を利用すればNAND以外のゲートをテーブル化する必要はありませんので、本記事ではテーブル化するゲートはNANDのみとし、その他のゲートはNAND型を組み合わせた型として実装していきます。

### NANDゲート型
NANDゲートの実装は以下のようなものにしました。

```cpp[basic_gates.h(NAND部)]
    template <Binary::IsBinary A, Binary::IsBinary B>
    struct NAND  {};
    template <Binary::IsZero A, Binary::IsZero B>
    struct NAND<A, B>  { using X = Binary::One; };
    template <Binary::IsZero A, Binary::IsOne B>
    struct NAND<A, B>  { using X = Binary::One; };
    template <Binary::IsOne A, Binary::IsZero B>
    struct NAND<A, B>  { using X = Binary::One; };
    template <Binary::IsOne A, Binary::IsOne B>
    struct NAND<A, B>  { using X = Binary::Zero; };
    template <Binary::IsBinary A, Binary::IsBinary B>
    using NANDv = typename NAND<A, B>::X
```

C++20のコンセプト万々歳です。とても楽にテンプレートパラメータに基づいたオーバーロードを書くことが出来ます。これで、NAND型のテンプレートパラメータとして渡された2つのバイナリ型の組み合わせによって、NAND型がその内部にNANDゲートの出力であるバイナリ型の型エイリアス`X`を持つようになります。

動作しているかどうか、先程用意した出力処理を利用して検証してみます。

```cpp[NAND出力テスト]
int main()
{
    printTruthTable<Gates::NANDv>();
}
```

```shell:出力
0 0 | 1
0 1 | 1
1 0 | 1
1 1 | 0
```
どうやらしっかり動作しているようです！

### その他のゲートの型を用意する
先述したとおり、あらゆる論理ゲートはNANDゲートを用いて表現することが出来ます。つまりは、NAND型を組み合わせるだけで他のゲートの型は用意できるわけです。一気にやってしまいましょう。

```cpp[basic_gates.h(その他のゲート達)]
    template <Binary::IsBinary A>
    using NOT = NAND<A, A>;
    template <Binary::IsBinary A>
    using NOTv = typename NOT<A>::X;

    template <Binary::IsBinary A, Binary::IsBinary B>
    using AND = NOT<NANDv<A, B>>;
    template <Binary::IsBinary A, Binary::IsBinary B>
    using ANDv = typename AND<A, B>::X;

    template <Binary::IsBinary A, Binary::IsBinary B>
    using OR = NAND<NOTv<A>, NOTv<B>>;
    template <Binary::IsBinary A, Binary::IsBinary B>
    using ORv = typename OR<A, B>::X;

    template <Binary::IsBinary A, Binary::IsBinary B>
    using NOR = NOT<ORv<A, B>>;
    template <Binary::IsBinary A, Binary::IsBinary B>
    using NORv = typename NOR<A, B>::X;

    template <Binary::IsBinary A, Binary::IsBinary B>
    using XOR = NAND<NANDv<A, NANDv<A, B>>, NANDv<NANDv<A, B>, B>>;
    template <Binary::IsBinary A, Binary::IsBinary B>
    using XORv = typename XOR<A, B>::X
```

`NOT`/`AND`/`OR`/`NOR`/`XOR`の型を定義しました。すべてエイリアステンプレートのみによって実現することが出来ました。`NAND`に感謝です。

一応、出力を確認しておきましょう。

```cpp[出力テスト]
int main()
{
    printTruthTable<Gates::ANDv>("NAND");
    printTruthTable<Gates::ORv>("OR");
    printTruthTable<Gates::NORv>("NOR");
    printTruthTable<Gates::XORv>("XOR");
}
```

```[出力]
[NAND]
0 0 | 0
0 1 | 0
1 0 | 0
1 1 | 1
[OR]
0 0 | 0
0 1 | 1
1 0 | 1
1 1 | 1
[NOR]
0 0 | 1
0 1 | 0
1 0 | 0
1 1 | 0
[XOR]
0 0 | 0
0 1 | 1
1 0 | 1
1 1 | 0
```

完璧です。きちんと型のみで論理ゲートが実装できています。

### 基本論理ゲートのソースコード
基本論理ゲートの実装全体を以下に示しておきます。

```cpp[basic_gates.h]
#pragma once

#include "binary.h"

namespace Gates {
    template <Binary::IsBinary A, Binary::IsBinary B>
    struct NAND  {};
    template <Binary::IsZero A, Binary::IsZero B>
    struct NAND<A, B>  { using X = Binary::I; };
    template <Binary::IsZero A, Binary::IsOne B>
    struct NAND<A, B>  { using X = Binary::I; };
    template <Binary::IsOne A, Binary::IsZero B>
    struct NAND<A, B>  { using X = Binary::I; };
    template <Binary::IsOne A, Binary::IsOne B>
    struct NAND<A, B>  { using X = Binary::O; };
    template <Binary::IsBinary A, Binary::IsBinary B>
    using NANDv = typename NAND<A, B>::X;

    template <Binary::IsBinary A>
    using NOT = NAND<A, A>;
    template <Binary::IsBinary A>
    using NOTv = typename NOT<A>::X;

    template <Binary::IsBinary A, Binary::IsBinary B>
    using AND = NOT<NANDv<A, B>>;
    template <Binary::IsBinary A, Binary::IsBinary B>
    using ANDv = typename AND<A, B>::X;

    template <Binary::IsBinary A, Binary::IsBinary B>
    using OR = NAND<NOTv<A>, NOTv<B>>;
    template <Binary::IsBinary A, Binary::IsBinary B>
    using ORv = typename OR<A, B>::X;

    template <Binary::IsBinary A, Binary::IsBinary B>
    using NOR = NOT<ORv<A, B>>;
    template <Binary::IsBinary A, Binary::IsBinary B>
    using NORv = typename NOR<A, B>::X;

    template <Binary::IsBinary A, Binary::IsBinary B>
    using XOR = NAND<NANDv<A, NANDv<A, B>>, NANDv<NANDv<A, B>, B>>;
    template <Binary::IsBinary A, Binary::IsBinary B>
    using XORv = typename XOR<A, B>::X;
}
```

ここまでくれば加算器なんて簡単です。
