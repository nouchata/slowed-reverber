"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[180],{5180:function(e,t,i){i.r(t),i.d(t,{default:function(){return F}});const s="blue",n="green",o="pink",r="red",l="violet",h="white",a="red",c=1/2**32;const u=Math.random;const d=new class extends class{float(e=1){return this.int()*c*e}norm(e=1){return 2*(this.int()*c-.5)*e}minmax(e,t){return this.float()*(t-e)+e}minmaxInt(e,t){return t|=0,(e|=0)+(this.float()*(t-e)|0)}}{int(){return 4294967296*u()>>>0}float(e=1){return u()*e}norm(e=1){return 2*(u()-.5)*e}},f={noise:h,scale:1,peaks:2,randomAlgorithm:d,decay:2,delay:0,reverse:!1,time:2,filterType:"allpass",filterFreq:2200,filterQ:1,mix:.5,once:!1},p="1.1.2",m="2022-11-06T12:24:34.397Z",b=(e,t,i)=>{const s=new Array(e);for(let n=0;n<e;n++)s[n]=i.norm(t);return s},y=e=>e.reduce(((e,t)=>e+t),0);function*v(e,t){const i=[e[Symbol.iterator](),t[Symbol.iterator]()];for(let s=0;;s^=1){const e=i[s].next();if(e.done)return;yield e.value}}function*w(e=2,t=1,i=d){const s=b(e,t,i);s.forEach(((e,t)=>s[t]=1&t?e:-e));const n=1/e;let o=y(s);for(let r=0,l=-1;;++r>=e&&(r=0))o-=s[r],o+=s[r]=l*i.norm(t),l^=4294967294,yield l*o*n}const N=(e=2,t=1,i=d)=>v(w(e,t,i),w(e,t,i)),g=e=>{let t=32;return(e&=-e)&&t--,65535&e&&(t-=16),16711935&e&&(t-=8),252645135&e&&(t-=4),858993459&e&&(t-=2),1431655765&e&&(t-=1),t};function*R(e=8,t=1,i=d){const s=b(e,t,i),n=1/e;let o=y(s);for(let r=0;;r=r+1>>>0){const l=g(r)%e;o-=s[l],o+=s[l]=i.norm(t),yield o*n}}function*x(e=2,t=1,i=d){const s=b(e,t,i),n=1/e;let o=y(s);for(let r=0;;++r>=e&&(r=0))o-=s[r],o+=s[r]=i.norm(t),yield o*n}const k=(e=2,t=1,i=d)=>v(x(e,t,i),x(e,t,i));function*I(e=1,t=d){for(;;)yield t.norm(e)}class C{constructor(e){this.value=e}deref(){return this.value}}const G=e=>e instanceof C,A=e=>e instanceof C?e.deref():e;function E(e,t){return null!=(i=t)&&"function"===typeof i[Symbol.iterator]?function*(e,t){const i=(((e,t)=>null!=e&&"function"===typeof e.xform)(s=e)?s.xform():s)(function(e){return e?[...e]:[()=>[],e=>e,(e,t)=>(e.push(t),e)]}());var s;const n=i[1],o=i[2];for(let r of t){const e=o([],r);if(G(e))return void(yield*A(n(e.deref())));e.length&&(yield*e)}yield*A(n([]))}(E(e),t):t=>{const i=t[2];let s=e;return((e,t)=>[e[0],e[1],t])(t,((e,t)=>--s>0?i(e,t):0===s?(e=>e instanceof C?e:new C(e))(i(e,t)):(e=>new C(e))(e)))};var i}class F{constructor(e,t){this.noise=I,this.ctx=e,this.options={...f,...t},this.wetGainNode=this.ctx.createGain(),this.dryGainNode=this.ctx.createGain(),this.filterNode=this.ctx.createBiquadFilter(),this.convolverNode=this.ctx.createConvolver(),this.outputNode=this.ctx.createGain(),this.isConnected=!1,this.filterType(this.options.filterType),this.setNoise(this.options.noise),this.buildImpulse(),this.mix(this.options.mix)}connect(e){return this.isConnected&&this.options.once?(this.isConnected=!1,this.outputNode):(this.convolverNode.connect(this.filterNode),this.filterNode.connect(this.wetGainNode),e.connect(this.convolverNode),e.connect(this.dryGainNode).connect(this.outputNode),e.connect(this.wetGainNode).connect(this.outputNode),this.isConnected=!0,this.outputNode)}disconnect(e){return this.isConnected&&(this.convolverNode.disconnect(this.filterNode),this.filterNode.disconnect(this.wetGainNode)),this.isConnected=!1,e}mix(e){if(!this.inRange(e,0,1))throw new RangeError("[Reverb.js] Dry/Wet ratio must be between 0 to 1.");this.options.mix=e,this.dryGainNode.gain.value=1-this.options.mix,this.wetGainNode.gain.value=this.options.mix}time(e){if(!this.inRange(e,1,50))throw new RangeError("[Reverb.js] Time length of inpulse response must be less than 50sec.");this.options.time=e,this.buildImpulse()}decay(e){if(!this.inRange(e,0,100))throw new RangeError("[Reverb.js] Inpulse Response decay level must be less than 100.");this.options.decay=e,this.buildImpulse()}delay(e){if(!this.inRange(e,0,100))throw new RangeError("[Reverb.js] Inpulse Response delay time must be less than 100.");this.options.delay=e,this.buildImpulse()}reverse(e){this.options.reverse=e,this.buildImpulse()}filterType(e="allpass"){this.filterNode.type=this.options.filterType=e}filterFreq(e){if(!this.inRange(e,20,2e4))throw new RangeError("[Reverb.js] Filter frequrncy must be between 20 and 20000.");this.options.filterFreq=e,this.filterNode.frequency.value=this.options.filterFreq}filterQ(e){if(!this.inRange(e,0,10))throw new RangeError("[Reverb.js] Filter quality value must be between 0 and 10.");this.options.filterQ=e,this.filterNode.Q.value=this.options.filterQ}peaks(e){this.options.peaks=e,this.buildImpulse()}scale(e){this.options.scale=e,this.buildImpulse()}randomAlgorithm(e){this.options.randomAlgorithm=e,this.buildImpulse()}setNoise(e){switch(this.options.noise=e,e){case s:this.noise=w;break;case n:this.noise=N;break;case o:this.noise=R;break;case r:case a:this.noise=x;break;case l:this.noise=k;break;default:this.noise=I}this.buildImpulse()}setRandomAlgorythm(e){this.options.randomAlgorithm=e,this.buildImpulse()}inRange(e,t,i){return(e-t)*(e-i)<=0}buildImpulse(){const e=this.ctx.sampleRate,t=Math.max(e*this.options.time,1),i=e*this.options.delay,s=this.ctx.createBuffer(2,t,e),n=new Float32Array(t),o=new Float32Array(t),r=this.getNoise(t),l=this.getNoise(t);for(let h=0;h<t;h++){let e=0;h<i?(n[h]=0,o[h]=0,e=this.options.reverse?t-(h-i):h-i):e=this.options.reverse?t-h:h,n[h]=r[h]*(1-e/t)**this.options.decay,o[h]=l[h]*(1-e/t)**this.options.decay}s.getChannelData(0).set(n),s.getChannelData(1).set(o),this.convolverNode.buffer=s}getNoise(e){return[...E(e,this.noise===I?I(this.options.scale,this.options.randomAlgorithm):this.noise(this.options.peaks,this.options.scale,this.options.randomAlgorithm))]}}F.version=p,F.build=m,window.Reverb||(window.Reverb=F)}}]);