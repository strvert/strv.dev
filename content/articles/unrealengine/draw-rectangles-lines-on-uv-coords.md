---
title: 'マテリアルでUV座標上に長方形とかを描く'
description: 'UEのマテリアルを使って、UV座標上に図形を描画するメモ'
tags:
  - Unreal Engine
  - UE Material
assets: '/article-assets/unrealengine/draw-rectangles-lines-on-uv-coords'
---

# 趣旨

UV 座標空間に長方形とかの図形を描くマテリアルを遊びで作ったのでメモとして記事にしておきます。以下のようなことになります。

::vl[draw-rect-mask-internal]{src=#/rectangles.mp4}

# 環境

- Engine Version: 5.0.0 Early Access 2

# UV 座標から長方形マスクを作成する

まず、以下のような Material Function を作成しました。Custom ノード内部の内部で各ピクセルの UV 座標に基づいて長方形の内外を判定し、マスクを作成しています。
![draw-rect-mask-internal.png](#/draw-rect-mask-internal.png)

```hlsl title="Custom Nodeのコード"
float range = abs(UVs.x - 0.5 + Offset.x);
float half_w = Width / 2;

float ubGrad = (0.5 - abs(UVs.y - 0.5 + Offset.y)) * 2;
float mask = int((ubGrad - CutOut*2) + 0.999999);

float lineBase = 1-int(range - half_w + 0.999999);

return mask * lineBase;
```

シェーダーにおいては、ifなどによる分岐命令パイプライン上で分岐が発生する機能を使用すると大きな性能低下が見られるため、ifを用いない形で記述しています。そのため少しわかりにくくなっていますが、やっていることは`Width`の幅を持ち、上下を`CutOut`の大きさだけカットされ、`Offset`分描画位置をオフセットされた長方形を想定し、該当ピクセルに対応するUV座標がその内側か外側かを判定しているだけです。これだけで、長方形のマスクを作成することができます。(ノードを見るとCustomRotatorによる入力UVの回転を行い、長方形を回転させる機能が入っていますが、汎用性のために入れただけで今回は使っていません)

しかし、このパラメータだとすこし使いにくいので、より長方形マスクを作成することに特化したマテリアル関数でラップします。

![draw-rect-mask.png](#/draw-rect-mask.png)

こちらは極めて単純です。先程のマテリアル関数の入力パラメータを`UVs` `Width` `Height` `Left` `Top` という扱いやすいものにするための前処理を加えただけです。

せっかくですので、長方形マスクだけでなく、透明度と色を持った長方形を描画するマテリアル関数も作ってみましょう。

![draw-color-rect.png](#/draw-color-rect.png)

このネットワークでは、先ほど作成した長方形マスク関数を元に、長方形の色と背景の色を透明度付きで指定できるようにしています。
これで位置・サイズ・色が指定可能な長方形が作れたので、これを素材に何かを生成するなり、テクスチャに合成するなりして自由に使うことができます。
今回はテストですので、テクスチャに対して異なる色・透明度を持つ複数の正方形をアルファブレンドするサンプル(冒頭に示していたもの)を作成しました。

![final-node.png](#/final-node.png)
こちらがサンプルのネットワークです。(動きをつけている部分は今回の本質ではないので入れていません)


# まとめ
UV座標を元に図形を描くのは案外簡単にできる。今回は長方形だったので(擬似的な)条件分岐で実装したが、円のような陰関数も同様の考え方で描画できる。次はレイマーチングしたい。
