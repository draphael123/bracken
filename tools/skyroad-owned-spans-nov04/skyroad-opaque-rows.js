// Private fresh Skyroad mass-tile painter. Native identities and original fallbacks remain.
const sameValue=Object.is,apply=Reflect.apply,own=Reflect.getOwnPropertyDescriptor,keys=Reflect.ownKeys,proto=Reflect.getPrototypeOf,define=Reflect.defineProperty,set=Reflect.set,capturedGet=Reflect.get;
const get=WeakMap.prototype.get,put=WeakMap.prototype.set,has=WeakMap.prototype.has;
const describe=own(Object,'getOwnPropertyDescriptors')?.value;
const lookup=(m,k)=>apply(get,m,[k]),remember=(m,k,v)=>apply(put,m,[k,v]),contains=(m,k)=>apply(has,m,[k]);
const O=Object,A=Array,OP=Object.prototype,AP=Array.prototype,FP=Function.prototype,fnText=own(FP,'toString').value;
const native=f=>{
  if(typeof f!=='function')return false;
  const text=apply(fnText,f,[]);
  const part=(at,word)=>{if(at+word.length>text.length)return false;for(let n=0;n<word.length;n++)if(text[at+n]!==word[n])return false;return true;};
  const word=c=>c!==undefined&&(c>='a'&&c<='z'||c>='A'&&c<='Z'||c>='0'&&c<='9'||c==='_'||c==='$');
  if(!part(0,'function '))return false;
  let at=9;
  if(part(at,'get ')||part(at,'set '))at+=4;
  if(part(at,'[Symbol.')){at+=8;const start=at;while(at<text.length&&word(text[at]))at++;if(at===start||text[at]!==']')return false;at++;}
  else{const start=at;while(at<text.length&&word(text[at]))at++;if(at===start)return false;}
  const end='() { [native code] }';
  return at+end.length===text.length&&part(at,end);
};
const realm = globalThis;
const intrinsicBinding = key => { const d = own(realm, key); if (!d) return undefined; if (d.get) return native(d.get) ? apply(d.get, realm, []) : undefined; return d.value; };
const documentType = intrinsicBinding('Document'), canvasType = intrinsicBinding('HTMLCanvasElement'), contextType = intrinsicBinding('CanvasRenderingContext2D');
const hostDocument = intrinsicBinding('document');
const browser = native(documentType) && native(canvasType) && native(contextType) && !!hostDocument && !!own(canvasType,'prototype')?.value && !!own(contextType,'prototype')?.value;
const HP=browser?canvasType.prototype:null,CP=browser?contextType.prototype:null,doc=browser?hostDocument:null;
const dims=browser?{width:own(HP,'width'),height:own(HP,'height')}:null;

