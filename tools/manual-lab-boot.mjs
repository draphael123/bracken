// Pause the game's own automatic frame loop as soon as BK is published, before its first tick.
// Loading-screen animation continues; explicit BK.step/sim calls retain their normal behavior.
export function pauseGameAtBoot(){
 const previous=Object.getOwnPropertyDescriptor(window,'BK');
 Object.defineProperty(window,'BK',{configurable:true,enumerable:true,get(){return previous?.get?.call(window);},set(value){
  if(previous?.set)previous.set.call(window,value);else Object.defineProperty(window,'BK',{configurable:true,enumerable:true,writable:true,value});
  if(value)value.manualSimulation=true;
 }});
}
