// Serialized only into a cloud browser. Additional contracts; no original matrix repetition.
export async function runSkyroadSpanContracts(manifest) {
  const urls=[],rows=[];
  const check=(x,m)=>{if(!x)throw Error(m);};
  async function unit(files){
    const sources=new Map(files.map(f=>[f.file,new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),x=>x.charCodeAt(0)))])),cache=new Map();
    async function url(file){
      if(cache.has(file))return cache.get(file);let s=sources.get(file);check(s!==undefined,'Dependency '+file);
      if(file==='src/redraw/skyroad_tiles.js')s+='\nexport const __massTile=massTile;\n';
      for(const m of [...s.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)])s=s.replace(m[0],'from '+JSON.stringify(await url(new URL(m[2],'https://unit.invalid/'+file).pathname.slice(1))));
      const u=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));urls.push(u);cache.set(file,u);return u;
    }
    return async f=>import(await url(f));
  }
  function sameCanvas(a,b,label){
    check(a.width===b.width&&a.height===b.height,label+' dimensions');
    const x=a.getContext('2d'),y=b.getContext('2d'),p=x.getImageData(0,0,a.width,a.height).data,q=y.getImageData(0,0,b.width,b.height).data;
    check(p.length===q.length&&p.every((v,i)=>v===q[i]),label+' pixels');
    for(const k of ['fillStyle','strokeStyle','globalAlpha','globalCompositeOperation','imageSmoothingEnabled','filter','lineWidth','font'])check(Object.is(x[k],y[k]),label+' context '+k);
    check(JSON.stringify(Reflect.ownKeys(a))===JSON.stringify(Reflect.ownKeys(b)),label+' metadata');
  }
  const oldRandom=Math.random;let rng=0;Math.random=()=>{rng++;throw Error('Unexpected global RNG');};
  try{
    // Bootstrap and every native recognition must preserve public legacy RegExp state.
    // Probe exports are appended only in this isolated component document.
    {
      const file=manifest.candidate.find(x=>x.file==='src/skyroad-opaque-rows.js');
      const source=new TextDecoder().decode(Uint8Array.from(atob(manifest.proof.nativeProbeSourceBase64||file.contentBase64),x=>x.charCodeAt(0)))+'\nexport const __nativeProbe=native;\n';
      const u=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));urls.push(u);
      const names=['input','$_','lastMatch','$&','lastParen','$+','leftContext','$`','rightContext',"$'",'$1','$2','$3','$4','$5','$6','$7','$8','$9'];
      /(native)(state)/.exec('leftnativestateright');
      const before=names.map(k=>RegExp[k]);const h=await import(u);const after=names.map(k=>RegExp[k]);
      check(JSON.stringify(before)===JSON.stringify(after),'Helper bootstrap preserves all legacy RegExp values');
      const inherited=/^function\s+(?:(?:get|set)\s+)?(?:[\w$]+|\[Symbol\.[\w$]+\])\s*\([^)]*\)\s*\{\s*\[native code\]\s*\}$/;
      const objects=[Object,Object.prototype,Array,Array.prototype,Function.prototype,Reflect,Number,Number.prototype,WeakMap,WeakMap.prototype,WeakRef,WeakRef.prototype,Map,Map.prototype,Set,Set.prototype,String,String.prototype,RegExp,RegExp.prototype,Math];
      for(const start of [HTMLCanvasElement.prototype,CanvasRenderingContext2D.prototype,Object.getPrototypeOf(document)])for(let p=start;p;p=Object.getPrototypeOf(p))if(!objects.includes(p))objects.push(p);
      let accepted=0;
      for(const object of objects)for(const name of Reflect.ownKeys(object)){
        if(object===Function.prototype&&(name==='caller'||name==='arguments'))continue;
        const d=Object.getOwnPropertyDescriptor(object,name);
        for(const key of ['value','get','set'])if(typeof d[key]==='function'){
          const expected=inherited.test(Function.prototype.toString.call(d[key]));
          const state=names.map(k=>RegExp[k]);const actual=h.__nativeProbe(d[key]);
          check(JSON.stringify(state)===JSON.stringify(names.map(k=>RegExp[k])),'Native recognition preserves legacy RegExp state');
          check(actual===expected,'No wider native recognizer acceptance: '+String(name)+':'+key);if(actual)accepted++;
        }
      }
      for(const f of [function foreign(){return 1;},Object.is.bind(Object),new Proxy(Object.is,{})])check(!h.__nativeProbe(f),'Foreign/bound/Proxy functions rejected');
      check(accepted>200,'Broad actual native descriptor coverage');rows.push({label:'side-effect-free narrower native recognition',accepted,legacyValues:19,exact:true});
    }
    for(const position of [0,1,2,3])for(const mode of ['primitive','throw','proxy','palette-change','symbol','nan','infinity']){
      const A=await unit(manifest.baseline),B=await unit(manifest.candidate),a=await A('src/redraw/skyroad_tiles.js'),b=await B('src/redraw/skyroad_tiles.js'),h=await B('src/skyroad-opaque-rows.js');
      const traces=[[],[]],outputs=[],errors=[],statsBefore=h.readOpaqueRowStats();
      for(const [side,m] of [a,b].entries()){
        const args=[0,5,15,6],value=args[position];
        if(mode==='symbol')args[position]=Symbol('same input');
        else if(mode==='nan')args[position]=NaN;
        else if(mode==='infinity')args[position]=Infinity;
        else{
          const object={[Symbol.toPrimitive](hint){traces[side].push(['coerce',hint]);if(mode==='throw')throw Error('coercion sentinel');if(mode==='palette-change')m.ZONE[0].s[1]='#123456';return value;}};
          args[position]=mode==='proxy'?new Proxy(object,{get(t,k,r){traces[side].push(['get',String(k)]);return Reflect.get(t,k,r);}}):object;
        }
        try{outputs[side]=m.__massTile(...args);}catch(e){errors[side]=e.name+':'+e.message;}
      }
      const label='input:'+position+':'+mode;
      check(errors[0]===errors[1],label+' exact exception');
      check(JSON.stringify(traces[0])===JSON.stringify(traces[1]),label+' exact coercion/trap order');
      if(!errors[0])sameCanvas(outputs[0],outputs[1],label);
      const after=h.readOpaqueRowStats();
      if(mode==='palette-change'&&!errors[1])check(after.optimized===statsBefore.optimized&&after.fallback===statsBefore.fallback+1,label+' late palette fallback');
      rows.push({label,exception:errors[0]||null,traces:traces[0],stats:after,pixelsExact:!errors[0]});
      for(const c of outputs)if(c){c.width=0;c.height=0;}
    }
    for(const observer of ['createElement','proxy-context']){
      const A=await unit(manifest.baseline),B=await unit(manifest.candidate),a=await A('src/redraw/skyroad_tiles.js'),b=await B('src/redraw/skyroad_tiles.js'),h=await B('src/skyroad-opaque-rows.js');
      const target=observer==='createElement'?Document.prototype:HTMLCanvasElement.prototype,key=observer==='createElement'?'createElement':'getContext',original=Object.getOwnPropertyDescriptor(target,key),traces=[[],[]],outputs=[];
      for(const [side,m] of [a,b].entries()){
        Object.defineProperty(target,key,{...original,value:function(...args){
          traces[side].push(['call',key,args[0]]);const value=Reflect.apply(original.value,this,args);
          if(observer!=='proxy-context'||args[0]!=='2d')return value;
          return new Proxy(value,{get(t,k){traces[side].push(['get',String(k)]);const v=Reflect.get(t,k,t);return typeof v==='function'?function(...a){traces[side].push(['method',String(k)]);return Reflect.apply(v,t,a);}:v;},set(t,k,v){traces[side].push(['set',String(k),v]);return Reflect.set(t,k,v,t);}});
        }});
        try{outputs[side]=m.__massTile(0,5,15,6);}finally{Object.defineProperty(target,key,original);}
      }
      check(JSON.stringify(traces[0])===JSON.stringify(traces[1]),observer+' exact foreign calls/traps');
      check(h.readOpaqueRowStats().optimized===0&&h.readOpaqueRowStats().fallback===1,observer+' original fallback');
      sameCanvas(outputs[0],outputs[1],observer);
      rows.push({label:observer,traceLength:traces[0].length,exact:true,stats:h.readOpaqueRowStats()});
      for(const c of outputs){c.width=0;c.height=0;}
    }
    // Native returned canvas identity and mutable pixels remain owned by the original memo.
    {
      const A=await unit(manifest.baseline),B=await unit(manifest.candidate),a=await A('src/redraw/skyroad_tiles.js'),b=await B('src/redraw/skyroad_tiles.js');
      const left=a.__massTile(0,5,15,6),right=b.__massTile(0,5,15,6);
      for(const c of [left,right]){const g=c.getContext('2d');g.fillStyle='rgba(1,2,3,0.5)';g.fillRect(3,4,2,2);c.ownerMutation='held';}
      check(a.__massTile(0,5,15,6)===left&&b.__massTile(0,5,15,6)===right,'Original memo identities retained');
      sameCanvas(left,right,'public mutation');
      rows.push({label:'public returned mutation and alias',exact:true});left.width=0;left.height=0;right.width=0;right.height=0;
    }
    check(rows.length===32&&rng===0,'Complete supplementary scope and zero RNG');
    return {complete:true,contractRows:rows,rng,noOriginalMatrixRepeated:true};
  }finally{Math.random=oldRandom;for(const u of urls)URL.revokeObjectURL(u);}
}
