// Serialized page-side diagnostic. Invoked only in the cloud browser, once per occurrence.
export function measureSingleFrameDrawStages(){
 const display=document.getElementById('c').getContext('2d'),game=BK.g,records=[],restores=[];BK.manualSimulation=true;
 try{
  for(const[label,ctx]of[['display',display],['game',game]])for(const method of['drawImage','fillRect','fill','stroke','clearRect']){
   const original=ctx[method],descriptor=Object.getOwnPropertyDescriptor(ctx,method),row={context:label,method,calls:0,nativeCallElapsedMs:0,maxCallMs:0,sourceDimensions:{}};if(typeof original!=='function')continue;records.push(row);restores.push({ctx,method,descriptor,original});
   Object.defineProperty(ctx,method,{configurable:true,writable:true,value:function(){const start=performance.now();try{return original.apply(this,arguments);}finally{const elapsed=performance.now()-start;row.calls++;row.nativeCallElapsedMs+=elapsed;row.maxCallMs=Math.max(row.maxCallMs,elapsed);if(method==='drawImage'){const c=arguments[0];if(c instanceof HTMLCanvasElement){const key=c.width+'x'+c.height;row.sourceDimensions[key]=(row.sourceDimensions[key]||0)+1;}}}}});
  }
  const start=performance.now();BK.step(0);const bodyElapsedMs=performance.now()-start;return{records,bodyElapsedMs,contextAttributes:{display:display.getContextAttributes(),game:game.getContextAttributes()},scope:'One original manual BK.step(0) frame after original Hurricane setup/warmup; only actual display and Game-buffer context methods observed. Intermediates/other native work omitted; wrappers/clock reads add overhead. Not FPS, CPU-self, GPU duration, a speedup, or full state/pixel proof.'};
 }finally{for(const{ctx,method,descriptor,original}of restores.reverse()){if(descriptor)Object.defineProperty(ctx,method,descriptor);else delete ctx[method];if(ctx[method]!==original)throw Error('Diagnostic method restoration failed');}}
}
