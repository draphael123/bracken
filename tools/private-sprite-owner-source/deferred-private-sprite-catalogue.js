// Only source-qualified private fixed-input factories. Public/escaping data factories remain eager.
const factories=new WeakMap(),catalogueStates=new WeakMap();
export function deferredPureSprite(build){const token=Object.create(null);factories.set(token,{build,built:false,value:null});return token;}
export function deferredPureSpriteCall(fn,receiver,args){return deferredPureSprite(()=>Reflect.apply(fn,receiver,args));}
export function deferredSpriteState(catalogue){return catalogueStates.get(catalogue)?.();}
export function makeDeferredSpriteCatalogue(target,withOriginalOwnership){
 let proxy,built=0;const resolve=value=>{const r=value&&typeof value==='object'&&factories.get(value);if(!r)return value;if(!r.built){r.value=withOriginalOwnership(r.build);r.built=true;r.build=null;}return r.value;};
 const materialize=key=>{const d=Reflect.getOwnPropertyDescriptor(target,key);if(d&&'value'in d&&factories.has(d.value)){const value=resolve(d.value);if(!Reflect.defineProperty(target,key,{...d,value}))throw new TypeError('cannot materialize sprite data');built++;return{...d,value};}return d;};
 proxy=new Proxy(target,{
  get(t,k,receiver){materialize(k);return Reflect.get(t,k,receiver);},
  getOwnPropertyDescriptor(t,k){return materialize(k);},
  set(t,k,value,receiver){if(receiver===proxy){const d=Reflect.getOwnPropertyDescriptor(t,k);if(d&&'value'in d){if(!d.writable){resolve(value);return false;}return Reflect.defineProperty(t,k,{...d,value});}const proto=Reflect.getPrototypeOf(t),inherited=proto===Object.prototype?Reflect.getOwnPropertyDescriptor(proto,k):null;if(!d&&(proto===Object.prototype||proto===null)&&(!inherited||'value'in inherited&&inherited.writable))return Reflect.defineProperty(t,k,{value,writable:true,enumerable:true,configurable:true});}return Reflect.set(t,k,resolve(value),receiver);},
  defineProperty(t,k,descriptor){const current=Reflect.getOwnPropertyDescriptor(t,k),next={...descriptor};if('value'in next&&factories.has(next.value)&&(next.writable===false||next.configurable===false||(!current&&next.configurable!==true)))next.value=resolve(next.value);else if(current&&'value'in current&&factories.has(current.value)&&(next.writable===false||next.configurable===false))materialize(k);return Reflect.defineProperty(t,k,next);}
 });catalogueStates.set(proxy,()=>({built,pending:Reflect.ownKeys(target).filter(k=>{const d=Reflect.getOwnPropertyDescriptor(target,k);return d&&'value'in d&&factories.has(d.value);}).length}));return proxy;
}
