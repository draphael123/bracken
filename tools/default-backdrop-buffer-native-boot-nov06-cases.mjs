// CLOUD ONLY. New default backdrop source native graphs, original ownership and fallbacks.
export async function compareDefaultBackdrop(spec,mode){
 const C=await import('/src/default-backdrop-buffer.js'),P=await import('/src/px.js'),ART=await import('/src/art.js');
 const check=(v,m)=>{if(!v)throw Error(m);},A=Reflect.apply,D=Object.getOwnPropertyDescriptor,Q=Object.defineProperty,K=Reflect.ownKeys,oldRandom=Math.random,owned=new Set(),rows=[],fallbacks=[];
 const diagnostic={mode,rows,fallbacks,complete:false,nativePairs:0,globalRng:0};window.__defaultBackdropDiagnostic=diagnostic;
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
 function collect(v,seen=new Set()){if(!v||typeof v!=='object'||seen.has(v))return;seen.add(v);if(v instanceof HTMLCanvasElement){owned.add(v);return;}if(ArrayBuffer.isView(v))return;for(const k of K(v)){const d=D(v,k);if(d&&'value'in d)collect(d.value,seen);}}
 function clean(){for(const c of owned)c.width=c.height=0;owned.clear();}

 const atBoot=C.readDefaultBackdropStats();diagnostic.atBoot=atBoot;if(mode==='cpu')check(atBoot.softwareBuilds===4&&atBoot.eagerFallbacks===0,'Both default boot backdrops must activate '+JSON.stringify(atBoot));else check(atBoot.softwareBuilds===0&&atBoot.eagerFallbacks===4,'Original GPU fallbacks at boot '+JSON.stringify(atBoot));
 const call=(factory,args)=>Reflect.apply(factory,ART,args);
 function ownedCall(factory,args){P.bakeScope();try{const before=P.canvas(2,2)[0],value=call(factory,args),after=P.canvas(3,3)[0],scope=P.bakeScopeEnd();check(scope.length===3&&scope[0]===before&&scope[1]===value&&scope[2]===after,'Exact original active bake scope and native canvas order');return{value,scope};}finally{P.bakeScopeEnd();}}
 let rng=0;Math.random=()=>{rng++;throw Error('Global RNG forbidden');};
 try{
  for(const config of spec.cases){const before=C.readDefaultBackdropStats(),expected=ownedCall(ART[config.factory],config.args),actual=ownedCall(C[config.factory],config.args),after=C.readDefaultBackdropStats();try{compare(expected,actual,config.name);check(after.softwareBuilds-before.softwareBuilds===(mode==='cpu'?1:0),'Actual exact source backend activation '+config.name);check(after.eagerFallbacks-before.eagerFallbacks===(mode==='gpu'?1:0),'Original policy fallback '+config.name);rows.push({name:config.name,factory:config.factory,allNativePixelsContextMetadataDescriptorsAliasesExact:true,activeOwnershipAndOrderExact:true,softwareBuilds:after.softwareBuilds-before.softwareBuilds,eagerFallbacks:after.eagerFallbacks-before.eagerFallbacks,nativeCanvases:after.nativeCanvases-before.nativeCanvases});}finally{collect(expected);collect(actual);clean();}}
  const controls=[
   {name:'array-iterator-next',object:Object.getPrototypeOf([][Symbol.iterator]()),key:'next',descriptor:old=>({...old,value:function(...args){trace.push('iterator.next');return A(old.value,this,args);}})},
   {name:'document-create-accessor',object:document,key:'createElement',descriptor:old=>({configurable:true,get(){trace.push('createElement');return Document.prototype.createElement;}})},
   {name:'canvas-context-accessor',object:HP,key:'getContext',descriptor:old=>({configurable:true,get(){trace.push('getContext');return old.value;}})},
   {name:'array-map-observer',object:Array.prototype,key:'map',descriptor:old=>({...old,value:function(...args){trace.push('map');return A(old.value,this,args);}})},
   {name:'math-max-observer',object:Math,key:'max',descriptor:old=>({...old,value:function(...args){trace.push('max');return A(old.value,this,args);}})},
   {name:'number-safeinteger-observer',object:Number,key:'isSafeInteger',descriptor:old=>({...old,value:function(...args){trace.push('safeInteger');return A(old.value,this,args);}})},
   {name:'inherited-descriptor-value',object:Object.prototype,key:'value',descriptor:old=>({configurable:true,get(){trace.push('descriptor.value');return undefined;}})},
   {name:'reflect-ownkeys-observer',object:Reflect,key:'ownKeys',descriptor:old=>({...old,value:function(...args){trace.push('ownKeys');return A(old.value,this,args);}})}
  ];let trace=[];
  if(mode==='cpu')for(const control of controls){const original=D(control.object,control.key),patched=control.descriptor(original),before=C.readDefaultBackdropStats();let expected,actual,first,second;try{Q(control.object,control.key,patched);trace=[];expected=ownedCall(ART.bakeNear,[16,24,3]);first=trace.slice();trace=[];actual=ownedCall(C.bakeNear,[16,24,3]);second=trace.slice();}finally{if(original)Q(control.object,control.key,original);else delete control.object[control.key];}try{check(JSON.stringify(first)===JSON.stringify(second),'Original observer count/order '+control.name);compare(expected,actual,control.name);const after=C.readDefaultBackdropStats();check(after.softwareBuilds===before.softwareBuilds&&after.eagerFallbacks===before.eagerFallbacks+1,'Original eager observer fallback '+control.name);fallbacks.push({name:control.name,trace:first,originalObserverTraceExact:true,originalFallback:true});}finally{collect(expected);collect(actual);clean();}}
  const foreign=[
   {name:'explicit-palette',make:()=>[24,32,3,['#123456','#234567','#345678','#456789']]},
   {name:'proxy-palette',make:()=>[24,32,3,new Proxy(['#123456','#234567','#345678','#456789'],{get(t,k,r){trace.push('get:'+String(k));return Reflect.get(t,k,r);}})]},
   {name:'coercive-width',make:()=>[{valueOf(){trace.push('width');return 24;}},32,3]},
   {name:'coercive-height',make:()=>[24,{valueOf(){trace.push('height');return 32;}},3]},
   {name:'coercive-seed',make:()=>[24,32,{valueOf(){trace.push('seed');return 3;}}]},
   {name:'fractional-width',make:()=>[24.5,32,3]},
   {name:'zero-width',make:()=>[0,32,3]},
   {name:'fractional-seed',make:()=>[24,32,3.5]}
  ];diagnostic.foreignFallbacks=[];for(const config of foreign){const before=C.readDefaultBackdropStats();trace=[];const expected=ownedCall(ART.bakeNear,config.make()),first=trace.slice();trace=[];const actual=ownedCall(C.bakeNear,config.make()),second=trace.slice();try{check(JSON.stringify(first)===JSON.stringify(second),'Original input coercion/palette count/order '+config.name);compare(expected,actual,config.name);const after=C.readDefaultBackdropStats();check(after.softwareBuilds===before.softwareBuilds&&after.eagerFallbacks===before.eagerFallbacks+1,'Required original foreign/input fallback '+config.name);diagnostic.foreignFallbacks.push({name:config.name,trace:first,originalObserverTraceExact:true,originalFallback:true});}finally{collect(expected);collect(actual);clean();}}
  check(rng===0,'Zero global RNG');diagnostic.globalRng=rng;diagnostic.complete=true;diagnostic.allExact=true;diagnostic.finalStats=C.readDefaultBackdropStats();return diagnostic;
 }finally{Math.random=oldRandom;clean();P.bakeScopeEnd();}
}
