// Fixed-input, palette-independent ART factories only. No shared pixels or canvas reuse.
import { withBakeOwnership } from './px.js';
const recipes=new WeakMap(),targets=new WeakMap(),ready=new WeakSet();
export function createLevelArtOwner(owned){return typeof WeakRef==='function'?{owned:new WeakRef(owned),queue:null,retired:false}:null;}
export function queueLevelArtOwner(owner,queue){if(owner&&!owner.retired){owner.queue=queue;owner.owned=null;}}
export function retireLevelArtOwner(owner){if(owner){owner.retired=true;owner.owned=null;owner.queue=null;}}
export function deferredLevelArtCall(owner,fn,receiver,args){
 if(!owner)return Reflect.apply(fn,receiver,args);
 const token=Object.create(null);recipes.set(token,{owner,fn,receiver,args,built:false,value:null});return token;
}
function resolveToken(token){const r=recipes.get(token);if(!r)return token;if(!r.built){
 const record=canvases=>{if(r.owner.retired){for(const c of canvases){c.width=0;c.height=0;}}else{const target=r.owner.queue||r.owner.owned?.deref();if(target)target.push(...canvases);}};
 r.value=withBakeOwnership(()=>Reflect.apply(r.fn,r.receiver,r.args),record);r.built=true;r.fn=r.receiver=r.args=null;
 }return r.value;}
function materialize(value,seen=new WeakSet()){
 if(!value||typeof value!=='object')return value;if(recipes.has(value))return resolveToken(value);
 if(value instanceof HTMLCanvasElement||ArrayBuffer.isView(value)||ready.has(value)||seen.has(value))return value;seen.add(value);
 for(const k of Reflect.ownKeys(value)){const d=Reflect.getOwnPropertyDescriptor(value,k);if(!d||!('value'in d))continue;const next=materialize(d.value,seen);if(next!==d.value&&!Reflect.defineProperty(value,k,{...d,value:next}))throw new TypeError('cannot materialize fixed art data');}ready.add(value);return value;
}
// Internal retirement only: pending recipes stay pending; already built alias tokens expose their real leaves.
export function existingLevelArtValue(value){if(!value||typeof value!=='object')return value;if(targets.has(value))return targets.get(value);const r=recipes.get(value);return r?(r.built?r.value:null):value;}
export function makeDeferredLevelArtCatalogue(target){
 let proxy;const build=key=>{const d=Reflect.getOwnPropertyDescriptor(target,key);if(d&&'value'in d){const value=materialize(d.value);if(value!==d.value){if(!Reflect.defineProperty(target,key,{...d,value}))throw new TypeError('cannot materialize fixed art property');return{...d,value};}}return d;};
 proxy=new Proxy(target,{
  get(t,k,receiver){build(k);return Reflect.get(t,k,receiver);},
  getOwnPropertyDescriptor(t,k){return build(k);},
  set(t,k,value,receiver){if(receiver===proxy){const d=Reflect.getOwnPropertyDescriptor(t,k);if(d&&'value'in d){if(!d.writable)return false;return Reflect.defineProperty(t,k,{...d,value});}}let object=t,descriptor;while(object&&!(descriptor=Reflect.getOwnPropertyDescriptor(object,k)))object=Reflect.getPrototypeOf(object);if(descriptor&&!('value'in descriptor))value=materialize(value);return Reflect.set(t,k,value,receiver);},
  defineProperty(t,k,descriptor){const current=Reflect.getOwnPropertyDescriptor(t,k),next={...descriptor};if('value'in next&&(next.writable===false||next.configurable===false||(!current&&next.configurable!==true)))next.value=materialize(next.value);else if(current&&'value'in current&&(next.writable===false||next.configurable===false))build(k);return Reflect.defineProperty(t,k,next);}
 });targets.set(proxy,new Proxy(target,{get(t,k){return Reflect.get(t,k,proxy);}}));return proxy;
}

export function deferredFixedArtExpression(owner,ART,expression){if(!owner)return expression(ART);const namespace=new Proxy(ART,{get(target,key){const fn=Reflect.get(target,key);return typeof fn==='function'?(...args)=>deferredLevelArtCall(owner,fn,target,args):fn;}});return expression(namespace);}
