__NUXT_JSONP__("/blog/series-opengl--opengl-1", (function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F){return {data:[{}],fetch:{"data-v-06f684fe:0":{page:{slug:"opengl-1",description:s,title:"OpenGL入門から3DCGレンダラ実装まで その1",series:s,toc:[{id:n,depth:o,text:n},{id:p,depth:o,text:p},{id:q,depth:o,text:q},{id:x,depth:o,text:y}],body:{type:"root",children:[{type:b,tag:"h1",props:{id:z},children:[{type:b,tag:e,props:{href:"#%E3%81%AF%E3%81%98%E3%82%81%E3%81%AB",ariaHidden:h,tabIndex:i},children:[{type:b,tag:j,props:{className:[k,l]},children:[]}]},{type:a,value:z}]},{type:a,value:c},{type:b,tag:"blockquote",props:{},children:[{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"この記事は、LOCAL students Advent Calendar 2019の21日目です。"}]},{type:a,value:c}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:b,tag:e,props:{href:A,rel:[t,u,v],target:w},children:[{type:a,value:A}]}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"昨日の記事ははいばらさんによる「"},{type:b,tag:e,props:{href:"https:\u002F\u002Ftwitter.com\u002Fstrvert\u002Fstatus\u002F1208047694008082433",rel:[t,u,v],target:w},children:[{type:a,value:"▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒"}]},{type:a,value:"」でした。\n▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒かと思ったら、▓▓▓▓▓▓▓▓▓いました。面白かったです。"}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"一転、全く内容は変わって僕は「OpenGL入門から3DCGレンダラ実装まで 」のその1を書いていきます。学生部でアドベントカレンダーの話がでた当初、やることを先に決めた上でこれなら4日位あれば書けるかなあみたいな軽い気持ちで枠を取りましたが、結局直前まで開発をしていなかったので大変です。"}]},{type:a,value:c},{type:b,tag:r,props:{id:n},children:[{type:b,tag:e,props:{href:"#%E8%B6%A3%E6%97%A8",ariaHidden:h,tabIndex:i},children:[{type:b,tag:j,props:{className:[k,l]},children:[]}]},{type:a,value:n}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"OpenGLやDirect Xを始めとするグラフィックスライブラリに全く詳しくない(というかまともに触ったことがない)初心者が、勉強しながら作成する3DCGレンダラを少しづつ解説していく記事です。4本立てです。\nなんでこんなことをやろうと思ったかと言うと、趣味のゲーム制作で利用しているゲームエンジンへの理解をより深め、開発に活かしたいと考えたからです。この趣旨から、実装だけでなく文章も多い記事になっていくと思われます[^0]。"}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"有識者の方、間違い等あれば指摘していただけると大変助かります。"}]},{type:a,value:c},{type:b,tag:r,props:{id:p},children:[{type:b,tag:e,props:{href:"#%E5%89%8D%E6%8F%90%E7%9F%A5%E8%AD%98",ariaHidden:h,tabIndex:i},children:[{type:b,tag:j,props:{className:[k,l]},children:[]}]},{type:a,value:p}]},{type:a,value:c},{type:b,tag:B,props:{},children:[{type:a,value:c},{type:b,tag:g,props:{},children:[{type:a,value:"ベクトル、内積\u002F外積、行列、線形写像、アフィン写像など線形代数に関わる諸知識"}]},{type:a,value:c},{type:b,tag:g,props:{},children:[{type:a,value:"基礎的なC++知識"}]},{type:a,value:c},{type:b,tag:g,props:{},children:[{type:a,value:"基礎的なLinux上での開発知識"}]},{type:a,value:c}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"それぞれの概念への解説は行いませんが、どんな処理をしているのかは説明しますので、詳細は分からなくても読むことはできます。というか僕が完全には理解できていません。"}]},{type:a,value:c},{type:b,tag:r,props:{id:q},children:[{type:b,tag:e,props:{href:"#%E3%83%86%E3%82%B9%E3%83%88%E7%92%B0%E5%A2%83",ariaHidden:h,tabIndex:i},children:[{type:b,tag:j,props:{className:[k,l]},children:[]}]},{type:a,value:q}]},{type:a,value:c},{type:b,tag:B,props:{},children:[{type:a,value:c},{type:b,tag:g,props:{},children:[{type:a,value:"Arch Linux x86_64 (linux 5.4.2.arch1-1)"}]},{type:a,value:c},{type:b,tag:g,props:{},children:[{type:a,value:"OpenGL 4.6.0 (NVIDIA 440.36)"}]},{type:a,value:c},{type:b,tag:g,props:{},children:[{type:a,value:"gcc 9.2.0"}]},{type:a,value:c}]},{type:a,value:c},{type:b,tag:r,props:{id:x},children:[{type:b,tag:e,props:{href:"#%E5%86%85%E5%AE%B9%E7%9B%AE%E6%A8%99",ariaHidden:h,tabIndex:i},children:[{type:b,tag:j,props:{className:[k,l]},children:[]}]},{type:a,value:y}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"このシリーズは4本立てで、以下の順で簡易的なライティングを施したボックスが表示できるところまでを実装します。"}]},{type:a,value:"\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"},{type:b,tag:"table",props:{},children:[{type:b,tag:"thead",props:{},children:[{type:b,tag:m,props:{},children:[{type:b,tag:C,props:{},children:[{type:a,value:"記事"}]},{type:b,tag:C,props:{},children:[{type:a,value:"内容"}]}]}]},{type:b,tag:"tbody",props:{},children:[{type:b,tag:m,props:{},children:[{type:b,tag:f,props:{},children:[{type:a,value:"その1"}]},{type:b,tag:f,props:{},children:[{type:a,value:"OpenGL入門からウィンドウ表示"}]}]},{type:b,tag:m,props:{},children:[{type:b,tag:f,props:{},children:[{type:a,value:"その2"}]},{type:b,tag:f,props:{},children:[{type:a,value:"平面ポリゴン表示からGLSLシェーダとテクスチャマッピング"}]}]},{type:b,tag:m,props:{},children:[{type:b,tag:f,props:{},children:[{type:a,value:"その3"}]},{type:b,tag:f,props:{},children:[{type:a,value:"立方体ポリゴンの表示と回転・移動"}]}]},{type:b,tag:m,props:{},children:[{type:b,tag:f,props:{},children:[{type:a,value:"その4"}]},{type:b,tag:f,props:{},children:[{type:a,value:"簡易的なライティングの実装"}]}]}]}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"今回は初回ということで、そもそもOpenGLとはなんぞや、OpenGLを使った開発ではどんなものを使うのか、周辺ライブラリは何があるのか？などについての情報を整理してみようと思います。また、次回から本格的な実装を始めるための環境構築も今回行います。"}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"また、ソースコードやリソースなどを各回の内容ごとに纏めたものをGitHubに公開していますので、記事と並べて見ていただくとわかりやすいかと思います。"}]},{type:a,value:c},{type:b,tag:d,props:{},children:[{type:a,value:"今回の内容のソースは"},{type:b,tag:e,props:{href:"https:\u002F\u002Fgithub.com\u002Fstrvworks\u002Fadvent_gl\u002Ftree\u002Fmaster\u002F1",rel:[t,u,v],target:w},children:[{type:a,value:"こちら"}]},{type:a,value:"です。"}]}]},dir:"\u002Farticles\u002Fseries-opengl",path:D,extension:".md",createdAt:E,updatedAt:E},displayDateString:"2021.09.22",dateString:"2021-09-22T17:00:52+09:00",publishStatus:"公開",pagePath:D,series:s},"data-v-be034c16:0":{prevTitle:F,nextTitle:"OpenGL入門から3DCGレンダラ実装まで その2",existPrev:false,existNext:true,prevSlug:F,nextSlug:"\u002Fblog\u002Fseries-opengl--opengl-2"}},mutations:void 0}}("text","element","\n","p","a","td","li","true",-1,"span","icon","icon-link","tr","趣旨",2,"前提知識","テスト環境","h2","OpenGL入門から3DCGレンダラ実装まで","nofollow","noopener","noreferrer","_blank","内容目標","内容・目標","はじめに","https:\u002F\u002Fadventar.org\u002Fcalendars\u002F4020","ul","th","\u002Farticles\u002Fseries-opengl\u002Fopengl-1","2021-09-22T08:00:52.000Z","")));