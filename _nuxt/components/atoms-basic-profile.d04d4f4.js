(window.webpackJsonp=window.webpackJsonp||[]).push([[7,14,15],{370:function(t,e,n){const{ref:o}=n(0);var content=n(374);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(30).default)("3fadfefb",content,!0,{sourceMap:!1})},372:function(t,e,n){"use strict";n.r(e);n(0),n(104);var o=n(11),c=Object(o.c)({props:{src:{type:String,default:""},alt:{type:String,default:""},duration:{type:Number,default:.2}},setup:function(t){var e=Object(o.h)(!1);return Object(o.f)((function(){document.querySelector("img").style.setProperty("--duration","".concat(t.duration,"s"))})),{loadFinished:function(){e.value=!0},loaded:e}}}),r=(n(373),n(17)),component=Object(r.a)(c,(function(){var t=this,e=t.$createElement;return(t._self._c||e)("img",{class:{loaded:t.loaded,unloaded:!t.loaded},attrs:{src:t.src,alt:t.alt},on:{load:t.loadFinished}})}),[],!1,null,"467eb550",null);e.default=component.exports},373:function(t,e,n){"use strict";n(0),n(370)},374:function(t,e,n){var o=n(29)((function(i){return i[1]}));o.push([t.i,"img[data-v-467eb550]{transition-property:opacity;transition-duration:var(--duration)}.unloaded[data-v-467eb550]{opacity:0}.loaded[data-v-467eb550]{opacity:1}",""]),o.locals={},t.exports=o},392:function(t,e,n){const{ref:o}=n(0);var content=n(410);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(30).default)("40acc01c",content,!0,{sourceMap:!1})},409:function(t,e,n){"use strict";n(0),n(392)},410:function(t,e,n){var o=n(29)((function(i){return i[1]}));o.push([t.i,"table tbody tr th[data-v-536c8d86]{inline-size:10em;text-align:left}",""]),o.locals={},t.exports=o},411:function(t,e,n){const{ref:o}=n(0);var content=n(431);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,n(30).default)("60334232",content,!0,{sourceMap:!1})},419:function(t,e,n){"use strict";n.r(e);n(0);var o=n(11),c=Object(o.c)({name:"object-table",props:{data:{type:Array,required:!0}}}),r=(n(409),n(17)),component=Object(r.a)(c,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("table",[n("tbody",t._l(t.data,(function(e){return n("tr",{key:e.name},[n("th",[t._v(t._s(e.name))]),t._v(" "),n("td",[t._v(t._s(e.content))])])})),0)])}),[],!1,null,"536c8d86",null);e.default=component.exports},429:function(t){t.exports=JSON.parse('[{"name":"スクリーンネーム","content":"stonriver (すとんりばー)"},{"name":"リアルネーム","content":"Riku Ishikawa (リク イシカワ)"},{"name":"生年月日","content":"2000/11/09"},{"name":"ひとこと","content":"創作大好き。学生ではない。"}]')},430:function(t,e,n){"use strict";n(0),n(411)},431:function(t,e,n){var o=n(29)((function(i){return i[1]}));o.push([t.i,".basic-profiles[data-v-49f965df]{display:flex;align-items:center;justify-content:center;gap:1em;margin:1em 0}@media screen and (max-width:800px){.basic-profiles[data-v-49f965df]{flex-direction:column}}.basic-profiles .icon[data-v-49f965df]{flex:1}.basic-profiles .icon .icon-img[data-v-49f965df]{display:block;margin:0 auto;inline-size:100%}@media screen and (max-width:800px){.basic-profiles .icon .icon-img[data-v-49f965df]{inline-size:40%}}.basic-profiles .profile-infos[data-v-49f965df]{flex:3}.basic-profiles .profile-infos .table[data-v-49f965df]{font-size:1.24em;block-size:98%;margin:auto}@media screen and (max-width:800px){.basic-profiles .profile-infos .table[data-v-49f965df]{font-size:3.8vw}}",""]),o.locals={},t.exports=o},446:function(t,e,n){"use strict";n.r(e);n(0);var o=n(11),c=n(372),r=n(419),l=n(429),f=Object(o.c)({name:"basic-profile",components:{LazyLoadImage:c.default,ObjectTable:r.default},setup:function(){return{basicProfileData:l}}}),d=(n(430),n(17)),component=Object(d.a)(f,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("section",[n("div",{staticClass:"basic-profiles"},[n("header",{staticClass:"icon"},[n("lazy-load-image",{staticClass:"icon-img",attrs:{src:"/images/logo/stonriver_1200.webp",alt:"すとんりばーのアイコン"}})],1),t._v(" "),n("div",{staticClass:"profile-infos"},[n("object-table",{staticClass:"table",attrs:{data:t.basicProfileData}})],1)])])}),[],!1,null,"49f965df",null);e.default=component.exports}}]);