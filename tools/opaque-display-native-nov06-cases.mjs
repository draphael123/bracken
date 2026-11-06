// CLOUD ONLY. Complete native comparison assertions retained from the prior independent snapshot.
export async function compareOpaqueDisplay(spec,mode){
 const S=await import('/src/opaque-display.js'),P=await import('/src/px.js');
 const check=(v,m)=>{if(!v)throw Error(m);},A=Reflect.apply,D=Object.getOwnPropertyDescriptor,Q=Object.defineProperty,K=Reflect.ownKeys,oldRandom=Math.random,owned=new Set(),rows=[],fallbacks=[];
 const diagnostic={mode,rows,fallbacks,complete:false,nativePairs:0,globalRng:0};window.__opaqueDisplayDiagnostic=diagnostic;
 const same=(a,b)=>Object.is(a,b),HP=HTMLCanvasElement.prototype,CP=CanvasRenderingContext2D.prototype;
 const state=c=>{const g=c.getContext('2d');return{attrs:g.getContextAttributes(),matrix:g.getTransform().toString(),alpha:g.globalAlpha,composite:g.globalCompositeOperation,fill:g.fillStyle,stroke:g.strokeStyle,width:g.lineWidth,cap:g.lineCap,join:g.lineJoin,miter:g.miterLimit,dash:g.getLineDash(),offset:g.lineDashOffset,filter:g.filter,smoothing:g.imageSmoothingEnabled,quality:g.imageSmoothingQuality,shadow:[g.shadowColor,g.shadowBlur,g.shadowOffsetX,g.shadowOffsetY]};};
 function pixels(a,b,label){const x=a.getContext('2d').getImageData(0,0,a.width,a.height).data,y=b.getContext('2d').getImageData(0,0,b.width,b.height).data;check(x.length===y.length,'Pixel extent '+label);for(let i=0;i<x.length;i++)if(x[i]!==y[i])throw Error('Native pixel mismatch '+label+' byte '+i+' '+x[i]+'/'+y[i]);}
 function compare(a,b,label,forward=new WeakMap(),reverse=new WeakMap()){
  if(!a||typeof a!=='object'){check(same(a,b),'Primitive metadata '+label);return;}
  check(b&&typeof b==='object'&&Object.getPrototypeOf(a)===Object.getPrototypeOf(b),'Prototype '+label);check(a!==b,'Fresh output '+label);
  if(forward.has(a)){check(forward.get(a)===b,'Forward alias '+label);return;}check(!reverse.has(b),'Reverse alias '+label);forward.set(a,b);reverse.set(b,a);
  if(a instanceof HTMLCanvasElement){
   check(b instanceof HTMLCanvasElement&&Object.getPrototypeOf(b)===HP,'Native canvas '+label);owned.add(a);owned.add(b);check(a.width===b.width&&a.height===b.height,'Dimensions '+label);check(JSON.stringify([...a.attributes].map(x=>[x.name,x.value]))===JSON.stringify([...b.attributes].map(x=>[x.name,x.value])),'Native attributes '+label);
   check(Object.getPrototypeOf(a.getContext('2d'))===CP&&Object.getPrototypeOf(b.getContext('2d'))===CP,'Native context '+label);check(JSON.stringify(state(a))===JSON.stringify(state(b)),'Complete context state '+label);pixels(a,b,label);
   const ga=a.getContext('2d'),gb=b.getContext('2d');check(ga.isPointInPath(1,1)===gb.isPointInPath(1,1),'Current path '+label);ga.restore();gb.restore();check(JSON.stringify(state(a))===JSON.stringify(state(b)),'Context stack '+label);ga.fill();gb.fill();pixels(a,b,label+' after original path fill');diagnostic.nativePairs++;
  }
  if(ArrayBuffer.isView(a)){check(a.constructor===b.constructor&&a.length===b.length,'Typed metadata '+label);for(let i=0;i<a.length;i++)check(same(a[i],b[i]),'Typed value '+label);return;}
  const ak=K(a),bk=K(b);check(ak.length===bk.length&&ak.every((v,i)=>same(v,bk[i])),'Own keys/order '+label);
  for(const k of ak){const x=D(a,k),y=D(b,k);check(!!y&&x.enumerable===y.enumerable&&x.configurable===y.configurable&&x.writable===y.writable,'Descriptor '+label+'.'+String(k));if('value'in x)compare(x.value,y.value,label+'.'+String(k),forward,reverse);else check(x.get===y.get&&x.set===y.set,'Accessor '+label);}
 }
 function clean(){for(const c of owned)c.width=c.height=0;owned.clear();}
 let rng=0;Math.random=()=>{rng++;return .5;};
 const make=(opaque=false)=>{const c=document.createElement('canvas');c.width=37;c.height=29;const g=c.getContext('2d',{alpha:!opaque,willReadFrequently:mode==='cpu'});owned.add(c);const im=g.createImageData(c.width,c.height);for(let i=0;i<c.width*c.height;i++){im.data[i*4]=(37*i)%256;im.data[i*4+1]=(61*i+17)%256;im.data[i*4+2]=(13*i+251)%256;im.data[i*4+3]=[0,1,63,127,254,255][i%6];}g.putImageData(im,0,0);g.beginPath();g.rect(1,1,8,9);g.fillStyle='#b52737';g.strokeStyle='#279b71';g.lineWidth=3;g.setLineDash([2,1]);g.save();c.wp={p:[1,2],t:[3,4]};c.feet=9;return{c,g};};
 const original=o=>{o.g.fillStyle='#0b1410';o.g.fillRect(0,0,o.c.width,o.c.height);};
 const changed=o=>{o.g.fillStyle='#0b1410';if(!S.paintOpaqueDisplay(o.g,o.c))o.g.fillRect(0,0,o.c.width,o.c.height);};
 const configs=[
 {name:'default',eligible:true,set:()=>{}},
 {name:'fractional-rect-clip',eligible:true,set:({g})=>{g.beginPath();g.rect(2.25,3.125,22.5,17.75);g.clip();}},
 {name:'round-nonrectangular-clip',eligible:true,set:({g})=>{g.beginPath();g.arc(18.25,14.125,10.75,0,Math.PI*2);g.clip();}},
 {name:'evenodd-clip',eligible:true,set:({g})=>{g.beginPath();g.rect(1,1,34,25);g.rect(7.25,6.125,14.5,13.75);g.clip('evenodd');}},
 {name:'nested-saved-clips',eligible:true,set:({g})=>{g.beginPath();g.rect(2.25,2.25,28.5,23.5);g.clip();g.save();g.beginPath();g.arc(16.25,13.125,12.5,0,Math.PI*2);g.clip();}},
 {name:'current-path-and-stack',eligible:true,set:({g})=>{g.beginPath();g.moveTo(2,3);g.lineTo(29,4);g.lineTo(18,23);g.closePath();g.save();g.lineWidth=5;}},
 {name:'resized-native-pair',eligible:true,set:({c,g})=>{c.width=41;c.height=31;g.beginPath();g.rect(3,4,9,10);g.save();}},
 {name:'global-alpha-fallback',eligible:false,set:({g})=>g.globalAlpha=.37},
 {name:'composite-fallback',eligible:false,set:({g})=>g.globalCompositeOperation='multiply'},
 {name:'filter-fallback',eligible:false,set:({g})=>g.filter='blur(1px)'},
 {name:'shadow-fallback',eligible:false,set:({g})=>{g.shadowColor='#ff0077';g.shadowBlur=3;g.shadowOffsetX=2;}},
 {name:'translation-fallback',eligible:false,set:({g})=>g.translate(.25,.75)},
 {name:'scale-fallback',eligible:false,set:({g})=>g.scale(.75,.875)},
 {name:'rotation-fallback',eligible:false,set:({g})=>g.rotate(.2)}
 ];
 try{
 diagnostic.atBoot=S.readOpaqueDisplayStats();check(diagnostic.atBoot.bootstrapSupported,'Owned fresh native bootstrap');
 for(const opaque of[false,true])for(const config of configs){const a=make(opaque),b=make(opaque);check(S.registerOpaqueDisplay(b.g,b.c),'Actual native owner registration');config.set(a);config.set(b);const before=S.readOpaqueDisplayStats().copied;original(a);changed(b);check(S.readOpaqueDisplayStats().copied-before===(config.eligible?1:0),'Actual required activation/fallback '+config.name);compare(a.c,b.c,config.name+':alpha'+!opaque);rows.push({name:config.name,opaque,eligible:config.eligible,complete:true});clean();}
 let trace=[];const observers=[
 {name:'prototype-fillRect',target:CP,key:'fillRect',install:old=>({value:function(...args){trace.push(['fill',...args]);return A(old.value,this,args);},writable:true,configurable:true})},
 {name:'prototype-getTransform',target:CP,key:'getTransform',install:old=>({value:function(...args){trace.push(['transform']);return A(old.value,this,args);},writable:true,configurable:true})},
 {name:'prototype-composite-set',target:CP,key:'globalCompositeOperation',install:old=>({...old,set:function(v){trace.push(['composite',v]);return A(old.set,this,[v]);}})},
 {name:'prototype-alpha-get',target:CP,key:'globalAlpha',install:old=>({...old,get:function(){trace.push(['alpha']);return A(old.get,this,[]);}})}
 ];diagnostic.observers=[];
 for(const test of observers){const a=make(),b=make();S.registerOpaqueDisplay(b.g,b.c);const old=D(test.target,test.key),before=S.readOpaqueDisplayStats().copied;Q(test.target,test.key,test.install(old));try{trace=[];original(a);const first=trace;trace=[];changed(b);const second=trace;check(JSON.stringify(first)===JSON.stringify(second),'Original late observer trace '+test.name);check(S.readOpaqueDisplayStats().copied===before,'Required observer fallback');diagnostic.observers.push({name:test.name,trace:first,exact:true});}finally{Q(test.target,test.key,old);}compare(a.c,b.c,test.name);clean();}
 diagnostic.ownObservers=[];
 for(const name of['fillRect','width','globalAlpha']){const a=make(),b=make();S.registerOpaqueDisplay(b.g,b.c);const target=o=>name==='width'?o.c:o.g;const old=name==='width'?D(HP,'width'):D(CP,name);for(const o of[a,b])Q(target(o),name,{configurable:true,get(){trace.push(name);return old.get?A(old.get,this,[]):old.value;},...(old.set?{set(v){return A(old.set,this,[v]);}}:{})});const before=S.readOpaqueDisplayStats().copied;trace=[];original(a);const first=trace;trace=[];changed(b);const second=trace;check(JSON.stringify(first)===JSON.stringify(second),'Own observer property/error order '+name);check(S.readOpaqueDisplayStats().copied===before,'Own observer fallback');for(const o of[a,b])delete target(o)[name];compare(a.c,b.c,'own-'+name);diagnostic.ownObservers.push({name,trace:first,exact:true});clean();}
 diagnostic.foreign=[];
 for(const factory of[()=>({}),()=>new Proxy({},{get(){throw Error('Unexpected foreign getter');}})]){const c=factory(),g=factory();check(S.registerOpaqueDisplay(g,c)===false,'Foreign/fake registration rejected');check(S.paintOpaqueDisplay(g,c)===false,'Unknown native provenance fallback');diagnostic.foreign.push({exact:true,noForeignGetter:true});}
 P.bakeScope();const before=P.canvas(2,2)[0],a=make(),b=make();S.registerOpaqueDisplay(b.g,b.c);original(a);changed(b);const after=P.canvas(3,3)[0],own=P.bakeScopeEnd();check(own.length===2&&own[0]===before&&own[1]===after,'Original active OWN order/no extra canvases');compare(a.c,b.c,'original-active-ownership');owned.add(before);owned.add(after);clean();diagnostic.originalActiveOwnershipExact=true;
 check(rng===0,'Zero global RNG');diagnostic.globalRng=rng;diagnostic.finalStats=S.readOpaqueDisplayStats();diagnostic.complete=true;diagnostic.allExact=true;return diagnostic;
 }finally{Math.random=oldRandom;P.bakeScopeEnd();clean();}
}

