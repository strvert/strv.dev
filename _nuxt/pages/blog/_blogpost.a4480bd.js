(window.webpackJsonp=window.webpackJsonp||[]).push([[20],{539:function(e,t,n){"use strict";n.d(t,"a",(function(){return o}));n(51),n(27),n(42);var r=n(11),c=n(371),o=function(){return{makeBlogpostMeta:function(article){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",title=Object(r.h)(""),meta=Object(r.h)([]);return Object(r.n)(article,(function(t){if(void 0!==t){title.value=t.title;var n=""!==e?"".concat("https://strv.dev/images/ogp","/").concat(e):"".concat("https://strv.dev/images/ogp","/generated/").concat(Object(c.a)(t.path),".png");meta.value=[{hid:"description",name:"description",content:t.description},{hid:"og:description",property:"og:description",content:t.description},{hid:"og:url",property:"og:url",content:"".concat("https://strv.dev","/").concat("blog","/").concat(Object(c.a)(t.path))},{hid:"og:title",property:"og:title",content:"".concat(t.title," - ").concat("strv.dev")},{hid:"og:image",property:"og:image",content:n}]}})),{title:title,meta:meta}}}}},584:function(e,t,n){"use strict";n.r(t);n(0);var r=n(11),c=n(555),o=n(15),l=(n(67),n(16)),v=n(371),f=n(539),d=Object(r.c)({components:{BlogpostFrame:c.default},setup:function(){var e=function(e){var t=Object(r.h)(),n=Object(r.h)([]),c=Object(r.h)(),f=Object(r.k)().$content,path=Object(r.h)(Object(v.b)(e)),d=function(){var e=Object(o.a)(regeneratorRuntime.mark((function e(){var p;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,f(path.value).fetch();case 2:if(p=e.sent,!Array.isArray(p)){e.next=5;break}return e.abrupt("return",p[0]);case 5:return e.abrupt("return",p);case 6:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),h=function(e){void 0!==e.tags?n.value=e.tags:n.value=[]};return Object(l.h)(Object(o.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,d();case 2:t.value=e.sent,c.value=t.value.series,h(t.value);case 5:case"end":return e.stop()}}),e)})))),Object(r.f)(Object(o.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:window.$nuxt.$on("content:update",Object(o.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,d();case 2:t.value=e.sent,c.value=t.value.series,h(t.value);case 5:case"end":return e.stop()}}),e)}))));case 1:case"end":return e.stop()}}),e)})))),Object(r.e)(Object(o.a)(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:window.$nuxt.$off("content:update");case 1:case"end":return e.stop()}}),e)})))),{page:t,path:path,series:c,tags:n}}(Object(r.l)().params.blogpost),t=e.page,path=e.path,n=(0,Object(f.a)().makeBlogpostMeta)(t),title=n.title,meta=n.meta;return Object(r.j)({title:title,meta:meta}),{page:t,path:path}}}),h=d,m=n(17),component=Object(m.a)(h,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("blogpost-frame",{attrs:{page:e.page,path:e.path}},[n("nuxt-content",{attrs:{document:e.page}})],1)}),[],!1,null,null,null);t.default=component.exports}}]);