(window.webpackJsonp=window.webpackJsonp||[]).push([[27],{429:function(t,e,n){"use strict";n.d(e,"a",(function(){return o}));n(50),n(30),n(42);var r=n(9),c=n(381),o=function(){var title=Object(r.h)(""),meta=Object(r.h)([]);Object(r.j)({title:title,meta:meta});var t=function(article,t){if(void 0!==article){var e=""!==t?"".concat("https://strv.dev/images/ogp","/").concat(t):"".concat("https://strv.dev/images/ogp","/generated/").concat(Object(c.a)(article.path),".png");meta.value=[{hid:"description",name:"description",content:article.description},{hid:"og:description",property:"og:description",content:article.description},{hid:"og:url",property:"og:url",content:"".concat("https://strv.dev","/").concat("blog","/").concat(Object(c.a)(article.path))},{hid:"og:title",property:"og:title",content:"".concat(article.title," - ").concat("strv.dev")},{hid:"og:image",property:"og:image",content:e}],title.value=article.title}};return{setBlogpostMeta:function(article){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";Object(r.n)(article,(function(article){return t(article,e)})),t(article.value,e)}}}},485:function(t,e,n){"use strict";n.r(e);n(0);var r=n(9),c=n(451),o=n(16),f=(n(67),n(21)),d=n(381),v=n(429),l=Object(r.c)({name:"blogpost-content",components:{BlogpostFrame:c.default},setup:function(){var t=function(t){var e=Object(r.h)(),n=Object(r.k)().$content,path=Object(r.h)(Object(d.b)(t)),c=function(){var t=Object(o.a)(regeneratorRuntime.mark((function t(){var p;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,n(path.value).fetch();case 2:if(p=t.sent,!Array.isArray(p)){t.next=5;break}return t.abrupt("return",p[0]);case 5:return t.abrupt("return",p);case 6:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),v=function(){var t=Object(o.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,c();case 2:e.value=t.sent;case 3:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}();return Object(r.f)(Object(o.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:window.$nuxt.$on("content:update",Object(o.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,v();case 2:case"end":return t.stop()}}),t)}))));case 1:case"end":return t.stop()}}),t)})))),Object(r.e)(Object(o.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:window.$nuxt.$off("content:update");case 1:case"end":return t.stop()}}),t)})))),Object(f.h)(Object(o.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,v();case 2:case"end":return t.stop()}}),t)})))),{page:e,path:path}}(Object(r.l)().params.blogpost),e=t.page,path=t.path;return(0,Object(v.a)().setBlogpostMeta)(e),{page:e,path:path}}}),h=l,m=n(14),component=Object(m.a)(h,(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",[void 0!==t.page?n("blogpost-frame",{attrs:{page:t.page,path:t.path}},[n("nuxt-content",{attrs:{document:t.page}})],1):t._e()],1)}),[],!1,null,null,null);e.default=component.exports}}]);