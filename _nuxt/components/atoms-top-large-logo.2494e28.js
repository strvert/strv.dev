(window.webpackJsonp=window.webpackJsonp||[]).push([[17,12],{371:function(t,e,o){const{ref:r}=o(0);var content=o(379);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,o(30).default)("3fadfefb",content,!0,{sourceMap:!1})},378:function(t,e,o){"use strict";o(0),o(371)},379:function(t,e,o){var r=o(29)((function(i){return i[1]}));r.push([t.i,"img[data-v-467eb550]{transition-property:opacity;transition-duration:var(--duration)}.unloaded[data-v-467eb550]{opacity:0}.loaded[data-v-467eb550]{opacity:1}",""]),r.locals={},t.exports=r},381:function(t,e,o){"use strict";o.r(e);o(0),o(104);var r=o(11),n=Object(r.c)({props:{src:{type:String,default:""},alt:{type:String,default:""},duration:{type:Number,default:.2}},setup:function(t){var e=Object(r.h)(!1);return Object(r.f)((function(){document.querySelector("img").style.setProperty("--duration","".concat(t.duration,"s"))})),{loadFinished:function(){e.value=!0},loaded:e}}}),l=(o(378),o(17)),component=Object(l.a)(n,(function(){var t=this,e=t.$createElement;return(t._self._c||e)("img",{class:{loaded:t.loaded,unloaded:!t.loaded},attrs:{src:t.src,alt:t.alt},on:{load:t.loadFinished}})}),[],!1,null,"467eb550",null);e.default=component.exports},406:function(t,e,o){const{ref:r}=o(0);var content=o(418);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,o(30).default)("c3df9800",content,!0,{sourceMap:!1})},417:function(t,e,o){"use strict";o(0),o(406)},418:function(t,e,o){var r=o(29)((function(i){return i[1]}));r.push([t.i,'@media screen and (min-width:800px){.top[data-v-57c43601]{--logo-size:100%}}@media screen and (max-width:800px){.top[data-v-57c43601]{--logo-size:90%}}.top .logo[data-v-57c43601]{--blur:8px;--anim-duration:1s;transition-duration:.5s;transition-property:width inline-size font-size opacity;padding-bottom:80px;margin:0 auto;position:relative;display:grid;grid-template-areas:"one";width:var(--logo-size);height:98vh}@-webkit-keyframes top-text-in-data-v-57c43601{0%{filter:blur(var(--blur)) grayscale(20%)}50%{filter:blur(var(--blur)) grayscale(20%)}to{filter:blur(0) grayscale(0)}}@keyframes top-text-in-data-v-57c43601{0%{filter:blur(var(--blur)) grayscale(20%)}50%{filter:blur(var(--blur)) grayscale(20%)}to{filter:blur(0) grayscale(0)}}@-webkit-keyframes logo-in-data-v-57c43601{0%{filter:blur(0) grayscale(0)}50%{filter:blur(0) grayscale(0)}to{filter:blur(var(--blur)) grayscale(20%)}}@keyframes logo-in-data-v-57c43601{0%{filter:blur(0) grayscale(0)}50%{filter:blur(0) grayscale(0)}to{filter:blur(var(--blur)) grayscale(20%)}}.top .logo img[data-v-57c43601]{width:100%;margin:auto 0;-webkit-animation-name:logo-in-data-v-57c43601;animation-name:logo-in-data-v-57c43601;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards;z-index:0}.top .logo header[data-v-57c43601],.top .logo img[data-v-57c43601]{grid-area:one;display:block;-webkit-animation-duration:var(--anim-duration);animation-duration:var(--anim-duration)}.top .logo header[data-v-57c43601]{--center-block-size:65%;width:var(--center-block-size);margin:auto;position:relative;top:0;left:0;transition:inherit;-webkit-animation-name:top-text-in-data-v-57c43601;animation-name:top-text-in-data-v-57c43601;-webkit-animation-fill-mode:forwards;animation-fill-mode:forwards}.top .logo header h1[data-v-57c43601]{top:-20px;font-weight:600}.top .logo header h1[data-v-57c43601],.top .logo header p[data-v-57c43601]{width:100%;position:relative;margin:0;left:0;text-align:center}.top .logo header p[data-v-57c43601]{top:-30px;font-weight:500}.top .logo header.unmounted[data-v-57c43601]{opacity:0}@media screen and (min-width:800px){.top .logo header p[data-v-57c43601]{font-size:3rem}}@media screen and (max-width:800px){.top .logo header p[data-v-57c43601]{font-size:6.5vw}}',""]),r.locals={},t.exports=r},428:function(t,e,o){"use strict";o.r(e);o(0);var r=o(11),n=o(209),l=o(381),d=Object(r.c)({components:{StrvDevLogo:n.default,LazyLoadImage:l.default},setup:function(){var t=Object(r.h)("Welcome to"),e=Object(r.h)(75),o=function(){var t=document.querySelector(".logo");t.style.setProperty("--blur","".concat(.01*t.clientWidth,"px")),e.value=.1*t.clientWidth},n=Object(r.h)(!1);return Object(r.f)((function(){window.addEventListener("resize",o),o(),n.value=!0})),Object(r.e)((function(){window.removeEventListener("resize",o)})),{message:t,logoScale:e,mounted:n}}}),c=(o(417),o(17)),component=Object(c.a)(d,(function(){var t=this,e=t.$createElement,o=t._self._c||e;return o("section",{staticClass:"top"},[o("div",{staticClass:"logo"},[o("lazy-load-image",{attrs:{duration:.3,alt:"大きなすとんりばーのアイコン",src:"/images/logo/stonriver_1200.webp"}}),t._v(" "),o("header",{class:{unmounted:!t.mounted}},[o("p",[t._v(t._s(t.message))]),t._v(" "),o("h1",[o("strv-dev-logo",{attrs:{logoScale:t.logoScale}})],1)])],1)])}),[],!1,null,"57c43601",null);e.default=component.exports}}]);