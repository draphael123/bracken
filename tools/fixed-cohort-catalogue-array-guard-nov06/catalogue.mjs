// Source-specific opt-in SPR view component. No Game module imports this prepared source.
// Native intrinsic capture assumes the same explicitly trusted initial root as the factory capsule.
const P=Reflect.getPrototypeOf,A=Reflect.apply,D=Object.getOwnPropertyDescriptor,S=Reflect.setPrototypeOf,K=Reflect.ownKeys;
const M=Map,T=Set,X=Proxy,E=TypeError,FT=Function.prototype.toString,RE=RegExp.prototype.test;
const pattern=/^function\s+(?:(?:get|set)\s+)?(?:[\w$]+|\[Symbol\.[\w$]+\])\s*\([^)]*\)\s*\{\s*\[native code\]\s*\}$/;
const native=f=>typeof f==='function'&&A(RE,pattern,[A(FT,f,[])]);
const nil=()=>{const x={};S(x,null);return x;},desc=(o,k)=>{const d=D(o,k);if(d)S(d,null);return d;};
const reflect={get:Reflect.get,own:Reflect.getOwnPropertyDescriptor,define:Reflect.defineProperty,remove:Reflect.deleteProperty,prevent:Reflect.preventExtensions,prototype:Reflect.setPrototypeOf};S(reflect,null);
const mh=Map.prototype.has,mg=Map.prototype.get,md=Map.prototype.delete,th=Set.prototype.has,ta=Set.prototype.add,td=Set.prototype.delete;
const watched=[],watch=(o,keys,full=false)=>{const row=nil();row.object=o;row.parent=P(o);row.full=full;row.keys=keys;row.descriptors=[];for(let i=0;i<keys.length;i++){row.descriptors[i]=desc(o,keys[i]);}watched[watched.length]=row;};
const nativeRoot=native(Array)&&native(P)&&native(A)&&native(D)&&native(S)&&native(K)&&native(M)&&native(T)&&native(X)&&native(E)&&native(FT)&&native(RE)&&native(mh)&&native(mg)&&native(md)&&native(th)&&native(ta)&&native(td)&&native(reflect.get)&&native(reflect.own)&&native(reflect.define)&&native(reflect.remove)&&native(reflect.prevent)&&native(reflect.prototype);
watch(globalThis,['Array','Map','Set','Proxy','TypeError','Reflect','Object']);watch(Reflect,['apply','ownKeys','get','getOwnPropertyDescriptor','defineProperty','deleteProperty','preventExtensions','setPrototypeOf','getPrototypeOf']);watch(Object,['getOwnPropertyDescriptor','setPrototypeOf']);watch(Function.prototype,['toString']);watch(RegExp.prototype,['test','exec']);watch(Map.prototype,K(Map.prototype),true);watch(Set.prototype,K(Set.prototype),true);watch(Object.prototype,K(Object.prototype),true);watch(Array,['from','prototype',Symbol.species]);watch(Array.prototype,K(Array.prototype),true);
const parent=P;
export function qualifySpriteViewIntrinsics(){
 if(!nativeRoot)return false;
 for(let i=0;i<watched.length;i++){const row=watched[i];if(parent(row.object)!==row.parent)return false;if(row.full){const now=K(row.object);if(now.length!==row.keys.length)return false;for(let k=0;k<now.length;k++)if(now[k]!==row.keys[k])return false;}for(let j=0;j<row.keys.length;j++){const x=row.descriptors[j],y=desc(row.object,row.keys[j]);if(!!x!==!!y)return false;if(x&&!(x.value===y.value&&x.get===y.get&&x.set===y.set&&x.writable===y.writable&&x.enumerable===y.enumerable&&x.configurable===y.configurable))return false;}}
 return true;
}
export function makeSpriteView(target,pending,build){
 const building=new T();
 function materialize(key){
  if(!A(mh,pending,[key]))return;
  if(A(th,building,[key]))throw new E('Reentrant sprite build');
  A(ta,building,[key]);
  try{const value=build(A(mg,pending,[key])),descriptor=nil();descriptor.value=value;if(!reflect.define(target,key,descriptor))throw new E('Cannot publish sprite');A(md,pending,[key]);}
  finally{A(td,building,[key]);}
 }
 function materializeAll(){const keys=K(target);for(let i=0;i<keys.length;i++)materialize(keys[i]);}
 const traps=nil();
 traps.get=function(object,key,receiver){materialize(key);return reflect.get(object,key,receiver);};
 traps.getOwnPropertyDescriptor=function(object,key){materialize(key);const descriptor=reflect.own(object,key);if(descriptor)S(descriptor,null);return descriptor;};
 traps.defineProperty=function(object,key,descriptor){materialize(key);return reflect.define(object,key,descriptor);};
 traps.deleteProperty=function(object,key){const removed=reflect.remove(object,key);if(removed)A(md,pending,[key]);return removed;};
 traps.preventExtensions=function(object){materializeAll();return reflect.prevent(object);};
 traps.setPrototypeOf=function(object,prototype){materializeAll();return reflect.prototype(object,prototype);};
 return new X(target,traps);
}
