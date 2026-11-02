// Private ordinary catalogue; the sole public API change is its first-access publication boundary.
const tokenRecords=new WeakMap(),catalogues=new WeakMap();
const own=Reflect.getOwnPropertyDescriptor,define=Reflect.defineProperty,keys=Reflect.ownKeys;
function resolve(token,owner){const h=privateRHandle(token);if(h)return owner(()=>materializePrivateRRecord(h));const r=token&&typeof token==='object'&&tokenRecords.get(token);if(!r)return token;if(!r.built){const value=r.partial?owner(()=>materializePrivateRRecord(r.partial)):owner(r.build);r.value=value;r.built=true;r.build=null;r.privateBuild=null;r.partial=null;}return r.value;}
export function deferredPureSprite(build){if(typeof build!=='function')throw TypeError('sprite factory');const token=Object.create(null);tokenRecords.set(token,{build,built:false,value:null});return token;}
export function deferredPureSpriteCall(fn,receiver,args){return deferredPureSprite(()=>Reflect.apply(fn,receiver,args));}
function install(target,key,token,d,state){
 let getter;
 const get=()=>{const value=resolve(token,state.owner);const current=own(target,key);if(current?.get===getter&&current.configurable){define(target,key,{value,writable:true,enumerable:current.enumerable,configurable:true});state.fields.delete(key);}return value;};
 getter=get;
 const set=function(value){value=privateRToken(value);if(this!==target){materializeField(target,key,state);if(!Reflect.set(target,key,resolve(value,state.owner),this))throw TypeError('sprite receiver write');return;}if(state.published)value=resolve(value,state.owner);if(tokenRecords.has(value)&&!state.published){install(target,key,value,d,state);return;}if(!define(target,key,{value,writable:true,enumerable:d.enumerable,configurable:d.configurable}))throw TypeError('sprite field write');state.fields.delete(key);};
 if(!define(target,key,{get,set,enumerable:d.enumerable,configurable:d.configurable}))throw TypeError('sprite field installation');
 state.fields.set(key,{getter,token});return token;
}
function materializeField(target,key,state){const field=state.fields.get(key),d=own(target,key);if(field&&d?.get===field.getter)return d.get.call(target);if(field)state.fields.delete(key);return d&&'value'in d?d.value:undefined;}
export function makeDeferredSpriteCatalogue(target,withOriginalOwnership){
 if(catalogues.has(target))return target;const state={owner:withOriginalOwnership,fields:new Map(),published:false};catalogues.set(target,state);
 for(const key of keys(target)){const d=own(target,key);if(d&&'value'in d){const value=privateRToken(d.value);if(tokenRecords.has(value)){if(!d.configurable||!d.writable){define(target,key,{...d,value:resolve(value,state.owner)});continue;}install(target,key,value,d,state);}}}
 return target;
}
export function setDeferredSprite(target,key,value,receiver=target){
 const state=catalogues.get(target);if(!state){const h=privateRHandle(value);return Reflect.set(target,key,h?materializePrivateRRecord(h):value,receiver);}const h=privateRHandle(value);value=h&&(state.published||Reflect.getPrototypeOf(target)!==Object.prototype)?materializePrivateRRecord(h):privateRToken(value);
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
 const set=function(value){if(this!==api){const receiverDescriptor=own(this,key);if(receiverDescriptor){if(!('value'in receiverDescriptor)||!receiverDescriptor.writable||!define(this,key,{value}))throw TypeError('publication receiver write');}else if(!define(this,key,{value,writable:true,enumerable:true,configurable:true}))throw TypeError('publication receiver write');return;}const d=own(api,key);if(Object.isFrozen(api))throw TypeError('frozen publication write');overwritten=true;replacement=value;if(d?.get===get&&d.configurable)define(api,key,{...original,value});};
 if(!define(api,key,{get,set,enumerable:original.enumerable,configurable:true}))throw TypeError('publication installation');
 return api;
}

export function assignDeferredSprite(target,key,value){if(!setDeferredSprite(target,key,value))throw TypeError('sprite assignment');return value;}

