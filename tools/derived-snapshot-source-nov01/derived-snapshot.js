// Isolated private-handle primitive only. This does not replace px.flipX/whiten or the public Game sprite API.
const apply=Reflect.apply,desc=Object.getOwnPropertyDescriptor,proto=Object.getPrototypeOf,CP=CanvasRenderingContext2D.prototype,HP=HTMLCanvasElement.prototype,DP=Document.prototype;
const names=['drawImage','fillRect','save','restore','translate','scale','createPattern'],properties=['fillStyle','globalCompositeOperation','imageSmoothingEnabled'];
const methods=Object.fromEntries(names.map(k=>[k,desc(CP,k).value])),props=Object.fromEntries(properties.map(k=>[k,desc(CP,k)])),dims=Object.fromEntries(['width','height'].map(k=>[k,desc(HP,k)])),getContext=desc(HP,'getContext').value,create=desc(DP,'createElement').value;
const native=f=>typeof f==='function'&&/^function\s+(?:(?:get|set)\s+)?[\w$]+\s*\([^)]*\)\s*\{\s*\[native code\]\s*\}$/.test(Function.prototype.toString.call(f));
const initial=[apply,desc,proto,getContext,create,...Object.values(methods),...Object.values(props).flatMap(d=>[d.get,d.set]),...Object.values(dims).flatMap(d=>[d.get,d.set])].every(native);
export function makeDerivedSnapshots(reference,{cpu=true,maxPending=16384,maxPixels=33554432}={}){
 if(!Number.isSafeInteger(maxPending)||maxPending<1||maxPending>16384||!Number.isSafeInteger(maxPixels)||maxPixels<1||maxPixels>33554432)throw RangeError('Bounded private snapshots');
 const flip=reference.flipX,white=reference.whiten,records=new WeakMap();let queue=[],head=0,scratch=null,brush=null,closed=false;
 const stats={created:0,eagerFallback:0,materialized:0,evicted:0,pending:0,pendingPixels:0,maxPendingObserved:0,maxPixelsObserved:0,maximumDepth:0,explicitSourceCanvasReferences:0};
 const same=(p,k,d)=>{const n=desc(p,k);return n&&n.get===d.get&&n.set===d.set;};
 const stable=()=>initial&&!desc(document,'createElement')&&desc(DP,'createElement')?.value===create&&desc(HP,'getContext')?.value===getContext&&names.every(k=>desc(CP,k)?.value===methods[k])&&properties.every(k=>same(CP,k,props[k]))&&['width','height'].every(k=>same(HP,k,dims[k]));
 const allocate=(w,h)=>{const c=apply(create,document,['canvas']);apply(dims.width.set,c,[w]);apply(dims.height.set,c,[h]);return c;};
 const context=c=>{const g=apply(getContext,c,['2d',cpu?{willReadFrequently:true}:undefined]);apply(props.imageSmoothingEnabled.set,g,[false]);return g;};
 const get=(g,k)=>apply(props[k].get,g,[]),set=(g,k,v)=>apply(props[k].set,g,[v]);
 function paint(recipe,g){
  if(recipe.kind==='snapshot'){const old=get(g,'fillStyle');set(g,'fillStyle',recipe.pattern);apply(methods.fillRect,g,[0,0,recipe.w,recipe.h]);set(g,'fillStyle',old);return;}
  if(recipe.kind==='flip'){apply(methods.save,g,[]);apply(methods.translate,g,[recipe.w,0]);apply(methods.scale,g,[-1,1]);paint(recipe.parent,g);apply(methods.restore,g,[]);return;}
  paint(recipe.parent,g);const old=get(g,'fillStyle'),comp=get(g,'globalCompositeOperation');set(g,'globalCompositeOperation','source-in');set(g,'fillStyle',recipe.color);apply(methods.fillRect,g,[0,0,recipe.w,recipe.h]);set(g,'globalCompositeOperation',comp);set(g,'fillStyle',old);
 }
 function complete(r){if(!r.pending)return r.canvas;const g=context(r.canvas);paint(r.recipe,g);if(r.kind==='flip'){apply(methods.translate,g,[r.w,0]);apply(methods.scale,g,[-1,1]);}else{set(g,'globalCompositeOperation','source-in');set(g,'fillStyle',r.color);}r.pending=false;r.entry.active=false;stats.pending--;stats.pendingPixels-=r.w*r.h;stats.materialized++;r.recipe=null;return r.canvas;}
 const expose=r=>{r.exposed=true;return complete(r);};
 function prune(){while(head<queue.length&&!queue[head].active)head++;if(head>1024||queue.length>maxPending*2){const next=[];for(let i=head;i<queue.length;i++)if(queue[i].active)next[next.length]=queue[i];queue=next;head=0;}}
 function drain(area){prune();while(stats.pending>=maxPending||stats.pendingPixels+area>maxPixels){const e=queue[head++];if(!e||!e.active)continue;const r=e.ref.deref();if(r){complete(r);stats.evicted++;}else{e.active=false;stats.pending--;stats.pendingPixels-=e.area;}}prune();}
 function handle(r){const h={get canvas(){return expose(r);},info:()=>({pending:r.pending,exposed:r.exposed,w:r.w,h:r.h,kind:r.kind})};records.set(h,r);return Object.freeze(h);}
 function fallback(kind,source,color){const parent=records.get(source),c=parent?expose(parent):source,result=kind==='flip'?flip(c):white(c,color);stats.eagerFallback++;return handle({canvas:result,pending:false,exposed:false,w:apply(dims.width.get,result,[]),h:apply(dims.height.get,result,[]),kind});}
 function make(kind,source,color='#ffffff'){
  if(closed||!stable()||(kind==='white'&&typeof color!=='string'))return fallback(kind,source,color);
  const parent=records.get(source);let input,recipe,w,h,depth;
  if(parent&&!parent.exposed&&parent.pending&&parent.recipe.depth<8){recipe=parent.recipe;w=parent.w;h=parent.h;depth=recipe.depth+1;}else{
   input=parent?expose(parent):source;try{w=apply(dims.width.get,input,[]);h=apply(dims.height.get,input,[]);}catch{return fallback(kind,source,color);}
   if(proto(input)!==HP||desc(input,'width')||desc(input,'height')||!w||!h||w*h>262144||w*h>maxPixels)return fallback(kind,source,color);
   if(!brush){scratch=allocate(1,1);brush=context(scratch);}const pattern=apply(methods.createPattern,brush,[input,'no-repeat']);if(!pattern)return fallback(kind,source,color);recipe={kind:'snapshot',pattern,w,h,depth:0};depth=1;
  }
  if(w*h>maxPixels)return fallback(kind,source,color);drain(w*h);const canvas=allocate(w,h),r={canvas,pending:true,exposed:false,w,h,kind,color,recipe:{kind,parent:recipe,w,h,color,depth}};const entry={ref:new WeakRef(r),area:w*h,active:true};r.entry=entry;queue[queue.length]=entry;stats.created++;stats.pending++;stats.pendingPixels+=w*h;stats.maxPendingObserved=Math.max(stats.maxPendingObserved,stats.pending);stats.maxPixelsObserved=Math.max(stats.maxPixelsObserved,stats.pendingPixels);stats.maximumDepth=Math.max(stats.maximumDepth,depth);return handle(r);
 }
 return{flipX:source=>make('flip',source),whiten:(source,color='#ffffff')=>make('white',source,color),info:()=>({...stats,scratchCanvases:scratch?1:0,scratchPixels:scratch?1:0,maxPending,maxPixels,closed}),dispose(){for(let i=head;i<queue.length;i++)if(queue[i].active){const r=queue[i].ref.deref();if(r)complete(r);else{stats.pending--;stats.pendingPixels-=queue[i].area;queue[i].active=false;}}queue=[];head=0;if(scratch){apply(dims.width.set,scratch,[0]);apply(dims.height.set,scratch,[0]);}scratch=brush=null;closed=true;}};
}
