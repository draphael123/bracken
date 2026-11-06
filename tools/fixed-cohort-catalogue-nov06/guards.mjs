// CLOUD ONLY. Added opt-in catalogue intrinsic/descriptor and ordinary-object controls.
import assert from'node:assert/strict';
import{makeSpriteView,qualifySpriteViewIntrinsics}from'./catalogue.mjs';
assert(process.env.CI);const A=Reflect.apply,D=Object.getOwnPropertyDescriptor,Q=Object.defineProperty,S=Object.setPrototypeOf,Freeze=Object.freeze,rows=[],push=Array.prototype.push;
assert.equal(qualifySpriteViewIntrinsics(),true,'Pristine trusted backend root');
function setup(){const value={frames:[]},target={a:undefined,b:undefined},pending=new Map([['a',value],['b',value]]);let builds=0;return{value,target,view:makeSpriteView(target,pending,v=>{builds++;return v;}),builds:()=>builds};}
const hooks=[['mapHas',Map.prototype,'has'],['mapGet',Map.prototype,'get'],['mapDelete',Map.prototype,'delete'],['setHas',Set.prototype,'has'],['setAdd',Set.prototype,'add'],['setDelete',Set.prototype,'delete'],['reflectGet',Reflect,'get'],['reflectOwn',Reflect,'getOwnPropertyDescriptor'],['reflectDefine',Reflect,'defineProperty'],['reflectDelete',Reflect,'deleteProperty'],['reflectPrevent',Reflect,'preventExtensions'],['reflectPrototype',Reflect,'setPrototypeOf'],['reflectKeys',Reflect,'ownKeys'],['arrayIterator',Array.prototype,Symbol.iterator]];
for(const [name,object,key]of hooks){
 let phase=false,calls=0;const d=D(object,key),wrapped=function(...args){if(phase)calls++;return A(d.value,this,args);};
 const read=setup(),locked=setup();
 Q(object,key,{...d,value:wrapped});
 try{phase=true;const a=read.view.a,descriptor=D(read.view,'b');Freeze(locked.view);phase=false;assert.equal(a,read.value);assert.equal(descriptor.value,read.value);assert.equal(calls,0,'No late private bookkeeping callback '+name);assert.equal(read.builds(),2);assert.equal(locked.builds(),2);assert.equal(qualifySpriteViewIntrinsics(),false,'Initial changed intrinsic rejected '+name);rows.push({name,lateCallbacks:calls,initialRejected:true});}
 finally{phase=false;Q(object,key,d);}
 assert.equal(qualifySpriteViewIntrinsics(),true,'Restored root '+name);
}
for(const key of['get','set','value','writable','enumerable','configurable']){
 const read=setup(),locked=setup();let phase=false,calls=0;assert.equal(D(Object.prototype,key),undefined);
 const descriptor={configurable:true,get(){if(phase)calls++;return undefined;}};S(descriptor,null);Q(Object.prototype,key,descriptor);
 try{phase=true;const a=D(read.view,'a');Freeze(locked.view);phase=false;assert.equal(a.value,read.value);assert.equal(calls,0,'No inherited descriptor/handler callback '+key);assert.equal(read.builds(),1);assert.equal(locked.builds(),2);assert.equal(qualifySpriteViewIntrinsics(),false);A(push,rows,[{name:'descriptor-'+key,lateCallbacks:calls,initialRejected:true}]);}
 finally{phase=false;delete Object.prototype[key];}
 assert.equal(qualifySpriteViewIntrinsics(),true);
}
{
 const q=setup(),receiver=Object.create(q.view),eager={a:q.value,b:q.value},other=Object.create(eager);assert.equal(Reflect.set(q.view,'a',17,receiver),Reflect.set(eager,'a',17,other));assert.equal(receiver.a,other.a);assert.equal(q.view.a,eager.a);rows.push({name:'derived-receiver-write',complete:true});
}
{
 const q=setup(),getter=function(){return this.marker;};Object.defineProperty(q.view,'a',{get:getter,enumerable:false,configurable:true});Object.defineProperty(q.view,'marker',{value:31,writable:true,enumerable:true,configurable:true});assert.equal(q.view.a,31);assert.equal(D(q.view,'a').get,getter);rows.push({name:'caller-accessor-replacement',complete:true});
}
{
 const key=Symbol('sprite'),value={},target={[key]:undefined,a:3},view=makeSpriteView(target,new Map([[key,value]]),v=>v);assert.deepEqual(Reflect.ownKeys(view),[key,'a'].sort((a,b)=>typeof a==='string'?-1:1));assert.equal(view[key],value);assert.equal(D(view,key).value,value);rows.push({name:'symbol-and-key-order',complete:true});
}
{
 let count=0;const marker={},target={a:undefined},view=makeSpriteView(target,new Map([['a',marker]]),v=>{if(count++===0)throw marker;return v;});assert.throws(()=>view.a,e=>e===marker);assert.equal(view.a,marker);assert.equal(count,2);rows.push({name:'original-error-identity-and-retry',complete:true});
}
{
 let recurse=true,view;const value={};view=makeSpriteView({a:undefined},new Map([['a',value]]),v=>{if(recurse){recurse=false;return view.a;}return v;});assert.throws(()=>view.a,e=>e instanceof TypeError&&e.message==='Reentrant sprite build');assert.equal(view.a,value);rows.push({name:'reentry-finally-recovery',complete:true});
}
{
 const q=setup(),prototype={z:44};assert.equal(Reflect.setPrototypeOf(q.view,prototype),true);assert.equal(q.builds(),2);assert.equal(Object.getPrototypeOf(q.view),prototype);assert.equal(q.view.z,44);rows.push({name:'prototype-materialization-and-identity',complete:true});
}
console.log(JSON.stringify({complete:true,rows,additionalCases:rows.length,noBrowserOrGameClaim:true}));
