// CLOUD ONLY. Full original native snapshot and observer hook bodies unchanged.
export async function runMinecartPixelCase(manifest,config){
 const urls=[],owned=new Set(),check=(v,m)=>{if(!v)throw Error(m);},assert=check,apply=Reflect.apply,own=Object.getOwnPropertyDescriptor,define=Object.defineProperty,HP=HTMLCanvasElement.prototype,CP=CanvasRenderingContext2D.prototype;
 const eq=(a,b,m)=>check(JSON.stringify(a)===JSON.stringify(b),m),hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function snap(root){const seen=new Map();let canvasCount=0;async function walk(x){if(!x||typeof x!=='object')return x;if(seen.has(x))return{ref:seen.get(x)};const id=seen.size;seen.set(x,id);const ds=Object.getOwnPropertyDescriptors(x),shape=Reflect.ownKeys(ds).map(k=>({key:String(k),enum:ds[k].enumerable,config:ds[k].configurable,writable:ds[k].writable,get:ds[k].get?.name,set:ds[k].set?.name,scalar:!ds[k].enumerable&&typeof ds[k].value!=='object'?ds[k].value:undefined}));if(x instanceof HTMLCanvasElement){canvasCount++;const g=x.getContext('2d'),t=g.getTransform(),state={matrix:[t.a,t.b,t.c,t.d,t.e,t.f],alpha:g.globalAlpha,composite:g.globalCompositeOperation,fill:g.fillStyle,stroke:g.strokeStyle,width:g.lineWidth,lineCap:g.lineCap,lineJoin:g.lineJoin,miter:g.miterLimit,dash:g.getLineDash(),dashOffset:g.lineDashOffset,font:g.font,align:g.textAlign,baseline:g.textBaseline,smooth:g.imageSmoothingEnabled,filter:g.filter,shadow:[g.shadowColor,g.shadowBlur,g.shadowOffsetX,g.shadowOffsetY],attrs:g.getContextAttributes()},pixels=x.width&&x.height?await hash(g.getImageData(0,0,x.width,x.height).data):'zero-size';const meta={};for(const k of Object.keys(x).sort())meta[k]=await walk(x[k]);let path='zero-size';if(x.width&&x.height){g.save();g.fillStyle='#ff00ff';g.fill();g.restore();path=await hash(g.getImageData(0,0,x.width,x.height).data);}return{id,canvas:[x.width,x.height],pixels,path,state,meta,shape,brand:Object.prototype.toString.call(x),nativePrototype:Object.getPrototypeOf(x)===HP,nativeGetContext:x.getContext===HP.getContext};}const fields={};for(const k of Object.keys(x)){assert(!ds[k].get&&!ds[k].set,'no private accessor may be published: '+k);fields[k]=await walk(x[k]);}return{id,array:Array.isArray(x),nativePrototype:Object.getPrototypeOf(x)===(Array.isArray(x)?Array.prototype:Object.prototype),shape,fields};}return{digest:await hash(new TextEncoder().encode(JSON.stringify(await walk(root)))),canvasCount};}
 const push=Array.prototype.push,has=Map.prototype.has,clear=Map.prototype.clear,iter=Set.prototype[Symbol.iterator],isArray=Array.isArray;let phase=false,side=0,cleanup=null;const traces=[[],[]],captured=[[],[]],arrays=[null,null],maps=[[],[]],sets=[null,null],note=x=>{if(phase)apply(push,traces[side],[x]);},save=c=>{if(phase&&c instanceof HTMLCanvasElement)apply(push,captured[side],[c]);};
 function hook(name){if(!name)return()=>{};if(name.startsWith('word-')){const kind=name.slice(5),U=Uint32Array;let object,key,d;
 if(kind==='constructor'||kind==='proxy'||kind==='bound'){object=globalThis;key='Uint32Array';d=own(object,key);const value=kind==='proxy'?new Proxy(U,{construct(t,args,n){note(name);return Reflect.construct(t,args,n);}}):kind==='bound'?U.bind(null):function Uint32Array(...args){note(name);return Reflect.construct(U,args);};define(object,key,{...d,value});}
 else if(kind==='prototype'){object=U.prototype;key='__wordObserver';check(!own(object,key),'No original word observer');define(object,key,{__proto__:null,configurable:true,get(){note(name);return 1;}});return()=>delete object[key];}
 else{object=Object.getPrototypeOf(U.prototype);key=kind==='buffer'?'buffer':'byteOffset';d=own(object,key);define(object,key,{...d,get:function(){note(name);return apply(d.get,this,[]);}});}
 return()=>define(object,key,d);
 }if(name.startsWith('scalar-')){const key=name.slice(7),values={alpha:false,colorSpace:'display-p3',colorType:'float16',pixelFormat:'rgba-float16',desynchronized:true,willReadFrequently:false};check(!own(Object.prototype,key),'No initial scalar dictionary field');define(Object.prototype,key,{__proto__:null,value:values[key],writable:true,enumerable:false,configurable:true});return()=>delete Object.prototype[key];}if(name==='imageDataData'){const o=ImageData.prototype,d=own(o,'data');define(o,'data',{...d,get:function(){note(name);return apply(d.get,this,[]);}});return()=>define(o,'data',d);}if(name==='typedArrayPrototype'){const o=Uint8ClampedArray.prototype;check(!own(o,'__rgbaObserver'),'Original typed-array observer key absent');define(o,'__rgbaObserver',{configurable:true,get(){note(name);return 1;}});return()=>delete o.__rgbaObserver;}if(name.startsWith('descriptor-')){const key=name.slice(11);check(!own(Object.prototype,key),'Original descriptor poison field');define(Object.prototype,key,{__proto__:null,configurable:true,get(){note(name);return undefined;}});return()=>{delete Object.prototype[key];};}let object,key,getter=false;if(name==='hasOwn'){object=Object;key='hasOwn';}else if(name==='createElement'){object=Document.prototype;key=name;}else if(name==='getContext'||name==='proxyContext'){object=HP;key='getContext';}else if(name==='arrayPush'){object=Array.prototype;key='push';}else if(name==='mapGet'||name==='mapHas'||name==='mapSet'||name==='mapClear'){object=Map.prototype;key={mapGet:'get',mapHas:'has',mapSet:'set',mapClear:'clear'}[name];}else if(name==='setNext'){object=Object.getPrototypeOf(new Set()[Symbol.iterator]());key='next';}else if(name==='setAdd'||name==='setIterator'){object=Set.prototype;key=name==='setAdd'?'add':Symbol.iterator;}else if(name==='weakMapSet'){object=WeakMap.prototype;key='set';}else if(name==='reflectOwn'){object=Reflect;key='getOwnPropertyDescriptor';}else if(name==='functionText'){object=Function.prototype;key='toString';}else if(name==='imul'){object=Math;key=name;}else if(name==='dictionary'){object=Object.prototype;key='colorSpace';check(!own(object,key),'Original dictionary');define(object,key,{configurable:true,get(){note(name);return'srgb';}});return()=>delete object[key];}else if(name==='boundRect'){object=CP;key='fillRect';const d=own(object,key),c=document.createElement('canvas');c.width=c.height=16;owned.add(c);define(object,key,{...d,value:d.value.bind(c.getContext('2d'))});return()=>define(object,key,d);}else{object=CP;key=name;getter=name==='fillStyle';}const d=own(object,key);check(d,'Hook '+name);const original=getter?d.set:d.value,wrapped=function(...args){note(name);if(this instanceof HTMLCanvasElement)save(this);if(this instanceof CanvasRenderingContext2D)save(this.canvas);const v=apply(original,this,args);if(v instanceof HTMLCanvasElement)save(v);return v;};define(object,key,getter?{...d,set:wrapped}:{...d,value:name==='proxyContext'?new Proxy(original,{apply(t,r,a){return apply(wrapped,r,a);}}):wrapped});return()=>define(object,key,d);} async function unit(files){
  const sources=new Map(files.map(f=>[f.file,new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),c=>c.charCodeAt(0)))])),cache=new Map();
  async function url(file){if(cache.has(file))return cache.get(file);check(sources.has(file),'Unit source '+file);let text=sources.get(file);
   if(config.gpu&&file==='src/px.js'){const from="const CPU_BAKE = typeof location === 'undefined' || !/[?&]gpucv=1/.test(location.search);";check(text.includes(from),'Original GPU policy source');text=text.replace(from,'const CPU_BAKE = false;');}
   for(const m of [...text.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)]){const dep=new URL(m[2],'https://unit.invalid/'+file).pathname.slice(1);text=text.replace(m[0],'from '+JSON.stringify(await url(dep)));}
   if(file==='src/redraw/minecart_tiles.js')text+='\nexport const __test={floorTile,wallTile,ceilTile,massTile,slopeTile,once,KIT,MP,memo};\n';
   const u=URL.createObjectURL(new Blob([text],{type:'text/javascript'}));urls.push(u);cache.set(file,u);return u;
  }return async file=>import(await url(file));
 }
 const descriptor=own,proto=Object.getPrototypeOf,random=Math.random;let rng=0,A,B,a,b,ap,bp,as,bs,helper;
 const rows=[],restores=[],resultsCache=[];
 function installHook(){if(!config.namespace)return hook(config.hook);const key=config.namespace,d=own(globalThis,key),get=Reflect.get;check(d&&'value'in d,'Original namespace descriptor');define(globalThis,key,{...d,value:new Proxy(d.value,{get(t,k,r){note('namespace-'+key+':'+String(k));return apply(get,Reflect,[t,k,r]);}})});return()=>define(globalThis,key,d);}
 function construct(mod,input){const[kind,x,y,zone,e=0,d=1,t=20]=input;
  if(config.public){const T=manifest.T,at=(xx,yy)=>kind==='floor'&&(yy===y-1||yy===y&&xx===x-1&&(e&1)||yy===y&&xx===x+1&&(e&2))||kind==='wall'&&yy===y&&xx===x+((e&1)?-1:1)||kind==='ceiling'&&yy===y+1&&xx===x||kind==='mass'&&yy===y&&xx===x+d?T.AIR:T.SOLID;return mod.mineTile(kind==='slope'?t:T.SOLID,x,y,at,T,{});}
  if(kind==='floor')return mod.__test.floorTile(x,y,e&1?1:0,e&2?1:0,zone);
  if(kind==='wall')return mod.__test.wallTile(x,y,e&1?1:0,e&2?1:0,zone);
  if(kind==='ceiling')return mod.__test.ceilTile(x,y,zone);
  if(kind==='mass')return mod.__test.massTile(x,y,d,zone);
  return mod.__test.slopeTile(t,x,y,zone,0);
 }
 function mutate(mod,slopes,input){const local=[],saveD=(o,k)=>{const d=descriptor(o,k);local.push(()=>d?define(o,k,d):delete o[k]);return d;};
  if(config.palette==='gp-getter'||config.palette==='gp-throw'){const d=saveD(mod.GP,'slag');delete mod.GP.slag;define(mod.GP,'slag',{configurable:true,enumerable:true,get(){note('gp-slag-get');if(config.palette==='gp-throw')throw new TypeError('mine palette source throw');return d.value;}});}
  if(config.palette==='mp-getter'){for(const k of ['i1','i2','i4','i5']){const d=saveD(mod.__test.MP,k);delete mod.__test.MP[k];define(mod.__test.MP,k,{configurable:true,enumerable:true,get(){note('mp-'+k);return d.value;}});}}
  if(config.palette==='gp-coerce'){const d=saveD(mod.GP,'slag');mod.GP.slag={toString(){note('gp-colour-coerce');return d.value;}};}
  if(config.palette==='gp-change'){saveD(mod.GP,'slag');mod.GP.slag='#13579b';}
  if(config.palette==='mp-change'){saveD(mod.__test.MP,'cu1');mod.__test.MP.cu1='#13579b';}
  if(config.palette==='gp-prototype'){const p=proto(mod.GP);local.push(()=>Object.setPrototypeOf(mod.GP,p));Object.setPrototypeOf(mod.GP,new Proxy(p,{get(t,k,r){note('gp-prototype:'+String(k));return Reflect.get(t,k,r);}}));}
  if(config.palette==='kit-proxy'){const z=input[3],d=saveD(mod.__test.KIT,''+z);mod.__test.KIT[z]=new Proxy(d.value,{get(t,k,r){note('kit-proxy:'+String(k));return Reflect.get(t,k,r);}});}
  if(config.palette==='kit-transient'){const z=input[3],d=saveD(mod.__test.KIT,''+z);define(mod.__test.KIT,''+z,{configurable:true,enumerable:true,get(){note('kit-transient');define(mod.__test.KIT,''+z,d);return new Proxy(d.value,{get(t,k,r){note('captured-kit-proxy:'+String(k));return Reflect.get(t,k,r);}});}});}
  if(config.palette==='ramp-getter'){const ramp=mod.__test.KIT[input[3]].R[0],d=saveD(ramp,'1');delete ramp[1];define(ramp,'1',{configurable:true,enumerable:true,get(){note('ramp-getter');return d.value;}});}
  if(config.palette==='slope-change'){saveD(slopes.SLOPE,'R1');slopes.SLOPE.R1=29;}
  if(config.memoObserver){const memo=mod.__test.memo,md=saveD(memo,'set'),set=Map.prototype.set,rectD=own(CP,'fillRect');local.push(()=>define(CP,'fillRect',rectD));
   const observe=function(k,c){note('own-memo-set:'+k);save(c);note('own-memo-bytes:'+Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data).join(','));return apply(set,this,[k,c]);};
   if(config.memoObserver==='getter')define(memo,'set',{configurable:true,get(){note('own-memo-set-get');return observe;}});
   else define(memo,'set',{configurable:true,writable:true,value:observe});
   if(config.memoObserver==='late-paint'){const hd=saveD(memo,'has'),has=Map.prototype.has;define(memo,'has',{configurable:true,writable:true,value:function(k){note('own-memo-has');define(CP,'fillRect',{...rectD,value:function(...args){note('late-memo-paint');save(this.canvas);return apply(rectD.value,this,args);}});return apply(has,this,[k]);}});}
  }
  if(config.exotic==='x-object'){const x=input[1];input[1]={valueOf(){note('x-coerce');return x;}};}
  if(config.exotic==='zone-object'){const z=input[3];input[3]={toString(){note('zone-string');return ''+z;},valueOf(){note('zone-number');return z;}};}
  if(config.exotic==='depth-object'){const d=input[5];input[5]={valueOf(){note('depth-coerce');return d;}};}
  if(config.exotic==='negative-zero')input[1]=-0;
  return()=>{for(const f of local.reverse())f();};
 }
 try{
  if(config.stage==='before-root')cleanup=installHook();
  A=await unit(manifest.baseline);B=await unit(manifest.candidate);
  if(config.stage==='after-root'){await B('src/minecart-pixel-root.js');cleanup=installHook();}
  a=await A('src/redraw/minecart_tiles.js');ap=await A('src/px.js');as=await A('src/slopes.js');
  b=await B('src/redraw/minecart_tiles.js');bp=await B('src/px.js');bs=await B('src/slopes.js');helper=await B('src/minecart-pixel-builders.js');
  if(config.stage==='after-helper')cleanup=installHook();
  Math.random=(...args)=>{rng++;return apply(random,Math,args);};
  for(const raw of config.inputs){const results=[];traces[0].length=traces[1].length=captured[0].length=captured[1].length=0;
   for(side=0;side<2;side++){
    const mod=side?b:a,p=side?bp:ap,s=side?bs:as,input=[...raw],restore=mutate(mod,s,input);let c,error,scope=[];
    if(config.scope){p.bakeScope();if(config.scope==='nested')p.bakeScope();}
    phase=true;try{c=construct(mod,input);}catch(e){error={name:e.name,message:e.message};}finally{phase=false;if(config.scope)scope=p.bakeScopeEnd();restore();}
    if(c)owned.add(c);for(const o of scope)owned.add(o);
    results.push({c,error,scope,graph:await snap({output:c,scope,captured:captured[side]})});
   }
   eq(results[0].error,results[1].error,'Original exact exception and evaluation order');eq(results[0].graph,results[1].graph,'Full original native pixels/context/path/metadata/alias graph');eq(traces[0],traces[1],'Original native/palette/coercion observer trace');
   if(config.scope)check(results[0].scope.length===results[1].scope.length,'All original active owner allocations and aliases,including cache hits');
   rows.push({input:raw,error:results[0].error||null,canvasCount:results[0].graph.canvasCount,digest:results[0].graph.digest,traceLength:traces[0].length,scopeCanvases:results[0].scope.length});
  }
  if(config.cache){
   for(side=0;side<2;side++){const mod=side?b:a,first=config.inputs[0],c=construct(mod,first),g=c.getContext('2d');g.fillStyle='#ff00ff';g.fillRect(0,0,2,2);let x=first[1]+1;const old=(await(side?B:A)('src/redraw/minecart_backdrop.js')).hash(first[1],5)%6;while((await(side?B:A)('src/redraw/minecart_backdrop.js')).hash(x,5)%6!==old)x++;const next=[...first];next[1]=x;next[2]+=2;check(construct(mod,first)===c&&construct(mod,next)===c,'Strong original memo retains mutation,first seed and cache-collision identity');resultsCache[side]=await snap({first:c,repeated:construct(mod,first),collision:construct(mod,next)});}
   eq(resultsCache[0],resultsCache[1],'Mutable native cache alias graph exact');
  }
  const stats=helper.readMinecartPixelStats();check(stats.nativeAllocations===stats.optimized,'One fresh original native output for each admitted complete constructor');if(config.expectOptimized===true)check(stats.optimized>0,'Actual source-specific complete constructor activation');if(config.expectOptimized===false)check(stats.optimized===0,'Every original unsupported/observer/ownership/late palette fallback');if(config.scope)check(rows.reduce((n,x)=>n+x.scopeCanvases,0)>0,'Active original owner scope exercised real allocations');check(rng===0,'No global RNG');
  return{name:config.name,exact:true,rows,stats,rng,fullNativePairs:rows.filter(x=>!x.error).length,errorsCompared:rows.filter(x=>x.error).length,cacheVerified:!!config.cache};
 }finally{phase=false;Math.random=random;if(cleanup)cleanup();for(const f of restores.reverse())f();for(const u of urls)URL.revokeObjectURL(u);for(const c of owned){c.width=0;c.height=0;}}

}
