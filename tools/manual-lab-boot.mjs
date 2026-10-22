// Pause the game's own automatic frame loop as soon as BK is published, before its first tick.
// Loading-screen animation continues; explicit BK.step/sim calls retain their normal behavior.
export function pauseGameAtBoot(){
 const previous=Object.getOwnPropertyDescriptor(window,'BK');
 Object.defineProperty(window,'BK',{configurable:true,enumerable:true,get(){return previous?.get?.call(window);},set(value){
  if(previous?.set)previous.set.call(window,value);else Object.defineProperty(window,'BK',{configurable:true,enumerable:true,writable:true,value});
  if(value)value.manualSimulation=true;
 }});
}

// Stable pixel-readback backend for the comparison lab only; timing probes retain the real default backend.
export function useCpuPixelCanvas(){const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,options){return get.call(this,type,type==='2d'?{...options,willReadFrequently:true}:options);};}

// Some scenery reads performance.now rather than the simulation clock. Align that visual clock only inside explicit lab renders.
export function installLabRenderClock(BK){
 const original=BK.step;if(original.__labRenderClock)return;
 const wrapped=function(...args){const descriptor=Object.getOwnPropertyDescriptor(performance,'now');Object.defineProperty(performance,'now',{configurable:true,writable:true,value:()=>BK.time*1000});try{return original.apply(this,args);}finally{if(descriptor)Object.defineProperty(performance,'now',descriptor);else delete performance.now;}};
 Object.defineProperty(wrapped,'__labRenderClock',{value:true});BK.step=wrapped;
}