const same=(a,b)=>!!a===!!b&&(!a||sameValue(a.value,b.value)&&a.get===b.get&&a.set===b.set&&a.writable===b.writable&&a.enumerable===b.enumerable&&a.configurable===b.configurable);
const append=(a,v)=>{if(!define(a,''+a.length,{value:v,writable:true,enumerable:true,configurable:true}))throw TypeError('private list');};
const watched=[];
function watch(object,full=true,selected=[]){if(!object)return;for(let i=0;i<watched.length;i++)if(watched[i].object===object&&watched[i].full)return;const names=full?keys(object):selected,descriptors=[];for(let i=0;i<names.length;i++)append(descriptors,own(object,names[i]));append(watched,{object,full,names,descriptors,parent:proto(object)});}
for(const p of [OP,AP,FP,A,O,Reflect,Number,WeakMap,WeakMap.prototype,globalThis.WeakRef,globalThis.WeakRef?.prototype,Map,Map.prototype,Set,Set.prototype,String,String.prototype,Number.prototype,RegExp,RegExp.prototype])watch(p);
watch(Math,false,['max','min','round','imul']);
if(browser){for(let p=HP;p;p=proto(p))watch(p);for(let p=CP;p;p=proto(p))watch(p);for(let p=proto(doc);p;p=proto(p))watch(p);watch(doc,false,['createElement']);}
const bindings=['document','Document','HTMLCanvasElement','CanvasRenderingContext2D','Object','Array','Reflect','Math','Number','WeakMap','WeakRef','Map','Set','String','RegExp','parseInt'];watch(globalThis,false,bindings);
const nativeDescriptor=(object,name,kind,f)=>native(f)||(object===RegExp&&(kind==='get'||kind==='set')&&["$&","$+","$`","$'"].includes(name)&&apply(fnText,f,[])==='function '+kind+' '+name+'() { [native code] }');
let pristine=native(sameValue)&&native(apply)&&native(own)&&native(keys)&&native(proto)&&native(define)&&native(fnText)&&native(get)&&native(put)&&native(has);
for(let i=0;i<watched.length;i++){const w=watched[i];for(let j=0;j<w.names.length;j++){const d=w.descriptors[j],unusedPoisonPill=w.object===FP&&(w.names[j]==='arguments'||w.names[j]==='caller');if(d&&!unusedPoisonPill){if(typeof d.value==='function'&&!native(d.value))pristine=false;if(d.get&&!nativeDescriptor(w.object,w.names[j],'get',d.get))pristine=false;if(d.set&&!nativeDescriptor(w.object,w.names[j],'set',d.set))pristine=false;}}}
// Only native functions or the non-replaceable prototype of an exact named native
// constructor can be classified without invoking Proxy traps. No constructor lookup
// through an object or inherited PropertyDescriptor getter is used.
const dataValue=d=>d&&own(d,'value')?.value;
const batchNames=['Object','Array','Function','Number','WeakMap','WeakRef','Map','Set','String','RegExp','HTMLCanvasElement','CanvasRenderingContext2D','HTMLElement','Element','Node','EventTarget','HTMLDocument','Document'];
const batchable=w=>{
  if(!w.full)return false;
  if(typeof w.object==='function'&&native(w.object))return true;
  let constructor;
  for(let i=0;i<w.names.length;i++)if(w.names[i]==='constructor')constructor=dataValue(w.descriptors[i]);
  if(typeof constructor!=='function')return false;
  const text=apply(fnText,constructor,[]);let accepted=false;
  for(let i=0;i<batchNames.length;i++)if(text==='function '+batchNames[i]+'() { [native code] }')accepted=true;
  if(!accepted)return false;
  const d=own(constructor,'prototype');
  return !!d&&d.configurable===false&&d.writable===false&&dataValue(d)===w.object;
};
const stable=()=>{if(!pristine)return false;for(let i=0;i<watched.length;i++){const w=watched[i];if(proto(w.object)!==w.parent)return false;if(w.full){const now=keys(w.object);if(now.length!==w.names.length)return false;for(let j=0;j<now.length;j++)if(now[j]!==w.names[j])return false;}const all=w.batch?describe(w.object):null;if(all){const allKeys=keys(all);if(allKeys.length!==w.names.length)return false;for(let j=0;j<allKeys.length;j++)if(allKeys[j]!==w.names[j])return false;}for(let j=0;j<w.names.length;j++)if(!same(all?all[w.names[j]]:own(w.object,w.names[j]),w.descriptors[j]))return false;}return true;};

if(pristine&&native(describe)){for(let i=0;i<watched.length;i++)watched[i].batch=batchable(watched[i]);}

const rowStats = { attempts: 0, optimized: 0, fallback: 0, pixels: 0, spans: 0 };
const contextCanvas = browser ? own(CP, 'canvas')?.get : null;
const contextAttributes = browser ? own(CP, 'getContextAttributes')?.value : null;
const fillRectangle = browser ? own(CP, 'fillRect')?.value : null;
const fillStyle = browser ? own(CP, 'fillStyle')?.set : null;
const alpha = browser ? own(CP, 'globalAlpha')?.get : null;
const composition = browser ? own(CP, 'globalCompositeOperation')?.get : null;

const requiredCaps=()=>browser&&native(contextCanvas)&&native(contextAttributes)&&native(fillRectangle)&&native(fillStyle)&&native(alpha)&&native(composition)&&native(dims?.width?.get)&&native(dims?.height?.get);

