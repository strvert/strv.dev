(window.webpackJsonp=window.webpackJsonp||[]).push([[20,6,15,16],{367:function(t,e,r){const{ref:n}=r(0);var content=r(373);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(30).default)("4d7e4355",content,!0,{sourceMap:!1})},369:function(t,e,r){"use strict";r.r(e);r(0);var n=r(13);r(14),r(36),r(32),r(278),r(43),r(26),r(55),r(31),r(27),r(42),r(47);function o(t,e){var r="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!r){if(Array.isArray(t)||(r=function(t,e){if(!t)return;if("string"==typeof t)return c(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);"Object"===r&&t.constructor&&(r=t.constructor.name);if("Map"===r||"Set"===r)return Array.from(t);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return c(t,e)}(t))||e&&t&&"number"==typeof t.length){r&&(t=r);var i=0,n=function(){};return{s:n,n:function(){return i>=t.length?{done:!0}:{done:!1,value:t[i++]}},e:function(t){throw t},f:n}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,l=!0,d=!1;return{s:function(){r=r.call(t)},n:function(){var t=r.next();return l=t.done,t},e:function(t){d=!0,o=t},f:function(){try{l||null==r.return||r.return()}finally{if(d)throw o}}}}function c(t,e){(null==e||e>t.length)&&(e=t.length);for(var i=0,r=new Array(e);i<e;i++)r[i]=t[i];return r}var l=Object(n.b)({props:{tags:{type:Array,default:function(){return new Array}},listStyle:{type:Object,default:function(){return{}}},iconStyle:{type:Object,default:function(){return{}}}},setup:function(){return{makeQuery:function(t){return function(t){var param=new URLSearchParams;if(void 0!==t.tags){var e,r=o(t.tags);try{for(r.s();!(e=r.n()).done;){var n=e.value;param.append("t",n)}}catch(t){r.e(t)}finally{r.f()}}if(void 0!==t.keywords){var c,l=o(t.keywords);try{for(l.s();!(c=l.n()).done;){var d=c.value;param.append("kw",d)}}catch(t){l.e(t)}finally{l.f()}}return void 0!==t.series&&param.append("sr",t.series),param}({tags:[t]})}}}}),d=(r(372),r(17)),component=Object(d.a)(l,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"list-wrapper"},[r("span",{staticClass:"material-icons",style:t.iconStyle},[t._v("local_offer")]),t._v(" "),r("ul",{staticClass:"tag-list",style:t.listStyle},t._l(t.tags,(function(e){return r("li",{key:e},[r("nuxt-link",{attrs:{to:"/blog/search?"+t.makeQuery(e)}},[t._v(t._s(e))])],1)})),0)])}),[],!1,null,"1d82db8e",null);e.default=component.exports},372:function(t,e,r){"use strict";r(0),r(367)},373:function(t,e,r){var n=r(29)((function(i){return i[1]}));n.push([t.i,".list-wrapper[data-v-1d82db8e]{display:flex;gap:.3em;align-items:flex-start}.list-wrapper>.material-icons[data-v-1d82db8e]{color:inherit;font-size:1.3em}.list-wrapper>.tag-list[data-v-1d82db8e]{display:flex;flex-wrap:wrap;list-style:none;margin:0;padding:0;gap:.7em}.list-wrapper>.tag-list li[data-v-1d82db8e]{background-color:var(--strvdev-blogpost-tag);border-radius:4px;padding:0 .2em;font-size:.9em}",""]),n.locals={},t.exports=n},374:function(t,e,r){"use strict";r.d(e,"b",(function(){return c})),r.d(e,"a",(function(){return l}));r(59),r(76),r(31),r(50);var n="articles",o=function(path){for(;path.includes("//");)path=path.replace("//","/");return path},c=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:n;return o("/"+e+"/"+t.replace("--","/"))},l=function(path){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:n;return(path=o(path)).substr(t.length+2).replace("/","--")}},518:function(t,e,r){"use strict";r.d(e,"a",(function(){return o}));var n=r(532),o=function(content){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"Asia/Tokyo",e=n.tz(content.createdAt,t),r=n.tz(content.updatedAt,t);return{createdAt:e,updatedAt:r}}},529:function(t,e,r){const{ref:n}=r(0);var content=r(544);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(30).default)("1e24ad00",content,!0,{sourceMap:!1})},533:function(t,e,r){var map={"./af":381,"./af.js":381,"./ar":382,"./ar-dz":383,"./ar-dz.js":383,"./ar-kw":384,"./ar-kw.js":384,"./ar-ly":385,"./ar-ly.js":385,"./ar-ma":386,"./ar-ma.js":386,"./ar-sa":387,"./ar-sa.js":387,"./ar-tn":388,"./ar-tn.js":388,"./ar.js":382,"./az":389,"./az.js":389,"./be":390,"./be.js":390,"./bg":391,"./bg.js":391,"./bm":392,"./bm.js":392,"./bn":393,"./bn-bd":394,"./bn-bd.js":394,"./bn.js":393,"./bo":395,"./bo.js":395,"./br":396,"./br.js":396,"./bs":397,"./bs.js":397,"./ca":398,"./ca.js":398,"./cs":399,"./cs.js":399,"./cv":400,"./cv.js":400,"./cy":401,"./cy.js":401,"./da":402,"./da.js":402,"./de":403,"./de-at":404,"./de-at.js":404,"./de-ch":405,"./de-ch.js":405,"./de.js":403,"./dv":406,"./dv.js":406,"./el":407,"./el.js":407,"./en-au":408,"./en-au.js":408,"./en-ca":409,"./en-ca.js":409,"./en-gb":410,"./en-gb.js":410,"./en-ie":411,"./en-ie.js":411,"./en-il":412,"./en-il.js":412,"./en-in":413,"./en-in.js":413,"./en-nz":414,"./en-nz.js":414,"./en-sg":415,"./en-sg.js":415,"./eo":416,"./eo.js":416,"./es":417,"./es-do":418,"./es-do.js":418,"./es-mx":419,"./es-mx.js":419,"./es-us":420,"./es-us.js":420,"./es.js":417,"./et":421,"./et.js":421,"./eu":422,"./eu.js":422,"./fa":423,"./fa.js":423,"./fi":424,"./fi.js":424,"./fil":425,"./fil.js":425,"./fo":426,"./fo.js":426,"./fr":427,"./fr-ca":428,"./fr-ca.js":428,"./fr-ch":429,"./fr-ch.js":429,"./fr.js":427,"./fy":430,"./fy.js":430,"./ga":431,"./ga.js":431,"./gd":432,"./gd.js":432,"./gl":433,"./gl.js":433,"./gom-deva":434,"./gom-deva.js":434,"./gom-latn":435,"./gom-latn.js":435,"./gu":436,"./gu.js":436,"./he":437,"./he.js":437,"./hi":438,"./hi.js":438,"./hr":439,"./hr.js":439,"./hu":440,"./hu.js":440,"./hy-am":441,"./hy-am.js":441,"./id":442,"./id.js":442,"./is":443,"./is.js":443,"./it":444,"./it-ch":445,"./it-ch.js":445,"./it.js":444,"./ja":446,"./ja.js":446,"./jv":447,"./jv.js":447,"./ka":448,"./ka.js":448,"./kk":449,"./kk.js":449,"./km":450,"./km.js":450,"./kn":451,"./kn.js":451,"./ko":452,"./ko.js":452,"./ku":453,"./ku.js":453,"./ky":454,"./ky.js":454,"./lb":455,"./lb.js":455,"./lo":456,"./lo.js":456,"./lt":457,"./lt.js":457,"./lv":458,"./lv.js":458,"./me":459,"./me.js":459,"./mi":460,"./mi.js":460,"./mk":461,"./mk.js":461,"./ml":462,"./ml.js":462,"./mn":463,"./mn.js":463,"./mr":464,"./mr.js":464,"./ms":465,"./ms-my":466,"./ms-my.js":466,"./ms.js":465,"./mt":467,"./mt.js":467,"./my":468,"./my.js":468,"./nb":469,"./nb.js":469,"./ne":470,"./ne.js":470,"./nl":471,"./nl-be":472,"./nl-be.js":472,"./nl.js":471,"./nn":473,"./nn.js":473,"./oc-lnc":474,"./oc-lnc.js":474,"./pa-in":475,"./pa-in.js":475,"./pl":476,"./pl.js":476,"./pt":477,"./pt-br":478,"./pt-br.js":478,"./pt.js":477,"./ro":479,"./ro.js":479,"./ru":480,"./ru.js":480,"./sd":481,"./sd.js":481,"./se":482,"./se.js":482,"./si":483,"./si.js":483,"./sk":484,"./sk.js":484,"./sl":485,"./sl.js":485,"./sq":486,"./sq.js":486,"./sr":487,"./sr-cyrl":488,"./sr-cyrl.js":488,"./sr.js":487,"./ss":489,"./ss.js":489,"./sv":490,"./sv.js":490,"./sw":491,"./sw.js":491,"./ta":492,"./ta.js":492,"./te":493,"./te.js":493,"./tet":494,"./tet.js":494,"./tg":495,"./tg.js":495,"./th":496,"./th.js":496,"./tk":497,"./tk.js":497,"./tl-ph":498,"./tl-ph.js":498,"./tlh":499,"./tlh.js":499,"./tr":500,"./tr.js":500,"./tzl":501,"./tzl.js":501,"./tzm":502,"./tzm-latn":503,"./tzm-latn.js":503,"./tzm.js":502,"./ug-cn":504,"./ug-cn.js":504,"./uk":505,"./uk.js":505,"./ur":506,"./ur.js":506,"./uz":507,"./uz-latn":508,"./uz-latn.js":508,"./uz.js":507,"./vi":509,"./vi.js":509,"./x-pseudo":510,"./x-pseudo.js":510,"./yo":511,"./yo.js":511,"./zh-cn":512,"./zh-cn.js":512,"./zh-hk":513,"./zh-hk.js":513,"./zh-mo":514,"./zh-mo.js":514,"./zh-tw":515,"./zh-tw.js":515};function n(t){var e=o(t);return r(e)}function o(t){if(!r.o(map,t)){var e=new Error("Cannot find module '"+t+"'");throw e.code="MODULE_NOT_FOUND",e}return map[t]}n.keys=function(){return Object.keys(map)},n.resolve=o,t.exports=n,n.id=533},543:function(t,e,r){"use strict";r(0),r(529)},544:function(t,e,r){var n=r(29)((function(i){return i[1]}));n.push([t.i,".wrapper[data-v-08b63208]{display:grid;grid-auto-flow:column;justify-content:space-between;gap:.5rem;grid-template-columns:minmax(-webkit-max-content,auto) auto minmax(-webkit-max-content,auto);grid-template-columns:minmax(max-content,auto) auto minmax(max-content,auto);align-items:center}.wrapper .prev[data-v-08b63208]{justify-self:flex-start}.wrapper .seriesname[data-v-08b63208]{text-align:center}.wrapper .next[data-v-08b63208]{-webkit-margin-start:auto;margin-inline-start:auto;text-align:right}.button[data-v-08b63208]{display:block}",""]),n.locals={},t.exports=n},552:function(t,e,r){const{ref:n}=r(0);var content=r(569);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(30).default)("df619af6",content,!0,{sourceMap:!1})},555:function(t,e,r){"use strict";r.r(e);r(0);var n=r(16),o=r(206),c=Object(n.c)({components:{Giscus:o.default}}),l=r(17),component=Object(l.a)(c,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("article",[t._t("default")],2),t._v(" "),r("article",{staticClass:"giscus-wrapper"},[r("giscus")],1)])}),[],!1,null,"1dd36154",null);e.default=component.exports},556:function(t,e,r){"use strict";r.r(e);r(0);var n=r(15),o=(r(67),r(16)),c=r(13),l=r(374),d=Object(o.b)({props:{path:{type:String,required:!0},useSeries:{type:Boolean,default:!1},series:{type:String}},setup:function(t){var e=Object(o.k)().$content,r=function(){var r=Object(n.a)(regeneratorRuntime.mark((function r(){var n,o,content;return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(n=e("articles",{deep:!0}),!t.useSeries||void 0!==t.series){r.next=3;break}return r.abrupt("return",[null,null]);case 3:return o=t.useSeries?n.where({series:{$eq:t.series}}):n,content=o.sortBy("seriesIndex","asc").only(["title","path"]).surround(t.path),r.next=7,content.fetch();case 7:return r.abrupt("return",r.sent);case 8:case"end":return r.stop()}}),r)})));return function(){return r.apply(this,arguments)}}(),d=Object(o.a)((function(){return t.series})),f=Object(o.h)(""),j=Object(o.h)(""),v=Object(o.h)(!1),m=Object(o.h)(!1),h=Object(o.h)(""),y=Object(o.h)(""),w=Object(o.h)(""),k=function(){var t=Object(n.a)(regeneratorRuntime.mark((function t(){var e;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,r();case 2:e=t.sent,v.value=null!==e[0],m.value=null!==e[1],v.value&&(f.value=e[0].title,h.value="/blog/"+Object(l.a)(e[0].path)),m.value&&(j.value=e[1].title,y.value="/blog/"+Object(l.a)(e[1].path));case 7:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}();return Object(c.h)(k),Object(o.n)((function(){return t.series}),Object(n.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,k();case 2:case"end":return t.stop()}}),t)})))),{prevTitle:f,nextTitle:j,existPrev:v,existNext:m,prevSlug:h,nextSlug:y,seriesTitle:d,seriesPage:w}}}),f=d,j=(r(543),r(17)),component=Object(j.a)(f,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("section",{staticClass:"wrapper"},[r("div",{staticClass:"prev button"},[t.existPrev?r("nuxt-link",{attrs:{title:t.prevTitle,to:t.prevSlug}},[t._v("＜＜ PREV")]):t._e()],1),t._v(" "),r("div",{staticClass:"seriesname button"},[t.useSeries?r("nuxt-link",{attrs:{title:t.seriesTitle,to:"/blog/series/"+t.seriesTitle}},[t._v("\n      "+t._s(t.seriesTitle)+"\n    ")]):t._e()],1),t._v(" "),r("div",{staticClass:"next button"},[t.existNext?r("nuxt-link",{attrs:{title:t.nextTitle,to:t.nextSlug}},[t._v("NEXT ＞＞")]):t._e()],1)])}),[],!1,null,"08b63208",null);e.default=component.exports},568:function(t,e,r){"use strict";r(0),r(552)},569:function(t,e,r){var n=r(29)((function(i){return i[1]}));n.push([t.i,".blogpost>header[data-v-04d7965e]{-webkit-margin-after:1.26em;margin-block-end:1.26em}.blogpost>header>.post-title[data-v-04d7965e]{font-size:2rem;-webkit-margin-after:.56em;margin-block-end:.56em}.blogpost>header>.post-info-wrapper[data-v-04d7965e]{display:flex;justify-content:space-between;align-items:center}.blogpost>header>.post-info-wrapper>.publish-time[data-v-04d7965e]{font-size:.95rem;color:rgba(0,0,0,.5333333333333333);margin:0}.surround-menu[data-v-04d7965e]{display:block;-webkit-margin-before:4rem;margin-block-start:4rem}",""]),n.locals={},t.exports=n},581:function(t,e,r){"use strict";r.r(e);r(0),r(14),r(75);var n=r(16),o=r(555),c=r(556),l=r(369),d=r(518),f=r(15),j=(r(67),r(13)),v=r(374),m=(r(27),r(42),r(51),Object(n.b)({components:{BlogpostFrame:o.default,SurroundArticleMenu:c.default,TagList:l.default},setup:function(){var t=function(t){var e=Object(n.h)(),r=Object(n.h)([]),o=Object(n.h)(),c=Object(n.k)().$content,path=Object(n.h)(Object(v.b)(t)),l=function(){var t=Object(f.a)(regeneratorRuntime.mark((function t(){var p;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,c(path.value).fetch();case 2:if(p=t.sent,!Array.isArray(p)){t.next=5;break}return t.abrupt("return",p[0]);case 5:return t.abrupt("return",p);case 6:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),d=function(t){void 0!==t.tags?r.value=t.tags:r.value=[]};return Object(j.h)(Object(f.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,l();case 2:e.value=t.sent,o.value=e.value.series,d(e.value);case 5:case"end":return t.stop()}}),t)})))),Object(n.f)(Object(f.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:window.$nuxt.$on("content:update",Object(f.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,l();case 2:e.value=t.sent,o.value=e.value.series,d(e.value);case 5:case"end":return t.stop()}}),t)}))));case 1:case"end":return t.stop()}}),t)})))),Object(n.e)(Object(f.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:window.$nuxt.$off("content:update");case 1:case"end":return t.stop()}}),t)})))),{page:e,path:path,series:o,tags:r}}(Object(n.l)().params.blogpost),e=t.page,path=t.path,r=t.series,o=t.tags,c=Object(n.h)(),l=Object(n.h)(),m=Object(n.h)(),h=function(t,e){c.value=t.format("YYYY.MM.DD"),l.value=t.format(),m.value=e},y={makeBlogpostMeta:function(article){var title=Object(n.h)(""),meta=Object(n.h)([]);return Object(n.n)(article,(function(t){void 0!==t&&(title.value=t.title,meta.value=[{hid:"description",name:"description",content:t.description},{hid:"og:description",property:"og:description",content:t.description},{hid:"og:url",property:"og:url",content:"".concat("https://strv.dev","/").concat("blog","/").concat(Object(v.a)(t.path))},{hid:"og:title",property:"og:title",content:"".concat(t.title," - ").concat("strv.dev")},{hid:"og:image",property:"og:image",content:"".concat("https://strv.dev/images/ogp","/generated/").concat(Object(v.a)(t.path),".png")}])})),{title:title,meta:meta}}},w=(0,y.makeBlogpostMeta)(e),title=w.title,meta=w.meta;return Object(n.j)({title:title,meta:meta}),Object(n.n)(e,(function(t){if(void 0!==t){var e=Object(d.a)(t),r=e.createdAt,n=e.updatedAt;r.toString()===n.toString()?h(r,"公開"):h(n,"更新")}})),{page:e,displayDateString:c,dateString:l,publishStatus:m,path:path,series:r,tags:o}}})),h=m,y=(r(568),r(17)),component=Object(y.a)(h,(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",[r("blogpost-frame",[r("div",{staticClass:"blogpost"},[r("header",[r("h1",{staticClass:"post-title"},[t._v(t._s(void 0===t.page?"":t.page.title))]),t._v(" "),r("div",{staticClass:"post-info-wrapper"},[r("div",{staticClass:"tag-list"},[r("tag-list",{attrs:{tags:t.tags}})],1),t._v(" "),r("p",{staticClass:"publish-time"},[r("time",{attrs:{datetime:t.dateString}},[t._v(t._s(t.displayDateString))]),t._v("に"+t._s(t.publishStatus)+"\n          ")])])]),t._v(" "),r("nuxt-content",{attrs:{document:t.page}})],1),t._v(" "),r("div",{staticClass:"surround-menu"},[r("surround-article-menu",{attrs:{path:t.path,useSeries:!0,series:t.series}})],1)])],1)}),[],!1,null,"04d7965e",null);e.default=component.exports}}]);