// Additional cloud-only contracts. All original family/public/fallback cases remain.
export async function runSkyroadOwnedContracts(manifest) {
  const rows=[],urls=[],check=(v,m)=>{if(!v)throw Error(m);};
  const decode=f=>new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),x=>x.charCodeAt(0)));
  async function unit(files,probe=false){
    const sources=new Map(files.map(f=>[f.file,decode(f)])),cache=new Map();
    async function url(file){
      if(cache.has(file))return cache.get(file);let s=sources.get(file);check(s!==undefined,'Dependency '+file);
      if(file==='src/redraw/skyroad_tiles.js')s+='\nexport const __massTile=massTile;\n';
      if(probe&&file==='src/skyroad-opaque-rows.js')s+='\nexport const __watch=watch,__stable=stable;\n';
      for(const m of [...s.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)])s=s.replace(m[0],'from '+JSON.stringify(await url(new URL(m[2],'https://unit.invalid/'+file).pathname.slice(1))));
      const u=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));urls.push(u);cache.set(file,u);return u;
    }
    return async file=>import(await url(file));
  }
  function exact(a,b,label){
    check(a.width===b.width&&a.height===b.height,label+' dimensions');
    const ga=a.getContext('2d'),gb=b.getContext('2d'),x=ga.getImageData(0,0,a.width,a.height).data,y=gb.getImageData(0,0,b.width,b.height).data;
    check(x.length===y.length&&x.every((v,i)=>v===y[i]),label+' pixels');
    for(const k of ['fillStyle','globalAlpha','globalCompositeOperation','imageSmoothingEnabled','filter','lineWidth','font'])check(Object.is(ga[k],gb[k]),label+' '+k);
  }
  const oldRandom=Math.random;let rng=0;Math.random=()=>{rng++;throw Error('Unexpected global RNG');};
  try{
    for(const [target,key]of [[CanvasRenderingContext2D.prototype,'getContextAttributes'],[CanvasRenderingContext2D.prototype,'canvas'],[CanvasRenderingContext2D.prototype,'fillRect'],[CanvasRenderingContext2D.prototype,'fillStyle'],[CanvasRenderingContext2D.prototype,'globalAlpha'],[CanvasRenderingContext2D.prototype,'globalCompositeOperation'],[HTMLCanvasElement.prototype,'width'],[HTMLCanvasElement.prototype,'height']]){
      const A=await unit(manifest.baseline),a=await A('src/redraw/skyroad_tiles.js'),d=Object.getOwnPropertyDescriptor(target,key),outputs=[],errors=[];
      try{
        Reflect.deleteProperty(target,key);
        const B=await unit(manifest.candidate),b=await B('src/redraw/skyroad_tiles.js'),h=await B('src/skyroad-opaque-rows.js');
        for(const [i,m]of [a,b].entries())try{outputs[i]=m.__massTile(0,5,15,6);}catch(e){errors[i]=e.name;}
        check(errors[0]===errors[1],'Missing capability error parity '+key);
        check(h.readOpaqueRowStats().optimized===0,'Missing capability fallback '+key);
      }finally{Object.defineProperty(target,key,d);}
      if(outputs[0]&&outputs[1])exact(outputs[0],outputs[1],'Missing '+key);
      rows.push({label:'missing-capability:'+key,exact:true});
    }
    for(const method of ['has','get','set','clear']){
      const traces=[[],[]],outputs=[];
      for(const [side,files]of [manifest.baseline,manifest.candidate].entries()){
        const U=await unit(files),m=await U('src/redraw/skyroad_tiles.js'),cache=await U('src/level-tile-cache.js'),h=side?await U('src/skyroad-opaque-rows.js'):null;
        // Fill the original recipe/live maps, then intercept one operation. Restore
        // the prototype inside that observer and retain the actual receiver.
        m.__massTile(0,5,15,6);
        const d=Object.getOwnPropertyDescriptor(Map.prototype,method);let fired=false;
        Object.defineProperty(Map.prototype,method,{...d,value:function(...args){
          if(!fired){fired=true;Object.defineProperty(Map.prototype,method,d);traces[side].push(['escape',method]);
            const get=Map.prototype.get;Object.defineProperty(this,'get',{configurable:true,value:function(...a){traces[side].push(['own-get',String(a[0])]);return Reflect.apply(get,this,a);}});}
          return Reflect.apply(d.value,this,args);
        }});
        try{if(method==='clear')cache.resetLevelTileCaches();outputs[side]=m.__massTile(0,6,15,6);}finally{Object.defineProperty(Map.prototype,method,d);}
        const before=h?.readOpaqueRowStats().optimized;
        m.__massTile(0,7,15,6);
        if(h)check(h.readOpaqueRowStats().optimized===before,'Permanent ownership taint '+method);
      }
      check(JSON.stringify(traces[0])===JSON.stringify(traces[1]),'Private map escape trace '+method);
      exact(outputs[0],outputs[1],'Private map escape '+method);rows.push({label:'permanent-map-escape:'+method,exact:true,traceEvents:traces[0].length});
    }
    {
      const A=await unit(manifest.baseline),B=await unit(manifest.candidate),a=await A('src/redraw/skyroad_tiles.js'),b=await B('src/redraw/skyroad_tiles.js'),h=await B('src/skyroad-opaque-rows.js'),outputs=[],traces=[[],[]],d=Object.getOwnPropertyDescriptor(Document.prototype,'createElement');
      for(const [side,m]of [a,b].entries()){
        let first=true;
        Object.defineProperty(Document.prototype,'createElement',{...d,value:function(...args){const c=Reflect.apply(d.value,this,args);if(first&&args[0]==='canvas'){first=false;Object.defineProperty(Document.prototype,'createElement',d);const original=c.getContext;Object.defineProperty(c,'getContext',{configurable:true,value:function(...x){traces[side].push('captured-canvas');return Reflect.apply(original,this,x);}});}return c;}});
        try{outputs[side]=m.__massTile(0,5,15,6);}finally{Object.defineProperty(Document.prototype,'createElement',d);}
      }
      check(JSON.stringify(traces[0])===JSON.stringify(traces[1]),'Restoring canvas observer trace');check(h.readOpaqueRowStats().optimized===0,'Pre-allocation permit rejects restoring observer');exact(outputs[0],outputs[1],'Restoring observer');rows.push({label:'pre-allocation-restoring-observer',exact:true});
    }
    for(const proxy of [false,true]){
      const traces=[[],[]],results=[];
      for(const [side,files]of [manifest.guardReference,manifest.candidate].entries()){
        const U=await unit(files,true),h=await U('src/skyroad-opaque-rows.js'),target={a:NaN,b:-0};
        const o=proxy?new Proxy(target,{ownKeys(t){traces[side].push('keys');return Reflect.ownKeys(t);},getOwnPropertyDescriptor(t,k){traces[side].push('descriptor:'+String(k));return Reflect.getOwnPropertyDescriptor(t,k);},getPrototypeOf(t){traces[side].push('prototype');return Reflect.getPrototypeOf(t);}}):target;
        h.__watch(o);traces[side].length=0;const first=h.__stable();target.b=0;const second=h.__stable();results[side]=[first,second];
      }
      check(JSON.stringify(results[0])===JSON.stringify(results[1])&&results[1][0]&&!results[1][1],'All descriptor identities preserved '+proxy);
      check(JSON.stringify(traces[0])===JSON.stringify(traces[1]),'Unproved record original trap sequence '+proxy);rows.push({label:'descriptor-sequence:'+proxy,exact:true,traceEvents:traces[0].length});
    }
    {
      const U=await unit(manifest.candidate),h=await U('src/skyroad-opaque-rows.js'),c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');
      check(h.makeOpaqueRows(g,0,0,0,2,false,true)===null,'GPU rejection with affirmative private permit');rows.push({label:'explicit-permit-gpu-fallback',exact:true});
    }
    return {complete:true,rows,rng};
  }finally{Math.random=oldRandom;for(const u of urls)URL.revokeObjectURL(u);}
}