export function makeOpaqueMemoOwner() {
  let trusted=pristine&&requiredCaps();
  const disabled={taint(){},beforeConstruct(){},beforeOperation(){},beforeBuild(){},paintPermit(){return false;}};
  if(!trusted)return disabled;
  const methodNames=['has','get','set','clear'];
  const mapDescriptors=methodNames.map(name=>own(Map.prototype,name));
  const initialMapPrototype=Map.prototype,mapBinding=own(globalThis,'Map');
  const setAdd=own(Set.prototype,'add'),setHas=own(Set.prototype,'has').value;
  function taint(){trusted=false;}
  function methods(name){
    if(!trusted)return false;
    if(proto(initialMapPrototype)!==OP){taint();return false;}
    for(let i=0;i<methodNames.length;i++)if((!name||methodNames[i]===name)&&!same(own(initialMapPrototype,methodNames[i]),mapDescriptors[i])){taint();return false;}
    return true;
  }
  return {
    taint,
    beforeConstruct(registry){
      if(!same(own(globalThis,'Map'),mapBinding)||!methods()||!same(own(Set.prototype,'add'),setAdd)||!stable()){taint();return;}
      // Native Set brand checking cannot call a Proxy trap or foreign getter.
      // Never inspect a registry that failed that check.
      try{apply(setHas,registry,[null]);}catch{taint();return;}
      if(proto(registry)!==Set.prototype||keys(registry).length)taint();
    },
    beforeOperation(name){methods(name);},
    beforeBuild(){if(trusted&&!stable())taint();},
    paintPermit(){return trusted&&requiredCaps()&&stable();}
  };
}

export function watchOpaquePalette(palette) {
  if (!pristine) return;
  const stack = [palette];
  const visited = new Set();
  while (stack.length) {
    const value = stack.pop();
    if (!value || typeof value !== 'object' || visited.has(value)) continue;
    visited.add(value);
    const parent = proto(value);
    if (parent !== OP && parent !== AP) { pristine = false; return; }
    const names = keys(value);
    for (let index = 0; index < names.length; index++) {
      const descriptor = own(value, names[index]);
      if (!descriptor || descriptor.get || descriptor.set) { pristine = false; return; }
      if (descriptor.value && typeof descriptor.value === 'object') stack.push(descriptor.value);
    }
    watch(value);
  }
}

export function readOpaqueRowStats() {
  return { ...rowStats };
}

export function makeOpaqueRows(g, zone, y, x, base, lit, permit) {
  rowStats.attempts++;
  if (!permit || !requiredCaps() || !stable() || typeof zone !== 'number' || typeof y !== 'number' ||
      typeof x !== 'number' || typeof base !== 'number' || typeof lit !== 'boolean' ||
      !Number.isFinite(zone) || !Number.isFinite(y) || !Number.isFinite(x) || !Number.isFinite(base) ||
      proto(g) !== CP || keys(g).length) {
    rowStats.fallback++;
    return null;
  }
  const canvas = apply(contextCanvas, g, []);
  if (proto(canvas) !== HP || apply(dims.width.get, canvas, []) !== 16 ||
      apply(dims.height.get, canvas, []) !== 16 ||
      !apply(contextAttributes, g, []).willReadFrequently || apply(alpha, g, []) !== 1 ||
      apply(composition, g, []) !== 'source-over') {
    rowStats.fallback++;
    return null;
  }
  rowStats.optimized++;
  let first = 0;
  let end = 0;
  let row = -1;
  let colour;
  function flush() {
    if (end === first) return;
    apply(fillStyle, g, [colour]);
    apply(fillRectangle, g, [first, row, end - first, 1]);
    rowStats.spans++;
    first = end;
  }
  return {
    paint(px, py, value) {
      if (py !== row || value !== colour) {
        flush();
        row = py;
        first = px;
        end = px;
        colour = value;
      }
      end = px + 1;
      rowStats.pixels++;
    },
    finish: flush
  };
}
