// Private fresh Skyroad mass-tile painter. Native identities and original fallbacks remain.
const sameValue=Object.is,apply=Reflect.apply,own=Reflect.getOwnPropertyDescriptor,keys=Reflect.ownKeys,proto=Reflect.getPrototypeOf,define=Reflect.defineProperty,set=Reflect.set,capturedGet=Reflect.get;
const get=WeakMap.prototype.get,put=WeakMap.prototype.set,has=WeakMap.prototype.has;
const lookup=(m,k)=>apply(get,m,[k]),remember=(m,k,v)=>apply(put,m,[k,v]),contains=(m,k)=>apply(has,m,[k]);
const O=Object,A=Array,OP=Object.prototype,AP=Array.prototype,FP=Function.prototype,fnText=own(FP,'toString').value;
const native=f=>typeof f==='function'&&/^function\s+(?:(?:get|set)\s+)?(?:[\w$]+|\[Symbol\.[\w$]+\])\s*\([^)]*\)\s*\{\s*\[native code\]\s*\}$/.test(apply(fnText,f,[]));
const realm = globalThis;
const intrinsicBinding = key => { const d = own(realm, key); if (!d) return undefined; if (d.get) return native(d.get) ? apply(d.get, realm, []) : undefined; return d.value; };
const documentType = intrinsicBinding('Document'), canvasType = intrinsicBinding('HTMLCanvasElement'), contextType = intrinsicBinding('CanvasRenderingContext2D');
const hostDocument = intrinsicBinding('document');
const browser = native(documentType) && native(canvasType) && native(contextType) && !!hostDocument;
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
const stable=()=>{if(!pristine)return false;for(let i=0;i<watched.length;i++){const w=watched[i];if(proto(w.object)!==w.parent)return false;if(w.full){const now=keys(w.object);if(now.length!==w.names.length)return false;for(let j=0;j<now.length;j++)if(now[j]!==w.names[j])return false;}for(let j=0;j<w.names.length;j++)if(!same(own(w.object,w.names[j]),w.descriptors[j]))return false;}return true;};

const rowStats = { attempts: 0, optimized: 0, fallback: 0, pixels: 0, spans: 0 };
const contextCanvas = browser ? own(CP, 'canvas').get : null;
const contextAttributes = browser ? own(CP, 'getContextAttributes').value : null;
const fillRectangle = browser ? own(CP, 'fillRect').value : null;
const fillStyle = browser ? own(CP, 'fillStyle').set : null;
const alpha = browser ? own(CP, 'globalAlpha').get : null;
const composition = browser ? own(CP, 'globalCompositeOperation').get : null;

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

export function makeOpaqueRows(g, zone, y, x, base, lit) {
  rowStats.attempts++;
  if (!browser || !stable() || typeof zone !== 'number' || typeof y !== 'number' ||
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
