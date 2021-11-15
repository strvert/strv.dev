__NUXT_JSONP__("/blog/series-opengl--opengl-1", (function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y){return {data:[{}],fetch:{"0":{page:{slug:"opengl-1",description:s,title:"OpenGL入門から3DCGレンダラ実装まで その1",series:s,seriesIndex:1,tags:["OpenGL"],toc:[{id:i,depth:j,text:i},{id:k,depth:j,text:k},{id:l,depth:j,text:l},{id:u,depth:j,text:v}],body:{type:"root",children:[{type:b,tag:m,props:{id:i},children:[{type:b,tag:g,props:{href:"#%E8%B6%A3%E6%97%A8",ariaHidden:n,tabIndex:o},children:[{type:b,tag:p,props:{className:[q,r]},children:[]}]},{type:a,value:i}]},{type:a,value:c},{type:b,tag:e,props:{},children:[{type:a,value:"OpenGL や Direct X を始めとするグラフィックスライブラリに全く詳しくない(というかまともに触ったことがない)初心者が、勉強しながら作成する 3DCG レンダラを少しづつ解説していく記事です。4 本立てです。\nなんでこんなことをやろうと思ったかと言うと、趣味のゲーム制作で利用しているゲームエンジンへの理解をより深め、開発に活かしたいと考えたからです。この趣旨から、実装だけでなく文章も多い記事になっていくと思われます[^0]。"}]},{type:a,value:c},{type:b,tag:e,props:{},children:[{type:a,value:"有識者の方、間違い等あれば指摘していただけると大変助かります。"}]},{type:a,value:c},{type:b,tag:m,props:{id:k},children:[{type:b,tag:g,props:{href:"#%E5%89%8D%E6%8F%90%E7%9F%A5%E8%AD%98",ariaHidden:n,tabIndex:o},children:[{type:b,tag:p,props:{className:[q,r]},children:[]}]},{type:a,value:k}]},{type:a,value:c},{type:b,tag:w,props:{},children:[{type:a,value:c},{type:b,tag:f,props:{},children:[{type:a,value:"ベクトル、内積\u002F外積、行列、線形写像、アフィン写像など線形代数に関わる諸知識"}]},{type:a,value:c},{type:b,tag:f,props:{},children:[{type:a,value:"基礎的な C++知識"}]},{type:a,value:c},{type:b,tag:f,props:{},children:[{type:a,value:"基礎的な Linux 上での開発知識"}]},{type:a,value:c}]},{type:a,value:c},{type:b,tag:e,props:{},children:[{type:a,value:"それぞれの概念への解説は行いませんが、どんな処理をしているのかは説明しますので、詳細は分からなくても読むことはできます。というか僕が完全には理解できていません。"}]},{type:a,value:c},{type:b,tag:m,props:{id:l},children:[{type:b,tag:g,props:{href:"#%E3%83%86%E3%82%B9%E3%83%88%E7%92%B0%E5%A2%83",ariaHidden:n,tabIndex:o},children:[{type:b,tag:p,props:{className:[q,r]},children:[]}]},{type:a,value:l}]},{type:a,value:c},{type:b,tag:w,props:{},children:[{type:a,value:c},{type:b,tag:f,props:{},children:[{type:a,value:"Arch Linux x86_64 (linux 5.4.2.arch1-1)"}]},{type:a,value:c},{type:b,tag:f,props:{},children:[{type:a,value:"OpenGL 4.6.0 (NVIDIA 440.36)"}]},{type:a,value:c},{type:b,tag:f,props:{},children:[{type:a,value:"gcc 9.2.0"}]},{type:a,value:c}]},{type:a,value:c},{type:b,tag:m,props:{id:u},children:[{type:b,tag:g,props:{href:"#%E5%86%85%E5%AE%B9%E7%9B%AE%E6%A8%99",ariaHidden:n,tabIndex:o},children:[{type:b,tag:p,props:{className:[q,r]},children:[]}]},{type:a,value:v}]},{type:a,value:c},{type:b,tag:e,props:{},children:[{type:a,value:"このシリーズは 4 本立てで、以下の順で簡易的なライティングを施したボックスが表示できるところまでを実装します。"}]},{type:a,value:"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"},{type:b,tag:"table",props:{},children:[{type:b,tag:"thead",props:{},children:[{type:b,tag:h,props:{},children:[{type:b,tag:x,props:{},children:[{type:a,value:"記事"}]},{type:b,tag:x,props:{},children:[{type:a,value:"内容"}]}]}]},{type:b,tag:"tbody",props:{},children:[{type:b,tag:h,props:{},children:[{type:b,tag:d,props:{},children:[{type:a,value:"その 1"}]},{type:b,tag:d,props:{},children:[{type:a,value:"OpenGL 入門からウィンドウ表示"}]}]},{type:b,tag:h,props:{},children:[{type:b,tag:d,props:{},children:[{type:a,value:"その 2"}]},{type:b,tag:d,props:{},children:[{type:a,value:"平面ポリゴン表示から GLSL シェーダとテクスチャマッピング"}]}]},{type:b,tag:h,props:{},children:[{type:b,tag:d,props:{},children:[{type:a,value:"その 3"}]},{type:b,tag:d,props:{},children:[{type:a,value:"立方体ポリゴンの表示と回転・移動"}]}]},{type:b,tag:h,props:{},children:[{type:b,tag:d,props:{},children:[{type:a,value:"その 4"}]},{type:b,tag:d,props:{},children:[{type:a,value:"簡易的なライティングの実装"}]}]}]}]},{type:a,value:c},{type:b,tag:e,props:{},children:[{type:a,value:"今回は初回ということで、そもそも OpenGL とはなんぞや、OpenGL を使った開発ではどんなものを使うのか、周辺ライブラリは何があるのか？などについての情報を整理してみようと思います。また、次回から本格的な実装を始めるための環境構築も今回行います。"}]},{type:a,value:c},{type:b,tag:e,props:{},children:[{type:a,value:"また、ソースコードやリソースなどを各回の内容ごとに纏めたものを GitHub に公開していますので、記事と並べて見ていただくとわかりやすいかと思います。"}]},{type:a,value:c},{type:b,tag:e,props:{},children:[{type:a,value:"今回の内容のソースは"},{type:b,tag:g,props:{href:"https:\u002F\u002Fgithub.com\u002Fstrvworks\u002Fadvent_gl\u002Ftree\u002Fmaster\u002F1",rel:["nofollow","noopener","noreferrer"],target:"_blank"},children:[{type:a,value:"こちら"}]},{type:a,value:"です。"}]}]},dir:"\u002Farticles\u002Fseries-opengl",path:y,extension:".md",createdAt:"2021-09-22T07:31:56.000Z",updatedAt:"2021-10-01T11:44:02.000Z"},path:y},"data-v-08b63208:0":{prevTitle:t,nextTitle:"OpenGL入門から3DCGレンダラ実装まで その2",existPrev:false,existNext:true,prevSlug:t,nextSlug:"\u002Fblog\u002Fseries-opengl--opengl-2",seriesTitle:s,seriesPage:t}},mutations:void 0}}("text","element","\n","td","p","li","a","tr","趣旨",2,"前提知識","テスト環境","h2","true",-1,"span","icon","icon-link","OpenGL入門から3DCGレンダラ実装まで","","内容目標","内容・目標","ul","th","\u002Farticles\u002Fseries-opengl\u002Fopengl-1")));