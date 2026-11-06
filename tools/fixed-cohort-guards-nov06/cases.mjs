// CLOUD ONLY. Source-specific complete native graphs and observer/owner controls.
export async function runFixedCohortNative(manifest,config){
 const urls=[],owned=new Set(),check=(v,m)=>{if(!v)throw Error(m);},assert=check,A=Reflect.apply,D=Object.getOwnPropertyDescriptor,Q=Object.defineProperty,HP=HTMLCanvasElement.prototype,CP=CanvasRenderingContext2D.prototype;
 const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function snap(root){const seen=new Map();let canvasCount=0;async function walk(x){if(!x||typeof x!=='object')return x;if(seen.has(x))return{ref:seen.get(x)};const id=seen.size;seen.set(x,id);const ds=Object.getOwnPropertyDescriptors(x),shape=Reflect.ownKeys(ds).map(k=>({key:String(k),enum:ds[k].enumerable,config:ds[k].configurable,writable:ds[k].writable,get:ds[k].get?.name,set:ds[k].set?.name,scalar:!ds[k].enumerable&&typeof ds[k].value!=='object'?ds[k].value:undefined}));if(x instanceof HTMLCanvasElement){canvasCount++;const g=x.getContext('2d'),t=g.getTransform(),state={matrix:[t.a,t.b,t.c,t.d,t.e,t.f],alpha:g.globalAlpha,composite:g.globalCompositeOperation,fill:g.fillStyle,stroke:g.strokeStyle,width:g.lineWidth,lineCap:g.lineCap,lineJoin:g.lineJoin,miter:g.miterLimit,dash:g.getLineDash(),dashOffset:g.lineDashOffset,font:g.font,align:g.textAlign,baseline:g.textBaseline,smooth:g.imageSmoothingEnabled,filter:g.filter,shadow:[g.shadowColor,g.shadowBlur,g.shadowOffsetX,g.shadowOffsetY],attrs:g.getContextAttributes()},pixels=x.width&&x.height?await hash(g.getImageData(0,0,x.width,x.height).data):'zero-size';const meta={};for(const k of Object.keys(x).sort())meta[k]=await walk(x[k]);let path='zero-size';if(x.width&&x.height){g.save();g.fillStyle='#ff00ff';g.fill();g.restore();path=await hash(g.getImageData(0,0,x.width,x.height).data);}return{id,canvas:[x.width,x.height],pixels,path,state,meta,shape,brand:Object.prototype.toString.call(x),nativePrototype:Object.getPrototypeOf(x)===HP,nativeGetContext:x.getContext===HP.getContext};}const fields={};for(const k of Object.keys(x)){assert(!ds[k].get&&!ds[k].set,'no private accessor may be published: '+k);fields[k]=await walk(x[k]);}return{id,array:Array.isArray(x),nativePrototype:Object.getPrototypeOf(x)===(Array.isArray(x)?Array.prototype:Object.prototype),shape,fields};}return{digest:await hash(new TextEncoder().encode(JSON.stringify(await walk(root)))),canvasCount};}
 const eq=(a,b,m)=>check(JSON.stringify(a)===JSON.stringify(b),m),push=Array.prototype.push,traces=[[],[]];let phase=false,side=0;const note=x=>{if(phase)A(push,traces[side],[x]);};
 async function unit(files){const sources=new Map(files.map(f=>[f.file,new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),c=>c.charCodeAt(0)))])),cache=new Map();async function url(file){if(cache.has(file))return cache.get(file);check(sources.has(file),'Unit source '+file);let text=sources.get(file);for(const m of [...text.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)]){const dep=new URL(m[2],'https://unit.invalid/'+file).pathname.slice(1);text=text.replace(m[0],'from '+JSON.stringify(await url(dep)));}const u=URL.createObjectURL(new Blob([text],{type:'text/javascript'}));urls.push(u);cache.set(file,u);return u;}return {url,load:async file=>import(await url(file))};}
 function hook(name){if(!name)return()=>{};let object,key,getter=false;const restore=[];
  if(name==='objectLean'||name==='descriptorValue'){object=Object.prototype;key=name==='objectLean'?'lean':'value';check(!D(object,key),'Original object key absent');Q(object,key,{__proto__:null,configurable:true,get(){note(name);return name==='objectLean'?0:undefined;}});return()=>delete object[key];}
  if(name==='iteratorNext'){object=Object.getPrototypeOf(A(D(Array.prototype,Symbol.iterator).value,[],[]));key='next';}
  else if(name==='arrayIterator'){object=Array.prototype;key=Symbol.iterator;}
  else if(name==='arrayFrom'){object=Array;key='from';}
  else if(name==='arrayIncludes'||name==='arrayEntries'){object=Array.prototype;key=name==='arrayIncludes'?'includes':'entries';}
  else if(name==='setHas'||name==='setAdd'){object=Set.prototype;key=name==='setHas'?'has':'add';}
  else if(name==='objectAssign'){object=Object;key='assign';}
  else if(name==='sqrt'){object=Math;key='sqrt';}
  else if(name==='arrayMap'||name==='arrayPush'){object=Array.prototype;key=name==='arrayMap'?'map':'push';}
  else if(name==='createElement'){object=Document.prototype;key=name;}
  else if(name==='getContext'){object=HP;key=name;}
  else if(name==='imageDataData'){object=ImageData.prototype;key='data';getter='get';}
  else if(name==='fillStyle'){object=CP;key=name;getter='set';}
  else if(name==='sin'){object=Math;key=name;}
  else if(name==='regexpExec'){object=RegExp.prototype;key='exec';}
  else {object=CP;key=name;}
  const d=D(object,key);check(d,'Native hook descriptor '+name);const fn=getter?d[getter]:d.value,wrapped=function(...args){note(name);return A(fn,this,args);};Q(object,key,getter?{...d,[getter]:wrapped}:{...d,value:wrapped});return()=>Q(object,key,d);
 }
 const priorUrl=location.href,random=Math.random;let rng=0,restore=null;
 try{
  if(config.gpu){const u=new URL(location.href);u.searchParams.set('gpucv','1');history.replaceState(null,'',u.href);}
  const B=await unit(manifest.baseline),C=await unit(manifest.candidate);await B.url(config.module);await C.url('src/fixed-cohort-bound-native.js');
  // Trusted isolated root first; observer cases make no claim about hostile pre-root primitives.
  await C.load('src/fixed-cohort-native-root.js');const ap=await B.load('src/px.js'),am=await B.load(config.module),bp=await C.load('src/px.js');await C.load(config.module);for(let i=0;i<manifest.fields.length;i++)await C.load(manifest.fields[i].module);
  Math.random=(...args)=>{rng++;return A(random,Math,args);};let a,b,entry,cap,ascope=null,bscope=null,ownerThrowRestored=false,originalCreationCount=0,numCaptures=1;
  if(config.stage==='before-source'){
   side=0;restore=hook(config.hook);phase=true;try{a=am[config.factory]();}finally{phase=false;restore();restore=null;}
   side=1;restore=hook(config.hook);phase=true;try{entry=await C.load('src/fixed-cohort-bound-native.js');cap=entry.capturePrivateFixedSprite(config.field);check(cap.pending===false,'Original eager initial observer fallback '+config.hook);b=cap.value;}finally{phase=false;restore();restore=null;}
   eq(traces[0],traces[1],'Original initial observer trace/order/count '+config.hook);const st=entry.readFixedCohortNativeStats();check(st.captures===0&&st.materializations===0&&st.canvases===0&&st.contexts===0&&st.eagerFallbacks===1,'No private construction on initial observer fallback');
  }else{
   entry=await C.load('src/fixed-cohort-bound-native.js');
   if(config.activeCapture){ap.bakeScope();const a0=ap.canvas(2,2)[0];a=am[config.factory]();const a1=ap.canvas(3,3)[0];ascope=ap.bakeScopeEnd();bp.bakeScope();const b0=bp.canvas(2,2)[0];cap=entry.capturePrivateFixedSprite(config.field);check(cap.pending===false&&cap.reason==='Original eager active bake ownership','Active ownership must remain original eager');b=cap.value;const b1=bp.canvas(3,3)[0];bscope=bp.bakeScopeEnd();check(ascope[0]===a0&&ascope.at(-1)===a1&&bscope[0]===b0&&bscope.at(-1)===b1,'Original active owner order');check(ascope.length===bscope.length&&ascope.length>2,'Every original created sheet retained in active owner');}
   else {ap.bakeScope();try{a=am[config.factory]();}finally{originalCreationCount=ap.bakeScopeEnd().length;}cap=entry.capturePrivateFixedSprite(config.field);
    if(config.gpu){check(cap.pending===false,'Actual fixed GPU policy must be original eager');b=cap.value;}
    else {check(cap.pending===true,'Source native capture must be admitted');const before=entry.readFixedCohortNativeStats();check(before.captures===1&&before.materializations===0&&before.canvases===0&&before.contexts===0,'No productive canvas/context before first access');
     if(config.delayedOwner){ap.bakeScope();ap.canvas(2,2);ap.canvas(3,3);ascope=ap.bakeScopeEnd();bp.bakeScope();bp.canvas(2,2);}
     side=1;restore=hook(config.hook);phase=true;try{b=cap.materialize();check(cap.materialize()===b,'Stable native pack on repeated materialize');}finally{phase=false;if(restore){restore();restore=null;}}
     check(traces[1].length===0,'No late observer in already captured original factory '+config.hook);
     if(config.delayedOwner){const marker={};let caught;try{bp.withStartupBakeOwnership(()=>{throw marker;});}catch(e){caught=e;}check(caught===marker,'Original error identity through isolated owner');bp.canvas(3,3);bscope=bp.bakeScopeEnd();check(bscope.length===2&&ascope.length===2,'Delayed startup products excluded from surrounding active owner');ownerThrowRestored=true;}
    }
   }
  }
  if(config.doubleCapture){check(cap.pending&&!config.hook,'Two source-private startup captures');ap.bakeScope();let secondA;try{secondA=am[config.factory]();}finally{originalCreationCount+=ap.bakeScopeEnd().length;}const secondCap=entry.capturePrivateFixedSprite(config.field);check(secondCap.pending,'Second private capture');const secondB=secondCap.materialize();check(secondCap.materialize()===secondB,'Second stable pack identity');a={first:a,second:secondA};b={first:b,second:secondB};numCaptures=2;}
  const sa=await snap(a),sb=await snap(b);eq(sa,sb,'Complete canonical native pixels/context/path/metadata/aliases');check(sa.canvasCount>0,'Complete native pack');if(ascope){eq(await snap({pack:a,owner:ascope}),await snap({pack:b,owner:bscope}),'Complete native active ownership graph/order/aliases');}
  const stats=entry.readFixedCohortNativeStats();if(cap.pending){check(stats.captures===numCaptures&&stats.materializations===numCaptures&&stats.canvases===originalCreationCount&&stats.contexts===originalCreationCount&&originalCreationCount>=sb.canvasCount,'Actual complete native source activation/identity counts');}else check(stats.captures===0&&stats.materializations===0&&stats.canvases===0&&stats.contexts===0,'Original eager fallback cannot use the private backend');
  check(rng===0,'Zero original and captured factory global RNG');return {name:config.name,exact:true,rng,pending:cap.pending,nativeCanvasPairs:sa.canvasCount,originalCreationCount,numCaptures,snapshot:sa,stats,callbacks:traces.map(x=>x.length),traceDigests:await Promise.all(traces.map(x=>hash(new TextEncoder().encode(JSON.stringify(x))))),ownerSheets:ascope?.length||0,ownerThrowRestored,rootPolicy:manifest.proof.nativeRootPolicy,noGameOrMaterialBenefitClaim:true};
 }finally{phase=false;if(restore)restore();Math.random=random;history.replaceState(null,'',priorUrl);for(const c of owned)c.width=c.height=0;for(const u of urls)URL.revokeObjectURL(u);}
}
