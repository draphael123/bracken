// Private ordinary catalogue; the sole public API change is its first-access publication boundary.
const tokenRecords=new WeakMap(),catalogues=new WeakMap();
const own=Reflect.getOwnPropertyDescriptor,define=Reflect.defineProperty,keys=Reflect.ownKeys;
function resolve(token,owner){const r=token&&typeof token==='object'&&tokenRecords.get(token);if(!r)return token;if(!r.built){const value=owner(r.build);r.value=value;r.built=true;r.build=null;}return r.value;}
export function deferredPureSprite(build){if(typeof build!=='function')throw TypeError('sprite factory');const token=Object.create(null);tokenRecords.set(token,{build,built:false,value:null});return token;}
export function deferredPureSpriteCall(fn,receiver,args){return deferredPureSprite(()=>Reflect.apply(fn,receiver,args));}
function install(target,key,token,d,state){
 let getter;
 const get=()=>{const value=resolve(token,state.owner);const current=own(target,key);if(current?.get===getter&&current.configurable){define(target,key,{value,writable:true,enumerable:current.enumerable,configurable:true});state.fields.delete(key);}return value;};
 getter=get;
 const set=function(value){if(this!==target){materializeField(target,key,state);if(!Reflect.set(target,key,resolve(value,state.owner),this))throw TypeError('sprite receiver write');return;}if(state.published)value=resolve(value,state.owner);if(tokenRecords.has(value)&&!state.published){install(target,key,value,d,state);return;}if(!define(target,key,{value,writable:true,enumerable:d.enumerable,configurable:d.configurable}))throw TypeError('sprite field write');state.fields.delete(key);};
 if(!define(target,key,{get,set,enumerable:d.enumerable,configurable:d.configurable}))throw TypeError('sprite field installation');
 state.fields.set(key,{getter,token});return token;
}
function materializeField(target,key,state){const field=state.fields.get(key),d=own(target,key);if(field&&d?.get===field.getter)return d.get.call(target);if(field)state.fields.delete(key);return d&&'value'in d?d.value:undefined;}
export function makeDeferredSpriteCatalogue(target,withOriginalOwnership){
 if(catalogues.has(target))return target;const state={owner:withOriginalOwnership,fields:new Map(),published:false};catalogues.set(target,state);
 for(const key of keys(target)){const d=own(target,key);if(d&&'value'in d&&tokenRecords.has(d.value)){if(!d.configurable||!d.writable){define(target,key,{...d,value:resolve(d.value,state.owner)});continue;}install(target,key,d.value,d,state);}}
 return target;
}
export function setDeferredSprite(target,key,value,receiver=target){
 const state=catalogues.get(target);if(!state)return Reflect.set(target,key,value,receiver);
 if(receiver!==target){materializeField(target,key,state);return Reflect.set(target,key,resolve(value,state.owner),receiver);}
 const d=own(target,key),field=state.fields.get(key);if(field&&d?.get===field.getter){d.set.call(target,value);return true;}
 if(tokenRecords.has(value)&&!state.published){
  const inherited=!d&&Reflect.getPrototypeOf(target)&&own(Reflect.getPrototypeOf(target),key);
  if((d&&'value'in d&&d.writable&&d.configurable)||(!d&&Reflect.isExtensible(target)&&(!inherited||('value'in inherited&&inherited.writable)))){install(target,key,value,d||{enumerable:true,configurable:true,writable:true},state);return true;}
 }
 return Reflect.set(target,key,resolve(value,state.owner),receiver);
}
export function exposeSpriteCatalogue(target){const state=catalogues.get(target);if(!state)return target;for(const key of keys(target))materializeField(target,key,state);state.published=true;return target;}
export function deferredSpriteState(target){const s=catalogues.get(target);if(!s)return null;let pending=0;for(const [key,r]of s.fields){if(own(target,key)?.get===r.getter)pending++;}return{pending,published:s.published};}
export function installSpritePublicationBoundary(api,key,target){
 const original=own(api,key);if(!original||!('value'in original)||original.value!==target||!original.configurable||!original.writable)throw TypeError('ordinary writable publication boundary required');
 let overwritten=false,replacement;
 const get=function(){if(overwritten)return replacement;const value=exposeSpriteCatalogue(target),d=own(api,key);if(d?.get===get&&d.configurable)define(api,key,{...original,value});return value;};
 const set=function(value){if(this!==api){if(!define(this,key,{value,writable:true,enumerable:true,configurable:true}))throw TypeError('publication receiver write');return;}const d=own(api,key);if(Object.isFrozen(api))throw TypeError('frozen publication write');overwritten=true;replacement=value;if(d?.get===get&&d.configurable)define(api,key,{...original,value});};
 if(!define(api,key,{get,set,enumerable:original.enumerable,configurable:true}))throw TypeError('publication installation');
 return api;
}

export function assignDeferredSprite(target,key,value){if(!setDeferredSprite(target,key,value))throw TypeError('sprite assignment');return value;}
