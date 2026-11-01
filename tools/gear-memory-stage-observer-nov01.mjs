// CLOUD DIAGNOSTIC ONLY. Count fresh native contexts without retaining canvases or changing any draw call.
export function installGearMemoryStageObserver(){
 const apply=Reflect.apply,define=Object.defineProperty,DP=Document.prototype,HP=HTMLCanvasElement.prototype,cd=Object.getOwnPropertyDescriptor(DP,'createElement'),gd=Object.getOwnPropertyDescriptor(HP,'getContext'),created=new WeakSet(),seen=new WeakSet();let label='observer-installed',contexts=0,pixels=0,canvases=0,since=0;
 const emit=(kind,extra={})=>window.__brackenGearMemory(JSON.stringify({kind,label,contexts,logicalPixels:pixels,createdCanvases:canvases,jsHeapUsedBytes:performance.memory?.usedJSHeapSize||null,...extra}));
 define(DP,'createElement',{...cd,value:function(...args){const c=apply(cd.value,this,args);if(typeof args[0]==='string'&&args[0].toLowerCase()==='canvas'){created.add(c);canvases++;}return c;}});
 define(HP,'getContext',{...gd,value:function(...args){const g=apply(gd.value,this,args);if(args[0]==='2d'&&g&&created.has(this)&&!seen.has(this)){seen.add(this);contexts++;pixels+=this.width*this.height;if(++since>=256){since=0;emit('contexts');}}return g;}});
 window.__brackenGearStage=(next,extra={})=>{label=next;emit('stage',extra);};
 window.__brackenGearRestore=()=>{define(DP,'createElement',cd);define(HP,'getContext',gd);emit('restored');delete window.__brackenGearStage;delete window.__brackenGearRestore;};emit('installed');
}
