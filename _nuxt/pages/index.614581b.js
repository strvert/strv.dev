(window.webpackJsonp=window.webpackJsonp||[]).push([[33,6,13,14,17,18,19,22],{375:function(e,t,n){const{ref:o}=n(0);var content=n(378);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(28).default)("3fadfefb",content,!0,{sourceMap:!1})},376:function(e,t,n){"use strict";n.r(t);n(0),n(104);var o=n(9),r=Object(o.c)({props:{src:{type:String,default:""},alt:{type:String,default:""},duration:{type:Number,default:.2}},setup:function(e){var t=Object(o.h)(!1);return Object(o.f)((function(){document.querySelector("img").style.setProperty("--duration","".concat(e.duration,"s"))})),{loadFinished:function(){t.value=!0},loaded:t}}}),l=(n(377),n(14)),component=Object(l.a)(r,(function(){var e=this,t=e.$createElement;return(e._self._c||t)("img",{class:{loaded:e.loaded,unloaded:!e.loaded},attrs:{src:e.src,alt:e.alt},on:{load:e.loadFinished}})}),[],!1,null,"467eb550",null);t.default=component.exports},377:function(e,t,n){"use strict";n(0),n(375)},378:function(e,t,n){var o=n(27)((function(i){return i[1]}));o.push([e.i,"img[data-v-467eb550]{transition-property:opacity;transition-duration:var(--duration)}.unloaded[data-v-467eb550]{opacity:0}.loaded[data-v-467eb550]{opacity:1}",""]),o.locals={},e.exports=o},390:function(e,t,n){const{ref:o}=n(0);var content=n(403);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(28).default)("5a7337cd",content,!0,{sourceMap:!1})},394:function(e,t,n){const{ref:o}=n(0);var content=n(412);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(28).default)("604beb75",content,!0,{sourceMap:!1})},397:function(e,t,n){const{ref:o}=n(0);var content=n(419);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(28).default)("40acc01c",content,!0,{sourceMap:!1})},398:function(e,t,n){const{ref:o}=n(0);var content=n(422);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(28).default)("3b2fd0d1",content,!0,{sourceMap:!1})},402:function(e,t,n){"use strict";n(0),n(390)},403:function(e,t,n){var o=n(27)((function(i){return i[1]}));o.push([e.i,"article[data-v-9424f5ac]{background-color:var(--strvdev-palette-1);border:2px solid #505464;padding:.2em;-webkit-padding-before:.9em;padding-block-start:.9em;border-radius:2px;block-size:100%;display:relative}article header[data-v-9424f5ac]{block-size:80px;display:flex;align-items:center;justify-content:center}article header .img[data-v-9424f5ac]{display:block;inline-size:3.8em;-webkit-margin-after:.5em;margin-block-end:.5em}article .desc[data-v-9424f5ac]{display:absolute;bottom:0;padding:0 .2em;-webkit-margin-after:.3em;margin-block-end:.3em}article .desc p[data-v-9424f5ac]{margin:0}article .desc .name[data-v-9424f5ac]{font-weight:600;-webkit-margin-after:.3em;margin-block-end:.3em}article .desc .comment[data-v-9424f5ac]{font-size:.82em;-webkit-margin-after:.3em;margin-block-end:.3em;word-break:break-all;text-align:justify}",""]),o.locals={},e.exports=o},408:function(e,t,n){"use strict";n.r(t);n(0);var o=n(9),r=n(376),l=Object(o.c)({name:"skill-panel",components:{LazyLoadImage:r.default},props:{skill:{type:Object,required:!0},color:{type:String,default:"#7ac292"}}}),c=(n(402),n(14)),component=Object(c.a)(l,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("article",{staticClass:"skill-panel"},[n("header",[n("lazy-load-image",{staticClass:"img",attrs:{src:e.skill.icon,alt:e.skill.name+" icon image"}})],1),e._v(" "),n("div",{staticClass:"desc"},[n("p",{staticClass:"name"},[e._v(e._s(e.skill.name))]),e._v(" "),n("p",{staticClass:"comment"},[e._v(e._s(e.skill.content))])])])}),[],!1,null,"9424f5ac",null);t.default=component.exports},411:function(e,t,n){"use strict";n(0),n(394)},412:function(e,t,n){var o=n(27)((function(i){return i[1]}));o.push([e.i,'.largelogo[data-v-3a486faa]{--blur:8px;--anim-duration:2s;transition-duration:.5s;transition-property:width inline-size font-size opacity;position:relative;display:grid;grid-template-areas:"one"}@-webkit-keyframes top-text-in-data-v-3a486faa{0%{filter:blur(var(--blur)) grayscale(20%)}50%{filter:blur(var(--blur)) grayscale(20%)}to{filter:blur(0) grayscale(0)}}@keyframes top-text-in-data-v-3a486faa{0%{filter:blur(var(--blur)) grayscale(20%)}50%{filter:blur(var(--blur)) grayscale(20%)}to{filter:blur(0) grayscale(0)}}@-webkit-keyframes logo-in-1-data-v-3a486faa{0%{filter:blur(0) grayscale(0);transform:none}50%{filter:blur(0) grayscale(0);transform:none}to{filter:blur(var(--blur)) grayscale(20%);transform:rotate(1turn)}}@keyframes logo-in-1-data-v-3a486faa{0%{filter:blur(0) grayscale(0);transform:none}50%{filter:blur(0) grayscale(0);transform:none}to{filter:blur(var(--blur)) grayscale(20%);transform:rotate(1turn)}}.largelogo img[data-v-3a486faa]{width:100%;margin:auto 0;-webkit-animation-name:logo-in-1-data-v-3a486faa;animation-name:logo-in-1-data-v-3a486faa;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards;z-index:0}.largelogo header[data-v-3a486faa],.largelogo img[data-v-3a486faa]{grid-area:one;display:block;-webkit-animation-duration:var(--anim-duration);animation-duration:var(--anim-duration)}.largelogo header[data-v-3a486faa]{--center-block-size:65%;width:var(--center-block-size);margin:auto;position:relative;top:0;left:0;transition:inherit;-webkit-animation-name:top-text-in-data-v-3a486faa;animation-name:top-text-in-data-v-3a486faa;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.largelogo header h1[data-v-3a486faa]{top:-20px;font-weight:600}.largelogo header h1[data-v-3a486faa],.largelogo header p[data-v-3a486faa]{width:100%;position:relative;margin:0;left:0;text-align:center}.largelogo header p[data-v-3a486faa]{top:-30px;font-weight:500}.largelogo header.unmounted[data-v-3a486faa]{opacity:0}@media screen and (min-width:800px){.largelogo header p[data-v-3a486faa]{font-size:3rem}}@media screen and (max-width:800px){.largelogo header p[data-v-3a486faa]{font-size:6.5vw}}',""]),o.locals={},e.exports=o},418:function(e,t,n){"use strict";n(0),n(397)},419:function(e,t,n){var o=n(27)((function(i){return i[1]}));o.push([e.i,"table tbody tr th[data-v-536c8d86]{inline-size:10em;text-align:left}",""]),o.locals={},e.exports=o},420:function(e,t,n){const{ref:o}=n(0);var content=n(440);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(28).default)("b22d36a4",content,!0,{sourceMap:!1})},421:function(e,t,n){"use strict";n(0),n(398)},422:function(e,t,n){var o=n(27)((function(i){return i[1]}));o.push([e.i,"ul[data-v-26524931]{display:grid;gap:.3em;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));padding:0}ul li[data-v-26524931]{display:block;list-style:none}",""]),o.locals={},e.exports=o},423:function(e,t,n){"use strict";n.r(t);n(0);var o=n(9),r=n(191),l=n(376),c=Object(o.c)({components:{StrvDevLogo:r.default,LazyLoadImage:l.default},setup:function(){var e=Object(o.h)("Welcome to"),t=Object(o.h)(75),n=function(){var e=document.querySelector(".largelogo");e.style.setProperty("--blur","".concat(.01*e.clientWidth,"px")),t.value=.1*e.clientWidth},r=Object(o.h)(!1);return Object(o.f)((function(){window.addEventListener("resize",n),n(),r.value=!0,document.querySelector(".large-icon").style.setProperty("animation-name","")})),Object(o.e)((function(){window.removeEventListener("resize",n)})),{message:e,logoScale:t,mounted:r}}}),d=(n(411),n(14)),component=Object(d.a)(c,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("section",{staticClass:"largelogo"},[n("lazy-load-image",{staticClass:"large-icon",attrs:{duration:3,alt:"大きなすとんりばーのアイコン",src:"/images/logo/stonriver_640.webp"}}),e._v(" "),n("header",{class:{unmounted:!e.mounted}},[n("p",[e._v(e._s(e.message))]),e._v(" "),n("h1",[n("strv-dev-logo",{attrs:{logoScale:e.logoScale}})],1)])],1)}),[],!1,null,"3a486faa",null);t.default=component.exports},427:function(e,t,n){"use strict";n.r(t);n(0);var o=n(9),r=Object(o.c)({name:"object-table",props:{data:{type:Array,required:!0}}}),l=(n(418),n(14)),component=Object(l.a)(r,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("table",[n("tbody",e._l(e.data,(function(t){return n("tr",{key:t.name},[n("th",[e._v(e._s(t.name))]),e._v(" "),n("td",[e._v(e._s(t.content))])])})),0)])}),[],!1,null,"536c8d86",null);t.default=component.exports},428:function(e,t,n){"use strict";n.r(t);n(0);var o=n(9),r=n(408),l=Object(o.c)({name:"skill-category-group",components:{SkillPanel:r.default},props:{skillCategoryGroup:{type:Object,required:!0}},setup:function(){}}),c=(n(421),n(14)),component=Object(c.a)(l,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("h3",[e._v(e._s(e.skillCategoryGroup.category))]),e._v(" "),n("ul",e._l(e.skillCategoryGroup.skills,(function(e){return n("li",{key:e.name},[n("skill-panel",{attrs:{skill:e}})],1)})),0),e._v(" "),n("div")])}),[],!1,null,"26524931",null);t.default=component.exports},438:function(e){e.exports=JSON.parse('[{"name":"スクリーンネーム","content":"stonriver (すとんりばー)"},{"name":"リアルネーム","content":"Riku Ishikawa (リク イシカワ)"},{"name":"生年月日","content":"2000/11/09"},{"name":"ひとこと","content":"創作大好き。学生ではない。"}]')},439:function(e,t,n){"use strict";n(0),n(420)},440:function(e,t,n){var o=n(27)((function(i){return i[1]}));o.push([e.i,".basic-profiles[data-v-0b31e970]{display:flex;align-items:center;justify-content:center;gap:1em}@media screen and (max-width:800px){.basic-profiles[data-v-0b31e970]{flex-direction:column}}.basic-profiles .icon[data-v-0b31e970]{flex:1}.basic-profiles .icon .icon-img[data-v-0b31e970]{display:block;margin:0 auto;inline-size:100%}@media screen and (max-width:800px){.basic-profiles .icon .icon-img[data-v-0b31e970]{inline-size:40%}}.basic-profiles .profile-infos[data-v-0b31e970]{flex:3}.basic-profiles .profile-infos .table[data-v-0b31e970]{block-size:98%;margin:auto}",""]),o.locals={},e.exports=o},441:function(e){e.exports=JSON.parse('[{"category":"ゲーム開発・3DCG系","skills":[{"name":"Unreal Engine","icon":"/images/skills/unrealengine.webp","content":"エンジン改造とかプラグイン・ツール開発とかばっかりやってます。一応コントリビューター。"},{"name":"Unity","icon":"/images/skills/unity.webp","content":"かなり前に触っていました。業務でもすこしだけ。最近のことはよくわかりません。"},{"name":"Houdini","icon":"/images/skills/houdini.webp","content":"Houdini Engine を使って、 Unreal Engine と一緒に楽しんでいます。"},{"name":"Blender","icon":"/images/skills/blender.webp","content":"最低限触れます。有機体・生命体みたいな美的センスを求まれるポリゴンモデリングは苦手。"},{"name":"DirectX 12","icon":"/images/skills/directx12.webp","content":"すこしだけ。勉強中。                                                                "}]},{"category":"バックエンド・アプリケーション系","skills":[{"name":"C++","icon":"/images/skills/c++.webp","content":"出来るとは(怖くて)言えませんが、一番得意で好きな言語です。一番書いてる言語でもあります。"},{"name":"C","icon":"/images/skills/c.webp","content":"低レイヤなコーディングも結構好きなので、Cも好きです。業務経験もあり。"},{"name":"Go","icon":"/images/skills/go.webp","content":"一時期ハマってました。業務経験もあり。"},{"name":"Rust","icon":"/images/skills/rust.webp","content":"とにかくカッコよくて好きです。最近ハマっています。UEでRustが使えたらいいのにとか思っています。"},{"name":"Python","icon":"/images/skills/python.webp","content":"静的型付けの素晴らしさに気づくまでは結構書いてました。今でもスクリプト用途でよく書きます。"},{"name":"Java","icon":"/images/skills/java.webp","content":"MinecraftのModを書くためだけに書いていました。趣味です。"},{"name":"C#","icon":"/images/skills/csharp.webp","content":"UnityやWindows Application、UE4のビルドツール周りなどで触れましたが、詳しくはありません。"}]},{"category":"フロントエンド系","skills":[{"name":"HTML","icon":"/images/skills/html.webp","content":"黙々と書きます。"},{"name":"JavaScript","icon":"/images/skills/javascript.webp","content":"まあ書ける程度に書けます。"},{"name":"TypeScript","icon":"/images/skills/typescript.webp","content":"JSと同じく、まあ書ける程度に書けます。もっぱらJSではなくTSを使って書きます。"},{"name":"Vue.js","icon":"/images/skills/vuejs.webp","content":"個人制作のための周辺アプリケーションをいくつかVue.jsを用いて作成しています。"},{"name":"Nuxt.js","icon":"/images/skills/nuxtjs.webp","content":"物が作れる程度には使えます。このサイトもNuxt.jsで作られています。"},{"name":"CSS","icon":"/images/skills/css.webp","content":"昔はめちゃくちゃ嫌いでしたが、今は結構楽しく書きます(SCSSを使って)。"},{"name":"SASS/SCSS","icon":"/images/skills/sassscss.webp","content":"基本的人権です。CSSを書くならこれがないと途中で泣き始めます。楽しく書きます。"}]},{"category":"インフラ系","skills":[{"name":"Docker / Docker compose","icon":"/images/skills/dockerdockercompose.webp","content":"便利な道具として使っています。"},{"name":"AWS","icon":"/images/skills/aws.webp","content":"AWS(超絶ざっくり)。EC2,Lambda,S3,ECS,API Gateway等々のような、頻繁に使われるサービスは業務や個人活動の過程で利用してきました。"},{"name":"Nginx","icon":"/images/skills/nginx.webp","content":"基礎的な構築・設定程度はできます。チューニングとかになると経験不足感。"},{"name":"自宅サーバー","icon":"/images/skills/server.webp","content":"(雑な)運用五年目くらい。"}]},{"category":"創作・芸術系","skills":[{"name":"シナリオ執筆","icon":"/images/skills/scenario.webp","content":"個人的な活動として、シナリオ執筆を行っています。世界観の考案や、ストーリーとのすり合わせなど、大好きな作業です。"},{"name":"小説執筆","icon":"/images/skills/novel.webp","content":"稀ですが、文字も書きます。SFな作品が得意です。とある選考でいいところまで行ったことがあったり……？"},{"name":"音楽","icon":"/images/skills/music.webp","content":"上手くはないですが、ピアノを弾きます。作曲はまだできませんが、しょぼい音感(幼少期の自分のおかげ)を頼りに簡単な採譜をしたりして遊んでいます。"}]},{"category":"分類なし・好み","skills":[{"name":"Git / GitHub","icon":"/images/skills/gitgithub.webp","content":"普通に開発できる程度に使えます。"},{"name":"Vim / NeoVim","icon":"/images/skills/vimneovim.webp","content":"宗教です。ほぼすべての開発でNeoVimを使っている。ただしUnreal Engineは例外。"},{"name":"Arch Linux","icon":"/images/skills/archlinux.webp","content":"Arch Linuxが好きです。他のディストロも触りますが、やはり安住の地はArchです。"},{"name":"Rider for Unreal Engine","icon":"/images/skills/riderforunrealengine.webp","content":"Unreal Engineでの開発をするときにはこいつを使います。優秀なので気に入っています。"}]}]')},449:function(e,t,n){const{ref:o}=n(0);var content=n(469);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(28).default)("7d74b29a",content,!0,{sourceMap:!1})},453:function(e,t,n){"use strict";n.r(t);n(0);var o=n(9),r=n(376),l=n(427),c=n(438),d=Object(o.c)({name:"basic-profile",components:{LazyLoadImage:r.default,ObjectTable:l.default},setup:function(){return{basicProfileData:c}}}),m=(n(439),n(14)),component=Object(m.a)(d,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("section",[n("div",{staticClass:"basic-profiles"},[n("header",{staticClass:"icon"},[n("lazy-load-image",{staticClass:"icon-img",attrs:{src:"/images/logo/stonriver_640.webp",alt:"すとんりばーのアイコン"}})],1),e._v(" "),n("div",{staticClass:"profile-infos"},[n("object-table",{staticClass:"table",attrs:{data:e.basicProfileData}})],1)])])}),[],!1,null,"0b31e970",null);t.default=component.exports},454:function(e,t,n){"use strict";n.r(t);n(0);var o=n(9),r=n(428),l=n(441),c=Object(o.c)({name:"skill-profile",components:{SkillCategoryGroup:r.default},setup:function(){return{SkillSets:l}}}),d=n(14),component=Object(d.a)(c,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("section",[n("h2",[e._v("スキルセット")]),e._v(" "),n("p",[e._v("\n    好奇心につられて色んなものを触りまくってきました。ここではスキルと言えそうなものを選んで並べてみました。\n  ")]),e._v(" "),e._l(e.SkillSets,(function(e){return n("div",{key:e.category},[n("skill-category-group",{attrs:{skillCategoryGroup:e}})],1)}))],2)}),[],!1,null,null,null);t.default=component.exports},468:function(e,t,n){"use strict";n(0),n(449)},469:function(e,t,n){var o=n(27)((function(i){return i[1]}));o.push([e.i,"article[data-v-ec231cac]{transition-property:font-size;transition-duration:.2s}article #main-message[data-v-ec231cac]{padding-top:44px;margin-top:-44px}article .logos[data-v-ec231cac]{position:relative;display:flex;justify-content:center;align-items:center;height:100vh}article .logos .logo[data-v-ec231cac]{width:80%}article .jump[data-v-ec231cac]{display:block;position:relative;transition-property:bottom;transition-duration:.2s;left:50%;transform:translateX(-50%);cursor:pointer;border-style:none;background-color:transparent;color:#000;filter:drop-shadow(0 0 3px white);opacity:.6}@media screen and (max-width:800px){article .jump[data-v-ec231cac]{bottom:25vh}}@media screen and (min-width:800px){article .jump[data-v-ec231cac]{bottom:10vh}}article .jump i[data-v-ec231cac]{font-size:4em;font-weight:700;-webkit-animation-name:updown-shake-data-v-ec231cac;animation-name:updown-shake-data-v-ec231cac;-webkit-animation-duration:.9s;animation-duration:.9s;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;-webkit-animation-direction:alternate;animation-direction:alternate;-webkit-animation-timing-function:ease;animation-timing-function:ease}article .content[data-v-ec231cac]{min-block-size:100vh;font-size:1.1rem}article .content .b-profile[data-v-ec231cac],article .content .c-profile[data-v-ec231cac]{font-size:1.6rem}@media screen and (max-width:800px){article .content .b-profile[data-v-ec231cac],article .content .c-profile[data-v-ec231cac]{font-size:3.8461538462vw}}article .content .b-profile[data-v-ec231cac]{margin:.3em 0}@media screen and (max-width:800px){article .content .b-profile[data-v-ec231cac]{margin:.1em 0}}article h1[data-v-ec231cac]{transition:inherit;font-size:2.8rem;font-weight:700}@media screen and (max-width:800px){article h1[data-v-ec231cac]{font-size:2.4rem}}@-webkit-keyframes updown-shake-data-v-ec231cac{0%{transform:translateY(-10px) rotate(180deg)}to{transform:translateY(10px) rotate(180deg)}}@keyframes updown-shake-data-v-ec231cac{0%{transform:translateY(-10px) rotate(180deg)}to{transform:translateY(10px) rotate(180deg)}}",""]),o.locals={},e.exports=o},491:function(e,t,n){"use strict";n.r(t);n(0);var o=n(9),r=n(423),l=n(453),c=n(270),d=n(454),m=Object(o.c)({name:"top",components:{TopLargeLogo:r.default,BasicProfile:l.default,ContactProfile:c.default,SkillProfile:d.default},setup:function(){Object(o.j)({titleTemplate:"strv.dev"});var e=Object(o.h)(!0);Object(o.f)((function(){var t=.01*window.innerHeight;document.documentElement.style.setProperty("--initial-vh","".concat(t,"px")),"true"===localStorage.getItem("visited")?e.value=!1:localStorage.setItem("visited","true")}));return{first:e,scroll:function(e){var t;null===(t=document.querySelector(e))||void 0===t||t.scrollIntoView(!0)}}}}),f=(n(468),n(14)),component=Object(f.a)(m,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("article",[n("div",{staticClass:"logos"},[n("top-large-logo",{staticClass:"logo"})],1),e._v(" "),n("button",{staticClass:"jump",attrs:{href:"#main-message"},on:{click:function(t){return e.scroll("#main-message")}}},[n("i",{staticClass:"im im-eject"})]),e._v(" "),n("h1",{attrs:{id:"main-message"}},[e._v(e._s(e.first?"はじめまして！":"また会いましたね！"))]),e._v(" "),n("div",{staticClass:"content"},[n("p",[e._v("\n      ここは"),n("strong",[e._v("すとんりばー")]),e._v("のポートフォリオ兼"),n("nuxt-link",{attrs:{to:"/blog"}},[n("strong",[e._v("ブログ")])]),e._v("サイトです。すこしだけ自己紹介を見ていってください。\n    ")],1),e._v(" "),n("basic-profile",{staticClass:"b-profile"}),e._v(" "),n("contact-profile",{staticClass:"c-profile"}),e._v(" "),n("skill-profile",{staticClass:"s-profile"})],1)])}),[],!1,null,"ec231cac",null);t.default=component.exports}}]);