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

まず、以下のような Material Function を作成しました。マテリアルはピクセルシェーダとして処理を記述することができるので、Custom ノード内部の内部で各ピクセルの UV 座標に基づいて長方形の内外を判定し、マスクを作成しています。
![draw-rect-mask-internal.png](#/draw-rect-mask-internal.png)
