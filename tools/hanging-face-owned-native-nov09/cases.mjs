// CLOUD ONLY. New source-specific factory controls; never import/evaluate locally.
export async function runHangingFaceCase(config, side) {
 const apply=Reflect.apply,own=Object.getOwnPropertyDescriptor,define=Object.defineProperty,keys=Reflect.ownKeys;
 const HP=HTMLCanvasElement.prototype,CP=CanvasRenderingContext2D.prototype,nativeImage=CP.getImageData,nativeRect=CP.fillRect,style=own(CP,'fillStyle'),nativePush=Array.prototype.push;
 const assert=(v,m)=>{if(!v)throw Error(m);},check=assert,hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function snap(root){const seen=new Map();let canvasCount=0;async function walk(x){if(!x||typeof x!=='object')return x;if(seen.has(x))return{ref:seen.get(x)};const id=seen.size;seen.set(x,id);const ds=Object.getOwnPropertyDescriptors(x),shape=Reflect.ownKeys(ds).map(k=>({key:String(k),enum:ds[k].enumerable,config:ds[k].configurable,writable:ds[k].writable,get:ds[k].get?.name,set:ds[k].set?.name,scalar:!ds[k].enumerable&&typeof ds[k].value!=='object'?ds[k].value:undefined}));if(x instanceof HTMLCanvasElement){canvasCount++;const g=x.getContext('2d'),t=g.getTransform(),state={matrix:[t.a,t.b,t.c,t.d,t.e,t.f],alpha:g.globalAlpha,composite:g.globalCompositeOperation,fill:g.fillStyle,stroke:g.strokeStyle,width:g.lineWidth,lineCap:g.lineCap,lineJoin:g.lineJoin,miter:g.miterLimit,dash:g.getLineDash(),dashOffset:g.lineDashOffset,font:g.font,align:g.textAlign,baseline:g.textBaseline,smooth:g.imageSmoothingEnabled,filter:g.filter,shadow:[g.shadowColor,g.shadowBlur,g.shadowOffsetX,g.shadowOffsetY],attrs:g.getContextAttributes()},pixels=x.width&&x.height?await hash(g.getImageData(0,0,x.width,x.height).data):'zero-size';const meta={};for(const k of Object.keys(x).sort())meta[k]=await walk(x[k]);let path='zero-size';if(x.width&&x.height){g.save();g.fillStyle='#ff00ff';g.fill();g.restore();path=await hash(g.getImageData(0,0,x.width,x.height).data);}return{id,canvas:[x.width,x.height],pixels,path,state,meta,shape,brand:Object.prototype.toString.call(x),nativePrototype:Object.getPrototypeOf(x)===HP,nativeGetContext:x.getContext===HP.getContext};}const fields={};for(const k of Object.keys(x)){assert(!ds[k].get&&!ds[k].set,'no private accessor may be published: '+k);fields[k]=await walk(x[k]);}return{id,array:Array.isArray(x),nativePrototype:Object.getPrototypeOf(x)===(Array.isArray(x)?Array.prototype:Object.prototype),shape,fields};}return{digest:await hash(new TextEncoder().encode(JSON.stringify(await walk(root)))),canvasCount};}
 const events=[],captures=[],restores=[],rng=[],marker={marker:'original-marker'},random=Math.random;let recording=false,rngPhase='module',phase='module',error=null,stack=null,held=null,trapCount=0;
 const note=x=>{if(recording)apply(nativePush,events,[x]);};
 Math.random=function(){const value=apply(random,Math,[]);apply(nativePush,rng,[[rngPhase,value]]);return value;};restores.push(()=>{Math.random=random;});
 function alter(object,key,descriptor){const before=own(object,key);define(object,key,descriptor);restores.push(()=>{if(before)define(object,key,before);else delete object[key];});}
 const capture=(g,kind,args)=>{const pixels=apply(nativeImage,g,[0,0,g.canvas.width,g.canvas.height]).data;captures.push({g,canvas:g.canvas,kind,args,pixels,width:g.canvas.width,height:g.canvas.height,alpha:g.globalAlpha,fill:apply(style.get,g,[]),matrix:(()=>{const t=g.getTransform();return[t.a,t.b,t.c,t.d,t.e,t.f];})(),nativeReceiver:Object.getPrototypeOf(g)===CP});};
 let restoreInitial=()=>{};
 if(config.mode==='foreign-map'||config.mode==='foreign-iterator'||config.mode==='foreign-species'){
  const key=config.mode==='foreign-map'?'map':config.mode==='foreign-iterator'?Symbol.iterator:Symbol.species,object=config.mode==='foreign-species'?Array:Array.prototype,d=own(object,key);
  const wrapped=config.mode==='foreign-species'?{...d,get:function(){note(['species']);return apply(d.get,this,[]);}}:{...d,value:function(...args){note([config.mode,args.length]);return apply(d.value,this,args);}};alter(object,key,wrapped);
 }
 if(config.mode.startsWith('ctor-')){
  const [,kind,name]=config.mode.split('-'),d=own(globalThis,name),ctor=d.value;
  const value=kind==='bound'?ctor.bind(null):new Proxy(ctor,{getOwnPropertyDescriptor(){trapCount++;throw marker;},getPrototypeOf(){trapCount++;throw marker;},ownKeys(){trapCount++;throw marker;}});
  alter(globalThis,name,{...d,value});
 }
 if(config.mode==='context-underlay'){
  const d=own(HP,'getContext');alter(HP,'getContext',{...d,value:function(...args){const g=apply(d.value,this,args);if(recording&&g){note(['context-underlay',args[0]]);g.fillStyle='#f00';apply(nativeRect,g,[0,0,3,3]);g.beginPath();g.rect(1,1,3,3);g.clip();g.translate(1,0);g.globalAlpha=.5;}return g;}});
 }
 let px,hv,levels,helper,L,z,c,alias,scope=[],extra=null,eligible=false,stats=null;
 try {
  if(config.mode==='gpu')history.replaceState(null,'','?gpucv=1');
  const source=await import('/src/level.js');levels=source.LEVELS;px=await import('/src/px.js');hv=await import('/src/hanging-village.js');
  if(side==='candidate')helper=await import('/src/hanging-face-owned.js');
  phase='build';rngPhase='build';recording=true;L=levels.find(x=>x.id==='hanging').build();z=L.groundZones.find(x=>x.look===config.zone);assert(z,'Original source zone');
  recording=false;
  if(config.mode==='plain'||config.mode==='level-copy')L={...L};
  if(config.mode==='plain'||config.mode==='zone-copy')z={...z};
  if(config.mode==='proxy-level')L=new Proxy(L,{get(o,k,r){note(['get-L',String(k)]);return Reflect.get(o,k,r);},getOwnPropertyDescriptor(){note(['unexpected-L-descriptor']);throw marker;},getPrototypeOf(){note(['unexpected-L-prototype']);throw marker;}});
  if(config.mode==='proxy-zone')z=new Proxy(z,{get(o,k,r){note(['get-z',String(k)]);return Reflect.get(o,k,r);},getOwnPropertyDescriptor(){note(['unexpected-z-descriptor']);throw marker;},getPrototypeOf(){note(['unexpected-z-prototype']);throw marker;}});
  if(config.mode==='mutate-W')L.W=109;
  if(config.mode==='mutate-floor')z.floor=z.floor-1;
  if(config.mode==='replace-palette')hv.HV_LOOKS[z.look]={...hv.HV_LOOKS[z.look]};
  if(config.mode==='replace-array')hv.HV_LOOKS[z.look].r=hv.HV_LOOKS[z.look].r.slice();
  if(config.mode==='mutate-color')hv.HV_LOOKS[z.look].r[0]='#010203';
  if(config.mode==='own-map')hv.HV_LOOKS[z.look].r.map=Array.prototype.map;
  if(config.mode==='own-constructor')hv.HV_LOOKS[z.look].r.constructor=Array;
  if(config.mode==='coerce-W')L.W={valueOf(){note(['coerce-W']);return 110;}};
  if(config.mode==='getter-W'){const v=L.W;define(L,'W',{configurable:true,enumerable:true,get(){note(['getter-W']);return v;}});}
  if(['ceil-style','ceil-rect','throw-ceil'].includes(config.mode)){
   const value=z.ceilLook;define(z,'ceilLook',{enumerable:true,configurable:true,get(){note(['ceil-get']);if(config.mode==='throw-ceil')throw marker;
    if(config.mode==='ceil-style'&&!captures.length){const d=own(CP,'fillStyle');define(CP,'fillStyle',{...d,set:function(v){define(CP,'fillStyle',d);capture(this,'late-style',[v]);note(['late-style',v]);return apply(d.set,this,[v]);}});restores.push(()=>define(CP,'fillStyle',d));}
    if(config.mode==='ceil-rect'){const d=own(CP,'fillRect');define(CP,'fillRect',{...d,value:7});restores.push(()=>define(CP,'fillRect',d));}
    return value;}});
  }
  if(config.mode==='ceil-rect'||config.mode==='throw-ceil'){
   const d=own(CP,'globalAlpha');alter(CP,'globalAlpha',{...d,set:function(v){held=this.canvas;return apply(d.set,this,[v]);}});
  }
  if(config.mode==='synthetic-context-event'){
   const d=own(HP,'getContext');alter(HP,'getContext',{...d,value:function(...a){const g=apply(d.value,this,a);if(recording&&g){g.canvas.dispatchEvent(new Event('contextlost'));note(['synthetic-contextlost-event',g.isContextLost()]);}return g;}});
  }
  if(config.mode==='active-scope')px.bakeScope();
  phase='face';rngPhase='face';recording=true;
  eligible=side==='candidate'?helper.hangingFaceRowsEligible(L,z):false;
  c=hv.__fixtureFaceOf(L,z);held=c;alias=hv.__fixtureFaceOf(L,z);
  if(config.mode==='active-scope')scope=px.bakeScopeEnd();
  recording=false;
  if(config.mode==='held-retirement'){
   c.width=0;c.height=0;const returned=hv.__fixtureFaceOf(L,z);assert(returned===c,'Original held cache alias');
   rngPhase='rebuild';const fresh=levels.find(x=>x.id==='hanging').build(),zone=fresh.groundZones.find(x=>x.look===config.zone);rngPhase='face';extra=hv.__fixtureFaceOf(fresh,zone);
  }
 } catch(e){error={phase,marker:e===marker,name:e===marker?'marker':e.name,message:e===marker?'original-marker':e.message};stack=e.stack||null;recording=false;if(config.mode==='active-scope'&&px)scope=px.bakeScopeEnd();}
 finally{recording=false;for(const f of restores.reverse())f();}
 if(helper)stats=helper.ownedFaceRowStats();
 const captureRows=[];for(const x of captures)captureRows.push({kind:x.kind,args:x.args,width:x.width,height:x.height,alpha:x.alpha,fill:x.fill,matrix:x.matrix,nativeReceiver:x.nativeReceiver,pixels:await hash(x.pixels)});
 const snapshot=await snap({canvas:c||held,alias:alias||null,scope,extra,captured:captures.map(x=>x.canvas)});
 assert(!error||error.phase==='face','Original modules and level build must complete');
 assert(rng.filter(x=>x[0]==='face').length===0,'Original face consumes zero global RNG');
 if(config.mode==='active-scope'&&!error)assert(scope.length===1&&scope[0]===c,'Original OWN publication');
 if(!error)assert(alias===c,'Original faceOf cache identity');
 if(config.mode==='proxy-level'||config.mode==='proxy-zone')assert(!events.some(x=>String(x[0]).startsWith('unexpected-')),'No new Proxy descriptor/prototype probes');
 if(config.mode==='throw-ceil')assert(error?.marker,'Original thrown marker identity');else if(config.mode==='ceil-rect')assert(error?.name==='TypeError','Original noncallable native helper error');else assert(!error,'Original factory must complete');
 if(side==='candidate'){assert(eligible===config.eligible,'Expected source-specific eligibility: '+config.id);if(config.eligible)assert(stats.canvases>0&&stats.ellipses>0&&stats.pixels>stats.spans,'Actual row activation');else assert(stats.canvases===0&&stats.ellipses===0,'Original fallback without optimized activation');}
 return {id:config.id,side,comparison:{snapshot,captures:captureRows,events,rng,error,trapCount},eligible,stats,errorStack:stack,componentOnly:true};
}