// ABSTRACT publication protocol only. Native snapshots and Game integration are NOT implemented here.
const rApply=Reflect.apply,rGet=Reflect.get,rKeys=Reflect.ownKeys,rDefine=Reflect.defineProperty,rDelete=Reflect.deleteProperty,rProto=Reflect.getPrototypeOf,rSetProto=Reflect.setPrototypeOf,rExtensible=Reflect.isExtensible,rDescriptors=Object.getOwnPropertyDescriptors,rObjectProto=Reflect.getPrototypeOf({}),RProxy=Proxy,RWeakRef=globalThis.WeakRef;
const rMapGet=WeakMap.prototype.get,rMapSet=WeakMap.prototype.set,rMapHas=WeakMap.prototype.has,rDeref=typeof RWeakRef==='function'?RWeakRef.prototype.deref:null;
const rget=(m,k)=>rApply(rMapGet,m,[k]),rset=(m,k,v)=>rApply(rMapSet,m,[k,v]),rhas=(m,k)=>rApply(rMapHas,m,[k]),deref=ref=>rApply(rDeref,ref,[]),put=(a,v)=>{rDefine(a,String(a.length),{value:v,writable:true,enumerable:true,configurable:true});};
const privateRRecords=new WeakMap(),privateRViews=new WeakMap(),privateRViewCache=new WeakMap();let privateRQueue=[];
function privateRHandle(value){return rget(privateRViews,value)||(rhas(privateRRecords,value)?value:null);}
function privateRToken(value){const h=privateRHandle(value);if(!h)return value;const r=rget(privateRRecords,h);if(r.complete)return h;const token=deferredPureSprite(()=>materializePrivateRRecord(h)),t=tokenRecords.get(token);t.privateBuild=()=>h;t.partial=h;return token;}
export function makePrivateRRecord(fields,finish,{owner=fn=>fn(),maxPending=128}={}){
 if(typeof finish!=='function'||typeof owner!=='function'||!Number.isInteger(maxPending)||maxPending<1||maxPending>512||typeof RWeakRef!=='function'||typeof WeakRef!=='function')throw TypeError('private R backend contract');
 const ds=rDescriptors(fields);for(let i=0,ks=['R','ax','ay','w','h'];i<ks.length;i++){const d=ds[ks[i]];if(!d||!('value'in d))throw TypeError('private R fields must be own data');}
 const next=[];for(let i=0;i<privateRQueue.length;i++){const ref=privateRQueue[i],h=deref(ref);if(h&&!rget(privateRRecords,h).complete)put(next,ref);}privateRQueue=next;
 while(privateRQueue.length>=maxPending){const h=deref(privateRQueue[0]);if(h)materializePrivateRRecord(h);for(let i=1;i<privateRQueue.length;i++)privateRQueue[i-1]=privateRQueue[i];privateRQueue.length--;}
 const h={R:fields.R,ax:fields.ax,ay:fields.ay,w:fields.w,h:fields.h};rset(privateRRecords,h,{finish,owner,complete:false,finishing:false});put(privateRQueue,new RWeakRef(h));return h;
}
export function materializePrivateRRecord(value){
 const h=privateRHandle(value);if(!h)return value;const r=rget(privateRRecords,h);if(r.complete)return h;if(r.finishing)throw TypeError('reentrant private R completion');r.finishing=true;
 try{const full=r.owner(()=>r.finish(h));if(!full||typeof full!=='object'||full===h||rProto(full)!==rObjectProto)throw TypeError('private R backend must return a separate ordinary complete data pack');const ds=rDescriptors(full),ordered=rKeys(full);for(let i=0;i<ordered.length;i++)if(!('value'in ds[ordered[i]]))throw TypeError('private R completion cannot publish accessors');for(let i=0,ks=['R','L','white','ax','ay','w','h'];i<ks.length;i++)if(!ds[ks[i]])throw TypeError('incomplete private R pack');
  const oldKeys=rKeys(h);if(!rExtensible(h))throw TypeError('private R record escaped before completion');for(let i=0;i<oldKeys.length;i++)if(!own(h,oldKeys[i]).configurable)throw TypeError('private R record escaped before completion');
  for(let i=0;i<oldKeys.length;i++)if(!rDelete(h,oldKeys[i]))throw TypeError('private R replacement');if(!rSetProto(h,rObjectProto))throw TypeError('private R prototype');for(let i=0;i<ordered.length;i++)if(!rDefine(h,ordered[i],ds[ordered[i]]))throw TypeError('private R data publication');r.complete=true;r.finish=null;return h;
 }finally{r.finishing=false;}
}
export function flushPrivateRRecords(){for(let i=0;i<privateRQueue.length;i++){const h=deref(privateRQueue[i]);if(h)materializePrivateRRecord(h);}privateRQueue=[];}
export function privateRRecordInfo(value){const h=privateRHandle(value),r=h&&rget(privateRRecords,h);return r?{pending:!r.complete,finishing:r.finishing}:null;}
function privateRView(h){let v=rget(privateRViewCache,h);if(v)return v;v={};const ks=['R','ax','ay','w','h'];for(let i=0;i<ks.length;i++){const k=ks[i];rDefine(v,k,{get:()=>rGet(h,k,h),enumerable:true,configurable:true});}rset(privateRViews,v,h);rset(privateRViewCache,h,v);return v;}
export function deferredPureSpriteWithR(build,buildR){if(typeof buildR!=='function')throw TypeError('private R factory');const t=deferredPureSprite(build);tokenRecords.get(t).privateBuild=buildR;return t;}
export function makePrivateRReadFacade(target){
 const state=catalogues.get(target);if(!state||state.published||typeof WeakRef!=='function'||typeof Proxy!=='function')return target;
 return new RProxy(target,{get(t,key){const normal=()=>rGet(t,key,t),field=state.fields.get(key),d=own(t,key);if(state.published||!rExtensible(t)||rProto(t)!==rObjectProto||!field||d?.get!==field.getter)return normal();const r=tokenRecords.get(field.token);if(!r||r.built||(!r.partial&&typeof r.privateBuild!=='function'))return normal();
  if(!r.partial){const value=state.owner(r.privateBuild),h=privateRHandle(value);if(!h){r.value=value;r.built=true;r.build=null;r.privateBuild=null;return normal();}r.partial=h;}return privateRView(r.partial);
 }});
}
