(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{187:function(t,e,l){var content=l(311);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,l(37).default)("7da0df2c",content,!0,{sourceMap:!1})},190:function(t,e,l){var content=l(313);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,l(37).default)("0ac093de",content,!0,{sourceMap:!1})},191:function(t,e,l){var content=l(315);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,l(37).default)("f2423ac6",content,!0,{sourceMap:!1})},192:function(t,e,l){var content=l(317);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,l(37).default)("16ea9bea",content,!0,{sourceMap:!1})},211:function(t,e,l){"use strict";l.r(e);var r=l(11),o=l(212),n=Object(r.b)({components:{StrvdevLogo:o.default},setup:function(t){var e,l,o,n=(e=Object(r.g)(!1),l=0,o=function(){window.scrollY>=l?e.value=!0:e.value=!1,l=window.scrollY},{state:e,addEvent:function(){window.addEventListener("scroll",o)},removeEvent:function(){window.removeEventListener("scroll",o)}}),d=n.state,L=n.addEvent,c=n.removeEvent;return Object(r.e)((function(){L()})),Object(r.d)((function(){c()})),{logoAnimEffectTiming:{duration:500,easing:"ease",fill:"forwards"},logoTransformed:d}}}),d=(l(314),l(23)),component=Object(d.a)(n,(function(){var t=this,e=t.$createElement,l=t._self._c||e;return l("div",{staticClass:"header-main"},[l("div",{staticClass:"strvdev-logo"},[l("nuxt-link",{attrs:{to:"/"}},[l("strvdev-logo",{attrs:{transformed:t.logoTransformed,logoScale:17,animEffectTiming:t.logoAnimEffectTiming}})],1)],1)])}),[],!1,null,"490b6f56",null);e.default=component.exports},212:function(t,e,l){"use strict";l.r(e);l(216),l(41);var r=l(11),o=Object(r.b)({props:{logoScale:{type:Number,default:50},logoAspectRatio:{type:Array,default:function(){return[10,1.79]}},transformed:{type:Boolean,default:!1},animEffectTiming:{type:Object,default:function(){return{duration:600,easing:"ease",fill:"forwards"}}}},setup:function(t){var e=Object(r.a)((function(){return t.logoScale*t.logoAspectRatio[0]})),l=Object(r.a)((function(){return t.logoScale*t.logoAspectRatio[1]})),o=[{opacity:"1"},{opacity:"0"}],n=[{transform:"scaleY(101%)"},{transform:"translateX(-5%) scaleX(105.3%) scaleY(438%)"}],d=Object(r.g)(),L=Object(r.g)(),c=Object(r.f)(t.animEffectTiming);Object(r.e)((function(){var t=document.querySelector(".characters"),e=document.querySelector(".barcode");d.value=t.animate(o,c),d.value.pause(),L.value=e.animate(n,c),L.value.pause()}));var f=[d,L].map((function(t){return function(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],l=Object(r.g)(e),o=function(e){t.value.playbackRate=e?1:-1,t.value.play(),l.value=e};return{state:l,toggle:function(){o(!l.value)},setState:o}}(t).setState}));return Object(r.l)((function(){return t.transformed}),(function(t){f.map((function(e){return e(t)}))})),{logoWidth:e,logoHeight:l}}}),n=(l(312),l(23)),component=Object(n.a)(o,(function(){var t=this,e=t.$createElement,l=t._self._c||e;return l("div",[l("svg",{staticStyle:{isolation:"isolate"},attrs:{xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",viewBox:"0 0 35.893 6.419",width:t.logoWidth,height:t.logoHeight}},[l("defs",[l("clipPath",{attrs:{id:"_clipPath_wRGPbw1kW50q8FvcamYb3Hxr115iy0Iy"}},[l("rect",{attrs:{width:"35.893",height:"6.419"}})])]),t._v(" "),l("g",{attrs:{"clip-path":"url(#_clipPath_wRGPbw1kW50q8FvcamYb3Hxr115iy0Iy)"}},[l("clipPath",{attrs:{id:"_clipPath_I8fUhl3gs6z6fOmYoJZCtzdbffHu72Ll"}},[l("rect",{attrs:{x:"0",y:"0",width:"35.893",height:"6.419",transform:"matrix(1,0,0,1,0,0)",fill:"rgb(255,255,255)"}})]),t._v(" "),l("g",{attrs:{"clip-path":"url(#_clipPath_I8fUhl3gs6z6fOmYoJZCtzdbffHu72Ll)"}},[l("g",{staticClass:"characters"},[l("path",{attrs:{d:" M 35.059 1.474 L 35.017 1.474 L 33.893 5.978 C 33.853 6.139 33.686 6.269 33.52 6.269 L 31.39 6.269 C 31.225 6.269 31.058 6.139 31.018 5.978 L 29.892 1.469 L 29.892 1.469 L 31.726 1.474 L 31.647 1.474 L 32.339 4.298 C 32.378 4.459 32.431 4.589 32.455 4.589 L 32.455 4.589 C 32.48 4.589 32.532 4.459 32.572 4.298 L 33.265 1.469 L 35.059 1.474 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 27.535 1.469 L 27.56 1.469 L 27.535 1.469 L 27.535 2.199 C 27.535 2.365 27.669 2.499 27.835 2.499 L 29.315 2.499 C 29.48 2.499 29.615 2.634 29.615 2.799 L 29.615 3.489 C 29.615 3.655 29.48 3.789 29.315 3.789 L 27.835 3.789 C 27.669 3.789 27.535 3.924 27.535 4.089 L 27.535 4.519 C 27.535 4.685 27.669 4.819 27.835 4.819 L 29.675 4.819 C 29.84 4.819 29.975 4.954 29.975 5.119 L 29.975 5.969 C 29.975 6.135 29.84 6.269 29.675 6.269 L 26.075 6.269 C 25.909 6.269 25.775 6.135 25.775 5.969 L 25.775 1.469 L 25.775 1.469 L 27.535 1.469 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 25.396 1.469 Q 25.414 1.537 25.43 1.609 L 25.43 1.609 L 25.43 1.609 Q 25.56 2.219 25.56 3.149 L 25.56 3.149 L 25.56 3.149 Q 25.56 4.069 25.43 4.679 L 25.43 4.679 L 25.43 4.679 Q 25.3 5.289 24.985 5.639 L 24.985 5.639 L 24.985 5.639 Q 24.67 5.989 24.12 6.129 L 24.12 6.129 L 24.12 6.129 Q 23.57 6.269 22.72 6.269 L 22.72 6.269 L 20.37 6.269 C 20.204 6.269 20.07 6.135 20.07 5.969 L 20.07 1.474 L 20.07 1.474 L 20.07 1.474 L 20.07 1.474 L 21.83 1.469 L 21.83 4.589 C 21.83 4.755 21.964 4.889 22.13 4.889 L 22.89 4.889 L 22.89 4.889 Q 23.33 4.889 23.5 4.744 L 23.5 4.744 L 23.5 4.744 Q 23.67 4.599 23.67 4.229 L 23.67 4.229 L 23.67 2.059 L 23.67 2.059 Q 23.67 1.689 23.5 1.544 L 23.5 1.544 L 23.5 1.544 Q 23.452 1.503 23.382 1.474 L 23.317 1.474 L 23.317 1.474 L 25.396 1.469 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 19.15 5.008 L 19.411 5.008 C 19.687 5.008 19.911 5.232 19.911 5.508 L 19.911 5.769 C 19.911 6.045 19.687 6.269 19.411 6.269 L 19.15 6.269 C 18.874 6.269 18.65 6.045 18.65 5.769 L 18.65 5.508 C 18.65 5.232 18.874 5.008 19.15 5.008 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 19.49 1.474 L 18.365 5.978 C 18.325 6.139 18.158 6.269 17.993 6.269 L 15.863 6.269 C 15.697 6.269 15.53 6.139 15.49 5.978 L 14.366 1.474 L 16.118 1.469 L 16.811 4.298 C 16.851 4.459 16.903 4.589 16.928 4.589 L 16.928 4.589 C 16.952 4.589 17.005 4.459 17.044 4.298 L 17.737 1.469 L 19.49 1.474 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 14.014 1.469 Q 14.082 1.826 14.096 2.276 L 14.096 2.276 L 14.096 2.276 Q 14.017 3.359 13.517 3.859 L 13.517 3.859 L 13.517 3.859 Q 13.396 3.981 13.376 3.994 C 13.24 4.088 13.194 4.281 13.273 4.426 L 14.143 6.006 C 14.223 6.151 14.153 6.269 13.987 6.269 L 12.677 6.269 C 12.512 6.269 12.32 6.148 12.249 5.998 L 11.602 4.63 C 11.531 4.481 11.339 4.359 11.173 4.359 L 11.037 4.359 C 10.872 4.359 10.737 4.494 10.737 4.659 L 10.737 5.969 C 10.737 6.135 10.603 6.269 10.437 6.269 L 9.277 6.269 C 9.112 6.269 8.977 6.135 8.976 5.969 L 8.946 1.469 L 10.737 1.469 L 10.737 2.769 C 10.737 2.935 10.872 3.069 11.037 3.069 L 11.707 3.069 L 11.707 3.069 Q 11.977 3.069 12.077 2.979 L 12.077 2.979 L 12.077 2.979 Q 12.177 2.889 12.177 2.649 L 12.177 2.649 L 12.177 1.889 L 12.177 1.889 Q 12.177 1.649 12.077 1.559 L 12.077 1.559 L 12.077 1.559 L 11.859 1.469 L 14.014 1.469 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 7.663 1.469 L 7.663 5.969 C 7.663 6.135 7.529 6.269 7.363 6.269 L 6.203 6.269 C 6.038 6.269 5.903 6.135 5.903 5.969 L 5.903 1.469 L 7.663 1.469 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 2.033 1.474 C 1.978 1.474 1.933 1.519 1.933 1.574 L 1.933 2.169 C 1.933 2.224 1.978 2.273 2.033 2.278 L 2.753 2.339 L 2.753 2.339 Q 3.553 2.409 4.048 2.639 L 4.048 2.639 L 4.048 2.639 Q 4.543 2.869 4.768 3.284 L 4.768 3.284 L 4.768 3.284 Q 4.993 3.699 4.993 4.349 L 4.993 4.349 L 4.993 4.349 Q 4.993 5.079 4.728 5.534 L 4.728 5.534 L 4.728 5.534 Q 4.463 5.989 3.898 6.204 L 3.898 6.204 L 3.898 6.204 Q 3.333 6.419 2.423 6.419 L 2.423 6.419 L 2.423 6.419 Q 1.753 6.419 1.138 6.339 L 1.138 6.339 L 1.138 6.339 L 0.247 6.151 C 0.085 6.117 -0.024 5.957 0.004 5.793 L 0.152 4.935 C 0.181 4.772 0.332 4.678 0.49 4.727 Q 0.693 4.789 1.203 4.864 L 1.203 4.864 L 1.203 4.864 Q 1.713 4.939 2.213 4.939 L 2.213 4.939 L 2.213 4.939 Q 2.473 4.939 2.673 4.929 L 2.673 4.929 L 2.673 4.929 L 2.805 4.914 C 2.97 4.895 3.103 4.745 3.103 4.579 L 3.103 4.319 C 3.103 4.154 2.97 4.007 2.805 3.993 L 2.193 3.939 L 2.193 3.939 Q 1.593 3.889 1.178 3.764 L 1.178 3.764 L 1.178 3.764 Q 0.763 3.639 0.513 3.414 L 0.513 3.414 L 0.513 3.414 Q 0.263 3.189 0.153 2.854 L 0.153 2.854 L 0.153 2.854 Q 0.043 2.519 0.043 2.039 L 0.043 2.039 L 0.043 2.039 Q 0.043 1.239 0.263 0.764 L 0.263 0.764 L 0.263 0.764 Q 0.521 0.163 1.036 0.019 L 1.036 0.019 L 1.036 0.019 L 1.036 0.019 L 1.036 1.469 L 1.728 1.469 L 2.033 1.474 L 2.033 1.474 Z ",fill:"rgb(51,60,73)"}})]),t._v(" "),l("g",{staticClass:"barcode"},[l("path",{attrs:{d:" M 23.116 1.48 L 23.116 0 L 23.393 0 L 23.393 1.48 L 23.116 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 25.06 1.48 L 25.06 0 L 24.782 0 L 24.782 1.48 L 25.06 1.48 L 25.06 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 24.227 1.48 L 24.227 0 L 23.671 0 L 23.671 1.48 L 24.227 1.48 L 24.227 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 27.282 1.48 L 27.282 0 L 26.171 0 L 26.171 1.48 L 27.282 1.48 L 27.282 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 27.838 0 L 27.838 1.475 L 27.838 1.48 L 27.56 1.48 L 27.56 1.475 L 27.56 0 L 27.838 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 28.671 0 L 28.671 1.475 L 28.671 1.48 L 28.393 1.48 L 28.393 1.475 L 28.393 0 L 28.671 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 29.226 1.475 L 29.226 1.48 L 29.782 1.48 L 29.782 1.475 L 29.782 0 L 29.226 0 L 29.226 1.475 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 35.059 1.48 L 35.059 0 L 34.782 0 L 34.782 1.48 L 35.059 1.48 L 35.059 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 34.504 1.48 L 34.504 0 L 33.671 0 L 33.671 1.48 L 34.504 1.48 L 34.504 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 31.726 1.48 L 31.726 0 L 30.893 0 L 30.893 1.48 L 31.726 1.48 L 31.726 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 30.615 1.48 L 30.615 0 L 30.337 0 L 30.337 1.48 L 30.615 1.48 L 30.615 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 32.837 0 L 32.837 1.48 L 32.282 1.48 L 32.282 0 L 32.837 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 35.893 0.201 L 35.893 1.28 C 35.893 1.39 35.803 1.48 35.693 1.48 L 35.337 1.48 L 35.337 0 L 35.693 0 C 35.803 0 35.893 0.089 35.893 0.201 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 2.283 1.48 L 2.283 1.48 L 2.283 1.48 L 2.283 1.48 L 2.283 0 L 1.728 0 L 1.728 1.48 L 2.283 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 2.839 0 L 2.839 1.48 L 2.561 1.48 L 2.561 0 L 2.839 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 3.672 0 L 3.672 1.48 L 3.394 1.48 L 3.394 0 L 3.672 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 5.061 0 L 5.061 1.48 L 4.783 1.48 L 4.783 0 L 5.061 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 6.45 1.475 L 6.45 0 L 5.339 0 L 5.339 1.48 L 6.45 1.48 L 6.45 1.475 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 7.283 1.48 L 7.283 0.777 L 7.283 0 L 7.005 0 L 7.005 1.48 L 7.283 1.48 L 7.283 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 10.338 1.48 L 10.338 0 L 10.061 0 L 10.061 1.478 L 10.338 1.48 L 10.338 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 9.783 1.48 L 9.783 0 L 8.672 0 L 8.672 1.475 L 8.672 1.475 L 8.672 1.475 L 8.672 1.475 L 8.672 1.48 L 9.783 1.475 L 9.783 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 8.116 1.475 L 8.116 0 L 7.839 0 L 7.839 0.918 L 7.839 1.475 L 8.116 1.475 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 21.727 1.475 L 21.727 0 L 21.449 0 L 21.449 1.475 L 21.727 1.475 L 21.727 1.475 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 20.338 1.48 L 20.338 0 L 20.06 0 L 20.06 1.48 L 20.338 1.48 L 20.338 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 13.949 1.48 L 13.949 0 L 15.06 0 L 15.06 1.48 L 13.949 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 19.782 1.48 L 19.782 0 L 18.949 0 L 18.949 1.48 L 19.782 1.48 L 19.782 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 18.394 1.48 L 18.394 0 L 17.838 0 L 17.838 1.48 L 18.394 1.48 L 18.394 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 15.616 1.48 L 15.616 0 L 15.338 0 L 15.338 1.48 L 15.616 1.48 L 15.616 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 13.672 1.48 L 13.672 0 L 12.561 0 L 12.561 1.48 L 13.672 1.48 L 13.672 1.48 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 12.005 0 L 11.727 0 L 11.727 1.48 L 12.005 1.48 L 12.005 0 Z ",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 11.172 0 L 11.172 1.48 L 10.894 1.48 L 10.894 0 L 11.172 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 16.449 0 L 16.449 1.48 L 16.172 1.48 L 16.172 0 L 16.449 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 17.283 0 L 17.283 1.48 L 17.005 1.48 L 17.005 0 L 17.283 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}}),t._v(" "),l("path",{attrs:{d:" M 22.838 0 L 22.838 1.48 L 22.282 1.48 L 22.282 0 L 22.838 0 Z ","fill-rule":"evenodd",fill:"rgb(51,60,73)"}})])])])])])}),[],!1,null,"cc499a28",null);e.default=component.exports},213:function(t,e,l){"use strict";var r=l(11),o=l(215),n=l(211),d=Object(r.b)({components:{Container:o.default,Header:n.default},setup:function(){}}),L=(l(316),l(23)),component=Object(L.a)(d,(function(){var t=this,e=t.$createElement,l=t._self._c||e;return l("div",[l("Header",{staticClass:"header"}),t._v(" "),l("container",[l("nuxt")],1)],1)}),[],!1,null,"31d23174",null);e.a=component.exports},214:function(t,e,l){"use strict";var r=l(23),component=Object(r.a)({},(function(){var t=this.$createElement;return(this._self._c||t)("nuxt")}),[],!1,null,null,null);e.a=component.exports},215:function(t,e,l){"use strict";l.r(e);l(310);var r=l(23),component=Object(r.a)({},(function(){var t=this,e=t.$createElement;return(t._self._c||e)("div",{staticClass:"container-base"},[t._t("default")],2)}),[],!1,null,"bdd67452",null);e.default=component.exports},223:function(t,e,l){l(224),l(225),t.exports=l(229)},257:function(t,e,l){var content=l(258);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,l(37).default)("7a2293d8",content,!0,{sourceMap:!1})},258:function(t,e,l){var r=l(36)(!1);r.push([t.i,"*,:after,:before{box-sizing:border-box}:after,:before{text-decoration:inherit;vertical-align:inherit}html{cursor:default;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;word-break:break-word}body{margin:0}h1{font-size:2em;margin:.67em 0}dl dl,dl ol,dl ul,ol dl,ol ol,ol ul,ul dl,ul ol,ul ul{margin:0}hr{height:0;overflow:visible}main{display:block}nav ol,nav ul{list-style:none;padding:0}pre{font-family:monospace,monospace;font-size:1em}a{background-color:transparent}abbr[title]{text-decoration:underline;-webkit-text-decoration:underline dotted;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace,monospace;font-size:1em}small{font-size:80%}audio,canvas,iframe,img,svg,video{vertical-align:middle}audio,video{display:inline-block}audio:not([controls]){display:none;height:0}iframe,img{border-style:none}svg:not([fill]){fill:currentColor}svg:not(:root){overflow:hidden}table{border-collapse:collapse}button,input,select{margin:0}button{overflow:visible;text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button}fieldset{border:1px solid #a0a0a0;padding:.35em .75em .625em}input{overflow:visible}legend{color:inherit;display:table;max-width:100%;white-space:normal}progress{display:inline-block;vertical-align:baseline}select{text-transform:none}textarea{margin:0;overflow:auto;resize:vertical}[type=checkbox],[type=radio]{padding:0}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}::-webkit-input-placeholder{color:inherit;opacity:.54}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}::-moz-focus-inner{border-style:none;padding:0}:-moz-focusring{outline:1px dotted ButtonText}:-moz-ui-invalid{box-shadow:none}details,dialog{display:block}dialog{background-color:#fff;border:solid;color:#000;height:-moz-fit-content;height:-webkit-fit-content;height:fit-content;left:0;margin:auto;padding:1em;position:absolute;right:0;width:-moz-fit-content;width:-webkit-fit-content;width:fit-content}dialog:not([open]){display:none}summary{display:list-item}canvas{display:inline-block}template{display:none}[tabindex],a,area,button,input,label,select,summary,textarea{touch-action:manipulation}[hidden]{display:none}[aria-busy=true]{cursor:progress}[aria-controls]{cursor:pointer}[aria-disabled=true],[disabled]{cursor:not-allowed}[aria-hidden=false][hidden]{display:inline;display:initial}[aria-hidden=false][hidden]:not(:focus){clip:rect(0,0,0,0);position:absolute}",""]),t.exports=r},259:function(t,e,l){var content=l(260);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,l(37).default)("73ed3b1f",content,!0,{sourceMap:!1})},260:function(t,e,l){var r=l(36)(!1);r.push([t.i,'html{font-family:"Helvetica Neue","Helvetica","Arial",YuGothic,"Yu Gothic","Hiragino Kaku Gothic ProN","ヒラギノ角ゴ ProN W3","メイリオ",Meiryo,"ＭＳ ゴシック",sans-serif;font-size:15px;font-weight:500;color:var(--strvdev-text-color);background-color:var(--strvdev-bg-color);height:100%}body{overflow-x:hidden}a{color:var(--strvdev-link-color);-webkit-text-decoration-line:none;text-decoration-line:none;text-decoration-thickness:.07em}a:hover{-webkit-text-decoration-line:underline;text-decoration-line:underline;-webkit-text-decoration-style:dashed;text-decoration-style:dashed}.rounded-font{font-weight:500;font-family:"M PLUS Rounded 1c",sans-serif}::-webkit-scrollbar{background:#c9c9c9;width:7.5px}::-webkit-scrollbar-thumb{background:#808494;border-radius:5px}',""]),t.exports=r},261:function(t,e,l){var content=l(262);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,l(37).default)("81377b0e",content,!0,{sourceMap:!1})},262:function(t,e,l){var r=l(36)(!1);r.push([t.i,"*{--strvdev-palette-1:#d9dbd9;--strvdev-palette-2:#7ac292;--strvdev-palette-3:#505464;--strvdev-palette-4:#273134;--strvdev-palette-5:#5184a5;--strvdev-palette-6:#a61010;--strvdev-bg-color:var(--strvdev-palette-1);--strvdev-text-color:var(--strvdev-palette-4);--strvdev-link-color:var(--strvdev-palette-5)}",""]),t.exports=r},310:function(t,e,l){"use strict";l(187)},311:function(t,e,l){var r=l(36)(!1);r.push([t.i,".container-base[data-v-bdd67452]{margin-top:80px}",""]),t.exports=r},312:function(t,e,l){"use strict";l(190)},313:function(t,e,l){var r=l(36)(!1);r.push([t.i,"svg[data-v-cc499a28]{display:block;margin:0 auto}",""]),t.exports=r},314:function(t,e,l){"use strict";l(191)},315:function(t,e,l){var r=l(36)(!1);r.push([t.i,'.header-main[data-v-490b6f56]{display:grid;grid-template-columns:repeat(5,1fr);grid-template-areas:"a b c d e";align-content:center;background-color:var(--strvdev-palette-1);box-shadow:0 0 3px 0 var(--strvdev-palette-3);width:100%;height:44px}.strvdev-logo[data-v-490b6f56]{grid-area:c}',""]),t.exports=r},316:function(t,e,l){"use strict";l(192)},317:function(t,e,l){var r=l(36)(!1);r.push([t.i,".header[data-v-31d23174]{position:fixed;z-index:100;top:0;left:0}",""]),t.exports=r}},[[223,7,1,8]]]);