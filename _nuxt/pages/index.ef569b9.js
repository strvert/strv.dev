(window.webpackJsonp=window.webpackJsonp||[]).push([[10,3],{350:function(e,t,n){var content=n(356);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(24).default)("491fd832",content,!0,{sourceMap:!1})},355:function(e,t,n){"use strict";n(350)},356:function(e,t,n){var r=n(23)(!1);r.push([e.i,"span[data-v-47e5eec1]{display:inline-block}.redirect-message[data-v-47e5eec1]{text-align:center;width:100%;position:absolute;top:45%;left:50%;transform:translate(-50%,-50%)}.redirect-message .wrapper[data-v-47e5eec1]{width:90%;height:100%;margin:0 auto}.redirect-message h1[data-v-47e5eec1]{font-size:5rem;margin-bottom:1rem;line-height:6rem}@media screen and (max-width:700px){.redirect-message h1[data-v-47e5eec1]{font-size:4.9rem}}.redirect-message .message[data-v-47e5eec1]{font-size:1.4rem}@media screen and (max-width:700px){.redirect-message .message[data-v-47e5eec1]{font-size:1.1rem}}",""]),e.exports=r},494:function(e,t,n){"use strict";n.r(t);n(226);var r=n(5),c=n(102),o=n(103),d=(n(64),function(){function e(t,n){Object(c.a)(this,e),this.callback=t,this.remaining=n,this.running=!1,this.timerId=void 0,this.eventId=void 0}return Object(o.a)(e,[{key:"start",value:function(){var e=this;this.running=!0,this.started=new Date,this.timerId=window.setTimeout((function(){e.finish()}),this.remaining)}},{key:"finish",value:function(){this.running=!1,this.callback(),this.unregister()}},{key:"pause",value:function(){this.running?(this.running=!1,clearTimeout(this.timerId),this.remaining-=Date.now()-this.started.getTime()):console.warn("A timer that has not been started has been stopped.")}},{key:"register",value:function(e,t){this.eventId=window.setInterval(e,t)}},{key:"unregister",value:function(){void 0!==this.eventId&&clearInterval(this.eventId),void 0!==this.timerId&&clearTimeout(this.timerId)}},{key:"remainingTime",value:function(){return this.remaining-(Date.now()-this.started.getTime())}},{key:"state",value:function(){return this.running}}]),e}()),l=Object(r.b)({head:{},props:{redirect:{type:Boolean,default:!0},to:{type:String,required:!0},wait:{type:Number,required:!0}},setup:function(e){var t=Object(r.g)(Math.ceil(e.wait/1e3)),n=Object(r.l)(),c=Object(r.f)(new d((function(){e.redirect&&n.push(e.to)}),e.wait));return Object(r.e)((function(){c.start(),Object(r.k)({titleTemplate:"",title:"strv.dev"}),c.register((function(){t.value=Math.ceil(c.remainingTime()/1e3)}),100)})),Object(r.d)((function(){c.unregister()})),{remaining:t}}}),m=(n(355),n(12)),component=Object(m.a)(l,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("header",{staticClass:"redirect-message"},[n("div",{staticClass:"wrapper"},[n("h1",{staticClass:"rounded-font"},[e._t("message",null,{remaining:e.remaining})],2),e._v(" "),n("p",{staticClass:"message"},[e._t("submessage",null,{redirect:e.redirect,remaining:e.remaining})],2)])])])}),[],!1,null,"47e5eec1",null);t.default=component.exports},518:function(e,t,n){"use strict";n.r(t);var r=n(5),c=n(494),o=Object(r.b)({head:{},components:{Redirector:c.default},setup:function(){Object(r.k)({titleTemplate:"strv.dev"})}}),d=n(12),component=Object(d.a)(o,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("redirector",{attrs:{to:"/blog",wait:5e3},scopedSlots:e._u([{key:"message",fn:function(){return[n("span",[e._v("COMING")]),e._v(" "),n("span",[e._v("SOON....")])]},proxy:!0},{key:"submessage",fn:function(t){return[n("span",[e._v("トップページはまだ作成されていません。")]),t.redirect?n("span",[e._v(e._s(t.remaining)+"秒後に"),n("nuxt-link",{attrs:{to:"/blog"}},[e._v("ブログページ")]),e._v("へ自動で移動します。")],1):e._e()]}}])})}),[],!1,null,"016500f4",null);t.default=component.exports}}]);