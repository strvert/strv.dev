(window.webpackJsonp=window.webpackJsonp||[]).push([[30,15,26],{419:function(t,e,o){var content=o(422);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,o(22).default)("71895cde",content,!0,{sourceMap:!1})},420:function(t,e,o){"use strict";o.r(e);o(104);var r=o(4),n=Object(r.c)({props:{src:{type:String,default:""},alt:{type:String,default:""},duration:{type:Number,default:.2}},setup:function(t){var e=Object(r.h)(!1);return Object(r.f)((function(){document.querySelector("img").style.setProperty("--duration","".concat(t.duration,"s"))})),{loadFinished:function(){e.value=!0},loaded:e}}}),l=(o(421),o(12)),component=Object(l.a)(n,(function(){var t=this,e=t.$createElement;return(t._self._c||e)("img",{class:{loaded:t.loaded,unloaded:!t.loaded},attrs:{src:t.src,alt:t.alt},on:{load:t.loadFinished}})}),[],!1,null,"467eb550",null);e.default=component.exports},421:function(t,e,o){"use strict";o(419)},422:function(t,e,o){var r=o(21)((function(i){return i[1]}));r.push([t.i,"img[data-v-467eb550]{transition-property:opacity;transition-duration:var(--duration)}.unloaded[data-v-467eb550]{opacity:0}.loaded[data-v-467eb550]{opacity:1}",""]),r.locals={},t.exports=r},438:function(t,e,o){var content=o(457);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,o(22).default)("481b6618",content,!0,{sourceMap:!1})},456:function(t,e,o){"use strict";o(438)},457:function(t,e,o){var r=o(21)((function(i){return i[1]}));r.push([t.i,'.largelogo[data-v-3a486faa]{--blur:8px;--anim-duration:2s;transition-duration:.5s;transition-property:width inline-size font-size opacity;position:relative;display:grid;grid-template-areas:"one"}@-webkit-keyframes top-text-in-data-v-3a486faa{0%{filter:blur(var(--blur)) grayscale(20%)}50%{filter:blur(var(--blur)) grayscale(20%)}to{filter:blur(0) grayscale(0)}}@keyframes top-text-in-data-v-3a486faa{0%{filter:blur(var(--blur)) grayscale(20%)}50%{filter:blur(var(--blur)) grayscale(20%)}to{filter:blur(0) grayscale(0)}}@-webkit-keyframes logo-in-1-data-v-3a486faa{0%{filter:blur(0) grayscale(0);transform:none}50%{filter:blur(0) grayscale(0);transform:none}to{filter:blur(var(--blur)) grayscale(20%);transform:rotate(1turn)}}@keyframes logo-in-1-data-v-3a486faa{0%{filter:blur(0) grayscale(0);transform:none}50%{filter:blur(0) grayscale(0);transform:none}to{filter:blur(var(--blur)) grayscale(20%);transform:rotate(1turn)}}.largelogo img[data-v-3a486faa]{width:100%;margin:auto 0;-webkit-animation-name:logo-in-1-data-v-3a486faa;animation-name:logo-in-1-data-v-3a486faa;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards;z-index:0}.largelogo header[data-v-3a486faa],.largelogo img[data-v-3a486faa]{grid-area:one;display:block;-webkit-animation-duration:var(--anim-duration);animation-duration:var(--anim-duration)}.largelogo header[data-v-3a486faa]{--center-block-size:65%;width:var(--center-block-size);margin:auto;position:relative;top:0;left:0;transition:inherit;-webkit-animation-name:top-text-in-data-v-3a486faa;animation-name:top-text-in-data-v-3a486faa;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.largelogo header h1[data-v-3a486faa]{top:-20px;font-weight:600}.largelogo header h1[data-v-3a486faa],.largelogo header p[data-v-3a486faa]{width:100%;position:relative;margin:0;left:0;text-align:center}.largelogo header p[data-v-3a486faa]{top:-30px;font-weight:500}.largelogo header.unmounted[data-v-3a486faa]{opacity:0}@media screen and (min-width:800px){.largelogo header p[data-v-3a486faa]{font-size:3rem}}@media screen and (max-width:800px){.largelogo header p[data-v-3a486faa]{font-size:6.5vw}}',""]),r.locals={},t.exports=r},468:function(t,e,o){"use strict";o.r(e);var r=o(4),n=o(196),l=o(420),c=Object(r.c)({components:{StrvDevLogo:n.default,LazyLoadImage:l.default},setup:function(){var t=Object(r.h)("Welcome to"),e=Object(r.h)(75),o=function(){var t=document.querySelector(".largelogo");t.style.setProperty("--blur","".concat(.01*t.clientWidth,"px")),e.value=.1*t.clientWidth},n=Object(r.h)(!1);return Object(r.f)((function(){window.addEventListener("resize",o),o(),n.value=!0,document.querySelector(".large-icon").style.setProperty("animation-name","")})),Object(r.e)((function(){window.removeEventListener("resize",o)})),{message:t,logoScale:e,mounted:n}}}),d=(o(456),o(12)),component=Object(d.a)(c,(function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("section",{staticClass:"largelogo"},[o("lazy-load-image",{staticClass:"large-icon",attrs:{duration:3,alt:"大きなすとんりばーのアイコン",src:"/images/logo/stonriver_640.webp"}}),t._v(" "),o("header",{class:{unmounted:!t.mounted}},[o("p",[t._v(t._s(t.message))]),t._v(" "),o("h1",[o("strv-dev-logo",{attrs:{logoScale:t.logoScale}})],1)])],1)}),[],!1,null,"3a486faa",null);e.default=component.exports},474:function(t,e,o){"use strict";o.d(e,"b",(function(){return l})),o.d(e,"a",(function(){return c}));o(52),o(26),o(43);var r=o(4),n=o(425),l=function(){var title=Object(r.h)(""),meta=Object(r.h)([]);Object(r.j)({title:title,meta:meta});var t=function(article,t){if(void 0!==article){var e=""!==t?"".concat("https://strv.dev/images/ogp","/").concat(t):"".concat("https://strv.dev/images/ogp","/generated/").concat(Object(n.a)(article.path),".png");meta.value=[{hid:"description",name:"description",content:article.description},{hid:"og:description",property:"og:description",content:article.description},{hid:"og:url",property:"og:url",content:"".concat("https://strv.dev","/").concat("blog","/").concat(Object(n.a)(article.path))},{hid:"og:title",property:"og:title",content:"".concat(article.title," - ").concat("strv.dev")},{hid:"og:image",property:"og:image",content:e}],title.value=article.title}};return{setBlogpostMeta:function(article){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";Object(r.n)(article,(function(article){return t(article,e)})),t(article.value,e)}}},c=function(article){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";return{get title(){return void 0===article?"":article.title},get meta(){if(void 0!==article){var e=""!==t?"".concat("https://strv.dev/images/ogp","/").concat(t):"".concat("https://strv.dev/images/ogp","/generated/").concat(Object(n.a)(article.path),".png");return[{hid:"description",name:"description",content:article.description},{hid:"og:description",property:"og:description",content:article.description},{hid:"og:url",property:"og:url",content:"".concat("https://strv.dev","/").concat("blog","/").concat(Object(n.a)(article.path))},{hid:"og:title",property:"og:title",content:"".concat(article.title," - ").concat("strv.dev")},{hid:"og:image",property:"og:image",content:e}]}}}}},534:function(t,e,o){"use strict";o.r(e);var r=o(17),n=(o(67),o(4)),l=o(23),c=o(474),d=o(498),f=o(468),v=Object(n.c)({name:"about",components:{TopLargeLogo:f.default,BlogpostFrame:d.default},setup:function(){var t=Object(n.k)().$content,e=Object(n.h)(void 0),o=Object(c.b)().setBlogpostMeta;return Object(l.g)(Object(r.a)(regeneratorRuntime.mark((function r(){return regeneratorRuntime.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:return r.next=2,t("about").fetch();case 2:e.value=r.sent,o(e,"main.png");case 4:case"end":return r.stop()}}),r)})))),{page:e}}}),m=o(12),component=Object(m.a)(v,(function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("div",[void 0!==t.page?o("blogpost-frame",{attrs:{page:t.page,showComment:!1}},[o("nuxt-content",{attrs:{document:t.page}})],1):t._e()],1)}),[],!1,null,null,null);e.default=component.exports}}]);