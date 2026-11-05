// CLOUD ONLY. Original native snapshot and fresh source-specific public-factory contracts.
export async function runNearCircleSymbolContracts(manifest,config){
 const urls=[],owned=new Set(),check=(v,m)=>{if(!v)throw Error(m);},assert=check,apply=Reflect.apply,own=Object.getOwnPropertyDescriptor,define=Object.defineProperty,HP=HTMLCanvasElement.prototype,CP=CanvasRenderingContext2D.prototype;
 const eq=(a,b,m)=>check(JSON.stringify(a)===JSON.stringify(b),m),hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function snap(root){const seen=new Map();let canvasCount=0;async function walk(x){if(!x||typeof x!=='object')return x;if(seen.has(x))return{ref:seen.get(x)};const id=seen.size;seen.set(x,id);const ds=Object.getOwnPropertyDescriptors(x),shape=Reflect.ownKeys(ds).map(k=>({key:String(k),enum:ds[k].enumerable,config:ds[k].configurable,writable:ds[k].writable,get:ds[k].get?.name,set:ds[k].set?.name,scalar:!ds[k].enumerable&&typeof ds[k].value!=='object'?ds[k].value:undefined}));if(x instanceof HTMLCanvasElement){canvasCount++;const g=x.getContext('2d'),t=g.getTransform(),state={matrix:[t.a,t.b,t.c,t.d,t.e,t.f],alpha:g.globalAlpha,composite:g.globalCompositeOperation,fill:g.fillStyle,stroke:g.strokeStyle,width:g.lineWidth,lineCap:g.lineCap,lineJoin:g.lineJoin,miter:g.miterLimit,dash:g.getLineDash(),dashOffset:g.lineDashOffset,font:g.font,align:g.textAlign,baseline:g.textBaseline,smooth:g.imageSmoothingEnabled,filter:g.filter,shadow:[g.shadowColor,g.shadowBlur,g.shadowOffsetX,g.shadowOffsetY],attrs:g.getContextAttributes()},pixels=x.width&&x.height?await hash(g.getImageData(0,0,x.width,x.height).data):'zero-size';const meta={};for(const k of Object.keys(x).sort())meta[k]=await walk(x[k]);let path='zero-size';if(x.width&&x.height){g.save();g.fillStyle='#ff00ff';g.fill();g.restore();path=await hash(g.getImageData(0,0,x.width,x.height).data);}return{id,canvas:[x.width,x.height],pixels,path,state,meta,shape,brand:Object.prototype.toString.call(x),nativePrototype:Object.getPrototypeOf(x)===HP,nativeGetContext:x.getContext===HP.getContext};}const fields={};for(const k of Object.keys(x)){assert(!ds[k].get&&!ds[k].set,'no private accessor may be published: '+k);fields[k]=await walk(x[k]);}return{id,array:Array.isArray(x),nativePrototype:Object.getPrototypeOf(x)===(Array.isArray(x)?Array.prototype:Object.prototype),shape,fields};}return{digest:await hash(new TextEncoder().encode(JSON.stringify(await walk(root)))),canvasCount};}
 const push=Array.prototype.push,keys=Reflect.ownKeys,random=Math.random,originalURL=location.href;let side=0,phase=false,rng=0,symbolReads=0,cleanup=null;const traces=[[],[]],captures=[[],[]],rows=[],note=x=>{if(phase)apply(push,traces[side],[x]);},keep=c=>{if(phase&&c instanceof HTMLCanvasElement&&!captures[side].includes(c))apply(push,captures[side],[c]);};window.__nearCircleDiagnostic={name:config.name,rows,complete:false};
 async function unit(files){const sources=new Map(files.map(f=>[f.file,new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),c=>c.charCodeAt(0)))])),cache=new Map();async function url(file){if(cache.has(file))return cache.get(file);check(sources.has(file),'Pinned source '+file);let text=sources.get(file);for(const m of [...text.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)]){const dep=new URL(m[2],'https://unit.invalid/'+file).pathname.slice(1);text=text.replace(m[0],'from '+JSON.stringify(await url(dep)));}const u=URL.createObjectURL(new Blob([text],{type:'text/javascript'}));apply(push,urls,[u]);cache.set(file,u);return u;}return async file=>import(await url(file));}
 function hook(name){
  if(!name)return()=>{};
  if(name==='symbolObject'||name==='symbolGetter'){const d=own(globalThis,'Symbol'),saved=d.value;check(typeof saved==='function','Original native Symbol binding');if(name==='symbolGetter')define(globalThis,'Symbol',{configurable:d.configurable,enumerable:d.enumerable,get(){symbolReads++;note('symbolBindingGetter');return saved;}});else{const fake={};define(fake,'iterator',{configurable:true,get(){symbolReads++;note('symbolIteratorGetter');return saved.iterator;}});define(globalThis,'Symbol',{...d,value:fake});}return()=>define(globalThis,'Symbol',d);}
  let object,key,accessor=false;
  if(name==='createElement'||name==='createRestore'){object=Document.prototype;key='createElement';}
  else if(name==='getContext'||name==='contextRestore'||name==='fakeContext'||name==='proxyContext'||name==='wrongOwner'){object=HP;key='getContext';}
  else if(name==='arrayPush'||name==='pushRestore'){object=Array.prototype;key='push';}
  else if(name==='pathConstructorProxy'||name==='pathConstructorBound'){object=globalThis;key='Path2D';}
  else if(name==='pathRect'||name==='pathRectGetter'){object=Path2D.prototype;key='rect';accessor=name==='pathRectGetter';}
  else {object=CP;key=name;accessor=name==='fillStyle';}
  const d=own(object,key);check(d,'Original hook descriptor '+name);let armed=true,other=null;
  if(name==='wrongOwner'||name==='proxyContext'){other=document.createElement('canvas');other.width=64;other.height=48;owned.add(other);}
  if(name==='pathConstructorProxy'){define(object,key,{...d,value:new Proxy(d.value,{construct(t,args,ctor){note('pathConstructorProxy');return Reflect.construct(t,args,ctor);}})});return()=>define(object,key,d);}
  if(name==='pathConstructorBound'){define(object,key,{...d,value:d.value.bind(null)});return()=>define(object,key,d);}
  if(name==='pathRectGetter'){define(object,key,{configurable:true,get(){note(name);return d.value;}});return()=>define(object,key,d);}
  const fn=accessor?d.set:d.value;
  const wrapped=function(...args){
   if(phase)note(name);
   if(name==='fakeContext'){const g=Object.create(null);define(g,'canvas',{configurable:true,get(){note('foreign-owner-getter');throw Error('No owner getter');}});return g;}
   if(name==='wrongOwner'){keep(other);return apply(d.value,other,args);}
   if(name==='proxyContext'){keep(other);const g=apply(d.value,other,args);return new Proxy(g,{get(t,k){note('proxyGet:'+String(k));return Reflect.get(t,k,t);},set(t,k,v){note('proxySet:'+String(k));return Reflect.set(t,k,v,t);},getOwnPropertyDescriptor(t,k){note('proxyOwn:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k);},getPrototypeOf(t){note('proxyProto');return Reflect.getPrototypeOf(t);}});}
   const result=apply(fn,this,args);if(phase){if(result instanceof HTMLCanvasElement)keep(result);if(this instanceof HTMLCanvasElement)keep(this);if(this instanceof CanvasRenderingContext2D)keep(this.canvas);}
   if(phase&&armed&&(name==='createRestore'||name==='contextRestore'||name==='pushRestore')){armed=false;define(object,key,d);const c=name==='createRestore'?result:name==='contextRestore'?this:args[0];if(c instanceof HTMLCanvasElement){keep(c);if(name!=='createRestore'){const g=apply(own(HP,'getContext').value,c,['2d']);g.beginPath();g.rect(0.25,0.25,320.5,160.5);g.clip();g.setTransform(1,0,0,1,0.25,0.5);}}}
   return result;
  };
  define(object,key,accessor?{...d,set:wrapped}:{...d,value:wrapped});return()=>define(object,key,d);
 }
 try{
  if(config.gpu)history.replaceState(null,'',new URL('?gpucv=1',originalURL));
  if(config.stage==='before-module')cleanup=hook(config.hook);
  const A=await unit(manifest.baseline),a=await A('src/art.js'),ap=await A('src/px.js'),B=await unit(manifest.candidate),b=await B('src/art.js'),bp=await B('src/px.js'),helper=await B('src/near-circle-paths.js'),palettes=await B('src/near-circle-palettes.js');
  if(cleanup){cleanup();cleanup=null;}
  check(a.bakeNear.name===b.bakeNear.name&&a.bakeNear.length===3&&b.bakeNear.length===3,'Original public baker name and arity');
  eq(Object.keys(bp).filter(k=>k!=='hasNearCircleNativeCanvas'),Object.keys(ap),'All original Px export names retained');check(bp.hasNearCircleNativeCanvas.name==='hasNearCircleNativeCanvas'&&bp.hasNearCircleNativeCanvas.length===1,'Explicit read-only predicate arity');check(!helper.beginNearCanvas&&!helper.recordNearCanvas,'No exported provenance writers');let queryTraps=0;check(bp.hasNearCircleNativeCanvas(new Proxy({}, {get(){queryTraps++;},getPrototypeOf(){queryTraps++;}}))===false&&queryTraps===0,'Readonly provenance query cannot trap or forge caller context');
  if(config.paletteInventory){for(let i=0;i<manifest.proof.paletteValues.length;i++){const x=palettes.makeNearPalette(i),y=palettes.makeNearPalette(i);check(x!==y&&palettes.isNearPalette(x)&&palettes.isNearPalette(y),'Fresh literal identity '+i);eq([...x],manifest.proof.paletteValues[i],'Literal values '+i);check(Object.getPrototypeOf(x)===Array.prototype&&Reflect.ownKeys(x).length===5,'Original plain native array shape');for(let k=0;k<4;k++){const d=own(x,''+k);check(d&&d.writable&&d.enumerable&&d.configurable&&!d.get&&!d.set,'Original literal descriptor');}check(!palettes.isNearPalette(new Proxy(x,{})),'Proxy cannot acquire literal brand');}check(palettes.makeNearPalette(-1)===null,'Only source literal selectors');}
  Math.random=(...args)=>{rng++;return apply(random,Math,args);};
  const hooks=['after-module','temporary'].includes(config.stage)?config.hook:null;
  for(const which of [0,1]){
   side=which;const mod=which?b:a,px=which?bp:ap;let out=null,error=null,scope=[],start=helper.readNearCircleStats(),local=null;
   if(config.scope!==false)px.bakeScope();
   try{
    if(hooks)local=hook(hooks);phase=true;
    let palette=config.kind==='default'||config.kind==='undefined'?undefined:which&&config.branded?palettes.makeNearPalette(config.paletteId||0):[...config.palette];
    if(config.kind==='changed'){for(let i=0;i<4;i++)palette[i]=config.changed[i];}
    if(config.kind==='frozen')Object.freeze(palette);
    if(config.kind==='getter'){for(let i=0;i<4;i++){const v=palette[i];define(palette,''+i,{configurable:true,enumerable:true,get(){note('palette:'+i);return v;}});}}
    if(config.kind==='proxy')palette=new Proxy(palette,{get(t,k,r){note('paletteProxy:'+String(k));return Reflect.get(t,k,r);},getOwnPropertyDescriptor(t,k){note('paletteOwn:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k);},getPrototypeOf(t){note('paletteProto');return Reflect.getPrototypeOf(t);}});
    if(config.kind==='iterator'||config.kind==='iteratorThrow'||config.kind==='iteratorClip'){
     const values=[...config.palette];define(palette,Symbol.iterator,{configurable:true,value:function*(){note('paletteIterator');if(config.kind==='iteratorThrow')throw Error('original palette iterator failure');if(config.kind==='iteratorClip'){const held=px.bakeScopeEnd();check(held.length===1,'Real current scope captured by original iterator');const c=held[0];keep(c);const g=c.getContext('2d');g.beginPath();g.rect(0.25,0.25,321.5,161.5);g.clip();g.setTransform(1,0,0,1,0.25,0.5);}yield* values;}});
    }
    if(config.kind==='coercingColour')palette[0]={toString(){note('paletteColourCoerce');return config.palette[0];}};
    let w=640,h=300,seed=config.seed;
    if(config.kind==='widthCoerce')w={valueOf(){note('widthCoerce');return 640;}};
    if(config.kind==='seedCoerce')seed={valueOf(){note('seedCoerce');return config.seed;}};
    if(config.kind==='otherSize'){w=320;h=180;}
    out=config.kind==='default'?mod.bakeNear(w,h,seed):mod.bakeNear(w,h,seed,palette);
    if(out instanceof HTMLCanvasElement)owned.add(out);
   }catch(e){error={name:e.name,message:e.message};}
   finally{phase=false;if(local)local();if(config.scope!==false)scope=px.bakeScopeEnd();}
   for(const c of [...scope,...captures[which]])if(c instanceof HTMLCanvasElement)owned.add(c);
   const stats=helper.readNearCircleStats(),delta=Object.fromEntries(Object.keys(stats).filter(k=>typeof stats[k]==='number').map(k=>[k,stats[k]-start[k]]));
   const graph={output:out,scope,captured:captures[which]};const native=await snap(graph);const pathBefore=out?await hash(out.getContext('2d').getImageData(0,0,out.width,out.height).data):null;
   if(out){const g=out.getContext('2d');g.strokeStyle='#37a5e4';g.lineWidth=3;g.stroke();}
   const currentPath=await snap(graph);apply(push,rows,[{which,error,native,currentPath,pathBefore,trace:traces[which],delta}]);window.__nearCircleDiagnostic={name:config.name,rows,stats:helper.readNearCircleStats(),complete:false};
  }
  eq(rows[0].error,rows[1].error,'Original error name/message');check((!!rows[0].error)===!!config.expectError,'Expected error outcome');eq(rows[0].trace,rows[1].trace,'Original foreign callbacks/traps');eq(rows[0].native,rows[1].native,'Complete original native pixels/context/metadata/aliases/scopes');eq(rows[0].currentPath,rows[1].currentPath,'Current-path and later native output mutation');
  const active=rows[1].delta.curves;check(config.expectOptimized?active>0&&rows[1].delta.pathFills>0:active===0,'Actual CPU activation or original fallback '+config.name);check(rng===0,'No global RNG');check(symbolReads===0,'No initial or late foreign Symbol binding/iterator getter read');const result={name:config.name,exact:true,rng,symbolReads,rows,paletteInventory:config.paletteInventory?manifest.proof.paletteValues.length:0,stats:helper.readNearCircleStats()};window.__nearCircleDiagnostic={...result,complete:true};return result;
 }finally{phase=false;if(cleanup)cleanup();Math.random=random;history.replaceState(null,'',originalURL);for(const c of owned)c.width=c.height=0;for(const u of urls)URL.revokeObjectURL(u);check(typeof window.__brackenLabCollect==='function','Original native collection bridge');await window.__brackenLabCollect();}
}
