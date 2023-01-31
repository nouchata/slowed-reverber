(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[842],{2927:function(e,t,n){"use strict";var l=n(5893);t.Z=function(e){return(0,l.jsxs)("div",{className:"h-full w-full flex flex-col justify-center gap-4 items-center text-white ".concat(null===e||void 0===e?void 0:e.className),children:[(0,l.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.2",strokeLinecap:"round",strokeLinejoin:"round",className:"flex-[0_0_40%] w-full",children:[(0,l.jsx)("circle",{cx:"12",cy:"12",r:"10"}),(0,l.jsx)("line",{x1:"12",y1:"8",x2:"12",y2:"12"}),(0,l.jsx)("line",{x1:"12",y1:"16",x2:"12.01",y2:"16"})]}),(0,l.jsx)("strong",{className:"w-10/12 text-center",children:e.error})]})}},1802:function(e,t,n){"use strict";n.d(t,{Z:function(){return d}});var l,a=n(7568),r=n(655),s=n(5893),i=n(7294),o=function(e){return(0,s.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeLinejoin:"round",className:e.className,children:[(0,s.jsx)("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),(0,s.jsx)("polyline",{points:"14 2 14 8 20 8"}),e.valideFile?(0,s.jsx)("polyline",{points:"17.239 10.812 9.11 18.948 6.672 16.51"}):(0,s.jsxs)("g",{id:"inject-new-file-plus",style:{transformOrigin:"50% 62.5%"},className:"".concat(e.animatePlusSign?"animate-inject-new-file-rotate":""),children:[(0,s.jsx)("line",{x1:"12",y1:"18",x2:"12",y2:"12"}),(0,s.jsx)("line",{x1:"9",y1:"15",x2:"15",y2:"15"})]})]})},c=n(1108);!function(e){e[e.WAITING_FOR_FILE=0]="WAITING_FOR_FILE",e[e.PROCESSING=1]="PROCESSING",e[e.DONE=2]="DONE"}(l||(l={}));var u=["Click or drag-and-drop a file here","Currently processing the file ...","Processing done"],d=function(e){var t=(0,i.useContext)(c.R),n=t.appData,d=t.setAppData,f=(0,i.useState)(e.isActive?l.WAITING_FOR_FILE:l.DONE),x=f[0],p=f[1],h=(0,i.useState)(void 0),v=h[0],m=h[1],g=(0,i.useRef)(null),b=(0,i.useRef)(null),C=(0,i.useRef)(0);return(0,i.useEffect)((function(){b.current.onclick=function(){g.current.click()}}),[]),(0,i.useEffect)((function(){if(void 0!==v)return v?e.fileTypes.find((function(e){return v.type.includes(e)}))?void(0,a.Z)((function(){return(0,r.__generator)(this,(function(t){switch(t.label){case 0:return[4,e.processCallback(v).then((function(){p(l.DONE),e.successCallback()})).catch((function(e){d({error:{type:"normal",value:e.message}}),p(l.WAITING_FOR_FILE),m(void 0)}))];case 1:return t.sent(),[2]}}))}))():(d({error:{type:"normal",value:"You need to provide an ".concat(e.fileTypes.join("/")," file")}}),p(l.WAITING_FOR_FILE),void m(void 0)):(d({error:{type:"normal",value:"You need to provide a file"}}),p(l.WAITING_FOR_FILE),void m(void 0))}),[v]),(0,i.useEffect)((function(){n.fileDragAndDrop&&!x?b.current.classList.add("outline-dashed"):b.current.classList.remove("outline-dashed")}),[n.fileDragAndDrop]),(0,s.jsxs)("div",{className:"relative text-white ".concat(null===e||void 0===e?void 0:e.className),children:[(0,s.jsxs)("div",{className:"h-full w-full min-h-[400px]",children:[(0,s.jsx)("input",{ref:g,type:"file",accept:"audio",className:"absolute hidden",disabled:!!x,onChange:function(e){if(!x){p(l.PROCESSING);var t=e.target.files;t?t[0]?m(t[0]):p(l.WAITING_FOR_FILE):m(null)}e.target.value=""}}),(0,s.jsxs)("button",{ref:b,className:"w-full h-full flex flex-col justify-center gap-4 items-center -outline-offset-2 outline-current outline-2",disabled:!!x,onDragEnter:function(){C.current||b.current.classList.add("text-app-primary-color"),C.current+=1},onDragLeave:function(){C.current-=1,C.current||b.current.classList.remove("text-app-primary-color")},onDrop:function(e){C.current-=1,b.current.classList.remove("text-app-primary-color"),x||(p(l.PROCESSING),m(e.dataTransfer.items[0]?e.dataTransfer.items[0].getAsFile():null))},children:[(0,s.jsx)(o,{animatePlusSign:x===l.PROCESSING,valideFile:x===l.DONE,className:"flex-[0_0_40%] w-full stroke-1"}),(0,s.jsx)("strong",{children:(null===n||void 0===n?void 0:n.fileDragAndDrop)&&!x?"Drop your file here":u[x]})]})]}),x===l.DONE&&(0,s.jsx)("div",{className:"absolute w-full h-full top-0 left-0 bg-app-element-disabled opacity-50"})]})}},5822:function(e,t,n){"use strict";var l=n(5893),a=n(7294);t.Z=function(e){var t,n,r=(0,a.useMemo)((function(){return e.blob?URL.createObjectURL(e.blob):""}),[e.blob]);return(0,l.jsxs)("div",{className:e.className,children:[(null===(t=e.blob)||void 0===t?void 0:t.type.includes("image"))&&(0,l.jsx)("img",{alt:"Visual source preview",className:"w-full h-full object-cover ".concat(e.notRounded?"":"rounded"),src:r}),(null===(n=e.blob)||void 0===n?void 0:n.type.includes("video"))&&(0,l.jsx)("video",{about:"Visual source preview",controls:!1,muted:!0,autoPlay:!0,loop:!0,className:"w-full h-full object-cover ".concat(e.notRounded?"":"rounded"),src:r}),!e.blob&&(0,l.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:"opacity-50 w-full h-full","aria-labelledby":"title",children:[(0,l.jsx)("title",{children:"No media available"}),(0,l.jsx)("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),(0,l.jsx)("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})]})}},577:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return Z}});var l,a=n(7568),r=n(655),s=n(5893),i=n(7294),o=n(8476),c=n(1108),u=n(7299),d=n(2226),f=n(2927),x=n(1802),p=n(2939),h=n(3917),v=n(8304),m=n(4522),g=n(5835),b=function(e){var t=(0,i.useState)([]),n=t[0],l=t[1],a=(0,i.useState)(""),r=a[0],o=a[1],c=(0,i.useRef)(null);return(0,i.useEffect)((function(){if(e.setSuggestionCallback(""),l([]),c.current&&(c.current.currentScrollValue=0),!e.isActive)return function(){};var t=AbortController?new AbortController:void 0,n="https://api.giphy.com/v1/".concat(e.searchValue?"tags/related/".concat(encodeURI(e.searchValue)):"trending/searches","?api_key=sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh");return fetch(n,{signal:null===t||void 0===t?void 0:t.signal}).then((function(t){t.blob().then((function(t){return t.text().then((function(t){var n=JSON.parse(t).data||[];e.searchValue&&(n=n.map((function(e){return e.name}))),l(n)}))}))})).catch((function(){})).finally((function(){t=void 0})),function(){return null===t||void 0===t?void 0:t.abort()}}),[e.searchValue,e.isActive]),(0,s.jsxs)("div",{id:"make-video-modal-suggestion-bar",className:"".concat(e.className," relative"),children:[(0,s.jsx)("ul",{ref:c,className:"w-full h-full overflow-hidden flex flex-nowrap text-sm px-7 rounded".concat(n.length?"":" bg-app-input-bg animate-pulse"," brightness-200"),children:n.map((function(t,n){return(0,s.jsx)("li",{className:"flex-[0_0_120px] box-content break-keep whitespace-nowrap text-ellipsis overflow-hidden cursor-pointer text-center hover:font-bold".concat(t===r?" font-bold":""),onClick:function(){o(t),e.setSuggestionCallback(t)},children:t},t+n)}))}),(0,s.jsx)("button",{title:"Scroll left",style:{backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'%3E%3C/line%3E%3Cpolyline points='12 19 5 12 12 5'%3E%3C/polyline%3E%3C/svg%3E\")",visibility:n.length?"visible":"hidden"},className:"absolute left-0 top-0 h-full w-7 bg-app-modal-xl-background bg-contain bg-no-repeat bg-center",onClick:function(){c.current&&(c.current.currentScrollValue-=.75*c.current.offsetWidth,c.current.currentScrollValue<0&&(c.current.currentScrollValue=0),c.current.scroll({top:0,left:c.current.currentScrollValue,behavior:"smooth"}))}}),(0,s.jsx)("button",{title:"Scroll right",style:{backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E\")",visibility:n.length?"visible":"hidden"},className:"absolute right-0 top-0 h-full w-7 bg-app-modal-xl-background bg-contain bg-no-repeat bg-center",onClick:function(){var e;c.current&&(c.current.currentScrollValue+=.75*c.current.offsetWidth,c.current.currentScrollValue>c.current.scrollWidth-c.current.offsetWidth&&(c.current.currentScrollValue=c.current.scrollWidth-c.current.offsetWidth),null===(e=c.current)||void 0===e||e.scroll({top:0,left:c.current.currentScrollValue,behavior:"smooth"}))}})]})},C=new v.GiphyFetch("sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh"),w=function(e){return C.trending({offset:e,limit:10})},y=function(){var e;return function(t){e&&clearTimeout(e),e=setTimeout((function(){t(),e=void 0}),500)}}(),E=function(e){var t,n=(0,g.Z)(),l=(0,i.useContext)(c.R).setAppData,o=(0,i.useRef)(null),u=(0,i.useState)({width:100,columns:2}),d=u[0],x=u[1],p=(0,i.useState)(""),h=p[0],v=p[1],E=(0,i.useState)(""),j=E[0],N=E[1],k=(0,i.useState)(!1),S=k[0],L=k[1],I=(0,i.useReducer)((function(t,n){var s;if(t&&"gif-action-overlay"===(null===(s=t.gifElement.lastElementChild)||void 0===s?void 0:s.id)&&t.gifElement.removeChild(t.gifElement.lastElementChild),n){var i=document.createElement("div");i.style.cssText="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: rgba(0,0,0,0.5); border-radius: ".concat(n.gifElement.style.borderRadius,";"),i.id="gif-action-overlay";var o=document.createElement("img");return o.style.height="80px",o.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'%3E%3C/path%3E%3Cpolyline points='7 10 12 15 17 10'%3E%3C/polyline%3E%3Cline x1='12' y1='15' x2='12' y2='3'%3E%3C/line%3E%3C/svg%3E",o.className="animate-element-scale-emphasis",i.appendChild(o),i.onclick=function(t){t.stopImmediatePropagation(),(0,a.Z)((function(){var a,s,i;return(0,r.__generator)(this,(function(r){switch(r.label){case 0:return L(!0),(a=t.currentTarget.lastElementChild)&&(a.src="data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='2' x2='12' y2='6'%3E%3C/line%3E%3Cline x1='12' y1='18' x2='12' y2='22'%3E%3C/line%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'%3E%3C/line%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='6' y2='12'%3E%3C/line%3E%3Cline x1='18' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'%3E%3C/line%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'%3E%3C/line%3E%3C/svg%3E",a.className="animate-spin"),[4,fetch(n.gifData.images.original.mp4).catch((function(e){l({error:{type:"normal",value:e.message}})}))];case 1:return(s=r.sent())?[4,s.blob().catch((function(e){l({error:{type:"normal",value:e.message}})}))]:[3,5];case 2:return(i=r.sent())?[4,e.processCallback(i)]:[3,4];case 3:r.sent(),r.label=4;case 4:e.successCallback(),r.label=5;case 5:return L(!1),[2]}}))}))()},1===n.gifElement.childElementCount&&n.gifElement.appendChild(i),{gifElement:n.gifElement,overlay:i}}}),void 0),A=I[1];return(0,i.useEffect)((function(){if(o.current){var e=o.current.offsetWidth;x({width:e,columns:e<400?1:2})}}),[n.width]),(0,s.jsx)("div",{className:"text-white ".concat(null===e||void 0===e?void 0:e.className),children:(0,s.jsxs)("div",{className:"h-full w-full min-h-[300px] p-2 flex flex-col flex-nowrap",children:[(0,s.jsxs)("div",{className:"flex-[0_0_auto] flex flex-col gap-1 mb-2",children:[(0,s.jsx)("input",{className:"box-border flex-[0_0_50px] px-4 bg-app-input-bg text-xl font-normal rounded drop-shadow-md focus:outline-2 focus:outline-app-input-border focus:outline focus:outline-offset-1 disabled:bg-app-input-disabled placeholder:italic placeholder:font-thin",type:"text",name:"GIPHY searchbar",placeholder:"Search on GIPHY...",onChange:function(e){y((function(){return v(e.target.value)}))},disabled:!e.isActive||S}),(0,s.jsx)(b,{className:"flex-[0_0_20px] overflow-hidden text-app-input-bg",searchValue:h,setSuggestionCallback:N,isActive:e.isActive&&!S})]}),(0,s.jsx)("div",{ref:o,className:"relative flex-1 rounded overflow-x-hidden overflow-y-auto",children:e.isActive?(0,s.jsx)(m.Grid,{className:"h-full",width:d.width,columns:d.columns,noResultsMessage:(0,s.jsx)(f.Z,{error:'No results for "'.concat(j||h,'"')}),fetchGifs:j||h?(t=j||h,function(e){return C.search(t,{offset:e,limit:10})}):w,noLink:!0,hideAttribution:!0,onGifClick:S?function(){}:function(e,t){return A({gifData:e,gifElement:t.currentTarget})}},j||h):(0,s.jsx)("div",{className:"absolute w-full h-full top-0 left-0 bg-app-input-disabled"})})]})})},j=n(5822),N=function(e){var t=(0,i.useState)(!1),n=t[0],l=t[1],o=(0,i.useContext)(u.B).soundsManager,d=(0,i.useContext)(c.R).setAppData;return(0,s.jsxs)("div",{className:"".concat(e.className," flex flex-col flex-nowrap items-center justify-center pb-20 phone-landscape:justify-start"),children:[(0,s.jsx)(j.Z,{className:"text-app-input-border w-[40vh] h-[40vh] min-h-[150px] min-w-[150px] max-w-[80vw] outline-dashed outline-2 outline-offset-8 rounded my-6 ".concat(e.draftData&&e.isActive?"outline-amber-300":"outline-app-input-border"," ").concat(e.draftData&&e.isActive?"bg-amber-300/50":"bg-transparent"),blob:e.draftData}),(0,s.jsxs)("button",{className:"w-3/4 max-w-[40vh] min-w-[220px] flex-[0_0_50px] text-app-modal-xl-background rounded drop-shadow-md font-extrabold ".concat(e.draftData&&e.isActive&&!n?"bg-amber-300":"bg-app-input-border"),disabled:!e.draftData||n,onClick:function(){e.draftData&&!n&&(l(!0),(0,a.Z)((function(){var t,n;return(0,r.__generator)(this,(function(a){switch(a.label){case 0:return null!==o&&void 0!==o?[3,1]:(t=void 0,[3,3]);case 1:return n=o.updateVisualSource,[4,e.draftData.arrayBuffer()];case 2:t=n.apply(o,[a.sent(),e.draftData.type]).then((function(){return e.successCallback()})).catch((function(e){d({error:{type:"normal",value:e.message}})})),a.label=3;case 3:return[4,t];case 4:return a.sent(),l(!1),[2]}}))}))())},children:[(!e.draftData||!e.isActive)&&"Nothing to save for now",e.draftData&&e.isActive&&!n&&"Save it !",e.draftData&&e.isActive&&n&&(0,s.jsx)("img",{className:"animate-spin w-[40px] h-[40px] m-auto",src:"data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='2' x2='12' y2='6'%3E%3C/line%3E%3Cline x1='12' y1='18' x2='12' y2='22'%3E%3C/line%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'%3E%3C/line%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='6' y2='12'%3E%3C/line%3E%3Cline x1='18' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'%3E%3C/line%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'%3E%3C/line%3E%3C/svg%3E",alt:"Saving ..."})]})]})},k=n(6038),S=n(5490),L=function(e){var t=(0,i.useRef)(k.ZP.timeline({paused:!0,repeat:-1}));return(0,S.Z)((function(){var n=k.ZP.context((function(){var n=document.querySelectorAll("#giphy-svg-text > path");t.current.fromTo(n,{opacity:.9},{stagger:.3,transformOrigin:"center",ease:"expo.in",scale:1.1,opacity:1,duration:.3,fill:k.ZP.utils.wrap(["#ff5b5b","#fff152","#04ff8e","#00c5ff","#8e2eff"])},0).to(n,{stagger:.3,transformOrigin:"center",ease:"expo.out",scale:1,opacity:.9,duration:.3},.3).to(n,{fill:e.color||"#ffffff",duration:"0.2"},">")}));return function(){return n.revert()}}),[]),(0,i.useEffect)((function(){e.runAnimation?t.current.play(0):t.current.pause(0)}),[e.runAnimation]),(0,s.jsx)("svg",{className:e.className,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 163.79999999999998 35",children:(0,s.jsxs)("g",{fill:"none",fillRule:"evenodd",children:[(0,s.jsx)("path",{d:"M4 4h20v27H4z",fill:"#000"}),(0,s.jsxs)("g",{fillRule:"nonzero",children:[(0,s.jsx)("path",{d:"M0 3h4v29H0z",fill:"#04ff8e"}),(0,s.jsx)("path",{d:"M24 11h4v21h-4z",fill:"#8e2eff"}),(0,s.jsx)("path",{d:"M0 31h28v4H0z",fill:"#00c5ff"}),(0,s.jsx)("path",{d:"M0 0h16v4H0z",fill:"#fff152"}),(0,s.jsx)("path",{d:"M24 8V4h-4V0h-4v12h12V8",fill:"#ff5b5b"}),(0,s.jsx)("path",{d:"M24 16v-4h4",fill:"#551c99"})]}),(0,s.jsx)("path",{d:"M16 0v4h-4",fill:"#999131"}),(0,s.jsxs)("g",{id:"giphy-svg-text",fill:"currentColor",fillRule:"nonzero",children:[(0,s.jsx)("path",{d:"M 59.1 12 C 57.1 10.1 54.7 9.6 52.9 9.6 C 48.5 9.6 45.6 12.2 45.6 17.6 C 45.6 21.1 47.4 25.400000000000002 52.9 25.400000000000002 C 54.3 25.400000000000002 56.6 25.1 58.1 24.000000000000004 L 58.1 20.500000000000004 L 51.2 20.500000000000004 L 51.2 14.500000000000004 L 64.5 14.500000000000004 L 64.5 26.6 C 62.8 30.1 58.1 31.900000000000002 52.8 31.900000000000002 C 42.099999999999994 31.900000000000002 38 24.700000000000003 38 17.6 C 38 10.5 42.7 3.2 52.9 3.2 C 56.699999999999996 3.2 60 4 63.599999999999994 7.6000000000000005 L 59.1 12 Z"}),(0,s.jsx)("path",{d:"M 68.2 31.2 L 68.2 4 L 75.8 4 L 75.8 31.2 L 68.2 31.2 Z"}),(0,s.jsx)("path",{d:"M 88.3 23.8 L 88.3 31.1 L 80.6 31.1 L 80.6 4 L 93.8 4 C 101.1 4 104.7 8.6 104.7 13.9 C 104.7 19.5 101.1 23.8 93.8 23.8 L 88.3 23.8 Z M 88.3 17.3 L 93.8 17.3 C 95.9 17.3 97 15.7 97 14 C 97 12.2 95.9 10.6 93.8 10.6 L 88.3 10.6 L 88.3 17.3 Z"}),(0,s.jsx)("path",{d:"M 125 31.2 L 125 20.9 L 115.2 20.9 L 115.2 31.2 L 107.5 31.2 L 107.5 4 L 115.2 4 L 115.2 14.3 L 125 14.3 L 125 4 L 132.6 4 L 132.6 31.2 L 125 31.2 Z"}),(0,s.jsx)("path",{d:"M 149.2 13.3 L 155.1 4 L 163.79999999999998 4 L 163.79999999999998 4.3 L 152.99999999999997 20.3 L 152.99999999999997 31.1 L 145.29999999999998 31.1 L 145.29999999999998 20.3 L 135 4.3 L 135 4 L 143.7 4 L 149.2 13.3 Z"})]})]})})},I=function(e){var t=(0,i.useRef)(null),n=(0,i.useRef)(null),l=(0,i.useRef)(k.ZP.timeline({paused:!0,repeat:-1,repeatDelay:2.5,yoyo:!0}));return(0,S.Z)((function(){var e=k.ZP.context((function(){l.current.fromTo(n.current,{opacity:1,translateX:"0px",translateY:"0px",rotate:0},{duration:.3,translateX:"-3px",translateY:"3px",rotate:-3,opacity:.5},0).to(n.current,{duration:.3,translateX:"12px",translateY:"-12px",rotate:0,opacity:.1},.3).fromTo(t.current,{translateX:"12px",translateY:"-12px",opacity:.1,rotate:0},{duration:.3,translateX:"15px",translateY:"-15px",opacity:.5,rotate:3},0).to(t.current,{duration:.3,translateX:"0px",translateY:"0px",rotate:0,opacity:1},.3)}));return function(){return e.revert()}}),[]),(0,i.useEffect)((function(){e.runAnimation?l.current.play(0):l.current.pause(0)}),[e.runAnimation]),(0,s.jsxs)("div",{className:"".concat(e.className," relative flex justify-center"),children:[(0,s.jsxs)("svg",{ref:t,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"absolute h-full origin-center translate-x-3 -translate-y-3 opacity-10",style:{opacity:"10%",transform:"translate(12px, -12px)"},children:[(0,s.jsx)("rect",{x:"2",y:"2",width:"20",height:"20",rx:"2.18",ry:"2.18"}),(0,s.jsx)("circle",{cx:"8.113",cy:"8.099",r:"1.666"}),(0,s.jsx)("polyline",{points:"21.994 15.317 16.442 9.765 4.227 21.98"})]}),(0,s.jsxs)("svg",{ref:n,xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",className:"absolute h-full origin-center",children:[(0,s.jsx)("rect",{x:"2",y:"2",width:"20",height:"20",rx:"2.18",ry:"2.18"}),(0,s.jsx)("line",{x1:"7",y1:"2",x2:"7",y2:"22"}),(0,s.jsx)("line",{x1:"17",y1:"2",x2:"17",y2:"22"}),(0,s.jsx)("line",{x1:"2",y1:"12",x2:"22",y2:"12"}),(0,s.jsx)("line",{x1:"2",y1:"7",x2:"7",y2:"7"}),(0,s.jsx)("line",{x1:"2",y1:"17",x2:"7",y2:"17"}),(0,s.jsx)("line",{x1:"17",y1:"17",x2:"22",y2:"17"}),(0,s.jsx)("line",{x1:"17",y1:"7",x2:"22",y2:"7"})]})]})},A=function(){var e,t=(0,i.useState)(null===(e=window.navigator.onLine)||void 0===e||e),n=t[0],l=t[1];return(0,i.useEffect)((function(){var e=function(){return l(!0)},t=function(){return l(!1)};return window.addEventListener("online",e),window.addEventListener("offline",t),function(){window.removeEventListener("online",e),window.removeEventListener("offline",t)}}),[]),n},_=function(e){var t=A();return(0,s.jsxs)("div",{className:"".concat(e.className," relative p-2 flex flex-col flex-nowrap phone-landscape:flex-row"),children:[(0,s.jsxs)("button",{className:"relative text-white flex-1 rounded-t bg-app-modal-xl-lighter hover:bg-white/10 flex justify-center content-center flex-wrap gap-3",disabled:!e.isActive||!t,onClick:function(){return e.choiceSetterCallback("giphy")},children:[(0,s.jsx)(L,{className:"flex-[0_0_90%] phone-landscape:flex-[0_0_70%]",runAnimation:e.isActive&&t}),(0,s.jsx)("span",{className:"flex-[0_0_100%] font-bold text-lg",children:"from GIPHY"}),!t&&(0,s.jsx)("div",{className:"bg-app-element-disabled-faded absolute top-0 left-0 w-full h-full flex justify-center items-center overflow-hidden",children:(0,s.jsx)("span",{className:"bg-red-800 p-4 text-2xl font-extrabold -rotate-12 phone-landscape:text-lg",children:"INTERNET REQUIRED"})})]}),(0,s.jsxs)("button",{className:"text-white flex-1 rounded-t bg-app-modal-xl-lighter hover:bg-white/10 flex justify-center content-center flex-wrap gap-3",disabled:!e.isActive,onClick:function(){return e.choiceSetterCallback("local")},children:[(0,s.jsx)(I,{className:"flex-[0_0_90%] h-3/6 phone-landscape:h-2/6",runAnimation:e.isActive}),(0,s.jsx)("span",{className:"flex-[0_0_100%] font-bold text-lg",children:"from a file"})]}),(0,s.jsx)("div",{className:"absolute bg-white top-[calc(50%-2px)] h-1 w-[calc(100%-16px)] phone-landscape:top-2 phone-landscape:left-[calc(50%-2px)] phone-landscape:h-[calc(100%-16px)] phone-landscape:w-1"}),(0,s.jsx)("div",{className:"absolute top-[calc(50%-50px)] left-[calc(50%-60px)] h-[100px] w-[120px] flex justify-center items-center bg-white scale-50 phone-landscape:rotate-90",style:{clipPath:"path('M 119.568 49.82 C 119.568 53.203 112.243 56.9 109.604 59.784 C 106.965 62.668 106.389 66.142 105.149 69.073 C 103.909 72.004 102.392 74.79 100.631 77.396 C 98.87 80.003 96.864 82.432 94.648 84.648 C 92.431 86.865 90.003 88.871 87.396 90.632 C 84.789 92.393 82.004 93.91 79.073 95.149 C 76.142 96.389 73.065 97.352 69.875 98.005 C 66.685 98.657 63.383 99 60 99 C 56.617 99 53.314 98.657 50.125 98.005 C 46.935 97.352 43.858 96.389 40.927 95.149 C 37.996 93.91 35.211 92.393 32.604 90.632 C 29.997 88.871 27.569 86.865 25.352 84.648 C 23.135 82.432 21.13 80.003 19.368 77.396 C 17.607 74.79 16.091 72.004 14.851 69.073 C 13.611 66.142 12.19 62.159 9.964 59.784 C 7.815 57.491 0 53.203 0 49.82 C 0 46.438 7.761 42.405 9.964 39.856 C 12.167 37.307 13.611 33.858 14.851 30.927 C 16.091 27.996 17.608 25.211 19.369 22.604 C 21.13 19.997 23.136 17.569 25.352 15.352 C 27.569 13.136 29.997 11.13 32.604 9.369 C 35.211 7.608 37.996 6.091 40.927 4.851 C 43.858 3.611 46.935 2.648 50.125 1.996 C 53.315 1.343 56.618 1 60 1 C 63.383 1 66.686 1.343 69.876 1.996 C 73.065 2.648 76.142 3.611 79.073 4.851 C 82.004 6.091 84.79 7.608 87.396 9.369 C 90.003 11.13 92.432 13.136 94.648 15.352 C 96.865 17.569 98.871 19.997 100.632 22.604 C 102.393 25.211 103.91 27.996 105.149 30.927 C 106.389 33.858 106.965 36.819 109.604 39.856 C 112.243 42.893 119.568 46.438 119.568 49.82 Z')"},children:(0,s.jsx)("span",{className:"text-app-modal-xl-background font-extrabold text-4xl select-none phone-landscape:-rotate-90",children:"OR"})}),!e.isActive&&(0,s.jsx)("div",{className:"absolute top-0 left-0 w-full h-full rounded opacity-80 bg-app-element-disabled"})]})};!function(e){e[e.CHOICE=0]="CHOICE",e[e.SOURCE=1]="SOURCE",e[e.VALIDATION=2]="VALIDATION"}(l||(l={}));var R=[0,-100,-200],P=["Source selector","Injection","Encode video"],D={local:"File injection",giphy:"GIPHY injection"},O=[[!1,!1],[!0,!1],[!0,!1]],Z=function(e){var t=(0,i.useState)({state:d.b.LOADING}),n=t[0],v=t[1],m=(0,i.useContext)(c.R).appData,g=m.router,b=m.oldRoutes,C=(0,i.useContext)(u.B),w=C.currentSound,y=C.soundsManager,j=(0,i.useState)(),k=j[0],S=j[1],L=(0,i.useState)(l.CHOICE),I=L[0],A=L[1],Z=(0,i.useState)(),B=Z[0],G=Z[1],T=(0,i.useState)(!1),V=T[0],F=T[1];return(0,i.useEffect)((function(){var t=!1;(g.query.s||(v({state:d.b.ERROR,error:"No song id was given"}),t=!0),t)||(void 0!==(null===w||void 0===w?void 0:w.soundInfoKey)&&w.soundInfoKey===Number(g.query.s)?v({state:d.b.SUCCESS}):(null===y||void 0===y||y.resetCurrentSound(),null===y||void 0===y||y.injectInCurrentSong("sounds-info",Number(g.query.s),!0,{visualSourceData:!0}).then((function(){v({state:d.b.SUCCESS})})).catch((function(e){v({state:d.b.ERROR,error:e.message})}))));return function(){return e.setPlayerExtraClasses("")}}),[]),(0,i.useEffect)((function(){I!==l.CHOICE?e.setPlayerExtraClasses(""):e.setPlayerExtraClasses("opacity-20 hover:opacity-60")}),[I]),n.state===d.b.LOADING?(0,s.jsx)(h.Z,{}):n.state===d.b.ERROR?(0,s.jsx)(f.Z,{error:n.error||""}):(0,s.jsxs)("div",{id:"add-visual-modal-container",className:"relative w-full h-full box-border rounded-t-lg",children:[(0,s.jsx)(o.h,{title:"Edit visual - Slowed Reverber",description:"Edit the visual asset of the song"}),(0,s.jsxs)("div",{id:"add-visual-modal-container-content",className:"rounded-t-lg flex flex-col flex-nowrap w-full h-full",children:[(0,s.jsx)(p.Z,{aButtonIsPressed:V,currentPaneState:I,setAButtonIsPressed:F,nextBtnCallback:void 0,previousBtnCallback:(0,a.Z)((function(){return(0,r.__generator)(this,(function(e){return A(l.CHOICE),G(void 0),[2,!1]}))})),setPaneState:A,buttonAvailability:O[I],title:I===l.SOURCE&&k?D[k]:P[I]}),(0,s.jsxs)("div",{className:"overflow-visible flex-1 w-full h-[calc(100%-50px)] flex flex-nowrap transition-transform",style:{transform:"translateX(".concat(R[I],"%)")},children:[(0,s.jsx)(_,{className:"box-border flex-[0_0_100%] overflow-auto",isActive:I===l.CHOICE,choiceSetterCallback:function(e){S(e),A(l.SOURCE)}}),(0,s.jsxs)("div",{id:"make-video-modal-source-inject-container",className:"box-border flex-[0_0_100%] overflow-auto",children:["local"===k&&(0,s.jsx)(x.Z,{className:"w-full h-full overflow-auto",isActive:I===l.SOURCE,processCallback:function(){var e=(0,a.Z)((function(e){return(0,r.__generator)(this,(function(t){return G(e),[2]}))}));return function(t){return e.apply(this,arguments)}}(),successCallback:function(){return A(l.VALIDATION)},fileTypes:["image","video"]},I),"giphy"===k&&(0,s.jsx)(E,{className:"w-full h-full overflow-auto",processCallback:function(){var e=(0,a.Z)((function(e){return(0,r.__generator)(this,(function(t){return G(e),[2]}))}));return function(t){return e.apply(this,arguments)}}(),successCallback:function(){return A(l.VALIDATION)},isActive:I===l.SOURCE},I),!k&&(0,s.jsx)(h.Z,{})]}),(0,s.jsx)(N,{className:"box-border flex-[0_0_100%] overflow-auto",isActive:I===l.VALIDATION,draftData:B,successCallback:function(){b.length?g.back():g.push("/app/songs")}})]})]})]})}},2939:function(e,t,n){"use strict";var l=n(7568),a=n(655),r=n(5893),s=n(7294),i=n(1108);t.Z=function(e){var t=(0,s.useContext)(i.R).appData,n=t.router,o=t.oldRoutes;return(0,r.jsxs)("header",{className:"w-full flex-[0_0_50px] flex flex-nowrap select-none",children:[(0,r.jsx)("button",{className:"flex-[0_0_20%] text-white text-xs overflow-hidden ".concat(e.buttonAvailability[0]?"visible":"invisible"),disabled:e.aButtonIsPressed||!e.buttonAvailability[0],onClick:function(){e.aButtonIsPressed||(e.setAButtonIsPressed(!0),(0,l.Z)((function(){return(0,a.__generator)(this,(function(t){switch(t.label){case 0:return e.previousBtnCallback?[4,e.previousBtnCallback()]:[3,2];case 1:return t.sent()&&e.setPaneState(e.currentPaneState-1),[3,3];case 2:e.setPaneState(e.currentPaneState-1),t.label=3;case 3:return e.setAButtonIsPressed(!1),[2]}}))}))())},children:(0,r.jsxs)("span",{className:"inline-block",children:[(0,r.jsx)("span",{style:{backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'%3E%3C/line%3E%3Cpolyline points='12 19 5 12 12 5'%3E%3C/polyline%3E%3C/svg%3E\")"},className:"inline px-2 bg-no-repeat bg-left bg-contain"}),"Previous"]})}),(0,r.jsx)("h2",{className:"flex-1 flex items-center text-lg font-bold text-white overflow-hidden",children:(0,r.jsx)("span",{className:"overflow-hidden text-ellipsis whitespace-nowrap text-center w-full",children:e.title})}),(0,r.jsx)("button",{className:"flex-[0_0_20%] text-white text-xs overflow-hidden ".concat(e.buttonAvailability[1]?"visible":"invisible"),disabled:e.aButtonIsPressed||!e.buttonAvailability[1],onClick:function(){e.nextBtnCallback&&!e.aButtonIsPressed&&(e.setAButtonIsPressed(!0),(0,l.Z)((function(){return(0,a.__generator)(this,(function(t){switch(t.label){case 0:return[4,e.nextBtnCallback()];case 1:return t.sent()&&(void 0===e.lastPaneState||e.currentPaneState!==e.lastPaneState?e.setPaneState(e.currentPaneState+1):n.push(o.length?o[o.length-1].asPath:"/app/songs")),e.setAButtonIsPressed(!1),[2]}}))}))())},children:(0,r.jsxs)("span",{className:"inline-block",children:[void 0===e.lastPaneState||e.currentPaneState!==e.lastPaneState?"Next":"Save",(0,r.jsx)("span",{style:{backgroundImage:void 0===e.lastPaneState||e.currentPaneState!==e.lastPaneState?"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E\")":"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E\")"},className:"inline px-2 bg-no-repeat bg-right bg-contain"})]})})]})}},2226:function(e,t,n){"use strict";var l;n.d(t,{b:function(){return l}}),function(e){e[e.LOADING=0]="LOADING",e[e.ERROR=1]="ERROR",e[e.SUCCESS=2]="SUCCESS"}(l||(l={}))},4654:function(){}}]);