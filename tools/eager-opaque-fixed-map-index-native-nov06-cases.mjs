// CLOUD ONLY. Complete native oracle graphs for this exact eager source.
export async function compareEagerOpaqueFixed(spec,mode){
 const C=await import('/src/eager-opaque-fixed-factories.js'),P=await import('/src/px.js'),modules=new Map();
 for(const f of spec.fields)if(!modules.has(f.module))modules.set(f.module,await import('/'+f.module));
 const check=(v,m)=>{if(!v)throw Error(m);},A=Reflect.apply,D=Object.getOwnPropertyDescriptor,Q=Object.defineProperty,K=Reflect.ownKeys,oldRandom=Math.random,owned=new Set(),rows=[],fallbacks=[];
 const diagnostic={mode,rows,fallbacks,complete:false,nativePairs:0,globalRng:0};window.__eagerOpaqueDiagnostic=diagnostic;
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
 const create=D(Document.prototype,'createElement');
 function tracked(fn){const list=[];Q(Document.prototype,'createElement',{...create,value:function(...args){const c=A(create.value,this,args);if(c instanceof HTMLCanvasElement)list.push(c);return c;}});try{return{value:fn(),list};}finally{Q(Document.prototype,'createElement',create);}}
 const nativeStyle=P.withStartupBakeOwnership(()=>P.canvas(2,2));owned.add(nativeStyle[0]);nativeStyle[1].fillStyle='#123456';const retained=nativeStyle[1].fillStyle;for(let index=0;index<=255;index++){nativeStyle[1].fillStyle=index;check(nativeStyle[1].fillStyle===retained,'Original numeric map-index fillStyle must be ignored '+index);}diagnostic.numericStyleNativeControls=256;clean();
 const atBoot=C.readOpaqueFixedStats();diagnostic.atBoot=atBoot;
 if(mode==='cpu'){check(atBoot.softwareBuilds===spec.fields.length,'Actual CPU source must activate every selected factory '+JSON.stringify(atBoot));check(atBoot.eagerFallbacks===0,'Unexpected CPU fallback '+JSON.stringify(atBoot));}
 else{check(atBoot.softwareBuilds===0&&atBoot.eagerFallbacks===spec.fields.length,'Actual fixed GPU policy must use all original eager calls '+JSON.stringify(atBoot));}
 Math.random=()=>{diagnostic.globalRng++;throw Error('Unexpected global RNG');};
 try{
  for(const f of spec.fields){
   let expected,actual,markers=[];
   try{
    const fn=modules.get(f.module)[f.factory];check(typeof fn==='function','Original factory missing '+f.field);
    P.bakeScope();const before=P.canvas(2,2)[0];owned.add(before);const oracle=tracked(()=>P.withStartupBakeOwnership(()=>A(fn,modules.get(f.module),[])));expected=oracle.value;for(const c of oracle.list)owned.add(c);
    const s0=C.readOpaqueFixedStats();actual=C.bakeOpaqueFixed(f.field,()=>A(fn,modules.get(f.module),[]));const s1=C.readOpaqueFixedStats();
    const after=P.canvas(3,3)[0];owned.add(after);markers=P.bakeScopeEnd();check(markers.length===2&&markers[0]===before&&markers[1]===after,'Startup ownership/outer level restoration '+f.field);
    check(actual!==BK.SPR[f.field],'No startup pack reuse '+f.field);
    if(mode==='cpu'){check(s1.softwareBuilds===s0.softwareBuilds+1&&s1.eagerFallbacks===s0.eagerFallbacks,'Fresh software activation '+f.field);check(s1.nativeCanvases-s0.nativeCanvases===oracle.list.length,'Exact native allocation count '+f.field);}
    else check(s1.softwareBuilds===s0.softwareBuilds&&s1.eagerFallbacks===s0.eagerFallbacks+1,'Original GPU fallback '+f.field);
    const pairsBefore=diagnostic.nativePairs;compare(expected,actual,mode+':'+f.field);check(diagnostic.nativePairs>pairsBefore,'Real native outputs '+f.field);
    rows.push({field:f.field,allNativePixelsContextMetadataDescriptorsAliasesExact:true,nativePairs:diagnostic.nativePairs-pairsBefore,originalCreatedCanvases:oracle.list.length,outerLevelOwned:markers.length,softwareBuilds:s1.softwareBuilds-s0.softwareBuilds,eagerFallbacks:s1.eagerFallbacks-s0.eagerFallbacks,globalRng:diagnostic.globalRng});
   }finally{collect(expected);collect(actual);for(const c of markers)owned.add(c);P.bakeScopeEnd();clean();}
  }
  if(mode==='cpu'){
   const f=spec.fields.find(x=>x.field==='netArt');check(f,'Small original native fallback oracle');const fn=modules.get(f.module)[f.factory];
   const arrayIteratorPrototype=Object.getPrototypeOf([][Symbol.iterator]());
   const controls=[
    {name:'array-iterator-next-observer',object:arrayIteratorPrototype,key:'next',descriptor:old=>({...old,value:function(...args){controlTrace.push('iterator.next');return A(old.value,this,args);}})},
    {name:'document-create-accessor',object:document,key:'createElement',descriptor:old=>({configurable:true,get(){controlTrace.push('get createElement');return create.value;}})},
    {name:'canvas-context-accessor',object:HP,key:'getContext',descriptor:old=>({configurable:true,get(){controlTrace.push('getContext');return old.value;}})},
    {name:'array-map-observer',object:Array.prototype,key:'map',descriptor:old=>({...old,value:function(...args){controlTrace.push('map:'+this.length);return A(old.value,this,args);}})},
    {name:'math-max-observer',object:Math,key:'max',descriptor:old=>({...old,value:function(...args){controlTrace.push('max:'+args.length);return A(old.value,this,args);}})},
    {name:'map-get-observer',object:Map.prototype,key:'get',descriptor:old=>({...old,value:function(...args){controlTrace.push('Map.get');return A(old.value,this,args);}})},
    {name:'descriptor-inherited-value-getter',object:Object.prototype,key:'value',descriptor:old=>({configurable:true,get(){controlTrace.push('descriptor.value');return undefined;}})},
    {name:'reflect-ownkeys-observer',object:Reflect,key:'ownKeys',descriptor:old=>({...old,value:function(...args){controlTrace.push('Reflect.ownKeys');return A(old.value,this,args);}})}
   ];
   let controlTrace=[];
   for(const control of controls){
    let expected,actual;const old=D(control.object,control.key),patched=control.descriptor(old),s0=C.readOpaqueFixedStats();let firstTrace,secondTrace;
    try{
     Q(control.object,control.key,patched);controlTrace=[];expected=P.withStartupBakeOwnership(()=>A(fn,modules.get(f.module),[]));firstTrace=controlTrace.slice();controlTrace=[];actual=C.bakeOpaqueFixed(f.field,()=>A(fn,modules.get(f.module),[]));secondTrace=controlTrace.slice();
    }finally{if(old)Q(control.object,control.key,old);else delete control.object[control.key];}
    try{const s1=C.readOpaqueFixedStats();check(s1.softwareBuilds===s0.softwareBuilds&&s1.eagerFallbacks===s0.eagerFallbacks+1,'Required original eager observer fallback '+control.name);check(JSON.stringify(firstTrace)===JSON.stringify(secondTrace),'Original callback trace/count/order '+control.name);compare(expected,actual,'fallback:'+control.name);fallbacks.push({name:control.name,originalObserverTraceExact:true,originalEagerFallback:true,callbacks:firstTrace.length});}
    finally{collect(expected);collect(actual);clean();}
   }
  }
  check(diagnostic.globalRng===0,'Zero global RNG in fixed-source component');diagnostic.complete=true;diagnostic.allExact=true;diagnostic.finalStats=C.readOpaqueFixedStats();return diagnostic;
 }finally{Math.random=oldRandom;clean();P.bakeScopeEnd();}
}

