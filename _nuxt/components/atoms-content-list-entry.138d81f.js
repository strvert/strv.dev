(window.webpackJsonp=window.webpackJsonp||[]).push([[9,12,13,16],{367:function(t,e,r){const{ref:n}=r(0);var content=r(375);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(30).default)("f694ebf6",content,!0,{sourceMap:!1})},370:function(t,e,r){const{ref:n}=r(0);var content=r(381);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(30).default)("9367ff5e",content,!0,{sourceMap:!1})},371:function(t,e,r){const{ref:n}=r(0);var content=r(383);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(30).default)("bbe03d18",content,!0,{sourceMap:!1})},372:function(t,e,r){"use strict";r.r(e);r(0);var n=r(16);r(14),r(36),r(32),r(278),r(43),r(26),r(55),r(31),r(27),r(42),r(47);function o(t,e){var r="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!r){if(Array.isArray(t)||(r=function(t,e){if(!t)return;if("string"==typeof t)return c(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);"Object"===r&&t.constructor&&(r=t.constructor.name);if("Map"===r||"Set"===r)return Array.from(t);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return c(t,e)}(t))||e&&t&&"number"==typeof t.length){r&&(t=r);var i=0,n=function(){};return{s:n,n:function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,l=!0,d=!1;return{s:function(){r=r.call(t)},n:function(){var t=r.next();return l=t.done,t},e:function(t){d=!0,o=t},f:function(){try{l||null==r.return||r.return()}finally{if(d)throw o}}}}function c(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,r=new Array(e);i<e;i++)r[i]=t[i];return r}var l=Object(n.b)({props:{tags:{type:Array,default:function(){return new Array}},listStyle:{type:Object,default:function(){return{}}},iconStyle:{type:Object,default:function(){return{}}}},setup:function(){return{makeQuery:function(t){return function(t){var param=new URLSearchParams;if(void 0!==t.tags){var e,r=o(t.tags);try{for(r.s();!(e=r.n()).done;){var n=e.value;param.append("t",n)}}catch(t){r.e(t)}finally{r.f()}}if(void 0!==t.keywords){var c,l=o(t.keywords);try{for(l.s();!(c=l.n()).done;){var d=c.value;param.append("kw",d)}}catch(t){l.e(t)}finally{l.f()}}return void 0!==t.series&&param.append("sr",t.series),param}({tags:[t]})}}}}),d=(r(374),r(17)),component=Object(d.a)(l,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return 0!==t.tags.length?r("div",{staticClass:"list-wrapper"},[r("span",{staticClass:"material-icons",style:t.iconStyle},[t._v("local_offer")]),t._v(" "),r("ul",{staticClass:"tag-list",style:t.listStyle},t._l(t.tags,(function(e){return r("li",{key:e},[r("nuxt-link",{attrs:{to:"/blog/search?"+t.makeQuery(e)}},[t._v(t._s(e))])],1)})),0)]):t._e()}),[],!1,null,"7e21c619",null);e.default=component.exports},373:function(t,e,r){"use strict";r.r(e);r(0),r(14),r(75);var n=r(11),o=Object(n.c)({props:{published:{type:Object,required:!0},updated:{type:Object,required:!0},iconStyle:{type:Object,default:{}}},setup:function(t){var e=Object(n.h)(t.published.toString()!==t.updated.toString());return{pub:Object(n.a)((function(){return t.published.format("YYYY.MM.DD")})),up:Object(n.a)((function(){if(void 0!==t.updated)return t.updated.format("YYYY.MM.DD")})),isUpdated:e}}}),c=(r(380),r(17)),component=Object(c.a)(o,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"wrapper"},[t.isUpdated?r("div",{staticClass:"updated-time time"},[r("span",{staticClass:"material-icons",style:t.iconStyle},[t._v(" update ")]),t._v(" "),r("time",[t._v(t._s(t.up))])]):r("div",{staticClass:"published-time time"},[r("span",{staticClass:"material-icons",style:t.iconStyle},[t._v(" event ")]),t._v(" "),r("time",[t._v(t._s(t.pub))])])])}),[],!1,null,"00c747fc",null);e.default=component.exports},374:function(t,e,r){"use strict";r(0),r(367)},375:function(t,e,r){var n=r(29)((function(i){return i[1]}));n.push([t.i,".list-wrapper[data-v-7e21c619]{display:flex;gap:.3em;align-items:flex-start}.list-wrapper>.material-icons[data-v-7e21c619]{color:inherit;font-size:1.3em}.list-wrapper>.tag-list[data-v-7e21c619]{display:flex;flex-wrap:wrap;list-style:none;margin:0;padding:0;gap:.7em}.list-wrapper>.tag-list li[data-v-7e21c619]{background-color:var(--strvdev-blogpost-tag);border-radius:4px;padding:0 .2em;font-size:.9em}",""]),n.locals={},t.exports=n},378:function(t,e,r){const{ref:n}=r(0);var content=r(524);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(30).default)("0634d1df",content,!0,{sourceMap:!1})},380:function(t,e,r){"use strict";r(0),r(370)},381:function(t,e,r){var n=r(29)((function(i){return i[1]}));n.push([t.i,".wrapper[data-v-00c747fc]{display:flex;gap:1em}.wrapper .time[data-v-00c747fc]{display:flex;justify-content:center;justify-items:center;align-content:center;align-items:center;opacity:.7}",""]),n.locals={},t.exports=n},382:function(t,e,r){"use strict";r(0),r(371)},383:function(t,e,r){var n=r(29)((function(i){return i[1]}));n.push([t.i,"img[data-v-9538b6ce]{transition-property:opacity;transition-duration:.2s}.unloaded[data-v-9538b6ce]{opacity:0}.loaded[data-v-9538b6ce]{opacity:1}",""]),n.locals={},t.exports=n},521:function(t,e,r){"use strict";r.r(e);r(0);var n=r(11),o=Object(n.c)({props:{src:{type:String,default:""}},setup:function(){var t=Object(n.h)(!1);return{loadFinished:function(){t.value=!0},loaded:t}}}),c=(r(382),r(17)),component=Object(c.a)(o,(function(){var t=this,e=t.$createElement;return(t._self._c||e)("img",{class:{loaded:t.loaded,unloaded:!t.loaded},attrs:{src:t.src},on:{load:t.loadFinished}})}),[],!1,null,"9538b6ce",null);e.default=component.exports},523:function(t,e,r){"use strict";r(0),r(378)},524:function(t,e,r){var n=r(29)((function(i){return i[1]}));n.push([t.i,"article[data-v-615cd10f]{display:flex;gap:1rem;min-block-size:6rem}@media screen and (max-width:500px){article[data-v-615cd10f]{min-block-size:5rem}article .taglist[data-v-615cd10f]{display:none}}article header[data-v-615cd10f]{display:flex;flex-direction:column;gap:.2rem}article header a[data-v-615cd10f]{color:inherit}article header h1[data-v-615cd10f]{font-size:1.3rem;font-weight:600;margin:0}@media screen and (max-width:500px){article header h1[data-v-615cd10f]{font-size:1.05em}}article .tagicon-wrapper[data-v-615cd10f]{block-size:2.9rem;inline-size:2.9rem;border-radius:10px;background-color:var(--strvdev-blogpost-code);padding:5px}article .tagicon-wrapper .tagicon[data-v-615cd10f]{border-radius:10px;block-size:100%}",""]),n.locals={},t.exports=n},525:function(t,e,r){"use strict";r.r(e);r(0);var n=r(16),o=r(372),c=r(373),l=r(521),d=Object(n.b)({components:{TagList:o.default,PublishTime:c.default,LazyLoadImage:l.default},props:{title:{type:String,required:!0},iconPath:{type:String,required:!0},uri:{type:String,required:!0}}}),f=(r(523),r(17)),component=Object(f.a)(d,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("article",[r("div",[r("nuxt-link",{attrs:{to:t.uri}},[r("div",{staticClass:"tagicon-wrapper"},[r("lazy-load-image",{staticClass:"tagicon",attrs:{src:t.iconPath}})],1)])],1),t._v(" "),r("header",[r("nuxt-link",{attrs:{to:t.uri}},[r("h1",[t._v(t._s(t.title))])]),t._v(" "),t._t("default")],2)])}),[],!1,null,"615cd10f",null);e.default=component.exports}}]);