(window.webpackJsonp=window.webpackJsonp||[]).push([[8,11,15],{365:function(t,e,r){const{ref:n}=r(0);var content=r(371);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(35).default)("4d7e4355",content,!0,{sourceMap:!1})},366:function(t,e,r){const{ref:n}=r(0);var content=r(374);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(35).default)("33a5ecda",content,!0,{sourceMap:!1})},367:function(t,e,r){"use strict";r.r(e);r(0);var n=r(10);r(14),r(36),r(30),r(278),r(43),r(26),r(55),r(29),r(27),r(42),r(47);function l(t,e){var r="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!r){if(Array.isArray(t)||(r=function(t,e){if(!t)return;if("string"==typeof t)return o(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);"Object"===r&&t.constructor&&(r=t.constructor.name);if("Map"===r||"Set"===r)return Array.from(t);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return o(t,e)}(t))||e&&t&&"number"==typeof t.length){r&&(t=r);var i=0,n=function(){};return{s:n,n:function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var l,c=!0,d=!1;return{s:function(){r=r.call(t)},n:function(){var t=r.next();return c=t.done,t},e:function(t){d=!0,l=t},f:function(){try{c||null==r.return||r.return()}finally{if(d)throw l}}}}function o(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,r=new Array(e);i<e;i++)r[i]=t[i];return r}var c=Object(n.b)({props:{tags:{type:Array,default:function(){return new Array}},listStyle:{type:Object,default:function(){return{}}},iconStyle:{type:Object,default:function(){return{}}}},setup:function(){return{makeQuery:function(t){return function(t){var param=new URLSearchParams;if(void 0!==t.tags){var e,r=l(t.tags);try{for(r.s();!(e=r.n()).done;){var n=e.value;param.append("t",n)}}catch(t){r.e(t)}finally{r.f()}}if(void 0!==t.keywords){var o,c=l(t.keywords);try{for(c.s();!(o=c.n()).done;){var d=o.value;param.append("kw",d)}}catch(t){c.e(t)}finally{c.f()}}return void 0!==t.series&&param.append("sr",t.series),param}({tags:[t]})}}}}),d=(r(370),r(16)),component=Object(d.a)(c,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"list-wrapper"},[r("span",{staticClass:"material-icons",style:t.iconStyle},[t._v("local_offer")]),t._v(" "),r("ul",{staticClass:"tag-list",style:t.listStyle},t._l(t.tags,(function(e){return r("li",{key:e},[r("nuxt-link",{attrs:{to:"/blog/search?"+t.makeQuery(e)}},[t._v(t._s(e))])],1)})),0)])}),[],!1,null,"1d82db8e",null);e.default=component.exports},368:function(t,e,r){"use strict";r.r(e);r(0),r(14),r(75);var n=r(22),l=Object(n.b)({props:{published:{type:Object,required:!0},updated:{type:Object,required:!0},iconStyle:{type:Object,default:{}}},setup:function(t){var e=Object(n.h)(t.published.toString()===t.updated.toString());return{pub:Object(n.a)((function(){return t.published.format("YYYY.MM.DD")})),up:Object(n.a)((function(){if(void 0!==t.updated)return t.updated.format("YYYY.MM.DD")})),isUpdated:e}}}),o=(r(373),r(16)),component=Object(o.a)(l,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"wrapper"},[t.isUpdated?r("div",{staticClass:"updated-time time"},[r("span",{staticClass:"material-icons",style:t.iconStyle},[t._v(" update ")]),t._v(" "),r("time",[t._v(t._s(t.up))])]):r("div",{staticClass:"published-time time"},[r("span",{staticClass:"material-icons",style:t.iconStyle},[t._v(" event ")]),t._v(" "),r("time",[t._v(t._s(t.pub))])])])}),[],!1,null,"4876a9ac",null);e.default=component.exports},369:function(t,e,r){const{ref:n}=r(0);var content=r(376);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(35).default)("0eb4a9ab",content,!0,{sourceMap:!1})},370:function(t,e,r){"use strict";r(0),r(365)},371:function(t,e,r){var n=r(34)((function(i){return i[1]}));n.push([t.i,".list-wrapper[data-v-1d82db8e]{display:flex;gap:.3em;align-items:flex-start}.list-wrapper>.material-icons[data-v-1d82db8e]{color:inherit;font-size:1.3em}.list-wrapper>.tag-list[data-v-1d82db8e]{display:flex;flex-wrap:wrap;list-style:none;margin:0;padding:0;gap:.7em}.list-wrapper>.tag-list li[data-v-1d82db8e]{background-color:var(--strvdev-blogpost-tag);border-radius:4px;padding:0 .2em;font-size:.9em}",""]),n.locals={},t.exports=n},373:function(t,e,r){"use strict";r(0),r(366)},374:function(t,e,r){var n=r(34)((function(i){return i[1]}));n.push([t.i,".wrapper[data-v-4876a9ac]{display:flex;gap:1em}.wrapper .time[data-v-4876a9ac]{display:flex;justify-content:center;justify-items:center;align-content:center;align-items:center;opacity:.7}",""]),n.locals={},t.exports=n},375:function(t,e,r){"use strict";r(0),r(369)},376:function(t,e,r){var n=r(34)((function(i){return i[1]}));n.push([t.i,"article[data-v-6fb3ba22]{display:flex;gap:1rem;min-block-size:6rem}@media screen and (max-width:500px){article[data-v-6fb3ba22]{min-block-size:5rem}article .taglist[data-v-6fb3ba22]{display:none}}article header[data-v-6fb3ba22]{display:flex;flex-direction:column;gap:.2rem}article header a[data-v-6fb3ba22]{color:inherit}article header h1[data-v-6fb3ba22]{font-size:1.3rem;margin:0}@media screen and (max-width:500px){article header h1[data-v-6fb3ba22]{font-size:1.05em}}article .tagicon[data-v-6fb3ba22]{background-color:var(--strvdev-blogpost-code);border-radius:10px;block-size:2.9rem;padding:5px}",""]),n.locals={},t.exports=n},377:function(t,e,r){"use strict";r.r(e);r(0);var n=r(10),l=r(367),o=r(368),c=Object(n.b)({components:{TagList:l.default,PublishTime:o.default},props:{title:{type:String,required:!0},iconPath:{type:String,required:!0},uri:{type:String,required:!0}}}),d=(r(375),r(16)),component=Object(d.a)(c,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("article",[r("div",[r("nuxt-link",{attrs:{to:t.uri}},[r("img",{staticClass:"tagicon",attrs:{src:t.iconPath}})])],1),t._v(" "),r("header",[r("nuxt-link",{attrs:{to:t.uri}},[r("h1",[t._v(t._s(t.title))])]),t._v(" "),t._t("default")],2)])}),[],!1,null,"6fb3ba22",null);e.default=component.exports}}]);