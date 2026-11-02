// Unintegrated PRIVATE native kernel. Public px/pack constructors are never replaced.
import {makeDerivedSnapshots,nativeSnapshotCoreAvailable} from './snapshot.js';
import {makePrivateRRecord,materializePrivateRRecord,flushPrivateRRecords,privateRRecordInfo} from './catalogue.js';
const sameValue=Object.is,apply=Reflect.apply,own=Reflect.getOwnPropertyDescriptor,keys=Reflect.ownKeys,proto=Reflect.getPrototypeOf,define=Reflect.defineProperty,set=Reflect.set,capturedGet=Reflect.get;
const get=WeakMap.prototype.get,put=WeakMap.prototype.set,has=WeakMap.prototype.has;
const lookup=(m,k)=>apply(get,m,[k]),remember=(m,k,v)=>apply(put,m,[k,v]),contains=(m,k)=>apply(has,m,[k]);
const O=Object,A=Array,OP=Object.prototype,AP=Array.prototype,FP=Function.prototype,fnText=own(FP,'toString').value;
const browser=typeof Document==='function'&&typeof CanvasRenderingContext2D==='function'&&typeof HTMLCanvasElement==='function';
const HP=browser?HTMLCanvasElement.prototype:null,CP=browser?CanvasRenderingContext2D.prototype:null,doc=browser?document:null;
const dims=browser?{width:own(HP,'width'),height:own(HP,'height')}:null;
const native=f=>typeof f==='function'&&/^function\s+(?:(?:get|set)\s+)?(?:[\w$]+|\[Symbol\.[\w$]+\])\s*\([^)]*\)\s*\{\s*\[native code\]\s*\}$/.test(apply(fnText,f,[]));
const same=(a,b)=>!!a===!!b&&(!a||sameValue(a.value,b.value)&&a.get===b.get&&a.set===b.set&&a.writable===b.writable&&a.enumerable===b.enumerable&&a.configurable===b.configurable);
const append=(a,v)=>{if(!define(a,''+a.length,{value:v,writable:true,enumerable:true,configurable:true}))throw TypeError('private list');};
const watched=[];
function watch(object,full=true,selected=[]){if(!object)return;for(let i=0;i<watched.length;i++)if(watched[i].object===object&&watched[i].full)return;const names=full?keys(object):selected,descriptors=[];for(let i=0;i<names.length;i++)append(descriptors,own(object,names[i]));append(watched,{object,full,names,descriptors,parent:proto(object)});}
for(const p of [OP,AP,FP,A,O,Reflect,Number,WeakMap,WeakMap.prototype,globalThis.WeakRef,globalThis.WeakRef?.prototype])watch(p);
watch(Math,false,['max']);
if(browser){for(let p=HP;p;p=proto(p))watch(p);for(let p=CP;p;p=proto(p))watch(p);for(let p=proto(doc);p;p=proto(p))watch(p);watch(doc,false,['createElement']);}
const bindings=['document','Document','HTMLCanvasElement','CanvasRenderingContext2D','Object','Array','Reflect','Math','Number','WeakMap','WeakRef'];watch(globalThis,false,bindings);
let pristine=native(sameValue)&&native(apply)&&native(own)&&native(keys)&&native(proto)&&native(define)&&native(fnText)&&native(get)&&native(put)&&native(has);
for(let i=0;i<watched.length;i++){const w=watched[i];for(let j=0;j<w.names.length;j++){const d=w.descriptors[j],unusedPoisonPill=w.object===FP&&(w.names[j]==='arguments'||w.names[j]==='caller');if(d&&!unusedPoisonPill){if(typeof d.value==='function'&&!native(d.value))pristine=false;if(d.get&&!native(d.get))pristine=false;if(d.set&&!native(d.set))pristine=false;}}}
const stable=()=>{if(!pristine)return false;for(let i=0;i<watched.length;i++){const w=watched[i];if(proto(w.object)!==w.parent)return false;if(w.full){const now=keys(w.object);if(now.length!==w.names.length)return false;for(let j=0;j<now.length;j++)if(now[j]!==w.names[j])return false;}for(let j=0;j<w.names.length;j++)if(!same(own(w.object,w.names[j]),w.descriptors[j]))return false;}return true;};
const defaultOwner=fn=>fn();
export function makePrivatePackBackend(reference,{cpu=true,owner=defaultOwner,maxPending=128,maxSnapshotPending=16384,maxSnapshotPixels=33554432}={}){
 if(typeof reference?.flipX!=='function'||typeof reference?.whiten!=='function'||typeof owner!=='function')throw TypeError('Private native reference contract');
 const frameArrays=new WeakMap(),outputs=new WeakMap(),packs=new WeakMap();let core=null,disabled=false,disposed=false;
 const stats={optimizedPacks:0,eagerPacks:0,derivedHandles:0,observerDrains:0,qualifiedFrames:0,completedPacks:0};
 const supported=()=>!disabled&&!disposed&&cpu===true&&browser&&typeof WeakRef==='function'&&nativeSnapshotCoreAvailable()&&stable();
 function ensureCore(){if(!core)core=makeDerivedSnapshots(reference,{cpu:true,maxPending:maxSnapshotPending,maxPixels:maxSnapshotPixels});return core;}
 function drain(){flushPrivateRRecords();stats.observerDrains++;}
 function foreign(){drain();disabled=true;}
 function frames(){const r=[];remember(frameArrays,r,true);return r;}
 function appendFrame(r,c){if(!contains(frameArrays,r))throw TypeError('Unqualified private frame array');append(r,c);return c;}
 function safeFrames(r){
  if(!contains(frameArrays,r)||proto(r)!==AP)return false;const n=own(r,'length');if(!n||!('value'in n)||!Number.isSafeInteger(n.value)||n.value>256)return false;
  const ks=keys(r);if(ks.length!==n.value+1)return false;
  for(let i=0;i<n.value;i++){const d=own(r,''+i);if(!d||!('value'in d)||!d.writable||!d.enumerable||!d.configurable)return false;const c=d.value;let w,h;try{w=apply(dims.width.get,c,[]);h=apply(dims.height.get,c,[]);}catch{return false;}if(proto(c)!==HP||own(c,'width')||own(c,'height')||own(c,'getContext')||!w||!h||w*h>262144)return false;}
  return true;
 }
 function packFreshR(r,ax,ay,w,h,originalPack,{whiteMode='shared'}={}){
  if(typeof originalPack!=='function')throw TypeError('Original eager pack fallback required');
  const eager=()=>{stats.eagerPacks++;return originalPack(r,ax,ay,w,h);};
  if(!supported()){foreign();return eager();}
  if((whiteMode!=='shared'&&whiteMode!=='independent')||!safeFrames(r)){foreign();return eager();}
  const m=ensureCore(),left=[],whiteR=[],whiteL=[],n=r.length;
  // Preserve each complete map's original evaluation order. Independent white L repeats whiten.
  for(let i=0;i<n;i++)append(left,m.flipX(r[i]));
  for(let i=0;i<n;i++)append(whiteR,m.whiten(r[i]));
  for(let i=0;i<n;i++)append(whiteL,m.flipX(whiteMode==='shared'?whiteR[i]:m.whiten(r[i])));
  const record=makePrivateRRecord({R:r,ax,ay,w,h},current=>{
   const l=[],wr=[],wl=[];for(let i=0;i<n;i++)append(l,left[i].canvas);for(let i=0;i<n;i++)append(wr,whiteR[i].canvas);for(let i=0;i<n;i++)append(wl,whiteL[i].canvas);
   stats.completedPacks++;return{R:current.R,L:l,white:{R:wr,L:wl},ax:current.ax,ay:current.ay,w:current.w,h:current.h};
  },{owner,maxPending});
  remember(packs,record,true);stats.optimizedPacks++;stats.qualifiedFrames+=n;stats.derivedHandles+=n*(whiteMode==='shared'?3:4);return record;
 }
 function createOutput(){const out={};remember(outputs,out,true);return out;}
 function assignOutput(out,key,value){
  const known=contains(outputs,out);let direct=known&&typeof key==='string'&&supported()&&proto(out)===OP;
  if(direct){const d=own(out,key),inherited=own(OP,key);direct=(!d||('value'in d&&d.writable))&&(!inherited||('value'in inherited&&inherited.writable));}
  if(!direct){foreign();value=materializePrivateRRecord(value);}
  if(!set(out,key,value,out))throw TypeError('Private output assignment');return value;
 }
 // Read the ORIGINAL receiver and callee only AFTER draining; property getters are observers too.
 // Unknown calls drain *all* outstanding records before argument evaluation or foreign callbacks.
 function callObserver(readReceiver,key,makeArgs){foreign();const receiver=readReceiver(),callee=apply(capturedGet,null,[receiver,key,receiver]),args=makeArgs();drain();return apply(callee,receiver,args);}
 function expose(value){drain();return materializePrivateRRecord(value);}
 function info(){return{...stats,supported:supported(),disabled,disposed,snapshot:core?core.info():null};}
 function dispose(){drain();if(core){const scratch=core.ownedScratch();if(scratch){apply(dims.width.set,scratch,[0]);apply(dims.height.set,scratch,[0]);}core=null;}disabled=disposed=true;}
 return{frames,appendFrame,packFreshR,createOutput,assignOutput,callObserver,expose,dispose,info};
}
