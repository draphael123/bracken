// Serialized into disposable lab documents; no game, input, clock or random-state changes.
export function installNativeCollectionBridge(){
 let serial=0;const pending=new Map();
 Object.defineProperty(window,'__brackenLabCollect',{configurable:true,value:()=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});__brackenLabGC(String(id));})});
 Object.defineProperty(window,'__brackenLabReply',{configurable:true,value:(id,error)=>{const p=pending.get(id);if(!p)return;pending.delete(id);error?p.reject(new Error(error)):p.resolve();}});
}
